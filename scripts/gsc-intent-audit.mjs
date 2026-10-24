/**
 * 页面意图审计：统计指定页面在崩前窗口的「场景意图」占比，用于新页开工前判据。
 *
 * 背景：AGENTS.md「新页开工闸门：三数据点规则」要求开工前先数独有数据点；
 * 而一个页面若需求几乎全是纯换算（如 `190 c to f`），就没有场景内容可承接，
 * 写深页只会产出薄页。本脚本给出可复算的判据输入。
 *
 * 用法：
 *   node scripts/gsc-intent-audit.mjs --slugs "42-c-to-f,45-c-to-f" [--start 2025-10-13] [--end 2025-12-31] [--out path.json]
 *   node scripts/gsc-intent-audit.mjs --from-orphan-registry     # 直接读 utils/orphanTemperaturePages.ts 的 17 个 slug
 *
 * 口径（2026-10-24 定，勿改）：
 *   - 场景正则分两套：OVEN（烤箱/烘焙）与 BODY（体温/医疗）。两套都报，避免单一正则把
 *     体温页判成 0%（踩过：只用烤箱正则时 6 个体温页全是假零）。
 *   - 两套正则都**不含** degree / temperature —— 这两个词会把「170 degrees celsius to
 *     fahrenheit」这类纯换算误判成场景（踩过：含此二词时占比系统性虚高 15–18 个百分点）。
 *   - 曝光加权，不是按查询条数计数。
 *   - 窗口默认崩前（2025-10-13 → 2025-12-31）：塌方后的曝光是噪声，不能当需求证据。
 *   - 必须用 dimensionFilterGroups（旧名 dimensionFilters 会被静默忽略且不报错）。
 *
 * 代理：需要 HTTPS_PROXY（undici 不读代理环境变量时请用 gaxios 路径，见下）。
 */

import fs from 'node:fs';
import path from 'node:path';
import { google } from 'googleapis';
import { request as gaxiosRequest } from 'gaxios';
import { HttpsProxyAgent } from 'https-proxy-agent';

const SITE = 'https://ctofconverter.com/';
const SA_FILE = 'ctofconverter-com-analytics-4f490974795a.json';

// 场景意图关键词 —— 两套独立正则，均不含 degree / temperature
const OVEN_SCENE =
  /(oven|bake|baking|baked|gas\s?mark|recipe|roast|fan|air\s?fryer|airfryer|convection|preheat|cook|cooking|scone|sponge|cake|bread|chicken|potato|pizza|pastry|meringue|yorkshire|pudding|biscuit|cookie|pie|tart|casserole|steak|turkey|lamb|beef|salmon|fish)/i;
const BODY_SCENE =
  /(fever|body|baby|infant|child|kid|toddler|armpit|axillary|oral|rectal|ear|forehead|thermometer|human|adult|normal|hypothermia|temperature of)/i;

function arg(name, fallback = null) {
  const i = process.argv.indexOf('--' + name);
  if (i === -1) return fallback;
  const v = process.argv[i + 1];
  return v && !v.startsWith('--') ? v : fallback;
}
const hasFlag = (name) => process.argv.includes('--' + name);

function readOrphanSlugs() {
  const p = path.join(process.cwd(), 'utils', 'orphanTemperaturePages.ts');
  const t = fs.readFileSync(p, 'utf8');
  const m = t.match(/ORPHAN_C_TO_F_SLUGS[^=]*=\s*\[([\s\S]*?)\]/);
  if (!m) throw new Error('未能在 orphanTemperaturePages.ts 中定位 ORPHAN_C_TO_F_SLUGS');
  return (m[1].match(/'[^']+'/g) || []).map((s) => s.replace(/'/g, ''));
}

async function makeClient() {
  const sa = JSON.parse(fs.readFileSync(path.join(process.cwd(), SA_FILE), 'utf8'));
  const auth = new google.auth.GoogleAuth({
    credentials: sa,
    scopes: ['https://www.googleapis.com/auth/webmasters.readonly'],
  });
  // 显式挂代理：undici 的 fetch 不读 HTTPS_PROXY，googleapis 走 gaxios 需要 agent
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const client = await auth.getClient();
  if (proxy) {
    const agent = new HttpsProxyAgent(proxy);
    const origRequest = client.request.bind(client);
    client.request = (opts) => origRequest({ ...opts, agent });
  }
  return google.searchconsole({ version: 'v1', auth: client });
}

async function main() {
  const start = arg('start', '2025-10-13');
  const end = arg('end', '2025-12-31');
  const outPath = arg('out', null);

  let slugs;
  if (hasFlag('from-orphan-registry')) {
    slugs = readOrphanSlugs();
  } else {
    const raw = arg('slugs');
    if (!raw) {
      console.error('用法：--slugs "a,b" 或 --from-orphan-registry');
      process.exit(1);
    }
    slugs = raw.split(',').map((s) => s.trim()).filter(Boolean);
  }

  const sc = await makeClient();
  const results = [];

  for (const slug of slugs) {
    const page = `${SITE}${slug}.html`;
    let rows = [];
    try {
      const res = await sc.searchanalytics.query({
        siteUrl: SITE,
        requestBody: {
          startDate: start,
          endDate: end,
          dimensions: ['query'],
          dimensionFilterGroups: [
            { filters: [{ dimension: 'page', operator: 'equals', expression: page }] },
          ],
          rowLimit: 5000,
        },
      });
      rows = res.data.rows || [];
    } catch (e) {
      console.error(`  ${slug}: 查询失败 ${e.message}`);
      results.push({ slug, error: e.message });
      continue;
    }

    let imp = 0, clicks = 0, posW = 0;
    let ovenImp = 0, ovenPosW = 0, bodyImp = 0, bodyPosW = 0;
    let topOven = null, topBody = null;

    for (const r of rows) {
      const q = String(r.keys[0]).toLowerCase();
      const i = r.impressions || 0;
      const p = r.position || 0;
      imp += i;
      clicks += r.clicks || 0;
      posW += p * i;
      if (OVEN_SCENE.test(q)) {
        ovenImp += i;
        ovenPosW += p * i;
        if (!topOven || i > topOven.i) topOven = { q, i, pos: p };
      }
      if (BODY_SCENE.test(q)) {
        bodyImp += i;
        bodyPosW += p * i;
        if (!topBody || i > topBody.i) topBody = { q, i, pos: p };
      }
    }

    results.push({
      slug,
      page,
      totalImpressions: imp,
      clicks,
      avgPosition: imp ? +(posW / imp).toFixed(2) : null,
      queryCount: rows.length,
      ovenSceneImpressions: ovenImp,
      ovenScenePct: imp ? +((ovenImp / imp) * 100).toFixed(1) : 0,
      ovenSceneAvgPos: ovenImp ? +(ovenPosW / ovenImp).toFixed(1) : null,
      topOvenQuery: topOven,
      bodySceneImpressions: bodyImp,
      bodyScenePct: imp ? +((bodyImp / imp) * 100).toFixed(1) : 0,
      bodySceneAvgPos: bodyImp ? +(bodyPosW / bodyImp).toFixed(1) : null,
      topBodyQuery: topBody,
    });
  }

  const payload = {
    generatedAt: new Date().toISOString(),
    site: SITE,
    window: { startDate: start, endDate: end },
    method:
      'GSC Search Analytics, dimensions=[query], dimensionFilterGroups by page, 曝光加权；场景正则分 OVEN/BODY 两套且均不含 degree/temperature',
    baseline: { note: '/175-c-to-f 崩前场景占比 17.1% 作为密度参照', ovenScenePct: 17.1 },
    pages: results,
  };

  // 控制台表
  console.log(`\n窗口 ${start} → ${end} | 基线 175 场景 ${payload.baseline.ovenScenePct}%\n`);
  console.log(
    'slug'.padEnd(14) + '曝光'.padStart(7) + '烤箱场景'.padStart(10) + '占比'.padStart(8) +
    '体温场景'.padStart(10) + '占比'.padStart(8) + '  判读'
  );
  console.log('-'.repeat(84));
  for (const r of results) {
    if (r.error) { console.log(r.slug.padEnd(14) + ' ERROR ' + r.error); continue; }
    const ovenWins = r.ovenScenePct >= r.bodyScenePct;
    const bestPct = ovenWins ? r.ovenScenePct : r.bodyScenePct;
    const bestAbs = ovenWins ? r.ovenSceneImpressions : r.bodySceneImpressions;
    // 判读分两步，别混：
    //   ① 样本量看**总曝光**（总曝光太小 → 任何占比都不可信；踩过：38-4-c-to-f 占比 71.4%
    //      但总曝光仅 28、均位全 1.0，单看占比会误判成「有独立场景」）。
    //   ② 场景强弱看**场景曝光占比**（总曝光够但场景为 0，是「纯换算」而不是「样本不足」；
    //      踩过：只看场景绝对量会把 42-c-to-f（588 曝光 / 场景 0）误标成样本不足）。
    const verdict =
      r.totalImpressions < 100
        ? '样本不足'
        : bestPct >= 40 && bestAbs >= 50
          ? '有独立场景'
          : bestPct >= 20
            ? '边界'
            : '纯换算';
    console.log(
      r.slug.padEnd(14) +
      String(r.totalImpressions).padStart(7) +
      String(r.ovenSceneImpressions).padStart(10) +
      (r.ovenScenePct + '%').padStart(8) +
      String(r.bodySceneImpressions).padStart(10) +
      (r.bodyScenePct + '%').padStart(8) +
      '  ' + verdict
    );
  }

  if (outPath) {
    fs.mkdirSync(path.dirname(outPath), { recursive: true });
    fs.writeFileSync(outPath, JSON.stringify(payload, null, 2));
    console.log(`\n快照已写入: ${outPath}`);
  }
}

main().catch((e) => {
  console.error('失败:', e.message);
  process.exit(1);
});
