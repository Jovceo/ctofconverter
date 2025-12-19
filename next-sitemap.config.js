const fs = require('fs');
const path = require('path');

/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: 'https://ctofconverter.com',
    generateRobotsTxt: true,
    sitemapSize: 5000,

    // 排除不需要生成在sitemap中的路径
    exclude: ['/404', '/500', '/sitemap.base.xml'],

    // 针对 i18n 的特殊处理
    alternateRefs: [
        { href: 'https://ctofconverter.com/', hreflang: 'x-default' },
        { href: 'https://ctofconverter.com/zh', hreflang: 'zh-CN' },
        { href: 'https://ctofconverter.com/pt-br', hreflang: 'pt-BR' },
    ],

    // 这里的 transform 可以进一步精细化每个页面的设置
    transform: async (config, loc) => {
        // 默认优先级
        let priority = config.priority;
        let changefreq = config.changefreq;

        // 提高核心转换页面的权重
        if (loc.includes('-c-to-f')) {
            priority = 0.9;
            changefreq = 'weekly';
        }

        // 首页最高权重
        if (loc === '/' || loc.match(/^\/(zh|es|hi|ar|ja|fr|de|id|pt-br)$/)) {
            priority = 1.0;
            changefreq = 'daily';
        }

        return {
            loc: loc,
            changefreq: changefreq,
            priority: priority,
            lastmod: config.autoLastmod ? new Date().toISOString() : undefined,
            alternateRefs: config.alternateRefs ?? [],
        }
    },

    // 额外包含 public 目录下的 legacy HTML 页面（如果有需要）
    additionalPaths: async (config) => {
        const result = [];
        const publicDir = path.join(process.cwd(), 'public');

        // 递归扫描函数示例
        const scanDir = (dir, base = '') => {
            const files = fs.readdirSync(dir);
            for (const file of files) {
                const fullPath = path.join(dir, file);
                const relPath = path.join(base, file);

                if (fs.statSync(fullPath).isDirectory()) {
                    if (!['images', '_next', 'nodes_modules'].includes(file)) {
                        scanDir(fullPath, relPath);
                    }
                } else if (file.endsWith('.html') && !['404.html', 'index.html', 'google4cefee41ce49f67b.html'].includes(file)) {
                    // 将 .html 页面加入站点地图
                    result.push({
                        loc: `/${relPath.replace(/\\/g, '/')}`,
                        changefreq: 'monthly',
                        priority: 0.6,
                        lastmod: new Date().toISOString(),
                    });
                }
            }
        };

        try {
            if (fs.existsSync(publicDir)) {
                scanDir(publicDir);
            }
        } catch (e) {
            console.warn('Error scanning public dir for sitemap:', e);
        }

        return result;
    },
}
