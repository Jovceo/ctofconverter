import { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';
import { getLatestModifiedDate } from '../utils/dateHelpers';

const SITE_URL = 'https://ctofconverter.com';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // 1. 获取所有语言
    const localesDir = path.join(process.cwd(), 'locales');
    const locales = fs.readdirSync(localesDir).filter(f =>
        fs.statSync(path.join(localesDir, f)).isDirectory()
    );

    // 2. 获取所有页面及其真实更新时间
    const pagesDir = path.join(process.cwd(), 'pages');
    const getPagesWithDates = (dir: string, base = ''): { path: string; lastmod: string }[] => {
        let results: { path: string; lastmod: string }[] = [];
        const list = fs.readdirSync(dir);

        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);

            if (stat && stat.isDirectory()) {
                if (file !== 'api' && !file.startsWith('_')) {
                    results = results.concat(getPagesWithDates(filePath, path.join(base, file)));
                }
            } else {
                if (file.endsWith('.tsx') || file.endsWith('.js')) {
                    const name = file.replace(/\.(tsx|js)$/, '');

                    // 排除不需要包含在 sitemap 中的页面
                    if (name !== '_app' && name !== '_document' && name !== 'sitemap.xml' && name !== 'temperature-template') {
                        // 修复 URL 路径：统一为 Unix 风格并移除末尾多余字符
                        let pagePath = path.join(base, name === 'index' ? '' : name)
                            .replace(/\\/g, '/')  // 统一为 Unix 风格
                            .replace(/\.+$/, ''); // 移除末尾的点号

                        // 统一使用固定日期
                        const lastmod = '2026-01-15';
                        results.push({ path: pagePath, lastmod });
                    }
                }
            }
        });

        return results;
    };

    let allPages = getPagesWithDates(pagesDir);

    // 3. 排序：首页第一位，其余按最后修改时间倒序排列（最新的在前）
    allPages.sort((a, b) => {
        if (a.path === '') return -1;
        if (b.path === '') return 1;

        // 按时间戳比较，最新的在前
        const timeA = new Date(a.lastmod).getTime();
        const timeB = new Date(b.lastmod).getTime();

        if (timeB !== timeA) {
            return timeB - timeA;
        }

        // 如果日期相同，按路径字母顺序
        return a.path.localeCompare(b.path);
    });

    // 4. 生成 XML 条目（英语版本在前）
    const entries: string[] = [];

    allPages.forEach(pageObj => {
        const { path: page, lastmod } = pageObj;

        // 先生成英语版本（默认语言）
        const enUrl = page ? `${SITE_URL}/${page}` : SITE_URL;
        entries.push(`  <url>
    <loc>${enUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`);

        // 再生成其他语言版本
        locales.forEach(locale => {
            if (locale === 'en') return;
            const locUrl = page ? `${SITE_URL}/${locale}/${page}` : `${SITE_URL}/${locale}`;
            entries.push(`  <url>
    <loc>${locUrl}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '0.9' : '0.7'}</priority>
  </url>`);
        });
    });

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.join('\n')}
</urlset>`;

    res.setHeader('Content-Type', 'text/xml');
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
};

export default function Sitemap() { }
