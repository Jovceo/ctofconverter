# 摄氏华氏温度转换器 - Next.js 渐进式迁移项目

这是一个渐进式迁移项目，展示了如何在保留现有纯静态网站文件的同时，逐步引入Next.js来开发新的页面和功能。

## 项目概述

### 现有静态文件（保留不变）
- ✅ 60+ 个HTML转换页面（如 10-c-to-f.html, 25-c-to-f.html 等）
- ✅ 静态CSS和JavaScript文件
- ✅ 图片资源（converter.png, formula.png 等）
- ✅ 下载文件（PDF图表）
- ✅ 完整的目录结构

### Next.js 新功能（增量添加）
- 🔄 动态组件和交互式转换器
- 🔄 服务端渲染(SSR)和静态生成(SSG)
- 🔄 现代化的开发体验
- 🔄 性能优化和代码分割

## 快速开始

### 1. 安装依赖
```bash
npm install
```

### 2. 开发模式
```bash
npm run dev
```
访问 [http://localhost:3000](http://localhost:3000) 查看应用

### 3. 构建生产版本
```bash
npm run build
```

## 项目结构

```
ctofconverter/
├── pages/                    # Next.js 页面
│   ├── _app.js              # 应用级配置
│   └── index.js             # 主页
├── components/              # React 组件
│   ├── AdvancedConverter.js # 高级转换器组件
│   └── ConversionTable.js   # 转换表格组件
├── utils/                   # 工具函数
│   └── converter.js         # 温度转换逻辑
├── styles/                  # Next.js 样式
│   └── globals.css          # 全局样式
├── public/                  # 现有静态文件（保留）
│   ├── *.html              # 60+ 个HTML页面
│   ├── *.css               # 现有样式文件
│   ├── *.js                # 现有脚本文件
│   ├── images/             # 图片资源
│   └── downloads/          # PDF下载文件
├── next.config.js          # Next.js 配置
├── package.json            # 项目依赖
└── MIGRATION_GUIDE.md      # 详细迁移指南
```

## 关键特性

### 🔄 渐进式迁移策略
- **保留现有静态文件**：所有现有HTML、CSS、JS文件保持不变
- **新增Next.js功能**：新页面和组件使用Next.js开发
- **无缝共存**：静态文件和Next.js页面可以同时存在

### 🚀 Next.js 配置亮点
- **静态导出支持**：`output: 'export'`
- **静态文件重写规则**：确保现有文件正常访问
- **图片优化配置**：`images: { unoptimized: true }`
- **CSS复用**：引用现有样式文件

### 📊 功能展示
- **动态转换器**：React组件实现实时温度转换
- **转换表格**：预计算温度对照表
- **温度上下文**：智能判断温度级别和描述
- **响应式设计**：支持移动端和桌面端

## 迁移步骤

1. **阶段1：环境搭建** ✅
   - 创建 next.config.js
   - 配置 package.json
   - 设置基础项目结构

2. **阶段2：新功能开发** 🔄
   - 开发第一个Next.js页面
   - 创建可复用组件
   - 集成现有样式和资源

3. **阶段3：页面迁移** 📋
   - 选择优先级页面进行迁移
   - 保持URL和SEO结构
   - 逐步替换为Next.js版本

4. **阶段4：优化部署** 🚀
   - 性能优化
   - SEO改进
   - CDN配置

## 核心配置说明

### next.config.js 关键设置
```javascript
// 静态导出配置
output: 'export',
distDir: 'dist',

// 静态文件重写
async rewrites() {
  return [
    // 保留现有HTML文件访问
    {
      source: '/:path*.html',
      destination: '/:path*.html',
    },
    // 保留现有静态资源
    {
      source: '/images/:path*',
      destination: '/images/:path*',
    }
  ];
}
```

### 静态文件集成
- 现有样式文件通过 `_app.js` 引入
- 静态图片和文件保持原有路径
- 无需修改现有HTML文件的引用

## 开发指南

### 创建新页面
```bash
# 创建新页面
mkdir pages/new-feature
touch pages/new-feature/index.js
```

### 创建组件
```bash
# 创建可复用组件
touch components/NewComponent.js
```

### 使用工具函数
```javascript
// 复用现有转换逻辑
import { celsiusToFahrenheit, formatTemperature } from '../utils/converter'
```

## 部署选项

### 静态托管
- **Vercel**：自动检测Next.js配置
- **Netlify**：支持静态导出
- **GitHub Pages**：使用GitHub Actions构建

### 混合部署
- **CDN + 服务器**：静态文件使用CDN，动态页面使用服务器
- **微前端**：独立部署Next.js应用

## 最佳实践

### 🎯 开发原则
1. **保持向后兼容**：现有功能不受影响
2. **增量现代化**：逐步引入现代化技术栈
3. **性能优先**：利用Next.js的优化特性
4. **SEO友好**：保持或改善搜索引擎优化

### 🛠️ 技术建议
- 使用TypeScript提高代码质量
- 利用Next.js的静态生成提升性能
- 保持组件的单一职责原则
- 使用现有的设计系统和样式

### 📈 性能优化
- 代码分割和懒加载
- 图片优化和压缩
- 静态资源缓存策略
- 服务端渲染提升首屏加载速度

## 常见问题

**Q: 如何处理路由冲突？**
A: 使用next.config.js中的rewrites和redirects规则来处理冲突

**Q: 现有页面的SEO会受到影响吗？**
A: 不会，静态文件保持不变，迁移的页面可以保持相同的URL结构

**Q: 如何回滚到纯静态版本？**
A: 部署时排除Next.js相关文件即可，所有静态文件保持独立

**Q: 新旧功能的用户体验是否一致？**
A: Next.js组件可以复用现有样式，确保视觉一致性

## 贡献指南

欢迎提交Pull Request来改进这个示例项目！

1. Fork项目
2. 创建特性分支
3. 提交更改
4. 发起Pull Request

## 许可证

MIT License

---

**开始迁移之旅** 🚀
- 📖 阅读 [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) 获取详细步骤
- 🛠️ 安装依赖并运行 `npm run dev`
- 💡 基于现有代码创建新的Next.js功能