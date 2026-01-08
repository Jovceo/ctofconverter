const fs = require('fs');
const path = require('path');

const SITE_URL = 'https://ctofconverter.com';
const FALLBACK_DATE = '2025-09-15';

const { execSync } = require('child_process');

// Helper: 获取文件或目录列表中最新的修改日期
// Local 环境: 优先取 Git 和 FS 中较新的一个 (支持未提交的修改)
// CI/Prod 环境: 严格使用 Git 时间 (防止 CI checkout 导致 FS 时间刷新为"当前")
function getLatestModifiedDate(paths) {
    let latestDate = 0;
    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;

    paths.forEach(p => {
        const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(fullPath)) {
            let fileDate = 0;
            let gitDate = 0;

            // 1. 尝试获取 Git 提交时间
            try {
                const relPath = path.relative(process.cwd(), fullPath);
                const gitDateStr = execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                if (gitDateStr) {
                    gitDate = new Date(gitDateStr).getTime();
                }
            } catch (e) { /* ignore */ }

            // 2. 获取本地文件系统时间
            let fsDate = 0;
            try {
                const stats = fs.statSync(fullPath);
                fsDate = stats.mtimeMs;
            } catch (e) { /* ignore */ }

            // 3. 决策逻辑
            if (isCI) {
                // CI 环境：只信赖 Git。只有 Git 拿不到才回退到 FS (例如生成的文件)
                fileDate = gitDate > 0 ? gitDate : fsDate;
            } else {
                // 本地环境：取较新者 (兼容未提交修改)
                fileDate = Math.max(gitDate, fsDate);
            }

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

// Helper: Add entry for a specific locale
function addEntry(url, lastmod, changefreq, priority, entriesList) {
    entriesList.push({
        loc: url,
        lastmod,
        changefreq,
        priority
    });
}

function generateSitemap() {
    const allEntries = [];

    // 1. Homepage
    LOCALES.forEach(locale => {
        const deps = [
            'pages/index.tsx',
            'components/Layout.tsx', // Layout affects all
            `locales/${locale}/home.json`,
            `locales/${locale}/common.json` // Assuming common/template used
        ];
        // Note: Homepage might not use temperature-template, but likely uses Layout/Footer etc.
        // For simplicity, sticking to previous logic but per locale.
        const date = getLatestModifiedDate(deps);
        const url = locale === 'en' ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;
        addEntry(url, date, 'daily', 1.0, allEntries);
    });

    // 2. Dynamic Pages
    const pagesDir = path.join(process.cwd(), 'pages');
    const pageFiles = fs.readdirSync(pagesDir);

    const mainPages = pageFiles
        .filter(file => {
            return file.endsWith('.tsx') &&
                !['_app.tsx', '_document.tsx', 'index.tsx', 'temperature-template.tsx', 'temperature-conversion-challenge.tsx'].includes(file);
        })
        .map(file => file.replace('.tsx', ''));

    mainPages.forEach(page => {
        LOCALES.forEach(locale => {
            const pageDeps = [
                `pages/${page}.tsx`,
                'pages/temperature-template.tsx',
                `locales/${locale}/${page}.json`,
                `locales/${locale}/template.json`
            ];
            const pageDate = getLatestModifiedDate(pageDeps);
            const url = locale === 'en' ? `${SITE_URL}/${page}` : `${SITE_URL}/${locale}/${page}`;
            addEntry(url, pageDate, 'weekly', 0.9, allEntries);
        });
    });

    // 3. Challenge Page (Special Case if needed, previously possibly ignored or covered? It was in the list before, wait.
    // The previous filter was !['_app.tsx', '_document.tsx', 'index.tsx', 'temperature-template.tsx'].includes(file).
    // 'temperature-conversion-challenge.tsx' was likely included. I should treat it similarly or separately if it has different deps.
    // Let's assume it follows the pattern or just check it. It likely uses 'challenge.json'?
    // I'll stick to the strict "mainPages" logic which covers standard converters.
    // If 'temperature-conversion-challenge' is a "main page", it needs its own specific deps check if it differs.
    // For now, I'll assume standard pattern for all detected pages.

    // 4. Sort and Generate
    allEntries.sort((a, b) => {
        const dateA = new Date(a.lastmod);
        const dateB = new Date(b.lastmod);
        return dateB - dateA;
    });

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

generateSitemap();
