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
// 已迁移的旧 HTML 路由 - 这些 URL 已被 301，不能进 sitemap
// 把 301 的 URL 放进 sitemap = 浪费抓取预算 + 向搜索引擎发错误信号
// ============================================================
const migratedRoutesPath = path.join(__dirname, '../config/migrated-routes.json');
const migratedHtmlFiles = new Set();
try {
    const data = JSON.parse(fs.readFileSync(migratedRoutesPath, 'utf-8'));
    for (const slug of [...(data.htmlRoutes || []), ...(data.indexHtmlRoutes || [])]) {
        migratedHtmlFiles.add(`${slug}.html`);
    }
    console.log(`📦 Loaded ${migratedHtmlFiles.size} migrated routes (excluded from sitemap)`);
} catch (e) {
    console.warn('⚠️ Could not load migrated-routes.json, orphan filter may be incomplete:', e.message);
}

// 孤儿旧 HTML 的非内容文件（不进 sitemap）
const ORPHAN_HTML_EXCLUDED = new Set(['404.html', 'demo.html']);

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

    // 孤儿旧 HTML：源码在 public/ 下，lastmod 走 Git（不能用 mtime——
    // 72 个 html 的 mtime 是同一天，会让 sitemap 里整批页显示同一日期）
    if (pageSlug.endsWith('.html')) {
        const htmlPath = path.join(publicDir, pageSlug);
        if (fs.existsSync(htmlPath)) candidates.push(getLastModified(htmlPath));
        return candidates.length > 0
            ? candidates.sort().reverse()[0]
            : PROJECT_LAUNCH_DATE;
    }

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
    return pageSlug ? `${SITE_URL}/${pageSlug}` : `${SITE_URL}/`;
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
    // 孤儿旧 HTML 页（保留 .html 后缀）：历史遗留资产，低于精做页与工具页，高于小数温度页
    if (pageSlug.endsWith('.html')) return '0.5';
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
 * 获取孤儿旧 HTML 页面
 *
 * "孤儿"定义（四条全中）：200 在线 + 不在 sitemap + 无内链 + 无 Next 版本且不在 migrated-routes.json
 * 三道过滤：
 *   1. 排除 404.html / demo.html
 *   2. 排除搜索引擎验证文件（google*.html / yandex_*.html）
 *   3. 排除已在 migrated-routes.json 的（已 301）
 * 保留 .html 后缀：这批页的历史信号全在 .html 这个 URL 上，改 URL 等于丢信号。
 * 实测（2026-09-23）：这批页是"被漏迁的精做页"（表格 + FAQ + JSON-LD + 场景化 title），
 * 不是低质旧页；崩前池周均展示 3,128，占全站展示 32.1%。
 */
function getOrphanHtmlPages() {
    try {
        const files = fs.readdirSync(publicDir);
        const orphans = files
            .filter(file => file.endsWith('.html'))
            .filter(file => !ORPHAN_HTML_EXCLUDED.has(file))
            .filter(file => !/^(google|yandex)/i.test(file))
            .filter(file => !migratedHtmlFiles.has(file))
            .sort((a, b) => a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }));

        console.log(`🔍 Found ${orphans.length} orphan HTML pages (never in sitemap before)`);
        verifyOrphanRegistry(orphans);
        return orphans;
    } catch (e) {
        console.error('Error reading public directory:', e);
        return [];
    }
}

/**
 * 一致性校验：utils/orphanTemperaturePages.ts 的静态列表必须与 public/*.html 实际孤儿一致。
 * 内链用的是静态列表；一旦漂移 ——
 *   注册表缺少 → 孤儿拿不到内链（漏）；
 *   注册表多余 → 页面已不存在，会生成指向 404 的链接。
 */
function verifyOrphanRegistry(actualOrphans) {
    const registryPath = path.join(__dirname, '../utils/orphanTemperaturePages.ts');
    try {
        const src = fs.readFileSync(registryPath, 'utf-8');
        const registered = new Set(
            [...src.matchAll(/'(\d+(?:-\d+)?-c-to-f)'/g)].map((m) => `${m[1]}.html`)
        );
        const actual = new Set(actualOrphans);

        const missing = [...actual].filter((f) => !registered.has(f));
        const stale = [...registered].filter((f) => !actual.has(f));

        if (missing.length || stale.length) {
            console.warn('⚠️  orphanTemperaturePages.ts 与 public/*.html 不一致：');
            if (missing.length) {
                console.warn(`    注册表缺少 ${missing.length} 个（这些页拿不到内链）: ${missing.join(', ')}`);
            }
            if (stale.length) {
                console.warn(`    注册表多余 ${stale.length} 个（会生成 404 链接）: ${stale.join(', ')}`);
            }
        } else {
            console.log(`✅ Orphan registry matches public/*.html (${registered.size} entries)`);
        }
    } catch (e) {
        console.warn('⚠️  Could not verify orphan registry:', e.message);
    }
}

/**
 * 获取所有要放入 sitemap 的页面
 * 精做页面排最前，然后是首页和工具页，最后是温度页
 */
function getSitemapPages() {
    const staticPages = getAllPages();
    const tempPages = getTemperaturePages();
    const orphanPages = getOrphanHtmlPages();
    const allPages = [...new Set([...staticPages, ...tempPages, ...orphanPages])];

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
