/**
 * 孤儿旧 HTML 页 —— 内链出边审计（2026-09-23）
 *
 * 目的：1a 实施后，算出"哪些页会链到孤儿、每个孤儿拿到几条入链"。
 * 产出直接用于两件事：
 *   1. 验证 1a 生效（0 入链 → N 入链）
 *   2. 记录每页边数 —— 4 周后做「边数 vs 恢复幅度」异质性对照的基线
 *
 * 依赖：先把工具模块编译到 .tmp-audit/（CommonJS）：
 *   npx tsc utils/temperaturePageHelpers.ts utils/temperatureCore.ts utils/orphanTemperaturePages.ts \
 *     --outDir .tmp-audit --module commonjs --target es2019 --skipLibCheck
 *
 * 运行：node scripts/orphan-link-audit.mjs
 *
 * ⚠️ 本脚本复刻了 TemperaturePage.tsx 的两处目标选择逻辑（表格行 / RelatedTemperatures）。
 *    若组件里的选择逻辑改了，本脚本必须同步改，否则边数记录失真。
 *    复刻位置：TemperaturePage.tsx ConversionTable（表格行）与 RelatedTemperatures（precisionSteps + anchors）。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const require = createRequire(import.meta.url);

const { getTemperatureScene } = require(path.join(ROOT, '.tmp-audit/temperaturePageHelpers.js'));
const { ORPHAN_CELSIUS, ORPHAN_C_TO_F_SLUGS } = require(path.join(ROOT, '.tmp-audit/orphanTemperaturePages.js'));

// ---------- 1. 复刻 getAvailableTemperaturePages() ----------
function buildAvailablePages() {
  const pagesDir = path.join(ROOT, 'pages');
  const regex = /^(\d+(?:-\d+)?)-c-to-f\.tsx$/;
  const nextTemps = [];
  for (const file of fs.readdirSync(pagesDir)) {
    const m = file.match(regex);
    if (m) {
      const num = parseFloat(m[1].replace(/-/g, '.'));
      if (!isNaN(num)) nextTemps.push(num);
    }
  }
  const all = [...nextTemps];
  ORPHAN_CELSIUS.forEach((num) => {
    if (!all.includes(num)) all.push(num);
  });
  return { nextTemps, all };
}

/**
 * 孤儿页是静态 HTML，**不走 React 组件逻辑** —— 必须直接解析 public/*.html 里的真实 href。
 * （早期版本把孤儿当 React 页建模，算出的边是错的；2026-09-23 修正）
 */
function orphanHtmlTargets(slug) {
  const file = path.join(ROOT, 'public', `${slug}.html`);
  if (!fs.existsSync(file)) return [];
  const html = fs.readFileSync(file, 'utf8');
  const re = /href="\/?([0-9]+(?:-[0-9]+)?-c-to-f)(\.html)?"/g;
  const out = new Set();
  let m;
  while ((m = re.exec(html))) {
    if (m[1] !== slug) out.add(m[1]);
  }
  return [...out];
}

// ---------- 2. 复刻两处目标选择 ----------
/** ConversionTable：start = max(-10, floor(c/10)*10 - 10)，连续 11 行 */
function tableTargets(celsius) {
  const start = Math.max(-10, Math.floor(celsius / 10) * 10 - 10);
  const out = [];
  for (let i = 0; i < 11; i++) out.push(start + i);
  return out;
}

/** RelatedTemperatures：precisionSteps.slice(0,4) + 最近的 3 个 anchor */
function relatedTargets(celsius) {
  const scene = getTemperatureScene(celsius);
  const out = [];
  if (scene.precisionSteps) {
    scene.precisionSteps.slice(0, 4).forEach((step) => {
      out.push(parseFloat((celsius + step).toFixed(2)));
    });
  }
  if (scene.anchors) {
    [...scene.anchors]
      .sort((a, b) => Math.abs(a.val - celsius) - Math.abs(b.val - celsius))
      .slice(0, 3)
      .forEach((a) => out.push(a.val));
  }
  return out;
}

// ---------- 3. 第三类链接源：oven-temperature-conversion 主表 ----------
// 该表行是硬编码的，这里用正则从页面文件里抽 c 值，避免手抄漂移。
function ovenChartTargets() {
  const file = path.join(ROOT, 'pages/oven-temperature-conversion.tsx');
  const txt = fs.readFileSync(file, 'utf8');
  const out = [];
  const re = /\{\s*c:\s*(\d+(?:\.\d+)?)\s*,/g;
  let m;
  while ((m = re.exec(txt))) out.push(parseFloat(m[1]));
  return out;
}

// ---------- 4. 第四类：改造前既有的 .html 硬引用（locales JSON + 组件/页面） ----------
function preexistingHtmlRefs() {
  const orphans = new Set(ORPHAN_C_TO_F_SLUGS);
  const roots = ['locales/en', 'components', 'pages', 'templates'];
  const exts = ['.json', '.tsx', '.ts'];
  const skip = new Set(['node_modules', '.next', '.git', '.tmp-audit', 'dist']);
  const files = [];
  const walk = (dir) => {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
      const p = path.join(dir, e.name);
      if (e.isDirectory()) {
        if (!skip.has(e.name)) walk(p);
      } else if (exts.some((x) => e.name.endsWith(x))) files.push(p);
    }
  };
  roots.forEach((r) => {
    const abs = path.join(ROOT, r);
    if (fs.existsSync(abs)) walk(abs);
  });

  const refs = new Map(); // orphan slug -> Set(source)
  const re = /\/([0-9]+(?:-[0-9]+)?-c-to-f)\.html/g;
  for (const f of files) {
    const txt = fs.readFileSync(f, 'utf8');
    let m;
    while ((m = re.exec(txt))) {
      if (!orphans.has(m[1])) continue;
      if (!refs.has(m[1])) refs.set(m[1], new Set());
      refs.get(m[1]).add(path.relative(ROOT, f).replace(/\\/g, '/'));
    }
  }
  return refs;
}

// ---------- 5. 汇总出边 ----------
// 口径说明（2026-09-23 修正）：
//   · 源 = Next 温度页（47 个）→ 走组件逻辑（表格行 + 相关推荐），**仅英语页**（非英语 locale 已加闸门）
//   · 源 = 孤儿旧 HTML（34 个）→ **直接解析 public/*.html 的真实 href**，不套组件逻辑
//   · 源 = 烤箱专题页 → CONVERSION_ROWS
//   · 源 = 改造前既有硬引用（i18n JSON / ReferenceSection）
const { nextTemps, all: availablePages } = buildAvailablePages();
const availSet = new Set(availablePages);

const inbound = new Map(); // orphan celsius -> [{ from, kind }]
ORPHAN_CELSIUS.forEach((c) => inbound.set(c, []));

// 改造前的入边（用于 before 基线）：孤儿→孤儿（静态 HTML）+ 既有硬引用
const beforeInbound = new Map();
ORPHAN_CELSIUS.forEach((c) => beforeInbound.set(c, []));

let tableEdges = 0;
let relatedEdges = 0;
let chartEdges = 0;
let orphanHtmlEdges = 0;
const outboundOrphanEdges = new Map(); // source celsius -> 出边数（指向孤儿）

for (const src of nextTemps) {
  let count = 0;

  // 表格行（注意：源页自身所在行会被高亮，不算链接）
  for (const t of tableTargets(src)) {
    if (Math.abs(t - src) < 0.01) continue;
    if (!availSet.has(t)) continue;
    if (!ORPHAN_CELSIUS.has(t)) continue;
    inbound.get(t).push({ from: src, kind: 'table' });
    tableEdges++;
    count++;
  }

  // Related 区块
  const seen = new Set();
  for (const t of relatedTargets(src)) {
    if (Math.abs(t - src) < 0.01) continue;
    if (seen.has(t)) continue;
    seen.add(t);
    if (!availSet.has(t)) continue;
    if (!ORPHAN_CELSIUS.has(t)) continue;
    inbound.get(t).push({ from: src, kind: 'related' });
    relatedEdges++;
    count++;
  }

  if (count > 0) outboundOrphanEdges.set(src, count);
}

// 第二类：孤儿 → 孤儿（解析真实 HTML，改造前就存在）
for (const slug of ORPHAN_C_TO_F_SLUGS) {
  for (const target of orphanHtmlTargets(slug)) {
    const c = parseFloat(target.replace(/-c-to-f$/, '').replace('-', '.'));
    if (!inbound.has(c)) continue;
    inbound.get(c).push({ from: slug, kind: 'orphan-html' });
    beforeInbound.get(c).push({ from: slug, kind: 'orphan-html' });
    orphanHtmlEdges++;
  }
}

// 第三类：oven-temperature-conversion 主表（源页是专题页，不是温度页）
for (const t of ovenChartTargets()) {
  if (!availSet.has(t) || !ORPHAN_CELSIUS.has(t)) continue;
  inbound.get(t).push({ from: 'oven-temperature-conversion', kind: 'oven-chart' });
  chartEdges++;
}

// 第四类：改造前既有硬引用
const preRefs = preexistingHtmlRefs();
for (const [slug, srcs] of preRefs) {
  const c = parseFloat(slug.replace(/-c-to-f$/, '').replace('-', '.'));
  if (!inbound.has(c)) continue;
  for (const s of srcs) {
    inbound.get(c).push({ from: s, kind: 'preexisting' });
    beforeInbound.get(c).push({ from: s, kind: 'preexisting' });
  }
}

// ---------- 6. 输出 ----------
const slugOf = (c) => `${String(c).replace('.', '-')}-c-to-f`;
const orphans = [...ORPHAN_CELSIUS];

/**
 * 边的价值分两级 —— 这是最容易搞混的一点（2026-09-23 修正后新增）：
 *   · indexable = 来源是**可索引的 Next 页**（温度页 / 专题页 / ReferenceSection 所在页）→ 真正传递权重
 *   · orphan    = 来源是另一张孤儿旧 HTML（自身没收录、无权重）→ 只有爬取可达性价值，几乎不传权重
 * 早期把两者混成一个"入链数"，导致"孤儿零入链"的结论严重夸大。
 */
const isIndexableSource = (from) =>
  typeof from === 'number' || from === 'oven-temperature-conversion' || /\.(tsx|json)$/.test(String(from));

const rows = orphans
  .map((c) => {
    const edges = inbound.get(c);
    return {
      slug: slugOf(c),
      inbound: edges.length,
      indexable: edges.filter((e) => isIndexableSource(e.from)).length,
      orphanOnly: edges.filter((e) => !isIndexableSource(e.from)).length,
      // from 可能是温度值（number，来自温度页）或文件路径/页面名（string，来自专题表与既有引用）
      fromPages: [...new Set(edges.map((e) => (typeof e.from === 'number' ? slugOf(e.from) : e.from)))],
    };
  })
  .sort((a, b) => a.indexable - b.indexable || a.inbound - b.inbound);

const zero = rows.filter((r) => r.inbound === 0);
const zeroIndexable = rows.filter((r) => r.indexable === 0);
const totalInbound = rows.reduce((a, r) => a + r.inbound, 0);
const totalIndexable = rows.reduce((a, r) => a + r.indexable, 0);
const beforeCount = orphans.filter((c) => beforeInbound.get(c).length > 0).length;
const beforeTotal = [...beforeInbound.values()].reduce((a, v) => a + v.length, 0);
const beforeIndexableCount = orphans.filter((c) =>
  beforeInbound.get(c).some((e) => isIndexableSource(e.from))
).length;
const preRefCount = [...preRefs.values()].reduce((a, s) => a + s.size, 0);

console.log('='.repeat(72));
console.log('孤儿旧 HTML 内链审计 — 2026-09-23');
console.log('='.repeat(72));
console.log(`Next 温度页（组件逻辑源）: ${nextTemps.length}   孤儿（HTML 解析源）: ${orphans.length}   合计可链接目标: ${availablePages.length}`);
console.log('');
console.log(`【改造前】有入链 ${beforeCount}/${orphans.length}（入边 ${beforeTotal}）  其中来自**可索引 Next 页**的: ${beforeIndexableCount}/${orphans.length}`);
console.log(`【改造后】有入链 ${orphans.length - zero.length}/${orphans.length}（入边 ${totalInbound}）  其中来自**可索引 Next 页**的: ${orphans.length - zeroIndexable.length}/${orphans.length}（${totalIndexable} 条）`);
console.log('');
console.log('边来源拆解（改造后）:');
console.log(`  ★ 温度页对照表（ConversionTable）     ${String(tableEdges).padStart(3)}   1a 新增 · 可索引`);
console.log(`  ★ 温度页相关推荐（RelatedTemperatures）${String(relatedEdges).padStart(3)}   1a 新增 · 可索引`);
console.log(`  ★ 烤箱专题表（oven-temperature-conv）  ${String(chartEdges).padStart(3)}   1a 新增 · 可索引`);
console.log(`  ★ 既有硬引用（i18n JSON / 组件）       ${String(preRefCount).padStart(3)}   改造前既有 · 可索引`);
console.log(`    孤儿 → 孤儿（静态 HTML 真实 href）   ${String(orphanHtmlEdges).padStart(3)}   改造前既有 · **不可索引来源，权重价值≈0**`);
console.log('');
console.log(`有孤儿出边的 Next 温度页: ${outboundOrphanEdges.size}`);
console.log(`改造后仍【完全】零入链: ${zero.length ? zero.map((z) => z.slug).join(', ') : '无'}`);
console.log(`改造后仍【无 Next 页入链】: ${zeroIndexable.length ? zeroIndexable.map((z) => z.slug).join(', ') : '无'}`);
console.log('');
console.log('每孤儿（按"可索引入链"升序）:');
for (const r of rows) {
  const src = r.fromPages.slice(0, 5).join(', ');
  const more = r.fromPages.length > 5 ? ` …(+${r.fromPages.length - 5})` : '';
  console.log(`  可索引 ${String(r.indexable).padStart(2)} / 合计 ${String(r.inbound).padStart(2)}  ${r.slug.padEnd(16)} ← ${src}${more}`);
}

// 机器可读输出，供归档 / 4 周后对照
const outDir = path.join(ROOT, 'docs/data');
if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
const outPath = path.join(outDir, 'orphan-link-edges.json');
fs.writeFileSync(
  outPath,
  JSON.stringify(
    {
      generated_at: new Date().toISOString(),
      scope: 'English graph only（非英语 locale 页已加闸门，不输出孤儿链接）',
      available_pages: { next_temperature_pages: nextTemps.length, orphans: orphans.length, total_targets: availablePages.length },
      before: {
        orphans_with_inbound: beforeCount,
        orphans_with_zero_inbound: orphans.length - beforeCount,
        total_edges: beforeTotal,
      },
      after: {
        orphans_with_inbound: orphans.length - zero.length,
        orphans_with_zero_inbound: zero.length,
        total_edges: totalInbound,
      },
      edges: {
        temperature_table: tableEdges,
        temperature_related: relatedEdges,
        oven_chart: chartEdges,
        orphan_to_orphan_html: orphanHtmlEdges,
        preexisting_refs: preRefCount,
        total: totalInbound,
      },
      zero_inbound: zero.map((z) => z.slug),
      before_zero_inbound: orphans.filter((c) => beforeInbound.get(c).length === 0).map((c) => slugOf(c)),
      before_per_orphan: orphans
        .map((c) => ({ slug: slugOf(c), inbound: beforeInbound.get(c).length }))
        .sort((a, b) => a.inbound - b.inbound),
      per_orphan: rows.map((r) => ({ slug: r.slug, inbound: r.inbound, indexable_inbound: r.indexable, orphan_only_inbound: r.orphanOnly, from: r.fromPages })),
      zero_indexable_inbound: zeroIndexable.map((z) => z.slug),
      before_zero_indexable_inbound: orphans.filter((c) => !beforeInbound.get(c).some((e) => isIndexableSource(e.from))).map((c) => slugOf(c)),
      per_source: [...outboundOrphanEdges.entries()].map(([c, n]) => ({ slug: slugOf(c), outbound_to_orphans: n })),
      preexisting_refs_by_orphan: Object.fromEntries([...preRefs.entries()].map(([k, v]) => [k, [...v]])),
    },
    null,
    2
  ),
  'utf8'
);
console.log('');
console.log(`📄 边表已写入 ${path.relative(ROOT, outPath)}`);

// 与注册表交叉校验：注册表里每个 slug 都必须能算出 ≥0 条边，且不得有重复
if (ORPHAN_C_TO_F_SLUGS.length !== orphans.length) {
  console.error(`❌ 注册表 slug 数 ${ORPHAN_C_TO_F_SLUGS.length} ≠ 温度值数 ${orphans.length}（存在解析冲突）`);
  process.exitCode = 1;
}
