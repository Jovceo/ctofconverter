# 温度页面迁移技能库

## 概述
本文档记录从静态 HTML 迁移温度转换页面到 Next.js 的完整技能体系，确保高质量、无硬编码、多语言支持。

---

## Skill 1: 硬编码修复

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

---

## Skill 2: 翻译文件创建

### 2.1 文件结构模板
```
locales/{locale}/38-c-to-f.json
├── meta              # SEO（完全保留原标题描述）
├── bodyTempRanges    # 体温范围评估
├── measurementMethods # 测量方法
├── antipyretics      # ⭐ 退烧药指南（可选）
├── ageGroups         # 年龄分组（3-4组）
├── feverScale        # 温度表格
└── faq               # 6个问答
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

### 5.1 自动化验证
```bash
# 检查所有翻译文件
node scripts/validate-translations.js

# 检查特定页面
node scripts/validate-translations.js --page 38-c-to-f
```

### 5.2 手动检查清单
- [ ] 页面标题正确（SEO）
- [ ] 温度转换计算正确
- [ ] 无英文硬编码残留
- [ ] 所有占位符 {fahrenheit} 保留
- [ ] 移动端响应式正常
- [ ] 语言切换正常
- [ ] FAQ 完整显示
- [ ] 温度表格包含所有行

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
- [ ] 提交搜索引擎
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

---

## Skill 6: 多语言批量翻译（高级）

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

### 待优化
- [ ] 批量生成脚本自动化
- [ ] AI 翻译质量评分系统
- [ ] 翻译记忆库建立
- [ ] 医学术语词典扩展

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
**最后更新**: 2025-02-10
**维护者**: Migration Team
