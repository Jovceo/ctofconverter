# SEO Migration Plan

更新时间：2026-03-12

## 目标

把现有仍由 `public/*.html` 直接提供的页面迁移到 Next.js，同时尽量减少 Google 收录、排名和 canonical 信号波动。

这份计划基于两类信息：

- 当前仓库真实状态
- Google Search Central 官方文档

本计划的核心不是“尽快把页面改成 React”，而是“让 Google 尽快、稳定地把旧 `.html` URL 信号转移到新的 canonical URL”。

## 当前仓库状态

截至当前代码库，未迁移的静态 HTML 共 68 个：

- 58 个 `C -> F` 温度页
- 8 个 `F -> C` 详情页
- 1 个 `404.html`
- 1 个备份文件 `public/fahrenheit-to-celsius/index - 副本.html`

现有 SEO 基础设施已经具备：

- `next.config.js` 中已有“仅对已迁移路由生效”的 `.html -> 无扩展名` redirect
- `config/migrated-routes.json` 已作为迁移白名单
- `components/Layout.tsx` 已输出 canonical 和 `hreflang`
- `components/TemperaturePage.tsx` 已为温度页生成 alternates
- `scripts/generate-sitemap.js` 已生成包含 `hreflang` 的 sitemap

因此，当前最重要的问题不是“SEO 能不能做”，而是“按什么节奏迁移，才能减少信号分裂”。

## Google 导向的迁移原则

以下原则来自 Google Search Central 官方文档，并结合本仓库规模做了落地化取舍：

- 先做短试点，再做大批量主迁移，不要长时间零散迁移
- 一次只改一类变量：本轮只做 URL/模板迁移，不同时重写信息架构、标题体系、导航逻辑
- 旧 URL 必须直接 301/308 到最终新 URL，不能链式跳转
- canonical、站内链接、sitemap、`hreflang` 必须在同一次发布中一起切换
- 多语言页面必须继续使用独立 URL，不能按浏览器语言自动改写内容或强制跳转
- sitemap 只提交新 canonical URL，不再提交旧 `.html` URL
- 旧重定向至少保留 12 个月

这里有一个关键判断：

Google 对大型站点建议“可以先迁一个小区块做测试，然后把剩余部分一次迁完或按块迁移”。对这个仓库来说，剩余页面量不算大，但模板重复度高，所以最合适的策略是：

- 先用 1 个低风险试点批次验证流程
- 试点稳定后，把剩余 `C -> F` 页面集中迁完
- 最后单独迁移 `F -> C` 详情页和遗留特殊文件

这比“每天迁 1 页、持续 2 个月”更利于 Google 快速理解站点迁移关系，也更容易保持 canonical 信号一致。

## 推荐迁移节奏

### 阶段 0：准备期

建议时长：2 到 3 天

目标：

- 固化旧 URL 到新 URL 的映射表
- 固化批次清单
- 确保每个待迁移页面都有对应的 Next.js 页面、语言文件和 redirect 白名单更新点

必须完成的事项：

- 生成剩余静态页清单并冻结
- 补一个迁移脚手架，至少自动化以下动作：
  - 生成 `pages/[slug].tsx`
  - 复制或生成 `locales/*/[slug].json`
  - 更新 `config/migrated-routes.json`
- 明确每个页面的参考模板，不在迁移过程中临时决定
- 在本地验证以下四类信号：
  - 旧 `.html` 可访问
  - 新 Next 页可访问
  - redirect 生效后直达最终 URL
  - sitemap 只输出 canonical URL

准备期不建议做的事：

- 不改整站导航结构
- 不改语言路由策略
- 不大规模重写文案
- 不删除旧静态 HTML 文件

## 阶段 1：试点批次

建议时长：开发 1 到 2 天，观察 7 到 10 天

目标：

- 验证迁移流程，而不是追求流量最大化
- 用低风险模板验证 redirect、canonical、`hreflang`、sitemap、GSC 反馈是否稳定

推荐试点页面：

- `/21-c-to-f.html`
- `/22-c-to-f.html`
- `/23-c-to-f.html`
- `/24-c-to-f.html`
- `/25-c-to-f.html`
- `/26-c-to-f.html`

选择原因：

- 都属于天气/室温类，语义相近
- 不涉及发热、医疗风险提示
- 不依赖烤箱/烹饪等另一套内容模板
- 便于用同一模板批量验证

试点上线时必须同时完成：

- 新 URL 上线并返回 200
- 旧 `.html` 直达 301/308 到新 URL
- 新页输出自指 canonical
- 新页输出完整 `hreflang` 和 `x-default`
- 站内链接改到新 URL
- sitemap 更新为新 canonical URL
- Search Console 重新提交 sitemap

试点观察窗口重点检查：

- URL Inspection 中 Google-selected canonical 是否等于声明的 canonical
- 覆盖率里是否出现大量 soft 404
- 是否出现 “Alternate page with proper canonical tag” 异常增多
- 旧 URL 是否被持续抓取但能稳定跳转
- 新 URL 是否开始进入索引

如果试点异常，优先回滚 redirect 白名单，而不是删除新页面文件。

## 阶段 2：主迁移批次

建议时长：开发 3 到 5 天，集中发布 1 次

目标：

- 试点验证通过后，将剩余 `C -> F` 页面集中迁移
- 从 Google 视角看，这一批应该尽量像一次明确的 URL 迁移，而不是长期混合旧新形态

这一批建议一次发布完成的页面共有 52 个。

### 2.1 体温与发热类

20 个：

- `/35-c-to-f.html`
- `/36-2-c-to-f.html`
- `/36-7-c-to-f.html`
- `/36-8-c-to-f.html`
- `/36-9-c-to-f.html`
- `/37-1-c-to-f.html`
- `/37-3-c-to-f.html`
- `/37-4-c-to-f.html`
- `/37-6-c-to-f.html`
- `/37-7-c-to-f.html`
- `/38-1-c-to-f.html`
- `/38-2-c-to-f.html`
- `/38-4-c-to-f.html`
- `/38-5-c-to-f.html`
- `/42-c-to-f.html`
- `/43-c-to-f.html`
- `/44-c-to-f.html`
- `/45-c-to-f.html`
- `/46-c-to-f.html`
- `/48-c-to-f.html`

策略要求：

- 继续沿用已迁移体温页的模板族
- 保持 title、description、H1 与原静态页语义一致
- 医疗类页面不要在迁移同一批里同时大改 FAQ 结构

### 2.2 烹饪与烤箱类

10 个：

- `/105-c-to-f.html`
- `/120-c-to-f.html`
- `/150-c-to-f.html`
- `/170-c-to-f.html`
- `/175-c-to-f.html`
- `/190-c-to-f.html`
- `/210-c-to-f.html`
- `/220-c-to-f.html`
- `/230-c-to-f.html`
- `/250-c-to-f.html`

策略要求：

- 统一以现有 `180-c-to-f` / `200-c-to-f` 模板族迁移
- 不在迁移时顺手改整套烤箱内容布局
- 结构化数据、FAQ 和内部推荐链接保持一致模式

### 2.3 天气与室温类

剩余 17 个：

- `/1-c-to-f.html`
- `/10-c-to-f.html`
- `/12-c-to-f.html`
- `/13-c-to-f.html`
- `/14-c-to-f.html`
- `/15-c-to-f.html`
- `/16-c-to-f.html`
- `/17-c-to-f.html`
- `/18-c-to-f.html`
- `/19-c-to-f.html`
- `/27-c-to-f.html`
- `/28-c-to-f.html`
- `/29-c-to-f.html`
- `/30-c-to-f.html`
- `/31-c-to-f.html`
- `/32-c-to-f.html`
- `/33-c-to-f.html`

策略要求：

- 这一组不建议再拆成很多小发布
- 可以内部按“偏冷”和“舒适/偏热”做 QA，但生产发布最好同一批完成

### 2.4 其他通用温度页

5 个：

- `/60-c-to-f.html`
- `/73-c-to-f.html`
- `/74-c-to-f.html`
- `/76-c-to-f.html`
- `/90-c-to-f.html`

策略要求：

- 统一沿用现有通用模板
- 如没有明显垂类语义，不要强行添加不稳定的内容模块

## 阶段 3：F -> C 详情页单独迁移

建议时长：开发 2 到 3 天，集中发布 1 次

8 个：

- `/fahrenheit-to-celsius/36-f-to-c.html`
- `/fahrenheit-to-celsius/39-f-to-c.html`
- `/fahrenheit-to-celsius/100-f-to-c.html`
- `/fahrenheit-to-celsius/102-f-to-c.html`
- `/fahrenheit-to-celsius/103-f-to-c.html`
- `/fahrenheit-to-celsius/105-f-to-c.html`
- `/fahrenheit-to-celsius/110-f-to-c.html`
- `/fahrenheit-to-celsius/190-f-to-c.html`

这一批单独做的原因：

- URL 结构不同
- 当前只有索引页 `pages/fahrenheit-to-celsius.tsx`，没有详情页模板批量产出
- 如果和 `C -> F` 主迁移混在同一次发布，会增加排查成本

SEO 目标仍然一致：

- 旧详情 `.html` URL 直达新详情 URL
- 新详情页输出自指 canonical
- 新详情页进入 sitemap
- 站内从索引页和相关推荐链接到新详情 URL

## 阶段 4：遗留文件收尾

最后处理：

- `public/404.html`
- `public/fahrenheit-to-celsius/index - 副本.html`

建议处理方式：

- `404.html` 保持 Next 的 `pages/404.tsx` 为唯一主实现
- 如果旧 `404.html` 仍需兼容访问，允许保留，但不需要进入 sitemap
- 备份文件不应参与迁移，应从版本库清理或明确忽略

## 每次发布必须一起完成的事项

无论哪个批次，每次上线都必须把下面几件事一起完成：

- 代码上线
- `config/migrated-routes.json` 更新
- `.html` redirect 生效
- 站内链接改为新 URL
- sitemap 重新生成
- `robots.txt` 中 sitemap 声明保持正确
- Search Console 重新提交 sitemap

如果只上线页面、不同时切 redirect 或 sitemap，Google 会同时看到旧新两套入口，canonical 信号会变弱。

## 页面级验收标准

每个迁移页面至少满足以下检查项：

- 旧 URL 返回 `301` 或 `308`
- 旧 URL 只跳一次，直接到最终新 URL
- 新 URL 返回 `200`
- 新 URL 的 canonical 指向自己
- `hreflang` 指向对应语言的新 URL
- `x-default` 存在且稳定
- title、meta description、H1 与原静态页主题一致
- 主要正文没有明显缩水
- 结构化数据合法
- 新 URL 出现在 sitemap 中，旧 `.html` URL 不再出现在 sitemap 中
- 站内不再继续链接旧 `.html` URL

## 回滚策略

这个仓库的一个优势是：旧静态 HTML 还保留在 `public/` 中，因此可以做低风险回滚。

推荐回滚方式：

- 从 `config/migrated-routes.json` 中移除本批次路由
- 重新部署
- 让请求重新落回旧静态 `.html`

不推荐的回滚方式：

- 直接删除新页面文件
- 临时把新页面改 `noindex`
- 把大量旧 URL 都跳到首页

说明：

- Google 明确不建议把不相关旧 URL 全部重定向到首页，这容易被当作 soft 404
- canonical 问题不要用 `noindex` 解决，优先用 redirect 和稳定 canonical

## 发布后监控计划

### 上线当天

- 抽样检查每批至少 10 个旧 URL 的 redirect
- 抽样检查每批至少 10 个新 URL 的 canonical 和 `hreflang`
- 提交 sitemap
- 用 URL Inspection 请求抓取核心新 URL

### 上线后第 3 天

- 看 Search Console 覆盖率和页面索引
- 看是否出现大量 soft 404
- 看 canonical 是否被 Google 改判

### 上线后第 7 到 10 天

- 复查试点批次或主批次核心页的索引状态
- 对比旧 URL 抓取量是否下降、新 URL 展示是否开始接管

### 上线后第 14 到 28 天

- 检查迁移批次在性能报告中的点击和展示是否逐步转移
- 如果没有明显异常，不再继续拆小回滚

## 仓库内建议的实施顺序

1. 新增迁移脚手架，减少手工复制 `pages/` 和 `locales/`
2. 完成阶段 1 试点的 6 个页面
3. 观察 7 到 10 天
4. 一次性发布剩余 52 个 `C -> F` 页面
5. 单独发布 8 个 `F -> C` 详情页
6. 清理 `404.html` 和备份文件

## 不建议采用的迁移方式

- 每天迁 1 页，持续数周甚至数月
- 一边迁 URL，一边大改文案、模板和站内导航
- 先上新页，几天后再补 redirect
- sitemap 同时保留旧 `.html` 和新 URL
- 按浏览器语言自动把用户和 Googlebot 强制导向某个语言版本
- 把所有失败页面或旧 URL 一律重定向到首页

## 与当前代码的对应关系

现有实现中，以下文件是本计划的关键落点：

- `next.config.js`
- `config/migrated-routes.json`
- `components/Layout.tsx`
- `components/TemperaturePage.tsx`
- `scripts/generate-sitemap.js`
- `utils/serverHelpers.ts`

如果后续新增批量生成脚本，建议单独放在 `scripts/` 下，不要把迁移逻辑分散到多个页面文件里。

## 官方参考

以下是写这份计划时参考的 Google 官方文档：

- Site move with URL changes:
  https://developers.google.com/search/docs/crawling-indexing/site-move-with-url-changes
- Canonicalization:
  https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls
- Multilingual and multi-regional sites:
  https://developers.google.com/search/docs/specialty/international/managing-multi-regional-sites
- Locale-adaptive pages:
  https://developers.google.com/search/docs/specialty/international/locale-adaptive-pages
- Sitemaps:
  https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap

## 结论

对这个仓库来说，最优的 SEO 迁移计划不是“慢慢迁”，而是：

- 先做一个短试点
- 试点通过后集中完成剩余 `C -> F`
- 再单独处理 `F -> C` 详情页
- 全程保持 redirect、canonical、`hreflang`、sitemap、站内链接同步切换

这是当前最接近 Google 官方建议、同时又符合本仓库现状的执行方式。
