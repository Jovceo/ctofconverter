#!/usr/bin/env node
/**
 * readout-gate.mjs — 闸门读数（11-01 / 12-03 用），一次跑完四组数
 *
 * 为什么要有这个脚本：闸门读数是「同一套判据反复读」，手抄四次容易读错口径，
 * 也容易漏掉某一组。这个脚本把四组固定下来，输出一份可比对的快照。
 *
 * 四组读数：
 *   ① GSC sitemap：submitted / indexed / lastDownloaded（判断「Google 看到的是 65 还是旧的 82」）
 *   ② GSC URL Inspection：主读数页的 coverageState 与 lastCrawl
 *   ③ Bing GetUrlInfo：2026-10-30 IndexNow 投递的 5 条，LastCrawledDate 是否 > 投递时刻
 *   ④ Bing GetCrawlStats：InIndex 最近 14 天（判断索引是否还在被删）
 *
 * 用法（仓库根目录）：
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/readout-gate.mjs
 *   node scripts/readout-gate.mjs --archive      # 同时归档到 docs/data/
 *
 * 口径提醒（踩过）：
 *   · GSC 属性必须带尾斜杠 `https://ctofconverter.com/`，少了 URL Inspection 会 403
 *   · Bing GetCrawlStats 活接口是 PascalCase（InIndex / Code2xx / Date 为 /Date(ms)/），
 *     与 docs/data/ 里小写规范化后的归档格式不同，照搬归档字段名会拿到 undefined
 *   · Google 必须走代理；Bing 直连即可（node fetch 不读代理，正好）
 */
import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { HttpsProxyAgent } from 'https-proxy-agent';

const argv = process.argv.slice(2);
const ARCHIVE = argv.includes('--archive');
const SITE = 'https://ctofconverter.com/';
const SA_PATH = 'ctofconverter-com-analytics-4f490974795a.json';
const PROXY = process.env.HTTPS_PROXY || process.env.https_proxy || '';
const BING_CRED = process.env.BING_CRED || 'E:/工具/seo-data-pull-tool/config/credentials.json';
const INDEXNOW_SUBMITTED_AT = '2026-10-30T09:28:51+08:00';

// 主读数页 + 三旗舰 + 4 个 hub（10-28 之后我们真正在意的那批）
const INSPECT_URLS = [
  'https://ctofconverter.com/175-c-to-f',
  'https://ctofconverter.com/180-c-to-f',
  'https://ctofconverter.com/oven-to-air-fryer',
  'https://ctofconverter.com/body-temperature-chart-fever-guide',
  'https://ctofconverter.com/oven-temperature-conversion',
  'https://ctofconverter.com/fan-oven-conversion-chart',
  'https://ctofconverter.com/celsius-to-fahrenheit-chart',
  'https://ctofconverter.com/c-to-f-calculator',
  'https://ctofconverter.com/c-to-f-formula',
];

// 2026-10-30 09:28:51 经 IndexNow 定向投递的 5 条
const INDEXNOW_URLS = [
  'https://ctofconverter.com/',
  'https://ctofconverter.com/body-temperature-chart-fever-guide',
  'https://ctofconverter.com/celsius-to-fahrenheit-chart',
  'https://ctofconverter.com/fan-oven-conversion-chart',
  'https://ctofconverter.com/oven-temperature-conversion',
];

const out = { pulled_at: new Date().toISOString(), gsc_sitemap: null, gsc_inspection: [], bing_urlinfo: [], bing_crawlstats: null };
const line = (s = '') => console.log(s);

// ---------- ① + ② GSC ----------
async function runGsc() {
  const cred = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
  const authOpts = { credentials: cred, scopes: ['https://www.googleapis.com/auth/webmasters.readonly'] };
  if (PROXY) authOpts.agent = new HttpsProxyAgent(PROXY);
  const auth = new google.auth.GoogleAuth(authOpts);
  const sc = google.searchconsole({ version: 'v1', auth });

  // ① sitemap
  try {
    const r = await sc.sitemaps.list({ siteUrl: SITE });
    const sm = (r.data.sitemap || [])[0] || {};
    const c = (sm.contents || [])[0] || {};
    out.gsc_sitemap = {
      path: sm.path, lastSubmitted: sm.lastSubmitted, lastDownloaded: sm.lastDownloaded,
      isPending: sm.isPending ?? null, submitted: c.submitted ?? null, indexed: c.indexed ?? null,
      warnings: (sm.warnings || []).length, errors: (sm.errors || []).length,
    };
    line('=== ① GSC sitemap ===');
    line(`  submitted=${c.submitted}  indexed=${c.indexed}  isPending=${sm.isPending}`);
    line(`  lastDownloaded=${sm.lastDownloaded || '无'}  （lastSubmitted 会被后一次提交覆盖，不看它）`);
  } catch (e) {
    line(`  ❌ sitemap 拉取失败：${e.message}`);
  }

  // ② URL Inspection
  line('');
  line('=== ② GSC URL Inspection ===');
  for (const url of INSPECT_URLS) {
    try {
      const r = await sc.urlInspection.index.inspect({ requestBody: { inspectionUrl: url, siteUrl: SITE } });
      const i = r.data.inspectionResult.indexStatusResult || {};
      const rec = {
        url, coverageState: i.coverageState, verdict: i.verdict, lastCrawlTime: i.lastCrawlTime || null,
        robotsTxtState: i.robotsTxtState, indexingState: i.indexingState, pageFetchState: i.pageFetchState,
        canonical: (i.googleCanonical || i.userCanonical) || null, refs: (i.referringUrls || []).length,
      };
      out.gsc_inspection.push(rec);
      const p = url.replace('https://ctofconverter.com', '');
      line(`  ${p.padEnd(34)} ${String(rec.coverageState).padEnd(30)} lastCrawl=${rec.lastCrawlTime || '无'}`);
    } catch (e) {
      out.gsc_inspection.push({ url, error: e.message });
      line(`  ${url.replace('https://ctofconverter.com', '').padEnd(34)} ❌ ${e.message.slice(0, 60)}`);
    }
  }
}

// ---------- ③ + ④ Bing ----------
const convDate = (v) => {
  if (typeof v !== 'string') return v;
  const m = v.match(/\/Date\((-?\d+)\)\//);
  if (!m) return v;
  const ms = Number(m[1]);
  return ms <= 0 ? null : new Date(ms).toISOString();
};
const pick = (o, names) => { for (const n of names) if (o[n] !== undefined) return o[n]; return null; };

async function runBing(key) {
  const site = encodeURIComponent(SITE);

  line('');
  line('=== ③ Bing GetUrlInfo（10-30 09:28 投递的 5 条）===');
  line(`  判据：LastCrawledDate > ${INDEXNOW_SUBMITTED_AT} → 投递进了抓取队列`);
  const cutoff = Date.parse(INDEXNOW_SUBMITTED_AT);
  for (const url of INDEXNOW_URLS) {
    try {
      const r = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetUrlInfo?siteUrl=${site}&url=${encodeURIComponent(url)}&apikey=${key}`);
      const d = (await r.json()).d || {};
      const rec = {
        url, DocumentSize: d.DocumentSize ?? null,
        DiscoveryDate: convDate(d.DiscoveryDate), LastCrawledDate: convDate(d.LastCrawledDate),
      };
      out.bing_urlinfo.push(rec);
      const crawledAfter = rec.LastCrawledDate && Date.parse(rec.LastCrawledDate) > cutoff;
      line(`  ${(crawledAfter ? '✅ 投递后已抓' : '❌ 未重抓')} ${url.replace('https://ctofconverter.com', '').padEnd(34)} size=${String(rec.DocumentSize).padStart(6)} lastCrawl=${rec.LastCrawledDate || 'never'}`);
    } catch (e) {
      out.bing_urlinfo.push({ url, error: e.message });
      line(`  ❌ ${url} ${e.message.slice(0, 60)}`);
    }
  }

  line('');
  line('=== ④ Bing GetCrawlStats（InIndex 最近 14 天）===');
  try {
    const r = await fetch(`https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats?siteUrl=${site}&apikey=${key}`);
    const arr = ((await r.json()).d || []).map((x) => ({
      date: convDate(pick(x, ['Date', 'date'])),
      inIndex: pick(x, ['InIndex', 'inIndex']),
      crawled: pick(x, ['CrawledPages', 'crawled']),
      code2xx: pick(x, ['Code2xx', 'code2xx']),
      code301: pick(x, ['Code301', 'code301']),
      errors: pick(x, ['CrawlErrors', 'errors']),
    })).filter((x) => x.date).sort((a, b) => a.date.localeCompare(b.date));
    const tail = arr.slice(-14);
    out.bing_crawlstats = { records: arr.length, tail };
    for (const x of tail) line(`  ${x.date.slice(0, 10)}  inIndex=${String(x.inIndex).padStart(4)}  crawled=${String(x.crawled).padStart(3)}  code2xx=${x.code2xx}  code301=${x.code301}`);
    const first = tail[0], last = tail[tail.length - 1];
    line(`  → InIndex ${first.inIndex} → ${last.inIndex}（${first.inIndex === last.inIndex ? '持平' : last.inIndex > first.inIndex ? '回升' : '继续下降'}）`);
  } catch (e) {
    line(`  ❌ CrawlStats 拉取失败：${e.message}`);
  }
}

// ---------- main ----------
await runGsc();
const key = JSON.parse(fs.readFileSync(BING_CRED, 'utf8')).bing_api_key;
await runBing(key);

if (ARCHIVE) {
  const d = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const p = path.join('docs', 'data', `${d}__readout-gate.json`);
  fs.mkdirSync(path.dirname(p), { recursive: true });
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
  line('');
  line(`已归档：${p}`);
}
