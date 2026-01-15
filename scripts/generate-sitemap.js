const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://ctofconverter.com';
const FALLBACK_DATE = '2025-09-15';

// 1. 定义语言列表 (从目录结构获取)
const localesDir = path.join(process.cwd(), 'locales');
const LOCALES = fs.readdirSync(localesDir).filter(f =>
    fs.statSync(path.join(localesDir, f)).isDirectory()
);

/**
 * Helper: 从已构建的 HTML 文件中提取日期
 * 寻找 <time dateTime="YYYY-MM-DD"> 标签
 */
function extractDateFromHtml(htmlPath) {
    try {
        if (!fs.existsSync(htmlPath)) return null;
        const content = fs.readFileSync(htmlPath, 'utf-8');
        // Regex to match <time dateTime="2025-01-01">
        const match = content.match(/<time[^>]*dateTime="(\d{4}-\d{2}-\d{2})"[^>]*>/);
        if (match && match[1]) {
            return match[1];
        }
    } catch (e) {
        console.warn(`Error reading date from HTML ${htmlPath}:`, e.message);
    }
    return null;
}

/**
 * Helper: Git/FS 回退日期逻辑 (与旧脚本一致，作为兜底)
 */
function getLegacyLatestModifiedDate(paths) {
    let latestDate = 0;
    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;

    paths.forEach(p => {
        const fullPath = path.isAbsolute(p) ? p : path.join(process.cwd(), p);
        if (fs.existsSync(fullPath)) {
            let fileDate = 0;
            let gitDate = 0;

            try {
                const relPath = path.relative(process.cwd(), fullPath);
                const gitDateStr = execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                if (gitDateStr) gitDate = new Date(gitDateStr).getTime();
            } catch (e) { }

            let fsDate = 0;
            try {
                fsDate = fs.statSync(fullPath).mtimeMs;
            } catch (e) { }

            if (isCI) {
                fileDate = gitDate;
            } else {
                fileDate = Math.max(gitDate, fsDate);
            }

            if (fileDate > latestDate) latestDate = fileDate;
        }
    });

    return latestDate > 0
        ? new Date(latestDate).toISOString().split('T')[0]
        : FALLBACK_DATE;
}

/**
 * 递归遍历目录获取所有 HTML 文件
 */
function getHtmlFiles(dir, fileList = []) {
    if (!fs.existsSync(dir)) return fileList;
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const filePath = path.join(dir, file);
        if (fs.statSync(filePath).isDirectory()) {
            getHtmlFiles(filePath, fileList);
        } else {
            if (file.endsWith('.html') && !file.endsWith('404.html') && !file.endsWith('500.html')) {
                fileList.push(filePath);
            }
        }
    });
    return fileList;
}

function generateSitemap() {
    console.log('🔍 开始生成 Post-Build Sitemap...');

    // Next.js static pages output directory
    const pagesDir = path.join(process.cwd(), '.next/server/pages');

    if (!fs.existsSync(pagesDir)) {
        console.error('❌ Error: .next/server/pages not found. Make sure to run `next build` first.');
        process.exit(1);
    }

    const htmlFiles = getHtmlFiles(pagesDir);
    // 过滤掉任何可能混入的非 Next.js 生成文件（虽然 .next 目录下通常都是）
    // 如果 public 下有静态 html，它们不会出现在 .next/server/pages 中，所以不需要额外排除逻辑。
    console.log(`📋 扫描到 ${htmlFiles.length} 个静态页面文件 (仅 Next.js 生成页面)`);

    const allEntries = [];

    htmlFiles.forEach(htmlPath => {
        // 计算相对路径
        let relPath = path.relative(pagesDir, htmlPath); // e.g., "en/about-us.html" or "index.html"

        // 修正路径分隔符 (Windows兼容)
        relPath = relPath.split(path.sep).join('/');

        // 提取 locale 和 slug
        let locale = 'en'; // default
        let slug = relPath.replace(/\.html$/, '');

        // 检查开头是否是 locale 目录
        const parts = slug.split('/');
        if (LOCALES.includes(parts[0])) {
            locale = parts[0];
            slug = parts.slice(1).join('/'); //移除 locale 前缀
        } else if (slug === 'index') {
            // 根目录 index.html 通常是默认语言 (en)
            slug = '';
        }

        // 处理 index 的情况 (如 en/index.html -> /en)
        if (slug.endsWith('/index')) {
            slug = slug.substring(0, slug.length - 6);
        }
        if (slug === 'index') slug = '';

        // 构建 URL
        let url;
        if (locale === 'en') {
            url = slug ? `${SITE_URL}/${slug}` : `${SITE_URL}/`;
        } else {
            url = slug ? `${SITE_URL}/${locale}/${slug}` : `${SITE_URL}/${locale}`;
        }

        // 排除 404 等特殊页面 (已经在 getHtmlFiles 过滤了一部分，再次确认)
        if (slug === '404' || slug === '500') return;

        // 核心逻辑：提取日期
        let date = extractDateFromHtml(htmlPath);

        // 验证日期格式
        if (!date || !/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            console.warn(`⚠️  无法从 HTML 提取日期: ${relPath}, 回退到文件系统检测...`);
            // 回退逻辑：尝试匹配源文件
            // 这比之前的精确度低，但作为兜底
            let sourceFiles = [];
            const pageName = slug || 'index';
            const pageTsx = path.join(process.cwd(), 'pages', `${pageName}.tsx`);
            if (fs.existsSync(pageTsx)) sourceFiles.push(pageTsx);

            date = getLegacyLatestModifiedDate(sourceFiles);
        }

        // 设置优先级
        let priority = 0.9;
        let changefreq = 'weekly';

        // 首页高优先级
        if (slug === '') {
            priority = 1.0;
            changefreq = 'daily';
        }

        allEntries.push({
            loc: url,
            lastmod: date,
            changefreq,
            priority
        });
    });

    console.log(`✅ 处理了 ${allEntries.length} 个页面条目`);

    // --- 排序逻辑 (复用旧脚本的优秀排序逻辑) ---
    // 1. 按 Slug 分组
    // 2. 组内排序：英文优先 -> 字母顺序
    // 3. 组间排序：首页优先 -> 最新更新时间倒序

    const groups = {};
    const getSlugKey = (loc) => {
        let rel = loc.replace(SITE_URL, '');
        if (rel.startsWith('/')) rel = rel.slice(1);
        const parts = rel.split('/');
        if (parts.length > 0 && LOCALES.includes(parts[0])) {
            parts.shift();
        }
        return parts.join('/') || 'HOME_PAGE_GROUP';
    };

    allEntries.forEach(entry => {
        const slugKey = getSlugKey(entry.loc);
        if (!groups[slugKey]) {
            groups[slugKey] = {
                slug: slugKey,
                maxDate: '',
                entries: []
            };
        }
        groups[slugKey].entries.push(entry);
        if (entry.lastmod > groups[slugKey].maxDate) {
            groups[slugKey].maxDate = entry.lastmod;
        }
    });

    const sortedGroups = Object.values(groups).sort((groupA, groupB) => {
        if (groupA.slug === 'HOME_PAGE_GROUP') return -1;
        if (groupB.slug === 'HOME_PAGE_GROUP') return 1;
        if (groupA.maxDate !== groupB.maxDate) {
            return groupB.maxDate.localeCompare(groupA.maxDate);
        }
        return groupA.slug.localeCompare(groupB.slug);
    });

    const sortedEntries = [];
    sortedGroups.forEach(group => {
        group.entries.sort((a, b) => {
            const isAEnHome = a.loc === `${SITE_URL}/` || a.loc === SITE_URL;
            const isBEnHome = b.loc === `${SITE_URL}/` || b.loc === SITE_URL;
            if (isAEnHome) return -1;
            if (isBEnHome) return 1;
            if (a.loc.length !== b.loc.length) {
                return a.loc.length - b.loc.length;
            }
            return a.loc.localeCompare(b.loc);
        });
        sortedEntries.push(...group.entries);
    });

    // Generate XML
    const xmlRows = sortedEntries.map(entry => `  <url>
    <loc>${entry.loc}</loc>
    <lastmod>${entry.lastmod}</lastmod>
  </url>`);

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
        xmlns:xhtml="http://www.w3.org/1999/xhtml">
${xmlRows.join('\n')}
</urlset>`;

    fs.writeFileSync(path.join(process.cwd(), 'public', 'sitemap.xml'), sitemap);
    console.log(`\n🎉 Successfully generated POST-BUILD sitemap.xml with ${allEntries.length} URLs.`);
}

generateSitemap();
