# 多语言实现说明

## 已实现的功能

### 1. Next.js i18n 配置
- 更新了 `next.config.js`，当前支持以下语言：
  - `en`（默认）、`zh`
  - `es`（西班牙语）、`hi`（印地语）、`id`（印尼语）、`pt-br`（葡萄牙语-巴西）
  - `fr`、`de` 目前复用英文文案
- 默认语言：en

### 2. 翻译文件结构
```
locales/
  en/
    common.json
    47-c-to-f.json
  zh/
    common.json
    47-c-to-f.json
  es/
    common.json
    47-c-to-f.json
  hi/
    common.json
    47-c-to-f.json
  id/
    common.json
    47-c-to-f.json
  pt-br/
    common.json
    47-c-to-f.json
```

### 3. 翻译工具函数
- 创建了 `utils/i18n.ts`
- 提供了 `useTranslation` Hook
- 支持占位符替换（{celsius}, {fahrenheit} 等）

### 4. 页面多语言支持
- `pages/47-c-to-f.tsx` 已支持多语言
- 使用条件渲染根据当前语言显示不同内容
- 所有文本内容都从翻译文件加载

## 使用方法

### 访问不同语言版本
- 英文：`/en/47-c-to-f` 或 `/47-c-to-f`（默认）
- 中文：`/zh/47-c-to-f`
- 西班牙语：`/es/47-c-to-f`
- 印地语：`/hi/47-c-to-f`
- 印尼语：`/id/47-c-to-f`
- 葡萄牙语（巴西）：`/pt-br/47-c-to-f`

### 添加新页面翻译
1. 在 `locales/{locale}/` 中创建对应的 JSON 文件
2. 参考 `47-c-to-f.json` 的结构
3. 在页面中使用 `useTranslation('页面名称')` 加载翻译

### 自定义特定语言页面
如果某个语言版本的某个页面需要特殊处理：

```typescript
// 在页面组件中
const { locale } = useTranslation('47-c-to-f');

if (locale === 'zh' && celsius === 47) {
  // 中文版47度的特殊处理
}
```

## 占位符说明

翻译文件中支持的占位符：
- `{celsius}` - 摄氏度值
- `{fahrenheit}` - 华氏度值
- `{negativeFahrenheit}` - 负数温度的华氏度值

## 注意事项

1. 翻译文件使用 JSON 格式，确保格式正确
2. HTML 标签可以使用 `dangerouslySetInnerHTML` 渲染
3. 如果翻译缺失，会使用英文作为后备
4. 所有温度值会自动格式化（保留1位小数）

## 后续扩展

- 可以按同样结构为其它页面新增多语言内容
- 可视化语言切换器已实现，可继续拓展样式或放置位置

