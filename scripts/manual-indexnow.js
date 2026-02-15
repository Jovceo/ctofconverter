const fs = require('fs');
const path = require('path');
const https = require('https');

const SITE_URL = 'https://ctofconverter.com';
const KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6'; // Must match public/key.txt
const KEY_LOCATION = `${SITE_URL}/${KEY}.txt`;
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function submitUrls(urls) {
  if (!urls || urls.length === 0) {
    console.log('⚠️ No URLs to submit.');
    return;
  }

  const payload = JSON.stringify({
    host: 'ctofconverter.com',
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

function main() {
  const sitemapPath = path.join(__dirname, '../public/sitemap.xml');

  if (!fs.existsSync(sitemapPath)) {
    console.error('❌ public/sitemap.xml not found. Run "node scripts/generate-sitemap.js" first.');
    process.exit(1);
  }

  console.log('📖 Reading sitemap...');
  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = content.match(/<loc>(.*?)<\/loc>/g);

  if (!matches) {
    console.error('❌ No URLs found in sitemap.');
    process.exit(1);
  }

  const urls = matches.map((m) => m.replace(/<\/?loc>/g, ''));
  console.log(`🔍 Found ${urls.length} URLs in sitemap.`);

  // Submit in batches of 10,000 (IndexNow limit)
  const BATCH_SIZE = 10000;
  (async () => {
    for (let i = 0; i < urls.length; i += BATCH_SIZE) {
      const batch = urls.slice(i, i + BATCH_SIZE);
      console.log(`🚀 Submitting batch ${i / BATCH_SIZE + 1} (${batch.length} URLs)...`);
      try {
        await submitUrls(batch);
      } catch (err) {
        process.exit(1);
      }
    }
  })();
}

main();
