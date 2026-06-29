const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();

const SITE_URL = 'https://ctofconverter.com';
const LOCALES = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const EXCLUDED = ['_app.tsx', '_document.tsx', '_error.tsx', '404.tsx', 'sitemap.xml.tsx', 'api'];
const NON_EN_EXCLUDED = ['privacy-policy', 'terms-of-service', 'about-us'];
const SITEMAP_PAGES = ['index', 'oven-temperature-conversion', 'oven-to-air-fryer'];

// 项目上线日期 — 作为 lastmod 的兜底值
const PROJECT_LAUNCH_DATE = '2025-10-19';

// ============================================================
// SEO 战略 v2：全量收录所有 Next.js 页面，通过 priority 和 changefreq 控制爬取优先级。
//   整数温度页 (1.0 weekly) > 小数温度页 (0.8 weekly) > 工具页 (0.9 weekly) > 内容页 (0.5 monthly)
//   60 页全放不影响爬取预算（通常需要 10,000+ 页才需要担心）。
// ============================================================

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
 * 构建 URL 条目 — 包含 priority 和 changefreq
 */
function createUrlEntry(loc, lastmod, hreflangLinks, priority, changefreq) {
    const lines = [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        `    <changefreq>${changefreq}</changefreq>`,
        ...hreflangLinks,
        '  </url>'
    ];
    return lines.join('\n');
}

// ============================================================
// 3. 扫描页面 + priority/changefreq 工具函数
// ============================================================
function getPriority(pageSlug) {
    // 首页：最高
    if (pageSlug === '' || pageSlug === 'index') return '1.0';
    // 整数温度页：最高
    if (/^\d+-c-to-f$/.test(pageSlug)) return '1.0';
    // 小数温度页：次高
    if (/^\d+-\d+-c-to-f$/.test(pageSlug)) return '0.8';
    // 工具页（calculator, oven 等）
    if (pageSlug.includes('calculator') || pageSlug.includes('oven')) return '0.9';
    // 内容页（about, contact, privacy 等）
    return '0.5';
}

function getChangefreq(pageSlug) {
    if (pageSlug === '' || pageSlug === 'index') return 'weekly';
    if (/^\d+(-\d+)?-c-to-f$/.test(pageSlug)) return 'weekly';
    if (pageSlug.includes('calculator') || pageSlug.includes('oven')) return 'weekly';
    return 'monthly';
}

function getAllPages() {
    try {
        const files = fs.readdirSync(pagesDir);
        const allPages = files.filter(file => {
            const filePath = path.join(pagesDir, file);
            const stat = fs.statSync(filePath);
            return stat.isFile()
                && file.endsWith('.tsx')
                && !EXCLUDED.includes(file)
                && !file.startsWith('[')
                && !/^\d/.test(file);
        }).map(file => file.replace('.tsx', ''));

        // 全量收录：所有 .tsx 页面（排除 EXCLUDED 列表）都直接返回，不做温度页过滤
        const filtered = [...allPages];

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
        return ['en'];
    }

    return detectedLocales.sort((a, b) => LOCALES.indexOf(a) - LOCALES.indexOf(b));
}

function getSitemapPages() {
    return SITEMAP_PAGES;
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

        urlEntries.push(createUrlEntry(loc, lastmod, hreflangLinks, getPriority(pageSlug), getChangefreq(pageSlug)));
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
