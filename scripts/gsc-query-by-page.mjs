/**
 * gsc-query-by-page.mjs — 查「某个页面被哪些查询带来曝光」（query×page 维）
 *
 * 用途：投写作量之前的关键词调研（AGENTS.md「做新页面之前：先做关键词调研 / 确认信息增益」）。
 *   决定一页该「写深」还是「301」的核心判据：
 *     - 场景意图占比高（oven / bake / gas mark / recipe / roast / fan）→ 有独立信息增益，值得写深
 *     - 纯换算意图占比高（<temp> c to f / celsius to fahrenheit）→ 写深就是 AGENTS.md 明令的
 *       「只改数字」，正确处置是 301 到同族页或 hub
 *
 * 用法：
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/gsc-query-by-page.mjs 170-c-to-f 230-c-to-f
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/gsc-query-by-page.mjs --window 2025-10-13 2025-12-31 170-c-to-f.html
 *
 * 默认窗口 2025-10-13 → 2025-12-31（崩前；塌方后的曝光是噪声，不能当需求证据）。
 */
import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KEY_PATH = path.join(ROOT, 'ctofconverter-com-analytics-4f490974795a.json');
const SITE = 'https://ctofconverter.com/';

const argv = process.argv.slice(2);
let S = '2025-10-13', E = '2025-12-31';
if (argv[0] === '--window') { S = argv[1]; E = argv[2]; argv.splice(0, 3); }
const targets = argv;
if (!targets.length) { console.error('用法: node scripts/gsc-query-by-page.mjs [--window S E] <slug|slug.html> [...]'); process.exit(1); }

const auth = new google.auth.GoogleAuth({
  credentials: JSON.parse(fs.readFileSync(KEY_PATH, 'utf8')),
  scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
});
const sc = google.searchconsole({ version: 'v1', auth });

// 场景意图关键词（烤箱/烘焙场景，非纯换算）
const SCENE = /(oven|bake|baking|baked|gas\s?mark|recipe|roast|fan|air\s?fryer|airfryer|convection|temperature|preheat|degree|cook|cooking|scone|sponge|cake|bread|chicken|potato)/i;

for (const t of targets) {
  const url = `${SITE}${t.replace(/\.html$/, '')}${t.endsWith('.html') ? '.html' : ''}`;
  const res = await sc.searchanalytics.query({
    siteUrl: SITE,
    requestBody: {
      startDate: S, endDate: E,
      dimensions: ['query'],
      rowLimit: 500,
      type: 'web',
      dimensionFilterGroups: [{ filters: [{ dimension: 'page', operator: 'equals', expression: url }] }],
    },
  });
  const rows = (res.data.rows || []).map(r => ({ q: r.keys[0], i: r.impressions || 0, c: r.clicks || 0, p: r.position || 0 }))
    .sort((a, b) => b.i - a.i);

  const totImp = rows.reduce((a, r) => a + r.i, 0);
  const sceneRows = rows.filter(r => SCENE.test(r.q));
  const sceneImp = sceneRows.reduce((a, r) => a + r.i, 0);

  console.log(`\n${'='.repeat(70)}`);
  console.log(`${url}   [${S} → ${E}]`);
  console.log(`${'='.repeat(70)}`);
  if (!rows.length) { console.log('  无数据'); continue; }
  console.log(`查询数 ${rows.length} | 总曝光 ${totImp} | 场景类曝光 ${sceneImp} (${(sceneImp / totImp * 100).toFixed(1)}%)`);
  console.log(`\nTop 15 查询:`);
  console.log('  曝光   点击  均位   查询');
  for (const r of rows.slice(0, 15)) {
    console.log(`  ${String(r.i).padStart(5)}  ${String(r.c).padStart(4)}  ${r.p.toFixed(1).padStart(5)}   ${r.q}${SCENE.test(r.q) ? '   ← 场景' : ''}`);
  }
  const pct = sceneImp / totImp * 100;
  console.log(`\n判读: ${pct >= 70 ? '✅ 场景意图 ≥70% → 信息增益成立，值得写深' : pct >= 50 ? '⚠️ 场景意图 50–70% → 边界，需人工判断' : '❌ 场景意图 <50% → 正确处置是 301 到同族页/hub，不是写 1500 词'}`);
}
