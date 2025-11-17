/** @type {import('next').NextConfig} */
const nextConfig = {
  // 基础配置
  reactStrictMode: true,
  swcMinify: false,
  
  // 启用国际化 - 支持中文、英文、西班牙文、法文、德文
  i18n: {
    locales: ['zh', 'en', 'es', 'fr', 'de'],
    defaultLocale: 'zh',
    localeDetection: false,
  },
  
  // 图片优化
  images: {
    domains: ['localhost'],
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
};

module.exports = nextConfig;
