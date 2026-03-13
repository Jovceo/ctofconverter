import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEFAULT_LOCALE_PREFIX = '/en';

function getCanonicalEnglishPath(pathname: string) {
  if (pathname === DEFAULT_LOCALE_PREFIX) {
    return '/';
  }

  if (pathname.startsWith(`${DEFAULT_LOCALE_PREFIX}/`)) {
    return pathname.slice(DEFAULT_LOCALE_PREFIX.length) || '/';
  }

  return null;
}

export function proxy(request: NextRequest) {
  // Use the raw request URL here instead of locale-normalized routing data.
  const url = new URL(request.url);
  const canonicalPath = getCanonicalEnglishPath(url.pathname);

  if (!canonicalPath) {
    return NextResponse.next();
  }

  url.pathname = canonicalPath;
  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: '/:path*',
};
