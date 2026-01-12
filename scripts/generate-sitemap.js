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

            // 3. Decision Logic
            if (isCI) {
                // CI Environment: Trust Git ONLY.
                // If Git fails (returns 0), we DO NOT fallback to FS, because FS in CI is always "now".
                // We prefer to return 0 (which triggers FALLBACK_DATE) rather than a fake "today".
                fileDate = gitDate;
            } else {
                // Local Environment: Trust newer (allows uncommitted previews)
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

/**
 * 智能检测页面的翻译文件
 * 自动查找 locales/{locale}/{page}.json 或任何匹配的翻译文件
 */
function findTranslationFile(page, locale) {
    const possibleFiles = [
        `locales/${locale}/${page}.json`,           // 标准命名
        `locales/${locale}/f-to-c.json`,            // fahrenheit-to-celsius 特例
        `locales/${locale}/common.json`,            // 回退
    ];

    for (const file of possibleFiles) {
        const fullPath = path.join(process.cwd(), file);
        if (fs.existsSync(fullPath)) {
            // 优先返回与页面名称匹配的文件
            if (file.includes(page) || file.includes('f-to-c')) {
                return file;
            }
        }
    }

    // 如果找不到特定文件，返回 common.json 作为回退
    return `locales/${locale}/common.json`;
}

/**
 * 检测页面是否使用 temperature-template
 */
function usesTemperatureTemplate(page) {
    const pageFile = path.join(process.cwd(), 'pages', `${page}.tsx`);
    if (!fs.existsSync(pageFile)) return false;

    try {
        const content = fs.readFileSync(pageFile, 'utf-8');
        // 检查是否导入或使用了 temperature-template
        return content.includes('temperature-template');
    } catch (e) {
        return false;
    }
}

/**
 * 智能收集页面依赖
 */
function collectPageDependencies(page, locale) {
    const deps = [
        `pages/${page}.tsx`,  // 页面本身
    ];

    // 检测是否使用 temperature-template
    if (usesTemperatureTemplate(page)) {
        deps.push('pages/temperature-template.tsx');
        deps.push(`locales/${locale}/template.json`);
    }

    // 添加页面特定的翻译文件
    const translationFile = findTranslationFile(page, locale);
    if (translationFile && !deps.includes(translationFile)) {
        deps.push(translationFile);
    }

    // 添加通用依赖
    deps.push('components/Layout.tsx');
    deps.push(`locales/${locale}/common.json`);

    // 过滤掉不存在的文件
    return deps.filter(dep => {
        const fullPath = path.join(process.cwd(), dep);
        return fs.existsSync(fullPath);
    });
}

function generateSitemap() {
    const allEntries = [];

    console.log('🔍 开始自动检测页面...');

    // 1. Homepage
    console.log('📄 处理首页...');
    LOCALES.forEach(locale => {
        const deps = [
            'pages/index.tsx',
            'components/Layout.tsx',
            `locales/${locale}/home.json`,
            `locales/${locale}/common.json`
        ].filter(dep => fs.existsSync(path.join(process.cwd(), dep)));

        const date = getLatestModifiedDate(deps);
        const url = locale === 'en' ? `${SITE_URL}/` : `${SITE_URL}/${locale}`;
        addEntry(url, date, 'daily', 1.0, allEntries);
    });

    // 2. 自動检测所有页面
    const pagesDir = path.join(process.cwd(), 'pages');
    const pageFiles = fs.readdirSync(pagesDir);

    // 排除特殊文件
    const excludedPages = [
        '_app.tsx',
        '_document.tsx',
        'index.tsx',
        'temperature-template.tsx',       // 这是模板，不是页面
        'api',                             // API 目录
    ];

    const mainPages = pageFiles
        .filter(file => {
            if (!file.endsWith('.tsx')) return false;
            if (excludedPages.includes(file)) return false;

            // 排除目录
            const fullPath = path.join(pagesDir, file);
            if (fs.statSync(fullPath).isDirectory()) return false;

            return true;
        })
        .map(file => file.replace('.tsx', ''));

    console.log(`📋 检测到 ${mainPages.length} 个页面: ${mainPages.join(', ')}`);

    mainPages.forEach(page => {
        console.log(`  处理页面: ${page}`);

        LOCALES.forEach(locale => {
            // 智能收集依赖
            const pageDeps = collectPageDependencies(page, locale);

            if (pageDeps.length === 0) {
                console.warn(`  ⚠️  警告: ${page} (${locale}) 没有找到任何依赖文件`);
                return;
            }

            const pageDate = getLatestModifiedDate(pageDeps);
            const url = locale === 'en' ? `${SITE_URL}/${page}` : `${SITE_URL}/${locale}/${page}`;
            addEntry(url, pageDate, 'weekly', 0.9, allEntries);
        });
    });

    console.log(`✅ 共生成 ${allEntries.length} 个 sitemap 条目`);

    // 3. Sort and Generate
    // 排序规则：
    // 1. 英文首页 (/) 绝对排第一
    // 2. 其他语言首页 (priority=1.0) 按字母顺序
    // 3. 其他页面 (priority=0.9) 按更新时间倒序（最新的在前）
    // 新的排序逻辑：
    // 1. 按 Slug 分组 (保持不同语言版本的同一页面在一起)
    // 2. 计算每组的"最新更新时间"
    // 3. 组与组之间：按最新更新时间倒序 (首页组强制置顶)
    // 4. 组内：英文版 (URL 最短) -> 其他语言按字母顺序

    const groups = {};
    const getSlug = (loc) => {
        let rel = loc.replace(SITE_URL, '');
        if (rel.startsWith('/')) rel = rel.slice(1);
        const parts = rel.split('/');
        // 如果第一段是 locale 代码 (且不是 'en' 的隐式情况)，则移除
        if (parts.length > 0 && LOCALES.includes(parts[0])) {
            parts.shift();
        }
        return parts.join('/') || 'HOME_PAGE_GROUP'; // 使用特殊标记标识首页组
    };

    allEntries.forEach(entry => {
        const slug = getSlug(entry.loc);
        if (!groups[slug]) {
            groups[slug] = {
                slug: slug,
                maxDate: '',
                entries: []
            };
        }
        groups[slug].entries.push(entry);
        // 更新该组的最新日期
        if (entry.lastmod > groups[slug].maxDate) {
            groups[slug].maxDate = entry.lastmod;
        }
    });

    // 将组转换为数组并排序
    const sortedGroups = Object.values(groups).sort((groupA, groupB) => {
        // 规则 1: 首页组绝对置顶
        if (groupA.slug === 'HOME_PAGE_GROUP') return -1;
        if (groupB.slug === 'HOME_PAGE_GROUP') return 1;

        // 规则 2: 按组内最新时间倒序 (刚刚更新的在前)
        if (groupA.maxDate !== groupB.maxDate) {
            return groupB.maxDate.localeCompare(groupA.maxDate);
        }

        // 规则 3: 时间相同时，按 Slug 字母顺序保持稳定
        return groupA.slug.localeCompare(groupB.slug);
    });

    // 展平并应用组内排序
    const sortedEntries = [];
    sortedGroups.forEach(group => {
        // 组内排序
        group.entries.sort((a, b) => {
            // 特殊处理首页组：英文首页 (https://ctofconverter.com/) 必须排在所有其他首页之前
            const isAEnHome = a.loc === `${SITE_URL}/` || a.loc === SITE_URL;
            const isBEnHome = b.loc === `${SITE_URL}/` || b.loc === SITE_URL;
            if (isAEnHome) return -1;
            if (isBEnHome) return 1;

            // 规则 4.1: 英文版排在最前 (利用 URL 长度判断，英文版无前缀，最短)
            if (a.loc.length !== b.loc.length) {
                return a.loc.length - b.loc.length;
            }
            // 规则 4.2: 其他语言按字母顺序
            return a.loc.localeCompare(b.loc);
        });
        sortedEntries.push(...group.entries);
    });

    // 更新引用 (虽然 allEntries 是 const 数组引用，但其内容顺序不影响 map 生成，这里我们需要用 sortedEntries 生成 XML)
    // 由于下面的 xmlRows 是基于 sortedEntries map 的，我们直接替换变量名使用即可，或者重新赋值给 allEntries 使用
    // 但 allEntries 是 const 定义的数组，不能重新赋值，所以我们修改后续代码使用 sortedEntries


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
    console.log(`\n🎉 Successfully generated dynamic sitemap.xml with ${allEntries.length} URLs sorted by priority and date.`);
}

generateSitemap();
