/**
 * 拉 ctofconverter.com 的 GSC page+date 维度数据。
 * 零依赖：手写 RS256 JWT 换 access_token，直接打 Search Analytics API。
 *
 * 用途：为孤儿 HTML 资产池的"崩前基线 / 当期展示"提供精确数据。
 * 现有快照只有 query+page 和 query+date，缺 page+date，无法精确重建每页时间序列。
 *
 * 用法：node scripts/pull-gsc-page-date.mjs
 *       GSC_END=2026-10-20 node scripts/pull-gsc-page-date.mjs   # 手动指定结束日
 *
 * 窗口设计（2026-09-24 改，消除"窗口过期"坑）：
 *   START 固定 '2025-09-22' —— 保证永远覆盖崩前窗口 2025-10-01~2025-12-15。
 *   END   滚动 = T-2 —— 保证永远覆盖当期 4 周窗口，不必每次手改。
 *   GSC 只保留 16 个月数据，故 START 固定到 2027-01-22 之后会开始丢头部；
 *   本项目最晚判决日 2027-01-21，正好在保留期内，无需再动。
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

const SA_FILE = 'E:/工具/seo-data-pull-tool/config/google-service-account.json';
const SITE = 'https://ctofconverter.com/';

// START 固定：崩前窗口（2025-10-01）起点前 9 天，留足边界
const START = '2025-09-22';

// END 滚动：GSC final 数据滞后约 2 天，取 T-2
const isoDaysAgo = (n) => new Date(Date.now() - n * 86400000).toISOString().slice(0, 10);
const END = process.env.GSC_END || isoDaysAgo(2);

// 16 个月保留期护栏
const months = (Date.parse(END) - Date.parse(START)) / 86400000 / 30.44;
if (months > 16) {
  console.error(`❌ 窗口 ${START} ~ ${END} = ${months.toFixed(1)} 个月，超过 GSC 16 个月保留期。`);
  console.error('   请把 START 往后推（但必须仍 ≤ 2025-10-01 以覆盖崩前窗口）。');
  process.exit(1);
}

const OUT = `docs/data/${END}__gsc_page_date.json`;
const PULLED_AT = isoDaysAgo(0);

console.log(`窗口 ${START} ~ ${END}（${months.toFixed(1)} 个月）-> ${OUT}`);

const sa = JSON.parse(fs.readFileSync(SA_FILE, 'utf8'));
const b64 = (o) => Buffer.from(typeof o === 'string' ? o : JSON.stringify(o)).toString('base64url');

const now = Math.floor(Date.now() / 1000);
const signingInput = `${b64({ alg: 'RS256', typ: 'JWT' })}.${b64({
  iss: sa.client_email,
  scope: 'https://www.googleapis.com/auth/webmasters.readonly',
  aud: 'https://oauth2.googleapis.com/token',
  exp: now + 3600,
  iat: now,
})}`;
const sig = crypto.createSign('RSA-SHA256').update(signingInput).sign(sa.private_key, 'base64url');
const jwt = `${signingInput}.${sig}`;

const tr = await fetch('https://oauth2.googleapis.com/token', {
  method: 'POST',
  headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
  body: new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: jwt,
  }),
});
if (!tr.ok) {
  console.error('token error', tr.status, (await tr.text()).slice(0, 600));
  process.exit(1);
}
const { access_token } = await tr.json();

const url = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(SITE)}/searchAnalytics/query`;
const all = [];
let startRow = 0;
for (;;) {
  const r = await fetch(url, {
    method: 'POST',
    headers: { Authorization: `Bearer ${access_token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      startDate: START,
      endDate: END,
      dimensions: ['page', 'date'],
      rowLimit: 25000,
      startRow,
      dataState: 'final',
    }),
  });
  if (!r.ok) {
    console.error('api error', r.status, (await r.text()).slice(0, 600));
    process.exit(1);
  }
  const j = await r.json();
  const rows = j.rows || [];
  all.push(...rows);
  console.log(`page ${startRow / 25000 + 1}: +${rows.length} rows (total ${all.length})`);
  if (rows.length < 25000) break;
  startRow += rows.length;
}

fs.writeFileSync(
  OUT,
  JSON.stringify(
    { site: SITE, window: [START, END], dimensions: ['page', 'date'], pulled_at: PULLED_AT, total: all.length, rows: all },
    null,
    0
  )
);
console.log('saved ->', OUT, '| rows =', all.length);
