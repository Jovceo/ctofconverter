import fs from 'fs';
import path from 'path';

/**
 * Gets the latest modification time from a list of files or directories.
 * Returns ISO date string (YYYY-MM-DD).
 */
export function getLatestModifiedDate(filePaths: string[]): string {
    let latestMtime = new Date(0);

    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;
    const debug = process.env.DEBUG_DATE_HELPER === 'true';

    filePaths.forEach((filePath) => {
        const fullPath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), filePath);

        if (debug) {
            console.log(`\n检查文件: ${filePath}`);
            console.log(`  完整路径: ${fullPath}`);
            console.log(`  文件存在: ${fs.existsSync(fullPath)}`);
        }

        if (fs.existsSync(fullPath)) {
            let fileDate = 0;
            let gitDate = 0;

            // 1. Try Git Date
            try {
                const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
                const gitCmd = `git log -1 --format=%cI "${relPath}"`;
                const gitDateStr = require('child_process').execSync(gitCmd, {
                    encoding: 'utf-8',
                    stdio: ['pipe', 'pipe', 'ignore']
                }).trim();

                if (gitDateStr) {
                    gitDate = new Date(gitDateStr).getTime();
                    if (debug) {
                        console.log(`  Git 日期: ${gitDateStr} (${new Date(gitDate).toISOString().split('T')[0]})`);
                    }
                }
            } catch (e: unknown) {
                if (debug) {
                    const error = e as Error;
                    console.log(`  Git 日期获取失败: ${error.message}`);
                }
            }

            // 2. Try FS Date
            let fsDate = 0;
            try {
                const stats = fs.statSync(fullPath);
                fsDate = stats.mtime.getTime();
                if (debug) {
                    console.log(`  文件系统日期: ${stats.mtime.toISOString()} (${new Date(fsDate).toISOString().split('T')[0]})`);
                }
            } catch (e: unknown) {
                if (debug) {
                    const error = e as Error;
                    console.log(`  文件系统日期获取失败: ${error.message}`);
                }
            }

            // 3. Decision Logic
            if (isCI) {
                // CI: Trust Git only
                fileDate = gitDate;
            } else {
                // Local: Trust newer (allows uncommitted previews)
                fileDate = Math.max(gitDate, fsDate);
            }

            if (debug) {
                console.log(`  最终选择: ${fileDate > 0 ? new Date(fileDate).toISOString().split('T')[0] : '无效'}`);
            }

            if (fileDate > latestMtime.getTime()) {
                latestMtime = new Date(fileDate);
            }
        }
    });

    if (debug) {
        console.log(`\n所有文件的最新时间: ${latestMtime.getTime() > 0 ? latestMtime.toISOString().split('T')[0] : '2025-09-15 (默认值)'}\n`);
    }

    // Default fallback if no files found
    if (latestMtime.getTime() === 0) {
        return '2025-09-15';
    }

    return latestMtime.toISOString().split('T')[0];
}
