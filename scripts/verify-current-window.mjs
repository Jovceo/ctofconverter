/**
 * 当期窗口真值核验（2026-09-23 新增，C8 之后）
 *
 * 为什么需要它：
 *   `scripts/orphan-baseline.mjs` 用 **query 分摊法**近似重建每页序列（因为一度以为缺 page+date）。
 *   2026-09-23 证明该法会**凭空造出孤儿页的当期展示**：崩后这些 query 的展示实际全落在首页上
 *   （首页 pos 89–95 排这些词），分摊公式却按**历史份额**把一部分算给了孤儿。
 *   → 结论：**当期/崩后读数一律用本脚本（快照真值），不得再用分摊法。**
 *
 * 本脚本读 GSC 快照里带 page 维度的 `recent` 文件（date+page 或 page+query），
 * 直接按 page 汇总，输出：全站有哪些页面真有展示、温度页层/`.html` 层/孤儿层各是多少。
 *
 * 运行：
 *   node scripts/verify-current-window.mjs
 *   node scripts/verify-current-window.mjs --dir "E:/工具/seo-data-pull-tool/data/ctofconverter.com"
 *
 * 退出码：若孤儿页展示 > 0 或发现温度页层有展示 → 打印「有恢复」并 exit 0；
 *        否则 exit 0（正常，不是错误）。仅当快照缺失时 exit 1。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const DEFAULT_DIR = 'E:/工具/seo-data-pull-tool/data/ctofconverter.com';
const dirArgIdx = process.argv.indexOf('--dir');
const SNAPSHOT_DIR = dirArgIdx > -1 ? process.argv[dirArgIdx + 1] : DEFAULT_DIR;

// 孤儿注册表（从 TS 源码里抽 slug，避免手抄漂移）
function loadOrphanSlugs() {
  const src = fs.readFileSync(path.join(ROOT, 'utils/orphanTemperaturePages.ts'), 'utf8');
  const block = src.split('ORPHAN_C_TO_F_SLUGS')[1] || '';
  const slugs = [...block.matchAll(/'(\d+(?:-\d+)?-c-to-f)'/g)].map((m) => m[1]);
  return slugs;
}

const ORPHANS = loadOrphanSlugs();

function pickSnapshots() {
  if (!fs.existsSync(SNAPSHOT_DIR)) return [];
  return fs
    .readdirSync(SNAPSHOT_DIR)
    .filter((f) => /__recent__.*gsc_(date_page|query_page).*\.json$/.test(f))
    .map((f) => path.join(SNAPSHOT_DIR, f))
    .sort();
}

function pageOf(row) {
  if (row.page) return row.page;
  const keys = row.keys || [];
  // date+page → keys[1] 是 page；page+query → keys[0] 是 page
  return keys.find((k) => typeof k === 'string' && k.startsWith('http')) || null;
}

const isTemperaturePage = (url) => /\/\d+(?:-\d+)?-c-to-f(\.html)?$/.test(url);

function analyze(file) {
  const j = JSON.parse(fs.readFileSync(file, 'utf8'));
  const rows = j.data || j.rows || [];
  const byPage = new Map();
  for (const r of rows) {
    const p = pageOf(r);
    if (!p) continue;
    byPage.set(p, (byPage.get(p) || 0) + (r.impressions || 0));
  }
  const pages = [...byPage.entries()].sort((a, b) => b[1] - a[1]);
  const sum = (pred) => pages.filter(([p]) => pred(p)).reduce((a, x) => a + x[1], 0);
  const count = (pred) => pages.filter(([p]) => pred(p)).length;

  return {
    file: path.basename(file),
    dimensions: (j.dimensions || []).join('+'),
    data_state: j.data_state,
    search_type: j.search_type,
    rows: rows.length,
    total_records: j.total_records,
    truncated: j.total_records !== rows.length,
    distinct_pages: pages.length,
    total_impressions: pages.reduce((a, x) => a + x[1], 0),
    html_pages: count((p) => p.endsWith('.html')),
    html_impressions: sum((p) => p.endsWith('.html')),
    temp_pages: count(isTemperaturePage),
    temp_impressions: sum(isTemperaturePage),
    orphan_pages: count((p) => ORPHANS.some((s) => p.endsWith('/' + s + '.html'))),
    orphan_impressions: sum((p) => ORPHANS.some((s) => p.endsWith('/' + s + '.html'))),
    top: pages.slice(0, 8),
    orphan_detail: pages.filter(([p]) => ORPHANS.some((s) => p.endsWith('/' + s + '.html'))),
  };
}

const files = pickSnapshots();
if (files.length === 0) {
  console.error(`❌ 在 ${SNAPSHOT_DIR} 找不到 __recent__gsc_date_page / gsc_query_page 快照`);
  process.exit(1);
}

console.log('='.repeat(78));
console.log('当期窗口真值核验（快照直读，不经分摊）');
console.log('='.repeat(78));
console.log(`快照目录: ${SNAPSHOT_DIR}`);
console.log(`孤儿注册表: ${ORPHANS.length} 个 slug`);
console.log('');

let anyTempOrOrphan = false;

for (const f of files) {
  const a = analyze(f);
  console.log('─'.repeat(78));
  console.log(`${a.file}`);
  console.log(`  维度 ${a.dimensions} ｜ data_state=${a.data_state} ｜ search_type=${a.search_type}`);
  console.log(`  行数 ${a.rows} ／ total_records ${a.total_records}${a.truncated ? '  ⚠️ 被截断' : '  （未截断）'}`);
  console.log(`  不同页面 ${a.distinct_pages}   全站展示 ${a.total_impressions}`);
  console.log(`  .html 页 ${a.html_pages} 个 / ${a.html_impressions} 展示`);
  console.log(`  温度页层 ${a.temp_pages} 个 / ${a.temp_impressions} 展示`);
  console.log(`  孤儿页   ${a.orphan_pages} 个 / ${a.orphan_impressions} 展示`);
  console.log('  展示 Top 8：');
  for (const [p, v] of a.top) console.log(`    ${String(v).padStart(6)}  ${p}`);
  if (a.orphan_detail.length) {
    console.log('  ★ 孤儿页明细：');
    for (const [p, v] of a.orphan_detail) console.log(`    ${String(v).padStart(6)}  ${p}`);
  }
  if (a.temp_pages > 0 || a.orphan_pages > 0) anyTempOrOrphan = true;
  console.log('');
}

console.log('='.repeat(78));
if (anyTempOrOrphan) {
  console.log('✅ 温度页层/孤儿层已有展示 → 有恢复迹象，按 §2.2 页级判据逐页核。');
} else {
  console.log('⚠️ 所有快照里温度页层与孤儿层展示均为 0。');
  console.log('   这不是脚本错误 —— 2026-09-23 的基线状态就是「整站只剩首页有展示」。');
  console.log('   ⚠️ 若 `orphan-baseline.mjs`（分摊法）给出非零值，以本脚本为准（见 C8）。');
}
console.log('');
console.log('📌 4 周后读数流程：');
console.log('   1) 先拉一份新的 gsc_date_page / gsc_query_page（recent 窗口）快照');
console.log('   2) 跑本脚本拿真值 → 填进 docs/事实基线 §一d 的当期列');
console.log('   3) 把 scripts/orphan-groups.mjs 的 NOW_IS_FALSIFIED_USE_ZERO 置为 false');
console.log('   4) 重跑 orphan-groups.mjs 得三组表 + DiD');
