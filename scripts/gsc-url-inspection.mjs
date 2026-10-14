#!/usr/bin/env node
/**
 * gsc-url-inspection.mjs — GSC URL Inspection API 批量索引状态检查
 *
 * 背景：沙箱网络到 Google 全系域名不通（oauth2.googleapis.com 超时），
 * 本脚本设计为在宿主机（有代理/正常网络）上运行；SA 私钥只在内存中使用，不打印。
 *
 * 用法（宿主机、仓库根目录）：
 *   node scripts/gsc-url-inspection.mjs
 *   node scripts/gsc-url-inspection.mjs --site https://ctofconverter.com \
 *       --sa ctofconverter-com-analytics-4f490974795a.json \
 *       --urls https://ctofconverter.com/,https://ctofconverter.com/180-c-to-f
 *   node scripts/gsc-url-inspection.mjs --dry-run   # 只验签不联网，用于确认 SA 文件可用
 *
 * 依赖：Node >= 18（用内置 crypto/fetch，无第三方包）。
 * 代理：Node 的 fetch 不读 http_proxy 环境变量。宿主机若只有 HTTP 代理可用，加 --proxy http://127.0.0.1:20890
 *       （会改用 curl 子进程发请求；curl 路径自动探测，找不到可用 CURL 环境变量指定）。
 * 输出：控制台摘要 + 原始 JSON 归档（--out 指定，默认 data/gsc-url-inspection-<ts>.json）。
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { execFileSync } from 'child_process';

// ---------- 参数 ----------
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const has = name => argv.includes('--' + name);
const SITE = opt('site', 'https://ctofconverter.com');
const SA_PATH = opt('sa', 'ctofconverter-com-analytics-4f490974795a.json');
const OUT = opt('out', path.join('data', 'gsc-url-inspection-' + new Date().toISOString().slice(0, 10) + '.json'));

// 默认检查清单：首页 / 34 孤儿代表 / 已 301 旧 URL / 12 个零曝光 Next 页代表 / 一个 locale（noindex 对照）
const DEFAULT_URLS = [
  'https://ctofconverter.com/',
  'https://ctofconverter.com/175-c-to-f.html',
  'https://ctofconverter.com/180-c-to-f.html',
  'https://ctofconverter.com/230-c-to-f.html',
  'https://ctofconverter.com/25-c-to-f.html',
  'https://ctofconverter.com/74-c-to-f.html',
  'https://ctofconverter.com/90-c-to-f.html',
  'https://ctofconverter.com/45-c-to-f.html',
  'https://ctofconverter.com/60-c-to-f.html',
  'https://ctofconverter.com/36-7-c-to-f.html',
  'https://ctofconverter.com/180-c-to-f',
  'https://ctofconverter.com/fan-oven-conversion-chart',
  'https://ctofconverter.com/oven-to-air-fryer',
  'https://ctofconverter.com/body-temperature-chart-fever-guide',
  'https://ctofconverter.com/36-4-c-to-f',
  'https://ctofconverter.com/celsius-to-fahrenheit-chart',
  'https://ctofconverter.com/c-to-f-formula',
  'https://ctofconverter.com/375-f-to-c',
  'https://ctofconverter.com/93-f-to-c',
  'https://ctofconverter.com/temperature-conversion-challenge',
  'https://ctofconverter.com/oven-temperature-conversion',
  'https://ctofconverter.com/de/fahrenheit-to-celsius'
];
const urls = has('urls') ? opt('urls', '').split(',').map(s => s.trim()).filter(Boolean) : DEFAULT_URLS;

// ---------- HTTP 层：有 --proxy 走 curl（含全路径探测），否则用 fetch ----------
const PROXY = opt('proxy', '');
function findCurl() {
  if (process.env.CURL) return process.env.CURL;
  const cands = ['C:/Windows/System32/curl.exe', '/usr/bin/curl', '/usr/local/bin/curl', '/opt/homebrew/bin/curl', '/mingw64/bin/curl'];
  for (const c of cands) { try { fs.accessSync(c); return c; } catch {} }
  return 'curl';
}
async function http(url, { method = 'GET', headers = {}, body } = {}) {
  if (PROXY) {
    const args = ['-s', '-x', PROXY, '--max-time', '30', '-X', method];
    for (const [k, v] of Object.entries(headers)) args.push('-H', k + ': ' + v);
    if (body) args.push('--data-binary', body);
    args.push(url);
    try {
      return { status: 200, text: execFileSync(findCurl(), args, { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }) };
    } catch (e) {
      // 已知坑：某些沙箱环境里 Node spawnSync 调 curl.exe 报 EBUSY（bash 里调 curl 正常）。
      // 解法：在宿主机直接跑本脚本；或退出 Node、用 bash + curl 手工发同样的请求。
      console.log('curl 子进程失败（' + e.code + '）。若是 EBUSY：这是沙箱环境 Node spawn 的限制，请到宿主机运行，或用 bash 执行等价 curl 请求。');
      process.exit(2);
    }
  }
  const res = await fetch(url, { method, headers, body });
  return { status: res.status, text: await res.text() };
}

// ---------- SA + JWT ----------
const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!sa.client_email || !sa.private_key) {
  console.log('SA 文件缺少 client_email/private_key: ' + SA_PATH);
  process.exit(1);
}
const b64url = buf => Buffer.from(buf).toString('base64url');
const now = Math.floor(Date.now() / 1000);
const header = { alg: 'RS256', typ: 'JWT' };
const claims = {
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters',
  aud: sa.token_uri || 'https://oauth2.googleapis.com/token',
  iat: now, exp: now + 3600
};
const unsigned = b64url(JSON.stringify(header)) + '.' + b64url(JSON.stringify(claims));
const signer = crypto.createSign('RSA-SHA256');
signer.update(unsigned); signer.end();
const jwt = unsigned + '.' + signer.sign(sa.private_key, 'base64url');
console.log('SA: ' + sa.client_email);

if (has('dry-run')) {
  console.log('JWT 签名成功（claims.iss=' + claims.iss.slice(0, 12) + '…），未联网。');
  console.log('待检查 URL 数: ' + urls.length + ' | site: ' + SITE);
  process.exit(0);
}

// ---------- access token ----------
const tokenRes = await http(claims.aud, {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({ grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer', assertion: jwt }).toString()
});
let tokenJson;
try { tokenJson = JSON.parse(tokenRes.text); } catch {}
if (tokenRes.status !== 200 || !tokenJson || !tokenJson.access_token) {
  console.log('TOKEN_FAIL HTTP ' + tokenRes.status + ': ' + (tokenRes.text || '').slice(0, 300));
  process.exit(1);
}
console.log('access token OK');
const AUTH = { Authorization: 'Bearer ' + tokenJson.access_token };

// ---------- sites.list（验证 SA 在媒体资源里有权限；注意路径是 /webmasters/v3/sites） ----------
const sitesRes = await http('https://searchconsole.googleapis.com/webmasters/v3/sites', { headers: AUTH });
let sitesJson = null;
try { sitesJson = JSON.parse(sitesRes.text); } catch {}
console.log('\n=== 账号下媒体资源（SA 可见的） ===');
if (sitesRes.status === 200 && sitesJson) {
  const entries = sitesJson.siteEntry || [];
  if (!entries.length) console.log('（空——SA 未被加进任何 GSC 媒体资源，需要去 GSC 设置里加用户）');
  for (const s of entries) console.log(` - ${s.siteUrl} | ${s.permissionLevel}`);
  if (!entries.some(s => s.siteUrl === SITE)) {
    console.log(`\n⚠ ${SITE} 不在可见列表里，URL Inspection 对它调用会 403。`);
  }
} else {
  console.log('sites.list 失败 HTTP ' + sitesRes.status + ': ' + (sitesRes.text || '').slice(0, 300));
}

// ---------- URL Inspection ----------
const results = [];
console.log('\n=== URL Inspection（' + urls.length + ' 个）===');
for (const u of urls) {
  let entry = { url: u };
  try {
    const res = await http('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST',
      headers: { ...AUTH, 'Content-Type': 'application/json' },
      body: JSON.stringify({ inspectionUrl: u, siteUrl: SITE })
    });
    let json = null;
    try { json = JSON.parse(res.text); } catch {}
    entry.http = res.status; entry.json = json;
    if (!json || json.error) {
      console.log(`${u} → HTTP ${res.status} | ${(res.text || '').slice(0, 160)}`);
    } else {
      const r = json.inspectionResult || {};
      const is = r.indexStatusResult || {};
      entry.summary = {
        verdict: is.verdict, coverageState: is.coverageState,
        robotsTxt: is.robotsTxtState, indexing: is.indexingState, pageFetch: is.pageFetchState,
        lastCrawl: is.lastCrawlTime, googleCanonical: is.googleCanonical,
        referringUrls: (is.referringUrls || []).length, sitemaps: is.sitemap || []
      };
      console.log(`${u}\n  verdict=${is.verdict} coverage="${is.coverageState}" robots=${is.robotsTxtState} indexing=${is.indexingState} fetch=${is.pageFetchState}\n  lastCrawl=${is.lastCrawlTime || '-'} canonical=${is.googleCanonical || '-'} refs=${(is.referringUrls || []).length} sitemaps=${(is.sitemap || []).join(',') || '-'}`);
    }
  } catch (e) {
    entry.error = e.message;
    console.log(`${u} → 网络错误: ${e.message}`);
  }
  results.push(entry);
}
fs.mkdirSync(path.dirname(OUT), { recursive: true });
fs.writeFileSync(OUT, JSON.stringify(results, null, 1));
console.log('\n原始结果归档: ' + OUT);
