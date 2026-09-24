/**
 * 拉 GSC query+page（崩前窗），筛出「孤儿页独占」长尾词 → docs/data/target-queries.json
 *
 * 用途：规格 §8 目标查询清单（5–10 条）。当期展示真值=0，故从崩前独占查询选。
 * 独占 = 该 query 的页面集合 ⊆ 34 个孤儿 URL（且至少 1 页在集合内）。
 * 禁泛化词：长度 < 12 字符或匹配 /^(c to f|celsius to fahrenheit|...)$/ 的头部词直接丢弃。
 *
 * 用法：node scripts/pull-target-queries.mjs
 * 依赖：同 pull-gsc-page-date.mjs（同一 service account）
 */

import fs from 'node:fs';
import crypto from 'node:crypto';

const SA_FILE = 'E:/工具/seo-data-pull-tool/config/google-service-account.json';
const SITE = 'https://ctofconverter.com/';
const START = '2025-10-01';
const END = '2025-12-15';
const OUT = 'docs/data/target-queries.json';

// 34 孤儿 URL（与 baseline-upgrade / orphan-groups 同源）
const verified = JSON.parse(fs.readFileSync('docs/data/precrash-baseline-verified.json', 'utf8'));
const orphanSlugs = new Set(verified.rows.map((r) => r.slug));
const orphanPaths = new Set();
for (const slug of orphanSlugs) {
  orphanPaths.add(`/${slug}.html`);
  orphanPaths.add(`/${slug}`);
}
// 档① 已知的非孤儿高展示页也加入 page 侧白名单对照用

// 泛化词黑名单（头部品牌/品类词，不可做目标查询）
const GENERIC = new Set([
  'c to f', 'celsius to fahrenheit', 'celsius to fahrenheit converter',
  'c to f converter', 'temperature converter', 'celsius fahrenheit',
  'f to c', 'fahrenheit to celsius', 'convert celsius to fahrenheit',
  'celsius into fahrenheit', 'c to f chart', 'temperature conversion',
  'celsius to f', 'c to f conversion', 'oven temperature conversion',
]);

const isGeneric = (q) => {
  const s = q.trim().toLowerCase();
  if (GENERIC.has(s)) return true;
  if (s.length < 12) return true;
  // 纯数字+单位的超短查询
  if (/^\d+\s*[cf]\s*(to|in|into)\s*[cf]$/.test(s)) return true;
  return false;
};

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
      dimensions: ['query', 'page'],
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

// 聚合 query → pages + impressions
const byQuery = new Map();
for (const row of all) {
  const q = (row.keys?.[0] || '').toLowerCase();
  const p = row.keys?.[1] || '';
  if (!q) continue;
  if (!byQuery.has(q)) byQuery.set(q, { query: q, pages: new Set(), impressions: 0, clicks: 0 });
  const e = byQuery.get(q);
  e.pages.add(p);
  e.impressions += row.impressions || 0;
  e.clicks += row.clicks || 0;
}

const isOrphanPath = (p) => {
  try {
    const u = new URL(p);
    const path = u.pathname.replace(/\.html$/, '');
    // /175-c-to-f.html or /175-c-to-f
    const m = path.match(/^\/([0-9]+(?:-[0-9]+)?-c-to-f)$/);
    if (m && orphanSlugs.has(m[1])) return true;
    return false;
  } catch {
    return false;
  }
};

const exclusive = [];
for (const e of byQuery.values()) {
  if (isGeneric(e.query)) continue;
  const pages = [...e.pages];
  if (pages.length === 0) continue;
  const onOrphan = pages.filter(isOrphanPath);
  if (onOrphan.length === 0) continue;
  // 独占：所有页面都是孤儿
  if (onOrphan.length === pages.length) {
    exclusive.push({
      query: e.query,
      impressions: e.impressions,
      clicks: e.clicks,
      pages: pages.map((p) => {
        try { return new URL(p).pathname; } catch { return p; }
      }),
      n_pages: pages.length,
    });
  }
}

exclusive.sort((a, b) => b.impressions - a.impressions);
const top = exclusive.slice(0, 15);

const out = {
  generated_at: new Date().toISOString(),
  caliber: 'direct',
  source: 'GSC query+page, dataState=final',
  window: [START, END],
  method: 'query 独占（page 集合 ⊆ 34 孤儿）+ 非泛化词，按崩前展示降序',
  n_query_total: byQuery.size,
  n_exclusive_non_generic: exclusive.length,
  target_queries: top,
  note: '当期窗展示真值=0（C8），故目标查询从崩前独占查询选。读数日 2026-10-23 复查这些词是否回来。',
};
fs.writeFileSync(OUT, JSON.stringify(out, null, 2), 'utf8');
console.log(`\nquery 总数 ${byQuery.size} | 孤儿独占非泛化 ${exclusive.length}`);
console.log('Top 15:');
for (const t of top) {
  console.log(`  ${String(t.impressions).padStart(6)} imp  ${t.query}  (${t.n_pages} pages)`);
}
console.log(`\nsaved -> ${OUT}`);
