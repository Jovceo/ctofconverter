# SEO 友好的 HTML -> Next.js 迁移计划

更新时间：2026-04-22

## 当前状态

- 已加入迁移白名单并走 Next.js 的页面：`58` 个
- 仍在 `public/*.html`、且尚未迁移到 Next.js 的页面：`34` 个
- 不纳入迁移统计的静态文件：
  - `public/404.html`
  - `public/google4cefee41ce49f67b.html`
  - `public/yandex_d90a9227b76db4af.html`

说明：

- 以上统计以 [config/migrated-routes.json](/e:/github/ctofconverter/config/migrated-routes.json) 和 `public/*.html` 的实时差集为准。
- 旧版计划 [SEO-MIGRATION-PLAN-2026-04-06.md](/e:/github/ctofconverter/docs/SEO-MIGRATION-PLAN-2026-04-06.md) 已经过期，且存在编码问题，不再作为执行基线。
- `1-c-to-f`、`16-c-to-f`、`17-c-to-f`、`19-c-to-f` 已完成 Next.js 迁移、多语言复核和旧 `.html` -> 新 URL 的 `301` 规则接入。
- 当前项目在 `npm run build` 前会自动执行 `scripts/generate-sitemap.js`，因此 sitemap 会随构建自动更新。

## 已完成页面记录

### 2026-04-22

- `1-c-to-f`
- `16-c-to-f`
- `17-c-to-f`
- `19-c-to-f`

完成说明：

- 已接入 Next.js 页面和多语言路由
- 已完成 `zh / es / hi / de / id / pt-br` 等语言内容复核与润色
- 已完成运行态检查：`title`、`H1`、`canonical`、`hreflang`、语言切换正常
- 已补旧 `.html` -> 新 URL 的 `301`
- 已通过 `npx tsc --noEmit` 和 `npm run build`

## 尚未迁移的页面清单

### A. 体温 / 发烧边界带

- `36-2-c-to-f`
- `36-7-c-to-f`
- `36-8-c-to-f`
- `36-9-c-to-f`
- `37-1-c-to-f`
- `37-3-c-to-f`
- `37-4-c-to-f`
- `37-6-c-to-f`
- `37-7-c-to-f`
- `38-1-c-to-f`
- `38-2-c-to-f`
- `38-4-c-to-f`
- `38-5-c-to-f`

### B. 烹饪 / 烤箱温度带

- `105-c-to-f`
- `120-c-to-f`
- `150-c-to-f`
- `170-c-to-f`
- `175-c-to-f`
- `190-c-to-f`
- `210-c-to-f`
- `220-c-to-f`
- `230-c-to-f`
- `250-c-to-f`

### C. 其他高温 / 工具型页面

- `42-c-to-f`
- `43-c-to-f`
- `44-c-to-f`
- `45-c-to-f`
- `46-c-to-f`
- `48-c-to-f`
- `60-c-to-f`
- `73-c-to-f`
- `74-c-to-f`
- `76-c-to-f`
- `90-c-to-f`

## 迁移优先级

### P1：体温 / 发烧边界页

推荐拆成 3 批：

批次 2A：

- `36-2-c-to-f`
- `36-7-c-to-f`
- `36-8-c-to-f`
- `36-9-c-to-f`

批次 2B：

- `37-1-c-to-f`
- `37-3-c-to-f`
- `37-4-c-to-f`

批次 2C：

- `37-6-c-to-f`
- `37-7-c-to-f`
- `38-1-c-to-f`
- `38-2-c-to-f`
- `38-4-c-to-f`
- `38-5-c-to-f`

原因：

- 这类页面搜索价值高，但内容准确性要求也最高。
- FAQ、schema、编辑说明、本地化表达都要更谨慎，适合小批量推进。
- 分批上线更利于观察 GSC 的收录、FAQ 增强结果和 canonical 选择。

### P2：烹饪 / 烤箱页

推荐顺序：

批次 3A：

- `150-c-to-f`
- `170-c-to-f`
- `175-c-to-f`
- `190-c-to-f`

批次 3B：

- `210-c-to-f`
- `220-c-to-f`
- `230-c-to-f`
- `250-c-to-f`

批次 3C：

- `105-c-to-f`
- `120-c-to-f`

原因：

- `150-250°C` 属于更典型的烤箱 / cooking 搜索带，优先级高于 `105 / 120`。
- 这是一套相对独立的模板，适合在体温页之后集中处理。

### P3：其他高温 / 工具型页

推荐最后处理：

- `42-c-to-f`
- `43-c-to-f`
- `44-c-to-f`
- `45-c-to-f`
- `46-c-to-f`
- `48-c-to-f`
- `60-c-to-f`
- `73-c-to-f`
- `74-c-to-f`
- `76-c-to-f`
- `90-c-to-f`

原因：

- 这批不如室温页、体温页、烤箱页那样形成稳定主题簇。
- 可以在前 3 类模板完全跑顺后，再作为补充批次推进。

## 推荐发布节奏

### 下一批

优先发布：

- `36-2-c-to-f`
- `36-7-c-to-f`
- `36-8-c-to-f`
- `36-9-c-to-f`

### 再下一批

如果上一批 GSC 表现正常，再发：

- `37-1-c-to-f`
- `37-3-c-to-f`
- `37-4-c-to-f`

### 每批大小

- 已验证过的体温模板：每批 `3-4` 页
- 新主题模板：每批 `3-4` 页

### 观察窗口

- 每批发布后观察 `5-7` 天
- 新主题模板首次发布，观察 `7-10` 天更稳

## 每批发布前检查清单

每个待发页面都应满足：

- 新 URL 返回 `200`
- 旧 `.html` 单跳 `301` 到新 URL
- canonical 自指向新 URL
- `hreflang` 完整且实际可访问
- FAQ / Breadcrumb / WebPage schema 正常
- 站内内链统一到正式 URL
- 不再链接到未迁移 `.html`
- locale JSON 无 BOM、无 trailing comma、可被严格 `JSON.parse`
- `npx tsc --noEmit` 通过
- `npm run build` 通过

## GSC 继续 / 暂停条件

### 可以继续下一批的信号

满足以下任意 2 条即可继续：

- 批次内至少一半页面进入“已收录”
- 其余页面进入“已发现 - 尚未编入索引”
- 旧 `.html` 在 GSC 中逐步变成“重定向页”
- 没有出现 `Duplicate without user-selected canonical`

### 应暂停并排查的信号

- 新页 canonical 被 Google 选成别的 URL
- 大量页面长期停留在“已抓取 - 尚未编入索引”
- 多语言页出现英文回退、乱码、FAQ 结构化数据异常
- 站内又出现 `.html` 内链回流到已迁移页

## 建议执行顺序

1. `1 / 16 / 17 / 19` 已迁移，先观察线上 `301`、canonical、GSC 状态
2. 继续发布体温边界页 `36.2 / 36.7 / 36.8 / 36.9`
3. 观察 `5-7` 天
4. 再发布 `37.1 / 37.3 / 37.4`
5. 稳定后进入烤箱页 `150 / 170 / 175 / 190`

## 结论

截至 2026-04-22，还剩 `34` 个页面未迁移到 Next.js。

最稳的路线不是一次性清完，而是继续沿用已经验证有效的小批量节奏：

- 先观察刚完成的室温 / 天气体感带这批迁移表现
- 再做体温 / 发烧边界带
- 然后集中推进烹饪 / 烤箱页

这样最有利于保持收录稳定、canonical 清晰和多语言质量可控。
