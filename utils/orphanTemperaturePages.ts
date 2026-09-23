/**
 * 孤儿旧 HTML 页面注册表
 *
 * 背景：public/ 下有 34 个"被漏迁"的精做旧 HTML 页（.html 后缀）——
 * 它们 200 在线、canonical 自指、robots 为 index,follow，有表格 / FAQ / JSON-LD / 场景化 title，
 * 但不在 pages/（无 Next 版本）、不在 sitemap、无任何入链，构成一个与主站隔离的自闭合子图。
 *
 * 实测（2026-09-23）：崩前池周均展示 3,128，占全站展示 32.1%（仅 2 次点击）；
 * 单页王 175-c-to-f.html = 17,811 展示（全站 12.8%）、pos 12.6、0 点击。
 * 崩后（2026-05 起）全部归零。
 *
 * 本文件的作用：让这些页面进入 related 内链体系（原逻辑只扫 pages/，所以它们永远拿不到入链）。
 * ⚠️ 必须与 public/*.html 的实际情况一致 —— scripts/generate-sitemap.js 会在构建时校验并告警。
 */

/** 孤儿的 slug（不含 .html 后缀），顺序与温度值一致 */
export const ORPHAN_C_TO_F_SLUGS: readonly string[] = [
  // 整数温度
  '42-c-to-f',
  '43-c-to-f',
  '44-c-to-f',
  '45-c-to-f',
  '46-c-to-f',
  '48-c-to-f',
  '60-c-to-f',
  '73-c-to-f',
  '74-c-to-f',
  '76-c-to-f',
  '90-c-to-f',
  '105-c-to-f',
  '120-c-to-f',
  '150-c-to-f',
  '170-c-to-f',
  '175-c-to-f',
  '190-c-to-f',
  '210-c-to-f',
  '220-c-to-f',
  '230-c-to-f',
  '250-c-to-f',
  // 体温
  '36-2-c-to-f',
  '36-7-c-to-f',
  '36-8-c-to-f',
  '36-9-c-to-f',
  '37-1-c-to-f',
  '37-3-c-to-f',
  '37-4-c-to-f',
  '37-6-c-to-f',
  '37-7-c-to-f',
  '38-1-c-to-f',
  '38-2-c-to-f',
  '38-4-c-to-f',
  '38-5-c-to-f',
];

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
