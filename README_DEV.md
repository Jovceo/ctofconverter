# C to F Converter 开发文档

## 1. 项目概览
本项目是一个基于 Next.js 开发的高性能、多语言摄氏度转华氏度在线转换工具。它结合了动态页面生成、服务端渲染 (SSR) 和强化的 SEO 策略，旨在提供极致的用户体验和搜索引擎可见性。

## 2. 技术栈
- **框架**: Next.js 14 (Pages Router)
- **语言**: TypeScript
- **样式**: Vanilla CSS (全局样式 + 模块化设计)
- **国际化**: 自定义 i18n 解析方案
- **SEO**: 动态 Sitemap 生成、OG Image API、自动化 Hreflang 注入

## 3. 核心架构与目录结构

### 3.1 核心目录
- `/pages`: 页面路由。
  - `index.tsx`: 首页（核心转换器）。
  - `temperature-template.tsx`: 动态温度页面的通用服务端模板。
  - `[temp]-c-to-f.tsx`: 特定温度页面的配置入口。
- `/components`: 可复用 UI 组件（Header, Footer, Analytics, Converter 等）。
- `/utils`: 工具类函数。
  - `i18n.ts`: 国际化核心逻辑。
  - `temperaturePageHelpers.ts`: 温度计算、结构化数据生成（Schema.org）。
  - `contentStrategy.ts`: 内容生成算法（根据温度自动生成百科内容）。
- `/templates`: 页面结构模板。
- `/scripts`: 构建辅助脚本（如 Sitemap 生成）。
- `/public`: 静态资源和存放遗留的 HTML 页面。

## 4. 国际化 (i18n) 实现

项目支持 10 种语言：`en`, `zh`, `es`, `hi`, `ar`, `ja`, `fr`, `de`, `id`, `pt-br`。

### 4.1 翻译文件
翻译数据存储在环境变量或对应的 JSON 文件中。
- 公共文本：`locales/common.json` (通过 `utils/i18n.ts` 加载)
- 页面文本：`locales/[page].json`

### 4.2 使用方法
```tsx
import { useTranslation } from '../utils/i18n';

const { t, locale, pageTranslation } = useTranslation('home');
// t('common.title') -> 获取翻译
```

## 5. 特定温度页面开发指南

若要添加新的特定温度页面（例如 `100-c-to-f`）：

1.  **创建配置文件**：在 `pages/` 下创建 `100-c-to-f.tsx`。
2.  **引用模板**：
    ```tsx
    import { TemperaturePage } from './temperature-template';
    // ... 配置 strategy 内容策略
    export default function Temperature100C() {
        return <TemperaturePage celsius={100} ... />;
    }
    ```
3.  **更新 Sitemap**：在 `scripts/generate-sitemap.js` 的 `mainPages` 数组中添加新的路径。

## 6. SEO 策略

### 6.1 动态 Sitemap
系统不再使用第三方插件生成混乱的 Sitemap，而是通过 `scripts/generate-sitemap.js` 定制生成：
- **手动分组**：通过 XML 注释清晰划分首页、核心页、存量页。
- **自动构建**：在 `npm run build` 后通过 `postbuild` 钩子自动运行。

### 6.2 结构化数据 (JSON-LD)
`TemperaturePage` 会自动生成：
- `HowTo` 架构：描述转换步骤。
- `FAQPage` 架构：针对特定温度的常见问题。

### 6.3 动态图片 (OG Image)
通过 `/api/og?c=[temp]` 动态生成包含公式和结果的 Open Graph 图片，提升社交媒体分享的点击率。

## 7. 性能与分析
- **Analytics.tsx**: 集成了 GA4 和 Google AdSense，采用延迟加载策略，在用户交互（滚动/移动）时才初始化脚本，确保 Lighthouse 性能评分。
- **Image Optimization**: 关键路径图片使用 `next/image` 进行懒加载和尺寸优化。

## 8. 构建与部署

### 开发环境
```bash
npm run dev
```

### 生产构建
```bash
npm run build
```
*构建会自动触发 `postbuild`，更新 `public/sitemap.xml`。*

### 部署
项目完全兼容 Vercel 部署。生产分支通常为 `main`。

---
*文档更新日期：2025-12-19*
