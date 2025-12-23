# 添加新温度转换页面指南

遵循本指南可以快速、规范地为项目添加新的特定温度转换页面（如 `100-c-to-f`）。

## 🚀 步骤 1：创建页面文件

在 `pages/` 目录下创建新的 `.tsx` 文件。建议直接从 `pages/75-c-to-f.tsx` 复制内容。

**命名规范**：
- 整数：`100-c-to-f.tsx`
- 小数：`36-5-c-to-f.tsx`（小数点使用横线 `-` 代替）

## 🚀 步骤 2：配置页面代码

打开新创建的文件，主要修改以下部分：

1.  **修改温度值**：
    ```tsx
    const celsius = 100; // 设置目标摄氏度
    ```

2.  **配置内容策略 (Strategy)**：
    `generateContentStrategy` 会根据温度自动生成百科内容。您可以传入触发关键词来精准控制内容逻辑：
    ```tsx
    // 常用触发词：tea, chicken, water, oven, baking, fever, cold
    const s = generateContentStrategy(celsius, 'water boiling tea');
    ```

3.  **配置命名空间 (Namespace)**：
    确保 `useTranslation` 和 `TemperaturePage` 使用正确的 JSON 命名空间：
    ```tsx
    const { locale, pageTranslation } = useTranslation('100-c-to-f');
    // ...
    return <TemperaturePage customNamespace="100-c-to-f" ... />;
    ```

## 🚀 步骤 3：准备翻译文件 (可选)

如果在代码中使用了逻辑注入（参考 `75-c-to-f.tsx` 的 `pageT`），您需要在各语言目录下创建对应的 JSON 文件：

- 路径示例：`public/locales/zh/100-c-to-f.json`
- 路径示例：`public/locales/en/100-c-to-f.json`

**推荐的 JSON 结构**：
```json
{
  "page": {
    "title": "100 Celsius to Fahrenheit - Boiling Point Guide",
    "description": "Convert 100°C to Fahrenheit. 100 degrees Celsius is the boiling point of water..."
  },
  "faq": {
    "items": [
      { "question": "Is 100°C boiling point?", "answer": "Yes, at standard sea level..." }
    ]
  }
}
```

## 🚀 步骤 4：注册到站点地图 (Sitemap)

为了让搜索引擎快速抓取新页面，必须手动将其添加到站点地图生成脚本中：

1.  打开 `scripts/generate-sitemap.js`。
2.  在 `mainPages` 数组中添加新的 ID：
    ```javascript
    const mainPages = ['47-c-to-f', '75-c-to-f', '100-c-to-f']; // 添加 100-c-to-f
    ```

## 🚀 步骤 5：验证与构建

1.  **开发环境验证**：
    运行 `npm run dev`，访问 `http://localhost:3000/100-c-to-f` 查看效果。
2.  **生成站点地图**：
    运行 `npm run postbuild`。
3.  **检查站点地图**：
    打开 `public/sitemap.xml`，确认新页面已被正确包含。

---

## 💡 进阶：内容控制技巧

在页面代码中，您可以通过 `s.modules` 对象精细化控制显示哪些板块：

```tsx
s.modules.showHealthAlert = false;    // 隐藏健康警告
s.modules.showHumanFeel = false;     // 隐藏体感/天气板块
s.modules.showPracticalApps = false; // 隐藏默认的应用场景（如果您已自定义注入）
```

---
*文档更新日期：2025-12-19*
