/** /api/ref/* 的公共响应头与方法守卫（只读、无鉴权、允许跨域——这是数据集的意义所在）。 */
import type { NextApiRequest, NextApiResponse } from 'next';

export const REF_API_MAX_AGE = 'public, max-age=300, s-maxage=86400, stale-while-revalidate=604800';

export function applyRefHeaders(res: NextApiResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Accept');
  res.setHeader('Access-Control-Max-Age', '604800');
  res.setHeader('X-Content-Type-Options', 'nosniff');
  res.setHeader('Cache-Control', REF_API_MAX_AGE);
}

/**
 * @returns true 表示请求已被处理完（调用方应立即 return）。
 */
export function guardMethod(req: NextApiRequest, res: NextApiResponse): boolean {
  applyRefHeaders(res);
  if (req.method === 'OPTIONS') {
    res.status(204).end();
    return true;
  }
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    res.status(405).json({ error: 'method_not_allowed', message: 'This endpoint is read-only; use GET.' });
    return true;
  }
  return false;
}

export function str(req: NextApiRequest, key: string): string | undefined {
  const v = req.query[key];
  const first = Array.isArray(v) ? v[0] : v;
  return typeof first === 'string' && first.trim() ? first.trim() : undefined;
}
