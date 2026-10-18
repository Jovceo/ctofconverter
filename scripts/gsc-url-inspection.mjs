#!/usr/bin/env node
/**
 * gsc-url-inspection.mjs — GSC URL Inspection API 批量索引状态检查
 *
 * 2026-10-18 改版：HTTP 层由「手写 JWT + fetch/curl 双通道」换成 **googleapis + gaxios + HttpsProxyAgent**。
 * 原因：Node 的 `fetch`（undici）**不读 `HTTPS_PROXY` 环境变量**，沙箱/宿主机只有 HTTP 代理时会
 * `ConnectTimeoutError`（2026-10-18 实测踩到）。gaxios 可显式挂 agent，代理一定生效。
 *
 * 用法（仓库根目录）：
 *   node scripts/gsc-url-inspection.mjs
 *   node scripts/gsc-url-inspection.mjs --site https://ctofconverter.com \
 *       --sa ctofconverter-com-analytics-4f490974795a.json \
 *       --urls https://ctofconverter.com/,https://ctofconverter.com/180-c-to-f
 *   node scripts/gsc-url-inspection.mjs --dry-run          # 只校验 SA 文件与参数，不联网
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/gsc-url-inspection.mjs   # 代理也可走环境变量
 *
 * 依赖：googleapis / gaxios / https-proxy-agent（项目已装）。
 * 代理优先级：--proxy 参数 > HTTPS_PROXY > https_proxy > 无。
 * 输出：控制台摘要 + 原始 JSON 归档（--out 指定，默认 data/gsc-url-inspection-<YYYY-MM-DD>.json）。
 */
import fs from 'fs';
import path from 'path';
import { google } from 'googleapis';
import { request } from 'gaxios';
import { HttpsProxyAgent } from 'https-proxy-agent';

// ---------- 参数 ----------
const argv = process.argv.slice(2);
const opt = (name, dflt) => {
  const i = argv.indexOf('--' + name);
  return i >= 0 && argv[i + 1] ? argv[i + 1] : dflt;
};
const has = name => argv.includes('--' + name);
const SITE = opt('site', 'https://ctofconverter.com/');   // ⚠️ 必须带尾斜杠：GSC 属性是 https://ctofconverter.com/，少了斜杠 URL Inspection 会 403
const SA_PATH = opt('sa', 'ctofconverter-com-analytics-4f490974795a.json');
const OUT = opt('out', path.join('data', 'gsc-url-inspection-' + new Date().toISOString().slice(0, 10) + '.json'));
const PROXY = opt('proxy', process.env.HTTPS_PROXY || process.env.https_proxy || '');

// 默认检查清单：首页 / 175 新页 / 对照组 / 已 301 旧 URL / 零曝光 Next 页 / 一个 locale（noindex 对照）
const DEFAULT_URLS = [
  'https://ctofconverter.com/',
  'https://ctofconverter.com/175-c-to-f',
  'https://ctofconverter.com/175-c-to-f.html',
  'https://ctofconverter.com/fan-oven-conversion-chart',
  'https://ctofconverter.com/180-c-to-f',
  'https://ctofconverter.com/180-c-to-f.html',
  'https://ctofconverter.com/230-c-to-f.html',
  'https://ctofconverter.com/25-c-to-f.html',
  'https://ctofconverter.com/45-c-to-f.html',
  'https://ctofconverter.com/60-c-to-f.html',
  'https://ctofconverter.com/36-7-c-to-f.html',
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

// ---------- SA ----------
const sa = JSON.parse(fs.readFileSync(SA_PATH, 'utf8'));
if (!sa.client_email || !sa.private_key) {
  console.log('SA 文件缺少 client_email/private_key: ' + SA_PATH);
  process.exit(1);
}
console.log('SA: ' + sa.client_email);
if (PROXY) console.log('代理: ' + PROXY);

if (has('dry-run')) {
  console.log('SA 文件可读、字段完整（client_email/private_key），未联网。');
  console.log('待检查 URL 数: ' + urls.length + ' | site: ' + SITE);
  process.exit(0);
}

// ---------- HTTP：gaxios + 显式 agent（代理一定生效） ----------
const agent = PROXY ? new HttpsProxyAgent(PROXY) : undefined;
async function api(url, { method = 'GET', data, token } = {}) {
  const headers = {};
  if (token) headers.Authorization = 'Bearer ' + token;
  if (data !== undefined) headers['Content-Type'] = 'application/json';
  const res = await request({
    url, method, headers, data, agent, timeout: 30000,
    validateStatus: () => true,
    responseType: 'json',
  });
  return { status: res.status, json: res.data };
}

// ---------- access token（googleapis 自动处理 JWT 签名与刷新） ----------
// 注意：GoogleAuth.getAccessToken() 的返回结构随版本不同（字符串 / {token} 都有），
// 统一走 getClient().getAccessToken() 拿 { token }，2026-10-18 实测有效。
const auth = new google.auth.GoogleAuth({
  credentials: sa,
  scopes: ['https://www.googleapis.com/auth/webmasters'],
});
let token;
try {
  const client = await auth.getClient();
  const t = await client.getAccessToken();
  token = typeof t === 'string' ? t : t?.token;
  if (!token) throw new Error('empty token');
} catch (e) {
  console.log('TOKEN_FAIL: ' + e.message);
  process.exit(1);
}
console.log('access token OK');

// ---------- sites.list（验证 SA 在媒体资源里有权限） ----------
console.log('\n=== 账号下媒体资源（SA 可见的） ===');
try {
  const sites = await api('https://searchconsole.googleapis.com/webmasters/v3/sites', { token });
  if (sites.status === 200) {
    const entries = sites.json?.siteEntry || [];
    if (!entries.length) console.log('（空——SA 未被加进任何 GSC 媒体资源，需要去 GSC 设置里加用户）');
    for (const s of entries) console.log(` - ${s.siteUrl} | ${s.permissionLevel}`);
    if (!entries.some(s => s.siteUrl === SITE)) {
      console.log(`\n⚠ ${SITE} 不在可见列表里，URL Inspection 对它调用会 403。`);
    }
  } else {
    console.log('sites.list 失败 HTTP ' + sites.status + ': ' + JSON.stringify(sites.json).slice(0, 300));
  }
} catch (e) {
  console.log('sites.list 网络错误: ' + e.message);
}

// ---------- URL Inspection ----------
const results = [];
console.log('\n=== URL Inspection（' + urls.length + ' 个）===');
for (const u of urls) {
  const entry = { url: u };
  try {
    const res = await api('https://searchconsole.googleapis.com/v1/urlInspection/index:inspect', {
      method: 'POST', token, data: { inspectionUrl: u, siteUrl: SITE },
    });
    entry.http = res.status;
    entry.json = res.json;
    const j = res.json;
    if (!j || j.error) {
      console.log(`${u} → HTTP ${res.status} | ${JSON.stringify(j).slice(0, 160)}`);
    } else {
      const is = j.inspectionResult?.indexStatusResult || {};
      entry.summary = {
        verdict: is.verdict, coverageState: is.coverageState,
        robotsTxt: is.robotsTxtState, indexing: is.indexingState, pageFetch: is.pageFetchState,
        lastCrawl: is.lastCrawlTime, googleCanonical: is.googleCanonical,
        referringUrls: (is.referringUrls || []).length, sitemaps: is.sitemap || [],
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
