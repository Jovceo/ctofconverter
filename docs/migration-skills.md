# 温度页面迁移技能库

## 概述
本文档记录从静态 HTML 迁移温度转换页面到 Next.js 的完整技能体系，确保高质量、无硬编码、多语言支持。

---

## 📖 文档使用指南（对号入座）

**👤 我是新手，第一次迁移页面**  
→ 先看 [🚀 单页面快速迁移清单](#单页面快速迁移清单quick-start) 5步流程  
→ 再按需查阅具体 Skill 细节

**👤 我需要快速完成单个页面迁移（2小时内）**  
→ 直接执行 [🚀 单页面快速迁移清单](#单页面快速迁移清单quick-start)  
→ 遇到问题查看 [附录 A：常见问题速查](#附录-a单页面迁移常见问题速查)

**👤 我要批量迁移多个页面（5+个）**  
→ 先阅读 [Skill 1：硬编码修复](#skill-1硬编码修复)  
→ 再看 [Skill 4：批量页面生成](#skill-4批量页面生成高级)  
→ 参考 [Skill 6：多语言批量翻译](#skill-6多语言批量翻译高级)

**👤 我遇到了技术问题/错误**  
→ 查看 [附录 A：常见问题速查](#附录-a单页面迁移常见问题速查)  
→ 或搜索具体错误信息在对应 Skill 章节

**👤 我需要优化 SEO/性能**  
→ 查看 [Skill 6.7：SEO 优化最佳实践](#67-seo-优化最佳实践关键改进)  
→ 或 [Skill 6.9：图片 SEO](#69-图片-seo-与动态图片生成vercelog)

**👤 我不确定用什么策略/颜色主题**  
→ 查看 [附录 B：迁移决策树](#附录-b迁移决策树)

---

### 📂 文档结构速览

| 章节 | 内容 | 何时查看 |
|------|------|----------|
| **🚀 快速清单** | 5步完成单页面迁移 | **每次迁移必看** |
| **Skill 1-5** | 详细技术实现 | 遇到问题或批量迁移时 |
| **Skill 6** | 多语言翻译深度指南 | 翻译问题或批量翻译 |
| **附录 A** | FAQ + 速查表 | 迁移中遇到问题 |
| **附录 B** | 决策树 | 不确定策略时 |

---

## 🚀 单页面快速迁移清单（Quick Start）

**适用场景**：迁移单个温度页面（如 39°C）

**预计时间**：2-3 小时（含审核）

### 5 步完成迁移：

- [ ] **Step 1: 创建英文翻译文件**
  ```bash
  cp locales/en/38-c-to-f.json locales/en/39-c-to-f.json
  # 修改：温度值 38→39，内容调整为发烧场景
  ```
  > ⚠️ **关键**：从 `public/39-c-to-f.html` 复制原文件的 **title**、**description**、**H1** 到 JSON 的 meta 字段，保持 SEO 一致性

- [ ] **Step 2: 创建页面组件**
  ```bash
  cp pages/38-c-to-f.tsx pages/39-c-to-f.tsx
  # 修改：celsius = 39，颜色主题、insight 类型
  ```

- [ ] **Step 3: 翻译多语言（AI + 审核）**
  - 使用 Claude 3.5 翻译 10 种语言
  - 重点审核 Hindi（医学术语准确性）
  - 验证占位符 {fahrenheit} 保留

- [ ] **Step 4: 全面检查（关键！）**
  ```bash
  # 硬编码检查
  grep "'39\.'" pages/39-c-to-f.tsx | grep -v "const celsius"
  # 翻译完整性检查
  node -e "const f=require('./locales/en/39-c-to-f.json'); console.log('OK:', !!f.meta?.title)"
  ```
  **⚠️ 必须先完成检查，确认100%没问题**

- [ ] **Step 5: 【询问用户】是否添加 301**
  > 向用户报告："检查完成，一切正常。是否需要添加301重定向？"
  > 
  > 等用户确认后，再执行 Step 6

- [ ] **Step 6: 配置 301 重定向（用户确认后）**
  ```javascript
  // next.config.js
  source: '/:path(...|39-c-to-f|...).html'
  ```

- [ ] **Step 7: 最终构建验证**
  ```bash
  npm run build
  # 验证：10 个语言版本无错误
  ```

### 详细说明 ⬇️

> 💡 **提示**：下方是详细技术文档，执行快速清单时如遇问题可查阅对应 Skill

---

## 📋 快速对照表：我现在该看什么？

**按当前任务查找：**

| 如果你正在... | 查看章节 | 关键内容 |
|--------------|---------|---------|
| **复制模板文件** | Skill 2 + Skill 3 | 翻译文件结构、页面组件模板 |
| **修改温度值和颜色** | Skill 3.3 | 视觉调整指南 |
| **翻译多语言内容** | Skill 6.2 | 批量翻译执行流程 |
| **审核 Hindi 翻译** | Skill 6.3 | Hindi 医学术语标准 |
| **配置 301 重定向** | **Step 6** ⚠️检查完成后询问用户 | next.config.js 配置 |
| **验证构建结果** | Skill 5 | 自动化验证脚本 |
| **优化 SEO** | Skill 6.7 | SEO 最佳实践 |
| **修复图片问题** | Skill 6.9 | @vercel/og 动态生成 |
| **添加退烧药板块** | 38-c-to-f.json 示例 | antipyretics 结构 |

---

## Skill 1: 硬编码修复

**适用场景**：系统修复（一次性）| **预计时间**：30分钟 | **必须执行**：✅ 是

**本 Skill 包含**：
- 创建安全翻译辅助函数 `safeTranslate()`
- 识别和替换硬编码英文
- 验证脚本使用

### 1.1 创建安全翻译辅助函数
**文件**: `utils/translationHelpers.ts`

```typescript
export function safeTranslate(
  translations: any,
  path: string,
  locale: string
): string {
  // 当翻译缺失时返回 [locale:path] 明显标记
  // 开发环境显示警告
}
```

**使用场景**: 替换所有 `|| 'English fallback'` 模式

### 1.2 识别硬编码字符串
```bash
grep -n "|| '" pages/36-1-c-to-f.tsx
```

### 1.3 批量替换
**修改前**:
```typescript
${pageT.bodyTempRanges?.ranges?.adult || 'For Adults'}
```

**修改后**:
```typescript
${safeTranslate(pageT, 'bodyTempRanges.ranges.adult', locale)}
```

### 1.4 验证
```bash
# 应该返回空（只有 || '' 是允许的）
grep "|| '" pages/36-1-c-to-f.tsx

# 运行验证脚本
node scripts/validate-translations.js
```

**成功标准**: 0 硬编码英文，0 错误

### 1.5 迁移后硬编码检查清单（关键）

**⚠️ 每次迁移完成后必须执行以下检查：**

#### **检查点 1: Replacements 对象**
```typescript
// ❌ 错误：硬编码温度值
const replacements = useMemo(() => ({
    fahrenheit: formattedF,
    celsius: '36.3',           // ❌ 硬编码
    celsiusNoDecimal: '36'     // ❌ 硬编码
}), [formattedF]);

// ✅ 正确：使用变量
const replacements = useMemo(() => ({
    fahrenheit: formattedF,
    celsius: celsius.toString(),           // ✅ 使用变量
    celsiusNoDecimal: Math.floor(celsius).toString()  // ✅ 动态计算
}), [formattedF, celsius]);
```

#### **检查点 2: HTML 内容中的硬编码温度**
```typescript
// ❌ 错误：硬编码在模板字符串中
<p><strong>${safeTranslate(...)}</strong><br>36.3°C = ${formattedF}°F</p>

// ✅ 正确：使用 replacements 对象
<p><strong>${safeTranslate(...)}</strong><br>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</p>
```

#### **检查点 3: 条件判断中的硬编码**
```typescript
// ❌ 错误：硬编码字符串比较
<tr ${row.celsius === '36.3°C' ? 'style="background-color: #e8f5e8;"' : ''}>

// ✅ 正确：使用变量比较
<tr ${row.celsius === celsius + '°C' ? 'style="background-color: #e8f5e8;"' : ''}>
```

#### **检查点 4: Fallback 表格数据**
```typescript
// ❌ 错误：硬编码 fallback 数据
const fallbackRows = [
    { celsius: '35.5°C', fahrenheit: '95.9°F', assessment: 'Low normal...' },
    { celsius: '36.3°C', fahrenheit: '97.34°F', assessment: 'Normal body temperature' },
];

// ✅ 正确：从翻译文件获取或使用计算值
const fallbackRows = pageT.feverScale?.rows || [];
```

#### **自动化检查脚本**
```bash
# 检查硬编码温度值
grep -n "'36\.[0-9]'" pages/36-*-c-to-f.tsx

# 检查硬编码华氏度
grep -n "'97\.[0-9]'" pages/36-*-c-to-f.tsx

# 检查未使用变量的比较
grep -n "=== '.*°C'" pages/36-*-c-to-f.tsx

# 检查结果应该为空，否则需要修复
```

**成功标准**: 0 硬编码温度值，所有动态值使用变量

---

## Skill 2: 翻译文件创建

**适用场景**：每个新页面 | **预计时间**：20分钟 | **必须执行**：✅ 是

**本 Skill 包含**：
- 翻译文件 JSON 结构
- 内容适配策略（颜色主题选择）
- 医学术语参考

### 2.1 文件结构模板
```
locales/{locale}/38-c-to-f.json
├── meta              # SEO（⚠️ 必须完全保留原标题描述）
├── bodyTempRanges    # 体温范围评估
├── measurementMethods # 测量方法
├── antipyretics      # ⭐ 退烧药指南（可选）
├── ageGroups         # 年龄分组（3-4组）
├── feverScale        # 温度表格
└── faq               # 6个问答
```

#### **⚠️ 关键要求：保留原 HTML 的 SEO 信息**

**必须复制 `public/{temperature}-c-to-f.html` 中的：**

1. **Title 标签内容**
   ```html
   <!-- 原 HTML -->
   <title>38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide</title>
   
   <!-- 复制到 JSON -->
   "title": "38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide"
   ```

2. **Meta Description 内容**
   ```html
   <!-- 原 HTML -->
   <meta name="description" content="Convert 38°C to 100.4°F - the medical fever threshold...">
   
   <!-- 复制到 JSON -->
   "description": "Convert 38°C to 100.4°F - the medical fever threshold..."
   ```

3. **H1 标签内容**（通过 customTitle 传递）
   ```html
   <!-- 原 HTML 中的 H1 -->
   <h1>38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide</h1>
   
   <!-- 复制到 JSON meta.title -->
   "title": "38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide"
   ```

**为什么重要？**
- ✅ 保持搜索引擎排名不变
- ✅ 保留现有 SEO 权重
- ✅ 避免 404 和重定向链
- ✅ 用户看到的标题与搜索结果一致

**错误示例**：
```json
❌ "title": "38°C to Fahrenheit - Fever Guide"  // 不要简化！
✅ "title": "38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide"
```

### 2.2 内容适配策略
| 温度范围 | 主题 | 颜色 | 图标 |
|---------|------|------|------|
| 35-37°C | 正常体温 | 蓝色 #e3f2fd | ✅ |
| 37-38°C | 边界/低烧 | 黄色 #fffde7 | ⚠️ |
| 38-40°C | 发烧 | 橙色 #fff3e0 | ⚠️ |
| 40°C+   | 高烧危险 | 红色 #ffebee | 🚨 |

### 2.3 AI 翻译流程
1. **准备英文源文件**（完整、准确）
2. **并行翻译**: Claude 3.5 + GPT-4
3. **术语对比**: 选择最准确的医学术语
4. **文化审核**: 确保文化适宜性
5. **占位符检查**: 保留 {fahrenheit}, {celsius}
6. **人工审核**: 逐行检查医学术语准确性

### 2.4 医学术语参考
**Hindi 标准术语**:
- Fever: बुखार (bukhār)
- Temperature: तापमान (tāpmān)
- Oral: मौखिक (maukhik)
- Axillary: बगल (bagal)
- Rectal: मलद्वार (maldwār)
- Antipyretics: ज्वरनाशक (jvarnāśak)

---

## Skill 3: 页面组件创建

**适用场景**：每个新页面 | **预计时间**：30分钟 | **必须执行**：✅ 是

**本 Skill 包含**：
- 页面组件复制和修改清单
- 颜色主题和视觉调整
- 年龄分组和板块配置

### 3.1 复制模板
```bash
cp pages/36-1-c-to-f.tsx pages/38-c-to-f.tsx
```

### 3.2 修改清单
- [ ] `const celsius = 36.1` → `38`
- [ ] `customNamespace="36-1-c-to-f"` → `"38-c-to-f"`
- [ ] `getSceneKeywords(celsius, 'body', locale)` → `'fever'`
- [ ] 颜色主题：蓝色 → 橙色
- [ ] 图标：✅ → ⚠️
- [ ] insight type: 'fact' → 'warning'
- [ ] 年龄分组：3组 → 4组（添加 infant）
- [ ] 添加 antipyretics 板块（如需要）

### 3.3 视觉调整
```typescript
// 正常体温（蓝色）
background: #e3f2fd; border-top: 4px solid #2196f3;

// 发烧（橙色）
background: #fff3e0; border-top: 4px solid #ff9800;

// 危险（红色）
background: #ffebee; border-left: 4px solid #f44336;
```

---

## Skill 4: 批量页面生成（高级）

**适用场景**：批量迁移（5+页面）| **预计时间**：2小时设置 | **必须执行**：❌ 可选

**本 Skill 包含**：
- 批量生成脚本（待开发）
- 自动化翻译修改
- 大规模迁移策略

### 4.1 使用脚本
```bash
node scripts/create-temp-page.js <temperature> <scene>

# 示例
node scripts/create-temp-page.js 39 fever
node scripts/create-temp-page.js 180 cooking
node scripts/create-temp-page.js 25 weather
```

### 4.2 自动生成翻译
从模板修改：
- 温度值：38 → 目标温度
- 场景关键词：fever → body/cooking/weather
- 保留所有结构和占位符

---

## Skill 5: 质量验证

**适用场景**：每次构建后 | **预计时间**：5分钟 | **必须执行**：✅ 是

**本 Skill 包含**：
- 自动化验证脚本
- 手动检查清单
- 多语言测试方法

### 5.1 自动化验证
```bash
# 检查所有翻译文件
node scripts/validate-translations.js

# 检查特定页面
node scripts/validate-translations.js --page 38-c-to-f
```

### 5.2 迁移工作流程（⚠️ 关键流程！必须遵守）

> 🚨 **重要提醒：这是经过实战验证的标准流程**
> 
> **永远不要自动添加301重定向！**
> 
> 必须先完成所有检查 → 向用户报告 → 等用户确认 → 再添加301

**标准流程：检查完成 → 询问用户 → 再添加301**

```
步骤1: 创建翻译文件（10种语言）
步骤2: 创建页面组件
步骤3: 执行完整检查清单（见下文）
步骤4: 构建验证
步骤5: 【必须询问用户】"检查完成，一切正常。是否需要添加301重定向？"
步骤6: 用户确认后，添加301重定向
步骤7: 最终构建验证
```

**为什么这个流程很重要？**
- ✅ 确保页面100%正常后再做重定向
- ✅ 避免有问题的页面被搜索引擎索引
- ✅ 给用户完全的控制权
- ✅ 防止因质量问题导致的SEO惩罚

**⚠️ 不要自动添加301重定向！**
- 必须在所有检查通过后询问用户
- 给用户选择权
- 301是最后一步，确认完美后再添加
- **违反此流程会导致质量问题和SEO风险**

---

### 5.3 完整检查清单（Critical）

**⚠️ 警告：以下问题在过去迁移中多次出现，务必逐一检查**

#### **阶段1：页面组件代码检查**

```bash
# 1.1 检查硬编码温度值（除const celsius外）
grep -n "'36\.[0-9]''\|'37\.[0-9]''\|'38\.[0-9]''\|'35\.[0-9]'" pages/PAGE-c-to-f.tsx | grep -v "const celsius"
# ❌ 错误示例：celsius: '36.1'
# ✅ 正确：celsius: celsius.toString()

# 1.2 检查硬编码华氏度
grep -n "'9[0-9]\.[0-9]''\|'10[0-9]\.[0-9]'" pages/PAGE-c-to-f.tsx
# ❌ 错误示例：'97.34°F'
# ✅ 正确：应使用 formattedF + '°F' 或 {fahrenheit} 占位符

# 1.3 检查硬编码字符串比较
grep -n "=== '.*°C'\|=== '36.*°C'\|=== '37.*°C'" pages/PAGE-c-to-f.tsx
# ❌ 错误示例：row.celsius === '36.3°C'
# ✅ 正确：row.celsius === celsius + '°C'

# 1.4 检查fallback表格硬编码
sed -n '/pageT\.feverScale.*rows/,/join/p' pages/PAGE-c-to-f.tsx | grep -E "35\.5°C|36\.5°C|37\.0°C"
# ❌ 错误：fallback表格中有硬编码温度值
# ✅ 正确：删除fallback表格，或确保所有值来自翻译文件
```

**代码结构检查：**
- [ ] **组件名与文件名匹配**：`function Temperature36_3C` 对应 `36-3-c-to-f.tsx`
- [ ] **replacements对象使用变量**：`celsius: celsius.toString()`，不是 `'36.3'`
- [ ] **所有HTML中的温度使用replacePlaceholders**：`{celsius}°C = {fahrenheit}°F`
- [ ] **表格比较使用变量**：`celsius + '°C'`，不是硬编码字符串
- [ ] **删除所有fallback硬编码**：fallback表格应为空字符串 `''` 或删除
- [ ] **replacePlaceholders传递完整replacements**：包含 `celsius` 和 `fahrenheit`
- [ ] **无console.log/debugger残留**
- [ ] **TypeScript接口定义正确**：数组属性标记为可选 `points?: string[]`

#### **阶段2：翻译文件完整性检查**

```bash
# 2.1 检查所有必需键是否存在
node -e "
const f = require('./locales/en/PAGE-c-to-f.json');
const checks = {
  'meta.title': !!f.meta?.title,
  'meta.description': !!f.meta?.description,
  'bodyTempRanges.ranges.adult': !!f.bodyTempRanges?.ranges?.adult,
  'bodyTempRanges.ranges.baby': !!f.bodyTempRanges?.ranges?.baby,
  'bodyTempRanges.ranges.underArm': !!f.bodyTempRanges?.ranges?.underArm,
  'bodyTempRanges.ranges.normal': !!f.bodyTempRanges?.ranges?.normal,
  'measurementMethods.oral.title': !!f.measurementMethods?.oral?.title,
  'measurementMethods.underArm.title': !!f.measurementMethods?.underArm?.title,
  'measurementMethods.ear.title': !!f.measurementMethods?.ear?.title,
  'measurementMethods.rectal.title': !!f.measurementMethods?.rectal?.title,
  'ageGroups.newborn.points': !!f.ageGroups?.newborn?.points,
  'ageGroups.children.points': !!f.ageGroups?.children?.points,
  'ageGroups.adults.points': !!f.ageGroups?.adults?.points,
  'feverScale.rows': !!f.feverScale?.rows,
  'faq.q1': !!f.faq?.q1
};
Object.entries(checks).forEach(([k, v]) => console.log(v ? '✅' : '❌', k));
"
# 所有项应为✅，如有❌需补充翻译
```

**翻译键完整性检查：**
- [ ] **meta**: title, description, ogTitle, ogDescription
- [ ] **bodyTempRanges.ranges**: adult, baby, underArm, normal
- [ ] **measurementMethods.XXX**: title（oral, underArm, ear, rectal）
- [ ] **ageGroups.XXX.points**: 数组已定义（newborn, children, adults）
- [ ] **feverScale.rows**: 至少包含当前温度的行数据
- [ ] **faq**: q1-q6全部存在

#### **阶段3：构建后验证**

```bash
# 3.1 检查翻译失败占位符
grep -o '\[en:[^]]*\]' .next/server/pages/en/PAGE-c-to-f.html | sort | uniq -c
# 输出必须为空！任何输出都是翻译失败的标志

# 3.2 检查硬编码温度残留
grep -o "36\.3°C\|97\.34°F" .next/server/pages/en/PAGE-c-to-f.html | head -5
# 如果是fallback中的，需要修复；如果是FAQ问题中的，可以保留

# 3.3 验证Schema.org结构化数据
node -e "
const html = require('fs').readFileSync('.next/server/pages/en/PAGE-c-to-f.html', 'utf8');
const schemas = html.match(/<script type=\"application\/ld\+json\"[^>]*>([\s\S]*?)<\/script>/g);
console.log('Found schemas:', schemas ? schemas.length : 0);
// 应有3个：WebPage, FAQPage, BreadcrumbList
"

# 3.4 验证hreflang标签
grep -c 'hrefLang=' .next/server/pages/en/PAGE-c-to-f.html
# 应为10（包含x-default）
```

**构建验证清单：**
- [ ] **无 [en:xxx] 失败占位符**
- [ ] **无硬编码温度值残留（除FAQ问题外）**
- [ ] **Schema.org结构化数据完整**（3个schema）
- [ ] **所有10种语言的hreflang标签存在**
- [ ] **OG标签完整**（title, description, image, url）
- [ ] **Canonical URL正确**
- [ ] **移动端响应式正常**（无横向滚动条）

---

#### **⚠️ 阶段4：【关键】询问用户是否添加301**

**所有检查通过后，必须执行：**

> **向用户报告：**
> ```
> ✅ 检查完成！所有项目通过：
> - 无硬编码
> - 10种语言翻译完整
> - 构建成功
> - 所有页面正常
> 
> 是否需要添加301重定向？
> ```

**等用户明确回复后，再执行阶段5**

---

#### **阶段5：配置301重定向（用户确认后）**

```javascript
// next.config.js
{
  source: '/:path(...|PAGE-c-to-f|...).html',
  destination: '/:path',
  statusCode: 301,
}
```

#### **阶段6：最终验证**

```bash
# 6.1 重新构建
npm run build

# 6.2 验证301配置
grep "PAGE-c-to-f" next.config.js
# 应在redirects列表中

# 6.3 功能验证
curl -s http://localhost:3000/en/PAGE-c-to-f | grep -o "36\.3.*°C.*97\.34.*°F" | head -1
# 应显示转换结果
```

**最终检查清单：**
- [ ] **温度转换计算正确**
- [ ] **语言切换正常**（10种语言）
- [ ] **301重定向已配置**（next.config.js）
- [ ] **图片生成正常**（/images/equation/）
- [ ] **FAQ折叠功能正常**
- [ ] **复制按钮功能正常**

### 5.3 常见错误速查表

| 错误类型 | 症状 | 修复方法 |
|---------|------|---------|
| 硬编码温度 | 代码中出现 `'36.3'` | 使用 `celsius.toString()` |
| 组件名不匹配 | 函数名与文件名不一致 | 统一命名为 `TemperatureXX_XC` |
| 翻译缺失 | HTML显示 `[en:bodyTempRanges.ranges.adult]` | 补充翻译文件中的缺失键 |
| fallback表格硬编码 | fallback中有 `35.5°C` | 删除fallback表格或从翻译读取 |
| replacePlaceholders不完整 | 只传递了 `{fahrenheit}` | 添加 `celsius: celsius.toString()` |
| TypeScript类型错误 | `string | undefined` 错误 | 添加 `|| ''` 空值处理 |

### 5.3 多语言测试
```bash
# 英语
curl http://localhost:3000/en/38-c-to-f

# Hindi
curl http://localhost:3000/hi/38-c-to-f

# 检查 HTML 内容
grep -o "बुखार\|Fever" .next/server/pages/hi/38-c-to-f.html
```

---

## 迁移检查表

### 阶段 1: 准备
- [ ] 确认原页面 SEO（复制到翻译文件）
- [ ] 创建英文翻译文件
- [ ] 检查是否有新板块（antipyretics, infant 等）

### 阶段 2: 开发
- [ ] 创建页面组件
- [ ] 调整颜色和主题
- [ ] 添加/修改板块
- [ ] 构建测试

### 阶段 3: 翻译
- [ ] AI 翻译所有语言
- [ ] 术语审核（医学准确性）
- [ ] 占位符验证
- [ ] 构建所有语言

### 阶段 4: 验证
- [ ] 运行验证脚本
- [ ] 手动检查所有语言
- [ ] 移动端测试
- [ ] SEO 检查（结构化数据）

### 阶段 5: 部署
- [ ] 保留原 HTML 文件（如需要）
- [ ] 更新 sitemap
- [ ] 提交搜索引擎（IndexNow 已通过 GitHub Actions 自动提交，无需手动操作）
- [ ] 监控流量和排名

---

## 常见问题解决

### Q1: 翻译缺失显示 [locale:path]
**原因**: 翻译文件中缺少该 key
**解决**: 
1. 检查 JSON 文件结构
2. 添加缺失的翻译
3. 重新构建

### Q2: 页面显示混合语言
**原因**: 硬编码英文未完全移除
**解决**:
```bash
grep -r "|| '" pages/*.tsx
# 替换所有为 safeTranslate()
```

### Q3: 占位符 {fahrenheit} 未替换
**原因**: 翻译中缺少占位符
**解决**: 检查翻译文件，确保保留 {fahrenheit}

### Q4: Hindi 字体显示异常
**原因**: 系统缺少 Devanagari 字体
**解决**: 添加 Google Fonts 或系统字体回退

---

## 优化记录

### 2025-02-10
- ✅ 创建基础技能库
- ✅ 完成 36.1°C 硬编码修复
- ✅ 完成 38°C 迁移（英语 + Hindi）
- ✅ 建立验证脚本
- ✅ Hindi 医学术语标准化

### 2025-02-10（批量翻译更新）
- ✅ 完成 38°C 多语言翻译（10 种语言）
  - zh（中文）、es（西班牙语）、fr（法语）、de（德语）
  - ja（日语）、pt-br（葡萄牙语）、ar（阿拉伯语）、id（印尼语）
- ✅ 所有语言构建验证通过
- ✅ 医学术语本地化标准化
- ✅ 多语言批量翻译流程文档化

### 2025-02-10（SEO 优化更新）
- ✅ H1 标签简化 - 避免关键词堆砌
  - Before: "38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide"
  - After: "38°C to Fahrenheit (100.4°F) - Fever Temperature Guide"
- ✅ 添加转换公式图片模块
  - 图片: /images/equation/38-celsius-to-fahrenheit-conversion.png
  - Alt 文本优化
  - 步骤说明 + 图片展示
- ✅ 更新所有 10 种语言的翻译文件
  - 添加 conversionFormula 部分
  - 优化 meta.title 和 meta.description
- ✅ 构建验证通过
  - 10 个语言版本全部正常
  - 无错误，无警告

### 2025-02-10（图片 SEO 最佳实践）
- ✅ 使用 @vercel/og 动态生成图片
  - 创建 pages/api/og.tsx API 端点
  - 配置 next.config.js rewrite 规则
  - 实时生成温度转换图片（1200x630）
- ✅ 清理手动创建的静态图片
  - 删除 public/images/equation/ 文件夹
  - 依赖动态生成机制
- ✅ 本地化 Alt 标签
  - 为所有 10 种语言添加 imageAlt 翻译
  - 示例：中文"38摄氏度转华氏度换算公式及计算步骤"
- ✅ 模板自动集成
  - temperature-template.tsx 自动生成图片路径
  - 格式: /images/equation/{celsius}-celsius-to-fahrenheit-conversion.png

### 2025-02-10（301 重定向配置）
- ✅ 38°C 页面 301 重定向配置
  - 更新 next.config.js redirects
  - 添加 38-c-to-f 到重定向列表
  - 格式: `/:path(...|38-c-to-f|...).html` -> `/:path`
- ✅ 验证重定向生效
  - 本地测试: `curl -I http://localhost:3000/38-c-to-f.html`
  - 返回 301 + Location: /38-c-to-f
- ✅ 多语言自动支持
  - /zh/38-c-to-f.html → /zh/38-c-to-f
  - /es/38-c-to-f.html → /es/38-c-to-f
  - ... 所有 10 种语言

---

## Skill 6: 多语言批量翻译（高级）

**适用场景**：多语言翻译阶段 | **预计时间**：10种语言约8小时 | **必须执行**：✅ 是（至少英语+印地语）

**本 Skill 包含**：
- 批量翻译策略和优先级
- AI 翻译执行流程
- 各语言特殊注意事项
- SEO 优化最佳实践
- 301 重定向配置

### 6.1 批量翻译策略

**翻译优先级矩阵**:
| 优先级 | 语言 | 市场潜力 | 难度 | 预估时间 |
|--------|------|---------|------|---------|
| P0 | hi（Hindi） | ⭐⭐⭐⭐⭐ | 中 | 3-4h |
| P1 | zh（中文） | ⭐⭐⭐⭐⭐ | 低 | 1.5h |
| P1 | es（西班牙语） | ⭐⭐⭐⭐⭐ | 低 | 1.5h |
| P2 | fr（法语） | ⭐⭐⭐⭐ | 低 | 1h |
| P2 | de（德语） | ⭐⭐⭐⭐ | 低 | 1h |
| P2 | ja（日语） | ⭐⭐⭐⭐ | 中 | 1.5h |
| P3 | pt-br（葡萄牙语） | ⭐⭐⭐ | 低 | 1h |
| P3 | ar（阿拉伯语） | ⭐⭐⭐ | 高 | 2h |
| P3 | id（印尼语） | ⭐⭐⭐ | 低 | 1h |

### 6.2 批量翻译执行流程

**步骤 1：准备英文模板**
```bash
# 确保英文翻译文件完整
locales/en/38-c-to-f.json
├── meta（SEO）
├── bodyTempRanges
├── measurementMethods
├── antipyretics（如适用）
├── ageGroups
├── feverScale
└── faq
```

**步骤 2：并行 AI 翻译**
使用两个 AI 模型同时翻译，对比选择最佳：

```
英文模板
    ├─ Claude 3.5 Sonnet → 翻译 A
    ├─ GPT-4o           → 翻译 B
    └─ 对比选择最佳医学术语
```

**步骤 3：术语标准化审核**
关键医学术语对照表：

| 英语 | Hindi | 中文 | 西班牙语 | 法语 | 德语 | 日语 | 葡萄牙语 | 阿拉伯语 | 印尼语 |
|------|-------|------|---------|------|------|------|---------|---------|--------|
| Fever | बुखार | 发烧 | Fiebre | Fièvre | Fieber | 発熱 | Febres | حمى | Demam |
| Temperature | तापमान | 温度 | Temperatura | Température | Temperatur | 体温 | Temperatura | درجة حرارة | Suhu |
| Oral | मौखिक | 口腔 | Oral | Buccale | Oral | 口腔 | Oral | فموي | Oral |
| Rectal | मलद्वार | 直肠 | Rectal | Rectale | Rektal | 直腸 | Retal | شرجي | Rektal |
| Antipyretics | ज्वरनाशक | 退烧药 | Antipiréticos | Antipyrétiques | Antipyretika | 解熱薬 | Antipiréticos | خافضات الحرارة | Antipiretik |

**步骤 4：占位符验证**
确保所有翻译保留占位符：
- ✅ {fahrenheit}
- ✅ {celsius}
- ✅ {celsiusNoDecimal}

**步骤 5：批量构建验证**
```bash
# 构建所有语言
npm run build

# 检查所有语言文件生成
ls .next/server/pages/*/38-c-to-f.html | wc -l
# 预期输出：10
```

### 6.3 常见语言特有问题

**阿拉伯语（ar）**：
- RTL（从右到左）排版
- 数字格式：使用阿拉伯数字或阿拉伯-印度数字
- 连接字符：بخار（正确）vs ب خ ا ر（错误）

**日语（ja）**：
- 使用汉字（漢字）+ 平假名（ひらがな）混合
- 医学术语通常用片假名（カタカナ）表记外来语
- 例：体温（たいおん）、解熱薬（げねつやく）

**德语（de）**：
- 复合词：Fieber-Temperatur-Umrechnungsleitfaden
- 大小写敏感：所有名词首字母大写
- 特殊字符：ä, ö, ü, ß

**中文（zh）**：
- 简体字 vs 繁体字（本项目用简体）
- 医学术语标准化：发烧（非"發燒"）
- 标点符号：使用全角符号

### 6.4 批量翻译脚本（待开发）

**伪代码**：
```javascript
// scripts/batch-translate.js
const languages = ['zh', 'es', 'fr', 'de', 'ja', 'pt-br', 'ar', 'id'];

for (const lang of languages) {
  // 1. 读取英文模板
  const enTemplate = readFile(`locales/en/${page}.json`);
  
  // 2. AI 翻译
  const translated = await aiTranslate(enTemplate, lang, {
    model: 'claude-3.5-sonnet',
    systemPrompt: 'You are a medical translation expert...',
    temperature: 0.3
  });
  
  // 3. 验证占位符
  validatePlaceholders(translated, ['{fahrenheit}', '{celsius}']);
  
  // 4. 写入文件
  writeFile(`locales/${lang}/${page}.json`, translated);
  
  // 5. 构建验证
  await buildAndVerify(lang, page);
}
```

### 6.5 质量控制检查表

**每种语言的验证清单**：
- [ ] 标题正确翻译（SEO）
- [ ] 所有占位符保留
- [ ] 医学术语标准化
- [ ] 文化适宜性检查
- [ ] HTML 标签未损坏（<br>等）
- [ ] 构建成功无警告
- [ ] 页面渲染正常
- [ ] Schema.org 结构化数据完整

### 6.6 性能优化

**构建时间优化**：
```bash
# 原始：每语言单独构建（10 × 30s = 300s）
# 优化：并行构建（30s 全部完成）

# Next.js 自动并行处理
npm run build
```

**文件大小优化**：
- 平均翻译文件：8-12KB
- 构建后 HTML：60-80KB
- 建议：压缩静态文件（gzip/brotli）

### 6.7 SEO 优化最佳实践（关键改进）

基于用户反馈和搜索引擎优化经验，以下是多语言页面的关键 SEO 优化：

#### **A. H1 标签优化 - 避免关键词堆砌**

**问题**：`<h1>38°C to Fahrenheit (100.4°F) | Fever Temperature Conversion Guide</h1>`
- 过长，关键词堆砌
- 与 title 标签重复

**优化后**：`<h1>38°C to Fahrenheit Conversion</h1>`
- 简洁明了
- 突出用户意图（conversion）
- 保留核心关键词但不过度

**实施步骤**：
```json
// locales/en/38-c-to-f.json
{
  "meta": {
    "title": "38°C to Fahrenheit (100.4°F) - Fever Temperature Guide",
    "description": "Convert 38°C to 100.4°F - the medical fever threshold. Learn fever check methods for adults and babies, with conversion formulas and temperature charts."
  }
}
```

#### **B. 转换公式图片 - Google 图片搜索流量**

**问题**：纯文本和 CSS 网格替换了原来的转换图片
- 失去 Google 图片搜索流量
- 缺少视觉吸引力

**解决方案**：添加转换公式图片模块
```typescript
// 在 insights 中添加
{
  type: 'fact' as const,
  title: 'Conversion Formula',
  content: `
    <div style="display: flex; gap: 20px; align-items: center;">
      <div style="flex: 1;">
        <p>(38°C × 9/5) + 32 = 100.4°F</p>
        <ol>
          <li>Multiply 38 by 9/5: 38 × 1.8 = 68.4</li>
          <li>Add 32: 68.4 + 32 = 100.4</li>
        </ol>
      </div>
      <div>
        <img src="/images/equation/c-to-f-conversion.png" 
             alt="38°C to Fahrenheit conversion formula" />
      </div>
    </div>
  `
}
```

**SEO 收益**：
- ✅ 图片搜索流量
- ✅ 更好的用户体验
- ✅ 结构化数据支持

#### **C. 内部链接优化 - 权重传递**

**问题**：正文缺少指向相关页面的内部链接
- 权重无法有效传递
- 用户导航不便

**解决方案**：在关键板块添加内链
```typescript
// measurementMethods 部分
{
  "measurementMethods": {
    "intro": "38°C readings vary by site. 
             <a href=\"/body-temperature-chart-fever-guide\">
               Learn more about measurement methods
             </a>.",
    "oral": {
      "description": "Standard threshold. 
                     <a href=\"/body-temperature-chart-fever-guide\">
                       Oral guide
                     </a>"
    },
    // ... 其他方法
    "learnMoreLink": "/body-temperature-chart-fever-guide",
    "learnMoreText": "Complete Measurement Guide →"
  }
}
```

**实施效果**：
- 添加 6 个内部链接
- 提升页面权重分配
- 降低跳出率

#### **D. 图片 Alt 属性优化**

**最佳实践**：
```html
<!-- 好的 Alt 文本 -->
<img src="conversion.png" alt="38°C to Fahrenheit conversion formula showing (38 × 9/5) + 32 = 100.4" />

<!-- 避免 -->
<img src="conversion.png" alt="image" />
<img src="conversion.png" alt="" />
```

#### **E. 多语言 SEO 特殊考虑**

**Hreflang 标签**（自动由 Next.js i18n 处理）：
```html
<link rel="alternate" hrefLang="en" href="https://ctofconverter.com/38-c-to-f" />
<link rel="alternate" hrefLang="zh-CN" href="https://ctofconverter.com/zh/38-c-to-f" />
<link rel="alternate" hrefLang="hi" href="https://ctofconverter.com/hi/38-c-to-f" />
<!-- ... 其他语言 -->
```

**多语言关键词策略**：
- 不要直接翻译关键词
- 研究各语言的实际搜索词
- 例：中文"发烧"比"发热"搜索量更高

### 6.8 实战经验总结

**从 38°C 迁移学到的经验**：

1. **翻译顺序很重要**
   - 先翻译 Hindi（最难，最耗时）
   - 然后中文、西班牙语（快速 wins）
   - 最后阿拉伯语（RTL 需要额外测试）

2. **医学术语一致性**
   - 建立术语表（Glossary）
   - 同一术语在整站保持一致
   - 参考 WHO 标准术语

3. **文化敏感性**
   - Hindi：强调家庭关怀
   - 阿拉伯语：使用礼貌、正式语气
   - 日语：使用敬语（です/ます調）

4. **验证自动化**
   - 占位符检查脚本
   - 术语一致性检查
   - 构建后 HTML 验证

5. **SEO 持续优化**
   - H1 简洁化（用户反馈改进）
   - 图片优化（Google 图片搜索）
   - 内部链接策略（权重传递）
   - 结构化数据（Schema.org）

### 6.9 图片 SEO 与动态图片生成（@vercel/og）

#### **A. 动态图片生成 vs 静态图片**

**推荐做法：使用 @vercel/og 动态生成**

而不是手动创建静态图片文件，使用 Next.js 的 `@vercel/og` 库在请求时动态生成图片：

**优势**：
- ✅ 自动生成，无需维护大量静态文件
- ✅ 支持实时温度计算显示
- ✅ 一致的视觉风格
- ✅ 支持多语言（通过 URL 参数）

#### **B. 配置步骤**

**1. 安装依赖**：
```bash
npm install @vercel/og
```

**2. 创建 API 端点** (`pages/api/og.tsx`)：
```typescript
import { ImageResponse } from '@vercel/og';
import { NextRequest } from 'next/server';

export const config = {
    runtime: 'edge',
};

export default function handler(req: NextRequest) {
    try {
        const { searchParams } = new URL(req.url);
        const celsius = searchParams.get('c');

        if (!celsius) {
            return new Response('Missing temperature parameter', { status: 400 });
        }

        const c = parseFloat(celsius);
        const f = (c * 9 / 5) + 32;
        const formattedF = parseFloat(f.toFixed(1)).toString();

        return new ImageResponse(
            (
                <div
                    style={{
                        display: 'flex',
                        height: '100%',
                        width: '100%',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexDirection: 'column',
                        backgroundImage: 'linear-gradient(135deg, #3498db 0%, #2980b9 100%)',
                        fontFamily: '"Geist Mono", monospace',
                        color: 'white',
                    }}
                >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '30px' }}>
                        <span style={{ fontSize: 130, fontWeight: 800 }}>{c}°C</span>
                        <span style={{ fontSize: 80, opacity: 0.6 }}>=</span>
                        <span style={{ fontSize: 130, fontWeight: 800 }}>{formattedF}°F</span>
                    </div>
                    <div style={{ marginTop: 30, fontSize: 32, opacity: 0.9 }}>
                        ({c} × 9/5) + 32
                    </div>
                </div>
            ),
            {
                width: 1200,
                height: 630,
            },
        );
    } catch (e) {
        return new Response(`Failed to generate the image`, { status: 500 });
    }
}
```

**3. 配置 Rewrite 规则** (`next.config.js`)：
```javascript
async rewrites() {
  return [
    {
      source: '/images/equation/:celsius-celsius-to-fahrenheit-conversion.png',
      destination: '/api/og?c=:celsius',
    },
  ];
}
```

**4. 使用图片**（模板自动处理）：
```typescript
// temperature-template.tsx 中
<Image
  src={`/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`}
  alt={t('conversionFormula.imageAlt')}  // 使用本地化 alt
  width={1200}
  height={630}
/>
```

#### **C. 本地化 Alt 标签**

**重要**：虽然图片是动态生成的，但 alt 标签应该本地化：

```json
// locales/en/38-c-to-f.json
{
  "conversionFormula": {
    "imageAlt": "38°C to Fahrenheit conversion formula and calculation steps"
  }
}

// locales/zh/38-c-to-f.json
{
  "conversionFormula": {
    "imageAlt": "38摄氏度转华氏度换算公式及计算步骤"
  }
}

// locales/es/38-c-to-f.json
{
  "conversionFormula": {
    "imageAlt": "Fórmula de conversión de 38°C a Fahrenheit y pasos de cálculo"
  }
}
```

#### **D. 常见错误**

**❌ 错误：手动创建静态图片文件夹**
```bash
# 不要这样做！
mkdir public/images/equation/
cp *.webp public/images/equation/
```

**✅ 正确：让 Next.js 自动生成**
- 删除手动创建的 equation 文件夹
- 依赖 `/api/og` 端点动态生成
- 通过 rewrite 规则映射 URL

#### **E. 验证方法**

```bash
# 检查生成的 HTML 中的图片路径
grep 'src="[^"]*equation[^"]*"' .next/server/pages/en/38-c-to-f.html

# 预期输出：
# src="/images/equation/38-celsius-to-fahrenheit-conversion.png"

# 直接访问动态生成的图片
curl http://localhost:3000/images/equation/38-celsius-to-fahrenheit-conversion.png
```

### 6.10 301 重定向配置（页面迁移必备）

#### **A. 为什么需要 301 重定向**

迁移静态 HTML 页面到 Next.js 后，需要确保：
- ✅ **SEO 权重传递** - 旧链接的权重传递到新页面
- ✅ **用户体验** - 访问旧链接自动跳转到新页面
- ✅ **搜索引擎更新** - 爬虫自动更新索引到新 URL

#### **B. 配置步骤**

**在 `next.config.js` 中添加 redirects**：

```javascript
async redirects() {
  return [
    // 1. 主要页面重定向：HTML 文件 -> 干净 URL
    {
      source: '/:path(0-c-to-f|4-c-to-f|20-c-to-f|36-1-c-to-f|37-c-to-f|38-c-to-f|39-c-to-f|...).html',
      destination: '/:path',
      statusCode: 301,
    },
    // 2. 索引页重定向：index.html -> 父目录
    {
      source: '/:path(c-to-f-calculator|...)/index.html',
      destination: '/:path',
      statusCode: 301,
    },
  ];
}
```

#### **C. 关键注意事项**

**1. 模式匹配格式**：
```javascript
// ✅ 正确：使用括号包裹多个路径选项
source: '/:path(page1|page2|page3).html'

// ❌ 错误：正则语法不支持
source: '/:path*.html'
```

**2. 更新已有配置**：
```javascript
// 找到已有的 redirects 配置，在 path 列表中添加新页面
// 示例：添加 38-c-to-f 到已有列表
source: '/:path(...|37-5-c-to-f|38-c-to-f|39-c-to-f|...).html'
```

**3. 多语言自动支持**：
- Next.js i18n 会自动处理多语言前缀
- `/zh/38-c-to-f.html` → `/zh/38-c-to-f`
- `/es/38-c-to-f.html` → `/es/38-c-to-f`

#### **D. 验证方法**

```bash
# 本地测试重定向
curl -I http://localhost:3000/38-c-to-f.html

# 预期响应：
# HTTP/1.1 301 Moved Permanently
# Location: /38-c-to-f

# 生产环境测试
curl -I https://ctofconverter.com/38-c-to-f.html
```

#### **E. 完整示例（next.config.js）**

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ... 其他配置

  async redirects() {
    return [
      // 温度页面重定向
      {
        source: '/:path(0-c-to-f|4-c-to-f|20-c-to-f|36-1-c-to-f|37-c-to-f|37-2-c-to-f|37-5-c-to-f|38-c-to-f|39-c-to-f|40-c-to-f|...).html',
        destination: '/:path',
        statusCode: 301,
      },
      // 功能页面重定向
      {
        source: '/:path(c-to-f-calculator|c-to-f-formula|...)/index.html',
        destination: '/:path',
        statusCode: 301,
      },
    ];
  },
};

module.exports = nextConfig;
```

#### **F. 迁移检查清单**

- [ ] 更新 `next.config.js` redirects 配置
- [ ] 添加新页面路径到重定向列表
- [ ] 本地测试重定向是否生效
- [ ] 生产环境验证（部署后）
- [ ] Google Search Console 检查索引状态

### 待优化
- [ ] 批量生成脚本自动化
- [ ] AI 翻译质量评分系统
- [ ] 翻译记忆库建立
- [ ] 医学术语词典扩展

---

## 附录 A：单页面迁移常见问题速查

### Q1: 可以只迁移英语版本吗？
**A**: 可以，但建议至少包含 Hindi（印度市场）。其他语言可后续补充。

### Q2: 如何确定使用哪种颜色主题？
**A**: 根据温度范围选择：
| 温度范围 | 主题 | 颜色 | 图标 |
|---------|------|------|------|
| < 35°C | 低体温 | 蓝色 #e3f2fd | ❄️ |
| 35-37°C | 正常体温 | 绿色 #e8f5e9 | ✅ |
| 37-38°C | 边界/低烧 | 黄色 #fffde7 | ⚠️ |
| 38-40°C | 发烧 | 橙色 #fff3e0 | 🌡️ |
| > 40°C | 高烧危险 | 红色 #ffebee | 🚨 |

### Q3: AI 翻译后必须人工审核吗？
**A**: 医学术语建议审核，普通内容可信任 AI。Hindi 必须审核。

### Q4: 迁移后原 HTML 文件怎么办？
**A**: 保留在 `public/` 目录，通过 301 重定向自动跳转。不要删除！

### Q5: 如何快速验证迁移成功？
**A**: 检查清单：
```bash
# 1. 构建成功
npm run build

# 2. 检查英语版本
curl http://localhost:3000/en/39-c-to-f | grep "39°C"

# 3. 检查 Hindi 版本
curl http://localhost:3000/hi/39-c-to-f | grep "बुखार"

# 4. 检查 301 重定向
curl -I http://localhost:3000/39-c-to-f.html
# 应该返回 301 + Location: /39-c-to-f
```

### Q6: 必须保留原 HTML 的标题和描述吗？
**A**: ✅ **是的，必须保留！** 这是为了保持 SEO 排名和搜索一致性。

**为什么重要？**
- 搜索引擎已经索引了原有的标题和描述
- 更改会导致排名下降和流量损失
- 用户看到的搜索结果与实际页面不一致

**正确做法：**
```bash
# 1. 查看原 HTML 的 SEO 信息
grep -E "<title>|<meta name=\"description\"" public/39-c-to-f.html

# 2. 完全复制到 JSON 文件
# locales/en/39-c-to-f.json
{
  "meta": {
    "title": "原HTML中的完整标题",
    "description": "原HTML中的完整描述",
    "ogTitle": "原HTML中的完整标题",
    "ogDescription": "原HTML中的完整描述"
  }
}
```

**错误示例：**
```json
❌ "title": "39°C to Fahrenheit - Fever Guide"  // 简化了！
✅ "title": "39°C to Fahrenheit (102.2°F) | Fever Temperature Conversion Guide"
```

**验证方法：**
```bash
# 检查生成的 HTML 标题是否与原文一致
grep "<title>" .next/server/pages/en/39-c-to-f.html
# 应该与原 public/39-c-to-f.html 中的 title 完全一致
```

---

## 附录 B：迁移决策树

```
开始迁移
    │
    ├─ 是否为体温相关页面（35-42°C）？
    │   ├─ 是 → 使用 medical 场景，添加退烧药板块
    │   └─ 否 → 使用 weather/cooking/body 场景
    │
    ├─ 是否需要多语言？
    │   ├─ 是 → 翻译 10 种语言（2-3小时）
    │   └─ 否 → 仅英语（30分钟）
    │
    ├─ 是否已有类似页面模板？
    │   ├─ 是 → 复制修改（推荐）
    │   └─ 否 → 从 36-1-c-to-f 创建
    │
    └─ 完成 → 配置 301 重定向 → 构建验证 → 部署
```

---

## 参考资源

### 医学术语来源
- MedlinePlus Hindi: https://medlineplus.gov/languages/hindi.html
- Preply Hindi Medical: https://preply.com/en/blog/hindi-medical-terminology/
- WHO Guidelines

### 翻译质量
- Claude 3.5 Sonnet（医学翻译首选）
- GPT-4o（快速初稿）
- 人工审核（必须）

### 技术文档
- Next.js i18n: https://nextjs.org/docs/advanced-features/i18n-routing
- Schema.org: https://schema.org/MedicalWebPage

---

**文档版本**: 1.0
**最后更新**: 2026-02-12
**维护者**: Migration Team
