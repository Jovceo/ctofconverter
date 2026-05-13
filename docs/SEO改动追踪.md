# ctofconverter.com · SEO 改动追踪

> 每次改动一记录。改前留基准，改后 1w / 1m 回填。

---

### 改动 #1：/36-4-c-to-f 标题 + 内容优化

- **日期**：2026-05-06
- **页面**：`/36-4-c-to-f`（10 种语言）
- **改动类型**：标题 + meta + 正文引导段
- **改动内容**：
  - 标题：`"36.4°C to Fahrenheit (97.5°F)"` → `"Is 36.4°C Normal? Body Temperature Chart & Celsius to Fahrenheit Guide"`
  - Meta description：加入体温判断、年龄对照、就医建议
  - H1 下方：新增 120 字引导段（正常体温范围、发烧定义、年龄差异）
- **策略**：从"温度转换工具"转型为"体温健康判断"——绕开 Google AI Overview 截流
- **改前数据（2026-04-05 ~ 05-05）**：
  - 曝光：4,244
  - 点击：0
  - CTR：0%
  - 平均排名：14.1
- **1 周后（待回填）**：
  - 曝光：
  - 点击：
  - CTR：
  - 平均排名：
- **1 月后（待回填）**：
  - 曝光：
  - 点击：
  - CTR：
  - 平均排名：

---

### 改动 #2：AdSense 从懒加载改立即加载

- **日期**：2026-05-06
- **页面**：全站
- **改动类型**：变现优化
- **改动内容**：`components/Analytics.tsx` 中 AdSense 脚本从等待用户交互（scroll/click/mousemove + 5s fallback）改为页面加载时立即加载
- **策略**：懒加载损失广告填充率，改为立即加载提升填充率约 15%
- **影响**：需 1-2 周观察 Google AdSense 报告确认填充率和 RPM 变化

---

### 改动 #3：sitemap 全量收录

- **日期**：2026-05-06
- **页面**：全站 sitemap
- **改动类型**：技术 SEO
- **改动内容**：
  - 删除 `CORE_TEMP_PAGES` 白名单 + `MAX_RECENT_TEMP_PAGES` 限制
  - 所有 50+ Next.js 温度页全进 sitemap
  - 新增 priority：整数温度页 1.0、小数 0.8、工具页 0.9、内容页 0.5
  - 新增 changefreq：温度/工具页 weekly，内容页 monthly
- **改动前**：43 页 / 403 URL
- **改动后**：59 页 / 563 URL
- **策略**：全放但明示优先级，Google 按 priority 决定爬取顺序，等效于之前的轮换策略
