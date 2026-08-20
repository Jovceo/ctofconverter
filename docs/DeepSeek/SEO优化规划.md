# 网站 SEO 优化规划

> 数据依据：`docs/数据分析报告-2026-08-19.md`
> 更新日期：2026-08-19
> 原则：先修复 Google 除名 + 加速 Bing 恢复，再谈增长。每一步都有数据验收标准。

---

## 一、问题诊断汇总（12 个月数据 + 2026-08-19 线上实测）

| # | 问题 | 严重度 | 数据/实测证据 |
|---|---|---|---|
| 1 | Google 近乎除名（2026-05 起） | 🔴 致命 | GSC 月展现 13,200 → 36；平均排名 91 |
| 2 | 36 个未迁移旧 HTML 无 301、内容冻结 | 🔴 致命 | 175-c-to-f.html 17,811 展现 #12.6，无 Next.js 版本 |
| 3 | 干净 URL 404 | 🔴 致命 | /175-c-to-f、/42-c-to-f、/45-c-to-f、/120-c-to-f、/210-c-to-f 实测 404 |
| 4 | 已迁移页面排名反而更差 | 🟠 严重 | 180-c-to-f（旧 HTML 时代 #11 → 新页 #58.6）、200（#52.8）、40（#59.4）|
| 5 | sitemap 只有 63 条 URL | 🟠 严重 | 500+ 页面（含 100+ 多语言）不在 sitemap |
| 6 | f-to-c 子目录 8 页未迁移 | 🟠 严重 | /fahrenheit-to-celsius/110-f-to-c.html 等，合计 ~7,700 展现 |
| 7 | 旧 HTML 内嵌 AdSense Auto Ads（已关）| 🟡 已修复 | 2026-08-05 后台关闭；需防复发 |
| 8 | Bing 恢复期未做主动推送 | 🟡 机会 | InIndex 43→337 是自然恢复，无主动管理 |
| 9 | 小数页双版本并存 | 🟡 中 | 36-7-c-to-f.html（旧 200）与 36-7-c-to-f（新 404/未收录）|

---

## 二、Google 恢复规划（6-12 个月）

### 2.1 目标

- 3 个月：重建页开始进索引，GSC 月展现 ≥ 1,000
- 6 个月：175-c-to-f 回前 30，36-4-c-to-f 保持前 15，月展现 ≥ 5,000
- 12 个月：36 个未迁移页全部重建完成，月展现 ≥ 20k（回到 2025-09~12 水平）

### 2.2 核心动作（按顺序）

**Step 1：修复索引层（2 周内）**
1. 36 个未迁移页逐个重建（Next.js + locales/en JSON 手写内容）→ 加入 migrated-routes.json 301
2. 重建完成后批量请求 Google 索引（GSC URL Inspection + IndexNow）
3. sitemap 扩到全量（见 3.3），重新生成并提交

**Step 2：修复排名层（1-3 个月）**
4. 已迁移但排名差的页面（180/200/40/30/39/160/35/26/32/38/20/36/41/47/75/100/160...）：对照旧 HTML 版本检查内容完整性，补齐 Answer Capsule + 场景内容 + FAQ（大量页面迁移时正文可能丢失或变薄）
5. 修小数页双版本：36-7/36-9/38-4/37-6/38-1/38-2/38-5/36-2/37-1/37-4 重建后 .html 一律 301
6. 首页升级：QUALITY_PAGE_INFO 已配；检查首页在 Google 的 title/description 是否还显示旧 i18n 内容

**Step 3：权威层（3-6 个月）**
7. 体温页互链环：36-4 ↔ 36-7 ↔ 36-9 ↔ 38-4 ↔ 37-6 ↔ body-temperature-chart-fever-guide ↔ fever-temperature-chart
8. 烤箱页互链环：175 ↔ 180 ↔ 200 ↔ 230 ↔ 210 ↔ fan-oven-conversion-chart ↔ oven-temperature-conversion
9. 外部引用：PDF 下载页（downloads/）已有 Bing 收录，Google 侧可作为资源页；图表页争取外链（食谱博客）

### 2.3 已迁移页面"为什么掉"的排查模板

每个排名差的已迁移页（GSC 展现 > 1,000）都执行：

```
[ ] 旧 HTML 与新页正文对比：内容是否完整迁移？（Answer Capsule / 表格 / FAQ / 内部链接）
[ ] canonical 是否指向自身且无 .html 残留
[ ] textSpinner 程序化段落排查：⚠️ `TemperaturePage.tsx` 的 getStep1/getStep2/getConclusion/getFormulaTitle/getConverterTitle 仍生成公式段文案（disableSmartFaqs 只关 FAQ）—— 确认页面 JSON 能否覆盖，不能覆盖的列入组件改造清单
[ ] 页面结构归属：确认该页用的是哪套 JSON 结构（RoomTemperaturePage / page-sections-faq / 自定义），重建/修正时遵循该页自身结构，不混用
[ ] hreflang 是否指向不存在的多语言页（AGENTS.md 已要求移除）
[ ] 广告代码是否残留（应无——手动广告位统一走组件）
[ ] 结构化数据是否完整（WebPage/FAQ/HowTo Schema）
```

> ⚠️ 2026-08-19 代码审查补充：站内存在 4+ 种页面实现（RoomTemperaturePage 系、180 系 page/sections/faq、36-4 系自定义、fan-oven 系自定义、oven-temperature-conversion 无 JSON）。**"统一 JSON 结构"是 AGENTS.md 的理想状态，实际代码尚未统一**。本次规划的重建工作必须先定模板，再批量执行（见执行方案 0.5）。

---

## 三、Bing 增长规划（3-6 个月）

### 3.1 目标

- 1 个月：sitemap + IndexNow 推送上线，月点击 ≥ 200
- 3 个月：月点击 ≥ 800（接近 2025-11 水平）
- 6 个月：月点击 ≥ 1,000（回到 2025-12 水平），fan-oven-conversion-chart 保持 #3 以内

### 3.2 核心动作

1. **Bing Webmaster 后台**：
   - 提交 `https://ctofconverter.com/sitemap.xml`
   - 开启 IndexNow（已有 INDEXNOW_SECRET 环境变量，确认部署后自动推送生效）
   - 站点 URL 提交（每 URL 上限 10 条/天，用于 36 个重建页）
2. **内容扩页（Bing 已验证关键词）**：fan oven 长尾优先：
   - `180c fan oven equivalent`、`350f in fan oven`、`425 f in fan oven`、`convert 180 fan forced to conventional`、`gas mark 6 in fan oven`、`190c fan oven equivalent`
   - 落地页：fan-oven-conversion-chart 已有；每个烤箱温度页正文加 "Fan oven adjustment" 段（已有模式的复用）
3. **Bing 特有信号**：
   - Bing 喜欢明确的页面标题 + 表格；fan-oven 页已是模板，复制到 175/170/105/46/48/210/230 重建页
   - 提交 PDF（downloads/fan-oven-conversion-chart.pdf 已被 Bing 收录点击）→ 在更多页挂 PDF 下载链接

### 3.3 sitemap 扩量方案

- 现状：63 条 URL（只有英语 Next.js 页面）
- 目标：英语全量（~500 条）+ 多语言保留（暂不加，避免稀释抓取）
- 调整 `scripts/generate-sitemap.js`：从 `pages/*.tsx` 全量生成（已含），但需确认 36 个重建页上线后自动进入
- 重建页 priority：0.9（quality-pages 机制）

---

## 四、技术 SEO 清单（每页通用）

| 项 | 要求 | 状态 |
|---|---|---|
| canonical | 指向自身干净 URL（无 .html、无尾部斜杠）| ✅ 组件已处理；检查残留 |
| hreflang | 英语页不输出多语言 hreflang（已按 AGENTS.md 移除）| ✅ 2026-08-12 首页已加 en+x-default |
| robots.txt | 禁 /_next/static/chunks/、/_next/data/、/api/；允许 CSS/media | ✅ 当前配置正确 |
| 移动端 CWV | LCP < 2.5s、CLS < 0.1、INP < 200ms | ⚠️ 需验证（旧 HTML 页无 CWV 概念，重建页需达标）|
| 广告布局 | 每页 ≤ 2 手动广告位、首屏无广告 | ⚠️ 待实现（流量恢复前完成）|
| JSON-LD | WebPage + FAQ + HowTo（步骤内容）| ✅ 组件自动 |
| 404 处理 | 干净 URL 不再 404（重建后全部可访问）| 🔴 修复中 |

---

## 五、关键词机会清单（GSC 12 个月数据）

### 5.1 有展现但 CTR≈0 的头部词（修复后最可能起量）

| 关键词 | 12 个月展现 | 最佳位置 | 对应页面 |
|---|---|---|---|
| 175 c to f | 533+（聚合页 17.8k）| 11（2025-12）| 175-c-to-f.html → 重建 |
| 230c to f oven | 580 | 8（2025-11~12）| 230-c-to-f.html → 重建 |
| 42 celsius to fahrenheit | 310 | 33-37 | 42-c-to-f.html → 重建 |
| 44 celsius to fahrenheit | 375 | 29-33 | 44-c-to-f.html → 重建 |
| 120c to f | 289 | 26-29 | 120-c-to-f.html → 重建 |
| 36.7 c fever to fahrenheit | 22 | 15-24 | 36-7-c-to-f.html → 重建 |
| 39 celsius to fahrenheit fever | 65 | 45-55 | 39-c-to-f（已迁移，内容检查）|
| 180 c to f in air fryer | 72 | 15.5 | 180-c-to-f 已有（气炸锅内容）|

### 5.2 Bing 恢复期已点击的长尾（扩页方向）

- fan oven 系列：`180c fan oven equivalent`、`350f in fan oven`、`425 f in fan oven`、`gas mark 6 in fan oven`、`convert 180 fan forced to conventional`
- 换算词：`200 celsius to fahrenheit`（imp 335）、`36.1 c to f`（imp 270）、`centigrade to fahrenheit conversion table`（imp 232）
- 体温词：`36.1 body temperature`、`fever measurement for infants chart`、`temp 36.1`

### 5.3 放弃清单（数据证明无机会）

- 天气/穿搭类（展现占比 <0.1%）
- `celsius to fahrenheit` 纯头部词（12 个月 Google 最佳 66 名；AI Overview 截流；不做正面竞争，靠长尾图）

---

## 六、监控与复盘机制

### 6.1 每周（10 分钟）

- [ ] GSC：总点击/展现/平均排名周环比（重点：重建页是否进索引）
- [ ] Bing Webmaster：InIndex、点击、展现
- [ ] GA4：会话（确认不是站长自己访问）

### 6.2 每月（30 分钟）

- [ ] 36 个重建页的排名变化表更新（对应当前最接近的位置）
- [ ] 已迁移页排名 < 旧 HTML 时代的排查（用 2.3 模板）
- [ ] sitemap 是否包含全部英语页
- [ ] 广告收入月度核算（如果已上线广告位）

### 6.3 验收阈值（达标才进入下一阶段）

| 阶段 | 验收 |
|---|---|
| Bing 推送完成 | Bing InIndex ≥ 300 且月点击 ≥ 200 |
| 前 10 页重建完成 | Google 索引 ≥ 10 个重建页，月展现 ≥ 1,000 |
| 36 页全部重建 | 无 .html 直出（全部 301），sitemap ≥ 500 条 |
| 流量恢复 | 月会话 ≥ 2,000 后上线广告位（A 位先行，观察 14 天）|