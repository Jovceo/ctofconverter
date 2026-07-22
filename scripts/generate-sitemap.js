const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const startTime = Date.now();

const SITE_URL = 'https://ctofconverter.com';
const EXCLUDED = ['_app.tsx', '_document.tsx', '_error.tsx', '404.tsx', 'sitemap.xml.tsx', 'api'];

// 项目上线日期 - 作为 lastmod 的兜底值
const PROJECT_LAUNCH_DATE = '2025-10-19';

// ============================================================
// 精做页面列表 - 从 config/quality-pages.json 读取
// 这些页面已手写高质量内容，在 sitemap 中获得最高 priority
// ============================================================
const qualityPagesPath = path.join(__dirname, '../config/quality-pages.json');
let qualityPages = [];
try {
    const data = JSON.parse(fs.readFileSync(qualityPagesPath, 'utf-8'));
    qualityPages = data.qualityPages || [];
    console.log(`⭐ Loaded ${qualityPages.length} quality pages: ${qualityPages.join(', ')}`);
} catch (e) {
    console.warn('⚠️ Could not load quality-pages.json, no quality pages marked:', e.message);
}

const pagesDir = path.join(__dirname, '../pages');
const localesDir = path.join(__dirname, '../locales');
const publicDir = path.join(__dirname, '../public');
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
 * 获取页面的 lastmod 日期（仅英语）
 */
function getPageLastMod(pageSlug) {
    const candidates = [];

    const tsxName = pageSlug === '' ? 'index.tsx' : `${pageSlug}.tsx`;
    const tsxPath = path.join(pagesDir, tsxName);
    if (fs.existsSync(tsxPath)) candidates.push(getLastModified(tsxPath));

    const jsonName = pageSlug === '' ? 'home.json' : `${pageSlug}.json`;
    const localePath = path.join(localesDir, 'en', jsonName);
    if (fs.existsSync(localePath)) candidates.push(getLastModified(localePath));

    return candidates.length > 0
        ? candidates.sort().reverse()[0]
        : PROJECT_LAUNCH_DATE;
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

function buildUrl(pageSlug) {
    return pageSlug ? `${SITE_URL}/${pageSlug}` : SITE_URL;
}

/**
 * 构建 URL 条目 - 包含 priority 和 changefreq
 */
function createUrlEntry(loc, lastmod, priority, changefreq) {
    const lines = [
        '  <url>',
        `    <loc>${loc}</loc>`,
        `    <lastmod>${lastmod}</lastmod>`,
        `    <priority>${priority}</priority>`,
        `    <changefreq>${changefreq}</changefreq>`,
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
    // 精做页面：次高
    if (qualityPages.includes(pageSlug)) return '0.9';
    // 工具页（calculator, oven 等）
    if (pageSlug.includes('calculator') || pageSlug.includes('oven')) return '0.8';
    // 整数温度页
    if (/^\d+-c-to-f$/.test(pageSlug)) return '0.6';
    // 小数温度页
    if (/^\d+-\d+-c-to-f$/.test(pageSlug)) return '0.4';
    // 其他内容页
    return '0.5';
}

function getChangefreq(pageSlug, qualityPages = []) {
    if (qualityPages.includes(pageSlug)) return 'weekly';
    if (pageSlug === '' || pageSlug === 'index') return 'weekly';
    if (/^\d+(-\d+)?-c-to-f$/.test(pageSlug)) return 'weekly';
    if (/^\d+-f-to-c$/.test(pageSlug)) return 'weekly';
    if (pageSlug.includes('calculator') || pageSlug.includes('oven')) return 'weekly';
    return 'monthly';
}

/**
 * 获取所有非温度页面（排除以数字开头的温度转换页）
 */
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

        // 排序：首页最前，其他页面按自然顺序排序
        allPages.sort((a, b) => {
            if (a === 'index') return -1;
            if (b === 'index') return 1;
            return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
        });

        return allPages;
    } catch (e) {
        console.error('Error reading pages directory:', e);
        return [];
    }
}

/**
 * 获取所有温度转换页面（以数字开头的 .tsx 文件）
 */
function getTemperaturePages() {
    try {
        const files = fs.readdirSync(pagesDir);
        return files
            .filter(file => file.endsWith('.tsx')
                && !EXCLUDED.includes(file)
                && /^\d/.test(file))
            .map(file => file.replace('.tsx', ''))
            .sort((a, b) => {
                // 按温度数值排序
                const numA = parseFloat(a.replace(/-c-to-f$/, '').replace('-', '.'));
                const numB = parseFloat(b.replace(/-c-to-f$/, '').replace('-', '.'));
                return numA - numB;
            });
    } catch (e) {
        console.error('Error reading temperature pages:', e);
        return [];
    }
}

/**
 * 获取所有要放入 sitemap 的页面
 * 精做页面排最前，然后是首页和工具页，最后是温度页
 */
function getSitemapPages() {
    const staticPages = getAllPages();
    const tempPages = getTemperaturePages();
    const allPages = [...new Set([...staticPages, ...tempPages])];

    // 排序：首页最前，然后精做页面，然后其余按自然顺序
    allPages.sort((a, b) => {
        if (a === 'index') return -1;
        if (b === 'index') return 1;
        const aQuality = qualityPages.includes(a);
        const bQuality = qualityPages.includes(b);
        if (aQuality && !bQuality) return -1;
        if (!aQuality && bQuality) return 1;
        return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' });
    });

    return allPages;
}

// ============================================================
// 4. 生成 sitemap（仅英语）
// ============================================================
const pages = getSitemapPages();
const urlEntries = [];

console.log(`Generating sitemap for ${pages.length} English pages...`);

pages.forEach(page => {
    const pageSlug = page === 'index' ? '' : page;
    const loc = escapeXml(buildUrl(pageSlug));
    const lastmod = getPageLastMod(pageSlug);
    const priority = getPriority(pageSlug);
    const changefreq = getChangefreq(pageSlug, qualityPages);

    urlEntries.push(createUrlEntry(loc, lastmod, priority, changefreq));
});

// ============================================================
// 5. 输出 XML
// ============================================================
const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset',
    '  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"',
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
console.log(`   URLs:          ${urlEntries.length}`);
console.log(`   Quality pages: ${qualityPages.length} (priority 0.9)`);
console.log(`   File size:     ${fileSizeKB} KB`);
console.log(`   Git files:     ${Object.keys(gitDateMap).length} cached`);
console.log(`   Output:        ${path.join(publicDir, 'sitemap.xml')}`);

if (urlEntries.length > 40000) {
    console.warn(`⚠️ URL count (${urlEntries.length}) approaching 50,000 limit.`);
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
