// T5 URL 台账生成：GSC 12个月 + Bing Site Explorer(8/20) + URL Inspection 状态 + 仓库结构 → 处置决定
const fs = require('fs');
const path = require('path');

const ROOT = 'E:/github/ctofconverter';
const DATA_DIR = 'E:/工具/SEO数据拉取工具/data/ctofconverter.com';
const BING_EXPORT = 'E:/Zcode数据存储文件夹/.zcode/tmp/paste-attachments/2026-08-20/pasted-text-20260820-140737-c3a78a86.txt';
const OUT = path.join(ROOT, 'docs/数据分析/url-ledger.csv');

// v2.2 批次映射（slug → 批次）
const BATCH = {
  '200-c-to-f': '批1a-精做(标题已修,正文待重写)', '45-c-to-f': '批1a-精做',
  '230-c-to-f': '批1b-精做', '210-c-to-f': '批1b-精做', '175-c-to-f': '批1c-单独验收',
  '60-c-to-f': '批2-精做', '120-c-to-f': '批2-精做', '48-c-to-f': '批2-精做',
  '220-c-to-f': '批2-精做', '190-c-to-f': '批2-精做', '105-c-to-f': '批2-精做',
  '110-f-to-c': '批3A-F→C', '103-f-to-c': '批3A-F→C', '100-f-to-c': '批3A-F→C',
  '190-f-to-c': '批3A-F→C', '39-f-to-c': '批3A-F→C',
  '36-9-c-to-f': '批3B-体温', '36-7-c-to-f': '批3B-体温', '36-5-c-to-f': '批3B-体温',
  '38-4-c-to-f': '批3B-体温', '37-6-c-to-f': '批3B-体温',
  '44-c-to-f': '批4-观察', '76-c-to-f': '批4-观察', '90-c-to-f': '批4-观察', '150-c-to-f': '批4-观察',
  '170-c-to-f': 'Phase2-精做',
};
const QUALITY = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/quality-pages.json'), 'utf8')).qualityPages;
const MIGRATED = JSON.parse(fs.readFileSync(path.join(ROOT, 'config/migrated-routes.json'), 'utf8'));
// URL Inspection 已核状态（8/20）
const INSPECTED = {
  '/': '已发现未爬网', '/175-c-to-f.html': '已索引(压制)', '/175-c-to-f': '已阻止(404)',
  '/200-c-to-f': '已发现未爬网', '/200-c-to-f.html': '已发现未爬网',
  '/fan-oven-conversion-chart': '已索引(压制)', '/celsius-to-fahrenheit-chart': '已发现未爬网',
  '/36-4-c-to-f': '已发现未爬网', '/body-temperature-chart-fever-guide': '已索引(压制)',
};

// 1. 仓库 URL 集
const nextPages = fs.readdirSync(path.join(ROOT, 'pages')).filter(f => f.endsWith('.tsx'))
  .map(f => f.replace('.tsx', ''))
  .filter(s => !['_app', '_document', '_error', '404'].includes(s));
const nextUrls = new Set(nextPages.map(s => '/' + (s === 'index' ? '' : s)));
const htmlFiles = fs.readdirSync(path.join(ROOT, 'public')).filter(f => f.endsWith('.html'));
const migratedSet = new Set(MIGRATED.htmlRoutes);
const indexHtmlSet = new Set(MIGRATED.indexHtmlRoutes);

// 2. GSC 页面级聚合（12 个月）
const gscFile = fs.readdirSync(DATA_DIR).find(x => x.includes('gsc_query_page'));
const gsc = JSON.parse(fs.readFileSync(path.join(DATA_DIR, gscFile), 'utf8'));
const gscAgg = new Map();
for (const r of gsc.data) {
  const p = r.page.replace('https://ctofconverter.com', '') || '/';
  if (!gscAgg.has(p)) gscAgg.set(p, { i: 0, c: 0, pw: 0 });
  const o = gscAgg.get(p); o.i += r.impressions; o.c += r.clicks; o.pw += r.position * r.impressions;
}

// 3. Bing 导出（107 行）
const bing = new Map();
if (fs.existsSync(BING_EXPORT)) {
  fs.readFileSync(BING_EXPORT, 'utf8').split('\n').slice(2).forEach(l => {
    const m = l.match(/^(https?:\/\/\S+)\t(\d+)\t(\d+)\t([^\t]*)\t([^\t]*)\t(\d+)\t(\d+)\t(\d+)/);
    if (!m) return;
    const url = m[1].replace('https://ctofconverter.com', '') || '/';
    bing.set(url, { imps: +m[2], clicks: +m[3], lastCrawl: m[4], http: +m[6], links: +m[8] });
  });
}

// 4. 合成行
const rows = [];
const slugOf = (u) => u.replace(/^\//, '').replace(/\.html$/, '').replace(/\/$/, '');
const seen = new Set();
function addRow(url, type) {
  if (seen.has(url)) return; seen.add(url);
  const g = gscAgg.get(url);
  const b = bing.get(url);
  const slug = slugOf(url);
  const isHtml = url.endsWith('.html');
  const isLocale = /^\/[a-z]{2}(-br)?\//.test(url) || /^\/(zh|es|ja|fr|de|hi|id|ar|pt-br)$/.test(url);
  let disposition = '', batch = '';
  if (QUALITY.includes(slug)) { disposition = '质量页-维护'; batch = BATCH[slug] || ''; }
  else if (isLocale) { disposition = '语言页-保留不动'; }
  else if (b && [301, 308].includes(b.http) && !isHtml) { disposition = '历史重定向-保持现状'; }
  else if (b && b.http === 404) { disposition = '404-外部指向,保持现状'; }
  else if (BATCH[slug] && !isHtml) { disposition = '待精做'; batch = BATCH[slug]; }
  else if (isHtml && !migratedSet.has(slug)) {
    const gImps = g ? g.i : 0, bClicks = b ? b.clicks : 0;
    if (gImps >= 100 || bClicks >= 1) { disposition = '待精做(先建新页再301)'; batch = BATCH[slug] || '按数据补批'; }
    else if (gImps === 0 && bClicks === 0 && (!b || b.imps === 0)) { disposition = '瘦身候选-批1'; }
    else { disposition = '低价值-观察'; }
  } else if (migratedSet.has(slug) && isHtml) { disposition = '已迁移-301正常'; }
  else if (nextUrls.has(url) || url === '/') { disposition = g && g.i >= 100 ? 'Next页-维护' : 'Next页-观察'; }
  else if (isHtml) { disposition = '仅旧HTML-观察'; }
  else { disposition = '其他'; }
  rows.push({
    url, type,
    gsc_impressions: g ? g.i : 0, gsc_avg_pos: g && g.i ? (g.pw / g.i).toFixed(1) : '',
    gsc_clicks: g ? g.c : 0,
    bing_imps_30d: b ? b.imps : 0, bing_clicks: b ? b.clicks : 0,
    bing_last_crawl: b ? b.lastCrawl : '', bing_http: b ? b.http : '',
    bing_index_state: INSPECTED[url] || '', backlinks: b ? b.links : 0,
    disposition, batch,
  });
}
for (const u of nextUrls) addRow(u, 'next');
for (const f of htmlFiles) addRow('/' + f, 'html');
for (const u of bing.keys()) if (!seen.has(u)) addRow(u, bing.get(u).http >= 301 ? 'redirect/404' : 'other');
for (const u of gscAgg.keys()) if (!seen.has(u)) addRow(u, 'gsc-only');

// 5. 输出 CSV（UTF-8 BOM 方便 Excel）
const header = ['url', 'type', 'gsc_impressions', 'gsc_avg_pos', 'gsc_clicks', 'bing_imps_30d', 'bing_clicks_30d', 'bing_last_crawl', 'bing_http', 'bing_index_state', 'backlinks', 'disposition', 'batch'];
const csv = '\ufeff' + header.join(',') + '\n' + rows.map(r => header.map(h => String(r[h]).includes(',') ? `"${r[h]}"` : r[h]).join(',')).join('\n');
fs.writeFileSync(OUT, csv, 'utf8');

// 汇总
const byDisp = {};
rows.forEach(r => byDisp[r.disposition] = (byDisp[r.disposition] || 0) + 1);
console.log('总行数:', rows.length, '→', OUT);
Object.entries(byDisp).sort((a, b) => b[1] - a[1]).forEach(([k, n]) => console.log(String(n).padStart(4), k));
const batch1 = rows.filter(r => r.disposition === '瘦身候选-批1');
console.log('\n瘦身批1候选(前20):');
batch1.slice(0, 20).forEach(r => console.log(' ', r.url));
