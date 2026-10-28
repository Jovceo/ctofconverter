/**
 * 孤儿旧 HTML 页面注册表
 *
 * 背景：public/ 下曾有 34 个"被漏迁"的精做旧 HTML 页（.html 后缀）——
 * 它们 200 在线、canonical 自指、robots 为 index,follow，有表格 / FAQ / JSON-LD / 场景化 title，
 * 但不在 pages/（无 Next 版本）、不在 sitemap、无任何入链，构成一个与主站隔离的自闭合子图。
 *
 * 演进：
 * - 2026-10-14：175-c-to-f 迁移；C 档 13 页 + A 档 3 页转 301 → 剩 17 个孤儿。
 * - 2026-10-28：**剩余 17 个全部转 301**（见 config/migrated-routes.json 的 htmlRedirects），
 *   注册表清空。理由：意图审计显示这 17 页场景需求 0–13.5%（纯换算），无信息增益空间；
 *   而 GSC 抓取日志（2026-07-30→10-25）显示 Google 仍在反复抓这些薄页（均 876 词），
 *   持续刷新「本站有大量只改数字的薄页」这一画像。301 到对应 hub 是零写作的减薄动作。
 *
 * 实测（2026-09-23）：崩前池周均展示 3,128，占全站展示 32.1%（仅 2 次点击）；
 * 单页王 175-c-to-f.html = 17,811 展示（全站 12.8%）、pos 12.6、0 点击（已迁移，不再孤儿）。
 * 崩后（2026-05 起）全部归零。
 *
 * 本文件的作用：让孤儿页进入 related 内链体系（原逻辑只扫 pages/，所以它们永远拿不到入链）。
 * ⚠️ 必须与 public/*.html 的实际情况一致 —— scripts/generate-sitemap.js 会在构建时校验并告警。
 * 现在列表为空：所有孤儿页均已 301，不应再产生指向 `.html` 的内链。
 */

/** 孤儿的 slug（不含 .html 后缀），顺序与温度值一致。2026-10-28 起为空 */
export const ORPHAN_C_TO_F_SLUGS: readonly string[] = [];

/** 对应的摄氏度数值，用于与 availablePages（number[]）比较 */
export const ORPHAN_CELSIUS: ReadonlySet<number> = new Set(
  ORPHAN_C_TO_F_SLUGS.map((slug) =>
    parseFloat(slug.replace(/-c-to-f$/, '').replace('-', '.'))
  )
);

/** 该温度值是否只存在于 public/*.html（无 Next 版本） */
export function isOrphanCelsius(celsius: number): boolean {
  return ORPHAN_CELSIUS.has(celsius);
}

/**
 * 生成温度页的 href。
 *
 * 孤儿页保留 `.html` 后缀 —— 它们的历史信号全在 `.html` 这个 URL 上，改 URL 等于丢信号。
 * 其余温度页返回不带后缀的路径，交由 getLocalizedLink 加多语言前缀。
 */
export function cToFHref(celsius: number): string {
  const slug = `/${String(celsius).replace('.', '-')}-c-to-f`;
  return isOrphanCelsius(celsius) ? `${slug}.html` : slug;
}
