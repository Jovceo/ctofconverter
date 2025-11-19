# 创建新温度转换页面指南

本指南将帮助你使用模板快速创建新的温度转换页面，同时保留完全自定义内容的能力。

## 📋 快速开始

### 步骤 1: 复制模板文件

1. 复制 `templates/temperature-page-template.tsx` 文件
2. 重命名为 `pages/[温度值]-c-to-f.tsx`
   - 例如：`47-c-to-f.tsx`、`36-5-c-to-f.tsx`（注意：小数点用横线表示）

### 步骤 2: 修改配置区域

打开新文件，找到 `🔧 配置区域`，修改以下值：

```typescript
// 温度值（摄氏度）
const celsius = 47; // ⚠️ 修改为你的目标温度值

// 页面URL路径
const pagePath = `${celsius}-c-to-f.html`; // ⚠️ 根据实际URL格式修改
```

### 步骤 3: 自定义内容

在 `📝 内容自定义区域` 中，你可以自定义：

- **headerDescription**: 页面标题下方的描述文本
- **warningBox**: 警告框内容（如果不需要可以设为 `null`）
- **temperatureContext**: 温度上下文描述（医疗、环境、烹饪等）
- **customFAQs**: 自定义FAQ问题列表
- **negativeTemperatureDescription**: 负数温度描述

### 步骤 4: 自定义FAQ

在 `customFAQs` 数组中添加你的FAQ问题：

```typescript
const customFAQs: FAQItem[] = [
  {
    question: `What is ${celsius} degrees Celsius in Fahrenheit?`,
    answer: `${celsius} degrees Celsius equals ${formatTemperature(fahrenheit)} degrees Fahrenheit...`,
  },
  {
    question: '你的自定义问题',
    answer: '你的自定义答案',
  },
];
```

### 步骤 5: 自定义相关温度链接

默认会自动生成相邻的温度链接，你也可以手动指定：

```typescript
const relatedTemperatures = [
  { celsius: 46, fahrenheit: celsiusToFahrenheit(46), href: '/46-c-to-f' },
  { celsius: 48, fahrenheit: celsiusToFahrenheit(48), href: '/48-c-to-f' },
  // ... 更多相关温度
];
```

### 步骤 6: 测试页面

1. 启动开发服务器：`npm run dev`
2. 访问新页面：`http://localhost:3000/[温度值]-c-to-f`
3. 检查所有内容是否正确显示

## 🛠️ 工具函数说明

模板使用了 `utils/temperaturePageHelpers.ts` 中的工具函数：

### 主要函数

- `celsiusToFahrenheit(celsius)`: 将摄氏度转换为华氏度
- `formatTemperature(value, precision)`: 格式化温度显示
- `generateHowToStructuredData(celsius, fahrenheit)`: 生成HowTo结构化数据
- `generateFAQStructuredData(celsius, fahrenheit, customFAQs)`: 生成FAQ结构化数据
- `generateRelatedTemperatures(celsius, count)`: 生成相关温度链接
- `generatePageTitle(celsius, fahrenheit)`: 生成页面标题
- `generateMetaDescription(celsius, fahrenheit, customText)`: 生成Meta描述

### 使用示例

```typescript
import { celsiusToFahrenheit, formatTemperature } from '../utils/temperaturePageHelpers';

const celsius = 47;
const fahrenheit = celsiusToFahrenheit(celsius);
const formatted = formatTemperature(fahrenheit); // "116.6"
```

## 📝 自定义内容指南

### 1. 温度上下文描述

根据温度值的特点，自定义医疗、环境、烹饪等描述：

```typescript
const temperatureContext = {
  medical: {
    title: `⚠️ Medical Warning: ${celsius}°C Body Temperature`,
    content: `你的医疗描述...`,
    list: [
      `列表项1`,
      `列表项2`,
    ],
  },
  environmental: {
    // ... 环境温度描述
  },
  cooking: {
    // ... 烹饪应用描述
  },
};
```

### 2. 警告框

如果温度值需要特殊警告，可以自定义警告框：

```typescript
const warningBox = {
  title: `⚠️ Critical: ${celsius}°C is Life-Threatening`,
  content: `警告内容...`,
};
```

如果不需要警告框，设置为 `null`：

```typescript
const warningBox = null;
```

### 3. Meta信息

可以自定义SEO相关的Meta描述：

```typescript
const customMetaDescription = `你的自定义meta描述...`;
const customOGDescription = `你的自定义OG描述...`;
```

如果不提供，将使用工具函数自动生成。

## 🎨 样式自定义

如果需要自定义样式，可以在 `🎨 样式自定义区域` 中修改：

```typescript
const warningBoxStyle = {
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
  color: 'white',
  // ... 更多样式
};
```

## ⚠️ 注意事项

1. **文件名格式**: 
   - 整数温度：`47-c-to-f.tsx`
   - 小数温度：`36-5-c-to-f.tsx`（小数点用横线）

2. **URL路径**: 确保 `pagePath` 与实际URL格式一致

3. **组件导入**: 确保所有导入路径正确（相对于 `pages` 目录）

4. **结构化数据**: FAQ结构化数据会自动从 `customFAQs` 生成，确保FAQ内容完整

5. **相关链接**: 确保相关温度链接的页面存在，否则链接会失效

## 📚 完整示例

参考 `pages/47-c-to-f.tsx` 查看完整实现示例。

## 🔄 更新模板

如果模板有更新，记得同步更新到所有使用模板的页面，或者考虑使用脚本批量更新。

## 💡 提示

- 使用工具函数可以减少重复代码
- 保留模板文件作为参考
- 每个页面都可以完全自定义，不受模板限制
- 建议为每个温度值创建独特的、有价值的内容

