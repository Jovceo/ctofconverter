import migratedRoutes from '../config/migrated-routes.json';

const SITE_ORIGIN = 'https://ctofconverter.com';
const migratedHtmlRouteSet = new Set(migratedRoutes.htmlRoutes);
const migratedIndexHtmlRouteSet = new Set(migratedRoutes.indexHtmlRoutes);

export function normalizeMigratedUrl(url: string) {
  try {
    const parsed = new URL(
      /^https?:\/\//.test(url) ? url : url.startsWith('/') ? url : `/${url}`,
      SITE_ORIGIN
    );

    if (parsed.origin !== SITE_ORIGIN) {
      return url;
    }

    const { pathname, search, hash } = parsed;

    if (pathname.endsWith('/index.html')) {
      const slug = pathname.slice(1, -'/index.html'.length);
      if (migratedIndexHtmlRouteSet.has(slug)) {
        return `/${slug}`;
      }
    }

    if (pathname.endsWith('.html')) {
      const slug = pathname.slice(1, -'.html'.length);
      if (migratedHtmlRouteSet.has(slug)) {
        return `/${slug}`;
      }
    }

    return `${pathname}${search}${hash}`;
  } catch {
    return url;
  }
}
