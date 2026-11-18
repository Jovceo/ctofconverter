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

// .zenodo.json 是给 GitHub Release 自动投递用的元数据（也是 zenodo-deposit.mjs 的输入），
// 但 Zenodo 的网页与 API 都不收点开头的文件。它必须留在包里，却不能进 MANIFEST.sha256、
// 也不能出现在「上传这些文件」清单里——否则下载者 `sha256sum -c` 会看到一条永远对不上的记录
// （2026-11-16 首次发布就是这么错的：13 条校验里 12 OK + 1 missing = 整体失败）。
const isUploadable = (name) => !name.startsWith('.');

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
| \`.zenodo.json\` | Deposit metadata in Zenodo's schema. **Not uploaded** — Zenodo rejects dot-prefixed files; GitHub releases read it automatically. |
| \`SNAPSHOT.json\` | What was packaged, from which commit, with per-file hashes. |
| \`MANIFEST.sha256\` | \`sha256sum\`-format checksums for every uploaded file **except itself** (so it verifies after download). |

## Datasets in this snapshot

| Dataset | Rows | Dataset version | Last checked |
|---|---|---|---|
${rows}

## Upload (about 10 minutes)

1. Sign in at <https://zenodo.org> (GitHub or ORCID login both work).
2. **New upload** → **Upload type: Dataset**. Community: leave empty unless you want a curated one.
3. Drag every file in this folder **except \`.zenodo.json\`** into the upload area (do not zip — Zenodo
   serves individual files better, and it rejects dot-prefixed names).
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

A snapshot is a point-in-time copy, so once \`public/data/\` changes after packaging this check is
**expected** to fail. That failure is the signal to pick one of two paths: correct the published
record in place (Zenodo allows file edits within 30 days of publication, DOI unchanged) or mint a
new version. To check a record that is already on Zenodo, use
\`node scripts/zenodo-deposit.mjs --out=release/datasets-${version} --verify=<record-id>\`, which
compares the live record against its own \`MANIFEST.sha256\` and required metadata.

## After publishing

- Put the DOI into \`public/data/README.md\` and \`/data-api\` (a DOI on the download page is the
  difference between "a file on a website" and "a citable dataset").
- The DOI is the artefact to cite in outreach emails: it makes the data auditable without asking
  anyone to trust this site.
`;
}

/**
 * 生成「照着这张表往 Zenodo 表单里贴」的清单。
 * 放在包外面（release/），因为它不是数据集的一部分，不该被上传。
 * 所有值都从 zenodoPayload() 来，不手抄，避免清单与 .zenodo.json 说法不一致。
 */
function pasteSheet(manifest, datasets, version, files) {
    const z = zenodoPayload(manifest, datasets, version);
    const rel = {
        isDocumentedBy: 'Is documented by',
        isSupplementTo: 'Is supplement to',
        isDerivedFrom: 'Is derived from',
        isIdenticalTo: 'Is identical to',
    };
    const related = z.related_identifiers
        .map((r) => `| ${rel[r.relation] || r.relation} | \`${r.identifier}\` | URL |`)
        .join('\n');
    return `# Zenodo 表单粘贴清单 — ${version}

打开 <https://zenodo.org/uploads/new>，按下面顺序填。**左列是表单字段，右列原样复制**。
这张表由 \`scripts/package-datasets.mjs\` 从 \`.zenodo.json\` 生成，两边说法必然一致。

## 1. 文件

把 \`release/datasets-${version}/\` 里的 **${files.length} 个文件**全部拖进上传区（不要打包成 zip）：

\`\`\`
${files.join('\n')}
\`\`\`

包里还有一个 \`.zenodo.json\`：**不要上传它**。Zenodo 拒收点开头的文件名，它只服务于 GitHub Release 的自动投递；
\`MANIFEST.sha256\` 也因此只列上面这些文件（列了点文件会让下载者 \`sha256sum -c\` 永远失败一条）。

## 2. DOI（表单顶部第一个问题，先答这个）

**Does this upload already have a DOI?** → 选 **No**。

**不要点 "Get a DOI now!" 预留。** 预留只对「必须把 DOI 印进 PDF 里」的场景有用；我们的顺序是发布后立刻把 DOI 写回网站，预留只会让网站短暂出现一个解析不了的 DOI（就是上一轮刚修掉的那类死链）。

## 3. Basic information

| 表单字段 | 填入 |
|---|---|
| Resource type | **Dataset** |
| Title | \`${z.title}\` |
| Publication date | \`${z.publication_date}\`（默认取草稿创建日；今天上传就正好是这一天） |
| Creators | 见第 4 节 |
| Description | 见第 5 节 |
| License | **Creative Commons Attribution 4.0 International (CC BY 4.0)** — 必须与文件里声明的 cc-by-4.0 一致 |
| Languages | **English** |
| Version | \`${z.version}\` |
| Publisher | 留空 |
| Keywords | 见第 6 节 |

## 4. Creators（唯一必须你亲自决定的字段）

Zenodo 会先让你选 **Person** 还是 **Organization**：

- **Person** — 分 family name / given names，可挂 ORCID 与 ROR 机构（会进入引用字符串）。
- **Organization** — 只有一个名字字段。不想公开真名时，填 \`ctofconverter.com\` 是合规做法：维护主体确实是这个站点。
- **保留占位 \`Jovceo\`** 也能发，只是引用里会印这个占位名。

**不要编造 ORCID、机构或真名。** 没有就留空。

## 5. Description（整段 HTML，直接粘）

\`\`\`html
${z.description}
\`\`\`

粘完看预览：应出现三个数据集条目（各带 JSON / CSV 链接）与 6 段说明。若编辑器把标签吃掉，就改成纯文本重贴（内容一样，只是没有加粗和链接）。

## 6. Keywords and subjects

**Keywords**（自由词，一条一行，粘进去按回车变成标签）：

\`\`\`
${z.keywords.join('\n')}
\`\`\`

**Subjects**（受控词表，可选）：想加就在里面搜 \`Body Temperature\` 或 \`Cooking\`，选中即可。不加不影响发布，加了某些学术目录抓取时更准。

## 7. Related works（三条，逐条 Add）

| 关系 | 标识符 | 类型 |
|---|---|---|
${related}

## 8. 发布前最后一眼

- 文件数 = **${files.length}**，且没有打包成 zip；
- License = **CC BY 4.0**，Version = \`${z.version}\`；
- 先点 **Save draft** 让它校一遍，再点 **Publish**。

**45 天规则**：发布后 45 天内你还能自己增删改文件，过期要联系 Zenodo 支持。所以宁可现在多看一眼。

## 9. 发布后

1. 记录页会给出两个 DOI：**概念 DOI**（\`10.5281/zenodo.NNNNNNN\`，不带版本号，永远指向最新版）和 **版本 DOI**（带版本后缀）。**两个都发我** —— 站点引用用概念 DOI，复现/论文引用用版本 DOI。
2. 我把 DOI 写回 \`public/data/README.md\`、\`/data-api\`、数据仓 README 与 \`CITATION.cff\`，跟同一批推送一起上线。
3. 以后改数据：在**同一个 record** 上点 **New version**，不要新建一条 record（否则引用会分裂成两个 DOI）。
4. **发布后不要只信「发布成功」**——Zenodo 会静默丢弃它不认识的元数据字段（首次发布就丢了 license 和 keywords）。
   用只读复核把记录和自己对一遍：

   \`\`\`bash
   node scripts/zenodo-deposit.mjs --out=release/datasets-${version} --verify=<record-id>
   \`\`\`

   它逐文件下载比对 md5、按 \`MANIFEST.sha256\` 逐条核对、并检查 license / keywords / related 是否真的存进了记录。
   不通过时，元数据用记录页的 **Edit**（DOI 不变）改，文件用 **Edit files → Edit published files** 改（发布后 30 天内，DOI 不变）。
`;
}

function snapshotJson(manifest, datasets, version, head, uploadedFiles, localOnlyFiles) {
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
        // 真正上传到 Zenodo/Release 的文件（点文件除外）
        files: uploadedFiles,
        // 留在包里但不是发布物（Zenodo 不收点开头的文件名），因此不进 MANIFEST.sha256
        localOnly: localOnlyFiles,
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
    };
}

function writeManifestSha(dir, files) {
    // MANIFEST.sha256 不能列自己（无法自指哈希），其余每个上传文件都必须在册
    const lines = files
        .filter((name) => name !== 'MANIFEST.sha256')
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

    // 2) MANIFEST.sha256 覆盖包内每一个【可上传】文件，且校验通过
    //    点文件（.zenodo.json）不参与：Zenodo 不收它，列进去就会让下载者的 sha256sum -c 失败
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
            .filter((f) => f !== 'MANIFEST.sha256' && isUploadable(f))
            .filter((f) => fs.statSync(path.join(dir, f)).isFile());
        for (const name of present) {
            if (!listed.has(name)) problems.push(`not listed in MANIFEST.sha256: ${name}`);
            else if (listed.get(name) !== sha256(path.join(dir, name))) problems.push(`checksum mismatch: ${name}`);
        }
        for (const name of listed.keys()) {
            if (!isUploadable(name)) problems.push(`MANIFEST.sha256 列了本地保留文件（不随包上传）: ${name}`);
            else if (!present.includes(name)) problems.push(`listed but absent: ${name}`);
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
        if (!fs.existsSync(dir)) {
            // 常见坑：包目录名带日期，跨天再跑 --check 会指向一个不存在的新日期目录
            const parent = path.dirname(dir);
            const existing = fs.existsSync(parent)
                ? fs
                      .readdirSync(parent, { withFileTypes: true })
                      .filter((e) => e.isDirectory() && e.name.startsWith('datasets-'))
                      .map((e) => e.name)
                      .sort()
                : [];
            console.error(`✗ package not found: ${args.out}`);
            if (existing.length) {
                console.error(`  existing snapshot(s): ${existing.join(', ')}`);
                console.error(`  retry with: node scripts/package-datasets.mjs --check --out=${path.join(path.relative(ROOT, parent), existing[existing.length - 1]).split(path.sep).join('/')}`);
            } else {
                console.error('  no snapshot yet — run without --check to build one');
            }
            process.exit(1);
        }
        const problems = verify(dir, datasets);
        if (problems.length) {
            console.error(`✗ ${problems.length} problem(s):`);
            problems.forEach((p) => console.error(`  - ${p}`));
            console.error('\nNote: a snapshot is a point-in-time copy of public/data/. If the site\'s files changed after');
            console.error('packaging, drift is expected — fix the published record in place (Zenodo allows file edits');
            console.error('within 30 days, DOI unchanged), or mint a new version. Check a live record with:');
            console.error(`  node scripts/zenodo-deposit.mjs --out=${args.out} --verify=<record-id>`);
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
    const generated = ['CITATION.cff', '.zenodo.json', 'DEPOSIT.md', 'SNAPSHOT.json'];
    // 上传集先定下来（含 SNAPSHOT.json 与 MANIFEST.sha256 自身），SNAPSHOT 与 MANIFEST 才能说法一致
    const allFiles = [...copied, ...generated, 'MANIFEST.sha256'].sort();
    const uploadable = allFiles.filter(isUploadable);
    const localOnly = allFiles.filter((f) => !isUploadable(f));

    writeUtf8(path.join(dir, 'CITATION.cff'), citationCff(manifest, datasets, args.version));
    writeUtf8(path.join(dir, '.zenodo.json'), `${JSON.stringify(zenodoPayload(manifest, datasets, args.version), null, 2)}\n`);
    writeUtf8(path.join(dir, 'DEPOSIT.md'), depositChecklist(manifest, datasets, args.version, head));
    writeUtf8(
        path.join(dir, 'SNAPSHOT.json'),
        `${JSON.stringify(snapshotJson(manifest, datasets, args.version, head, uploadable, localOnly), null, 2)}\n`
    );

    // （3）校验和（最后写，只覆盖会被上传的文件）
    writeManifestSha(dir, uploadable);

    // （4）自检：不通过就删掉半成品
    const problems = verify(dir, datasets);
    if (problems.length) {
        fs.rmSync(dir, { recursive: true, force: true });
        console.error(`✗ verification failed (${problems.length}), package removed:`);
        problems.forEach((p) => console.error(`  - ${p}`));
        process.exit(1);
    }

    // （5）粘贴清单写在包外面（它不该被上传进 Zenodo）
    const pastePath = path.join(path.dirname(dir), `ZENODO-PASTE-${args.version}.md`);
    writeUtf8(pastePath, pasteSheet(manifest, datasets, args.version, uploadable));

    const rows = datasets.reduce((n, d) => n + d.actualRows, 0);
    const files = uploadable.length;
    console.log(`✓ snapshot built: ${path.relative(ROOT, dir).split(path.sep).join('/')}`);
    console.log(`  version      ${args.version}`);
    console.log(`  datasets     ${datasets.length} (${datasets.map((d) => d.id).join(', ')})`);
    console.log(`  rows         ${rows}`);
    console.log(`  files        ${files} uploadable${localOnly.length ? ` + ${localOnly.join(', ')} (local only, not uploaded)` : ''}`);
    console.log(`  source       public/data/ — byte-identical (sha256 verified)`);
    console.log(`  upload steps ${path.relative(ROOT, path.join(dir, 'DEPOSIT.md')).split(path.sep).join('/')}`);
    console.log(`  paste sheet  ${path.relative(ROOT, pastePath).split(path.sep).join('/')}  ← fill the Zenodo form from this`);
}

main();
