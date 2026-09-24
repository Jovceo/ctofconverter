/**
 * 基线升级四步（§10.3，起表前必做）
 *
 * 数据源：docs/data/*__gsc_page_date.json（page+date 直读，无 join、无分摊）
 * ① 崩前切片重算 → 升 derived-verified
 * ② 无条件重算阈值敏感集
 * ③ 复核 Top10 全名单（恢复完整分母 N）
 * ④ 偏差 >10% 的阈值数值列出走复议
 *
 * 运行：node scripts/baseline-upgrade.mjs
 * 输出：docs/data/precrash-baseline-verified.json + 终端报告
 *
 * ⚠️ 操作惯例（2026-09-24，双方约定，不进规格正文）：
 *   每次重跑覆盖输出前，先把旧 JSON 复制为同目录 *.prev.json 再写新值
 *   —— docs/data/ 不进 git，无版本历史；不落 prev 则 +18.8% 这类偏差无法复算（§7.1）。
 *   同理适用于 orphan-groups.json / 任何会被原地覆盖的判据输入。
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const DATA_DIR = path.join(ROOT, 'docs/data');

const ORPHANS = [
  '175-c-to-f', '170-c-to-f', '230-c-to-f', '105-c-to-f', '36-7-c-to-f', '44-c-to-f',
  '210-c-to-f', '42-c-to-f', '120-c-to-f', '38-4-c-to-f', '48-c-to-f', '150-c-to-f',
  '46-c-to-f', '220-c-to-f', '76-c-to-f', '60-c-to-f', '38-1-c-to-f', '36-9-c-to-f',
  '38-5-c-to-f', '45-c-to-f', '250-c-to-f', '73-c-to-f', '43-c-to-f', '37-6-c-to-f',
  '38-2-c-to-f', '190-c-to-f', '36-2-c-to-f', '37-1-c-to-f', '90-c-to-f', '74-c-to-f',
  '36-8-c-to-f', '37-3-c-to-f', '37-7-c-to-f', '37-4-c-to-f',
];
const PRE_START = '2025-10-01';
const PRE_END = '2025-12-15';
const PRE_DAYS = 76;
const NOW_START = '2026-08-25';
const NOW_END = '2026-09-21';
const REVIEW_PCT = 10;

const isBodyTemp = (slug) => /^\d+-\d+-c-to-f$/.test(slug);
const inRange = (d, a, b) => d >= a && d <= b;
const isOrphanUrl = (p) => ORPHANS.some((s) => p === `https://ctofconverter.com/${s}.html`);

// --- 找最新 page+date 快照 ---
const snapFiles = fs.readdirSync(DATA_DIR).filter((f) => f.includes('__gsc_page_date') && f.endsWith('.json'));
if (snapFiles.length === 0) {
  console.error('找不到 __gsc_page_date 快照，先跑 pull-gsc-page-date.mjs');
  process.exit(1);
}
snapFiles.sort();
const snapPath = path.join(DATA_DIR, snapFiles[snapFiles.length - 1]);
const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));
console.log('快照:', path.basename(snapPath));
console.log('窗口:', snap.window.join(' ~ '), '| 行数:', (snap.rows || []).length, '| pulled_at:', snap.pulled_at);

if (snap.dimensions?.join('+') !== 'page+date' && snap.dimensions?.join('+') !== 'date+page') {
  console.error('维度不是 page+date:', snap.dimensions);
  process.exit(1);
}
if (!inRange(PRE_START, snap.window[0], snap.window[1]) || !inRange(PRE_END, snap.window[0], snap.window[1])) {
  console.error('快照窗口未覆盖崩前窗口', PRE_START, '~', PRE_END);
  process.exit(1);
}

// --- ① 崩前切片直读 ---
const bySlug = new Map();
for (const slug of ORPHANS) bySlug.set(slug, { pre: 0, now: 0, y12: 0 });
let orphanRows = 0;
let siteTotal = 0;
let sitePre = 0;
let siteNow = 0;

for (const r of snap.rows) {
  const keys = r.keys || [];
  const page = keys.find((k) => typeof k === 'string' && k.startsWith('http')) || r.page;
  const date = keys.find((k) => typeof k === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(k)) || r.date;
  const im = r.impressions || 0;
  siteTotal += im;
  if (inRange(date, PRE_START, PRE_END)) sitePre += im;
  if (inRange(date, NOW_START, NOW_END)) siteNow += im;
  if (!page || !isOrphanUrl(page)) continue;
  orphanRows++;
  const slug = page.replace(/^https:\/\/ctofconverter\.com\//, '').replace(/\.html$/, '');
  const s = bySlug.get(slug);
  if (!s) continue;
  s.y12 += im;
  if (inRange(date, PRE_START, PRE_END)) s.pre += im;
  if (inRange(date, NOW_START, NOW_END)) s.now += im;
}

// 旧 provisional（orphan-groups 崩前周均）
const oldGroups = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'orphan-groups.json'), 'utf8'));
const oldW = {};
for (const g of ['A', 'B', 'C']) for (const m of oldGroups.members[g]) oldW[m.slug] = m.pre_weekly;

const rows = ORPHANS.map((slug) => {
  const s = bySlug.get(slug);
  const preWeekly = s.pre / (PRE_DAYS / 7);
  const old = oldW[slug] ?? 0;
  const devPct = old > 0 ? ((preWeekly - old) / old) * 100 : preWeekly > 0 ? Infinity : 0;
  return {
    slug,
    kind: isBodyTemp(slug) ? '体温' : '整数',
    preDirect: s.pre,
    preWeekly: +preWeekly.toFixed(2),
    oldProvisional: old,
    devPct: Number.isFinite(devPct) ? +devPct.toFixed(1) : null,
    threshold: +Math.max(preWeekly * 0.01, 1).toFixed(3),
    now4w: s.now,
    y12m: s.y12,
    caliber: 'derived-verified',
  };
}).sort((a, b) => b.preWeekly - a.preWeekly);

rows.forEach((r, i) => (r.rank = i + 1));

// --- ② 敏感集无条件重算 ---
const sensitive = rows.filter((r) => r.preWeekly > 100);

// --- ③ Top10 完整分母 ---
const topN = 10;
const top = rows.slice(0, topN);
const poolWeekly = rows.reduce((s, r) => s + r.preWeekly, 0);
const topWeekly = top.reduce((s, r) => s + r.preWeekly, 0);
const coveragePct = +((topWeekly / poolWeekly) * 100).toFixed(1);

// --- ④ >10% 复议清单 ---
const review = rows.filter((r) => r.devPct !== null && Math.abs(r.devPct) > REVIEW_PCT);

// 算术不可能性：崩前窗 76d 展示不得 > y12m
const impossible = rows.filter((r) => r.preDirect > r.y12m);

// --- 报告 ---
console.log('\n========== 基线升级四步 ==========');
console.log(`孤儿行级: ${orphanRows} 行 | 站点全年: ${siteTotal} | 站点崩前: ${sitePre} | 站点当期: ${siteNow}`);

const sumOld = rows.reduce((s, r) => s + r.oldProvisional, 0);
console.log(`\n① 崩前切片（derived-verified）`);
console.log(`   池周均 新=${poolWeekly.toFixed(1)} 旧=${sumOld.toFixed(1)} 偏差=${(((poolWeekly - sumOld) / sumOld) * 100).toFixed(1)}%`);
console.log(`   崩前窗孤儿合计=${(poolWeekly * (PRE_DAYS / 7)).toFixed(0)} 占站点崩前=${(((poolWeekly * (PRE_DAYS / 7)) / sitePre) * 100).toFixed(1)}%`);
console.log(`   当期窗孤儿合计=${rows.reduce((s, r) => s + r.now4w, 0)}（应为 0，C8 复核）`);

console.log(`\n② 敏感集（无条件重算，preWeekly > 100）n=${sensitive.length}`);
for (const r of sensitive) console.log(`   ${r.slug.padEnd(14)} 周均=${String(r.preWeekly).padStart(9)} 阈值=${r.threshold}`);

console.log(`\n③ Top${topN} 完整分母 N=${top.length} 覆盖=${coveragePct}%`);
top.forEach((r, i) => {
  console.log(`   ${String(i + 1).padStart(2)}. ${r.slug.padEnd(14)} 周均=${String(r.preWeekly).padStart(9)} 阈值=${r.threshold} 旧周均=${r.oldProvisional} dev=${r.devPct}%`);
});

console.log(`\n④ 阈值偏差 >${REVIEW_PCT}% 需复议: ${review.length}/${rows.length}`);
for (const r of review) {
  console.log(`   ${r.slug.padEnd(14)} 新=${r.preWeekly} 旧=${r.oldProvisional} dev=${r.devPct}% 旧 thr→新 thr`);
}

if (impossible.length) {
  console.log(`\n⚠️ 崩前 > 全年（算术不可能）: ${impossible.map((r) => r.slug).join(', ')}`);
} else {
  console.log(`\n✅ 算术不可能性检查通过（崩前 ≤ 全年，0 违规）`);
}

// 12月总量对照（档① direct 对照）
const y12sum = rows.reduce((s, r) => s + r.y12m, 0);
console.log(`\n对照 · 孤儿12月总量 page+date=${y12sum} vs query_page 档①=44550 差=${y12sum - 44550}`);

const out = {
  generated_at: new Date().toISOString(),
  source: path.basename(snapPath),
  method: 'page+date direct sum (no join, no allocation)',
  caliber: 'derived-verified',
  windows: { pre: [PRE_START, PRE_END, `${PRE_DAYS}d`], now: [NOW_START, NOW_END, '28d'] },
  pool_weekly_pre: +poolWeekly.toFixed(1),
  site_weekly_pre: +(sitePre / (PRE_DAYS / 7)).toFixed(1),
  orphan_share_pre_pct: +(((poolWeekly * (PRE_DAYS / 7)) / sitePre) * 100).toFixed(1),
  sensitive_set: sensitive.map((r) => r.slug),
  top10: top.map((r) => r.slug),
  top10_coverage_pct: coveragePct,
  review_needed: review.map((r) => r.slug),
  now_window_orphan_impressions: rows.reduce((s, r) => s + r.now4w, 0),
  rows,
};
const outPath = path.join(DATA_DIR, 'precrash-baseline-verified.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
console.log(`\nsaved → ${path.relative(ROOT, outPath)}`);
console.log('口径: derived-verified（page+date 行级直读）');
