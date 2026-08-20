const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const CONCURRENCY = 10;
const TIMEOUT_MS = 15000;
const MAX_HOPS = 4;
const UA = 'Mozilla/5.0 (compatible; CtoFLinkChecker/1.0)';

const STATIC_EXT = /\.(png|jpe?g|gif|webp|ico|svg|css|js|json|xml|txt|woff2?|map|webmanifest|pdf)$/i;
const SKIP_PREFIX = /^\/(_next|api|_vercel|images)\//;

const candidates = new Set();

const routes = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../config/migrated-routes.json'), 'utf-8')
);
for (const slug of routes.htmlRoutes) {
  candidates.add(`/${slug}`);
  candidates.add(`/${slug}.html`);
}
for (const slug of routes.indexHtmlRoutes) {
  candidates.add(`/${slug}`);
  candidates.add(`/${slug}/index.html`);
}

const publicDir = path.join(__dirname, '../public');
const htmlFiles = fs.readdirSync(publicDir).filter((f) => f.endsWith('.html'));
for (const f of htmlFiles) {
  candidates.add(`/${f}`);
}

const linkRe = /(?:href|src)\s*=\s*["']([^"'#]+)["']/gi;
for (const f of htmlFiles) {
  const raw = fs.readFileSync(path.join(publicDir, f), 'utf-8');
  const content = raw.replace(/<!--[\s\S]*?-->/g, '');
  let m;
  linkRe.lastIndex = 0;
  while ((m = linkRe.exec(content)) !== null) {
    const raw = m[1].trim();
    if (!raw || /^(javascript:|mailto:|tel:|data:)/i.test(raw)) continue;
    let url;
    try {
      url = new URL(raw, SITE_URL);
    } catch {
      continue;
    }
    if (url.hostname !== 'ctofconverter.com') continue;
    let p = url.pathname;
    if (STATIC_EXT.test(p) || SKIP_PREFIX.test(p)) continue;
    if (p.length > 1 && p.endsWith('/')) p = p.slice(0, -1);
    if (p.endsWith('/index.html')) p = p.slice(0, -'/index.html'.length) || '/';
    candidates.add(p);
  }
}

async function fetchSitemapUrls() {
  try {
    const res = await fetch(`${SITE_URL}/sitemap.xml`, { headers: { 'User-Agent': UA } });
    if (!res.ok) {
      console.error(`sitemap.xml fetch failed: ${res.status}`);
      return;
    }
    const xml = await res.text();
    const locs = [...xml.matchAll(/<loc>(.*?)<\/loc>/g)].map((m) => m[1]);
    for (const loc of locs) {
      try {
        candidates.add(new URL(loc).pathname);
      } catch {
        /* skip malformed */
      }
    }
  } catch (e) {
    console.error(`sitemap.xml fetch error: ${e.message}`);
  }
}

async function check(url) {
  const chain = [];
  let current = url;
  for (let hop = 0; hop < MAX_HOPS; hop++) {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
    try {
      const res = await fetch(SITE_URL + current, {
        redirect: 'manual',
        signal: ctrl.signal,
        headers: { 'User-Agent': UA, Accept: 'text/html,*/*' },
      });
      clearTimeout(timer);
      chain.push({ url: current, status: res.status });
      if (res.status >= 300 && res.status < 400) {
        const loc = res.headers.get('location');
        if (!loc) return { url, chain, verdict: 'BAD_REDIRECT', note: 'redirect without Location' };
        const next = new URL(loc, SITE_URL);
        if (next.hostname !== 'ctofconverter.com')
          return { url, chain, verdict: 'EXTERNAL', note: loc };
        if (next.pathname === current) return { url, chain, verdict: 'LOOP', note: loc };
        current = next.pathname;
        continue;
      }
      if (res.status >= 200 && res.status < 300) return { url, chain, verdict: 'OK', note: '' };
      if (res.status >= 400 && res.status < 500) return { url, chain, verdict: 'DEAD', note: String(res.status) };
      return { url, chain, verdict: 'SERVER', note: String(res.status) };
    } catch (e) {
      clearTimeout(timer);
      return { url, chain, verdict: 'ERROR', note: e.name === 'AbortError' ? 'timeout' : e.message };
    }
  }
  return { url, chain, verdict: 'TOO_MANY_HOPS', note: '' };
}

async function run() {
  await fetchSitemapUrls();
  const urls = [...candidates].sort();
  const results = [];
  let idx = 0;
  const workers = Array.from({ length: CONCURRENCY }, async () => {
    while (idx < urls.length) {
      const u = urls[idx++];
      results.push(await check(u));
    }
  });
  await Promise.all(workers);

  const byVerdict = (v) => results.filter((r) => r.verdict === v);

  const dead = byVerdict('DEAD');
  const badRedirect = byVerdict('BAD_REDIRECT');
  const loop = byVerdict('LOOP');
  const server = byVerdict('SERVER');
  const errors = byVerdict('ERROR');
  const tooMany = byVerdict('TOO_MANY_HOPS');

  const chainStr = (r) => r.chain.map((c) => `${c.status} ${c.url}`).join(' → ');

  console.log('\n=== 死链 (4xx) ===');
  for (const r of dead) console.log(`${r.note.padEnd(4)} ${chainStr(r)}`);
  if (!dead.length) console.log('(无)');

  console.log('\n=== 坏重定向 (链尾非 2xx) ===');
  for (const r of badRedirect) console.log(`${chainStr(r)}  [${r.note}]`);
  if (!badRedirect.length) console.log('(无)');

  console.log('\n=== 重定向环 ===');
  for (const r of loop) console.log(chainStr(r));
  if (!loop.length) console.log('(无)');

  console.log('\n=== 5xx ===');
  for (const r of server) console.log(`${r.note.padEnd(4)} ${chainStr(r)}`);
  if (!server.length) console.log('(无)');

  console.log('\n=== 网络错误/超时 ===');
  for (const r of errors) console.log(`${r.url}  [${r.note}]`);
  if (!errors.length) console.log('(无)');

  const external = byVerdict('EXTERNAL');
  console.log('\n=== 汇总 ===');
  console.log(`候选 URL 总数   : ${urls.length}`);
  console.log(`200/2xx 正常    : ${byVerdict('OK').length}`);
  console.log(`301 链尾 2xx    : ${urls.length - results.length + results.length - (dead.length + badRedirect.length + loop.length + server.length + errors.length + external.length + tooMany.length)}`);
  console.log(`死链 4xx        : ${dead.length}`);
  console.log(`坏重定向        : ${badRedirect.length}`);
  console.log(`重定向环        : ${loop.length}`);
  console.log(`5xx             : ${server.length}`);
  console.log(`跳转过多        : ${tooMany.length}`);
  console.log(`外部跳转        : ${external.length}`);
  console.log(`网络错误/超时   : ${errors.length}`);
  for (const r of external) console.log(`  → ${chainStr(r)}`);
}

run().catch((e) => {
  console.error(e);
  process.exit(1);
});