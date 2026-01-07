import type { NextRequest } from 'next/server';

/**
 * API 路由：返回 404 Not Found
 * 
 * 用途：当访问被拦截的 URL 时（如 /zh/0-c-to-f.html），
 * next.config.js 的 beforeFiles rewrites 会将请求重写到这个 API，
 * 然后返回 404 状态码。
 */
export function GET(request: NextRequest) {
    return new Response('Not Found', {
        status: 404,
        headers: {
            'Content-Type': 'text/plain',
        },
    });
}

export const runtime = 'edge';
