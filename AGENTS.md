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
- **数据集级**：`config/datasets/*.json` 的每一行必须有 `source` + `source_url` + `quote`（来源原句片段）+ `checked_on`，并且同一天在 [docs/数据来源核查-2026-08-27.md](./docs/数据来源核查-2026-08-27.md)（或当日新增的核查文件）里留下一条「我确实打开过这个 URL、确实看到这个数字」的记录。抓取失败（如 403 bot 拦截）要写明失败原因，并且该数值只在**与已机验来源一致**时才保留
- 来源之间分歧不平均、不取中间值：两派都发布并各自标注来源（例：Gas Mark 3 = 160 °C 或 170 °C；hyperpyrexia = 41.0 °C 或 41.5 °C）
- 权威来源没有发布过的分档/分级，就不要当成事实写（例：NHS/Mayo/CDC 都不发「低热-中热-高热-危险」四档，站内页面若要保留这种分档，只能作为本站编辑性提示，数据集里只放有出处的分档并注明区别）

### 医疗内容
- 涉及体温、发烧、低体温症等健康相关内容的页面，必须加免责声明："This information is not a substitute for professional medical advice. In emergencies, call 911 immediately."
- 免责声明放在医疗建议段落末尾
- 阈值口径（2026-08-27 逐源核实后的唯一定义）：发烧 = ≥38.0 °C（NHS/CDC；Mayo 口温口径 37.8 °C）；**低体温症 = <35.0 °C**（NHS/Mayo/CDC/StatPearls 一致），<36.0 °C 只是「偏低需复测」——36.0 °C 那条线来自 NICE 围手术期与儿科住院质控，不是定义（健康成人腋温均值本身就是 35.97 °C）
- 部位偏移用 Merck 的单值 ±0.6 °C（≈1.0 °F）；「腋下低 0.5–1.0 °C」是把 °F 区间误标成 °C，不得再写

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
- `TemperaturePage` 里的 `renderGranularInsight()`（「💡 Analysis: {label}」卡片）自 2026-02-12 起已注释停用，**不得恢复**：它是 `getGranularContext().description` 机器句的唯一渲染出口，与零程序化内容红线冲突。`utils/temperatureContext.ts` 的 `formatLabel` 保留，但只当展示用标签格式化器，不得再把它的输出拼进 description / og / JSON-LD。
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

### 语言版本索引策略（2026-08-27 起，红线）
- **只有 `en` 允许被索引**；非英语 locale 页面一律 `noindex, follow`，由 `utils/locale-config.ts` 的 `getRobotsDirective()` 统一控制
- 已接线的位置（缺一不可，新增页面时沿用）：`components/Layout.tsx`、`pages/index.tsx`、`pages/fahrenheit-to-celsius.tsx`（后两者自带 `<Head>`，会覆盖 Layout）
- hreflang 同步收敛：**只有英语页声明 hreflang，且只声明自身 `en` + `x-default`**；非英语页不输出任何 `rel="alternate"`（noindex 页作为 hreflang 目标会被判无效）
- 语言页**不删除、不 301、不改状态码**，保持 200 可访问；语言切换器 UI 走 `visibleAlternateLinks` context，与 Head 里的 hreflang 已解耦，不要误删
- 理由（勿在代码注释外重复讨论）：2026-04-22 批量多语言上线后 Google 于 4-26/27 整站降级，sitemap `submitted 62 / indexed 0`，640 个构建产物中 576 个（90%）是机器翻译副本；8-20 的「保留不删、被动衰减」执行 4 个月未换来重新收录。详见 `docs/收录诊断-2026-08-27.md`

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
- [ ] 非英语 locale 页 `robots` 为 `noindex, follow` 且无 `rel="alternate"`（抽查 `/es`、`/ja/0-c-to-f`）
- [ ] `npx tsc --noEmit` 类型检查通过（本地不跑 `npm run build`，因 500+ 旧页会超时）
- [ ] `public/sitemap.xml` 已重新生成（`node scripts/generate-sitemap.js`）
- [ ] `config/quality-pages.json` 已更新（如有新精做页面）
- [ ] `pages/index.tsx` 的 `QUALITY_PAGE_INFO` 已更新（如有新精做页面，否则首页不显示链接）
- [ ] `config/migrated-routes.json` 已更新（如有新页面需要 301 旧 HTML）
- [ ] 环境变量 `INDEXNOW_SECRET`：**默认不设**。`/api/indexnow` 在没这个变量时直接 503 关闭（fail-closed，2026-08-25 改），保持关着就是安全的。只有确实需要从远端手动触发提交时才设；日常提交走 `scripts/manual-indexnow.js`，它直接打 IndexNow，不需要这个端点。
- [ ] 如改动了变现层：`config/monetization.json` 保持 UTF-8 **无 BOM**（带 BOM 会直接 500），并确认 `enabled: false` 时线上页面搜不到 `adsbygoogle`
- [ ] 如改动了数据层：`public/data/` 已重新生成（`npm run generate:datasets`）、`/api/ref` 与 `/data/manifest.json` 行数一致、`/data-api` 抽查 1 条 curl 可用；新建 JSON 一律无 BOM（`Set-Content -Encoding UTF8` 会加 BOM，用 node 或编辑器写）
- [ ] 嵌入组件改动必须在浏览器里开一次 `/embed/demo.html`：三张表都要出现、console 无 error（只看 `node --check` 通过不算，`document.currentScript` 类问题只有真渲染能发现）
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

## 变现与度量（2026-08-26 起）

### 唯一入口
- 所有广告位与联盟位只能走 `config/monetization.json` + `components/Monetization/`。禁止在页面或组件里手写 `<ins class="adsbygoogle">`、禁止直接引 `adsbygoogle.js`。
- 默认全关。关着的时候 `Analytics.tsx` 不注入广告脚本、`Monetization` 返回 null（无 DOM、无第三方请求）——这条是「Auto Ads 永久关闭」红线的代码护栏，后台开关被人回摆也不会出广告。
- 启用 = 在 AdSense 后台建**手动**广告单元，把 `data-ad-slot` 填进 `ads.slots.{temperature|chart|guide}`，再翻 `enabled`。缺 slot 一律不渲染。

### 位置红线（组件已按此固定，改动时需保持）
- 挂载只允许出现在内容块之后、FAQ 之前；H1 与答案区（Answer Capsule）之间禁放。
- 单页移动端 ≤2 位：温度页 1 位（variant=temperature）、图表长页 1 位（chart）、指南页 1 位（guide）。
- 广告容器预留高度，避免 CLS；联盟卡必须带 `rel="sponsored noopener nofollow"` 与披露语（FTC + 亚马逊要求）。
- 联盟 `offers[].url` 必须是在亚马逊页面亲自核对过的真实链接（同「数据核实」红线）；`affiliate.tag` 为空则不渲染，不做无佣金导流。

### 度量（回答「哪页值得加广告位」的唯一依据）
`utils/track.ts` 已接：`conversion_completed`、`copy_result`、`chart_download`、`related_page_click`、`reverse_conversion_used`。新增交互型功能时补事件，不要新建平行命名；GA4 后台需将事件登记为 Key event。

### 同义替换（红线重申）
`utils/textSpinner.ts` 的变体轮换已于 2026-08-26 停用（`getVariantIndex` 恒返回 0）。不得恢复；也不得在新页引入 textSpinner——页面差异靠 `locales/en/{slug}.json` 人工内容实现。

## 数据资产与可嵌入组件（2026-08-27 起）

站点当前的主线不是 SEO，而是「别人能直接拿走用」的公开数据资产。链路只有一条：

```
config/datasets/<id>.json          ← 唯一数据源（人工写，禁止程序化生成）
  ├─ npm run generate:datasets → public/data/*.{json,csv} + manifest.json + index.html（prebuild 自动跑）
  ├─ utils/refDatasets.ts → 页面 / API 共同读取（同一份数据）
  ├─ /api/ref, /api/ref/[dataset], /api/ref/lookup（只读、无 key、CORS *）
  └─ public/embed/ref-chart.js（零依赖嵌入组件）+ public/embed/demo.html（实盘演示，noindex）
```

- **不得**在页面、API、README 里另写一份数值——改了 `config/datasets/` 就必须跑 `npm run generate:datasets` 并重新 build，否则 `public/data/` 与源不一致
- 新数据集：写 JSON（含 `provenance`，否则发布脚本报错拒发）→ 在 `utils/refDatasets.ts` 的 `DATASET_REGISTRY` 注册一行 → `/data-api` 页面会自动列出它
- 暂不发布的数据集写进 `WITHHELD_DATASETS`（API 返回 503 + 理由，而不是静默 404）
- 对外可见的字符串（API 响应、CSV 表头、`public/embed/*`、README）**只能英文**；页面 `description` 受移动端 120 字符上限约束
- `public/embed/ref-chart.js` 必须在脚本执行时就把 `document.currentScript` 存进闭包（DOMContentLoaded 里读它是 `null`，会导致整张表静默不渲染），`ORIGIN` 由脚本自身 URL 推导，这样在 staging / 本地同样能测
- 许可：数据 CC-BY-4.0、代码 MIT；署名行由组件自己写在表格下方，不要去掉

## 禁止行为
- ❌ 使用 textSpinner.ts 或任何同义替换工具 — Google Helpful Content 算法能识别伪原创模式，会导致整站降权
- ❌ 只改温度值其余文案完全相同的批量页面 — 无信息增益
- ❌ 关键词堆砌 — 影响可读性
- ❌ 广告嵌入内容流 — 广告放在内容区域之外
- ❌ 批量创建页面 — 每个页面必须有手写独特内容
- ❌ 改变已收录页面的 URL 路径 — 会丢失已有排名和反向链接
- ❌ 把没进核查台账（docs/数据来源核查-*.md）的数值发布成数据集，或在数据集里编造来源小节名 — 宁可少一个数据集
- ❌ 在 `config/datasets/` 之外复制一份数值（页面/API/README 各写一套）— 这是 2026-04 质控失效的根因

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
