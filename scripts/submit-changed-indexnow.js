const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const SITE_URL = 'https://ctofconverter.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

// Files that trigger full sitemap resubmission
const FULL_RESUBMIT_FILES = [
  'config/migrated-routes.json',
  'next.config.js',
  'scripts/generate-sitemap.js',
];

function getChangedFiles() {
  try {
    // Get changed files in the latest push
    const output = execSync('git diff --name-only --diff-filter=AMR HEAD~1 HEAD', {
      encoding: 'utf-8',
      maxBuffer: 1024 * 1024,
    }).trim();

    if (!output) return [];
    return output.split('\n').filter(Boolean);
  } catch (e) {
    // Fallback: try GitHub Actions env
    const before = process.env.GITHUB_EVENT_BEFORE;
    const sha = process.env.GITHUB_SHA;
    if (before && sha) {
      try {
        const output = execSync(`git diff --name-only --diff-filter=AMR ${before} ${sha}`, {
          encoding: 'utf-8',
          maxBuffer: 1024 * 1024,
        }).trim();
        return output ? output.split('\n').filter(Boolean) : [];
      } catch (e2) {
        console.log('⚠️ Could not detect changed files, submitting full sitemap.');
        return null; // null = submit all
      }
    }
    console.log('⚠️ Could not detect changed files, submitting full sitemap.');
    return null;
  }
}

function mapFilesToUrls(files) {
  const urls = new Set();

  for (const file of files) {
    // Check if file triggers full resubmission
    if (FULL_RESUBMIT_FILES.includes(file)) {
      console.log(`📋 ${file} changed - submitting full sitemap.`);
      return null; // null = submit all
    }

    // pages/*.tsx -> URL
    if (file.startsWith('pages/') && file.endsWith('.tsx')) {
      const slug = file
        .replace('pages/', '')
        .replace('.tsx', '');

      // Skip non-page files
      if (['_app', '_document', '_error', '404'].includes(slug)) continue;
      if (slug.startsWith('api/')) continue;

      const url = slug === 'index' ? SITE_URL : `${SITE_URL}/${slug}`;
      urls.add(url);
    }

    // locales/en/*.json -> URL
    if (file.startsWith('locales/en/') && file.endsWith('.json')) {
      const slug = file
        .replace('locales/en/', '')
        .replace('.json', '');

      const url = slug === 'home' ? SITE_URL : `${SITE_URL}/${slug}`;
      urls.add(url);
    }
  }

  return Array.from(urls);
}

async function submitUrls(urlList) {
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
    console.log(`⚠️ IndexNow: HTTP ${response.status} - ${text}`);
  }
}

async function main() {
  const changedFiles = getChangedFiles();

  if (changedFiles === null) {
    // Submit all URLs from sitemap
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    if (!fs.existsSync(sitemapPath)) {
      console.log('⚠️ sitemap.xml not found, skipping IndexNow.');
      return;
    }
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const matches = content.match(/<loc>(.*?)<\/loc>/g);
    if (!matches) {
      console.log('⚠️ No URLs found in sitemap, skipping IndexNow.');
      return;
    }
    const allUrls = matches.map(m => m.replace(/<\/?loc>/g, ''));
    console.log(`Submitting all ${allUrls.length} URLs from sitemap.`);
    await submitUrls(allUrls);
    return;
  }

  if (changedFiles.length === 0) {
    console.log('No changed files detected. Skipping IndexNow.');
    return;
  }

  const urls = mapFilesToUrls(changedFiles);

  if (urls === null) {
    // Full resubmission triggered by config change
    const sitemapPath = path.join(__dirname, '..', 'public', 'sitemap.xml');
    const content = fs.readFileSync(sitemapPath, 'utf-8');
    const matches = content.match(/<loc>(.*?)<\/loc>/g);
    if (matches) {
      const allUrls = matches.map(m => m.replace(/<\/?loc>/g, ''));
      console.log(`Submitting all ${allUrls.length} URLs from sitemap (config changed).`);
      await submitUrls(allUrls);
    }
    return;
  }

  if (urls.length === 0) {
    console.log('No page/locale changes detected. Skipping IndexNow.');
    console.log('Changed files:', changedFiles.join(', '));
    return;
  }

  console.log('Submitting changed URLs to IndexNow:');
  urls.forEach(u => console.log(`  ${u}`));
  await submitUrls(urls);
}

main().catch(err => {
  console.error('❌ IndexNow submission failed:', err.message);
  process.exit(0); // Don't fail the build
});
