#!/usr/bin/env node
/**
 * build-dataset-repo.mjs —— 生成「数据快照仓」open-temperature-data 的全部内容（staging）
 *
 * 设计依据（2026-11-11 裁定，方案 1）：
 *   · 数据唯一来源仍是本仓的 config/datasets/*.json → public/data/（构建时生成）
 *   · 数据仓只保存【发布快照】，逐字节拷贝自 public/data/，并用 MANIFEST.sha256 锁定
 *   · 漂移由数据仓自己的 CI 兜住（.github/workflows/sync.yml + scripts/sync-from-site.mjs），
 *     拉的是公开 URL，不需要跨仓 token，主仓冻结不受影响
 *
 * 本脚本只做「组装」，不产生任何新数值：
 *   node scripts/build-dataset-repo.mjs
 *   node scripts/build-dataset-repo.mjs --out=release/otd --repo-url=https://github.com/<owner>/open-temperature-data
 *
 * 强制检查：
 *   · 每个数据文件的 sha256 必须与 public/data/ 同名文件相同
 *   · 所有生成的文本文件不得含 CJK 字符（对外字符串只能英文）
 *   · 每个数据集必须有 license / provenance / rows，且每行有 source / source_url / quote / checked_on
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import process from 'node:process';

const ROOT = process.cwd();
const PUBLISHED = path.join(ROOT, 'public', 'data');
const DEFAULT_REPO = 'https://github.com/Jovceo/open-temperature-data';
const SITE = 'https://ctofconverter.com';
const SITE_REPO = 'https://github.com/Jovceo/ctofconverter';
const API = `${SITE}/data-api`;

let OUT = path.join(ROOT, 'release', 'open-temperature-data');
let REPO_URL = DEFAULT_REPO;

for (const raw of process.argv.slice(2)) {
    if (raw.startsWith('--out=')) OUT = path.resolve(ROOT, raw.slice('--out='.length));
    else if (raw.startsWith('--repo-url=')) REPO_URL = raw.slice('--repo-url='.length).replace(/\/$/, '');
    else {
        console.error(`unknown argument: ${raw}`);
        process.exit(1);
    }
}

const fail = (msg) => {
    console.error(`\n✗ ${msg}`);
    process.exit(1);
};
const readJson = (f) => JSON.parse(fs.readFileSync(f, 'utf8'));
const sha256 = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const write = (rel, content) => {
    const target = path.join(OUT, rel);
    fs.mkdirSync(path.dirname(target), { recursive: true });
    fs.writeFileSync(target, content, 'utf8');
};

const CJK = /[\u3000-\u303F\u3400-\u4DBF\u4E00-\u9FFF\uF900-\uFAFF\uFF00-\uFFEF]/;

// ---------------------------------------------------------------- 读取发布层

if (!fs.existsSync(path.join(PUBLISHED, 'manifest.json'))) {
    fail('public/data/manifest.json not found — run `npm run generate:datasets` first');
}

const manifest = readJson(path.join(PUBLISHED, 'manifest.json'));
const datasets = manifest.datasets.map((entry) => {
    const jsonPath = path.join(PUBLISHED, `${entry.id}.json`);
    const csvPath = path.join(PUBLISHED, `${entry.id}.csv`);
    if (!fs.existsSync(jsonPath) || !fs.existsSync(csvPath)) {
        fail(`missing published files for ${entry.id} — run \`npm run generate:datasets\``);
    }
    const data = readJson(jsonPath);
    if (!data.license || !Array.isArray(data.provenance) || data.provenance.length === 0) {
        fail(`${entry.id}: missing license or provenance block — refusing to publish`);
    }
    if (!Array.isArray(data.rows) || data.rows.length !== entry.rows) {
        fail(`${entry.id}: manifest says ${entry.rows} rows, file has ${data.rows?.length}`);
    }
    for (const [i, row] of data.rows.entries()) {
        for (const key of ['source', 'source_url', 'quote', 'checked_on']) {
            if (!row[key]) fail(`${entry.id} row ${i}: missing \`${key}\` — row-level provenance is a release requirement`);
        }
    }
    return { ...entry, data, jsonPath, csvPath };
});

const version = process.env.OTD_VERSION || new Date().toISOString().slice(0, 10).replace(/-/g, '.');
const head = (() => {
    try {
        return execSync('git rev-parse --short HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch {
        return null;
    }
})();

// ---------------------------------------------------------------- 组装

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'data'), { recursive: true });

// 1) 逐字节拷贝发布层（不重新序列化）
const copied = [];
if (fs.existsSync(path.join(PUBLISHED, 'manifest.json'))) {
    fs.copyFileSync(path.join(PUBLISHED, 'manifest.json'), path.join(OUT, 'data', 'manifest.json'));
    copied.push('data/manifest.json');
}
for (const d of datasets) {
    for (const name of [`${d.id}.json`, `${d.id}.csv`]) {
        fs.copyFileSync(path.join(PUBLISHED, name), path.join(OUT, 'data', name));
        copied.push(`data/${name}`);
    }
}

// 2) 数据字典（从 manifest 的 columns 直接生成，避免手抄漂移）
function dataDictionary(d) {
    const cols = d.data.columns || [];
    const rows = cols
        .map((c) => `| \`${c.key}\` | ${c.label} | ${c.unit || ''} | ${c.type || ''} |`)
        .join('\n');
    return [
        `### \`${d.id}\``,
        '',
        d.data.description || d.description || '',
        '',
        `- Rows: **${d.rows}** · Version: **${d.version}** · Last checked: **${d.updated}** · License: **${d.data.license}**`,
        `- Files: [\`${d.id}.json\`](./data/${d.id}.json) · [\`${d.id}.csv\`](./data/${d.id}.csv)`,
        '',
        '| Column | Meaning | Unit | Type |',
        '| --- | --- | --- | --- |',
        rows,
        '',
    ].join('\n');
}

function provenanceSection(d) {
    const items = d.data.provenance
        .map((p) => `- **${p.source}** — <${p.url}>${p.checkedOn ? ` · checked ${p.checkedOn}` : ''}${p.note ? `\n  - ${p.note}` : ''}`)
        .join('\n');
    return [`<details>`, `<summary><code>${d.id}</code> — ${d.data.provenance.length} source(s)</summary>`, '', items, '', `</details>`, ''].join('\n');
}

const totalRows = datasets.reduce((n, d) => n + d.rows, 0);
const ids = datasets.map((d) => d.id).sort();

const datasetTable = datasets
    .map((d) => `| [\`${d.id}\`](#${d.id}) | ${d.rows} | ${d.version} | ${d.updated} | JSON + CSV |`)
    .join('\n');

const readme = `# Open temperature reference datasets

Machine-readable temperature tables with row-level provenance: UK gas mark and oven conversions,
USDA safe minimum internal cooking temperatures, and human body temperature thresholds.

This repository is a **published snapshot** of the datasets served at
<${API}>. It exists so that the data can be cloned, forked, cited and archived
without depending on a website staying up.

- **${datasets.length} datasets, ${totalRows} rows.**
- **Every row states where it came from**: publishing body, URL, a verbatim fragment of the source
  text, and the date it was checked.
- **Disagreement is preserved, not averaged.** When two authorities publish different figures, both
  are kept and labelled. Bands that no authority publishes are deliberately absent.
- **Formats**: JSON (with column metadata, units and provenance) and RFC 4180 CSV, UTF-8 without BOM.
- **License**: data CC-BY-4.0, code MIT.

## Datasets

| Dataset | Rows | Version | Last checked | Formats |
| --- | --- | --- | --- | --- |
${datasetTable}

## Quick start

\`\`\`bash
git clone ${REPO_URL}.git
cd open-temperature-data
\`\`\`

Read the files directly, or use the read-only API (no key, no signup, CORS enabled):

\`\`\`bash
curl ${SITE}/data/manifest.json
curl ${SITE}/data/oven-conversions.json
curl "${SITE}/api/ref/oven-conversions?select=gas_mark,conventional_c,fan_c"
curl "${SITE}/api/ref/lookup?value=180&unit=c&context=oven"
\`\`\`

Embed a table on a page (dependency-free, no tracking):

\`\`\`html
<script src="${SITE}/embed/ref-chart.js" data-set="oven-conversions"></script>
\`\`\`

Docs for the API and the embed widget: <${API}>

## Data dictionary

${datasets.map(dataDictionary).join('\n')}
## Provenance

Each dataset carries a \`provenance\` array (who was read, at which URL, when, and what was
noted), and each row carries \`source\`, \`source_url\`, \`quote\` and \`checked_on\`. The site's CI
refuses to publish a dataset whose rows lack any of those fields, which is why you can audit any
number here without trusting this project.

${datasets.map(provenanceSection).join('\n')}
## How this repository stays in sync

The single source of truth is the \`config/datasets/\` directory of the
[ctofconverter](${SITE}) repository. The site's build generates
<${SITE}/data/*>, and this repository mirrors that published layer:

1. \`scripts/sync-from-site.mjs\` downloads \`manifest.json\` and every dataset file from
   <${SITE}/data/>.
2. It validates structure and provenance, compares the bytes with the files in \`data/\`, and
   rewrites them only if the published layer actually changed.
3. \`MANIFEST.sha256\` is regenerated, and \`SYNC-STATE.json\` records when the check last ran and
   what the result was. A scheduled GitHub Actions workflow (\`.github/workflows/sync.yml\`, weekly
   plus manual dispatch) commits that record on every run, and the dataset files themselves only
   when the site's published bytes actually changed.

A manual run is safe and idempotent:

\`\`\`bash
node scripts/sync-from-site.mjs           # pull + validate + write
node scripts/sync-from-site.mjs --check   # verify only, non-zero exit if out of sync
\`\`\`

Because drift is corrected by CI rather than by memory, a snapshot here cannot quietly diverge
from what the site serves. \`SYNC-STATE.json\` is the freshness signal: if \`lastChecked\` is more than
a few weeks old, the workflow itself has stopped — open the Actions tab and use **Run workflow**.
(GitHub disables scheduled workflows on long-inactive repositories; the weekly state commit exists
to prevent exactly that.)

## Versioning

Each dataset has its own \`version\` and \`updated\` date inside its file; a correction bumps both and
never rewrites history. Repository snapshots are labelled \`YYYY.MM.DD\` (\`${version}\` for the initial
import), and any change lands as a commit with the diff visible.

## Citation

See [\`CITATION.cff\`](./CITATION.cff). A DOI will be minted from a Zenodo release; until one
exists, cite the repository and the snapshot version:

\`\`\`
Open temperature reference datasets (${version}). ${REPO_URL}
\`\`\`

Always cite the authorities named in each dataset's provenance block as well. These files are a
curation layer over their work, not a replacement for it.

## License

- **Data** (\`data/*.json\`, \`data/*.csv\`, \`data/manifest.json\`): CC-BY-4.0 — see
  [\`LICENSE-DATA.md\`](./LICENSE-DATA.md).
- **Code** (\`scripts/*\`, \`.github/workflows/*\`): MIT — see [\`LICENSE\`](./LICENSE).

Attribution for the data is one line:

\`\`\`
Temperature data: ctofconverter.com — CC-BY-4.0
${API}
\`\`\`

The authorities cited in each provenance block are not relicensed here. If you redistribute a
table, cite them as well.

## Scope and limits

- This is not a source of authority. The authorities are the ones named in each provenance block;
  read them there and cite them there.
- The body-temperature dataset is a reference table of published thresholds, **not medical
  advice**, and must not be the only basis for a decision about a sick person.
- Fan-oven figures are a convention (commonly 20 °C below conventional), not a measurement.
  Ovens vary; use an oven thermometer for anything temperature-sensitive.

## Corrections

If a number here does not match its cited source, that is a bug. Open an issue with the dataset id
and the row, or write to the address in the site's footer. Corrections ship as a new dataset
version, with the provenance block updated.
`;

const licenseData = `# Licensing notice — data

The data files (\`data/*.json\`, \`data/*.csv\`, \`data/manifest.json\`) are released under
**Creative Commons Attribution 4.0 International (CC-BY-4.0)**.

This file is a human-readable notice, not the license text. The text that actually governs:

- Legal code: <https://creativecommons.org/licenses/by/4.0/legalcode>
- Plain-language summary: <https://creativecommons.org/licenses/by/4.0/>

You may copy, redistribute, adapt and use this data commercially, including in closed-source
products, as long as you give attribution:

\`\`\`
Temperature data: ctofconverter.com — CC-BY-4.0
${API}
\`\`\`

A normal followable link back is sufficient. No further conditions.

The underlying authorities cited in each dataset's provenance block (USDA FSIS, NHS, CDC, WHO,
Merck Manual, StatPearls, national gas-mark references, and others) are **not** relicensed by this
notice — they remain the property of their publishers. If you redistribute a table, cite the
authority as well as this project, and check the original yourself for anything safety-related.
`;

const licenseCode = `MIT License

Copyright (c) ${new Date().getUTCFullYear()} ctofconverter.com

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
`;

const citation = `cff-version: 1.2.0
message: "If you use these datasets, cite this snapshot and the authorities named in each dataset's provenance block."
type: dataset
title: "Open temperature reference datasets: oven conversions, safe internal cooking temperatures, body temperature thresholds"
version: "${version}"
date-released: "${version.replace(/\./g, '-')}"
license: CC-BY-4.0
url: "${API}"
repository-code: "${REPO_URL}"
authors:
  - name: "Jovceo"
keywords:
  - temperature conversion
  - celsius
  - fahrenheit
  - gas mark
  - oven temperature
  - food safety
  - body temperature
  - open data
abstract: >-
  Machine-readable temperature reference tables with row-level provenance. Every row states the
  publishing body, the URL it was read from, a verbatim fragment of the source text, and the date it
  was checked. Where authorities disagree, both figures are kept and labelled rather than averaged.
`;

const zenodo = {
    title:
        'Open temperature reference datasets: oven conversions (gas mark / fan), safe internal cooking temperatures, body temperature thresholds',
    description: [
        '<p>Machine-readable temperature reference tables with row-level provenance.</p>',
        `<ul>${datasets
            .map(
                (d) =>
                    `<li><strong>${d.id}</strong>: ${d.rows} rows, version ${d.version}, last checked ${d.updated} (` +
                    `<a href="${SITE}/data/${d.id}.json">JSON</a> / <a href="${SITE}/data/${d.id}.csv">CSV</a>)</li>`
            )
            .join('')}</ul>`,
        '<p>Every row states the publishing body, the URL it was read from, a verbatim fragment of the source text, ',
        'and the date it was checked. Where authorities disagree, both figures are kept and labelled rather than ',
        'averaged; bands that no authority publishes are absent.</p>',
        `<p>This repository mirrors the published layer at <a href="${SITE}/data/">${SITE}/data/</a> and is kept in `,
        'sync by CI. Data CC-BY-4.0, code MIT.</p>',
    ].join(''),
    creators: [{ name: 'Jovceo' }],
    upload_type: 'dataset',
    publication_date: version.replace(/\./g, '-'),
    access_right: 'open',
    license: 'cc-by-4.0',
    version,
    language: 'eng',
    keywords: [
        'temperature conversion',
        'celsius',
        'fahrenheit',
        'gas mark',
        'oven temperature',
        'food safety',
        'safe minimum internal temperature',
        'body temperature',
        'fever thresholds',
        'open data',
    ],
    related_identifiers: [
        { identifier: API, relation: 'isDocumentedBy', scheme: 'url' },
        { identifier: SITE, relation: 'isSupplementTo', scheme: 'url' },
        { identifier: SITE_REPO, relation: 'isDerivedFrom', scheme: 'url' },
    ],
};

// ---------------------------------------------------------------- CI + 同步脚本

// 同步脚本与 workflow 以【真实文件】维护（可 node --check、可 review、无模板字符串转义），
// 这里只做逐字节拷贝。编辑时改 scripts/open-temperature-data/ 下的源文件。
const CI_SRC = path.join(ROOT, 'scripts', 'open-temperature-data');
const CI_FILES = [
    { from: 'sync-from-site.mjs', to: 'scripts/sync-from-site.mjs' },
    { from: 'sync.yml', to: '.github/workflows/sync.yml' },
];

// ---------------------------------------------------------------- 写盘

write('README.md', readme);
write('LICENSE-DATA.md', licenseData);
write('LICENSE', licenseCode);
write('CITATION.cff', citation);
write('.zenodo.json', `${JSON.stringify(zenodo, null, 2)}\n`);
for (const f of CI_FILES) write(f.to, fs.readFileSync(path.join(CI_SRC, f.from), 'utf8'));
write('.gitignore', ['node_modules/', '.DS_Store', 'Thumbs.db', ''].join('\n'));

// ---------------------------------------------------------------- 校验

const problems = [];

// 1) 数据文件逐字节一致
for (const d of datasets) {
    for (const name of [`${d.id}.json`, `${d.id}.csv`]) {
        const a = sha256(path.join(OUT, 'data', name));
        const b = sha256(path.join(PUBLISHED, name));
        if (a !== b) problems.push(`not byte-identical to public/data: ${name}`);
    }
}
if (sha256(path.join(OUT, 'data', 'manifest.json')) !== sha256(path.join(PUBLISHED, 'manifest.json'))) {
    problems.push('not byte-identical to public/data: manifest.json');
}

// 2) MANIFEST.sha256 覆盖 data/ 下每个文件，且每一行的哈希都对得上
const dataFiles = fs.readdirSync(path.join(OUT, 'data')).sort();
write(
    'MANIFEST.sha256',
    `${dataFiles.map((f) => `${sha256(path.join(OUT, 'data', f))}  data/${f}`).join('\n')}\n`
);
const manifestLines = fs
    .readFileSync(path.join(OUT, 'MANIFEST.sha256'), 'utf8')
    .split('\n')
    .filter(Boolean);
const listed = [];
for (const line of manifestLines) {
    const parts = line.split(/\s{2}/);
    if (parts.length !== 2) {
        problems.push(`MANIFEST.sha256 malformed line: ${line.slice(0, 40)}`);
        continue;
    }
    const [hash, rel] = parts;
    if (!rel.startsWith('data/')) {
        problems.push(`MANIFEST.sha256 entry outside data/: ${rel}`);
        continue;
    }
    const f = rel.replace(/^data\//, '');
    listed.push(f);
    if (sha256(path.join(OUT, 'data', f)) !== hash) problems.push(`MANIFEST.sha256 checksum mismatch: ${rel}`);
}
for (const f of dataFiles) if (!listed.includes(f)) problems.push(`MANIFEST.sha256 missing ${f}`);

// 3) 对外字符串全英文（生成物里不得出现 CJK）
const textFiles = ['README.md', 'LICENSE-DATA.md', 'LICENSE', 'CITATION.cff', '.zenodo.json', 'MANIFEST.sha256', 'scripts/sync-from-site.mjs', '.github/workflows/sync.yml', '.gitignore'];
for (const rel of textFiles) {
    const content = fs.readFileSync(path.join(OUT, rel), 'utf8');
    const lines = content.split('\n');
    for (let i = 0; i < lines.length; i += 1) {
        const hit = lines[i].match(CJK);
        if (hit) {
            problems.push(
                `non-English text in ${rel}:${i + 1} — U+${hit[0].codePointAt(0).toString(16).toUpperCase()}: ${lines[i].trim().slice(0, 120)}`
            );
            break;
        }
    }
}

// 4) 引用/元数据字段完整性
const zen = readJson(path.join(OUT, '.zenodo.json'));
for (const key of ['title', 'description', 'creators', 'upload_type', 'license', 'version', 'related_identifiers']) {
    if (!zen[key]) problems.push(`.zenodo.json missing ${key}`);
}
if (zen.license !== 'cc-by-4.0') problems.push('.zenodo.json license must stay cc-by-4.0');

if (problems.length) {
    fs.rmSync(OUT, { recursive: true, force: true });
    console.error(`✗ ${problems.length} problem(s), staging removed:`);
    problems.forEach((p) => console.error(`  - ${p}`));
    process.exit(1);
}

const fileCount = fs
    .readdirSync(OUT, { recursive: true })
    .filter((f) => fs.statSync(path.join(OUT, String(f))).isFile()).length;

console.log(`✓ dataset repo staged: ${path.relative(ROOT, OUT).split(path.sep).join('/')}`);
console.log(`  repository   ${REPO_URL}`);
console.log(`  version      ${version}${head ? ` (site commit ${head})` : ''}`);
console.log(`  datasets     ${datasets.length} — ${ids.join(', ')}`);
console.log(`  rows         ${totalRows}`);
console.log(`  files        ${fileCount}`);
console.log(`  data files   ${dataFiles.length} — byte-identical to public/data/`);
console.log(`  sync         .github/workflows/sync.yml (weekly + manual) · scripts/sync-from-site.mjs (idempotent)`);
