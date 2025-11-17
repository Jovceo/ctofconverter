# 静态网站向 Next.js 渐进式迁移指南

## 概述

本指南将帮助你保留现有的纯静态网站文件，同时逐步引入Next.js来构建新的页面和功能。这种策略可以：

- 保持现有网站的稳定运行
- 避免大规模重写导致的业务风险
- 逐步享受Next.js带来的开发体验提升
- 支持服务器端渲染(SSR)和静态生成(SSG)

## 当前状态分析

你的现有项目包含：
- 60+个HTML页面（摄氏度转华氏度相关）
- 多个子目录（转换器、图表、文档等）
- CSS样式文件
- 图片资源
- 下载文件（PDF等）
- 静态脚本文件

## 迁移策略

### 阶段1：基础环境设置（当前阶段）

#### ✅ 已完成
- [x] 创建 `package.json` 配置文件
- [x] 创建 `next.config.js` 配置文件
- [x] 配置静态文件共存机制

#### 待完成
1. **安装依赖**
   ```bash
   npm install
   # 或
   yarn install
   ```

2. **创建基础目录结构**
   ```
   项目根目录/
   ├── public/          # 现有的静态文件（不移动，保持原状）
   ├── pages/           # Next.js 页面（渐进式创建）
   ├── components/      # React 组件
   ├── styles/          # CSS 样式
   └── utils/           # 工具函数
   ```

3. **创建入口页面**
   ```bash
   mkdir -p pages
   touch pages/_app.js  # 全局样式和应用配置
   touch pages/index.js # Next.js 主页（可选）
   ```

### 阶段2：新功能使用Next.js开发

#### 推荐的新页面开发模式

1. **创建新的功能页面**
   ```bash
   # 创建动态路由的转换器
   pages/c-to-f-advanced/
   ├── index.js      # 主页面
   ├── converter/    # 转换器组件
   └── utils/        # 转换工具函数
   ```

2. **创建React组件**
   ```jsx
   // components/AdvancedConverter.js
   import { useState } from 'react';
   import { celsiusToFahrenheit } from '../utils/converter';

   export default function AdvancedConverter() {
     const [celsius, setCelsius] = useState('');
     
     return (
       <div className="converter">
         <input
           type="number"
           value={celsius}
           onChange={(e) => setCelsius(e.target.value)}
           placeholder="输入摄氏度"
         />
         <div className="result">
           {celsius ? `${celsiusToFahrenheit(celsius)}°F` : ''}
         </div>
       </div>
     );
   }
   ```

3. **静态生成新页面**
   ```jsx
   // pages/predefined-conversions.js
   export async function getStaticProps() {
     // 预定义的转换数据
     const conversions = Array.from({length: 50}, (_, i) => ({
       celsius: i,
       fahrenheit: (i * 9/5) + 32
     }));
     
     return {
       props: { conversions },
       revalidate: 3600 // 每小时重新生成
     };
   }
   ```

### 阶段3：逐步迁移现有页面

#### 迁移优先级

1. **低优先级**：基础转换页面（如10-c-to-f.html）
2. **中优先级**：计算器页面
3. **高优先级**：动态内容页面

#### 迁移示例
```bash
# 将现有的 c-to-f-calculator 重构为Next.js页面
pages/
├── index.js              # 主页
└── calculator/
    ├── index.js          # 计算器页面
    └── components/
        └── Converter.js  # 可复用组件
```

### 阶段4：优化和部署

#### 部署配置
```json
{
  "vercel.json": {
    "rewrites": [
      { "source": "/old-page.html", "destination": "/new-page" }
    ],
    "headers": [
      {
        "source": "/static/(.*)",
        "headers": [{ "key": "Cache-Control", "value": "public, max-age=31536000" }]
      }
    ]
  }
}
```

## 关键配置说明

### next.config.js 关键设置

1. **静态导出配置**
   ```javascript
   output: 'export',        // 生成静态文件
   distDir: 'dist',         // 输出目录
   images: { unoptimized: true } // 静态导出需要
   ```

2. **静态文件重写规则**
   - 保留现有 `.html` 文件的直接访问
   - 处理静态资源（CSS、JS、图片等）
   - 维护现有的目录结构

3. **渐进式路由**
   - 新页面使用 Next.js 路由
   - 旧页面保持静态文件访问
   - 冲突时使用重定向规则

## 开发工作流

### 日常开发
1. 新功能 → 使用 Next.js 开发
2. 现有页面维护 → 保持静态文件
3. 重构 → 逐步迁移到 Next.js

### 构建命令
```bash
# 开发模式
npm run dev

# 构建生产版本
npm run build

# 预览构建结果
npm run start
```

### 部署策略
1. **静态部署**：GitHub Pages, Vercel Static
2. **混合部署**：保留现有静态文件 + Next.js 服务
3. **CDN配置**：静态资源使用CDN加速

## 风险控制

### 备份策略
- 在迁移前备份整个项目
- 使用Git分支管理迁移过程
- 保留原始静态文件作为备份

### 回滚计划
- 保持现有静态文件的完整性
- 使用特性开关控制新功能发布
- 监控迁移过程中的性能影响

## 最佳实践

### 代码组织
```
project/
├── public/          # 现有静态文件（保持不变）
├── pages/           # Next.js 页面
├── components/      # 可复用组件
├── lib/            # 工具函数
├── styles/         # CSS 样式
└── utils/          # 业务逻辑
```

### 性能优化
- 利用Next.js的自动代码分割
- 使用静态生成提升加载速度
- 配置适当的缓存策略

### SEO优化
- 保持现有页面的SEO结构
- 利用Next.js的Meta标签管理
- 实现服务器端渲染提升搜索排名

## 常见问题解决

### Q: 如何处理路由冲突？
A: 使用Next.js的重写规则或重定向规则来避免冲突

### Q: 如何保持现有的SEO效果？
A: 渐进式迁移，确保每个迁移的页面保持相同的URL结构和Meta标签

### Q: 性能是否会受影响？
A: 静态文件的访问速度保持不变，Next.js页面将获得更好的性能

## 下一步行动

1. ✅ 理解迁移策略
2. [ ] 安装npm依赖：`npm install`
3. [ ] 创建基础目录结构
4. [ ] 开发第一个Next.js页面
5. [ ] 测试静态文件兼容性
6. [ ] 设置CI/CD流程

---

**注意**：这个迁移方案允许你保持现有网站的稳定运行，同时逐步享受Next.js带来的开发体验提升。建议先在小范围测试，确认无误后再逐步扩大范围。