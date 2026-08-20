# CtoFConverter 全站事实审计与增长战略修订报告

**作者：Manus AI**  
**审计对象：** https://ctofconverter.com/  
**代码依据：** GitHub 仓库 `Jovceo/ctofconverter`，审计提交 `4e16ab2`。  
**数据依据：** 用户提供的 GA4、GSC query+page、Bing Webmaster 数据。  
**线上核验：** 2026-08-19 对首页、175°C 页面、36.4°C 页面、图表页、sitemap 和 robots.txt 进行 HTTP/HTML 对比。

> 本报告替代此前仅依据统计数据和少量抽样页面的初步报告。此次结论同时考虑了实际页面、代码仓库、路由规则、线上响应、sitemap、广告/分析脚本和用户数据；仍未假设未能直接验证的 AdSense 收益、Search Console 属性权限或真实浏览器广告填充数据。

## 一、审计结论

CtoFConverter 当前不是一个单一、统一的 Next.js 网站，而是一个**混合发布系统**：仓库中存在 67 个 `pages/*.tsx` Next.js 页面和 80 个 `public/*.html` 静态 HTML 页面；线上同时存在 Next.js 路由、迁移中的 `.html` 重定向和仍原样提供的旧静态页面。技术栈是 Next.js 16、React 19、TypeScript，线上响应显示部署在 Vercel。

这项事实会直接改变 SEO 策略。此前把 `/175-c-to-f.html` 作为应迁移到 `/175-c-to-f` 的页面是不准确的，因为线上实际情况是：`/175-c-to-f.html` 返回 200，是高曝光静态页面；`/175-c-to-f` 返回 404，并不是可直接改造的 Next.js 页面。相反，`/36-4-c-to-f.html` 返回 301 到 `/36-4-c-to-f`，属于已迁移页面。下一步不能统一执行“去掉 .html”，而应先建立逐 URL 的迁移状态表。

从业务战略看，网站已经拥有三个可扩展资产：第一是高意图的 C↔F 转换工具；第二是数值型温度页面；第三是烤箱、空气炸锅、体温、图表和 PDF 等场景内容。最优方向仍然是“温度转换工具 + 场景参考平台”，但执行顺序必须改为：**先统一发布与数据事实，再改造既有曝光页面，最后扩大内容与广告覆盖**。

## 二、事实范围与可信度等级

| 证据层级 | 已核验事实 | 对决策的意义 |
|---|---|---|
| A：代码仓库 | Next.js 16/React 19；67 个 Next 页面；80 个 `public/*.html`；多套页面与组件；全局 Analytics；静态页面独立脚本 | 可用于判断架构、模板、脚本和 URL 机制 |
| A：线上 HTTP | 首页、175 页面、36.4 页面、图表页、sitemap、robots 实际状态码与 HTML 元数据 | 可用于判断当前真正被用户和爬虫看到的版本 |
| B：统计导出 | GA4 7,869 sessions；GSC 179,532 impressions/7 clicks；Bing 各分区数据 | 可用于趋势与机会排序，但受属性、时间和聚合口径限制 |
| C：未验证事项 | AdSense 实际填充率、RPM、收益、广告可见性、GSC 属性设置、Core Web Vitals、真实浏览器交互 | 只能列为核查任务，不能当作结论 |

## 三、全站架构审计

### 3.1 页面与发布体系

仓库中同时存在 `pages/`、`components/` 和 `public/` 三套重要实现层。Next.js 页面通过 `_app.tsx` 全局挂载 `Analytics`，而旧静态 HTML 页面各自包含独立的 GA4、AdSense 和交互脚本。`next.config.js` 明确规定，部分已迁移 `.html` 路由执行 301，但其他静态 `.html` 仍会原样提供；sitemap 生成脚本主要扫描 `pages/`，不扫描全部静态 HTML。

这会产生四类 SEO 风险。首先，同一主题可能存在静态旧版和 Next.js 新版两种内容与模板。其次，迁移状态不一致会使内部链接、canonical、sitemap 和 GSC 页面报告产生混合结果。再次，旧静态页面与 Next 页面可能有不同的广告、埋点和内容更新节奏。最后，开发者以后修改共享组件时，旧静态页面不会自动同步。

### 3.2 线上 URL 样本

| URL | 线上结果 | 页面实现 | 事实判断 |
|---|---:|---|---|
| `/` | 200 | Next.js | 首页正常，含 2 个 JSON-LD；HTML 抽样未检测到 `adsbygoogle` 标记 |
| `/175-c-to-f.html` | 200 | 旧静态 HTML | canonical 保持 `.html`；含 2 个 JSON-LD；含 AdSense 标记；是当前高曝光页面 |
| `/175-c-to-f` | 404 | Next.js 404 | 不是可直接改造的对应新页面 |
| `/36-4-c-to-f` | 200 | Next.js | canonical 为无后缀；含 3 个 JSON-LD；标题转向体温场景 |
| `/36-4-c-to-f.html` | 301 | 迁移规则 | 已从 `.html` 迁移到无后缀页面 |
| `/celsius-to-fahrenheit-chart` | 200 | Next.js | 含 1 个 JSON-LD，当前 sitemap 有收录 |
| `/sitemap.xml` | 200 | 线上 XML | 约 63 个 URL，不包含 `175-c-to-f.html` |
| `/robots.txt` | 200 | 纯文本 | 允许根目录，声明 sitemap，屏蔽部分内部 Next 路径 |

这里最关键的矛盾是：GSC 数据中 `/175-c-to-f.html` 获得 17,811 impressions、平均位置约 12.62，但线上 sitemap 不包含该 URL。它并不必然导致页面不能排名，因为搜索引擎可以通过链接或历史索引发现页面；但它说明站点的“希望被发现的 URL 集合”和“实际获得搜索曝光的 URL 集合”并不一致。

## 四、代码、分析与广告审计

### 4.1 SEO 元数据实现

`components/Layout.tsx` 统一生成 title、description、robots、canonical、Open Graph、Twitter Card 和多语言 alternate links；默认 robots 为 `index, follow`。温度页组件和若干独立页面还直接生成 WebPage、FAQPage、Breadcrumb 和 HowTo JSON-LD。代码层面的优点是元数据和结构化数据意识较完整，缺点是不同页面架构并存，使“统一实现”在全站层面并不成立。

必须逐页面验证结构化数据与可见内容的一致性。代码里存在 FAQPage 和 HowTo 标记，只能证明标记被输出，不能证明搜索结果一定展示富结果；尤其是数值页大量模板化生成时，应防止 FAQ 问答重复、内容薄弱或标记与页面正文不完全一致。

### 4.2 GA4 实现

`_app.tsx` 对 Next.js 页面全局挂载 `Analytics`；`components/Analytics.tsx` 使用 `G-7KGQPN84Z6`，GA4 脚本采用 `lazyOnload` 加载。旧静态 HTML 页面中约 88 个包含 GA4 标识或 gtag 代码，因此不能简单断言旧页面完全没有 GA4。

但是，代码中目前没有发现明确的 `conversion_completed`、`copy_result`、`chart_download`、`related_page_click` 等业务事件绑定。GA4 目前主要能够回答“来了多少会话”，不能充分回答“用户是否完成转换、复制结果、下载图表或进入下一页”。这会削弱广告布局与用户体验实验的判断能力。

### 4.3 AdSense 实现

仓库中约 87 个页面、组件或静态文件包含 AdSense 相关代码，`Analytics` 会动态插入 `adsbygoogle.js?client=ca-pub-1199889942562451`。但线上抽样结果显示，175 静态页面 HTML 中检测到广告标记，而首页、36.4°C Next 页面和图表页的初始 HTML 未检测到 `adsbygoogle` 标记。由于广告可能由客户端动态加载，初始 HTML 不能代表浏览器最终是否展示广告；因此需要用真实浏览器按页面类型检查广告数量、位置、CLS、遮挡和误触风险。

当前未发现显式 `data-ad-slot` 的文本匹配，不能据此断定采用何种广告模式。建议把首页、静态数值页、Next 数值页、图表页和长文章页分开建立广告覆盖表，而不是把“通过审核”视为“全站广告实现已经完成”。

### 4.4 构建与工程验证

`scripts/generate-sitemap.js` 在代码副本中成功运行，生成 63 个 URL。`npm run lint` 失败，原因是当前脚本 `next lint` 在 Next.js 16.3.0 环境中被解析为不存在的项目目录 `lint`，说明 lint 命令需要迁移到 ESLint CLI 或新的 Next.js 兼容方式。`npm run build` 已完成 TypeScript 检查和优化编译，但在收集页面数据阶段被系统以状态 143 中断；因此不能声称当前生产构建已完整通过。构建流程还需要在内存更充足的环境中重新验证。

## 五、数据分析的修订解释

GA4 上传数据实际覆盖 2025-09-20 至 2026-08-18 的 306 个有数据日期。总计 sessions 7,869，其中 Organic Search 5,277，占约 67.1%；Direct 2,437，占约 31.0%。Organic Search 平均停留约 101 秒、平均跳出率约 52.3%，明显优于 Direct 的约 31.5 秒和约 83.2%。这些结果支持“自然搜索用户更有明确需求”的方向性判断。

但月度数据显示 Organic Search 在 2025 年 10—12 月集中出现，2026 年 1 月后几乎归零；这与线上仍有可访问的搜索页面及 GSC 曝光数据不完全相称。因此，该曲线首先应被视为“测量或站点变更异常信号”，而不是自然流量真实下降的确定证据。

GSC query+page 文件共 14,247 个 unique queries、357 个 unique pages，合计 179,532 impressions、7 clicks，加权平均位置约 49.93。高价值机会区间是位置 4—20：查询层面约 31,715 impressions，页面层面约 22,904 impressions。高曝光机会包括 `/175-c-to-f.html`、`/36-4-c-to-f`、`/48-c-to-f.html`、`/36-9-c-to-f.html` 和 `230c to f` 等。

这里必须修订上一版的具体建议：对 `/175-c-to-f.html` 不应直接建议改造无后缀 `/175-c-to-f`，因为后者当前返回 404。正确选择只有两种：要么保留 `.html` 作为正式 URL，并把它纳入 sitemap、内部链接和持续发布流程；要么先创建并验证无后缀 Next 页面，再通过 301、canonical、sitemap 和内部链接完成一次可观测迁移。未经选择和验证，不应同时保留两套版本。

## 六、可靠的网站战略与定位

推荐定位保持为：**面向全球英语用户的温度单位转换与场景参考平台，帮助用户在烘焙、烹饪、天气、旅行、日常体温阅读和科学学习中快速得到准确的 Celsius/Fahrenheit 结果，并理解结果如何使用。**

但是，内容战略要建立在页面架构治理之后。第一优先级不是继续批量生产数值页，而是选定一个正式发布体系。第二优先级是将已有高曝光页面分为“烘焙/烤箱”“日常温度”“体温健康”“公式/图表/下载”四个集群，并按页面事实选择保留、合并、迁移或下线。第三优先级才是根据 GSC 新增日期数据扩展内容。

烘焙/烤箱是当前最适合商业扩展的集群，因为英国流量占 GA4 sessions 约 36.3%，美国约 22.7%，而线上首页和 175°C 页面已经明确使用 oven、baking、fan oven 等场景表达。体温页面可以带来搜索需求，但应提高来源、作者/审阅者、测量方式、适用范围和非诊断性说明，避免把温度转换页面包装成医疗诊断工具。

## 七、修订后的 SEO 执行路线

### 阶段一：URL 与测量治理，0—14 天

建立全站 URL 台账，至少包含 URL、实现类型、HTTP 状态、canonical、是否在 sitemap、是否有 GA4、是否有广告、页面主题、GSC impressions/clicks/position、处理决策。先处理 175、36.4、180、93°F、图表页、烤箱页和 PDF 等高价值 URL。

对每个 URL 选择唯一策略：保留旧 `.html`、迁移到无后缀、合并到 hub 或下线。若保留 `.html`，就应将其纳入 sitemap、模板更新和内部链接；若迁移，就必须先创建新页面，再验证 200、canonical、内容一致性、301 链、sitemap 和 GSC 重新收录。

同时重新导出 GSC 按 date/query/page/country/device 的数据，并核对 GA4 property、hostname、过滤器、Consent、页面路径和时间区间。新增 `conversion_completed`、`copy_result`、`chart_download`、`related_page_click` 等事件。

### 阶段二：高曝光页面改造，15—45 天

`/175-c-to-f.html` 是当前最优先页面，但改造前必须决定 URL 归属。页面已有正确首屏答案、公式、烘焙上下文和独立广告代码，优化重点应从“重新写一篇页面”转为：减少与其他模板的重复、补充真实有用的 oven/fan oven/air fryer 差异、改善内部链接、确保广告不靠近复制/输入/下载控件、优化移动端体验，并使其进入正式 sitemap/内容发布流程。

`/36-4-c-to-f` 已是 Next 页面，标题和内容明显转向“是否正常体温”的健康语境。该页面应增加清晰来源、测量方法边界、作者/审阅责任和非诊断声明；同时检查其 FAQ/HowTo/体温 JSON-LD 是否与正文完全对应。

`/48-c-to-f.html`、`/36-9-c-to-f.html` 和 `230c to f` 应根据最终 URL策略统一模板，首屏直接回答结果，再提供短公式、场景解释、邻近温度链接和反向转换入口。高曝光但低点击页面的标题/摘要应按组实验，不应全站同时改动。

### 阶段三：模板统一与主题集群，46—90 天

选择 Next.js 或静态 HTML 作为未来唯一主发布体系，建议长期统一到 Next.js，但不应在没有迁移台账、回滚方案和 GSC监测的情况下大规模迁移。迁移完成后，删除或隔离旧静态内容的重复入口，统一 canonical、hreflang、sitemap、GA4、AdSense 和组件更新。

建立 Oven & Baking hub，连接 160、170、175、180、200、230°C 与 fan oven、gas mark、air fryer 页面；建立 Reference hub，连接转换器、公式、完整图表和 PDF；对体温集群单独治理内容质量和来源。每个新增页面必须有独立用户任务和增量价值，不应仅替换数字生成相同正文。

## 八、广告变现策略修订

广告收入优化要以后端测量和页面体系为前提。首页、旧静态数值页、Next 数值页和图表页目前的广告实现并不一致，所以第一步应建立广告覆盖基线：页面类型、设备、国家、广告数量、viewability、page RPM、CLS、LCP、转化完成率和退出率。

首屏转换答案、输入框、结果区、复制按钮、下载按钮和导航附近不应放置容易误触的广告。建议先使用保守布局：结果之后一个广告位，长内容中部一个广告位，页底可选一个广告位；连续 28 天观察收益与用户体验，再逐类测试。Google AdSense 官方要求广告不得诱导误点、不得伪装成导航或下载链接、不得使用误导性标题或弹窗等实现。[1](https://support.google.com/adsense/answer/1346295?hl=en)

特别要避免一个常见误区：175 静态页虽然检测到广告标记，不代表广告收入已经最大化；首页和 Next 页面初始 HTML 未检测到广告，也不代表浏览器最终一定没有广告。只有用真实浏览器和 AdSense 报告验证，才能判断“广告代码存在”“广告实际填充”“广告被用户看到”“广告带来收入”之间的差异。

## 九、修订后的 90 天 To Do 优先级

| 优先级 | 任务 | 为什么现在做 | 验收标准 |
|---|---|---|---|
| P0 | 建立全站 URL 台账 | 混合架构导致迁移和统计无法直接推断 | 每个重点 URL 有唯一实现、canonical、sitemap和处置决定 |
| P0 | 决定 175 页面 URL | 当前 `.html` 返回 200，无后缀返回 404 | 保留或迁移二选一，不能两套并行 |
| P0 | 修复 sitemap 与真实重要页面的差异 | sitemap 63 URL 未含高曝光 175 页面 | 所有正式索引页面都在 sitemap，非正式页面有明确处理 |
| P0 | 补充 GSC 日期维度 | 当前 query+page 文件无法做月度趋势 | 获得按月、国家、设备和页面的同口径数据 |
| P0 | 解释 GA4 2026 年 1 月后的自然搜索断崖 | 可能影响所有增长判断 | 明确是数据、部署、Consent、属性或真实流量问题 |
| P1 | 统一 GA4 业务事件 | 当前主要只有会话层指标 | 可观察转换完成、复制、下载和相关推荐点击 |
| P1 | 审核结构化数据 | 多模板使用 FAQ/HowTo，存在一致性风险 | 重点页面 JSON-LD 与可见正文一一对应 |
| P1 | 统一广告实施 | 静态页和 Next 页覆盖不一致 | 每类页面有广告基线且无误触/遮挡问题 |
| P1 | 改造 175、36.4、48、36.9、230 页面 | 已有曝光，优先级高于批量新增 | 28—42 天后按同口径观察 CTR、位置、会话和互动 |
| P2 | 完成 Next.js 单一发布体系迁移 | 降低长期维护和 SEO 分裂成本 | 迁移页面 200、301、canonical、sitemap、GA4 和广告均通过核验 |
| P2 | 建立烘焙和参考图表主题集群 | 放大已有场景优势 | hub、内链和页面任务关系清晰，非模板化扩张 |

## 十、最终判断

在完整代码和线上事实加入之后，最可靠的判断不是“立即新增更多页面并挂更多广告”，而是：**网站当前最大的增长瓶颈是发布体系与数据体系的不一致，其次才是内容和广告优化。** 175°C 页面已经证明旧静态页面可以获得搜索曝光，36.4°C 页面证明 Next.js 迁移页面可以承载更深的场景内容；但两者目前并非同一发布系统，不能用单一模板或单一 SEO 假设处理。

因此，未来 90 天的成功标准应分为两层。第一层是事实层：URL、canonical、sitemap、GA4、GSC、广告覆盖和构建流程全部可验证；第二层才是增长层：重点页面 CTR、Google clicks、自然会话、转换完成率、相关页面点击和 page RPM 稳定上升。只有第一层完成，第二层的数据才足够可靠，广告收益优化才不会建立在错误的流量判断上。

## References

[1]: https://support.google.com/adsense/answer/1346295?hl=en "Google AdSense Help: Ad placement policies"

[2]: https://developers.google.com/search/docs/fundamentals/seo-starter-guide "Google Search Central: SEO Starter Guide"

[3]: https://developers.google.com/search/docs/fundamentals/creating-helpful-content "Google Search Central: Creating helpful, reliable, people-first content"

[4]: https://ctofconverter.com/ "CtoFConverter homepage"

[5]: https://ctofconverter.com/175-c-to-f.html "CtoFConverter 175°C static page"

[6]: https://ctofconverter.com/36-4-c-to-f "CtoFConverter 36.4°C page"
