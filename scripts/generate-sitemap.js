const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const LOCALES = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const EXCLUDED = ['_app.tsx', '_document.tsx', '_error.tsx', '404.tsx', 'sitemap.xml.tsx', 'temperature-template.tsx', 'api'];
// Pages that should only appear in English in the sitemap (low SEO value for non-English)
const NON_EN_EXCLUDED = ['privacy-policy', 'terms-of-service', 'about-us'];

const pagesDir = path.join(__dirname, '../pages');
const publicDir = path.join(__dirname, '../public');

// Format date: YYYY-MM-DD
const lastMod = new Date().toISOString().split('T')[0];

function getAllPages() {
    try {
        const files = fs.readdirSync(pagesDir);
        return files.filter(file => {
            const filePath = path.join(pagesDir, file);
            const stat = fs.statSync(filePath);
            return stat.isFile() && file.endsWith('.tsx') && !EXCLUDED.includes(file);
        }).map(file => file.replace('.tsx', ''));
    } catch (e) {
        console.error('Error reading pages directory:', e);
        return [];
    }
}

const pages = getAllPages();
let urlSet = '';

// Add URL helper
function addUrl(urlPath, priority) {
    // Normalize path: ensure it starts with / but not //
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;
    // Handle root specially if needed, but SITE_URL + "/" is fine

    urlSet += `
  <url>
    <loc>${SITE_URL}${cleanPath === '/' ? '' : cleanPath}</loc>
    <lastmod>${lastMod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

console.log(`Generating sitemap for ${pages.length} pages across ${LOCALES.length} locales...`);
console.log('Pages found:', pages.join(', '));

// Add homepage first (force include to prevent missing)
LOCALES.forEach(locale => {
    const homePath = locale === 'en' ? '/' : `/${locale}`;
    addUrl(homePath, '1.0');
});

// Generate other pages (exclude index to avoid duplication)
pages.filter(page => page !== 'index').forEach(page => {
    // Determine priority
    let priority = '0.8';
    if (page === 'index') priority = '1.0';
    else if (page.includes('c-to-f') || page.includes('chart')) priority = '0.9';

    // Base Name (empty for index)
    const pageSlug = page === 'index' ? '' : page;

    // Loop Locales
    LOCALES.forEach(locale => {
        // Skip non-English versions of low SEO value pages
        if (locale !== 'en' && NON_EN_EXCLUDED.includes(pageSlug)) return;

        // Construct path: /locale/pageSlug
        // If locale is 'en', prefix is empty.
        // If pageSlug is empty (index), just locale prefix.

        let pathParts = [];
        if (locale !== 'en') pathParts.push(locale);
        if (pageSlug) pathParts.push(pageSlug);

        const finalPath = '/' + pathParts.join('/');

        addUrl(finalPath, priority);
    });
});

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlSet}
</urlset>`;

// Ensure public dir exists
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);
console.log(`✅ Sitemap generated successfully at ${path.join(publicDir, 'sitemap.xml')}`);
