const migratedRoutes = require('./config/migrated-routes.json');

const migratedHtmlRoutePattern = migratedRoutes.htmlRoutes.join('|');
const migratedIndexHtmlRoutePattern = migratedRoutes.indexHtmlRoutes.join('|');
const legacyAliasRedirects = [
  {
    source: '/about',
    destination: '/about-us',
    statusCode: 301,
  },
  {
    source: '/formula',
    destination: '/c-to-f-formula',
    statusCode: 301,
  },
  {
    source: '/index.html',
    destination: '/',
    statusCode: 301,
  },
  {
    source: '/index2.html',
    destination: '/',
    statusCode: 301,
  },
  {
    source: '/body-temperature-conversion-chart/:path*',
    destination: '/body-temperature-chart-fever-guide',
    statusCode: 301,
  },
  {
    source: '/oven-temperature-chart/:path*',
    destination: '/fan-oven-conversion-chart',
    statusCode: 301,
  },
  {
    source: '/oven-temperature-conversion-chart/:path*',
    destination: '/fan-oven-conversion-chart',
    statusCode: 301,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,

  // Enable internationalization - Support multiple locales
  i18n: {
    locales: ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'],
    defaultLocale: 'en',
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
      // Canonical host/protocol redirects
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.ctofconverter.com',
          },
        ],
        destination: 'https://ctofconverter.com/:path*',
        statusCode: 301,
      },
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'ctofconverter.com',
          },
          {
            type: 'header',
            key: 'x-forwarded-proto',
            value: 'http',
          },
        ],
        destination: 'https://ctofconverter.com/:path*',
        statusCode: 301,
      },
      // Prevent duplicate default-locale URLs from staying indexable.
      {
        source: '/en',
        destination: '/',
        locale: false,
        statusCode: 301,
      },
      {
        source: '/en/:path*',
        destination: '/:path*',
        locale: false,
        statusCode: 301,
      },
      ...legacyAliasRedirects,
      // 1. Surgical Redirects: Only for pages that exist in Next.js (pages/ directory)
      {
        // Redirect top-level legacy .html pages that already have Next.js replacements.
        source: `/:path(${migratedHtmlRoutePattern}).html`,
        destination: '/:path',
        statusCode: 301,
      },
      {
        // Redirect legacy section index pages that already have Next.js replacements.
        source: `/:path(${migratedIndexHtmlRoutePattern})/index.html`,
        destination: '/:path',
        statusCode: 301,
      },
      // Note: All other static .html files (e.g., 13-c-to-f.html) in public/ will be served as-is.
      // Note: Trailing slash normalization is handled natively by Next.js (308 redirect).
    ];
  },
};

module.exports = nextConfig;
