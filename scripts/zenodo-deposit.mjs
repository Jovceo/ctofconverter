#!/usr/bin/env node
/**
 * Zenodo RDM 上传器 — A 项（数据集 DOI）的执行件 v3。
 *
 * v2（2026-11-16）：旧版 /api/deposit/depositions 的 POST 已在生产环境持续 500
 * （GET 正常、POST 崩，含最小 payload，直连与代理均复现）→ 全量改走 InvenioRDM 新 API
 * （/api/records）。实测：RDM POST 201 ✓；WAF 要求完整 Chrome UA（短 UA 被 403 HTML 拦）；
 * node 经代理发 chunked body 会被当成空请求体 → 必须显式 Content-Length。
 *
 * v3（2026-11-18）：首次发布留下了四个「HTTP 全绿但记录是裸的」缺陷，全部针对根因修：
 *   1. relation 词表 id 是【驼峰】（isDocumentedBy / isSupplementTo / isDerivedFrom），
 *      kebab（is-documented-by）会被校验器拒。实证：抽样 100 条近期数据集记录，存储值
 *      只有驼峰形态（isDerivedFrom 21 / isSupplementTo 12 / isDocumentedBy 10 / references 54）。
 *   2. license 的 RDM 字段名是 metadata.rights[]（不是 license）；
 *      keywords 是【字符串数组】（不是 [{keyword}] 对象数组，那是旧 API 的形状）；
 *      languages 是 [{id:'eng'}]。旧形状被静默丢弃 → 记录没有 license、没有 keywords。
 *   3. 新增读回校验（POST/PUT/发布之后都重新 GET 一遍比对）。Zenodo 对不认识的字段
 *      不报错、直接丢：只信 HTTP 200 就会发布一条没有许可的记录。
 *   4. 新增 --verify=<recid>：只读复核一条已发布记录（文件 md5 / MANIFEST.sha256 自洽
 *      / 元数据字段齐全），不需要令牌、不发任何写请求。
 *
 * 用法：
 *   令牌：release/.zenodo-token（或 ZENODO_TOKEN 环境变量；scope 需含 deposit:write + deposit:actions）
 *   代理：环境变量 HTTPS_PROXY（本机 20892 等）
 *
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --dry-run   # 组装元数据，零网络
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --run       # 建草稿+传文件+校验，不发布
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --draft-id=24269033 --publish
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --publish   # 一条龙：建+传+发
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --verify=24269204
 *                                                                                 # 只读复核已发布记录
 *
 * 数据红线：文件与元数据全部来自 --out 快照包（package-datasets.mjs 产物），本脚本零手抄。
 * API 文档：https://inveniordm.docs.cern.ch/reference/records_api/
 *           元数据结构：https://inveniordm.docs.cern.ch/reference/metadata/
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import https from 'node:https';
import { HttpsProxyAgent } from 'https-proxy-agent';

const arg = (n, d = null) => {
    const i = process.argv.indexOf('--' + n);
    if (i !== -1) return process.argv[i + 1] ?? d;
    const prefix = '--' + n + '=';
    const kv = process.argv.find((a) => a.startsWith(prefix));
    return kv ? kv.slice(prefix.length) : d;
};
const flag = (n) => process.argv.includes('--' + n);

const OUT = arg('out', null);
const DRAFT_ID = arg('draft-id', null);
const VERIFY_ID = arg('verify', null);
const PUBLISH = flag('publish');
const RUN = flag('run') || PUBLISH || !!DRAFT_ID;
const DRY = flag('dry-run') || !RUN;
const TOKEN_FILE = arg('token-file', path.join('release', '.zenodo-token'));
const API = 'https://zenodo.org/api';
// WAF 实测（2026-11-16）：短 UA（"Mozilla/5.0"）在部分方法上被 403 HTML 拦截，必须完整 Chrome UA
const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/**
 * RDM 关系词表 id（DataCite 的驼峰写法）。
 * 来源：invenio-rdm-records/fixtures/data/vocabularies/relation_types.yaml（39 条，与上面实测一致）
 */
const RELATION_ALLOWED = [
    'isCitedBy',
    'cites',
    'isSupplementTo',
    'isSupplementedBy',
    'isContinuedBy',
    'continues',
    'isDescribedBy',
    'describes',
    'hasMetadata',
    'isMetadataFor',
    'hasVersion',
    'isVersionOf',
    'isNewVersionOf',
    'isPreviousVersionOf',
    'isPartOf',
    'hasPart',
    'isPublishedIn',
    'isReferencedBy',
    'references',
    'isDocumentedBy',
    'documents',
    'isCompiledBy',
    'compiles',
    'isVariantFormOf',
    'isOriginalFormOf',
    'isIdenticalTo',
    'isReviewedBy',
    'reviews',
    'isDerivedFrom',
    'isSourceOf',
    'isRequiredBy',
    'requires',
    'isObsoletedBy',
    'obsoletes',
    'isTranslationOf',
    'hasTranslation',
    'isCollectedBy',
    'collects',
    'other',
];
// 容错：大小写/连字符不影响语义，统一归一后再查。真正不认识的 id 一律提前失败，
// 而不是等上传完 13 个文件才被校验器拒绝。
const RELATION_BY_NORM = new Map(RELATION_ALLOWED.map((id) => [id.replace(/[^a-z]/gi, '').toLowerCase(), id]));

function mapRelation(id) {
    const hit = RELATION_BY_NORM.get(String(id).replace(/[^a-z]/gi, '').toLowerCase());
    if (!hit) {
        fail(`unknown relation id "${id}" — allowed: ${RELATION_ALLOWED.join(', ')}`);
    }
    return hit;
}

function fail(msg) {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

if (!OUT) {
    fail(
        '用法: node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 ' +
            '[--dry-run|--run|--publish|--verify=<recid>]'
    );
}
const dir = path.resolve(OUT);
if (!fs.existsSync(dir)) fail(`package not found: ${OUT}`);

// 点开头的文件（.zenodo.json）是给 GitHub Release 用的元数据，Zenodo 的网页与 API 都不收；
// 它也不该出现在 MANIFEST.sha256 里（否则下载者 `sha256sum -c` 会有一条永远对不上）。
const files = fs
    .readdirSync(dir)
    .filter((f) => fs.statSync(path.join(dir, f)).isFile() && !f.startsWith('.'))
    .sort();
const localOnly = fs.readdirSync(dir).filter((f) => f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile());
if (!fs.existsSync(path.join(dir, '.zenodo.json'))) fail(`${OUT} 缺少 .zenodo.json —— 先跑 node scripts/package-datasets.mjs`);
if (!files.length) fail(`${OUT} 里没有可上传的文件`);

const zenodoJson = JSON.parse(fs.readFileSync(path.join(dir, '.zenodo.json'), 'utf8'));

// ---- RDM metadata：从 .zenodo.json 映射，零手抄；形状按 InvenioRDM 元数据规范 ----
const rdmMetadata = {
    title: zenodoJson.title,
    resource_type: { id: zenodoJson.upload_type || 'dataset' },
    creators: (zenodoJson.creators || []).map(toRdmCreator),
    publication_date: zenodoJson.publication_date,
    publisher: zenodoJson.publisher || 'ctofconverter.com',
    description: zenodoJson.description,
    // RDM 的字段名是 rights（许可证），不是 license；旧名会被静默丢弃
    rights: [{ id: zenodoJson.license || 'cc-by-4.0' }],
    languages: [{ id: zenodoJson.language || 'eng' }],
    version: zenodoJson.version,
    // keywords 是字符串数组，不是 [{keyword}] 对象数组
    keywords: (zenodoJson.keywords || []).map(String),
    related_identifiers: (zenodoJson.related_identifiers || []).map((r) => ({
        identifier: r.identifier,
        scheme: r.scheme || 'url',
        relation_type: { id: mapRelation(r.relation) },
        ...(r.resource_type ? { resource_type: { id: r.resource_type } } : {}),
    })),
};

function toRdmCreator(c) {
    if (c.person_or_org) return c;
    if (c.family_name || c.given_name) {
        return {
            person_or_org: {
                type: 'personal',
                given_name: c.given_name || '',
                family_name: c.family_name || c.name || '',
                ...(c.orcid ? { identifiers: [{ scheme: 'orcid', identifier: c.orcid }] } : {}),
            },
        };
    }
    // 只有一个名字（如占位名 Jovceo / 站点名 ctofconverter.com）→ 机构类型，
    // 绝不编造 given/family 拆分，也不编造 ORCID 或机构附属。
    return { person_or_org: { type: 'organizational', name: String(c.name || 'ctofconverter.com') } };
}

function md5(file) {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function request(method, url, { body, headers = {}, raw = false } = {}, attemptBudget = 3) {
    return new Promise((resolve, reject) => {
        const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
        const payload = body ? Buffer.from(body) : null;
        const length = payload ? payload.length : null;
        const opts = {
            method,
            headers: {
                'User-Agent': UA,
                Accept: 'application/json',
                ...(length ? { 'Content-Length': length } : {}), // 显式长度：经代理时 chunked body 会被当空体
                ...headers,
            },
            timeout: 60000,
        };
        if (proxy) opts.agent = new HttpsProxyAgent(proxy);
        const req = https.request(url, opts, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const buf = Buffer.concat(chunks);
                if (res.statusCode >= 400) {
                    return reject(
                        Object.assign(
                            new Error(`HTTP ${res.statusCode}: ${buf.toString('utf8').slice(0, 300)}`),
                            { statusCode: res.statusCode }
                        )
                    );
                }
                resolve(raw ? buf : JSON.parse(buf.toString('utf8') || '{}'));
            });
        });
        req.on('timeout', () => req.destroy(new Error('request timeout')));
        req.on('error', reject);
        if (payload) req.write(payload);
        req.end();
    }).catch(async (e) => {
        // 5xx 与网络错误退避重试；4xx 不重试
        if ((e.statusCode >= 500 || !e.statusCode) && attemptBudget > 1) {
            console.log(`  (retry: ${String(e.message).slice(0, 60)})`);
            await sleep(8000);
            return request(method, url, { body, headers, raw }, attemptBudget - 1);
        }
        throw e;
    });
}

// ---- 读回校验：Zenodo 会静默丢弃它不认识的字段，所以只能看 GET 回来的是什么 ----

/** 已发布记录的 files 是数组，草稿是 {entries:[...]}——两种都吃 */
function fileEntries(doc) {
    const f = doc?.files;
    if (!f) return [];
    if (Array.isArray(f)) return f;
    const e = f.entries || f;
    return Array.isArray(e) ? e : Object.values(e);
}

const firstId = (v) => (Array.isArray(v) ? v[0] : v)?.id ?? null;
const storedLicense = (m) => firstId(m.rights) ?? firstId(m.license);
const storedKeywords = (m) =>
    (m.keywords ?? m.subjects ?? [])
        .map((x) => (typeof x === 'string' ? x : (x.keyword ?? x.subject)))
        .filter(Boolean);
const storedRelated = (m) =>
    (m.related_identifiers || []).map((r) => `${r.relation_type?.id ?? r.relation} ${r.identifier}`);
const storedCreators = (m) =>
    (m.creators || []).map((c) => c.person_or_org?.name ?? c.name ?? [c.given_name, c.family_name].filter(Boolean).join(' '));
const storedResourceType = (m) => m.resource_type?.id ?? m.resource_type?.type ?? null;
const flat = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

function metadataChecks(stored) {
    const problems = [];
    const warnings = [];
    const want = rdmMetadata;

    if (flat(stored.title) !== flat(want.title)) problems.push('title');
    if (flat(stored.version) !== flat(want.version)) {
        problems.push(`version（记录 ${flat(stored.version)} / 应为 ${want.version}）`);
    }
    if (flat(stored.publication_date) !== want.publication_date) {
        problems.push(`publication_date（记录 ${flat(stored.publication_date)} / 应为 ${want.publication_date}）`);
    }
    if (storedResourceType(stored) !== want.resource_type.id) {
        problems.push(`resource_type（记录 ${storedResourceType(stored)} / 应为 ${want.resource_type.id}）`);
    }

    const lic = storedLicense(stored);
    if (!lic) problems.push('license 缺失（RDM 字段名是 metadata.rights[{id}]，不是 license）');
    else if (lic !== want.rights[0].id) problems.push(`license（记录 ${lic} / 应为 ${want.rights[0].id}）`);

    const kw = storedKeywords(stored);
    if (!kw.length) problems.push('keywords 缺失（RDM 里是字符串数组，不是 [{keyword}] 对象数组）');
    else if ([...kw].sort().join('|') !== [...want.keywords].sort().join('|')) {
        problems.push(`keywords（记录 ${kw.length} 条 / 应为 ${want.keywords.length} 条）`);
    }

    const rel = storedRelated(stored);
    const wantRel = want.related_identifiers.map((r) => `${r.relation_type.id} ${r.identifier}`);
    const missingRel = wantRel.filter((x) => !rel.includes(x));
    if (missingRel.length) {
        problems.push(
            `related identifiers 未按发送值存储：${missingRel.join('; ')}` +
                `（记录里是：${rel.join('; ') || '无'}）`
        );
    }

    // 作者身份是用户的决定（占位名 vs 站点名），与 .zenodo.json 不同不算错，只提示
    const c1 = storedCreators(stored).join(' | ');
    const c2 = (zenodoJson.creators || []).map((c) => c.name).filter(Boolean).join(' | ');
    if (c1 && c2 && c1 !== c2) warnings.push(`creators：记录写 "${c1}"，包里 .zenodo.json 写 "${c2}"`);

    // 描述会被 Zenodo 的 HTML 白名单处理过，长度/文本有差属正常，不当失败
    if (flat(stored.description) !== flat(want.description)) warnings.push('description：读回文本与发送值不完全一致（HTML 清洗所致，可接受）');

    const lang = (stored.languages || []).map((l) => l.id).filter(Boolean);
    if (want.languages.length && !lang.includes(want.languages[0].id)) {
        warnings.push(`languages 未存储（发送 ${want.languages[0].id}）——不影响发布，只影响筛选项`);
    }

    return { problems, warnings };
}

/** 返回 true=通过；false=有字段被丢弃 */
function reportMetadata(stored, phase) {
    const { problems, warnings } = metadataChecks(stored);
    warnings.forEach((w) => console.log(`  ⚠ ${w}`));
    if (problems.length) {
        console.error(`\n✗ ${phase}：读回值与发送值不一致（${problems.length} 处）——Zenodo 会静默丢弃不认识的字段`);
        problems.forEach((p) => console.error(`  - ${p}`));
        console.error('  对照：license→metadata.rights[].id；keywords→字符串数组；related→relation_type.id（驼峰）。');
        return false;
    }
    console.log(`  ✓ ${phase}：元数据读回一致（title / version / license / keywords / related）`);
    return true;
}

async function main() {
    console.log(`package : ${OUT}`);
    console.log(`files   : ${files.length}${localOnly.length ? ` (+ 本地保留 ${localOnly.join(', ')} 不上传)` : ''}`);
    console.log(`mode    : ${PUBLISH ? 'CREATE/REUSE+UPLOAD+PUBLISH' : RUN ? 'CREATE/REUSE+UPLOAD (draft only)' : 'DRY-RUN'}`);
    console.log(`metadata: "${String(rdmMetadata.title).slice(0, 60)}..." v${rdmMetadata.version}`);

    if (DRY) {
        console.log('\n--dry-run: RDM payload 就绪。');
        console.log('metadata keys:', Object.keys(rdmMetadata).join(', '));
        console.log('rights:', JSON.stringify(rdmMetadata.rights), '| languages:', JSON.stringify(rdmMetadata.languages));
        console.log('keywords:', rdmMetadata.keywords.length, '| related:', JSON.stringify(rdmMetadata.related_identifiers));
        console.log('creators:', JSON.stringify(rdmMetadata.creators));
        process.exit(0);
    }

    const token = (process.env.ZENODO_TOKEN || fs.readFileSync(TOKEN_FILE, 'utf8')).trim();
    if (!token) fail(`no token: ${TOKEN_FILE} 或 ZENODO_TOKEN`);

    // 1. 创建或复用草稿
    let draft;
    if (DRAFT_ID) {
        console.log(`\n[1/4] reusing existing draft ${DRAFT_ID}...`);
        draft = await request('GET', `${API}/records/${DRAFT_ID}/draft`, authHeaders());
        if (draft?.metadata) reportMetadata(draft.metadata, 'draft（复用前）');
    } else {
        console.log('\n[1/4] creating RDM draft...');
        // 新建草稿时元数据校验就在这一步发生：字段形状不对会 400，不会等到上传完才发现
        draft = await request('POST', `${API}/records`, {
            body: JSON.stringify({
                metadata: rdmMetadata,
                access: { record: 'public', files: 'public' },
                files: { enabled: true },
            }),
            headers: { 'Content-Type': 'application/json', ...authHeaders() },
        });
        if (!draft?.metadata || !reportMetadata(draft.metadata, 'draft（创建后）')) {
            console.error(`  草稿 id ${draft?.id ?? '?'} —— 未被静默丢字段的 payload 才能继续上传。`);
            if (draft?.id) console.error(`  修好后可复用: --draft-id=${draft.id}`);
            process.exit(1);
        }
    }
    const id = draft.id;
    const links = draft.links || {};
    console.log(`  draft id: ${id} | concept: ${draft.conceptrecid || '-'}`);
    const draftApi = links.self || `${API}/records/${id}/draft`;

    // 2. 上传文件（RDM 三步：declare → content → commit；幂等：已声明的跳过）
    console.log('[2/4] uploading files...');
    const fileHeaders = { 'Content-Type': 'application/json', ...authHeaders() };
    const existing = new Set();
    try {
        const cur = await request('GET', draftApi, authHeaders());
        for (const e of fileEntries(cur)) existing.add(e.key || e.filename);
    } catch {
        // GET 失败不阻塞——按全新上传处理
    }
    const toDeclare = files.filter((f) => !existing.has(f));
    if (toDeclare.length) {
        await request('POST', `${draftApi}/files`, {
            body: JSON.stringify(toDeclare.map((f) => ({ key: f }))),
            headers: fileHeaders,
        });
    }
    console.log(`  declared: ${toDeclare.length} new / ${existing.size} already present`);

    for (const f of files) {
        const local = path.join(dir, f);
        const body = fs.readFileSync(local);
        process.stdout.write(`  ${f} (${body.length}B)... `);
        await request('PUT', `${draftApi}/files/${encodeURIComponent(f)}/content`, {
            body,
            headers: { 'Content-Type': 'application/octet-stream', ...authHeaders() },
            raw: true,
        });
        await request('POST', `${draftApi}/files/${encodeURIComponent(f)}/commit`, { headers: fileHeaders });
        console.log('✓');
    }

    // 3. 服务端全量复核（文件数 + md5 + MANIFEST 与上传集一致）
    console.log('[3/4] verifying server-side...');
    let verify = null;
    for (let attempt = 1; attempt <= 5; attempt++) {
        verify = await request('GET', draftApi, authHeaders());
        if (fileEntries(verify).length >= files.length) break;
        console.log('  waiting for server file list...');
        await sleep(5000);
    }
    const arr = fileEntries(verify);
    const problems = checkFiles(arr, files.length);
    if (problems.length) fail(`server-side check failed:\n  - ${problems.join('\n  - ')}`);
    console.log(`  ✓ ${files.length} files verified server-side (count + md5)`);

    if (!PUBLISH) {
        console.log('\n[4/4] publish skipped (no --publish).');
        console.log(`草稿就绪。发布: node scripts/zenodo-deposit.mjs --out=${OUT} --draft-id=${id} --publish`);
        console.log(`或网页: https://zenodo.org/uploads/${id} 最后过目后点 Publish。`);
        process.exit(0);
    }

    // 4. 发布（不可逆）
    console.log('[4/4] publishing...');
    const pub = await request('POST', `${draftApi}/actions/publish`, { headers: fileHeaders });
    const recId = pub.id || id;

    // 发布之后再读一遍：状态码是 200 不等于记录里真有 license/keywords
    const published = await request('GET', `${API}/records/${recId}?t=${Date.now()}`, {});
    const postProblems = checkFiles(fileEntries(published), files.length);

    console.log('\n✅ PUBLISHED');
    console.log(`record id        : ${recId}`);
    console.log(`concept recid    : ${published.conceptrecid || pub.conceptrecid || '-'}`);
    console.log(`DOI              : ${published.doi || pub.doi || '(见下方链接页)'}`);
    console.log(`concept DOI      : ${published.conceptdoi || '(同上)'}`);
    console.log(`record HTML      : ${published.links?.record_html || published.links?.self_html || ''}`);
    console.log(`access           : ${published.access?.record || published.metadata?.access_right || '?'}`);
    const ok = reportMetadata(published.metadata || {}, 'published（发布后读回）');
    if (!ok || postProblems.length) {
        console.error('\n⚠ 记录已发布，但读回校验没全过。修正方式：');
        console.error('  · 元数据：记录页 → Edit → 改完 publish（DOI 不变）');
        console.error('  · 文件：Edit files → Edit published files → 替换 → 发布（30 天内、DOI 不变）');
        console.error(`  · 复核：node scripts/zenodo-deposit.mjs --out=${OUT} --verify=${recId}`);
        process.exit(1);
    }
    console.log('\n把 concept DOI 与 version DOI 发回，用于回填 README / data-api / 数据仓 / CITATION.cff。');
    console.log('安全收尾: Zenodo Settings → Applications 删除本令牌。');
}

/** 文件数与 md5 校验（草稿与已发布记录通用） */
function checkFiles(entries, expectedCount) {
    const problems = [];
    if (entries.length !== expectedCount) problems.push(`file count ${entries.length} != ${expectedCount}`);
    for (const ef of entries) {
        const key = ef.key || ef.filename;
        const local = path.join(dir, key);
        if (!fs.existsSync(local)) {
            problems.push(`${key}: 服务端有、本地包没有（这份包与记录不是同一版）`);
            continue;
        }
        const srv = String(ef.checksum || '');
        if (!srv.endsWith(md5(local))) problems.push(`${key}: checksum ${srv} != md5:${md5(local)}`);
    }
    return problems;
}

// ---- 只读复核：完善的「已发布记录 vs 本地包」对账，不需要令牌 ----
async function verifyPublished(recId) {
    const rec = await request('GET', `${API}/records/${recId}?t=${Date.now()}`, {});
    const entries = fileEntries(rec);
    const problems = [];
    const warnings = [];

    console.log(`\nrecord  : ${rec.id} (${rec.status || 'status?'})`);
    console.log(`DOI     : ${rec.doi || '-'}`);
    console.log(`concept : ${rec.conceptdoi || '-'}`);
    console.log(`access  : ${rec.access?.record || rec.metadata?.access_right || '?'}`);
    console.log(`files   : ${entries.length} 已发布\n`);

    // 1. 逐文件下载，比对服务端 md5 与本地包 sha256
    const local = new Map(files.map((f) => [f, path.join(dir, f)]));
    const remote = new Map();
    console.log('key                                bytes      md5  vs-local-package');
    for (const ef of entries) {
        const key = ef.key || ef.filename;
        const url = ef.links?.content || ef.links?.self || `${API}/records/${rec.id}/files/${encodeURIComponent(key)}/content`;
        const buf = await request('GET', url, { raw: true, headers: { Accept: '*/*' } });
        remote.set(key, buf);
        const md5ok = String(ef.checksum || '').endsWith(crypto.createHash('md5').update(buf).digest('hex'));
        const lp = local.get(key);
        const s256 = crypto.createHash('sha256').update(buf).digest('hex');
        const vs = lp
            ? fs.existsSync(lp) && crypto.createHash('sha256').update(fs.readFileSync(lp)).digest('hex') === s256
                ? 'same'
                : 'DIFF'
            : '—';
        if (!md5ok) problems.push(`${key}: 服务端 md5 与下载内容不一致（传输损坏）`);
        if (vs === 'DIFF') warnings.push(`${key}: 线上记录与本地包不同（包是快照，站点文件后来改过属正常）`);
        console.log(`${key.padEnd(32)} ${String(buf.length).padStart(7)}  ${md5ok ? ' ok' : 'BAD'}  ${vs}`);
    }

    // 2. MANIFEST.sha256 自洽：列出的都能对上，发布集里的都被列到
    const mfText = remote.get('MANIFEST.sha256')?.toString('utf8');
    if (!mfText) {
        problems.push('MANIFEST.sha256 不在记录里');
    } else {
        const listed = mfText
            .split('\n')
            .filter((l) => l.trim())
            .map((l) => {
                const [hash, name] = l.split(/\s{2}/);
                return { hash, name };
            });
        const keys = new Set(entries.map((e) => e.key || e.filename));
        for (const { hash, name } of listed) {
            if (!keys.has(name)) {
                problems.push(`MANIFEST.sha256 列了 ${name}，但记录里没有这个文件 —— 下载者 \`sha256sum -c\` 会失败`);
                continue;
            }
            const actual = crypto.createHash('sha256').update(remote.get(name)).digest('hex');
            if (actual !== hash) problems.push(`MANIFEST.sha256 里 ${name} 的哈希与记录里的文件不符`);
        }
        for (const key of keys) {
            if (key !== 'MANIFEST.sha256' && !listed.some((l) => l.name === key)) {
                problems.push(`记录里有 ${key}，但 MANIFEST.sha256 没列 —— 校验会漏掉它`);
            }
        }
        console.log(`\nMANIFEST.sha256: ${listed.length} 行 / ${entries.length} 个文件（含自身），逐条核对完成`);
    }

    // 3. 元数据字段是否齐全
    const md = rec.metadata || {};
    console.log('\nmetadata:');
    console.log(`  license     : ${storedLicense(md) ?? '❌ 缺失'}`);
    console.log(`  keywords    : ${storedKeywords(md).length} 条 ${storedKeywords(md).length ? '' : '❌'}`);
    console.log(`  languages   : ${(md.languages || []).map((l) => l.id).join(', ') || '（未设）'}`);
    console.log(`  resource    : ${storedResourceType(md)}`);
    console.log(`  creators    : ${storedCreators(md).join(' | ') || '❌ 缺失'}`);
    console.log(`  publisher   : ${flat(md.publisher) || '（未设，显示为 Zenodo）'}`);
    console.log(`  version     : ${md.version}  |  publication_date: ${md.publication_date}`);
    console.log(`  related     : ${storedRelated(md).map((r) => r.replace(' ', ' → ')).join(' | ') || '（无）'}`);

    // 与本包 .zenodo.json 的期望值对照（只对「必须一致」的字段报错）
    const { problems: mdProblems, warnings: mdWarnings } = metadataChecks(md);
    problems.push(...mdProblems.map((p) => `metadata: ${p}`));
    warnings.push(...mdWarnings);

    warnings.forEach((w) => console.log(`\n⚠ ${w}`));
    if (problems.length) {
        console.error(`\n✗ ${problems.length} 处需要处理：`);
        problems.forEach((p) => console.error(`  - ${p}`));
        process.exit(1);
    }
    console.log('\n✓ 记录自洽：文件哈希、MANIFEST.sha256、必填元数据全部对得上');
}

function authHeaders() {
    const token = process.env.ZENODO_TOKEN || fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    return { Authorization: `Bearer ${token}` };
}

if (VERIFY_ID) {
    verifyPublished(VERIFY_ID).catch((e) => fail(String(e.message || e).slice(0, 400)));
} else {
    main().catch((e) => fail(String(e.message || e).slice(0, 400)));
}
