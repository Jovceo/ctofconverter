import fs from 'fs';
import path from 'path';

/**
 * Gets the latest modification time from a list of files or directories.
 * Returns ISO date string (YYYY-MM-DD).
 */
export function getLatestModifiedDate(filePaths: string[]): string {
    let latestMtime = new Date(0);

    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;

    filePaths.forEach((filePath) => {
        const fullPath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), filePath);

        if (fs.existsSync(fullPath)) {
            let fileDate = 0;
            let gitDate = 0;

            // 1. Try Git Date
            try {
                const relPath = path.relative(process.cwd(), fullPath);
                const gitDateStr = require('child_process').execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8', stdio: ['pipe', 'pipe', 'ignore'] }).trim();
                if (gitDateStr) {
                    gitDate = new Date(gitDateStr).getTime();
                }
            } catch (e) { /* ignore */ }

            // 2. Try FS Date
            let fsDate = 0;
            try {
                const stats = fs.statSync(fullPath);
                fsDate = stats.mtime.getTime();
            } catch (e) { /* ignore */ }

            // 3. Decision Logic
            // 3. Decision Logic
            if (isCI) {
                // CI: Trust Git only. 
                // We DO NOT fallback to FS in CI, as FS is typically "now" (build time).
                // Better to return 0 (and trigger fallback) than show a false "updated today" date.
                fileDate = gitDate;
            } else {
                // Local: Trust newer (allows uncommitted previews)
                fileDate = Math.max(gitDate, fsDate);
            }

            if (fileDate > latestMtime.getTime()) {
                latestMtime = new Date(fileDate);
            }
        }
    });

    // Default fallback if no files found
    if (latestMtime.getTime() === 0) {
        return '2025-09-15';
    }

    return latestMtime.toISOString().split('T')[0];
}
