import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { createHash, timingSafeEqual } from 'crypto';

const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const SITE_URL = 'https://ctofconverter.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * IndexNow 手动提交端点
 *
 * 使用方式（必须带请求头；secret 不再走 query，否则会落进访问日志/代理日志/浏览器历史）：
 *   curl -X POST -H "x-indexnow-secret: $INDEXNOW_SECRET" https://ctofconverter.com/api/indexnow
 *   curl -X POST -H "x-indexnow-secret: $INDEXNOW_SECRET" \
 *        "https://ctofconverter.com/api/indexnow?urls=https://ctofconverter.com/a,https://ctofconverter.com/b"
 *
 * 安全语义（2026-08-25 改动）：
 *   · **fail-closed**：`INDEXNOW_SECRET` 没配就直接 503 关掉端点。
 *     旧写法是 `secret !== expectedSecret`，env 缺失时两边都是 undefined →
 *     空请求也能过 —— 这就是 2026-08-25 实测到“无鉴权写入口”的真实机制。
 *   · 定长比较走 sha256 + timingSafeEqual，不泄露长度时序。
 *   · 本地提交不需要这个端点：`scripts/manual-indexnow.js` 直接打 IndexNow，
 *     而且 `package.json` 的 postbuild 已于 2026-08-20 停掉（Bing 2026-08-08 降权）。
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    const expectedSecret = process.env.INDEXNOW_SECRET;

    // fail-closed：没配 secret = 端点不存在。绝不因为“两边都空”而放行。
    if (!expectedSecret) {
        return res.status(503).json({ error: 'INDEXNOW_SECRET 未配置，该端点已关闭' });
    }

    const header = req.headers['x-indexnow-secret'];
    const provided = Array.isArray(header) ? header[0] : header;

    const matches = (value: string): boolean => {
        try {
            return timingSafeEqual(
                createHash('sha256').update(value).digest(),
                createHash('sha256').update(expectedSecret).digest(),
            );
        } catch {
            return false;
        }
    };

    if (typeof provided !== 'string' || provided.length === 0 || !matches(provided)) {
        return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'GET') {
        return res.status(200).json({
            status: 'ready',
            key: INDEXNOW_KEY,
            keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
            endpoint: INDEXNOW_ENDPOINT,
        });
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        let urlList: string[] = [];

        // 如果指定了 urls 参数，使用指定的 URL
        const urlsParam = req.query.urls as string;
        if (urlsParam) {
            urlList = urlsParam.split(',').map(u => u.trim()).filter(Boolean);
        } else {
            // 否则从 sitemap.xml 读取所有 URL
            const sitemapPath = path.join(process.cwd(), 'public', 'sitemap.xml');

            if (!fs.existsSync(sitemapPath)) {
                return res.status(404).json({ error: 'sitemap.xml not found' });
            }

            const sitemapContent = fs.readFileSync(sitemapPath, 'utf-8');
            const urlMatches = sitemapContent.match(/<loc>(.*?)<\/loc>/g);

            if (urlMatches) {
                urlList = urlMatches.map(match => match.replace(/<\/?loc>/g, ''));
            }
        }

        if (urlList.length === 0) {
            return res.status(400).json({ error: 'No URLs to submit' });
        }

        // IndexNow API 每次最多 10,000 个 URL
        const batchSize = 10000;
        const results = [];

        for (let i = 0; i < urlList.length; i += batchSize) {
            const batch = urlList.slice(i, i + batchSize);

            const response = await fetch(INDEXNOW_ENDPOINT, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json; charset=utf-8' },
                body: JSON.stringify({
                    host: 'ctofconverter.com',
                    key: INDEXNOW_KEY,
                    keyLocation: `${SITE_URL}/${INDEXNOW_KEY}.txt`,
                    urlList: batch,
                }),
            });

            results.push({
                batch: Math.floor(i / batchSize) + 1,
                count: batch.length,
                status: response.status,
                statusText: response.statusText,
            });
        }

        return res.status(200).json({
            success: true,
            totalUrls: urlList.length,
            results,
            message: `Successfully submitted ${urlList.length} URLs to IndexNow`,
        });
    } catch (error: any) {
        return res.status(500).json({
            error: 'Failed to submit URLs',
            details: error.message,
        });
    }
}
