# SEO 友好的 HTML -> Next.js 迁移计划

更新时间：2026-04-06

## 目标

在不打乱 Google 已有收录和 canonical 信号的前提下，把仓库里还留在 `public/*.html` 的可迁移页面继续迁到 Next.js。

这份计划基于当前仓库真实状态，不是历史估算。

## 当前状态

- 已迁移到 Next.js 并进入 `config/migrated-routes.json` 的路由：`50` 个
- 仍未迁移的可迁移 `.html` 页面：`50` 个
- 不纳入本轮迁移的特殊静态文件：
  - `public/google4cefee41ce49f67b.html`
  - `public/yandex_d90a9227b76db4af.html`
  - `public/404.html`

说明：

- `404.html` 已有 [404.tsx](/e:/github/ctofconverter/pages/404.tsx) 对应页面，旧静态文件不作为 SEO 迁移重点。
- Google / Yandex 验证文件建议继续保留静态文件，不迁移。

## 仍未迁移的页面

### 1. 室温 / 天气类 C -> F 页面

这批和已经成功迁移的 `10 / 18 / 20-35` 属于同一内容带，模板最稳定，最适合优先做。

- `1-c-to-f`
- `12-c-to-f`
- `13-c-to-f`
- `14-c-to-f`
- `15-c-to-f`
- `16-c-to-f`
- `17-c-to-f`
- `19-c-to-f`

### 2. 烤箱 / 烹饪类 C -> F 页面

这批是一套独立模板，搜索意图明确，但内容和室温页不同，建议单独批次推进。

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

### 3. 体温 / 发烧边界类 C -> F 页面

这批搜索价值高，但需要更谨慎，FAQ 和免责声明质量要求也更高。

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

### 4. 极端高温 / 其他 C -> F 页面

这批不是第一优先级，但适合在体温和烹饪模板跑顺后统一迁移。

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

### 5. F -> C 详情页

这批应放在 C -> F 主干页面之后迁移，避免同时维护两条主线。

- `fahrenheit-to-celsius/36-f-to-c`
- `fahrenheit-to-celsius/39-f-to-c`
- `fahrenheit-to-celsius/100-f-to-c`
- `fahrenheit-to-celsius/102-f-to-c`
- `fahrenheit-to-celsius/103-f-to-c`
- `fahrenheit-to-celsius/105-f-to-c`
- `fahrenheit-to-celsius/110-f-to-c`
- `fahrenheit-to-celsius/190-f-to-c`

## 推荐迁移顺序

### 阶段 A：先发已准备好的页面

如果当前分支还没发布，先发布已经准备好的：

- `10-c-to-f`
- `18-c-to-f`
- `34-c-to-f`

原因：

- 这三页的内容、多语言、301 白名单和站内链接已经收口
- 它们和已迁移页面模板一致
- 发出去后能继续验证当前迁移链路稳定性

### 阶段 B：室温带补齐

建议拆成两个小批次：

批次 B1：

- `12-c-to-f`
- `13-c-to-f`
- `14-c-to-f`
- `15-c-to-f`

批次 B2：

- `16-c-to-f`
- `17-c-to-f`
- `19-c-to-f`
- `1-c-to-f`

原因：

- 与 `10 / 18 / 20-35` 一起形成更连续的天气 / 室温区间
- 模板成熟，迁移风险最低
- 内链、related links、首页 recent updates 都更容易形成闭环

### 阶段 C：体温边界页

建议拆成三批，每批 4 到 5 页：

批次 C1：正常体温带

- `36-2-c-to-f`
- `36-7-c-to-f`
- `36-8-c-to-f`
- `36-9-c-to-f`

批次 C2：体温上沿

- `37-1-c-to-f`
- `37-3-c-to-f`
- `37-4-c-to-f`

批次 C3：低烧 / 发烧边界

- `37-6-c-to-f`
- `37-7-c-to-f`
- `38-1-c-to-f`
- `38-2-c-to-f`
- `38-4-c-to-f`
- `38-5-c-to-f`

原因：

- 这批页对 FAQ、schema、术语一致性要求更高
- 需要严格避免“医学建议口吻过重”或事实不准
- 分批上线更利于观察 GSC 的索引与增强结果

### 阶段 D：烹饪 / 烤箱页

建议顺序：

批次 D1：

- `150-c-to-f`
- `170-c-to-f`
- `175-c-to-f`
- `190-c-to-f`

批次 D2：

- `210-c-to-f`
- `220-c-to-f`
- `230-c-to-f`
- `250-c-to-f`

批次 D3：

- `105-c-to-f`
- `120-c-to-f`

原因：

- 烤箱页是另一类搜索意图，适合独立观察
- `150-250°C` 是核心烹饪带，优先级高于 `105 / 120`

### 阶段 E：其余高温页

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

### 阶段 F：F -> C 详情页

- `fahrenheit-to-celsius/36-f-to-c`
- `fahrenheit-to-celsius/39-f-to-c`
- `fahrenheit-to-celsius/100-f-to-c`
- `fahrenheit-to-celsius/102-f-to-c`
- `fahrenheit-to-celsius/103-f-to-c`
- `fahrenheit-to-celsius/105-f-to-c`
- `fahrenheit-to-celsius/110-f-to-c`
- `fahrenheit-to-celsius/190-f-to-c`

## SEO 友好的发布节奏

### 1. 批次大小

- 已验证模板：每批 `4-6` 页
- 新模板或新主题：每批 `2-4` 页

### 2. 观察窗口

- 每次发布后观察 `5-7` 天再决定下一批
- 如果是全新模板，建议观察 `7-10` 天

### 3. 继续推进的条件

满足以下任意 2 条即可继续：

- 批次内至少一半页面进入“已收录”
- 其余页面至少进入“已发现 - 尚未编入索引”
- 旧 `.html` 页面在 GSC 中逐步变成“重定向页”或被排除
- 没有出现 `Duplicate without user-selected canonical`

### 4. 暂停条件

出现以下任意情况，先停下一批：

- 新页 canonical 被 Google 选成别的 URL
- 批次内大部分页面长期停在“已抓取 - 尚未编入索引”
- 页面内容出现明显重复或模板残留
- 旧 `.html` 仍被站内链接大量引用

## 每批发布前的必查项

每个待发页面都要满足：

- 新 URL 返回 `200`
- 旧 `.html` 单跳 `301` 到新 URL
- canonical 自指向新 URL
- `hreflang` 完整且可访问
- sitemap 已包含新 URL，不再提交旧 `.html`
- FAQ / Breadcrumb / WebPage schema 可解析
- 站内链接统一到正式 URL
- 不再链接到未迁移 `.html`
- locale JSON 无 BOM、无 trailing comma、能被严格 `JSON.parse`

## 每批发布后的观察项

建议在 GSC 跟踪：

- 新 URL：
  - 是否被发现
  - 是否抓取成功
  - 是否开始编入索引
- 旧 URL：
  - 是否识别为重定向页
- 增强结果：
  - FAQ
  - Breadcrumb

建议每批至少抽查：

- 英文主 URL `2` 个
- 中文 URL `1` 个
- 另一个主要语种 URL `1` 个

## 推荐的下一步执行顺序

如果按当前仓库状态继续推进，建议顺序是：

1. 发布已收口的 `10 / 18 / 34`
2. 准备并发布 `12 / 13 / 14 / 15`
3. 观察 `5-7` 天
4. 再推进 `16 / 17 / 19 / 1`
5. 室温带稳定后，再进入体温页和烹饪页

## 结论

当前最 SEO 友好的策略，不是“把剩下 50 页一次发完”，而是：

- 先完成室温 / 天气模板的连续区间
- 再迁体温模板
- 再迁烹饪模板
- 最后处理 F -> C 详情页

这样做的好处是：

- 模板连续，Google 更容易理解页面关系
- 内链和 related links 更容易一次统一
- 每批风险可控，出现问题也容易定位
- 不会把 GSC 的观察窗口搅乱
