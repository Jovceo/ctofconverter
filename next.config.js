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
      // 1. Surgical Redirects: Only for pages that exist in Next.js (pages/ directory)
      {
        // Redirect .html to clean URL for:
        // - Numbered temp pages (0, 4, 20, 37, 37-2, 37-5, 47, 75, 100)
        // - Core features (calculators, charts, formula)
        // - Base pages (about, privacy, terms)
        source: '/:path(0-c-to-f|4-c-to-f|20-c-to-f|37-c-to-f|37-2-c-to-f|37-5-c-to-f|47-c-to-f|75-c-to-f|100-c-to-f|about-us|privacy-policy|terms-of-service|c-to-f-calculator|c-to-f-formula|celsius-to-fahrenheit-chart|fahrenheit-to-celsius|fan-oven-conversion-chart|temperature-conversion-challenge|body-temperature-chart-fever-guide).html',
        destination: '/:path',
        statusCode: 301,
      },
      {
        // Redirect index.html to parent directory for core feature sections
        source: '/:path(c-to-f-calculator|c-to-f-formula|celsius-to-fahrenheit-chart|fahrenheit-to-celsius|fan-oven-conversion-chart)/index.html',
        destination: '/:path',
        statusCode: 301,
      },
      // Note: All other static .html files (e.g., 13-c-to-f.html) in public/ will be served as-is.
    ];
  },
};

module.exports = nextConfig;
