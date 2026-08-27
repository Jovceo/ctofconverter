#!/usr/bin/env node
/**
 * 把 config/datasets/*.json 发布成站点静态文件：
 *   public/data/<id>.json      —— 完整数据集（含 provenance / columns / rows）
 *   public/data/<id>.csv        —— 同数据的 CSV（RFC 4180 引号规则，CRLF）
 *   public/data/manifest.json   —— 清单 + 用法
 *   public/data/index.html      —— 浏览器里可直接看的目录页（也方便「贴链接给人看」）
 *
 * 为什么要有这一步：数据只维护一份（config/datasets/），页面、API、下载文件不可能不一致。
 * prebuild 自动运行；改了数据记得跑 `npm run generate:datasets`。
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const SRC = path.join(ROOT, 'config', 'datasets');
const OUT = path.join(ROOT, 'public', 'data');

const SITE = 'https://ctofconverter.com';

function readJson(file) {
  let raw = fs.readFileSync(file, 'utf8');
  // PS 的 Set-Content -Encoding UTF8 会写 BOM；JSON.parse 不接受。
  if (raw.charCodeAt(0) === 0xfeff) raw = raw.slice(1);
  return JSON.parse(raw);
}

function toCsv(dataset) {
  const cols = (dataset.columns || []).filter((c) => c.export !== false);
  const esc = (v) => {
    if (v === null || v === undefined) return '';
    const s = String(v);
    return /[",\r\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const header = (col) => esc(col.label || col.key) + (col.unit ? ` (${col.unit})` : '');
  const lines = [cols.map(header).join(',')];
  (dataset.rows || []).forEach((row) => lines.push(cols.map((c) => esc(row[c.key])).join(',')));
  return `${lines.join('\r\n')}\r\n`;
}

function main() {
  if (!fs.existsSync(SRC)) {
    console.log('[datasets] no config/datasets directory, skipping');
    return;
  }
  const files = fs.readdirSync(SRC).filter((f) => f.endsWith('.json'));
  const datasets = files.map((f) => {
    const d = readJson(path.join(SRC, f));
    if (!d.id) throw new Error(`[datasets] ${f} 缺少 id 字段`);
    if (!Array.isArray(d.provenance) || d.provenance.length === 0) {
      throw new Error(`[datasets] ${d.id} 没有 provenance，禁止发布未核查来源的数据`);
    }
    if (!Array.isArray(d.rows) || d.rows.length === 0) {
      throw new Error(`[datasets] ${d.id} 没有 rows`);
    }
    return d;
  });

  fs.mkdirSync(OUT, { recursive: true });

  datasets.forEach((d) => {
    fs.writeFileSync(path.join(OUT, `${d.id}.json`), `${JSON.stringify(d, null, 2)}\n`, 'utf8');
    fs.writeFileSync(path.join(OUT, `${d.id}.csv`), toCsv(d), 'utf8');
  });

  const manifest = {
    name: 'ctofconverter reference datasets',
    homepage: `${SITE}/data-api`,
    license: 'CC-BY-4.0',
    updated: new Date().toISOString().slice(0, 10),
    api: {
      index: `${SITE}/api/ref`,
      dataset: `${SITE}/api/ref/{id}`,
      csv: `${SITE}/api/ref/{id}?format=csv`,
      lookup: `${SITE}/api/ref/lookup?value=180&unit=c&context=oven`,
    },
    embed: `<script src="${SITE}/embed/ref-chart.js" data-set="oven-conversions"></script>`,
    datasets: datasets.map((d) => ({
      id: d.id,
      title: d.title,
      description: d.description,
      version: d.version,
      updated: d.updated,
      license: d.license,
      attribution: d.attribution,
      rows: d.rows.length,
      columns: (d.columns || []).map((c) => c.key),
      files: { json: `${SITE}/data/${d.id}.json`, csv: `${SITE}/data/${d.id}.csv` },
      page: `${SITE}${d.page || '/'}`,
      provenance: d.provenance,
      disclaimer: d.disclaimer || null,
    })),
  };
  fs.writeFileSync(path.join(OUT, 'manifest.json'), `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');
  fs.writeFileSync(path.join(OUT, 'index.html'), renderIndex(manifest), 'utf8');

  console.log(`[datasets] published ${datasets.length} datasets -> public/data/`);
  datasets.forEach((d) => {
    console.log(`           ${d.id}: ${d.rows.length} rows, ${d.columns.length} cols`);
  });
}

function renderIndex(m) {
  const esc = (s) => String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  const cards = m.datasets
    .map(
      (d) => `  <section class="ds">
    <h2><a href="${esc(d.page)}">${esc(d.title)}</a></h2>
    <p>${esc(d.description)}</p>
    <p class="meta">${d.rows} rows · v${esc(d.version)} · updated ${esc(d.updated)} · ${esc(d.license)}</p>
    <p class="files"><a href="/data/${esc(d.id)}.json">JSON</a> · <a href="/data/${esc(d.id)}.csv">CSV</a> · <a href="/api/ref/${esc(d.id)}">API</a> · <a href="/api/ref/${esc(d.id)}?format=csv">API→CSV</a></p>
    <p class="attr">Attribution: ${esc(d.attribution)}</p>
    <details><summary>Columns</summary><ul>${d.columns.map((c) => `<li><code>${esc(c)}</code></li>`).join('')}</ul></details>
    <details><summary>Sources &amp; verification</summary><ul>${d.provenance
        .map((p) => `<li>${esc(p.source)} — ${p.url ? `<a href="${esc(p.url)}">${esc(p.url)}</a>` : ''} (checked ${esc(p.checkedOn)})${p.note ? ` — ${esc(p.note)}` : ''}</li>`)
        .join('')}</ul></details>
    ${d.disclaimer ? `<p class="disc">${esc(d.disclaimer)}</p>` : ''}
  </section>`
    )
    .join('\n');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<title>Reference datasets | ctofconverter</title>
<meta name="robots" content="index, follow" />
<link rel="canonical" href="${m.homepage}" />
<style>
:root { color-scheme: light dark } body { font: 16px/1.6 system-ui, sans-serif; max-width: 46rem; margin: 2.5rem auto; padding: 0 1rem }
h1 { font-size: 1.6rem } .ds { border-top: 1px solid #9994; padding: 1.2rem 0 } .meta, .attr, .disc { font-size: .85rem; opacity: .85 }
.disc { background: #9992; padding: .6rem .8rem; border-radius: 6px } code { font-family: ui-monospace, Menlo, Consolas, monospace }
pre { overflow-x: auto; background: #9992; padding: .8rem; border-radius: 6px } a { color: inherit }
</style>
</head>
<body>
<h1>Reference datasets</h1>
<p>Machine-readable versions of the temperature tables we publish on
<a href="${esc(m.homepage)}">ctofconverter</a>. Free to use, including commercially, with attribution (CC-BY-4.0). No key, no rate-limit games, <code>Access-Control-Allow-Origin: *</code>.</p>
<pre>curl ${esc(m.api.index)}</pre>
${cards}
<p class="meta">Generated from <code>config/datasets/*.json</code>. Dataset list updated ${esc(m.updated)}.</p>
</body>
</html>
`;
}

main();
