# CtoFConverter SEO 技术与内容优化规划最终版

**适用范围：** ctofconverter.com 全站  
**依据：** GA4、GSC、Bing 数据；GitHub 代码仓库；线上 URL 实测；两套 AI 方案交叉审查。  
**核心原则：** 先修复可验证的 URL、索引、抓取、模板和测量问题，再做小批量内容实验；任何迁移必须可回滚。

## 一、当前 SEO 状态

当前站点是 Next.js 页面与旧静态 HTML 并行的混合系统。仓库中有 67 个 Next.js page 文件和大量静态 HTML 页面；线上已经同时存在旧 `.html` 页面、已迁移的无后缀页面以及部分无后缀 404 页面。首页、`/36-4-c-to-f` 和图表页属于 Next.js 页面；`/175-c-to-f.html` 仍是 200 的静态页面，而 `/175-c-to-f` 当前返回 404；`/36-4-c-to-f.html` 已 301 到 `/36-4-c-to-f`。

GSC 导出显示 12 个月约 179,532 impressions、7 clicks、14,247 queries 和 357 pages。GA4 显示 Organic Search 5,277 sessions，但现有导出不足以把这些会话全部归因于 Bing，因此 Bing 应被定义为**已验证的重要来源和当前主战场**，而不是未经补充维度证明的唯一来源。线上 sitemap 当前约 63 个 URL，且不包含高曝光的 175 静态页面，说明 sitemap、正式 URL 和实际搜索资产不完全一致。

## 二、P0 技术 SEO：先查清再修改

| 任务 | 操作 | 验收 |
|---|---|---|
| GSC手动措施 | 检查 Manual Actions、Security、Indexing/Coverage、URL Inspection | 截图和日期归档，明确是否有人工措施 |
| 数据口径 | 补拉 GA4 source/medium、pagePath、country×channel、device；补拉 GSC date/query/page/country/device | 能解释 GA4 Organic 与 GSC clicks差异 |
| URL台账 | 汇总 Next、静态HTML、迁移配置、线上HTTP、canonical、sitemap、GA4、广告 | 每个重点 URL有唯一处置决定 |
| 301体检 | 抽检已迁移页面，验证旧URL → 新URL 301 → 新URL 200，且无中转链 | 状态码、canonical、内容和内部链接一致 |
| sitemap核对 | 明确正式 URL 集合；保留的静态页面必须纳入或有明确不纳入理由 | sitemap与正式URL台账一致 |
| Bing抓取 | 导出非2xx URL、抓取错误、IndexNow和sitemap状态 | 形成可修复 URL清单，修复前后可比较 |
| 构建验证 | 修复当前 `next lint` 脚本兼容性；在足够内存环境完整执行 build | lint成功，build退出码为0 |

## 三、URL迁移规则

**绝不直接把 `.html` 301 到当前不存在的无后缀路径。** 以 175 页面为例，当前 `/175-c-to-f.html` 返回 200，`/175-c-to-f` 返回 404。因此可选方案只有两种：保留 `.html` 作为正式 URL，纳入 sitemap、内链和后续模板维护；或者先创建无后缀新页面，确认 200、内容完整、canonical 自指、结构化数据、GA4和广告正常，再启用 `.html` → 无后缀的 301。

迁移页面必须遵循“新页面就绪 → 线上验证 → 旧页面301 → sitemap和内链切换 → 监测”的顺序。一次只迁移 3—5 个页面，观察完整周期后再扩大。任何迁移不得同时改变大量内容、模板、框架版本和多语言结构，以免无法归因。

## 四、页面模板与内容质量

站内不能继续假设所有页面共享一个 JSON 结构。当前至少存在普通温度页、体温自定义页、180/93/375 系列结构、fan-oven 自定义页和全 TSX 内容页。应分别定义三个正式模板：烤箱/烘焙模板、体温/健康模板、图表/工具模板。

每页至少需要一个独立的 Answer Capsule、公式和结果、场景说明、对照表或步骤、3—5 条真实 FAQ、同主题内部链接、更新时间和可验证来源。不能只替换数字而保留相同的程序化段落。`TemperaturePage.tsx` 中仍存在若干程序化公式和结论文案，批量重建前必须验证 JSON 是否能覆盖这些段落；不能覆盖时先修改组件。

体温和食品安全页面属于高敏感内容。页面应清楚区分信息参考和医疗诊断，提供作者/审阅责任、测量方法边界、更新时间和可靠来源。所有来源、阈值和建议必须逐页核对，不应只在模板中写入来源名称。

## 五、内容集群优先级

### 1. 烤箱与烘焙

这是当前最值得优先投入的方向。Bing 页面数据证明 `fan-oven-conversion-chart` 是全站最强资产；Google 历史曝光也集中在 175、170、210、230、48 等温度场景。内容应覆盖 Celsius/Fahrenheit、fan oven、conventional oven、Gas Mark、适用烘焙场景和必要的食品安全说明。所有温度页应指向 fan-oven 中心页、相邻温度页和图表页。

### 2. 体温与健康

36.x 页面是 Google 历史表现较好的内容集群，36.4 页面是重要的新模板样本。但这一集群必须以可信度和谨慎表述为优先，不能仅为了广告单价而扩展。建议先维护已有中心页，再小批量改造 36.7、36.9、38.x 等已有曝光页面。

### 3. 图表、公式和 PDF

图表页与 PDF 具有双引擎需求证据。应保持在线表格、可打印版本、PDF内容和HTML内容一致，并对 PDF 下载、打印和相关页面点击建立事件。广告不得靠近下载按钮、复制按钮或转换结果，防止误触。

## 六、内部链接

烤箱线以 `fan-oven-conversion-chart` 为中心，连接 oven-temperature-conversion、oven-to-air-fryer、175/180/200/210/220/230 等页面及图表页。体温线以 body-temperature-chart-fever-guide 为中心，连接 36.x、37.x、38.x 页面。工具线连接首页、c-to-f-calculator、c-to-f-formula、图表页和 Fahrenheit-to-Celsius 页面。

每个新页面上线当周应至少获得两个相关页面的入链，并指向一个中心页和一个相邻意图页面。先检查线上 URL 是否 200，再生成内部链接，避免把权重导向 404。

## 七、广告与页面体验

Auto Ads是否已关闭需要以 AdSense 后台记录确认；代码审计能够确认部分静态页面和 Next 页面存在不同的广告加载方式，但不能从初始 HTML推断最终填充率。正式上线前应建立页面类型广告基线。

建议初始策略为：转换页只在用户答案之后测试一个手动广告位；长内容页最多增加一个正文中后段广告位；移动端首屏、H1、输入框、结果、复制和下载控件附近不放广告。广告位是否扩大，应根据真实 page RPM、广告可见性、CLS、LCP、退出率和转换事件判断。所有收入数字只能来自实际 AdSense 报告，$1—5 RPM只能作为情景假设。

## 八、分阶段路线

| 阶段 | 时间 | 目标 |
|---|---|---|
| P0 | 第1周 | GSC/Bing诊断、URL台账、301体检、数据补拉、广告状态确认 |
| P1 | 第2周 | 定正式 URL和三个页面模板；修复构建验证；不批量迁移 |
| P2 | 第3—6周 | 选择3—5个高曝光页面小批量重建/改造，观察抓取、索引、排名、点击和体验 |
| P3 | 第7—12周 | 根据小批量结果扩展烘焙、体温和图表集群；分批处理低价值页面 |
| P4 | 12周后 | 在稳定数据基础上扩大广告和内容投入，继续按实验结果决策 |

## 九、验收与停止条件

每批页面至少观察四周，并记录 HTTP、canonical、sitemap、索引状态、Bing/GSC impressions、clicks、排名、GA4真实事件、设备差异和广告体验。如果 Bing点击连续两周明显下滑、出现大量新抓取错误、GSC出现手动措施、部署失败或移动端体验明显恶化，应暂停下一批并优先回滚或修复。

## References

[1]: https://developers.google.com/search/docs/fundamentals/seo-starter-guide "Google Search Central SEO Starter Guide"

[2]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central people-first content guidance"

[3]: https://support.google.com/adsense/answer/1346295?hl=en "Google AdSense ad placement policies"

[4]: https://ctofconverter.com/175-c-to-f.html "线上175°C页面"

[5]: https://ctofconverter.com/36-4-c-to-f "线上36.4°C页面"
