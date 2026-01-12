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
      // 1. Core Feature & Metadata Redirects
      {
        source: '/fan-oven-conversion-chart/',
        destination: '/fan-oven-conversion-chart',
        statusCode: 301,
      },
      {
        source: '/fahrenheit-to-celsius/',
        destination: '/fahrenheit-to-celsius',
        statusCode: 301,
      },
      {
        source: '/c-to-f-formula/',
        destination: '/c-to-f-formula',
        statusCode: 301,
      },

      // 2. Generic .html to Clean URL (Handles all languages automatically)
      // Matches path.html but excludes sitemap.xml and other non-page assets
      {
        source: '/:path((?!.*(?:sitemap|robots|ads|google|yandex|favicon|apple-touch-icon)).*)\\.html',
        destination: '/:path',
        statusCode: 301,
      },

      // 3. Generic index.html to Directory (Handles all languages automatically)
      {
        source: '/:path*/index.html',
        destination: '/:path*',
        statusCode: 301,
      },

    ];
  },
};

module.exports = nextConfig;
