import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

function resolveFullPath(filePath: string): string {
    return path.isAbsolute(filePath)
        ? filePath
        : path.join(process.cwd(), filePath);
}

function getGitModifiedTime(fullPath: string): number {
    try {
        const relPath = path.relative(process.cwd(), fullPath).replace(/\\/g, '/');
        const gitCmd = `git log -1 --format=%cI "${relPath}"`;
        const gitDateStr = execSync(gitCmd, {
            encoding: 'utf-8',
            stdio: ['pipe', 'pipe', 'ignore']
        }).trim();

        return gitDateStr ? new Date(gitDateStr).getTime() : 0;
    } catch {
        return 0;
    }
}

function getFsModifiedTime(fullPath: string): number {
    try {
        return fs.statSync(fullPath).mtime.getTime();
    } catch {
        return 0;
    }
}

/**
 * Gets the latest modification time from a list of files or directories.
 * Returns ISO date string (YYYY-MM-DD).
 */
export function getLatestModifiedDate(filePaths: string[]): string {
    let latestMtime = new Date(0);

    const isCI = process.env.CI || process.env.VERCEL || process.env.NETLIFY;
    const debug = process.env.DEBUG_DATE_HELPER === 'true';

    filePaths.forEach((filePath) => {
        const fullPath = resolveFullPath(filePath);

        if (debug) {
            console.log(`\nChecking file: ${filePath}`);
            console.log(`  Full path: ${fullPath}`);
            console.log(`  Exists: ${fs.existsSync(fullPath)}`);
        }

        if (!fs.existsSync(fullPath)) {
            return;
        }

        const gitDate = getGitModifiedTime(fullPath);
        const fsDate = getFsModifiedTime(fullPath);

        if (debug && gitDate > 0) {
            console.log(`  Git date: ${new Date(gitDate).toISOString()} (${new Date(gitDate).toISOString().split('T')[0]})`);
        }

        if (debug && fsDate > 0) {
            console.log(`  FS date: ${new Date(fsDate).toISOString()} (${new Date(fsDate).toISOString().split('T')[0]})`);
        }

        const fileDate = isCI
            ? (fsDate > 0 ? fsDate : gitDate)
            : Math.max(gitDate, fsDate);

        if (debug) {
            console.log(`  Selected: ${fileDate > 0 ? new Date(fileDate).toISOString().split('T')[0] : 'invalid'}`);
        }

        if (fileDate > latestMtime.getTime()) {
            latestMtime = new Date(fileDate);
        }
    });

    if (debug) {
        console.log(`\nLatest date across files: ${latestMtime.getTime() > 0 ? latestMtime.toISOString().split('T')[0] : '2025-09-15 (fallback)'}\n`);
    }

    if (latestMtime.getTime() === 0) {
        return '2025-09-15';
    }

    return latestMtime.toISOString().split('T')[0];
}

/**
 * Homepage "latest conversions" should use a stable source in both local and CI.
 * Prefer Git commit time so deploy/build mtimes do not reshuffle the list online.
 */
export function getLatestModifiedDatePreferGit(filePaths: string[]): string {
    let latestTimestamp = 0;

    filePaths.forEach((filePath) => {
        const fullPath = resolveFullPath(filePath);
        if (!fs.existsSync(fullPath)) {
            return;
        }

        const gitDate = getGitModifiedTime(fullPath);
        const fsDate = getFsModifiedTime(fullPath);
        const fileDate = gitDate || fsDate;

        if (fileDate > latestTimestamp) {
            latestTimestamp = fileDate;
        }
    });

    if (latestTimestamp === 0) {
        return '2025-09-15';
    }

    return new Date(latestTimestamp).toISOString().split('T')[0];
}
