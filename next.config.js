const migratedRoutes = require('./config/migrated-routes.json');

const supportedLocales = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
const defaultLocale = 'en';
const nonDefaultLocalePattern = supportedLocales
  .filter((locale) => locale !== defaultLocale)
  .map((locale) => locale.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&'))
  .join('|');

const migratedHtmlRoutePattern = migratedRoutes.htmlRoutes.join('|');
const migratedIndexHtmlRoutePattern = migratedRoutes.indexHtmlRoutes.join('|');

function prefixLocalizedDestination(destination) {
  return destination === '/' ? '/:locale' : `/:locale${destination}`;
}

function expandLocalizedRedirect({ source, destination, statusCode = 301 }) {
  const redirects = [
    {
      source,
      destination,
      locale: false,
      statusCode,
    },
    {
      source: `/${defaultLocale}${source}`,
      destination,
      locale: false,
      statusCode,
    },
  ];

  if (nonDefaultLocalePattern) {
    redirects.push({
      source: `/:locale(${nonDefaultLocalePattern})${source}`,
      destination: prefixLocalizedDestination(destination),
      locale: false,
      statusCode,
    });
  }

  return redirects;
}

const legacyAliasRedirects = [
  { source: '/about', destination: '/about-us' },
  { source: '/formula', destination: '/c-to-f-formula' },
  { source: '/index.html', destination: '/' },
  { source: '/index2.html', destination: '/' },
  {
    source: '/body-temperature-conversion-chart/:path*',
    destination: '/body-temperature-chart-fever-guide',
  },
  {
    source: '/oven-temperature-chart/:path*',
    destination: '/fan-oven-conversion-chart',
  },
  {
    source: '/oven-temperature-conversion-chart/:path*',
    destination: '/fan-oven-conversion-chart',
  },
].flatMap(expandLocalizedRedirect);

const migratedHtmlRedirects = expandLocalizedRedirect({
  source: `/:path(${migratedHtmlRoutePattern}).html`,
  destination: '/:path',
});

const migratedIndexHtmlRedirects = expandLocalizedRedirect({
  source: `/:path(${migratedIndexHtmlRoutePattern})/index.html`,
  destination: '/:path',
});

// 0.5 C 档（2026-10-14）：目标不是同名干净 URL 的旧 HTML → hub 的 301。
// 这 13 页没有同温度的 Next 版，所以不能进 htmlRoutes（那条会 301 到不存在的干净 URL）。
// 归属依据：43°C 是体温值（发烧高温）；celsius-to-fahrenheit-chart 逐度覆盖 -50~150°C；
// fan-oven-conversion-chart 含 220°C / 250°C conventional。
const migratedCustomHtmlRedirects = Object.entries(migratedRoutes.htmlRedirects || {})
  .flatMap(([slug, destination]) =>
    expandLocalizedRedirect({ source: `/${slug}.html`, destination })
  );

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,
  skipProxyUrlNormalize: true,

  // Enable internationalization - Support multiple locales
  i18n: {
    locales: supportedLocales,
    defaultLocale,
    localeDetection: false,
  },

  // Silence Turbopack/Webpack conflict error by acknowledging Turbopack usage
  turbopack: {},

  // 图片优化
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
      },
    ],
    unoptimized: true,
  },

  // Webpack配置
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        fs: false,
        net: false,
        tls: false,
      };
    }
    return config;
  },

  async rewrites() {
    return [
      {
        source: '/images/equation/:celsius-celsius-to-fahrenheit-conversion.png',
        destination: '/api/og?c=:celsius',
      },
    ];
  },

  async redirects() {
    return [
      ...legacyAliasRedirects,
      ...migratedHtmlRedirects,
      ...migratedIndexHtmlRedirects,
      ...migratedCustomHtmlRedirects,
      // Do not add a generic `/en/:path* -> /:path*` redirect here.
      // Keep default-locale deduplication in request-level proxy logic, otherwise
      // Next's default-locale routing turns bare English URLs into self-redirect loops.
      // Note: All other static .html files (e.g., 13-c-to-f.html) in public/ will be served as-is.
      // Note: Trailing slash normalization is handled natively by Next.js (308 redirect).
    ];
  },
};

module.exports = nextConfig;
