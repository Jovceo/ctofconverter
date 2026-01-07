const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const FALLBACK_DATE = '2025-09-15';

const { execSync } = require('child_process');

// Helper: 获取文件或目录列表中最新的修改日期 (优先使用最新时间：Git 或 本地文件系统)
function getLatestModifiedDate(paths) {
    let latestDate = 0;

    paths.forEach(p => {
        const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(fullPath)) {
            let fileDate = 0;

            // 1. 尝试获取 Git 提交时间
            try {
                const relPath = path.relative(process.cwd(), fullPath);
                // 使用 git log -1 获取最后提交时间
                const gitDateStr = execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                if (gitDateStr) {
                    fileDate = new Date(gitDateStr).getTime();
                }
            } catch (e) {
                // Git 命令失败，忽略
            }

            // 2. 获取本地文件系统修改时间 (处理未提交的修改)
            try {
                const stats = fs.statSync(fullPath);
                // 如果本地修改时间比 Git 时间新，使用本地时间
                if (stats.mtimeMs > fileDate) {
                    fileDate = stats.mtimeMs;
                }
            } catch (e) {
                // stat 失败
            }

            // 更新整体最新时间
            if (fileDate > latestDate) {
                latestDate = fileDate;
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

    // 3. 公共 HTML 页面 (Legacy/Static) & 4. 法律与信息类页面
    // Removed as per user request to only include Next.js dynamic pages
    // and exclude all static files from the public directory.


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
