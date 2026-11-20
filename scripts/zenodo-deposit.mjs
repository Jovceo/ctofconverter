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
 *   1. relation 的写入 id 是【全小写无分隔符】：isdocumentedby / issupplementto / isderivedfrom。
 *      kebab（is-documented-by）与驼峰（isDocumentedBy）都不在词表里 → 校验器 400。
 *      这条不再靠猜：词表本身有公开只读端点，--vocabulary 直接拉下来对（实测 34 条）。
 *   2. 新增读回校验（POST/PUT/发布之后都重新 GET 一遍比对）。
 *   3. 新增 --verify=<recid>：只读复核一条已发布记录（文件 md5 / MANIFEST.sha256 自洽
 *      / 元数据字段齐全），不需要令牌、不发任何写请求。
 *
 * v4（2026-11-19）：令牌通道实测出 v3 没找对的两个真根因——不是「Zenodo shim 剥字段」，
 * 而是【同一 URL 的两套序列化】和【关键词的字段名】：
 *   1. /api/records 按 Accept 头返回两套形状。Accept: application/json 是旧版形状
 *      （access_right / language / resource_type.type），它没有 license 与关键词的映射位，
 *      写进去 HTTP 200 然后静默丢掉；Accept: application/vnd.inveniordm.v1+json 才落库。
 *      → 所有请求（含读回）统一带 RDM_ACCEPT。
 *   2. 关键词在这个实例存 metadata.subjects[{subject}]，不是 metadata.keywords
 *      （实测：发 keywords（无论字符串还是对象数组）都被静默丢弃，发 subjects 立即可读回）。
 *   3. 已发布记录的作者是旧形状 {name, affiliation}，PUT 前必须转成 RDM 形状，否则会丢作者。
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
 *   node scripts/zenodo-deposit.mjs --vocabulary                                  # 词表漂移自检（只读）
 *   node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --edit-published=24269204 \
 *        --files-from=release/ZENODO-FIX-2026.11.13 --publish
 *                                                                                 # 改已发布记录：建编辑草稿
 *                                                                                 # → 改元数据 → 只替换
 *                                                                                 # files-from 里的文件 → 发布
 *                                                                                 # （DOI 不变）
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
const EDIT_ID = arg('edit-published', null);
const FILES_FROM = arg('files-from', null);
const VOCAB = flag('vocabulary');
const PUBLISH = flag('publish');
const RUN = flag('run') || PUBLISH || !!DRAFT_ID || !!EDIT_ID;
const DRY = flag('dry-run') || !RUN;
const TOKEN_FILE = arg('token-file', path.join('release', '.zenodo-token'));
const API = 'https://zenodo.org/api';
// 这一行是「四项缺陷」的真正根因之一：Zenodo 的 /api/records 同时提供两套序列化。
// Accept: application/json → 【旧版】形状（access_right / language / resource_type.type），
//   license 与 keywords 没有映射位，写进去会被静默丢弃（HTTP 200，读回是 null）。
// Accept: application/vnd.inveniordm.v1+json → RDM 原生形状，license 存 metadata.rights[]、
//   关键词存 metadata.subjects[{subject}]（不是 keywords），全都落库。
// 所以：读写一律用 RDM Accept，比对也按 RDM 形状比。
const RDM_ACCEPT = 'application/vnd.inveniordm.v1+json';
// WAF 实测（2026-11-16）：短 UA（"Mozilla/5.0"）在部分方法上被 403 HTML 拦截，必须完整 Chrome UA
const UA =
    'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/126.0.0.0 Safari/537.36';

/**
 * Zenodo 关系词表的【写入 id】：全小写、无分隔符。
 * 来源：GET https://zenodo.org/api/vocabularies/relationtypes（公开只读，2026-11-18 实测 34 条）。
 * 不要再猜形态：kebab（is-documented-by）和驼峰（isDocumentedBy）都不在词表里，PUT 会 400。
 * 词表若变（升级/deprecate），`--vocabulary` 会打出来。
 */
const RELATION_VOCAB = [
    'cites',
    'compiles',
    'continues',
    'describes',
    'documents',
    'hasmetadata',
    'haspart',
    'hasversion',
    'iscitedby',
    'iscompiledby',
    'iscontinuedby',
    'isderivedfrom',
    'isdescribedby',
    'isdocumentedby',
    'isidenticalto',
    'ismetadatafor',
    'isnewversionof',
    'isobsoletedby',
    'isoriginalformof',
    'ispartof',
    'ispreviousversionof',
    'ispublishedin',
    'isreferencedby',
    'isrequiredby',
    'isreviewedby',
    'issourceof',
    'issupplementto',
    'issupplementedby',
    'isvariantformof',
    'isversionof',
    'obsoletes',
    'references',
    'requires',
    'reviews',
];
const RELATION_SET = new Set(RELATION_VOCAB);

/** 任意写法 → 词表 id。大小写/连字符都不影响语义，真正不认识的一律提前失败。 */
const normRel = (s) => String(s ?? '').toLowerCase().replace(/[^a-z]/g, '');

function vocabRelation(id) {
    const n = normRel(id);
    if (!RELATION_SET.has(n)) {
        fail(`unknown relation "${id}" — 不在 Zenodo 词表里（跑 --vocabulary 看当前 ${RELATION_VOCAB.length} 条）`);
    }
    return n;
}

function fail(msg) {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

if (!OUT && !VOCAB) {
    fail(
        '用法: node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 ' +
            '[--dry-run|--run|--publish|--verify=<recid>|--edit-published=<recid>] / --vocabulary'
    );
}
const dir = OUT ? path.resolve(OUT) : null;
const hasPackage = !!dir && fs.existsSync(dir);
if (OUT && !hasPackage) fail(`package not found: ${OUT}`);

// 点开头的文件（.zenodo.json）是给 GitHub Release 用的元数据，Zenodo 的网页与 API 都不收；
// 它也不该出现在 MANIFEST.sha256 里（否则下载者 `sha256sum -c` 会有一条永远对不上）。
const files = hasPackage
    ? fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile() && !f.startsWith('.'))
    : [];
files.sort();
const localOnly = hasPackage
    ? fs.readdirSync(dir).filter((f) => f.startsWith('.') && fs.statSync(path.join(dir, f)).isFile())
    : [];

// --files-from：本轮要替换进记录的文件（如 release/ZENODO-FIX-2026.11.13）。
// 同一文件名两边都有时以它为准——修的是这两个文件，包里的是上一版快照。
const FIX_DIR = FILES_FROM ? path.resolve(FILES_FROM) : null;
if (FILES_FROM && !fs.existsSync(FIX_DIR)) fail(`--files-from 目录不存在: ${FILES_FROM}`);
const fixFiles = FIX_DIR
    ? fs.readdirSync(FIX_DIR).filter((f) => fs.statSync(path.join(FIX_DIR, f)).isFile() && !f.startsWith('.')).sort()
    : [];
if (FILES_FROM && !fixFiles.length) fail(`${FILES_FROM} 里没有可用的文件`);

/** 某个 key 的本地真值文件：--files-from 优先，其次发布包；都没有则 null */
function localFileFor(key) {
    if (FIX_DIR) {
        const p = path.join(FIX_DIR, key);
        if (fs.existsSync(p)) return p;
    }
    if (dir) {
        const p = path.join(dir, key);
        if (fs.existsSync(p)) return p;
    }
    return null;
}

const zenodoJsonPath = hasPackage ? path.join(dir, '.zenodo.json') : null;
const zenodoJson = zenodoJsonPath && fs.existsSync(zenodoJsonPath) ? JSON.parse(fs.readFileSync(zenodoJsonPath, 'utf8')) : null;
if (!VOCAB) {
    if (!zenodoJson) fail(`${OUT} 缺少 .zenodo.json —— 先跑 node scripts/package-datasets.mjs`);
    if (!files.length) fail(`${OUT} 里没有可上传的文件`);
}

// ---- RDM metadata：从 .zenodo.json 映射，零手抄；形状按 InvenioRDM 元数据规范 ----
// 惰性构建：--vocabulary / --verify 这类只读模式不读发布包，也不该因为缺包而崩。
let _rdmMetadata = null;
function rdmMeta() {
    if (_rdmMetadata) return _rdmMetadata;
    if (!zenodoJson) fail('这个模式需要 --out=<发布包>（元数据从包里的 .zenodo.json 映射）');
    _rdmMetadata = {
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
        // 关键词在这个实例里是 metadata.subjects[{subject}]（实测 2026-11-19：发 keywords 会被静默丢弃）
        subjects: (zenodoJson.keywords || []).map((k) => ({ subject: String(k) })),
        related_identifiers: (zenodoJson.related_identifiers || []).map((r) => ({
            identifier: r.identifier,
            scheme: r.scheme || 'url',
            // 写入用词表 id（全小写无分隔符）；读回是 DataCite 驼峰形态，比对时归一化
            relation_type: { id: vocabRelation(r.relation) },
            ...(r.resource_type ? { resource_type: { id: r.resource_type } } : {}),
        })),
    };
    return _rdmMetadata;
}

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

/** 读回/发布后 GET 偶发 404（实测 PUT 200 → 紧接着 GET 404 → 换一个时间戳的同一 URL 立刻 200）：
 *  写入后副本延迟 + 中间层把 404 按 URL 缓存。每次重试都换新的 ?t=，否则会一直吃同一个缓存。 */
async function getRetry(url, headers, attempts = 4) {
    let last;
    for (let i = 1; i <= attempts; i++) {
        const u = url.includes('?t=') ? url.replace(/(\?t=)\d+/, `$1${Date.now()}${i}`) : url;
        try {
            return await request('GET', u, { headers });
        } catch (e) {
            last = e;
            const retriable = e.statusCode === 404 || e.statusCode >= 500 || !e.statusCode;
            if (!retriable) throw e;
            if (i < attempts) {
                console.log(`  (read-back retry ${i}/${attempts - 1}: ${String(e.message).slice(0, 40)})`);
                await sleep(2500 * i);
            }
        }
    }
    throw last;
}

function request(method, url, { body, headers = {}, raw = false } = {}, attemptBudget = 3) {
    return new Promise((resolve, reject) => {
        const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
        const payload = body ? Buffer.from(body) : null;
        const length = payload ? payload.length : null;
        const opts = {
            method,
            headers: {
                'User-Agent': UA,
                Accept: RDM_ACCEPT,
                'Cache-Control': 'no-cache',
                Pragma: 'no-cache',
                ...(length ? { 'Content-Length': length } : {}), // 显式长度：经代理时 chunked body 会被当空体
                ...headers,
            },
            timeout: 60000,
        };
        if (proxy) opts.agent = new HttpsProxyAgent(proxy);
        if (process.env.ZENODO_DEBUG) console.log(`  → ${method} ${url} (${length ?? 0}B)`);
        const req = https.request(url, opts, (res) => {
            if (process.env.ZENODO_DEBUG) console.log(`  ← ${res.statusCode} ${res.headers['content-type'] || ''}`);
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
                if (raw) return resolve(buf);
                try { resolve(JSON.parse(buf.toString('utf8') || '{}')); }
                catch { resolve(buf.toString('utf8')); } // 某些 2xx 响应体不是 JSON（实测出现过字面量 [object Object]）——返回原文让上层判断
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
// RDM 形状的 DOI 在 pids.doi.identifier，旧版形状在顶层 doi
const recordDoi = (r) => r?.doi || r?.pids?.doi?.identifier || r?.metadata?.doi || null;
const recordConceptDoi = (r) => r?.conceptdoi || r?.parent?.pids?.doi?.identifier || null;
const storedLicense = (m) => firstId(m.rights) ?? firstId(m.license);
const storedKeywords = (m) =>
    (m.keywords ?? m.subjects ?? [])
        .map((x) => (typeof x === 'string' ? x : (x.keyword ?? x.subject)))
        .filter(Boolean);
const storedRelated = (m) =>
    (m.related_identifiers || []).map((r) => `${normRel(r.relation_type?.id ?? r.relation)} ${r.identifier}`);
const storedCreators = (m) =>
    (m.creators || []).map((c) => c.person_or_org?.name ?? c.name ?? [c.given_name, c.family_name].filter(Boolean).join(' '));
const storedResourceType = (m) => m.resource_type?.id ?? m.resource_type?.type ?? null;
const flat = (s) => String(s ?? '').replace(/\s+/g, ' ').trim();

function metadataChecks(stored) {
    const problems = [];
    const warnings = [];
    const want = rdmMeta();

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
    const wantKw = (want.subjects || []).map((s) => s.subject);
    if (!kw.length) problems.push('关键词（subjects）缺失 —— 这个实例存 metadata.subjects[{subject}]，发 keywords 会被静默丢弃');
    else if ([...kw].sort().join('|') !== [...wantKw].sort().join('|')) {
        problems.push(`subjects（记录 ${kw.length} 条 / 应为 ${wantKw.length} 条）`);
    }

    const rel = storedRelated(stored);
    // 记录里存的是输出序列化（DataCite 驼峰），发送的是词表 id（小写）→ 两边都归一化再比
    const wantRel = want.related_identifiers.map((r) => `${normRel(r.relation_type.id)} ${r.identifier}`);
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
        console.error('  对照：Accept 必须是 vnd.inveniordm.v1+json；license→metadata.rights[].id；关键词→metadata.subjects[{subject}]；related→relation_type.id。');
        return false;
    }
    console.log(`  ✓ ${phase}：元数据读回一致（title / version / license / subjects / related）`);
    return true;
}

async function main() {
    console.log(`package : ${OUT}`);
    console.log(`files   : ${files.length}${localOnly.length ? ` (+ 本地保留 ${localOnly.join(', ')} 不上传)` : ''}`);
    console.log(`mode    : ${PUBLISH ? 'CREATE/REUSE+UPLOAD+PUBLISH' : RUN ? 'CREATE/REUSE+UPLOAD (draft only)' : 'DRY-RUN'}`);
    console.log(`metadata: "${String(rdmMeta().title).slice(0, 60)}..." v${rdmMeta().version}`);

    if (DRY) {
        console.log('\n--dry-run: RDM payload 就绪。');
        console.log('metadata keys:', Object.keys(rdmMeta()).join(', '));
        console.log('rights:', JSON.stringify(rdmMeta().rights), '| languages:', JSON.stringify(rdmMeta().languages));
        console.log('subjects:', rdmMeta().subjects.length, '| related:', JSON.stringify(rdmMeta().related_identifiers));
        console.log('creators:', JSON.stringify(rdmMeta().creators));
        process.exit(0);
    }

    const token = (process.env.ZENODO_TOKEN || fs.readFileSync(TOKEN_FILE, 'utf8')).trim();
    if (!token) fail(`no token: ${TOKEN_FILE} 或 ZENODO_TOKEN`);

    // 1. 创建或复用草稿
    let draft;
    if (DRAFT_ID) {
        console.log(`\n[1/4] reusing existing draft ${DRAFT_ID}...`);
        draft = await request('GET', `${API}/records/${DRAFT_ID}/draft`, { headers: authHeaders() });
        if (draft?.metadata) reportMetadata(draft.metadata, 'draft（复用前）');
    } else {
        console.log('\n[1/4] creating RDM draft...');
        // 新建草稿时元数据校验就在这一步发生：字段形状不对会 400，不会等到上传完才发现
        draft = await request('POST', `${API}/records`, {
            body: JSON.stringify({
                metadata: rdmMeta(),
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
        const cur = await request('GET', draftApi, { headers: authHeaders() });
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
        verify = await request('GET', draftApi, { headers: authHeaders() });
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
    const published = await getRetry(`${API}/records/${recId}?t=${Date.now()}`, {});
    const postProblems = checkFiles(fileEntries(published), files.length);

    console.log('\n✅ PUBLISHED');
    console.log(`record id        : ${recId}`);
    console.log(`concept recid    : ${published.conceptrecid || pub.conceptrecid || '-'}`);
    console.log(`DOI              : ${recordDoi(published) || recordDoi(pub) || '(见下方链接页)'}`);
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
        const local = localFileFor(key);
        if (!local) {
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
    console.log(`DOI     : ${recordDoi(rec) || '-'}`);
    console.log(`concept : ${recordConceptDoi(rec) || '-'}`);
    console.log(`access  : ${rec.access?.record || rec.metadata?.access_right || '?'}`);
    console.log(`files   : ${entries.length} 已发布\n`);

    // 1. 逐文件下载，比对服务端 md5 与本地包 sha256
    const local = new Map(entries.map((e) => [e.key || e.filename, localFileFor(e.key || e.filename)]));
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
            ? crypto.createHash('sha256').update(fs.readFileSync(lp)).digest('hex') === s256
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
    console.log(`  subjects    : ${storedKeywords(md).length} 条 ${storedKeywords(md).length ? '' : '❌'}`);
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

// ---- 词表漂移自检（只读）：写入 id 的唯一真值来源 ----
async function checkVocabulary() {
    console.log('源: GET https://zenodo.org/api/vocabularies/relationtypes?size=100\n');
    const res = await request('GET', `${API}/vocabularies/relationtypes?size=100`, {});
    const live = (res.hits?.hits || []).map((h) => h.id).filter(Boolean);
    if (!live.length) fail('词表端点是空的 —— 接口可能改版了，先手工确认再发版');
    const liveSet = new Set(live);
    const missing = RELATION_VOCAB.filter((id) => !liveSet.has(id)); // 脚本会发、服务端不认 → 发布必 400
    const added = live.filter((id) => !RELATION_SET.has(id)); // 服务端有、脚本没收录 → 只是没得用
    console.log(`服务端 ${live.length} 条 / 脚本内置 ${RELATION_VOCAB.length} 条`);
    console.log(`\n本页要用的三个：`);
    for (const id of ['isdocumentedby', 'issupplementto', 'isderivedfrom']) {
        console.log(`  ${id.padEnd(16)} ${liveSet.has(id) ? '✓ 在词表里' : '✗ 不在词表里'}`);
    }
    if (added.length) console.log(`\n服务端新增（可选补进 RELATION_VOCAB）: ${added.join(', ')}`);
    if (missing.length) {
        console.error(`\n✗ 脚本里有 ${missing.length} 条服务端已不认——现在发布会被 400 拒: ${missing.join(', ')}`);
        console.error('  修法：把 RELATION_VOCAB 换成上面服务端返回的 id 列表（全小写无分隔符）。');
        process.exit(1);
    }
    console.log('\n✓ 脚本内置词表与线上一致');
}

// ---- 修改已发布记录：Edit → 改元数据 → 只替换 --files-from 里的文件 → Publish（DOI 不变）----
// 与 main() 的区别：main() 是「新草稿 → 发布新记录」；这里是「已发布记录开编辑草稿 → 发布」。
// 硬约束（Zenodo 规则）：文件改动只能在发布后 30 天内；DOI 不变；不要用 New version。
async function editPublished(recId) {
    if (!zenodoJson) fail('--edit-published 需要 --out=<发布包>（元数据以它为准）');
    if (!FIX_DIR) fail('--edit-published 需要 --files-from=<要替换的文件目录>');

    const before = await request('GET', `${API}/records/${recId}?t=${Date.now()}`, {});
    if (before.status !== 'published') fail(`记录 ${recId} 状态是 ${before.status}，不是 published`);
    // 只替换「记录里本来就有」的文件：修复目录里的流程文件（清单、脚本）不属于记录内容
    const recordKeys = new Set(fileEntries(before).map((e) => e.key || e.filename));
    const replaceKeys = fixFiles.filter((f) => recordKeys.has(f));
    const skipped = fixFiles.filter((f) => !recordKeys.has(f));
    if (!replaceKeys.length) fail(`${FILES_FROM} 里的文件在记录中一个都不存在 —— 检查目录是否选错`);
    console.log(`record  : ${recId} | DOI ${recordDoi(before)} | files ${recordKeys.size}`);
    console.log(`metadata: ${OUT}（.zenodo.json）`);
    console.log(`replace : ${replaceKeys.join(', ')}`);
    if (skipped.length) console.log(`skip    : ${skipped.join(', ')}（记录里没有，按流程文件跳过）`);

    // 1. 开编辑草稿（已存在就复用，不因并发冲突直接放弃）
    console.log('\n[1/5] opening edit draft...');
    let draft;
    try {
        draft = await request('POST', `${API}/records/${recId}/draft`, { headers: authHeaders() });
    } catch (e) {
        if (e.statusCode !== 400) throw e;
        console.log('  （已存在编辑草稿，复用）');
        draft = await request('GET', `${API}/records/${recId}/draft`, { headers: authHeaders() });
    }
    const draftApi = draft.links?.self || `${API}/records/${recId}/draft`;
    console.log(`  draft id: ${draft.id} | api: ${draftApi}`);

    // 2. PUT 元数据 + 读回断言（Zenodo 会静默丢字段，200 不算数）
    // 作者沿用记录里现有的：包里 .zenodo.json 还是占位名 Jovceo，整包重发会把引用口径
    // 从 ctofconverter.com 改回去——作者口径的变更走下一个数据版本，不夹带在补正里。
    // 注意：已发布记录读回的作者是旧形状 {name, affiliation}，PUT 要 RDM 形状，必须转换。
    console.log('[2/5] PUT metadata → read back...');
    const currentCreators = before.metadata?.creators || [];
    const meta = {
        ...rdmMeta(),
        creators: currentCreators.length ? currentCreators.map(toRdmCreator) : rdmMeta().creators,
    };
    console.log(`  creators 保持记录现值: ${meta.creators.map((c) => c.person_or_org?.name).join(' | ')}`);
    // 缓存炸弹：同一个 PUT URL 被观测到会重放上一次的 404（本机代理/中间层缓存）。
    // 加时间戳能让它每次都是新请求——实测加参数后同一个 PUT 立刻 200。
    await request('PUT', `${draftApi}?t=${Date.now()}`, {
        body: JSON.stringify({
            metadata: meta,
            access: { record: 'public', files: 'public' },
            files: { enabled: true },
        }),
        headers: { 'Content-Type': 'application/json', ...authHeaders() },
    });
    const mdBack = await getRetry(`${draftApi}?t=${Date.now()}`, authHeaders());
    if (!reportMetadata(mdBack.metadata || {}, 'edit draft（PUT 之后）')) {
        console.error('\n✗ 元数据没有被完整存储 —— 现在发布只会得到一条同样残缺的记录，已停在发布前。');
        console.error('  元数据这条路在 API 上不通时，用网页编辑: https://zenodo.org/records/' + recId + '/edit');
        console.error(`  丢弃这个草稿: curl -X DELETE -H "Authorization: Bearer $ZENODO_TOKEN" ${API}/records/${recId}/draft`);
        process.exit(1);
    }

    // 3. 只替换 replaceKeys（删旧 → 声明 → 传内容 → commit）
    console.log('[3/5] replacing files...');
    const fileHeaders = { 'Content-Type': 'application/json', ...authHeaders() };
    // 已发布记录的文件桶默认上锁：DELETE/PUT 会 403 "Bucket is locked for modifications"。
    // 先发一次 file-modification 请求（等价于网页 "Edit files → Edit published files" 的确认框），
    // 它返回 is_locked:false，之后文件操作才放行。重复请求会是 400/409，忽略即可。
    try {
        const fm = await request('POST', `${API}/records/${recId}/file-modification?t=${Date.now()}`, {
            headers: fileHeaders,
        });
        console.log(`  file bucket: ${fm?.is_locked === false ? 'unlocked ✓' : JSON.stringify(fm).slice(0, 80)}`);
    } catch (e) {
        // 已经开过一次时服务端会报 400/409/500（错误包装不统一）——不致命：
        // 桶是否真的解锁，由下一步的 DELETE 直接给出答案（403 = 仍锁）。
        console.log(`  file bucket: modification request 未新建（${String(e.message).slice(0, 40)}），继续试文件操作`);
    }
    const present = new Set(fileEntries(mdBack).map((e) => e.key || e.filename));
    for (const f of replaceKeys) {
        if (present.has(f)) {
            await request('DELETE', `${draftApi}/files/${encodeURIComponent(f)}`, { headers: fileHeaders });
        }
        await request('POST', `${draftApi}/files`, {
            body: JSON.stringify([{ key: f }]),
            headers: fileHeaders,
        });
        const local = path.join(FIX_DIR, f);
        const body = fs.readFileSync(local);
        await request('PUT', `${draftApi}/files/${encodeURIComponent(f)}/content?t=${Date.now()}`, {
            body,
            headers: { 'Content-Type': 'application/octet-stream', ...authHeaders() },
            raw: true,
        });
        await request('POST', `${draftApi}/files/${encodeURIComponent(f)}/commit`, { headers: fileHeaders });
        console.log(`  ✓ ${f} (${body.length}B, md5 ${md5(local)})`);
    }

    // 4. 草稿文件全量对账（数量不变；每个文件都要在本地能对上）
    console.log('[4/5] verifying draft files...');
    const draftFiles = fileEntries(await getRetry(`${draftApi}?t=${Date.now()}`, authHeaders()));
    const fileProblems = checkFiles(draftFiles, draftFiles.length);
    if (fileProblems.length) fail(`草稿文件校验失败：\n  - ${fileProblems.join('\n  - ')}`);
    console.log(`  ✓ ${draftFiles.length} 个文件与本地一致`);

    if (!PUBLISH) {
        console.log('\n[publish 跳过] 草稿就绪。发布: 同上命令加 --publish');
        console.log(`或网页过目: https://zenodo.org/uploads/${draft.id}`);
        process.exit(0);
    }

    // 5. 发布 + 全量复核
    console.log('[5/5] publishing...');
    const pub = await request('POST', `${draftApi}/actions/publish`, { headers: fileHeaders });
    const finalId = pub.id || recId;
    const after = await getRetry(`${API}/records/${finalId}?t=${Date.now()}`, {});
    const afterProblems = checkFiles(fileEntries(after), draftFiles.length);
    const mdOk = reportMetadata(after.metadata || {}, 'published（发布后读回）');

    console.log('\n✅ REPUBLISHED');
    console.log(`record id    : ${finalId}`);
    console.log(`DOI          : ${recordDoi(after)}${recordDoi(after) === recordDoi(before) ? '（未变 ✓）' : '  ← 变了，异常！'}`);
    console.log(`concept DOI  : ${recordConceptDoi(after) || '-'}`);
    console.log(`files        : ${fileEntries(after).length}`);
    if (!mdOk || afterProblems.length || recordDoi(after) !== recordDoi(before)) {
        console.error('\n⚠ 已发布但读回没全过：');
        afterProblems.forEach((p) => console.error(`  - ${p}`));
        console.error(`  复核: node scripts/zenodo-deposit.mjs --out=${OUT} --files-from=${FILES_FROM} --verify=${finalId}`);
        process.exit(1);
    }
    console.log('\n复核: node scripts/zenodo-deposit.mjs --out=' + OUT + ' --files-from=' + FILES_FROM + ' --verify=' + finalId);
}

function authHeaders() {
    let token = process.env.ZENODO_TOKEN;
    if (!token) {
        if (!fs.existsSync(TOKEN_FILE)) {
            fail(`没有令牌：${TOKEN_FILE} 不存在，ZENODO_TOKEN 也没设（写操作需要 deposit:write + deposit:actions）`);
        }
        token = fs.readFileSync(TOKEN_FILE, 'utf8').trim();
    }
    if (!token) fail(`令牌是空的：${TOKEN_FILE}`);
    return { Authorization: `Bearer ${token}` };
}

if (VOCAB) {
    checkVocabulary().catch((e) => fail(String(e.message || e).slice(0, 400)));
} else if (VERIFY_ID) {
    verifyPublished(VERIFY_ID).catch((e) => fail(String(e.message || e).slice(0, 400)));
} else if (EDIT_ID) {
    editPublished(EDIT_ID).catch((e) => fail(String(e.message || e).slice(0, 400)));
} else {
    main().catch((e) => fail(String(e.message || e).slice(0, 400)));
}
