import { GetServerSideProps } from 'next';
import fs from 'fs';
import path from 'path';

const SITE_URL = 'https://ctofconverter.com';

export const getServerSideProps: GetServerSideProps = async ({ res }) => {
    // 1. 获取所有语言
    const localesDir = path.join(process.cwd(), 'locales');
    const locales = fs.readdirSync(localesDir).filter(f =>
        fs.statSync(path.join(localesDir, f)).isDirectory()
    );

    // 2. 获取所有页面
    const pagesDir = path.join(process.cwd(), 'pages');
    const getPages = (dir: string, base = ''): string[] => {
        let results: string[] = [];
        const list = fs.readdirSync(dir);
        list.forEach(file => {
            const filePath = path.join(dir, file);
            const stat = fs.statSync(filePath);
            if (stat && stat.isDirectory()) {
                if (file !== 'api' && !file.startsWith('_')) {
                    results = results.concat(getPages(filePath, path.join(base, file)));
                }
            } else {
                if (file.endsWith('.tsx') || file.endsWith('.js')) {
                    const name = file.replace(/\.(tsx|js)$/, '');
                    if (name !== '_app' && name !== '_document' && name !== 'sitemap.xml' && name !== 'temperature-template') {
                        const pagePath = path.join(base, name === 'index' ? '' : name).replace(/\\/g, '/');
                        results.push(pagePath);
                    }
                }
            }
        });
        return results;
    };

    const pages = getPages(pagesDir);

    // 3. 生成 XML 条目
    const entries: string[] = [];

    pages.forEach(page => {
        // 默认语言 (en)
        const enUrl = page ? `${SITE_URL}/${page}` : `${SITE_URL}`;
        entries.push(`  <url>
    <loc>${enUrl}</loc>
    <changefreq>weekly</changefreq>
    <priority>${page === '' ? '1.0' : '0.8'}</priority>
  </url>`);

        // 其他语言
        locales.forEach(locale => {
            if (locale === 'en') return;
            const locUrl = page ? `${SITE_URL}/${locale}/${page}` : `${SITE_URL}/${locale}`;
            entries.push(`  <url>
    <loc>${locUrl}</loc>
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
