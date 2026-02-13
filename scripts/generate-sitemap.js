const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://ctofconverter.com';
const LOCALES = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const EXCLUDED = ['_app.tsx', '_document.tsx', '_error.tsx', '404.tsx', 'sitemap.xml.tsx', 'temperature-template.tsx', 'api'];
// Pages that should only appear in English in the sitemap (low SEO value for non-English)
const NON_EN_EXCLUDED = ['privacy-policy', 'terms-of-service', 'about-us'];

const pagesDir = path.join(__dirname, '../pages');
const publicDir = path.join(__dirname, '../public');

// 缓存：文件路径 → Git 最后修改日期
const gitDateCache = {};

/**
 * 获取文件的 Git 最后修改日期（YYYY-MM-DD）
 * 优先使用 Git log，如果 Git 不可用则使用文件系统的 mtime
 */
function getLastModified(filePath) {
    if (gitDateCache[filePath]) return gitDateCache[filePath];

    try {
        // 用 git log 获取该文件最后一次真正被修改的日期
        const gitDate = execSync(
            `git log -1 --format=%aI -- "${filePath}"`,
            { encoding: 'utf-8', cwd: path.join(__dirname, '..') }
        ).trim();

        if (gitDate) {
            const date = gitDate.split('T')[0];
            gitDateCache[filePath] = date;
            return date;
        }
    } catch (e) {
        // Git 不可用时静默降级
    }

    // 降级：使用文件系统的修改时间
    try {
        const stat = fs.statSync(filePath);
        const date = stat.mtime.toISOString().split('T')[0];
        gitDateCache[filePath] = date;
        return date;
    } catch (e) {
        // 最终兜底：使用今天的日期
        const date = new Date().toISOString().split('T')[0];
        gitDateCache[filePath] = date;
        return date;
    }
}

/**
 * 获取一个页面的 lastmod 日期
 * 综合考虑页面 TSX 文件和所有相关 locale JSON 文件的最新修改时间
 */
function getPageLastMod(pageSlug, locale) {
    const candidates = [];

    // 1. 页面 TSX 文件
    const tsxName = pageSlug === '' ? 'index.tsx' : `${pageSlug}.tsx`;
    const tsxPath = path.join(pagesDir, tsxName);
    if (fs.existsSync(tsxPath)) {
        candidates.push(getLastModified(tsxPath));
    }

    // 2. locale JSON 文件（locales/ 目录）
    const jsonName = pageSlug === '' ? 'home.json' : `${pageSlug}.json`;
    const localePath = path.join(__dirname, '..', 'locales', locale, jsonName);
    if (fs.existsSync(localePath)) {
        candidates.push(getLastModified(localePath));
    }

    // 3. public/locales/ 目录的 JSON（某些页面用这个路径）
    const publicLocalePath = path.join(publicDir, 'locales', locale, jsonName);
    if (fs.existsSync(publicLocalePath)) {
        candidates.push(getLastModified(publicLocalePath));
    }

    // 取最新的日期
    if (candidates.length > 0) {
        return candidates.sort().reverse()[0];
    }

    // 兜底
    return new Date().toISOString().split('T')[0];
}

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
function addUrl(urlPath, priority, lastmod) {
    // Normalize path: ensure it starts with / but not //
    const cleanPath = urlPath.startsWith('/') ? urlPath : `/${urlPath}`;

    urlSet += `
  <url>
    <loc>${SITE_URL}${cleanPath === '/' ? '' : cleanPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

console.log(`Generating sitemap for ${pages.length} pages across ${LOCALES.length} locales...`);
console.log('Pages found:', pages.join(', '));

// Add homepage first (force include to prevent missing)
LOCALES.forEach(locale => {
    const homePath = locale === 'en' ? '/' : `/${locale}`;
    const lastmod = getPageLastMod('', locale);
    addUrl(homePath, '1.0', lastmod);
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
        let pathParts = [];
        if (locale !== 'en') pathParts.push(locale);
        if (pageSlug) pathParts.push(pageSlug);

        const finalPath = '/' + pathParts.join('/');
        const lastmod = getPageLastMod(pageSlug, locale);

        addUrl(finalPath, priority, lastmod);
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
