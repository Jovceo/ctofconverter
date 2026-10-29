/**
 * 校验数据集的行级溯源：把每一行的 `quote` 与 `source_url` 实抓页面逐格比对。
 *
 * 为什么需要这个脚本：
 *   2026-10-29 补 quote 时，核对逻辑一度写在临时脚本里、用完就删。
 *   按「可复算」纪律，判据必须能被人重新跑一遍——否则以后没人能证明这些 quote 不是编的。
 *
 * 它做什么：
 *   1. 实抓 `source_url`（默认走 HTTPS_PROXY）
 *   2. 解析页面里的表格（HTML <table>，或经文本抽取通道得到的 markdown 表格）
 *   3. 对数据集的每一行：
 *      - 按 quote 首格定位来源行
 *      - 逐格比对 quote 与来源页原文
 *      - 比对数据集数值与 quote 里的对应格
 *   4. 任何一处不一致 → 打印明细并 exit 1（不是警告，是失败）
 *
 * 用法：
 *   npm run verify:datasets
 *   node scripts/verify-dataset-quotes.mjs --dataset safe-internal-temperatures --via jina
 *   node scripts/verify-dataset-quotes.mjs --offline docs/data/xxx.html
 *
 * --via jina：
 *   部分来源（如 fsis.usda.gov）对非浏览器客户端返回 403（Akamai 级），curl / https.request
 *   直连与走代理都是 403。此时用文本抽取通道 `https://r.jina.ai/<url>` 取页面 markdown，
 *   再解析其中的表格。**这不是绕过事实核查，而是换一种方式读同一页**——数值仍逐格比对。
 *
 * 注意（两个实现坑，都踩过）：
 *   - 不要用 fetch：undici 不读 HTTPS_PROXY，在需要代理的环境里必 connect timeout。
 *   - 不要无差别删 <sup> 去引用角标：Wikipedia 的分数 1⁄4 是 <sup>1</sup>⁄<sub>4</sub> 排的，
 *     全删会删掉分子。只删 class="reference" 的角标，并把 U+2044（⁄）归一成 /。
 */

import fs from 'node:fs';
import path from 'node:path';
import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const arg = (n, d = null) => {
  const i = process.argv.indexOf('--' + n);
  return i === -1 ? d : process.argv[i + 1] ?? d;
};
const flag = (n) => process.argv.includes('--' + n);

const DATASET = arg('dataset', 'oven-conversions');
const OFFLINE = arg('offline', null);
const VIA = arg('via', null); // 'jina' = 走文本抽取通道
const FILE = path.join('config', 'datasets', `${DATASET}.json`);

// ---------- 抓取 ----------
function httpGet(url, proxy, ua) {
  return new Promise((resolve, reject) => {
    const opts = {
      headers: {
        'User-Agent': ua,
        'Accept-Language': 'en-US,en;q=0.9',
        Accept: 'text/html,application/xhtml+xml,text/plain',
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
      res.on('end', () => resolve({ status: res.statusCode, body: buf }));
    });
    req.on('timeout', () => req.destroy(new Error('请求超时')));
    req.on('error', reject);
  });
}

const UA_BROWSER =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
// r.jina.ai 会拒绝浏览器 UA（Chrome UA → 403，默认 UA → 200），必须用非浏览器 UA。
const UA_PLAIN = 'seo-data-verify/1.0 (+https://ctofconverter.com)';

async function loadSource(url) {
  if (OFFLINE) {
    console.log(`[offline] 使用归档文件: ${OFFLINE}`);
    return fs.readFileSync(OFFLINE, 'utf8');
  }
  const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
  const target = VIA === 'jina' ? `https://r.jina.ai/${url}` : url;
  const ua = VIA === 'jina' ? UA_PLAIN : UA_BROWSER;
  console.log(`抓取 ${target}${proxy ? `（经代理 ${proxy}）` : '（直连）'}`);
  const { status, body } = await httpGet(target, proxy, ua);
  console.log(`  HTTP ${status}，${body.length} 字符`);
  return body;
}

// ---------- 解析表格 ----------
const stripTags = (s) =>
  s
    .replace(/<sup[^>]*class="[^"]*reference[^"]*"[^>]*>[\s\S]*?<\/sup>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&#160;|&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/\u2044/g, '/')
    .replace(/\s*\/\s*/g, '/')
    .replace(/\s+/g, ' ')
    .trim();

function parseHtmlTables(html) {
  const tables = html.match(/<table[\s\S]*?<\/table>/g) || [];
  return tables.map((t) => {
    const rows = t.match(/<tr[\s\S]*?<\/tr>/g) || [];
    return rows.map((r) => {
      const cells = r.match(/<t[hd][\s\S]*?<\/t[hd]>/g) || [];
      return cells.map(stripTags);
    });
  });
}

/** 解析 markdown 表格：连续以 | 开头的行 */
function parseMarkdownTables(md) {
  const lines = md.split(/\r?\n/);
  const tables = [];
  let cur = null;
  for (const line of lines) {
    if (/^\s*\|/.test(line)) {
      const cells = line.replace(/^\s*\|/, '').replace(/\|\s*$/, '').split('|').map((c) => c.trim());
      if (cells.every((c) => /^:?-{2,}:?$/.test(c))) continue; // 分隔行
      if (!cur) { cur = []; tables.push(cur); }
      cur.push(cells);
    } else if (cur) {
      cur = null;
    }
  }
  return tables.filter((t) => t.length >= 2);
}

const norm = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();
const num = (s) => {
  const m = String(s).match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : NaN;
};

// ---------- 主流程 ----------
const doc = JSON.parse(fs.readFileSync(FILE, 'utf8'));
const rows = doc.rows || [];
if (!rows.length) throw new Error('数据集没有 rows');

const url = rows[0].source_url;
if (!url) throw new Error('第一行没有 source_url');
const body = await loadSource(url);
const tables = VIA === 'jina' ? parseMarkdownTables(body) : parseHtmlTables(body);
console.log(`解析到 ${tables.length} 个表格`);

let pass = 0;
const fails = [];

for (const row of rows) {
  const id = String(row.gas_mark ?? row.product ?? row.id ?? '?');
  const label = `${DATASET} 行 ${id.slice(0, 48)}`;

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

  let srcCells = null;
  for (const t of tables) {
    const hit = t.find((cells) => norm(cells[0]) === qId);
    if (hit) { srcCells = hit; break; }
  }
  if (!srcCells) {
    fails.push(`${label}: 来源页所有表格中都找不到第一格为 "${qId}" 的行`);
    continue;
  }

  const cellFails = [];
  for (let i = 0; i < qCells.length; i++) {
    const a = qCells[i];
    const b = norm(srcCells[i]) ?? '(缺)';
    if (a !== b) cellFails.push(`第 ${i + 1} 格 quote="${a}" vs 来源="${b}"`);
  }

  // 数据集数值 vs quote 里的对应格
  if (DATASET === 'oven-conversions') {
    const f = num(qCells[1]);
    const c = num(qCells[2]);
    if (f !== Number(row.conventional_f)) cellFails.push(`conventional_f=${row.conventional_f} 但 quote 写 ${f}`);
    if (c !== Number(row.conventional_c)) cellFails.push(`conventional_c=${row.conventional_c} 但 quote 写 ${c}`);
  } else if (DATASET === 'safe-internal-temperatures') {
    const t = qCells[1] || '';
    const f = Number((t.match(/(\d+(?:\.\d+)?)\s*degrees F/) || [])[1]);
    const cM = t.match(/\((\d+(?:\.\d+)?)\s*degrees C\)/);
    const c = cM ? Number(cM[1]) : NaN;
    if (f !== Number(row.min_fahrenheit)) cellFails.push(`min_fahrenheit=${row.min_fahrenheit} 但 quote 写 ${f}`);
    if (!Number.isNaN(c) && c !== Number(row.min_celsius)) {
      cellFails.push(`min_celsius=${row.min_celsius} 但 quote 写 ${c}`);
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
