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
    return {
      beforeFiles: [
        // 在 i18n 路由处理之前拦截语言前缀的 .html 文件
        // 将它们重写到一个不存在的路径，从而返回 404
        {
          source: '/:locale(zh|es|hi|ar|ja|fr|de|id|pt-br)/:path*.html',
          destination: '/api/404-not-found',
        },
      ],
      afterFiles: [
        {
          source: '/images/equation/:celsius-celsius-to-fahrenheit-conversion.png',
          destination: '/api/og?c=:celsius',
        },
      ],
    };
  },

  async redirects() {
    return [
      {
        source: '/fan-oven-conversion-chart/',
        destination: '/fan-oven-conversion-chart',
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
