import fs from 'fs';
import path from 'path';

/**
 * Gets the latest modification time from a list of files or directories.
 * Returns ISO date string (YYYY-MM-DD).
 */
export function getLatestModifiedDate(filePaths: string[]): string {
    let latestMtime = new Date(0);

    filePaths.forEach((filePath) => {
        const fullPath = path.isAbsolute(filePath)
            ? filePath
            : path.join(process.cwd(), filePath);

        if (fs.existsSync(fullPath)) {
            try {
                // Determine relative path for git command
                const relPath = path.relative(process.cwd(), fullPath);
                // Use git log to get the commit date
                const gitDateStr = require('child_process').execSync(`git log -1 --format=%cI "${relPath}"`, { encoding: 'utf-8' }).trim();

                if (gitDateStr) {
                    const gitDate = new Date(gitDateStr);
                    if (gitDate > latestMtime) {
                        latestMtime = gitDate;
                    }
                } else {
                    // Fallback to fs.statSync if git returns empty (e.g. untracked file)
                    const stats = fs.statSync(fullPath);
                    if (stats.mtime > latestMtime) {
                        latestMtime = stats.mtime;
                    }
                }
            } catch (e) {
                // Fallback if git command fails (e.g. no git installed or not a repo)
                const stats = fs.statSync(fullPath);
                if (stats.mtime > latestMtime) {
                    latestMtime = stats.mtime;
                }
            }
        }
    });

    // Default fallback if no files found
    if (latestMtime.getTime() === 0) {
        return '2025-09-15';
    }

    return latestMtime.toISOString().split('T')[0];
}
