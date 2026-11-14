#!/usr/bin/env node
/**
 * Zenodo deposit 上传器 — A 项（数据集 DOI）的执行件。
 *
 * 用法：
 *   1. Zenodo 网页 → Settings → Applications → Personal access tokens → New token
 *      （scope 保持默认 deposit:write 即可）→ 复制令牌
 *   2. 把令牌写进 release/.zenodo-token（该目录已被 .gitignore，不会入库）
 *   3. node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --dry-run
 *      node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 --publish
 *
 * 行为：
 *   --dry-run（默认）: 组装 metadata、列出待上传文件、校验 MD5，不碰网络
 *   实跑:              创建 deposition → 逐文件 PUT 到 bucket → 全量 MD5 复核 → 打印结果
 *   --publish:         上述全部通过后追加发布动作（不可逆，需显式传入）
 *
 * 安全：令牌只从 release/.zenodo-token 读取（或 ZENODO_TOKEN 环境变量），绝不硬编码；
 *       发布完成后建议在 Zenodo 后台删除该令牌。
 *
 * 代理：undici/fetch 不读 HTTPS_PROXY（教训见 verify-dataset-quotes.mjs），
 *       本脚本用 https + HttpsProxyAgent，代理取环境变量。
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
const PUBLISH = flag('publish');
const DRY = flag('dry-run') || (!PUBLISH && !flag('run'));
const TOKEN_FILE = arg('token-file', path.join('release', '.zenodo-token'));
const API = 'https://zenodo.org/api/deposit/depositions';

if (!OUT) fail('用法: node scripts/zenodo-deposit.mjs --out=release/datasets-2026.11.13 [--dry-run|--publish]');
const dir = path.resolve(OUT);
if (!fs.existsSync(dir)) fail(`package not found: ${OUT}`);
const files = fs.readdirSync(dir).filter((f) => fs.statSync(path.join(dir, f)).isFile()).sort();
if (files.length !== 14) fail(`expected 14 files in ${OUT}, found ${files.length}: ${files.join(', ')}`);

const zenodoJson = JSON.parse(fs.readFileSync(path.join(dir, '.zenodo.json'), 'utf8'));
const manifest = JSON.parse(fs.readFileSync(path.join(dir, 'manifest.json'), 'utf8'));

// ---- metadata：全部来自 .zenodo.json（打包器已生成），本脚本零手抄 ----
const metadata = {
    title: zenodoJson.title,
    upload_type: zenodoJson.upload_type || 'dataset',
    publication_date: zenodoJson.publication_date || new Date().toISOString().slice(0, 10),
    access_right: 'open',
    license: zenodoJson.license || 'cc-by-4.0',
    version: zenodoJson.version,
    creators: zenodoJson.creators,
    description: zenodoJson.description,
    keywords: zenodoJson.keywords,
    related_identifiers: zenodoJson.related_identifiers,
};

function fail(msg) {
    console.error(`✗ ${msg}`);
    process.exit(1);
}

function md5(file) {
    return crypto.createHash('md5').update(fs.readFileSync(file)).digest('hex');
}

function request(method, url, { body, headers = {}, raw = false } = {}) {
    return new Promise((resolve, reject) => {
        const proxy = process.env.HTTPS_PROXY || process.env.https_proxy;
        const opts = {
            method,
            headers: { 'User-Agent': 'ctof-datasets-deposit/1.0', ...headers },
            timeout: 60000,
        };
        if (proxy) opts.agent = new HttpsProxyAgent(proxy);
        const req = https.request(url, opts, (res) => {
            const chunks = [];
            res.on('data', (c) => chunks.push(c));
            res.on('end', () => {
                const buf = Buffer.concat(chunks);
                if (res.statusCode >= 400) {
                    return reject(new Error(`HTTP ${res.statusCode}: ${buf.toString('utf8').slice(0, 300)}`));
                }
                resolve(raw ? buf : JSON.parse(buf.toString('utf8') || '{}'));
            });
        });
        req.on('timeout', () => req.destroy(new Error('request timeout')));
        req.on('error', reject);
        if (body) req.write(body);
        req.end();
    });
}

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

// ---- 主流程 ----
console.log(`package : ${OUT}`);
console.log(`files   : ${files.length} (${files.map((f) => `${f}=${md5(path.join(dir, f)).slice(0, 8)}`).join(', ')})`);
console.log(`mode    : ${PUBLISH ? 'CREATE+UPLOAD+PUBLISH' : DRY ? 'DRY-RUN' : 'CREATE+UPLOAD'}`);
console.log(`metadata: "${metadata.title}" v${metadata.version} by ${metadata.creators.map((c) => c.name).join(', ')}`);

if (DRY) {
    console.log('\n--dry-run: metadata payload 就绪，未发起任何网络请求。');
    console.log('实跑: node scripts/zenodo-deposit.mjs --out=' + OUT + ' --publish');
    process.exit(0);
}

const token = process.env.ZENODO_TOKEN || fs.readFileSync(TOKEN_FILE, 'utf8').trim();
if (!token) fail(`no token: write it to ${TOKEN_FILE} or set ZENODO_TOKEN`);

// 1. 创建 deposition
console.log('\n[1/4] creating deposition...');
const dep = await request('POST', API, {
    body: JSON.stringify({ metadata }),
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
});
console.log(`  deposit id: ${dep.id} | bucket: ${dep.links.bucket}`);

// 2. 逐文件上传
console.log('[2/4] uploading files...');
for (const f of files) {
    const local = path.join(dir, f);
    const size = fs.statSync(local).size;
    process.stdout.write(`  ${f} (${size}B)... `);
    const body = fs.readFileSync(local);
    let uploaded = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
        try {
            uploaded = await request('PUT', `${dep.links.bucket}/${encodeURIComponent(f)}`, {
                body,
                headers: { 'Content-Type': 'application/octet-stream' },
                raw: true,
            });
            break;
        } catch (e) {
            if (attempt === 3) throw e;
            console.log(`(retry ${attempt}: ${e.message.slice(0, 60)})`);
            await sleep(5000);
        }
    }
    const served = JSON.parse(uploaded.toString('utf8'));
    if (served.checksum !== `md5:${md5(local)}`) fail(`checksum mismatch after upload: ${f}`);
    console.log(`✓ md5 verified`);
}

// 3. 服务端全量复核
console.log('[3/4] verifying server-side file list...');
let verify = null;
for (let attempt = 1; attempt <= 5; attempt++) {
    verify = await request('GET', `${API}/${dep.id}`, {
        headers: { Authorization: `Bearer ${token}` },
    });
    if ((verify.files || []).length === files.length) break;
    console.log(`  server shows ${(verify.files || []).length}/${files.length}, waiting...`);
    await sleep(5000);
}
if ((verify.files || []).length !== files.length) fail(`file count mismatch server-side`);
for (const vf of verify.files) {
    const local = path.join(dir, decodeURIComponent(vf.filename));
    if (vf.checksum !== `md5:${md5(local)}`) fail(`server-side checksum mismatch: ${vf.filename}`);
}
console.log('  ✓ all 14 files match md5 server-side');

if (!PUBLISH) {
    console.log('\n[4/4] publish skipped (no --publish flag).');
    console.log(`Draft ready: https://zenodo.org/deposit/${dep.id}`);
    console.log('检查无误后: node scripts/zenodo-deposit.mjs --out=' + OUT + ' --publish');
    console.log('或直接在网页上点 Publish。');
    process.exit(0);
}

// 4. 发布（不可逆）
console.log('[4/4] publishing...');
const pub = await request('POST', `${API}/${dep.id}/actions/publish`, {
    headers: { Authorization: `Bearer ${token}` },
});
console.log('\n✅ PUBLISHED');
console.log(`concept DOI (latest): ${pub.metadata?.doi || pub.links?.latest_html || 'see record'}`);
console.log(`record HTML: ${pub.links.record_html}`);
console.log(`latest HTML: ${pub.links.latest_html}`);
console.log('\n把两个 DOI（concept + version）发回，用于回填 README / data-api / 数据仓 / CITATION.cff。');
console.log('安全收尾: 到 Zenodo Settings → Applications 删除本令牌。');
