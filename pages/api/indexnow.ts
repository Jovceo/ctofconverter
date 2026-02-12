import type { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';

const INDEXNOW_KEY = 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6';
const SITE_URL = 'https://ctofconverter.com';
const INDEXNOW_ENDPOINT = 'https://api.indexnow.org/indexnow';

/**
 * IndexNow API Route
 * 
 * 使用方式：
 *   GET  /api/indexnow          → 返回状态信息
 *   POST /api/indexnow          → 从 sitemap.xml 读取所有 URL 并提交
 *   POST /api/indexnow?urls=... → 提交指定 URL（逗号分隔）
 * 
 * 安全：需要 Authorization header 或 secret query 参数
 */
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    // 简单安全检查：需要 secret 参数（部署后通过环境变量配置更安全的方式）
    const secret = req.query.secret || req.headers['x-indexnow-secret'];
    const expectedSecret = process.env.INDEXNOW_SECRET || 'ctof-indexnow-2026';

    if (secret !== expectedSecret) {
        return res.status(401).json({ error: 'Unauthorized. Provide ?secret=YOUR_SECRET' });
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
