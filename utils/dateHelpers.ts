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
                    // Determine which date to use based on environment
                    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;

                    if (isCI) {
                        // In CI, trust Git date strictly to avoid build-time mtime reset
                        if (gitDate > latestMtime) {
                            latestMtime = gitDate;
                        }
                    } else {
                        // In Local, check if file system is newer (uncommitted changes)
                        // This logic is slightly different structure but same goal as sitemap script
                        // Check FS stats for this file specifically
                        try {
                            const stats = fs.statSync(fullPath);
                            const fsDate = stats.mtime;
                            // Use the newer of Git or FS
                            const newerDate = fsDate > gitDate ? fsDate : gitDate;
                            if (newerDate > latestMtime) {
                                latestMtime = newerDate;
                            }
                        } catch (e) {
                            // If stat fails, just use git date
                            if (gitDate > latestMtime) {
                                latestMtime = gitDate;
                            }
                        }
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
