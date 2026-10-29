/**
 * 校验数据集的行级溯源：把每一行的 `quote` 与 `source_url` 实抓页面逐格比对。
 *
 * 为什么需要这个脚本：
 *   2026-10-29 补 oven-conversions 的 12 行 quote 时，核对逻辑写在临时脚本里、用完就删。
 *   按「可复算」纪律，判据必须能被人重新跑一遍——否则以后没人能证明这些 quote 不是编的。
 *
 * 它做什么：
 *   1. 实抓 `source_url`（默认走 HTTPS_PROXY）
 *   2. 解析页面里的表格（Wikipedia Gas mark 的 "Conversion table"）
 *   3. 对数据集的每一行：
 *      - 按 quote 的单元格数量定位来源行（第 1 格 = 行标识）
 *      - 逐格比对 quote 与来源页原文
 *      - 比对数据集数值（conventional_c / conventional_f）与 quote 里的对应格
 *   4. 任何一处不一致 → 打印明细并 exit 1（不是警告，是失败）
 *
 * 用法：
 *   node scripts/verify-dataset-quotes.mjs                    # 默认校验 oven-conversions
 *   node scripts/verify-dataset-quotes.mjs --dataset oven-conversions
 *   node scripts/verify-dataset-quotes.mjs --offline docs/data/xxx.html   # 用已归档的 HTML，不联网
 *
 * 代理：本机可用 20890。注意 Windows 下四个变量都要设，否则 requests/undici 可能读小写那个。
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const arg = (n, d = null) => {
  const i = process.argv.indexOf('--' + n);
  return i === -1 ? d : process.argv[i + 1] ?? d;
};

const DATASET = arg('dataset', 'oven-conversions');
const OFFLINE = arg('offline', null);
const FILE = path.join('config', 'datasets', `${DATASET}.json`);

// ---------- 抓取 ----------
// 注意：不要用 fetch —— undici 不读 HTTPS_PROXY，在需要代理的环境里必然 connect timeout。
function httpGet(url, proxy) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent':
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml',
      },
      timeout: 45000,
    };
    if (proxy) opts.agent = new HttpsProxyAgent(proxy);
    const req = https.get(url, opts, (res) => {
      if (res.statusCode < 200 || res.statusCode >= 300) {
        res.resume();
        reject(new Error(`抓取失败 HTTP ${res.statusCode}`));
        return;
      }
      let buf = '';
      res.setEncoding('utf8');
      res.on('data', (c) => (buf += c));
      res.on('end', () => resolve({ status: res.statusCode, html: buf }));
    });
    req.on('timeout', () => {
      req.destroy(new Error('请求超时'));
    });
    req.on('error', reject);
  });
}

async function loadHtml(url) {
  if (OFFLINE) {
    console.log(`[offline] 使用归档 HTML: ${OFFLINE}`);
    return fs.readFileSync(OFFLINE, 'utf8');
  }
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  console.log(`抓取 ${url}${proxy ? `（经代理 ${proxy}）` : '（直连）'}`);
  const { status, html } = await httpGet(url, proxy);
  console.log(`  HTTP ${status}，${html.length} 字符`);
  return html;
}

// ---------- 解析表格 ----------
// 只去掉「引用角标」（<sup class="reference">），不能无差别删 <sup>——
// Wikipedia 的分数 1⁄4 是用 <sup>1</sup>⁄<sub>4</sub> 排的，全删会把分子删掉。
// 另外分数斜杠 U+2044（⁄）与普通斜杠（/）要归一，否则 "1/4" 匹配不上 "1 ⁄ 4"。
const stripTags = (s) =>
  s
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\u2044/g, '/') // ⁄ → /
    .replace(/\s*\/\s*/g, '/') // "1 / 4" → "1/4"
    .replace(/\s+/g, ' ')
    .trim();

/** 返回所有 <table> 的二维单元格文本数组 */
function parseTables(html) {
  const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
  return tables.map((t) => {
    const rows = t.match(/<tr[\s\S]*?<\/tr>/g) || [];
    return rows.map((r) => {
      const cells = r.match(/<t[hd][\s\S]*?<\/t[hd]>/g) || [];
      return cells.map(stripTags);
    });
  });
}

// ---------- 主流程 ----------
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const rows = doc.rows || [];
if (!rows.length) throw new Error('数据集没有 rows');

// 取第一行的 source_url（同一数据集应指向同一来源）
const url = rows[0].source_url;
if (!url) throw new Error('第一行没有 source_url');
const html = await loadHtml(url);
const tables = parseTables(html);
console.log(`解析到 ${tables.length} 个表格`);

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const num = (s) => {
  const m = String(s).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

let pass = 0;
const fails = [];

for (const row of rows) {
  const id = String(row.gas_mark ?? row.product ?? row.id ?? '?');
  const label = `${DATASET} 行 ${id}`;

  if (!row.quote || !row.source_url || !row.source || !row.checked_on) {
    fails.push(`${label}: 缺行级字段（quote/source_url/source/checked_on）`);
    continue;
  }

  const qCells = row.quote.split('|').map(norm);
  if (qCells.length < 2) {
    fails.push(`${label}: quote 少于 2 格，无法定位来源行`);
    continue;
  }
  const qId = qCells[0];

  // 在所有表格里找第一格等于 qId 的行
  let srcCells = null;
  for (const t of tables) {
    const hit = t.find((cells) => norm(cells[0]) === qId);
    if (hit) { srcCells = hit; break; }
  }
  if (!srcCells) {
    fails.push(`${label}: 来源页所有表格中都找不到第一格为 "${qId}" 的行`);
    continue;
  }

  // 逐格比对 quote 与来源
  const cellFails = [];
  const n = Math.max(qCells.length, srcCells.length);
  for (let i = 0; i < n; i++) {
    const a = qCells[i] ?? '(缺)';
    const b = norm(srcCells[i]) ?? '(缺)';
    // 表格里可能多一列（如 Description 后的备注），只比 quote 覆盖到的格
    if (i >= qCells.length) break;
    if (a !== b) cellFails.push(`第 ${i + 1} 格 quote="${a}" vs 来源="${b}"`);
  }

  // 数据集数值 vs quote 里的对应格（oven-conversions 约定：格 2=°F、格 3=°C）
  if (DATASET === 'oven-conversions') {
    const f = num(qCells[1]);
    const c = num(qCells[2]);
    if (f !== Number(row.conventional_f)) {
      cellFails.push(`conventional_f=${row.conventional_f} 但 quote 写 ${f}`);
    }
    if (c !== Number(row.conventional_c)) {
      cellFails.push(`conventional_c=${row.conventional_c} 但 quote 写 ${c}`);
    }
  }

  if (cellFails.length) fails.push(`${label}:\n    ` + cellFails.join('\n    '));
  else pass++;
}

console.log(`\n结果：${pass}/${rows.length} 行通过`);
if (fails.length) {
  console.error(`\n❌ ${fails.length} 行失败：`);
  for (const f of fails) console.error('  - ' + f);
  process.exit(1);
}
console.log('✅ 全部通过：quote 与来源页逐格一致，数据集数值与 quote 一致');
