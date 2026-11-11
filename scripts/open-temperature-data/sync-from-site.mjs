#!/usr/bin/env node
/**
 * sync-from-site.mjs — the mirror script that lives in the open-temperature-data repository.
 *
 * This file is COPIED VERBATIM by scripts/build-dataset-repo.mjs into
 * release/open-temperature-data/scripts/sync-from-site.mjs. Edit it here, never in the staging
 * folder: the staging folder is regenerated from scratch on every build.
 *
 * What it does: the site's build generates https://ctofconverter.com/data/* from a single source
 * (config/datasets/ in the site repository). This script mirrors that published layer into data/,
 * so the snapshot cannot quietly drift from what the site actually serves.
 *
 *   node scripts/sync-from-site.mjs           pull + validate + write (idempotent)
 *   node scripts/sync-from-site.mjs --check   validate + compare only; exit 1 if out of sync
 *
 * No secrets, no tokens: only public URLs are read. Set OTD_BASE to point at a preview deployment
 * or a local static server when testing changes to this script.
 */

import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { fileURLToPath } from 'node:url';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..');
const DATA = path.join(ROOT, 'data');
const BASE = process.env.OTD_BASE || 'https://ctofconverter.com/data';
const CHECK_ONLY = process.argv.includes('--check');
const STATE_FILE = path.join(ROOT, 'SYNC-STATE.json');

const REQUIRED_ROW_FIELDS = ['source', 'source_url', 'quote', 'checked_on'];

function fail(msg) {
    console.error('✗ ' + msg);
    process.exit(1);
}

function sha256(buffer) {
    return crypto.createHash('sha256').update(buffer).digest('hex');
}

/** Fetch with a small retry budget: a transient 5xx should not fail the weekly job. */
async function get(name) {
    const url = BASE + '/' + name;
    let lastError = 'no attempt made';
    let attempts = 0;
    for (let attempt = 1; attempt <= 3; attempt += 1) {
        attempts = attempt;
        try {
            const res = await fetch(url, {
                headers: { 'user-agent': 'open-temperature-data-sync/1.0' },
                signal: AbortSignal.timeout(20000),
            });
            if (res.ok) return Buffer.from(await res.arrayBuffer());
            lastError = 'HTTP ' + res.status;
            if (res.status < 500) break; // a 4xx will not fix itself
        } catch (err) {
            lastError = err && err.message ? err.message : String(err);
        }
        await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
    }
    return fail(url + ' -> ' + lastError + ' (after ' + attempts + ' attempt(s))');
}

function validate(id, buffer) {
    let doc;
    try {
        doc = JSON.parse(buffer.toString('utf8'));
    } catch {
        fail(id + ': downloaded file is not valid JSON');
    }
    if (doc.id !== id) fail(id + ': file declares id "' + doc.id + '"');
    for (const key of ['version', 'updated', 'license']) {
        if (!doc[key]) fail(id + ': missing "' + key + '"');
    }
    if (!Array.isArray(doc.provenance) || doc.provenance.length === 0) fail(id + ': empty provenance');
    if (!Array.isArray(doc.rows) || doc.rows.length === 0) fail(id + ': no rows');
    doc.rows.forEach((row, i) => {
        for (const key of REQUIRED_ROW_FIELDS) {
            if (!row[key]) fail(id + ' row ' + i + ': missing "' + key + '"');
        }
    });
    return doc;
}

function writeManifest(files) {
    const lines = files
        .slice()
        .sort()
        .map((name) => sha256(fs.readFileSync(path.join(DATA, name))) + '  data/' + name);
    fs.writeFileSync(path.join(ROOT, 'MANIFEST.sha256'), lines.join('\n') + '\n', 'utf8');
    return lines.length;
}

/**
 * Record the outcome of this check. Written on every run, so the weekly job always has a commit
 * to make — which also keeps the repository from looking inactive and losing its schedule.
 */
function writeState(changed, datasets) {
    const state = {
        lastChecked: new Date().toISOString(),
        source: BASE + '/',
        result: changed.length ? 'updated from site' : 'in sync',
        changedFiles: changed,
        datasets,
        note: 'Written by scripts/sync-from-site.mjs on every run. Do not edit by hand.',
    };
    fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2) + '\n', 'utf8');
}

async function main() {
    fs.mkdirSync(DATA, { recursive: true });

    const manifestBuffer = await get('manifest.json');
    const manifest = JSON.parse(manifestBuffer.toString('utf8'));
    if (!Array.isArray(manifest.datasets) || manifest.datasets.length === 0) fail('manifest lists no datasets');

    const incoming = new Map([['manifest.json', manifestBuffer]]);
    const summary = [];

    for (const entry of manifest.datasets) {
        const names = [entry.id + '.json', entry.id + '.csv'];
        for (const name of names) {
            const buffer = await get(name);
            if (name.endsWith('.json')) {
                const doc = validate(entry.id, buffer);
                if (doc.rows.length !== entry.rows) {
                    fail(entry.id + ': manifest says ' + entry.rows + ' rows, file has ' + doc.rows.length);
                }
                if (doc.version !== entry.version || doc.updated !== entry.updated) {
                    fail(entry.id + ': file version/updated disagrees with the manifest');
                }
                summary.push({ id: entry.id, rows: doc.rows.length, version: doc.version, updated: doc.updated });
            }
            incoming.set(name, buffer);
        }
    }

    const changed = [];
    for (const [name, buffer] of incoming) {
        const target = path.join(DATA, name);
        const current = fs.existsSync(target) ? fs.readFileSync(target) : null;
        if (!current || sha256(current) !== sha256(buffer)) changed.push(name);
    }

    summary.forEach((s) => console.log(s.id + ': ' + s.rows + ' rows, v' + s.version + ', checked ' + s.updated));

    if (CHECK_ONLY) {
        if (changed.length) {
            console.error('✗ out of sync: ' + changed.join(', '));
            process.exit(1);
        }
        console.log('✓ in sync with ' + BASE);
        return;
    }

    if (changed.length) {
        for (const [name, buffer] of incoming) {
            if (changed.includes(name)) fs.writeFileSync(path.join(DATA, name), buffer);
        }
        const count = writeManifest([...incoming.keys()]);
        console.log('✓ updated ' + changed.length + ' file(s); MANIFEST.sha256 covers ' + count + ' files');
    } else {
        console.log('✓ already in sync with ' + BASE);
    }

    writeState(changed, summary);
}

main().catch((err) => fail(err.stack || String(err)));
