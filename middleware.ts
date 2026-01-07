import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware 中间件
 * 
 * 作用：阻止语言前缀路径访问 public 目录下的静态 HTML 文件
 * 
 * 问题背景：
 * - public/*.html 在所有语言路径下都可访问（如 /zh/0-c-to-f.html）
 * - 这导致重复内容和语言不匹配问题（中文路径返回英文内容）
 * 
 * 解决方案：
 * - 拦截 /:locale/*.html 路径（如 /zh/0-c-to-f.html）
 * - 返回 404，告诉搜索引擎这些路径不存在
 * - 保留原始路径 /*.html（如 /0-c-to-f.html）正常访问
 */
export function middleware(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // 匹配所有语言前缀 + .html 文件的路径
    // 例如：/zh/0-c-to-f.html, /es/360-c-to-f.html
    const localeHtmlPattern = /^\/(zh|es|hi|ar|ja|fr|de|id|pt-br)\/.*\.html$/;

    if (localeHtmlPattern.test(pathname)) {
        // 返回 404 Not Found
        // 搜索引擎会将这些路径从索引中移除
        return new NextResponse(null, { status: 404 });
    }

    // 其他请求正常处理
    return NextResponse.next();
}

/**
 * Matcher 配置
 * 
 * 限制 middleware 只在特定路径上运行，提升性能
 * 只匹配：/:locale/*.html 格式的路径
 */
export const config = {
    matcher: '/:locale(zh|es|hi|ar|ja|fr|de|id|pt-br)/:path*.html',
};
