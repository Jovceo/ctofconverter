/**
 * 算孤儿页的"崩前基线"与"当期展示"，用于规格 §2.2 阶段① 判据的阈值。
 *
 * 数据来源：docs/data/2026-09-22__bing__2025-09-22-2026-09-21.json
 *  - gsc_query_page: ["page","query"]（无 date）
 *  - gsc_date_query: ["query","date"]（无 page）
 * 因两份快照都不含 page+date，用 query 做 join 重建每页时间序列。
 * 独占查询直接用其完整序列；共享查询按该页在 query_page 中的展示占比分摊。
 *
 * 用法：node scripts/orphan-baseline.mjs
 */

import fs from 'node:fs';

const SNAP = 'docs/data/2026-09-22__bing__2025-09-22-2026-09-21.json';
const PRE_START = '2025-10-01';
const PRE_END = '2025-12-15';   // 175 中旬崩塌前
const NOW_START = '2026-08-25'; // 最近 4 周
const NOW_END = '2026-09-21';

const ORPHANS = [
  '175-c-to-f', '170-c-to-f', '230-c-to-f', '105-c-to-f', '36-7-c-to-f', '44-c-to-f',
  '210-c-to-f', '42-c-to-f', '120-c-to-f', '38-4-c-to-f', '48-c-to-f', '150-c-to-f',
  '46-c-to-f', '220-c-to-f', '76-c-to-f', '60-c-to-f', '38-1-c-to-f', '36-9-c-to-f',
  '38-5-c-to-f', '45-c-to-f', '250-c-to-f', '73-c-to-f', '43-c-to-f', '37-6-c-to-f',
  '38-2-c-to-f', '190-c-to-f', '36-2-c-to-f', '37-1-c-to-f', '90-c-to-f', '74-c-to-f',
  '36-8-c-to-f', '37-3-c-to-f', '37-7-c-to-f', '37-4-c-to-f',
];
const isBodyTemp = (slug) => /^\d+-\d+-c-to-f$/.test(slug);

const j = JSON.parse(fs.readFileSync(SNAP, 'utf8'));
const qp = j.data.gsc_query_page.data;
const dq = j.data.gsc_date_query.data;

// query -> Map(page -> impressions)
const q2p = new Map();
for (const r of qp) {
  if (!q2p.has(r.query)) q2p.set(r.query, new Map());
  q2p.get(r.query).set(r.page, r.impressions);
}

// query -> Map(date -> impressions)
const q2d = new Map();
for (const r of dq) {
  if (!q2d.has(r.query)) q2d.set(r.query, new Map());
  q2d.get(r.query).set(r.date, r.impressions);
}

const inRange = (d, a, b) => d >= a && d <= b;

function buildSeries(pageUrl) {
  const own = qp.filter((r) => r.page === pageUrl);
  const dates = new Map(); // date -> impressions (分摊后)
  let covered = 0;
  let total = 0;
  for (const row of own) {
    total += row.impressions;
    const peers = q2p.get(row.query);
    const peerSum = [...peers.values()].reduce((a, b) => a + b, 0);
    const share = peerSum > 0 ? row.impressions / peerSum : 1;
    const series = q2d.get(row.query);
    if (!series) continue;
    covered += row.impressions * share;
    for (const [d, im] of series) {
      dates.set(d, (dates.get(d) || 0) + im * share);
    }
  }
  return { dates, coverage: total ? covered / total : 0, total };
}

function sumRange(dates, a, b) {
  let s = 0;
  for (const [d, im] of dates) if (inRange(d, a, b)) s += im;
  return s;
}

const PRE_DAYS = 76; // 2025-10-01 ~ 2025-12-15
const NOW_DAYS = 28; // 2026-08-25 ~ 2026-09-21

const rows = [];
for (const slug of ORPHANS) {
  const url = `https://ctofconverter.com/${slug}.html`;
  const { dates, coverage, total } = buildSeries(url);
  const pre = sumRange(dates, PRE_START, PRE_END);
  const now = sumRange(dates, NOW_START, NOW_END);
  rows.push({
    slug,
    kind: isBodyTemp(slug) ? '体温' : '整数',
    total,
    preWeekly: pre / (PRE_DAYS / 7),
    now4w: now,
    coverage,
  });
}

rows.sort((a, b) => b.preWeekly - a.preWeekly);

const fmt = (n, d = 1) => Number(n).toFixed(d).padStart(8);
console.log('页                    类   12月总展示  崩前周均   当期4周  覆盖率');
for (const r of rows) {
  console.log(
    r.slug.padEnd(20),
    r.kind.padEnd(4),
    String(r.total).padStart(9),
    fmt(r.preWeekly),
    String(Math.round(r.now4w)).padStart(8),
    (r.coverage * 100).toFixed(0).padStart(6) + '%'
  );
}

const sumPre = rows.reduce((s, r) => s + r.preWeekly, 0);
const sumNow = rows.reduce((s, r) => s + r.now4w, 0);
console.log('\n--- 池级 ---');
console.log('崩前池周均展示合计 =', sumPre.toFixed(1));
console.log('当期池 4 周展示合计 =', sumNow.toFixed(1));
console.log('当期 / 崩前周均 =', sumPre > 0 ? ((sumNow / 4 / sumPre) * 100).toFixed(2) + '%' : 'n/a', '（25% 门槛）');

const body = rows.filter((r) => r.kind === '体温');
const intg = rows.filter((r) => r.kind === '整数');
console.log('\n体温类：崩前周均合计 =', body.reduce((s, r) => s + r.preWeekly, 0).toFixed(1), '| 当期 4 周 =', body.reduce((s, r) => s + r.now4w, 0).toFixed(1));
console.log('整数类：崩前周均合计 =', intg.reduce((s, r) => s + r.preWeekly, 0).toFixed(1), '| 当期 4 周 =', intg.reduce((s, r) => s + r.now4w, 0).toFixed(1));

const lowCov = rows.filter((r) => r.coverage < 0.8);
if (lowCov.length) {
  console.log('\n⚠️ 覆盖率 <80% 的页（基线偏低估）：', lowCov.map((r) => `${r.slug}(${(r.coverage * 100).toFixed(0)}%)`).join(', '));
}
