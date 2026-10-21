const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_URL = 'https://ctofconverter.com';
const HOST = 'ctofconverter.com';
const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'; // Must match public/key.txt
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * 用法：
 *   node scripts/manual-indexnow.js --urls "https://ctofconverter.com/a,https://ctofconverter.com/b"
 *       → 只提交指定 URL（推荐用法，单条/少量）
 *   node scripts/manual-indexnow.js --urls "..." --dry-run
 *       → 只打印将要提交的 URL，不发请求
 *   node scripts/manual-indexnow.js --all
 *       → 提交 sitemap 里的全部 URL（**全量灌入**，方案 0.7① 已暂缓，慎用）
 *   node scripts/manual-indexnow.js
 *       → 只打印将提交的数量与前若干条，不发请求（fail-closed）
 *
 * 背景：本脚本原实现无参数时直接全量提交 sitemap（82 条），属 0.7① 明令暂缓的
 * 「批量 URL 提交」。2026-10-21 改为默认不发请求，必须显式 --urls 或 --all。
 */

function parseArgs(argv) {
  const args = { urls: null, all: false, dryRun: false, help: false };
  for (let i = 0; i < argv.length; i += 1) {
    const a = argv[i];
    if (a === '--urls') {
      args.urls = String(argv[i + 1] || '');
      i += 1;
    } else if (a.startsWith('--urls=')) {
      args.urls = a.slice('--urls='.length);
    } else if (a === '--all') {
      args.all = true;
    } else if (a === '--dry-run') {
      args.dryRun = true;
    } else if (a === '--help' || a === '-h') {
      args.help = true;
    }
  }
  return args;
}

function readSitemapUrls() {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ public/sitemap.xml not found. Run "node scripts/generate-sitemap.js" first.');
    process.exit(1);
  }
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = content.match(/<loc>(.*?)<\/loc>/g);
  if (!matches) {
    console.error('❌ No URLs found in sitemap.');
    process.exit(1);
  }
  return matches.map((m) => m.replace(/<\/?loc>/g, '').trim());
}

async function submitUrls(urls) {
  if (!urls || urls.length === 0) {
    console.log('⚠️ No URLs to submit.');
    return;
  }

  const payload = JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: KEY_LOCATION,
    urlList: urls,
  });

  const options = {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Content-Length': Buffer.byteLength(payload),
    },
  };

  return new Promise((resolve, reject) => {
    const req = https.request(INDEXNOW_ENDPOINT, options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          console.log(`✅ Success! Submitted ${urls.length} URLs. Status: ${res.statusCode}`);
          resolve();
        } else {
          console.error(`❌ Failed. Status: ${res.statusCode}`);
          console.error('Response:', data);
          reject(new Error(`Status ${res.statusCode}`));
        }
      });
    });

    req.on('error', (e) => {
      console.error('❌ Request error:', e.message);
      reject(e);
    });

    req.write(payload);
    req.end();
  });
}

async function main() {
  const args = parseArgs(process.argv.slice(2));

  if (args.help) {
    console.log('用法：');
    console.log('  --urls "<url1>,<url2>"   只提交指定 URL（推荐）');
    console.log('  --dry-run                只打印，不发请求');
    console.log('  --all                    提交 sitemap 全部 URL（0.7① 已暂缓，慎用）');
    console.log('  无参数                   只打印预览，不发请求');
    return;
  }

  let urls;
  if (args.urls) {
    urls = args.urls
      .split(',')
      .map((u) => u.trim())
      .filter(Boolean);
    if (urls.length === 0) {
      console.error('❌ --urls 为空。');
      process.exit(1);
    }
    const bad = urls.filter((u) => !u.startsWith(`https://${HOST}/`));
    if (bad.length) {
      console.error('❌ 以下 URL 不属于 ' + HOST + '，已拒绝：');
      for (const u of bad) console.error('   ' + u);
      process.exit(1);
    }
  } else if (args.all) {
    urls = readSitemapUrls();
    console.log(`⚠️  --all：将提交 sitemap 全部 ${urls.length} 条（全量灌入，方案 0.7① 已暂缓）。`);
  } else {
    const preview = readSitemapUrls();
    console.log('ℹ️  未指定 --urls 或 --all，仅预览，未提交任何 URL。');
    console.log(`   sitemap 共 ${preview.length} 条，前 5 条：`);
    for (const u of preview.slice(0, 5)) console.log('   ' + u);
    console.log('\n   单条/少量提交请用：node scripts/manual-indexnow.js --urls "<url>"');
    return;
  }

  console.log(`\n将提交 ${urls.length} 条 URL：`);
  for (const u of urls) console.log('  ' + u);

  if (args.dryRun) {
    console.log('\n🔍 --dry-run：未发送请求。');
    return;
  }

  await submitUrls(urls);
}

main().catch(() => process.exit(1));
