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
  const temps = [];
  for (const file of fs.readdirSync(pagesDir)) {
    const m = file.match(regex);
    if (m) {
      const num = parseFloat(m[1].replace(/-/g, '.'));
      if (!isNaN(num)) temps.push(num);
    }
  }
  const before = temps.length;
  ORPHAN_CELSIUS.forEach((num) => {
    if (!temps.includes(num)) temps.push(num);
  });
  return { temps, before, after: temps.length };
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
const { temps: availablePages, before, after } = buildAvailablePages();
const availSet = new Set(availablePages);

const sourcePages = [...availablePages];

const inbound = new Map(); // orphan celsius -> [{ from, kind }]
ORPHAN_CELSIUS.forEach((c) => inbound.set(c, []));

let tableEdges = 0;
let relatedEdges = 0;
let chartEdges = 0;
const outboundOrphanEdges = new Map(); // source celsius -> 出边数（指向孤儿）

for (const src of sourcePages) {
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
  for (const s of srcs) inbound.get(c).push({ from: s, kind: 'preexisting' });
}

// ---------- 6. 输出 ----------
const slugOf = (c) => `${String(c).replace('.', '-')}-c-to-f`;
const orphans = [...ORPHAN_CELSIUS];

const rows = orphans
  .map((c) => ({
    slug: slugOf(c),
    inbound: inbound.get(c).length,
    // from 可能是温度值（number，来自温度页）或文件路径/页面名（string，来自专题表与既有引用）
    fromPages: [...new Set(inbound.get(c).map((e) => (typeof e.from === 'number' ? slugOf(e.from) : e.from)))],
  }))
  .sort((a, b) => a.inbound - b.inbound);

const zero = rows.filter((r) => r.inbound === 0);
const totalInbound = rows.reduce((a, r) => a + r.inbound, 0);
const beforeCount = [...preRefs.keys()].length;

console.log('='.repeat(72));
console.log('孤儿旧 HTML 内链审计 — 2026-09-23');
console.log('='.repeat(72));
console.log(`availablePages: ${before} (pages/*.tsx) + ${after - before} (孤儿) = ${after}`);
console.log(`孤儿总数: ${orphans.length}`);
console.log('');
console.log(`【改造前】有入链的孤儿: ${beforeCount} / ${orphans.length}  零入链: ${orphans.length - beforeCount}`);
console.log(`【改造后】有入链的孤儿: ${orphans.length - zero.length} / ${orphans.length}  零入链: ${zero.length}`);
console.log(`总入边: ${totalInbound}  (温度页表格 ${tableEdges} + Related ${relatedEdges} + 烤箱专题表 ${chartEdges} + 改造前既有 ${[...preRefs.values()].reduce((a, s) => a + s.size, 0)})`);
console.log(`有孤儿出边的源页: ${outboundOrphanEdges.size}`);
console.log(`改造后仍零入链: ${zero.length ? zero.map((z) => z.slug).join(', ') : '无'}`);
console.log('');
console.log('每孤儿入链数（升序）:');
for (const r of rows) {
  const src = r.fromPages.slice(0, 6).join(', ');
  const more = r.fromPages.length > 6 ? ` …(+${r.fromPages.length - 6})` : '';
  console.log(`  ${String(r.inbound).padStart(3)}  ${r.slug.padEnd(16)} ← ${src}${more}`);
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
      available_pages: { from_pages_dir: before, from_orphans: after - before, total: after },
      before: { orphans_with_inbound: beforeCount, orphans_with_zero_inbound: orphans.length - beforeCount },
      after: { orphans_with_inbound: orphans.length - zero.length, orphans_with_zero_inbound: zero.length },
      edges: {
        temperature_table: tableEdges,
        temperature_related: relatedEdges,
        oven_chart: chartEdges,
        preexisting_refs: [...preRefs.values()].reduce((a, s) => a + s.size, 0),
        total: totalInbound,
      },
      zero_inbound: zero.map((z) => z.slug),
      per_orphan: rows.map((r) => ({ slug: r.slug, inbound: r.inbound, from: r.fromPages })),
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
