/**
 * bing-inindex.mjs — Bing InIndex 每日监控（方案 0.7④）
 *
 * 为什么：0.5 的「迁移消除重复 URL 形态」这个杠杆是否成立，唯一硬指标是
 *   Bing 索引量 InIndex 是否止跌回升。10-07/10-08 已跌到 2 页（基线）。
 *   若迁完 175 之后 InIndex 仍趴着不动 → 该杠杆不成立，0.5 的 20 页要重新评估。
 *
 * 判读：
 *   - InIndex 回升 → 迁移路径有效，继续按 170 → 230 → 105 → 44 做
 *   - InIndex 仍 ≤2  → 暂停写作投入，回方案 §六 重新排序
 *
 * 用法：
 *   node scripts/bing-inindex.mjs              # 打印最近 14 天 + 与基线对比
 *   node scripts/bing-inindex.mjs --archive    # 同时归档到 docs/data/
 *   HTTPS_PROXY=http://127.0.0.1:20890 node scripts/bing-inindex.mjs   # 需要代理时
 *
 * 依赖：Bing Webmaster API key（默认读 E:/工具/seo-data-pull-tool/config/credentials.json
 *   的 bing_api_key；可用环境变量 BING_CRED 覆盖路径）。只读，不改站点。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const CRED = process.env.BING_CRED || 'E:/工具/seo-data-pull-tool/config/credentials.json';
const SITE = 'https://ctofconverter.com/';
const BASELINE = { date: '2026-10-08', inIndex: 2 };

const key = JSON.parse(fs.readFileSync(CRED, 'utf8')).bing_api_key;
if (!key) { console.error('bing_api_key not found in', CRED); process.exit(1); }

const url = `https://ssl.bing.com/webmaster/api.svc/json/GetCrawlStats?siteUrl=${encodeURIComponent(SITE)}&apikey=${encodeURIComponent(key)}`;
const res = await fetch(url);
if (!res.ok) { console.error('HTTP', res.status, await res.text().catch(() => '')); process.exit(1); }
const body = await res.json();
const rows = body.d || body;
if (!Array.isArray(rows)) { console.error('unexpected shape:', Object.keys(body)); process.exit(1); }

const fmt = ms => new Date(ms).toISOString().slice(0, 10);
const series = rows.map(r => ({
  date: fmt(Number(String(r.Date).replace(/[^0-9]/g, ''))),
  inIndex: r.InIndex,
  crawled: r.CrawledPages,
  code2xx: r.Code2xx,
  code301: r.Code301,
  errors: r.CrawlErrors,
})).sort((a, b) => a.date.localeCompare(b.date));

const recent = series.slice(-14);
console.log(`Bing InIndex 监控（${SITE}）`);
console.log(`基线：${BASELINE.date} = ${BASELINE.inIndex} 页\n`);
console.log('date        InIndex  Crawled  2xx   301  errors');
for (const r of recent) {
  console.log(`${r.date}  ${String(r.inIndex).padStart(7)}  ${String(r.crawled).padStart(7)}  ${String(r.code2xx).padStart(4)}  ${String(r.code301).padStart(4)}  ${String(r.errors).padStart(6)}`);
}

const last = series[series.length - 1];
console.log('');
if (last.inIndex > BASELINE.inIndex) {
  console.log(`✅ 回升：${last.date} = ${last.inIndex} > 基线 ${BASELINE.inIndex} → 迁移路径有效，可继续 0.5`);
} else {
  console.log(`⚠️  仍持平/更低：${last.date} = ${last.inIndex} ≤ 基线 ${BASELINE.inIndex} → 杠杆未验证，暂停写作投入、回方案 §六 重排`);
}

if (process.argv.includes('--archive')) {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const out = path.join(ROOT, 'docs', 'data', `${stamp}__bing_live_api__GetCrawlStats.json`);
  fs.writeFileSync(out, JSON.stringify(series, null, 1));
  console.log(`\n已归档 → ${path.relative(ROOT, out)}`);
}
