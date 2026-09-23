/**
 * 孤儿页 A/B/C 三组对照表（2026-09-23 K 轮定稿）
 *
 * 用途：4 周后（12-03 判决日附近）做 1a 的专属对照分析，一条命令出表，避免重新推导时出错。
 *
 * 分组规则（一律按「可索引入链」，见 docs/规格-执行-2026-09-23.md §2.2 口径附注）：
 *   A = 改造前已有可索引 Next 页入链（对照）            n=11
 *   B = 改造前没有、本次才拿到可索引入链（处理组）      n=18
 *   C = 改造前没有、改造后仍然没有（**1b-only 组**）    n=5
 *
 * 依赖：
 *   · docs/data/orphan-link-edges.json      ← scripts/orphan-link-audit.mjs 生成
 *   · docs/事实基线-2026-09-23.md §一d      ← 逐页崩前基线 / 当期展示
 *
 * 运行：node scripts/orphan-groups.mjs
 *
 * ⚠️ 判据约束（K 轮，不得放宽）：
 *   1. 恢复率 = 当期4周 / (崩前周均 × 4)，**只对崩前周均 ≥ 5 的页计算**（小分母会爆表：37-7 的 1 次展示 = 125%）
 *   2. 组间比**中位数**，不比绝对值
 *   3. C 组（有效 n=4）**只作方向性参考，不进通过/失败判定** —— 通过/失败只看 §2.2 的 Top10 ≥8/10
 *   4. B 组必须同时报"含 175 / 不含 175"（175 占 B 组崩前 60%）
 *   5. **必须做双重差分（DiD）** —— 见下方 CONFOUND 说明
 *
 * ⚠️ CONFOUND（2026-09-23 18:05 自查发现 → **18:20 已被证伪，C9**）：
 *   我一度认为"干预前 B 组更健康（5/18 vs 0/5）"是个混淆变量。**错了** ——
 *   那 5 页是 `orphan-baseline.mjs` 的 query 分摊法造出来的假象（C8）。
 *   三份独立快照证实：2026-08-22~09-18 整站只有 5 个页面有展示（全是首页），
 *   **温度页层与 .html 层展示全为 0**。真值：B = 0/18、C = 0/5。
 *   → DiD 干预前腿 = 0/0，`DiD = B_后 − C_后`。DiD 保留，但性质从"修混淆"变为"防万一"。
 *   → 教训：本设计的数字被推翻过两次（C6、C8/C9），任何"看起来合理"的中间结论先过一遍数据源。
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

const MIN_BASELINE_FOR_RATIO = 5; // 崩前周均低于此值不算恢复率
const NOW_WEEKS = 4; // 当期窗口 = 4 周（2026-08-25 ~ 2026-09-21）

/**
 * 🚨 C8：事实基线 §一d 的"当期 4 周"列**已被证伪**，真值 = 0。
 * 三份独立快照证实 2026-08-22~09-18 整站只有 5 个页面有展示（全是首页），温度页层展示全为 0。
 * → 在 4 周新窗口数据到位前，本脚本一律把"当期"当作 0。
 * → 4 周后：把 §一d 的当期列换成新窗口数据，并把此常量置为 false。
 */
const NOW_IS_FALSIFIED_USE_ZERO = true;

// ---------- 1. 解析事实基线 §一d 的逐页表 ----------
function parseBaselines() {
  const md = fs.readFileSync(path.join(ROOT, 'docs/事实基线-2026-09-23.md'), 'utf8');
  const rows = [];
  for (const line of md.split(/\r?\n/)) {
    const m = line.match(
      /^\|\s*([0-9]+(?:-[0-9]+)?-c-to-f)\s*\|\s*(整数|体温)\s*\|\s*([\d,]+)\s*\|\s*\*\*([\d,.]+)\*\*\s*\|\s*(\d+)\s*\|\s*(\d+)%/
    );
    if (!m) continue;
    rows.push({
      slug: m[1],
      cls: m[2],
      total12m: +m[3].replace(/,/g, ''),
      preWeekly: +m[4].replace(/,/g, ''),
      // 已证伪的近似值（仅留档对照）；真实当期展示见 NOW_IS_FALSIFIED_USE_ZERO
      now4wApprox: +m[5],
      now4w: NOW_IS_FALSIFIED_USE_ZERO ? 0 : +m[5],
      coverage: +m[6],
    });
  }
  return rows;
}

// ---------- 2. 分组 ----------
const edgesData = JSON.parse(
  fs.readFileSync(path.join(ROOT, 'docs/data/orphan-link-edges.json'), 'utf8')
);
const indexableInboundMap = new Map(
  (edgesData.per_orphan || []).map((p) => [p.slug, p.indexable_inbound])
);
const indexableInboundOf = (slug) =>
  indexableInboundMap.has(slug) ? indexableInboundMap.get(slug) : null;

function assignGroups() {
  const beforeNoIndexable = new Set(edgesData.before_zero_indexable_inbound || []);
  const afterNoIndexable = new Set(edgesData.zero_indexable_inbound || []);

  return (slug) => {
    if (beforeNoIndexable.has(slug) && afterNoIndexable.has(slug)) return 'C';
    if (beforeNoIndexable.has(slug)) return 'B';
    return 'A';
  };
}

// ---------- 3. 统计 ----------
const median = (arr) => {
  if (arr.length === 0) return null;
  const s = [...arr].sort((a, b) => a - b);
  const n = s.length;
  return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2;
};

const rows = parseBaselines();
const groupOf = assignGroups();
const G = { A: [], B: [], C: [] };
for (const r of rows) G[groupOf(r.slug)].push(r);

const summarize = (list) => {
  const withRatio = list.filter((r) => r.preWeekly >= MIN_BASELINE_FOR_RATIO);
  return {
    n: list.length,
    n_ratio_eligible: withRatio.length,
    pre_weekly_sum: +list.reduce((a, r) => a + r.preWeekly, 0).toFixed(1),
    pre_weekly_median: median(list.map((r) => r.preWeekly)),
    now_4w_sum: list.reduce((a, r) => a + r.now4w, 0),
    // 恢复率中位数：只对有资格的页算，未达标的页按 0 计入（它们当期几乎必然为 0）
    recovery_rate_median: withRatio.length
      ? +median(withRatio.map((r) => r.now4w / (r.preWeekly * NOW_WEEKS))).toFixed(5)
      : null,
    recovery_rate_pages_above_zero: withRatio.filter((r) => r.now4w > 0).length,
    // 全部页（含崩前周均 <5 的）里有任何当期展示的页数 —— 避免小基线页的绝对恢复被比率过滤器藏掉
    pages_with_any_impression_all: list.filter((r) => r.now4w > 0).length,
    pages_with_any_impression_all_slugs: list.filter((r) => r.now4w > 0).map((r) => r.slug),
  };
};

const out = {
  generated_at: new Date().toISOString(),
  note:
    'K 轮三组对照。C 组 = 1b-only（照样吃了 sitemap，不是空白对照）。恢复率只对崩前周均 ≥ ' +
    MIN_BASELINE_FOR_RATIO +
    ' 的页计算；C 组仅作方向性参考，不进通过/失败判定。',
  baseline_window: '2025-10-01 ~ 2025-12-15 (76d)',
  current_window: '2026-08-25 ~ 2026-09-21 (28d)',
  // 干预前快照（1a 部署于 2026-09-23）。4 周后把新窗口填进 post_intervention 再重跑，即可算 DiD。
  pre_intervention: {
    window: '2026-08-25 ~ 2026-09-21',
    verified_zero: NOW_IS_FALSIFIED_USE_ZERO,
    note:
      'C8/C9：该窗口的孤儿展示真值 = 0（三份独立快照证实整站只有 5 个页面有展示，全是首页）。' +
      '原"B 组 5/18 有展示"是 orphan-baseline.mjs 的 query 分摊产物，已作废。' +
      '→ 真值 B=0/18、C=0/5，DiD 干预前腿 = 0/0。',
  },
  post_intervention: null,
  did_formula: 'DiD = B_后 − C_后（干预前腿已是 0/0）。度量：有展示的页数 或 恢复率中位数。',
  did_boundaries: [
    '只进 4 周复盘分析，不进 §2.2 判据（Top10/≥8 是唯一闸门）',
    '平行趋势不可检验（只有一段前窗）——结论句只能写"B 的增量大于 C 的增量（平行趋势未检验）"，不得出现"1a 效应"',
    '分组外生性定性为"支持"不是"证明"——写"未发现分组与基线相关"，不写"分组外生"',
  ],
  groups: {},
  members: {},
};

console.log('='.repeat(74));
console.log('孤儿页 A/B/C 三组对照 — ' + new Date().toISOString().slice(0, 10));
console.log('='.repeat(74));
console.log(`解析到 ${rows.length} 页，崩前周均合计 ${rows.reduce((a, r) => a + r.preWeekly, 0).toFixed(1)}（应 = 3128.1）`);
console.log('');

for (const k of ['A', 'B', 'C']) {
  const s = summarize(G[k]);
  out.groups[k] = s;
  out.members[k] = G[k]
    .map((r) => ({
      slug: r.slug,
      cls: r.cls,
      pre_weekly: r.preWeekly,
      now_4w: r.now4w,
      coverage: r.coverage,
      indexable_inbound: indexableInboundOf(r.slug),
    }))
    .sort((a, b) => b.pre_weekly - a.pre_weekly);

  const label =
    k === 'A' ? '改造前已有可索引入链（对照）' : k === 'B' ? '本次才拿到可索引入链（处理组）' : '1b-only（对照组）';
  console.log(`【${k}】${label}   n=${s.n}`);
  console.log(
    `     崩前周均 合计 ${s.pre_weekly_sum} / 中位 ${s.pre_weekly_median}   当期4周 ${s.now_4w_sum}`
  );
  console.log(
    `     恢复率中位数 ${s.recovery_rate_median === null ? 'n/a' : (s.recovery_rate_median * 100).toFixed(2) + '%'}` +
      `   有恢复的页 ${s.recovery_rate_pages_above_zero}/${s.n_ratio_eligible}（恢复率分母只含崩前周均 ≥${MIN_BASELINE_FOR_RATIO} 的页）`
  );
  console.log(
    `     当期有展示的页（全部页，含小基线）：${s.pages_with_any_impression_all}/${s.n}` +
      (s.pages_with_any_impression_all ? ` → ${s.pages_with_any_impression_all_slugs.join(', ')}` : '')
  );
  console.log('');
}

// B 组含/不含 175
const B = G.B;
const bNo175 = B.filter((r) => r.slug !== '175-c-to-f');
out.groups.B_excluding_175 = summarize(bNo175);
out.members.B_excluding_175 = bNo175.map((r) => r.slug);
console.log('【B 组 · 不含 175】（175 占 B 组崩前 ' +
  ((1513.8 / out.groups.B.pre_weekly_sum) * 100).toFixed(1) + '%）');
console.log(`     崩前周均 合计 ${out.groups.B_excluding_175.pre_weekly_sum} / 中位 ${out.groups.B_excluding_175.pre_weekly_median}   当期4周 ${out.groups.B_excluding_175.now_4w_sum}`);
console.log(`     恢复率中位数 ${out.groups.B_excluding_175.recovery_rate_median === null ? 'n/a' : (out.groups.B_excluding_175.recovery_rate_median * 100).toFixed(2) + '%'}`);
console.log('');
console.log('⚠️ 通过/失败判定只看 §2.2 的 Top10 ≥8/10 —— 本表是复盘分析，不是闸门。');

const outPath = path.join(ROOT, 'docs/data/orphan-groups.json');
fs.writeFileSync(outPath, JSON.stringify(out, null, 2), 'utf8');
console.log('');
console.log(`📄 三组表已写入 ${path.relative(ROOT, outPath)}`);

// 一致性自检
const sum = G.A.length + G.B.length + G.C.length;
if (sum !== rows.length) {
  console.error(`❌ 分组覆盖不全：${sum} ≠ ${rows.length}`);
  process.exitCode = 1;
}
if (Math.abs(rows.reduce((a, r) => a + r.preWeekly, 0) - 3128.1) > 0.5) {
  console.error('❌ 崩前周均合计偏离 3128.1，基线表可能被改动过');
  process.exitCode = 1;
}
