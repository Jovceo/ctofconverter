const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const FALLBACK_DATE = '2025-09-15';

// Helper: 获取文件或目录列表中最新的修改日期
function getLatestModifiedDate(paths) {
    let latestMtime = 0;
    paths.forEach(p => {
        const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(fullPath)) {
            const stats = fs.statSync(fullPath);
            if (stats.mtimeMs > latestMtime) {
                latestMtime = stats.mtimeMs;
            }
        }
    });
    return latestMtime > 0
        ? new Date(latestMtime).toISOString().split('T')[0]
        : FALLBACK_DATE;
}

// 动态获取支持的语言列表
const localesDir = path.join(process.cwd(), 'locales');
const LOCALES = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory()
);

function generateSitemap() {
    const urls = [];

    // 1. 首页及其多语言版本
    const homepageDeps = ['pages/index.tsx', ...LOCALES.map(l => `locales/${l}/home.json`)];
    const homepageDate = getLatestModifiedDate(homepageDeps);
    urls.push('  <!-- Homepage -->');
    generateLocales('/', 1.0, 'daily', homepageDate, urls);

    // 2. 动态扫描 pages 目录获取所有 Next.js 页面
    urls.push('\n  <!-- Main dynamic pages from /pages directory -->');
    const pagesDir = path.join(process.cwd(), 'pages');
    const pageFiles = fs.readdirSync(pagesDir);

    const mainPages = pageFiles
        .filter(file => {
            return file.endsWith('.tsx') &&
                !['_app.tsx', '_document.tsx', 'index.tsx', 'temperature-template.tsx'].includes(file);
        })
        .map(file => file.replace('.tsx', ''));

    mainPages.sort().forEach(page => {
        const pageDeps = [
            `pages/${page}.tsx`,
            'pages/temperature-template.tsx',
            ...LOCALES.map(l => `locales/${l}/${page}.json`),
            ...LOCALES.map(l => `locales/${l}/template.json`)
        ];
        const pageDate = getLatestModifiedDate(pageDeps);
        generateLocales(`/${page}`, 0.9, 'weekly', pageDate, urls);
    });

    // 3. 公共 HTML 页面 (Legacy/Static)
    urls.push('\n  <!-- Static HTML Pages from /public -->');
    const publicDir = path.join(process.cwd(), 'public');
    const publicFiles = fs.readdirSync(publicDir);

    const legacyPages = publicFiles.filter(f =>
        f.endsWith('.html') &&
        !['404.html', 'index.html', 'google4cefee41ce49f67b.html', 'ctof.html'].includes(f) &&
        !['about-us.html', 'privacy-policy.html', 'terms-of-service.html'].includes(f)
    );

    legacyPages.sort().forEach(file => {
        const fileDate = getLatestModifiedDate([path.join('public', file)]);
        urls.push(formatUrl(`/${file}`, 0.8, 'monthly', fileDate));
    });

    // 4. 法律与信息类页面
    urls.push('\n  <!-- Legal and Info Pages -->');
    const infoPages = ['about-us.html', 'privacy-policy.html', 'terms-of-service.html'];
    infoPages.forEach(page => {
        if (fs.existsSync(path.join(publicDir, page))) {
            const fileDate = getLatestModifiedDate([path.join('public', page)]);
            urls.push(formatUrl(`/${page}`, 0.5, 'monthly', fileDate));
        }
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log(`Successfully generated dynamic sitemap.xml with actual modification dates.`);
}

function generateLocales(basePath, priority, changefreq, lastmod, urls) {
    // 默认英文
    urls.push(formatUrl(basePath, priority, changefreq, lastmod));

    // 其他语言版本
    LOCALES.filter(l => l !== 'en').forEach(locale => {
        const localePath = `/${locale}`;
        const fullPath = (basePath === '/' ? localePath : `${localePath}${basePath}`);
        urls.push(formatUrl(fullPath, priority, changefreq, lastmod));
    });
}

function formatUrl(relPath, priority, changefreq, lastmod) {
    return `  <url>
    <loc>${SITE_URL}${relPath}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority.toFixed(1)}</priority>
  </url>`;
}

generateSitemap();
