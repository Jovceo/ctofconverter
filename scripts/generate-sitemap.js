const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const FALLBACK_DATE = '2025-09-15';

const { execSync } = require('child_process');

// Helper: 获取文件或目录列表中最新的修改日期 (优先使用 Git 提交时间)
function getLatestModifiedDate(paths) {
    let latestDate = 0;

    paths.forEach(p => {
        const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(fullPath)) {
            try {
                // 尝试从 Git 获取最后修改时间
                // 使用 relative path 给 git 命令，避免绝对路径问题
                const relPath = path.relative(process.cwd(), fullPath);
                const gitDateStr = execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8' }).trim();

                if (gitDateStr) {
                    const gitDate = new Date(gitDateStr).getTime();
                    if (gitDate > latestDate) latestDate = gitDate;
                } else {
                    // Fallback: 如果 Git 没有记录 (例如新文件未提交)，使用文件系统时间
                    const stats = fs.statSync(fullPath);
                    if (stats.mtimeMs > latestDate) latestDate = stats.mtimeMs;
                }
            } catch (e) {
                // Git 命令失败 (例如非 git 环境)，回退到文件系统时间
                const stats = fs.statSync(fullPath);
                if (stats.mtimeMs > latestDate) latestDate = stats.mtimeMs;
            }
        }
    });

    return latestDate > 0
        ? new Date(latestDate).toISOString().split('T')[0]
        : FALLBACK_DATE;
}

// 动态获取支持的语言列表
const localesDir = path.join(process.cwd(), 'locales');
const LOCALES = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory()
);

function generateSitemap() {
    const allEntries = [];

    // 1. 首页及其多语言版本
    const homepageDeps = ['pages/index.tsx', ...LOCALES.map(l => `locales/${l}/home.json`)];
    const homepageDate = getLatestModifiedDate(homepageDeps);
    addLocales('/', 1.0, 'daily', homepageDate, allEntries);

    // 2. 动态扫描 pages 目录获取所有 Next.js 页面
    const pagesDir = path.join(process.cwd(), 'pages');
    const pageFiles = fs.readdirSync(pagesDir);

    const mainPages = pageFiles
        .filter(file => {
            return file.endsWith('.tsx') &&
                !['_app.tsx', '_document.tsx', 'index.tsx', 'temperature-template.tsx'].includes(file);
        })
        .map(file => file.replace('.tsx', ''));

    mainPages.forEach(page => {
        const pageDeps = [
            `pages/${page}.tsx`,
            'pages/temperature-template.tsx',
            ...LOCALES.map(l => `locales/${l}/${page}.json`),
            ...LOCALES.map(l => `locales/${l}/template.json`)
        ];
        const pageDate = getLatestModifiedDate(pageDeps);
        addLocales(`/${page}`, 0.9, 'weekly', pageDate, allEntries);
    });

    // 3. 公共 HTML 页面 (Legacy/Static)
    const publicDir = path.join(process.cwd(), 'public');
    const publicFiles = fs.readdirSync(publicDir);

    const legacyPages = publicFiles.filter(f =>
        f.endsWith('.html') &&
        !['404.html', 'index.html', 'google4cefee41ce49f67b.html', 'ctof.html'].includes(f) &&
        !['about-us.html', 'privacy-policy.html', 'terms-of-service.html'].includes(f)
    );

    legacyPages.forEach(file => {
        const fileDate = getLatestModifiedDate([path.join('public', file)]);
        allEntries.push({
            loc: `${SITE_URL}/${file}`,
            lastmod: fileDate,
            changefreq: 'monthly',
            priority: 0.8
        });
    });

    // 4. 法律与信息类页面
    const infoPages = ['about-us.html', 'privacy-policy.html', 'terms-of-service.html'];
    infoPages.forEach(page => {
        if (fs.existsSync(path.join(publicDir, page))) {
            const fileDate = getLatestModifiedDate([path.join('public', page)]);
            allEntries.push({
                loc: `${SITE_URL}/${page}`,
                lastmod: fileDate,
                changefreq: 'monthly',
                priority: 0.5
            });
        }
    });

    // 排序：按 lastmod 倒序（最新的在最前）
    allEntries.sort((a, b) => {
        const dateA = new Date(a.lastmod);
        const dateB = new Date(b.lastmod);
        return dateB - dateA;
    });

    // 生成 XML
    const xmlRows = allEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
    <changefreq>${entry.changefreq}</changefreq>
    <priority>${entry.priority.toFixed(1)}</priority>
  </url>`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlRows.join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log(`Successfully generated dynamic sitemap.xml sorted by date.`);
}

function addLocales(basePath, priority, changefreq, lastmod, entriesList) {
    // 默认英文
    entriesList.push({
        loc: `${SITE_URL}${basePath}`,
        lastmod,
        changefreq,
        priority
    });

    // 其他语言版本
    LOCALES.filter(l => l !== 'en').forEach(locale => {
        const localePath = `/${locale}`;
        const fullPath = (basePath === '/' ? localePath : `${localePath}${basePath}`);
        entriesList.push({
            loc: `${SITE_URL}${fullPath}`,
            lastmod,
            changefreq,
            priority
        });
    });
}

generateSitemap();
