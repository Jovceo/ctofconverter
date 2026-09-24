#!/usr/bin/env node
/**
 * verify-bing-monthly.mjs — Bing TrafficStats 日度行按月求和（可复算工具）
 *
 * 用途：核验复盘 / 事实基线里引用的 Bing 月度点击。
 *
 * 背景（2026-09-24 定案）：Bing 存在两个口径 ——
 *   ① API `TrafficStats` 的**日度行按月求和**（本脚本）；
 *   ② 2026-08-19 报告用的后台月度报表。
 * 两者是**系统性差**（≈2.6 倍，1,109 / 419），非单月偶发。
 * → **引用 Bing 月度必须同源**，两源不得混用（事实基线 C17）。
 *
 * 用法：
 *   node scripts/verify-bing-monthly.mjs [path-to-bing-json]
 *   默认 docs/data/2026-09-22__bing__2025-09-22-2026-09-21.json
 *
 * 输出：按月 clicks / impressions / days；days < 28 标注 PARTIAL。
 *
 * 已核结论（2026-09-24，用于复盘 section ②）：
 *   2025-10 = 867 / 2025-11 = 993 / 2025-12 = 1109   （整月）
 *   2025-09 = 194  ← **窗口内 9 天**（起点 2025-09-22），不可当整月用
 *   2026-01 = 0    ← 展示仅 7；8-19 报告记 53，两源冲突
 */

import fs from 'fs';

const DEFAULT = 'docs/data/2026-09-22__bing__2025-09-22-2026-09-21.json';
const file = process.argv[2] || DEFAULT;

const j = JSON.parse(fs.readFileSync(file, 'utf8'));
const ts = j.data?.bing?.data?.TrafficStats;

if (!Array.isArray(ts)) {
  console.error('TrafficStats not found (or not an array). Check the JSON shape.');
  process.exit(1);
}

const byMonth = {};
for (const r of ts) {
  const m = r.Date.slice(0, 7);
  byMonth[m] = byMonth[m] || { clicks: 0, imps: 0, days: 0, first: r.Date, last: r.Date };
  byMonth[m].clicks += r.Clicks;
  byMonth[m].imps += r.Impressions;
  byMonth[m].days++;
  if (r.Date < byMonth[m].first) byMonth[m].first = r.Date;
  if (r.Date > byMonth[m].last) byMonth[m].last = r.Date;
}

console.log(`file    : ${file}`);
console.log(`window  : ${j.window?.[0]} ~ ${j.window?.[1]}`);
console.log(`rows    : ${ts.length}\n`);
console.log('month     clicks     imps  days  range');
for (const m of Object.keys(byMonth).sort()) {
  const v = byMonth[m];
  const flag = v.days < 28 ? '  <-- PARTIAL (not a full month)' : '';
  console.log(
    `${m}  ${String(v.clicks).padStart(6)}  ${String(v.imps).padStart(8)}  ${String(v.days).padStart(4)}  ${v.first}~${v.last}${flag}`
  );
}
