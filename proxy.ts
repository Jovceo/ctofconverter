import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const DEFAULT_LOCALE_PREFIX = '/en';
const CANONICAL_HOST = 'ctofconverter.com';
const WWW_HOST = 'www.ctofconverter.com';

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
  const requestHost = request.headers.get('host');
  let shouldRedirect = false;

  if (requestHost === WWW_HOST) {
    url.hostname = CANONICAL_HOST;
    url.protocol = 'https:';
    url.port = '';
    shouldRedirect = true;
  }

  const canonicalPath = getCanonicalEnglishPath(url.pathname);

  if (canonicalPath) {
    url.pathname = canonicalPath;
    shouldRedirect = true;
  }

  if (!shouldRedirect) {
    return NextResponse.next();
  }

  return NextResponse.redirect(url, 301);
}

export const config = {
  matcher: [
    {
      source: '/:path*',
      has: [
        {
          type: 'host',
          value: 'www.ctofconverter.com',
        },
      ],
    },
  ],
};
