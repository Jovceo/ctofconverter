const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();

const SITE_URL = 'https://ctofconverter.com';
const LOCALES = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const EXCLUDED = ['_app.tsx', '_document.tsx', '_error.tsx', '404.tsx', 'sitemap.xml.tsx', 'api'];
const NON_EN_EXCLUDED = ['privacy-policy', 'terms-of-service', 'about-us'];

// 项目上线日期 — 作为 lastmod 的兜底值
const PROJECT_LAUNCH_DATE = '2025-10-19';

// ============================================================
// 🎯 SEO 战略：只在 sitemap 中收录高价值页面
//    其他温度页让搜索引擎通过内链自然发现
// ============================================================
// 高价值温度页 — 有真实搜索需求的页面：
//   • 医学体温: 36, 36.1, 36.3, 37, 37.2, 37.5, 38, 39, 41 (发烧判断)
//   • 关键温度: 0 (冰点), 4 (冰箱), 20 (室温), 40 (高热), 100 (沸点)
//   • 常用: 47, 75 (烹饪)
const CORE_TEMP_PAGES = new Set([
    '0-c-to-f',     // 冰点
    '4-c-to-f',     // 冰箱温度
    '20-c-to-f',    // 室温
    '36-c-to-f',    // 正常体温下限
    '36-1-c-to-f',  // 正常体温
    '36-3-c-to-f',  // 正常体温
    '36-4-c-to-f',  // 正常体温
    '36-5-c-to-f',  // 正常体温
    '36-6-c-to-f',  // 正常体温（常见测量值）
    '37-c-to-f',    // 正常体温上限
    '37-2-c-to-f',  // 低烧临界
    '37-5-c-to-f',  // 低烧
    '38-c-to-f',    // 发烧
    '39-c-to-f',    // 高烧
    '40-c-to-f',    // 高热
    '41-c-to-f',    // 危险高热
    '47-c-to-f',    // 烹饪相关
    '75-c-to-f',    // 烹饪安全温度
    '100-c-to-f',   // 沸点
]);
const RECENT_TEMP_UPDATE_WINDOW_DAYS = 90;
const MAX_RECENT_TEMP_PAGES = 12;

const pagesDir = path.join(__dirname, '../pages');
const localesDir = path.join(__dirname, '../locales');
const publicDir = path.join(__dirname, '../public');
const publicLocalesDir = path.join(publicDir, 'locales');
const rootDir = path.join(__dirname, '..');

// ============================================================
// 1. 性能优化：批量获取所有文件的 Git 最后修改时间
// ============================================================
const gitDateMap = {};

function buildGitDateMap() {
    try {
        // git log 输出是从新到旧，!gitDateMap[x] 保留第一次出现 = 最新日期
        const output = execSync(
            'git log --format="%aI" --name-only --diff-filter=ACMR HEAD',
            { encoding: 'utf-8', cwd: rootDir, maxBuffer: 10 * 1024 * 1024 }
        );

        let currentDate = '';
        for (const line of output.split('\n')) {
            const trimmed = line.trim();
            if (!trimmed) continue;

            if (/^\d{4}-\d{2}-\d{2}T/.test(trimmed)) {
                currentDate = trimmed.split('T')[0];
            } else if (currentDate && !gitDateMap[trimmed]) {
                gitDateMap[trimmed] = currentDate;
            }
        }

        console.log(`📋 Loaded Git dates for ${Object.keys(gitDateMap).length} files`);
    } catch (e) {
        console.warn('⚠️ Failed to build Git date map, falling back to file mtime:', e.message);
    }
}

buildGitDateMap();

/**
 * 获取文件的最后修改日期
 */
function getLastModified(filePath) {
    const relativePath = path.relative(rootDir, filePath).replace(/\\/g, '/');

    if (gitDateMap[relativePath]) {
        return gitDateMap[relativePath];
    }

    try {
        const stat = fs.statSync(filePath);
        return stat.mtime.toISOString().split('T')[0];
    } catch (e) {
        return PROJECT_LAUNCH_DATE;
    }
}

/**
 * 获取页面的 lastmod 日期
 */
function getPageLastMod(pageSlug, locale) {
    const candidates = [];

    const tsxName = pageSlug === '' ? 'index.tsx' : `${pageSlug}.tsx`;
    const tsxPath = path.join(pagesDir, tsxName);
    if (fs.existsSync(tsxPath)) candidates.push(getLastModified(tsxPath));

    const jsonName = pageSlug === '' ? 'home.json' : `${pageSlug}.json`;
    const localePath = path.join(localesDir, locale, jsonName);
    if (fs.existsSync(localePath)) candidates.push(getLastModified(localePath));

    const publicLocalePath = path.join(publicLocalesDir, locale, jsonName);
    if (fs.existsSync(publicLocalePath)) candidates.push(getLastModified(publicLocalePath));

    return candidates.length > 0
        ? candidates.sort().reverse()[0]
        : PROJECT_LAUNCH_DATE;
}

function isTemperaturePage(pageSlug) {
    return /^\d+(-\d+)?-c-to-f$/.test(pageSlug);
}

function parseDateOnly(dateString) {
    const ms = Date.parse(`${dateString}T00:00:00Z`);
    return Number.isNaN(ms) ? 0 : ms;
}

function getPageRollupLastMod(pageSlug) {
    const locales = getAvailableLocales(pageSlug);
    const lastmods = locales.map((locale) => getPageLastMod(pageSlug, locale));
    return lastmods.sort().reverse()[0] || PROJECT_LAUNCH_DATE;
}

function getIncludedTemperaturePages(allPages) {
    const cutoffMs = Date.now() - (RECENT_TEMP_UPDATE_WINDOW_DAYS * 24 * 60 * 60 * 1000);
    const tempPages = allPages.filter(isTemperaturePage);
    const corePages = tempPages.filter((page) => CORE_TEMP_PAGES.has(page));

    const recentPages = tempPages
        .filter((page) => !CORE_TEMP_PAGES.has(page))
        .map((page) => ({
            page,
            lastmod: getPageRollupLastMod(page),
        }))
        .filter(({ lastmod }) => parseDateOnly(lastmod) >= cutoffMs)
        .sort((a, b) => {
            const dateCompare = b.lastmod.localeCompare(a.lastmod);
            if (dateCompare !== 0) return dateCompare;
            return a.page.localeCompare(b.page, undefined, { numeric: true, sensitivity: 'base' });
        })
        .slice(0, MAX_RECENT_TEMP_PAGES)
        .map(({ page }) => page);

    return {
        includedTempPages: new Set([...corePages, ...recentPages]),
        totalTempPages: tempPages.length,
        coreCount: corePages.length,
        recentCount: recentPages.length,
    };
}

// ============================================================
// 2. XML 工具函数
// ============================================================
function escapeXml(str) {
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
}

function toHreflang(locale) {
    // 特殊映射：更精准的 BCP 47 标签
    const HREFLANG_MAP = {
        'zh': 'zh-Hans',       // 简体中文
        'pt-br': 'pt-BR',     // 巴西葡语
    };
    if (HREFLANG_MAP[locale]) return HREFLANG_MAP[locale];
    if (locale.includes('-')) {
        const [lang, region] = locale.split('-');
        return `${lang}-${region.toUpperCase()}`;
    }
    return locale;
}

function buildUrl(locale, pageSlug) {
    const parts = [];
    if (locale !== 'en') parts.push(locale);
    if (pageSlug) parts.push(pageSlug);
    return parts.length > 0 ? `${SITE_URL}/${parts.join('/')}` : SITE_URL;
}

/**
 * 构建 URL 条目 — 不再包含 changefreq 和 priority
 * Google 官方已声明忽略这两个字段
 */
function createUrlEntry(loc, lastmod, hreflangLinks) {
    const lines = [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        ...hreflangLinks,
        '  </url>'
    ];
    return lines.join('\n');
}

// ============================================================
// 3. 扫描页面 + 高价值过滤
// ============================================================
function getAllPages() {
    try {
        const files = fs.readdirSync(pagesDir);
        const allPages = files.filter(file => {
            const filePath = path.join(pagesDir, file);
            const stat = fs.statSync(filePath);
            return stat.isFile()
                && file.endsWith('.tsx')
                && !EXCLUDED.includes(file)
                && !file.startsWith('[');
        }).map(file => file.replace('.tsx', ''));

        // 过滤：温度页只保留高价值的
        const filtered = allPages.filter(page => {
            // 非温度页（首页、工具页、关于页等）全部保留
            if (!page.match(/^\d+(-\d+)?-c-to-f$/)) return true;
            // 温度页只保留高价值列表中的
            return CORE_TEMP_PAGES.has(page);
        });

        const excluded = allPages.length - filtered.length;
        if (excluded > 0) {
            console.log(`🎯 Strategy: ${excluded} low-value temp pages excluded from sitemap`);
        }

        // 排序：首页最前，其他页面按自然顺序排序
        filtered.sort((a, b) => {
            if (a === 'index') return -1;
            if (b === 'index') return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        return filtered;
    } catch (e) {
        console.error('Error reading pages directory:', e);
        return [];
    }
}

function getAvailableLocales(pageSlug) {
    if (NON_EN_EXCLUDED.includes(pageSlug)) return ['en'];
    const jsonName = pageSlug === '' ? 'home.json' : `${pageSlug}.json`;
    const detectedLocales = LOCALES.filter((locale) => {
        const localeFile = path.join(localesDir, locale, jsonName);
        const publicLocaleFile = path.join(publicLocalesDir, locale, jsonName);
        return fs.existsSync(localeFile) || fs.existsSync(publicLocaleFile);
    });

    if (detectedLocales.length === 0) {
        return LOCALES;
    }

    return detectedLocales.sort((a, b) => LOCALES.indexOf(a) - LOCALES.indexOf(b));
}

function getSitemapPages() {
    try {
        const files = fs.readdirSync(pagesDir);
        const allPages = files.filter((file) => {
            const filePath = path.join(pagesDir, file);
            const stat = fs.statSync(filePath);
            return stat.isFile()
                && file.endsWith('.tsx')
                && !EXCLUDED.includes(file)
                && !file.startsWith('[');
        }).map((file) => file.replace('.tsx', ''));

        const {
            includedTempPages,
            totalTempPages,
            coreCount,
            recentCount,
        } = getIncludedTemperaturePages(allPages);

        const filtered = allPages.filter((page) => {
            if (!isTemperaturePage(page)) return true;
            return includedTempPages.has(page);
        });

        const includedTempCount = [...includedTempPages].length;
        const excluded = totalTempPages - includedTempCount;

        console.log(`SEO strategy: ${coreCount} core temp pages kept in sitemap`);
        if (recentCount > 0) {
            console.log(`SEO strategy: ${recentCount} recently updated temp pages added (last ${RECENT_TEMP_UPDATE_WINDOW_DAYS} days, cap ${MAX_RECENT_TEMP_PAGES})`);
        }
        if (excluded > 0) {
            console.log(`SEO strategy: ${excluded} older non-core temp pages omitted from sitemap`);
        }

        filtered.sort((a, b) => {
            if (a === 'index') return -1;
            if (b === 'index') return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        return filtered;
    } catch (e) {
        console.error('Error reading pages directory:', e);
        return [];
    }
}

// ============================================================
// 4. 生成 sitemap
// ============================================================
const pages = getSitemapPages();
const urlEntries = [];

console.log(`Generating sitemap for ${pages.length} pages across ${LOCALES.length} locales...`);

pages.forEach(page => {
    const pageSlug = page === 'index' ? '' : page;
    const availableLocales = getAvailableLocales(pageSlug);

    availableLocales.forEach(locale => {
        const loc = escapeXml(buildUrl(locale, pageSlug));
        const lastmod = getPageLastMod(pageSlug, locale);

        // 构建 hreflang 链接
        const hreflangLinks = [];
        if (availableLocales.length > 1) {
            availableLocales.forEach(altLocale => {
                const altLoc = escapeXml(buildUrl(altLocale, pageSlug));
                const hreflang = toHreflang(altLocale);
                hreflangLinks.push(`    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${altLoc}"/>`);
            });
            const defaultLoc = escapeXml(buildUrl('en', pageSlug));
            hreflangLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${defaultLoc}"/>`);
        }

        urlEntries.push(createUrlEntry(loc, lastmod, hreflangLinks));
    });
});

// ============================================================
// 5. 输出 XML
// ============================================================
const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
    '  xmlns:xhtml="http://www.w3.org/1999/xhtml"',
    '>',
    urlEntries.join('\n'),
    '</urlset>'
].join('\n');

if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
}

fs.writeFileSync(path.join(publicDir, 'sitemap.xml'), sitemap);

// ============================================================
// 6. 统计
// ============================================================
const fileSizeKB = (Buffer.byteLength(sitemap, 'utf-8') / 1024).toFixed(1);
const elapsed = Date.now() - startTime;

console.log(`\n✅ Sitemap generated in ${elapsed}ms`);
console.log(`📊 Stats:`);
console.log(`   URLs:       ${urlEntries.length}`);
console.log(`   File size:  ${fileSizeKB} KB`);
console.log(`   Git files:  ${Object.keys(gitDateMap).length} cached`);
console.log(`   Output:     ${path.join(publicDir, 'sitemap.xml')}`);

if (urlEntries.length > 40000) {
    console.warn(`⚠️ URL count (${urlEntries.length}) approaching 50,000 limit.`);
}
if (Buffer.byteLength(sitemap, 'utf-8') > 40 * 1024 * 1024) {
    console.warn(`⚠️ File size (${fileSizeKB} KB) approaching 50MB limit.`);
}

// ============================================================
// 7. 自动确保 robots.txt 包含 Sitemap 声明
// ============================================================
const robotsPath = path.join(publicDir, 'robots.txt');
const sitemapDeclaration = `Sitemap: ${SITE_URL}/sitemap.xml`;

try {
    let robotsContent = fs.existsSync(robotsPath)
        ? fs.readFileSync(robotsPath, 'utf-8')
        : 'User-agent: *\nAllow: /\n';

    if (!robotsContent.includes(sitemapDeclaration)) {
        // 替换旧的 Sitemap 行或追加新的
        if (/^Sitemap:.*/m.test(robotsContent)) {
            robotsContent = robotsContent.replace(/^Sitemap:.*$/m, sitemapDeclaration);
        } else {
            robotsContent = robotsContent.trimEnd() + '\n\n' + sitemapDeclaration + '\n';
        }
        fs.writeFileSync(robotsPath, robotsContent);
        console.log(`🤖 robots.txt updated with Sitemap declaration`);
    } else {
        console.log(`🤖 robots.txt already contains Sitemap declaration ✓`);
    }
} catch (e) {
    console.warn(`⚠️ Could not update robots.txt:`, e.message);
}
