
import fs from 'fs';
import path from 'path';
import { ORPHAN_CELSIUS } from './orphanTemperaturePages';

/**
 * 获取现有的所有温度转换页面列表
 * 仅在服务端(getStaticProps)使用，通过扫描 pages 目录实现自动化内链检测
 *
 * 2026-09-23：同时并入"孤儿旧 HTML"的温度值（public/*.html，无 Next 版本）。
 * 原实现只扫 pages/，导致这批页面永远拿不到 related 内链 —— 这是它们"零入链"的代码级原因。
 * 详见 utils/orphanTemperaturePages.ts
 */
export function getAvailableTemperaturePages(): number[] {
    try {
        const pagesDirectory = path.join(process.cwd(), 'pages');

        if (!fs.existsSync(pagesDirectory)) {
            return [];
        }

        const filenames = fs.readdirSync(pagesDirectory);

        const availableTemps: number[] = [];

        // 正则匹配: 类似 37-5-c-to-f.tsx 或 100-c-to-f.tsx
        // 捕获组1: 具体的数字部分 (如 37-5 或 100)
        const regex = /^(\d+(?:-\d+)?)-c-to-f\.tsx$/;

        filenames.forEach(file => {
            const match = file.match(regex);
            if (match) {
                // 将连字符格式 (37-5) 还原为点号格式 (37.5) 以便数值比较
                const numStr = match[1].replace(/-/g, '.');
                const num = parseFloat(numStr);
                if (!isNaN(num)) {
                    availableTemps.push(num);
                }
            }
        });

        // 并入孤儿旧 HTML 的温度值（public/*.html，200 在线但无 Next 版本）
        // 注意：tsconfig target 为 es5，不能直接 for...of 迭代 Set，必须转数组
        Array.from(ORPHAN_CELSIUS).forEach(num => {
            if (!availableTemps.includes(num)) {
                availableTemps.push(num);
            }
        });

        return availableTemps;
    } catch (error) {
        console.error('Error scanning pages directory:', error);
        return [];
    }
}
