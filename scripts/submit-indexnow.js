const fs = require('fs');
const path = require('path');

const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const SITE_URL = 'https://ctofconverter.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

async function submit() {
  const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) {
    console.log('⚠️ sitemap.xml not found, skipping IndexNow');
    return;
  }

  const content = fs.readFileSync(sitemapPath, 'utf-8');
  const matches = content.match(/<loc>(.*?)<\/loc>/g);
  if (!matches) {
    console.log('⚠️ No URLs found in sitemap, skipping IndexNow');
    return;
  }

  const urlList = matches.map(m => m.replace(/<\/?loc>/g, ''));

  const response = await fetch(INDEXNOW_ENDPOINT, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json; charset=utf-8' },
    body: JSON.stringify({
      host: 'ctofconverter.com',
      key: INDEXNOW_KEY,
      keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
      urlList,
    }),
  });

  if (response.ok) {
    console.log(`✅ IndexNow: ${urlList.length} URLs submitted (HTTP ${response.status})`);
  } else {
    const text = await response.text();
    console.log(`⚠️ IndexNow: HTTP ${response.status} — ${text}`);
  }
}

submit().catch(err => {
  console.error('❌ IndexNow submission failed:', err.message);
  process.exit(0); // Don't fail the build
});
