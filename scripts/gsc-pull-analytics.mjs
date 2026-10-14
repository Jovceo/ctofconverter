/**
 * GSC Search Analytics 实拉脚本（date / page / query / page×date 四维）
 *
 * 用途：复现 `docs/SEO诊断与优化方案-WorkBuddy-2026-10-13.md` 的 Google 侧全部数字。
 * 口径纪律（勿改）：月度表用 date 维；页面数 / 位置 / 0.5 判据用 page 维；
 *   查询簇用 query 维。**不可用三维 query×page×date 当总量**——三维丢匿名查询，
 *   整体偏低约 11%，长尾页差 24–42%。
 *
 * 用法：
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/gsc-pull-analytics.mjs
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/gsc-pull-analytics.mjs 2025-10-13 2026-10-12
 *
 * 依赖：googleapis（SA 凭据 ctofconverter-com-analytics-4f490974795a.json，scope webmasters.readonly）
 * 注意：环境里默认的 29384 代理不通 Google，必须显式覆盖成 20890。
 * 输出：docs/data/<YYYYMMDD>__gsc_live_api__{date,page,query,page_date}.json
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEY_PATH = path.join(ROOT, 'ctofconverter-com-analytics-4f490974795a.json');
const OUT_DIR = path.join(ROOT, 'docs', 'data');
const SITE = 'https://ctofconverter.com/';

const S = process.argv[2] || '2025-10-13';
const E = process.argv[3] || '2026-10-12';

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync(KEY_PATH, 'utf8')),
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth });

async function pull(dimensions, { rowLimit = 25000, type = 'web' } = {}) {
  const res = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: { startDate: S, endDate: E, dimensions, rowLimit, type },
  });
  return (res.data.rows || []).map(r => ({
    k: r.keys, i: r.impressions || 0, c: r.clicks || 0, p: r.position || 0,
  }));
}

const sum = rows => rows.reduce((a, r) => ({ i: a.i + r.i, c: a.c + r.c }), { i: 0, c: 0 });

const byDate = await pull(['date']);
const byPage = await pull(['page']);
const byQuery = await pull(['query']);
const byPageDate = await pull(['page', 'date']);

const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
const out = { window: { start: S, end: E }, fetched_at: new Date().toISOString() };
for (const [name, rows] of [['date', byDate], ['page', byPage], ['query', byQuery], ['page_date', byPageDate]]) {
  fs.writeFileSync(path.join(OUT_DIR, `${stamp}__gsc_live_api__${name}.json`), JSON.stringify(rows));
}

// ---- 摘要 ----
console.log(`窗口 ${S} → ${E}`);
console.log('date 维  :', JSON.stringify(sum(byDate)), byDate.length, '天');
console.log('page 维  :', JSON.stringify(sum(byPage)), byPage.length, '页');
console.log('query 维 :', JSON.stringify(sum(byQuery)), byQuery.length, '查询');
console.log('page×date:', byPageDate.length, '行');

const mon = {};
for (const r of byDate) {
  const m = r.k[0].slice(0, 7);
  const a = mon[m] || (mon[m] = { i: 0, c: 0 });
  a.i += r.i; a.c += r.c;
}
console.log('\n月度表（date 维）:');
for (const m of Object.keys(mon).sort()) console.log(' ', m, String(mon[m].i).padStart(7), mon[m].c);

// 位置分布：page×date 维按曝光（方案 53.4% 即此口径）
const b = { '1-3': 0, '4-10': 0, '11-20': 0, '21-50': 0, '51+': 0 };
let t = 0;
for (const r of byPageDate) {
  t += r.i;
  if (r.p <= 3) b['1-3'] += r.i; else if (r.p <= 10) b['4-10'] += r.i;
  else if (r.p <= 20) b['11-20'] += r.i; else if (r.p <= 50) b['21-50'] += r.i; else b['51+'] += r.i;
}
console.log('\n位置分布（page×date 维按曝光）:');
for (const k of Object.keys(b)) console.log(' ', k.padEnd(6), String(b[k]).padStart(7), (b[k] / t * 100).toFixed(1) + '%');

console.log(`\n已写出 → ${path.relative(ROOT, OUT_DIR)}\\${stamp}__gsc_live_api__*.json`);
