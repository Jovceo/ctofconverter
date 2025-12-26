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
            const stats = fs.statSync(fullPath);
            if (stats.mtime > latestMtime) {
                latestMtime = stats.mtime;
            }
        }
    });

    // Default fallback if no files found
    if (latestMtime.getTime() === 0) {
        return '2025-09-15';
    }

    return latestMtime.toISOString().split('T')[0];
}
