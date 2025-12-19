const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const LOCALES = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const DATE = new Date().toISOString().split('T')[0];

function generateSitemap() {
    const urls = [];

    // 1. Homepage & Translations
    urls.push('  <!-- Homepage -->');
    generateLocales('/', 1.0, 'daily', urls);

    // 2. Main Conversion Pages (Next.js)
    urls.push('\n  <!-- Main Conversion Pages -->');
    const mainPages = ['47-c-to-f', '75-c-to-f'];
    mainPages.forEach(page => {
        generateLocales(`/${page}`, 0.9, 'weekly', urls);
    });

    // 3. Legacy HTML Pages
    urls.push('\n  <!-- Legacy HTML Pages -->');
    const publicDir = path.join(process.cwd(), 'public');
    const files = fs.readdirSync(publicDir);

    const legacyPages = files.filter(f =>
        f.endsWith('.html') &&
        !['404.html', 'index.html', 'google4cefee41ce49f67b.html', 'ctof.html'].includes(f) &&
        !f.includes('privacy-policy') &&
        !f.includes('terms-of-service') &&
        !f.includes('about-us')
    );

    legacyPages.sort().forEach(file => {
        urls.push(formatUrl(`/${file}`, 0.8, 'monthly'));
    });

    // 4. Legal and Info
    urls.push('\n  <!-- Legal and Info -->');
    const infoPages = ['about-us.html', 'privacy-policy.html', 'terms-of-service.html'];
    infoPages.forEach(page => {
        if (fs.existsSync(path.join(publicDir, page))) {
            urls.push(formatUrl(`/${page}`, 0.5, 'monthly'));
        }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log('Successfully generated clean sitemap.xml with comments');
}

function generateLocales(basePath, priority, changefreq, urls) {
    // Add English (default)
    urls.push(formatUrl(basePath, priority, changefreq, true));

    // Add other languages
    LOCALES.filter(l => l !== 'en').forEach(locale => {
        const localePath = locale === 'pt-br' ? '/pt-br' : `/${locale}`;
        const fullPath = (basePath === '/' ? localePath : `${localePath}${basePath}`);
        urls.push(formatUrl(fullPath, priority, changefreq));
    });
}

function formatUrl(relPath, priority, changefreq, isDefault = false) {
    // Simple XML format
    return `  <url>
    <loc>${SITE_URL}${relPath}</loc>
    <lastmod>${DATE}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

generateSitemap();
