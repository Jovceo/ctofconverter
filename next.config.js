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
      {
        source: '/fan-oven-conversion-chart/',
        destination: '/fan-oven-conversion-chart',
        statusCode: 301,
      },
      // 301 Redirects: Legacy Static HTML -> Next.js Dynamic Routes
      // These shadow the public/*.html files (checked before filesystem)
      {
        source: '/0-c-to-f.html',
        destination: '/0-c-to-f',
        statusCode: 301,
      },
      {
        source: '/37-c-to-f.html',
        destination: '/37-c-to-f',
        statusCode: 301,
      },
      {
        source: '/37-2-c-to-f.html',
        destination: '/37-2-c-to-f',
        statusCode: 301,
      },
      {
        source: '/37-5-c-to-f.html',
        destination: '/37-5-c-to-f',
        statusCode: 301,
      },
      {
        source: '/4-c-to-f.html',
        destination: '/4-c-to-f',
        statusCode: 301,
      },
      {
        source: '/47-c-to-f.html',
        destination: '/47-c-to-f',
        statusCode: 301,
      },
      {
        source: '/75-c-to-f.html',
        destination: '/75-c-to-f',
        statusCode: 301,
      },
      {
        source: '/100-c-to-f.html',
        destination: '/100-c-to-f',
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
