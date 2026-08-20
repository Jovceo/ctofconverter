## 页面规范
- 响应式设计，移动端优先
- 页面 URL 统一不带尾部斜杠（如 `/180-c-to-f`、`/fan-oven-conversion-chart`）
- 精做现有页面时保持 URL 不变，不改变已收录页面的路径
- 新建页面放在 `pages/` 下，与现有页面同级
- 移动端标题/描述字数限制：metaTitle ≤55 字符，metaDescription ≤120 字符，headerTitle ≤55 字符（移动端展示与编辑的推荐目标，不是搜索引擎的绝对硬限制；优先保证标题/描述唯一、准确、自然和符合搜索意图，不得为了压缩字符而删掉关键语义。metaDescription 可能被搜索引擎动态改写；headerTitle 以移动端可读性和布局不溢出为准。）

## 做新页面之前
1. 先做关键词调研 — 在谷歌 SERP 确认有真实搜索量、且竞争可打
2. 检查站内是否已有覆盖此内容的页面 — 避免重复
3. 确认该页面的「信息增益」— 用户在这页能看到其他站看不到什么？

## 内容创作流程
1. 确定关键词和搜索意图
2. 分析 SERP 前 5 名，看竞品做到什么程度
3. 规划信息增益点：你比前 5 名多提供什么价值？
4. 写 Answer Capsule（40-60 词直接答案，放在 H1 下方，全局一个）
5. 写正文（H2/H3 分段，内容针对该温度有独特价值）
6. 添加结构化数据（表格/列表/Schema）
7. 写 FAQ（3-5 个真实问题，每个 40-60 词）
8. 添加内部链接
9. GEO 检查：段落是否自包含？数据是否带来源？表格标题是否明确？实体名称是否统一？
10. 将完成的页面 slug 加入 `config/quality-pages.json` **和** `pages/index.tsx` 的 `QUALITY_PAGE_INFO`（首页 Featured Guides 需要这两个配置同时存在才能显示链接，缺一个 = 零入站内链）
11. 运行 `node scripts/generate-sitemap.js` 重新生成 sitemap

## 内容原则
- 零程序化内容生成：每页正文、FAQ、上下文手动写，不批量生成
- 零同义替换：不用 `textSpinner.ts`，不搞伪原创
- 允许复用布局组件（如 `TemperaturePage`），通过页面 JSON 和 `customSections` 实现内容差异化
- ❌ 只改温度值其余文案完全相同的批量页面（如 10-c-to-f、20-c-to-f 换数字模式）
- 以用户为中心，回答真实问题
- 内容真实、准确，标注数据来源
- 每页必须有信息增益（用户在这页能看到其他站看不到的价值）
- 不要写废话（如 "Temperature is a measure of how hot or cold something is"）

## GEO（面向 AI 搜索优化）

AI 搜索引擎（Google AI Overviews、ChatGPT、Perplexity）与传统 SEO 的区别：AI 会提取段落直接引用，而不是只给链接。内容要写成"可被摘录"的格式。

### 引用友好格式
- 段落自包含：一段话能独立成立，不依赖上下文就能理解（AI 提取时不会带上前后文）
- 用陈述句给结论，不用"也许"、"可能"等模糊词（AI 倾向引用确定性表述）
- 数据带来源写在一起：不要分开写"165°F"和"来源：USDA"，要写"USDA 建议禽类内部温度达到 165°F (74°C)"

### 表格优先
- AI 引擎偏爱提取表格数据，优于段落文字
- 温度对照、烘焙时间、安全温度等数据用表格呈现，不用纯文字描述
- 每个表格的标题要明确（如"USDA Safe Internal Temperatures"而非"Temperature Data"）

### 实体与关系
- 开头第一段明确命名主体：页面是关于"Celsius"和"Fahrenheit"的，不是关于"temperature"的
- 建立实体关系链：180°C → 烤箱温度 → 烘焙 → 食品安全（USDA），让 AI 理解上下文
- 同一实体全文用同一名称，不混用"180 degrees C"、"180°C"、"180 Celsius"

### 结构化数据
- FAQ Schema：由组件从 JSON faq 数组自动生成 JSON-LD
- WebPage Schema：由组件自动生成
- Breadcrumb Schema：由组件自动生成
- HowTo Schema：页面有步骤性内容（如急救步骤、烘焙步骤）时**必须**添加，由组件从 JSON steps 数组生成
- 表格数据：用 HTML `<table>` 标记，AI 可直接解析（已有）

### FAQ 渲染规则
- FAQ 答案必须始终在 DOM 中，用 CSS `display:none` 控制显隐，不能用条件渲染（`{show && <div>}`）
- 原因：AI 爬虫不执行 JavaScript，条件渲染的答案不可见，GEO 失效

### 数据核实
- 引用外部数据（NOAA/CDC/USDA 等）时，必须对照官方源逐格核实后再发布
- 不能凭记忆或估算写数据，差异哪怕 1°F 也会影响可信度

### 医疗内容
- 涉及体温、发烧、低体温症等健康相关内容的页面，必须加免责声明："This information is not a substitute for professional medical advice. In emergencies, call 911 immediately."
- 免责声明放在医疗建议段落末尾

## 技术实现

### 页面与组件
- 复用布局组件（如 `TemperaturePage`），不为每个页面新建组件文件
- 通过页面 JSON + `customSections` + `disableSmartFaqs` 实现内容差异化
- 精做页面时可以修改现有页面文件（如 `180-c-to-f.tsx`、`locales/en/180-c-to-f.json`）的内容
- 旧 URL 结构不动，不改变已收录页面的 URL 路径

### 页面内容实现方式
- 所有页面的正文、FAQ、上下文内容统一放在 `locales/en/{slug}.json` 中
- 已有 .tsx + .json 的页面（如 `180-c-to-f`）：修改 JSON 内容，保持组件文件不变
- 新建页面：创建 `locales/en/{slug}.json` + 薄包装 `.tsx`，走同一套 i18n JSON 路径
- 统一走 JSON 的目的：未来扩展多语言时只需加 `locales/{locale}/{slug}.json`，不用改代码
- 所有页面都需要 `disableSmartFaqs={true}` 跳过 textSpinner FAQ
- 精做页面去掉多语言链接和 hreflang 标签，只保留英语版本

### 本地验证与构建
- 本地类型检查：`npx tsc --noEmit`
- `npm run build` 因 500+ 旧页本地会超时，production build 由 Vercel 自动处理
- 修改后手动运行 `node scripts/generate-sitemap.js` 重新生成 sitemap

### Sitemap 策略
- `scripts/generate-sitemap.js` 在 `prebuild` 时自动运行，也可手动执行
- 只生成英语 URL，不生成多语言 URL
- 所有 `pages/*.tsx` 页面（排除 `_app`/`_document`/`_error`/`404`/`api`）自动收录
- 优先级：首页 1.0 > 精做页面 0.9 > 工具页 0.8 > 整数温度页 0.6 > 小数温度页 0.4 > 其他 0.5
- `config/quality-pages.json` 记录已精做的页面，精做完成后需手动添加 slug 到此文件
- lastmod 来自 Git 最后修改日期，修改页面内容后自动更新

### robots.txt
- 禁止 `/_next/static/chunks/`（JS chunk 文件，浪费抓取预算）
- 允许 `/_next/static/css/` 和 `/_next/static/media/`
- sitemap 声明由 `generate-sitemap.js` 自动维护

### 旧 HTML 处理
- 旧 HTML 文件保留在 `public/` 中不删除
- 通过 `config/migrated-routes.json` 配置 301 重定向到对应 Next.js 页面
- 不加 noindex header
- 新建 Next.js 页面后，将 slug 加入 `migrated-routes.json` 的 `htmlRoutes` 数组，旧 HTML 自动 301

### 部署检查清单
- [ ] `npx tsc --noEmit` 类型检查通过（本地不跑 `npm run build`，因 500+ 旧页会超时）
- [ ] `public/sitemap.xml` 已重新生成（`node scripts/generate-sitemap.js`）
- [ ] `config/quality-pages.json` 已更新（如有新精做页面）
- [ ] `pages/index.tsx` 的 `QUALITY_PAGE_INFO` 已更新（如有新精做页面，否则首页不显示链接）
- [ ] `config/migrated-routes.json` 已更新（如有新页面需要 301 旧 HTML）
- [ ] 环境变量 `INDEXNOW_SECRET` 已设置（用于部署后自动提交索引）
- [ ] Vercel production build 成功

## 精做页面原则

### 内容深度
- Answer Capsule 放在 H1 下方，直接回答"X°C 是多少°F"
- 正文内容覆盖该温度的核心使用场景（烤箱温度就写烘焙，体温就写医疗）
- FAQ 只写正文中没有回答的问题，不重复正文已有的内容
- FAQ 回答用户真实疑问，不凑数；宁可 3 个有深度的，不要 8 个浅的
- 引用权威数据时标注来源（WHO/USDA/NOAA/CDC 等）

### 内容差异化
- 每个温度页至少有 1 段内容是其他温度页没有的（信息增益）
- 不同温度页可以有相似结构，但正文、FAQ、上下文必须针对该温度的独特场景
- 烤箱温度页写烘焙食谱和 Gas Mark 转换；体温页写发烧分级和就医标准；天气温度写穿搭和空调 -- 不要混用

### 内部链接
- 自然融入正文，指向站内相关专题页（fan-oven-conversion-chart、c-to-f-calculator 等）
- 体温相关页面互相链接（37-c-to-f ↔ 38-c-to-f ↔ 39-c-to-f）
- 烤箱相关页面互相链接（180-c-to-f ↔ fan-oven-conversion-chart ↔ oven-temperature-conversion）

### 质量红线
- ❌ 通用废话开头（"Temperature is a measure of..."）- 用户已经知道什么是温度
- ❌ 与其他温度页完全相同的段落（只改数字）- 无信息增益
- ❌ 无来源的数据 - 不可引用，AI 搜索引擎不会采信

### GEO 检查点
- Answer Capsule 是否自包含（不依赖上下文就能理解）
- 数据表格是否有明确标题（如"USDA Safe Internal Temperatures"）
- 权威数据是否标注来源（WHO/USDA/NOAA/CDC）
- 实体名称是否全文统一（不混用"180°C"和"180 degrees C"）
- FAQ 答案是否能被 AI 直接摘录引用

## 禁止行为
- ❌ 使用 textSpinner.ts 或任何同义替换工具 — Google Helpful Content 算法能识别伪原创模式，会导致整站降权
- ❌ 只改温度值其余文案完全相同的批量页面 — 无信息增益
- ❌ 关键词堆砌 — 影响可读性
- ❌ 广告嵌入内容流 — 广告放在内容区域之外
- ❌ 批量创建页面 — 每个页面必须有手写独特内容
- ❌ 改变已收录页面的 URL 路径 — 会丢失已有排名和反向链接

## 收录打通后待办（触发条件：5 个精做页进 Google 索引）

以下任务在收录确认打通后执行。收录打通前做 = 过早优化，收录没打通可能要换策略，白费。

### FAQ 渲染机制升级（方案 B）
- **触发条件**：GSC 显示精做页已进索引，且开始有 AI 引擎（Perplexity/ChatGPT）引用站内内容
- **现状**：两套 FAQ 组件用不同隐藏机制
  - `FahrenheitToCelsiusPage` + `TemperatureFAQSection`：`.faq-answer { display: none }`（globals.css）— AI 爬虫可能拿不到 HTML 文本
  - `oven-temperature-conversion` / `oven-to-air-fryer`：`.faqAnswer { max-height: 0 }`（module.css）— AI 爬虫能拿到（文本在 DOM）
- **改动**：把 `globals.css` 的 `.faq-answer { display: none }` 改成 `max-height: 0` + `overflow: hidden` 方案，让两套组件统一
- **不改**：`<details>` 原生标签方案（理论上最优但重构量大，ROI 不确定）
- **为什么现在不做**：JSON-LD schema 已独立输出 FAQ 内容，Google 和 AI 引擎主要从 JSON-LD 拿数据，不依赖 HTML 折叠状态。收录瓶颈解决前优化 HTML 可见性是过早优化

## 维护
- 定期检查 Google Search Console 收录状态
- 根据收录数据调整内容策略
- 旧 HTML 通过 migrated-routes.json 配置 301 逐步迁移
- 部署后 IndexNow 自动提交新 URL 到搜索引擎
