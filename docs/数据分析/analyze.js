// SEO 数据分析脚本：读取 12 个月 GSC/GA4/Bing 数据，输出结构化分析 JSON
const fs = require('fs');
const path = require('path');

const DATA_DIR = 'E:\\工具\\SEO数据拉取工具\\data\\ctofconverter.com';
const OUT_DIR = path.join(__dirname, 'out');

function loadFiles() {
  const files = fs.readdirSync(DATA_DIR);
  const pick = (tag) => files.find((f) => f.includes(tag));
  return {
    gscQP: JSON.parse(fs.readFileSync(path.join(DATA_DIR, pick('gsc_query_page')), 'utf8')),
    gscDQ: JSON.parse(fs.readFileSync(path.join(DATA_DIR, pick('gsc_date_query')), 'utf8')),
    ga4: JSON.parse(fs.readFileSync(path.join(DATA_DIR, pick('ga4')), 'utf8')),
    bing: JSON.parse(fs.readFileSync(path.join(DATA_DIR, pick('bing')), 'utf8')),
  };
}

function fmt(n) {
  if (n === null || n === undefined || isNaN(n)) return n;
  return Math.round(n * 100) / 100;
}

function analyze() {
  const { gscQP, gscDQ, ga4, bing } = loadFiles();
  fs.mkdirSync(OUT_DIR, { recursive: true });
  const R = {}; // result

  // ============ 1. GSC 总览（query_page 聚合） ============
  const qAgg = new Map(); // query -> {clicks, imps, posSum(weighted), n}
  const pAgg = new Map(); // page -> same
  const qpPair = new Map(); // query|page -> same
  for (const r of gscQP.data) {
    const q = r.query, p = r.page.replace('https://ctofconverter.com', '') || '/';
    for (const [key, map] of [[q, qAgg], [p, pAgg], [q + '|' + p, qpPair]]) {
      if (!map.has(key)) map.set(key, { clicks: 0, imps: 0, posW: 0 });
      const o = map.get(key);
      o.clicks += r.clicks; o.imps += r.impressions; o.posW += r.position * r.impressions;
    }
  }
  const toArr = (map) =>
    [...map.entries()].map(([k, v]) => ({
      key: k, clicks: v.clicks, imps: v.imps,
      avgPos: v.imps > 0 ? fmt(v.posW / v.imps) : null, ctr: v.imps > 0 ? fmt((v.clicks / v.imps) * 100) : 0,
    }));
  const qArr = toArr(qAgg).sort((a, b) => b.clicks - a.clicks);
  const pArr = toArr(pAgg).sort((a, b) => b.clicks - a.clicks);

  R.gsc = {
    range: gscDQ.data.length ? `${gscDQ.data[0].date} ~ ${gscDQ.data[gscDQ.data.length - 1].date}` : '',
    totalQueries: qArr.length,
    totalPagesWithTraffic: pArr.length,
    totalClicks: qArr.reduce((s, x) => s + x.clicks, 0),
    totalImpressions: qArr.reduce((s, x) => s + x.imps, 0),
  };
  R.gsc.avgCtr = fmt((R.gsc.totalClicks / R.gsc.totalImpressions) * 100);

  // top 查询/页面
  R.topQueries = qArr.slice(0, 100);
  R.topPages = pArr.slice(0, 60);

  // 排名分布（按曝光加权）：top3 / 4-10 / 11-20 / 21-50 / 51+
  const posBuckets = { 'top3': { q: 0, clicks: 0, imps: 0 }, '4-10': { q: 0, clicks: 0, imps: 0 }, '11-20': { q: 0, clicks: 0, imps: 0 }, '21-50': { q: 0, clicks: 0, imps: 0 }, '51+': { q: 0, clicks: 0, imps: 0 } };
  for (const q of qArr) {
    const b = q.avgPos <= 3 ? 'top3' : q.avgPos <= 10 ? '4-10' : q.avgPos <= 20 ? '11-20' : q.avgPos <= 50 ? '21-50' : '51+';
    posBuckets[b].q++; posBuckets[b].clicks += q.clicks; posBuckets[b].imps += q.imps;
  }
  R.posBuckets = posBuckets;

  // 机会词：曝光 >= 200 且排名 5-20（往前推就有流量）
  R.opportunity = qArr
    .filter((q) => q.avgPos >= 4.5 && q.avgPos <= 20 && q.imps >= 200)
    .sort((a, b) => b.imps - a.imps).slice(0, 50);

  // 高曝光低排名（内容缺口）：曝光 >= 500 且排名 > 20
  R.gapQueries = qArr
    .filter((q) => q.avgPos > 20 && q.imps >= 500)
    .sort((a, b) => b.imps - a.imps).slice(0, 50);

  // 排名好但 CTR 低（<2%，pos<=8，imps>=300）：标题/描述优化
  R.lowCtr = qArr
    .filter((q) => q.avgPos <= 8 && q.imps >= 300 && q.ctr < 2)
    .sort((a, b) => b.imps - a.imps).slice(0, 30);

  // ============ 2. 月度趋势（date_query） ============
  const monthAgg = new Map();
  for (const r of gscDQ.data) {
    const m = r.date.slice(0, 7);
    if (!monthAgg.has(m)) monthAgg.set(m, { clicks: 0, imps: 0, posW: 0 });
    const o = monthAgg.get(m);
    o.clicks += r.clicks; o.imps += r.impressions; o.posW += r.position * r.impressions;
  }
  R.monthly = [...monthAgg.entries()]
    .sort((a, b) => a[0].localeCompare(b[0]))
    .map(([m, v]) => ({ month: m, clicks: v.clicks, imps: v.imps, avgPos: v.imps ? fmt(v.posW / v.imps) : null, ctr: v.imps ? fmt((v.clicks / v.imps) * 100) : 0 }));

  // 近3月 vs 前3月 查询级增长
  const months = R.monthly.map((x) => x.month);
  const recent3 = months.slice(-3), prev3 = months.slice(-6, -3);
  const qMonth = new Map(); // query -> {month -> clicks}
  for (const r of gscDQ.data) {
    const m = r.date.slice(0, 7);
    if (!qMonth.has(r.query)) qMonth.set(r.query, {});
    const o = qMonth.get(r.query);
    o[m] = (o[m] || 0) + r.clicks;
  }
  const rising = [], falling = [];
  for (const [q, mm] of qMonth) {
    const r3 = recent3.reduce((s, m) => s + (mm[m] || 0), 0);
    const p3 = prev3.reduce((s, m) => s + (mm[m] || 0), 0);
    if (r3 + p3 < 20) continue;
    const diff = r3 - p3;
    if (diff >= 8) rising.push({ query: q, recent3: r3, prev3: p3, diff });
    if (diff <= -8) falling.push({ query: q, recent3: r3, prev3: p3, diff });
  }
  R.risingQueries = rising.sort((a, b) => b.diff - a.diff).slice(0, 30);
  R.fallingQueries = falling.sort((a, b) => a.diff - b.diff).slice(0, 30);

  // ============ 3. GA4 ============
  const g = ga4.data;
  const gMonth = new Map(), gChannel = new Map(), gCountry = new Map(), gDevice = new Map();
  let totSessions = 0, totUsers = 0, totViews = 0, durW = 0, durN = 0, brW = 0, brN = 0;
  for (const r of g) {
    const m = r.date.slice(0, 4) + '-' + r.date.slice(4, 6);
    const s = +r.sessions;
    totSessions += s; totUsers += +r.totalUsers; totViews += +r.screenPageViews;
    if (r.averageSessionDuration) { durW += r.averageSessionDuration * s; durN += s; }
    if (r.bounceRate !== undefined && r.bounceRate !== null && r.bounceRate !== '') { brW += r.bounceRate * s; brN += s; }
    const add = (map, k) => { if (!map.has(k)) map.set(k, { sessions: 0, users: 0, views: 0 }); const o = map.get(k); o.sessions += s; o.users += +r.totalUsers; o.views += +r.screenPageViews; };
    add(gMonth, m); add(gChannel, r.sessionDefaultChannelGroup); add(gCountry, r.country); add(gDevice, r.deviceCategory);
  }
  const mk = (map) => [...map.entries()].map(([k, v]) => ({ key: k, ...v })).sort((a, b) => b.sessions - a.sessions);
  R.ga4 = {
    totalSessions: totSessions, totalUsers: totUsers, totalPageviews: totViews,
    avgSessionDuration: durN ? fmt(durW / durN, 2) : null,
    avgBounceRate: brN ? fmt(brW / brN * 100, 2) : null,
    monthly: mk(gMonth).sort((a, b) => a.key.localeCompare(b.key)),
    channels: mk(gChannel), countries: mk(gCountry).slice(0, 15), devices: mk(gDevice),
  };

  // ============ 4. Bing ============
  const bd = bing.data;
  R.bing = {};
  if (bd.TrafficStats) R.bing.traffic = bd.TrafficStats;
  if (bd.TopKeywords) {
    const bk = new Map();
    for (const k of bd.TopKeywords) {
      if (!bk.has(k.Keyword)) bk.set(k.Keyword, { clicks: 0, imps: 0 });
      const o = bk.get(k.Keyword); o.clicks += k.Clicks; o.imps += k.Impressions;
    }
    R.bing.topKeywords = [...bk.entries()].map(([k, v]) => ({ keyword: k, ...v })).sort((a, b) => b.clicks - a.clicks).slice(0, 30);
    R.bing.totalClicks = bd.TopKeywords.reduce((s, k) => s + k.Clicks, 0);
    R.bing.totalImpressions = bd.TopKeywords.reduce((s, k) => s + k.Impressions, 0);
  }
  if (bd.TopPages) {
    const bp = new Map();
    for (const p of bd.TopPages) {
      if (!bp.has(p.Url)) bp.set(p.Url, { clicks: 0, imps: 0 });
      const o = bp.get(p.Url); o.clicks += p.Clicks; o.imps += p.Impressions;
    }
    R.bing.topPages = [...bp.entries()].map(([k, v]) => ({ page: k, ...v })).sort((a, b) => b.clicks - a.clicks).slice(0, 20);
  }
  if (bd.CrawlStats) R.bing.crawl = bd.CrawlStats;

  fs.writeFileSync(path.join(OUT_DIR, 'analysis.json'), JSON.stringify(R, null, 1), 'utf8');

  // 控制台摘要
  console.log('=== GSC 总览 ===');
  console.log(`${R.gsc.range} | 查询数 ${R.gsc.totalQueries} | 有流量页面 ${R.gsc.totalPagesWithTraffic}`);
  console.log(`Clicks ${R.gsc.totalClicks} | Impressions ${R.gsc.totalImpressions} | CTR ${R.gsc.avgCtr}%`);
  console.log('\n=== 月度趋势 ===');
  for (const m of R.monthly) console.log(`${m.month}  clicks=${String(m.clicks).padStart(5)}  imps=${String(m.imps).padStart(7)}  pos=${m.avgPos}  ctr=${m.ctr}%`);
  console.log('\n=== 排名分布（查询数/点击/曝光） ===');
  for (const [k, v] of Object.entries(posBuckets)) console.log(`${k.padEnd(6)} q=${String(v.q).padStart(5)} clicks=${String(v.clicks).padStart(6)} imps=${String(v.imps).padStart(8)}`);
  console.log('\n=== Top15 查询 ===');
  R.topQueries.slice(0, 15).forEach((q, i) => console.log(`${i + 1}. ${q.key}  clicks=${q.clicks} imps=${q.imps} pos=${q.avgPos} ctr=${q.ctr}%`));
  console.log('\n=== Top15 页面 ===');
  R.topPages.slice(0, 15).forEach((p, i) => console.log(`${i + 1}. ${p.key}  clicks=${p.clicks} imps=${p.imps} pos=${p.avgPos}`));
  console.log('\n=== 机会词 top15 (pos 5-20, imps>=200) ===');
  R.opportunity.slice(0, 15).forEach((q) => console.log(`${q.key}  imps=${q.imps} pos=${q.avgPos} clicks=${q.clicks}`));
  console.log('\n=== GA4 ===');
  console.log(`Sessions ${R.ga4.totalSessions} | Users ${R.ga4.totalUsers} | Views ${R.ga4.totalPageviews} | 时长 ${R.ga4.avgSessionDuration}s | 跳出 ${R.ga4.avgBounceRate}%`);
  console.log('渠道:', R.ga4.channels.map((c) => `${c.key}=${c.sessions}`).join(' | '));
  console.log('设备:', R.ga4.devices.map((c) => `${c.key}=${c.sessions}`).join(' | '));
  console.log('国家 top8:', R.ga4.countries.slice(0, 8).map((c) => `${c.key}=${c.sessions}`).join(' | '));
  console.log('\n=== Bing ===');
  console.log(`Clicks ${R.bing.totalClicks} | Imps ${R.bing.totalImpressions}`);
  console.log('\n=== 上升查询 top12 ===');
  R.risingQueries.slice(0, 12).forEach((q) => console.log(`${q.query}  prev3=${q.prev3} -> recent3=${q.recent3} (${q.diff > 0 ? '+' : ''}${q.diff})`));
  console.log('\n=== 下降查询 top12 ===');
  R.fallingQueries.slice(0, 12).forEach((q) => console.log(`${q.query}  prev3=${q.prev3} -> recent3=${q.recent3} (${q.diff})`));
}

analyze();
