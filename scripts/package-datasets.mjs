#!/usr/bin/env node
/**
 * package-datasets.mjs —— 把 public/data/ 打成一个「可对外发布」的快照包（供 Zenodo / GitHub Release 用）
 *
 * 为什么必须脚本生成：
 *   数据唯一来源是 config/datasets/*.json。对外发布时若手抄一份数值，就变成
 *   「在唯一数据源之外复制数值」——2026-04 质控失效的根因。因此本脚本只做两件事：
 *   （1）把 public/data/ 里的已发布文件【逐字节拷贝】过去（不做任何重新序列化）；
 *   （2）生成元数据（CITATION.cff / .zenodo.json / DEPOSIT.md / SNAPSHOT.json / MANIFEST.sha256）。
 *
 * 用法：
 *   node scripts/package-datasets.mjs                 # 生成 release/datasets-<版本>/
 *   node scripts/package-datasets.mjs --version=2026.11.10
 *   node scripts/package-datasets.mjs --out=release/zenodo
 *   node scripts/package-datasets.mjs --check         # 只校验：包内文件与 public/data/ 是否逐字节一致
 *
 * 校验规则（默认生成完自动跑一遍）：
 *   · 每个数据文件的 sha256 必须与 public/data/ 里同名文件相同
 *   · manifest.json 里声明的 rows 数必须与文件实际行数一致
 *   · MANIFEST.sha256 必须覆盖包内每个文件
 * 任一不满足 → 非零退出，不产出半成品。
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execSync } from 'node:child_process';
import process from 'node:process';

const ROOT = process.cwd();
const SRC_DIR = path.join(ROOT, 'public', 'data');
const CONFIG_DIR = path.join(ROOT, 'config', 'datasets');

const DEFAULT_VERSION = new Date().toISOString().slice(0, 10).replace(/-/g, '.');
const REPO = 'https://github.com/Jovceo/ctofconverter';
const HOMEPAGE = 'https://ctofconverter.com/data-api';

// 这些文件逐字节拷贝：数据本体 + 对外许可/说明，保证「包内 = 线上」
const COPIES = ['manifest.json', 'README.md', 'LICENSE-NOTICE.md'];

function fail(msg) {
    console.error(`\n✗ ${msg}`);
    process.exit(1);
}

function readJson(file) {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256(file) {
    return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function writeUtf8(file, content) {
    fs.writeFileSync(file, content, { encoding: 'utf8' }); // 不加 BOM；内容自带 LF
}

function parseArgs(argv) {
    const args = { version: DEFAULT_VERSION, out: null, check: false };
    for (const raw of argv.slice(2)) {
        if (raw === '--check') args.check = true;
        else if (raw.startsWith('--version=')) args.version = raw.slice('--version='.length);
        else if (raw.startsWith('--out=')) args.out = raw.slice('--out='.length);
        else fail(`unknown argument: ${raw}`);
    }
    if (!/^\d{4}\.\d{2}\.\d{2}$/.test(args.version)) {
        fail(`--version must look like 2026.11.10 (got "${args.version}")`);
    }
    args.out = args.out || path.join('release', `datasets-${args.version}`);
    return args;
}

function gitHead() {
    try {
        return execSync('git rev-parse HEAD', { cwd: ROOT, encoding: 'utf8' }).trim();
    } catch {
        return null;
    }
}

/** 读取已发布的 manifest，并做一次「发布物自洽」检查 */
function loadPublished() {
    if (!fs.existsSync(SRC_DIR)) fail(`published data directory not found: ${SRC_DIR}`);
    const manifestPath = path.join(SRC_DIR, 'manifest.json');
    if (!fs.existsSync(manifestPath)) fail('public/data/manifest.json not found — run `npm run generate:datasets` first');

    const manifest = readJson(manifestPath);
    if (!Array.isArray(manifest.datasets) || manifest.datasets.length === 0) {
        fail('manifest.json has no datasets');
    }

    const datasets = manifest.datasets.map((entry) => {
        const jsonFile = path.join(SRC_DIR, `${entry.id}.json`);
        const csvFile = path.join(SRC_DIR, `${entry.id}.csv`);
        if (!fs.existsSync(jsonFile)) fail(`missing published file: public/data/${entry.id}.json`);
        if (!fs.existsSync(csvFile)) fail(`missing published file: public/data/${entry.id}.csv`);

        const data = readJson(jsonFile);
        const actualRows = Array.isArray(data.rows) ? data.rows.length : -1;
        if (actualRows !== entry.rows) {
            fail(`${entry.id}: manifest says ${entry.rows} rows, file has ${actualRows} — run \`npm run generate:datasets\``);
        }
        // 配置源必须存在（否则这个包就不是从唯一数据源生成的）
        if (!fs.existsSync(path.join(CONFIG_DIR, `${entry.id}.json`))) {
            fail(`config/datasets/${entry.id}.json missing — the snapshot would not be traceable to the single source`);
        }
        return { ...entry, jsonFile, csvFile, actualRows };
    });

    return { manifest, datasets };
}

function buildDescription(manifest, datasets) {
    const items = datasets
        .map(
            (d) =>
                `<li><strong>${escapeHtml(d.id)}</strong> — ${escapeHtml(d.title)}. ` +
                `${d.rows} rows, version ${escapeHtml(d.version)}, last checked ${escapeHtml(d.updated)}. ` +
                `<a href="https://ctofconverter.com/data/${d.id}.json">JSON</a> / ` +
                `<a href="https://ctofconverter.com/data/${d.id}.csv">CSV</a></li>`
        )
        .join('\n');

    return [
        '<p>Open, machine-readable temperature reference tables: UK gas mark and oven conversions, ',
        'USDA safe minimum internal cooking temperatures, and human body temperature thresholds.</p>',
        '<p><strong>Every row states where it came from.</strong> Each record carries the publishing body, ',
        'the URL it was read from, a verbatim fragment of the source text, and the date it was checked. ',
        'Where two authorities publish different figures, both are kept and labelled rather than averaged. ',
        'Bands that no authority publishes are deliberately absent.</p>',
        `<ul>\n${items}\n</ul>`,
        '<p>Formats: JSON (with column metadata, units and per-row provenance) and RFC 4180 CSV, ',
        'UTF-8 without BOM. A manifest lists row counts, columns and versions.</p>',
        '<p>The data is also served over a read-only, keyless API with CORS enabled, plus a dependency-free ',
        `embeddable table widget: <a href="${HOMEPAGE}">${HOMEPAGE}</a></p>`,
        '<p>Data is licensed CC-BY-4.0; the accompanying code is MIT. The authorities cited in each file\'s ',
        'provenance block are not relicensed here — if you redistribute a table, cite them as well.</p>',
        '<p><strong>Not a source of authority.</strong> These files are a curation layer over named publishers. ',
        'The body-temperature dataset is a reference table of published thresholds, not medical advice.</p>',
    ].join('');
}

function escapeHtml(s) {
    return String(s == null ? '' : s)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
}

function zenodoPayload(manifest, datasets, version) {
    return {
        title:
            'Temperature reference datasets: oven conversions (gas mark / fan), USDA safe internal temperatures, human body temperature',
        description: buildDescription(manifest, datasets),
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
            'fan-assisted oven',
            'food safety',
            'safe minimum internal temperature',
            'usda',
            'body temperature',
            'fever thresholds',
            'open data',
        ],
        related_identifiers: [
            { identifier: HOMEPAGE, relation: 'isDocumentedBy', scheme: 'url' },
            { identifier: 'https://ctofconverter.com', relation: 'isSupplementTo', scheme: 'url' },
            { identifier: REPO, relation: 'isDerivedFrom', scheme: 'url' },
        ],
        notes:
            'Each row in each dataset carries source, source_url, quote and checked_on. Row-level provenance was ' +
            'verified against the cited pages before publication; see the provenance block in every JSON file for ' +
            'the list of authorities and any known fetch restrictions.',
    };
}

function citationCff(manifest, datasets, version) {
    const keywords = ['temperature conversion', 'gas mark', 'oven temperature', 'food safety', 'fever thresholds', 'open data'];
    return [
        'cff-version: 1.2.0',
        'message: "If you use these datasets, cite this snapshot and the authorities named in each file\'s provenance block."',
        'type: dataset',
        `title: "Temperature reference datasets: oven conversions, USDA safe internal temperatures, human body temperature"`,
        `version: "${version}"`,
        `date-released: "${version.replace(/\./g, '-')}"`,
        'license: CC-BY-4.0',
        `url: "${HOMEPAGE}"`,
        `repository-code: "${REPO}"`,
        'authors:',
        '  - name: "Jovceo"',
        'keywords:',
        ...keywords.map((k) => `  - ${k}`),
        'abstract: >-',
        '  Open, machine-readable temperature reference tables. Every row states the publishing body, the URL it was',
        '  read from, a verbatim fragment of the source text, and the date it was checked. Where authorities disagree,',
        '  both figures are kept and labelled rather than averaged.',
        '',
    ].join('\n');
}

function depositChecklist(manifest, datasets, version, head) {
    const rows = datasets.map((d) => `| \`${d.id}\` | ${d.rows} | ${d.version} | ${d.updated} |`).join('\n');
    const source = head ? `the repository at commit \`${head.slice(0, 7)}\`` : 'the repository (commit unknown)';
    return `# Zenodo deposit checklist — ${version}

Generated by \`scripts/package-datasets.mjs\`. Do not edit the data files by hand: this folder is a
byte-identical copy of \`public/data/\` from ${source}, which is itself generated from
\`config/datasets/*.json\` at build time.

## What is in this folder

| File | Role |
|---|---|
| \`*.json\`, \`*.csv\` | The datasets. Copied byte-for-byte from \`public/data/\`. |
| \`manifest.json\` | Published index: row counts, columns, versions, API endpoints. |
| \`README.md\`, \`LICENSE-NOTICE.md\` | Usage notes and the CC-BY-4.0 notice. |
| \`CITATION.cff\` | Citation metadata (Citation File Format 1.2.0). |
| \`.zenodo.json\` | Deposit metadata in Zenodo's schema — used automatically by GitHub releases. |
| \`SNAPSHOT.json\` | What was packaged, from which commit, with per-file hashes. |
| \`MANIFEST.sha256\` | \`sha256sum\`-format checksums for every file above. |

## Datasets in this snapshot

| Dataset | Rows | Dataset version | Last checked |
|---|---|---|---|
${rows}

## Upload (about 10 minutes)

1. Sign in at <https://zenodo.org> (GitHub or ORCID login both work).
2. **New upload** → **Upload type: Dataset**. Community: leave empty unless you want a curated one.
3. Drag **every file in this folder** into the upload area (do not zip — Zenodo serves individual files better).
4. Paste the metadata from \`.zenodo.json\` into the form. Fields that need a human decision:
   - **Creators**: currently \`Jovceo\`. Add a family name, an ORCID, and an affiliation if you have them —
     a real name materially increases citation trust. Do not invent an affiliation.
   - **Publisher**: leave blank (Zenodo) unless you have an institutional publisher.
5. **Related identifiers** are pre-filled: the API/usage page (\`isDocumentedBy\`), the site
   (\`isSupplementTo\`), and the source repository (\`isDerivedFrom\`).
6. **License: CC-BY-4.0** — must stay, it is what the files declare.
7. Publish, then copy the **DOI** and add a new version field (not a new deposit) for later corrections.

## Verify before and after uploading

\`\`\`bash
node scripts/package-datasets.mjs --check --out=release/datasets-${version}
\`\`\`

This re-hashes every file in this folder against \`public/data/\` and against \`MANIFEST.sha256\`
and exits non-zero on any difference. It is the check that answers "does the deposit still match
what the site serves?" — run it again after any dataset change, before minting a new version.

## After publishing

- Put the DOI into \`public/data/README.md\` and \`/data-api\` (a DOI on the download page is the
  difference between "a file on a website" and "a citable dataset").
- The DOI is the artefact to cite in outreach emails: it makes the data auditable without asking
  anyone to trust this site.
`;
}

function snapshotJson(manifest, datasets, version, packageFiles, head) {
    return {
        packageVersion: version,
        generatedAt: new Date().toISOString(),
        generatedBy: 'scripts/package-datasets.mjs',
        sourceRepository: REPO,
        sourceCommit: head,
        singleSourceOfTruth: 'config/datasets/*.json',
        publishedFrom: 'public/data/ (byte-identical copies, verified by sha256)',
        license: 'CC-BY-4.0',
        attribution: 'ctofconverter.com',
        verification: {
            method: 'sha256 compare of every packaged file against its public/data/ counterpart',
            status: 'identical',
        },
        datasets: datasets.map((d) => ({
            id: d.id,
            version: d.version,
            updated: d.updated,
            rows: d.actualRows,
            sha256: {
                json: sha256(d.jsonFile),
                csv: sha256(d.csvFile),
            },
        })),
        files: packageFiles,
    };
}

function writeManifestSha(dir, files) {
    const lines = files
        .slice()
        .sort()
        .map((name) => `${sha256(path.join(dir, name))}  ${name}`);
    writeUtf8(path.join(dir, 'MANIFEST.sha256'), `${lines.join('\n')}\n`);
}

function verify(dir, datasets) {
    const problems = [];

    // 1) 包内数据文件 vs public/data 逐字节一致
    for (const d of datasets) {
        for (const file of [`${d.id}.json`, `${d.id}.csv`]) {
            const packed = path.join(dir, file);
            const source = path.join(SRC_DIR, file);
            if (!fs.existsSync(packed)) {
                problems.push(`missing in package: ${file}`);
                continue;
            }
            const a = sha256(packed);
            const b = sha256(source);
            if (a !== b) problems.push(`not byte-identical to public/data: ${file} (${a.slice(0, 12)} != ${b.slice(0, 12)})`);
        }
    }
    for (const file of COPIES) {
        if (!fs.existsSync(path.join(dir, file))) problems.push(`missing in package: ${file}`);
        else if (sha256(path.join(dir, file)) !== sha256(path.join(SRC_DIR, file))) {
            problems.push(`not byte-identical to public/data: ${file}`);
        }
    }

    // 2) MANIFEST.sha256 覆盖包内每一个文件，且校验通过
    const manifestFile = path.join(dir, 'MANIFEST.sha256');
    if (!fs.existsSync(manifestFile)) {
        problems.push('MANIFEST.sha256 missing');
    } else {
        const listed = new Map();
        for (const line of fs.readFileSync(manifestFile, 'utf8').split('\n')) {
            if (!line.trim()) continue;
            const [hash, name] = line.split(/\s{2}/);
            listed.set(name, hash);
        }
        const present = fs
            .readdirSync(dir)
            .filter((f) => f !== 'MANIFEST.sha256')
            .filter((f) => fs.statSync(path.join(dir, f)).isFile());
        for (const name of present) {
            if (!listed.has(name)) problems.push(`not listed in MANIFEST.sha256: ${name}`);
            else if (listed.get(name) !== sha256(path.join(dir, name))) problems.push(`checksum mismatch: ${name}`);
        }
        for (const name of listed.keys()) {
            if (!present.includes(name)) problems.push(`listed but absent: ${name}`);
        }
    }

    // 3) 行数自洽（防止包内的 manifest 与实际数据错位）
    for (const d of datasets) {
        const data = readJson(path.join(dir, `${d.id}.json`));
        if (!Array.isArray(data.rows) || data.rows.length !== d.rows) {
            problems.push(`row count mismatch inside package: ${d.id}`);
        }
        if (data.license !== 'CC-BY-4.0') problems.push(`unexpected license in ${d.id}: ${data.license}`);
    }

    return problems;
}

function main() {
    const args = parseArgs(process.argv);
    const { manifest, datasets } = loadPublished();
    const dir = path.resolve(ROOT, args.out);

    if (args.check) {
        if (!fs.existsSync(dir)) fail(`package not found: ${args.out} (run without --check to build it)`);
        const problems = verify(dir, datasets);
        if (problems.length) {
            console.error(`✗ ${problems.length} problem(s):`);
            problems.forEach((p) => console.error(`  - ${p}`));
            process.exit(1);
        }
        console.log(`✓ package verified: ${args.out}`);
        console.log(`  ${datasets.length} datasets, ${datasets.reduce((n, d) => n + d.actualRows, 0)} rows, byte-identical to public/data/`);
        return;
    }

    fs.rmSync(dir, { recursive: true, force: true });
    fs.mkdirSync(dir, { recursive: true });

    // （1）逐字节拷贝
    const copied = [];
    for (const file of COPIES) {
        const from = path.join(SRC_DIR, file);
        if (!fs.existsSync(from)) fail(`missing source file: public/data/${file}`);
        fs.copyFileSync(from, path.join(dir, file));
        copied.push(file);
    }
    for (const d of datasets) {
        for (const file of [`${d.id}.json`, `${d.id}.csv`]) {
            fs.copyFileSync(path.join(SRC_DIR, file), path.join(dir, file));
            copied.push(file);
        }
    }

    // （2）生成元数据
    const head = gitHead();
    writeUtf8(path.join(dir, 'CITATION.cff'), citationCff(manifest, datasets, args.version));
    writeUtf8(path.join(dir, '.zenodo.json'), `${JSON.stringify(zenodoPayload(manifest, datasets, args.version), null, 2)}\n`);
    writeUtf8(path.join(dir, 'DEPOSIT.md'), depositChecklist(manifest, datasets, args.version, head));

    const generated = ['CITATION.cff', '.zenodo.json', 'DEPOSIT.md'];
    const snapshot = snapshotJson(manifest, datasets, args.version, [...copied, ...generated].sort(), head);
    writeUtf8(path.join(dir, 'SNAPSHOT.json'), `${JSON.stringify(snapshot, null, 2)}\n`);
    generated.push('SNAPSHOT.json');

    // （3）校验和（最后写，覆盖其余所有文件）
    writeManifestSha(dir, [...copied, ...generated]);

    // （4）自检：不通过就删掉半成品
    const problems = verify(dir, datasets);
    if (problems.length) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.error(`✗ verification failed (${problems.length}), package removed:`);
        problems.forEach((p) => console.error(`  - ${p}`));
        process.exit(1);
    }

    const rows = datasets.reduce((n, d) => n + d.actualRows, 0);
    const files = fs.readdirSync(dir).length;
    console.log(`✓ snapshot built: ${path.relative(ROOT, dir).split(path.sep).join('/')}`);
    console.log(`  version      ${args.version}`);
    console.log(`  datasets     ${datasets.length} (${datasets.map((d) => d.id).join(', ')})`);
    console.log(`  rows         ${rows}`);
    console.log(`  files        ${files}`);
    console.log(`  source       public/data/ — byte-identical (sha256 verified)`);
    console.log(`  next         read ${path.relative(ROOT, path.join(dir, 'DEPOSIT.md')).split(path.sep).join('/')} for the 10-minute upload steps`);
}

main();
