export type Locale = 'en' | 'zh' | 'es' | 'hi' | 'ar' | 'ja' | 'fr' | 'de' | 'id' | 'pt-br';

export const SUPPORTED_LOCALES: Locale[] = ['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'];
export const DEFAULT_LOCALE: Locale = 'en';

export const DATE_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es-ES',
  hi: 'hi-IN',
  ar: 'ar-SA',
  ja: 'ja-JP',
  id: 'id-ID',
  'pt-br': 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
};

export const HREFLANG_MAP: Record<string, string> = {
  en: 'en',
  zh: 'zh-Hans',
  es: 'es',
  hi: 'hi',
  ar: 'ar',
  ja: 'ja',
  id: 'id',
  'pt-br': 'pt-BR',
  fr: 'fr',
  de: 'de',
};

export function getLocalizedLink(path: string, locale: string): string {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;

  if (locale === DEFAULT_LOCALE) {
    return normalizedPath;
  }

  if (normalizedPath === '/') {
    return `/${locale}`;
  }

  return `/${locale}${normalizedPath}`;
}

export function getDisplayLocale(locale: string): string {
  return DATE_LOCALE_MAP[locale] || 'en-US';
}

/**
 * 索引策略（2026-08-27 起，红线）：只有默认语言（en）允许被索引。
 *
 * 背景：2026-04-22 批量上线多语言后，Google 于 4-26/27 将整站展示从日均数百挨到接近 0，
 * 至 2026-08-27 仍未恢复：sitemap `submitted 62 / indexed 0`，定向抽检 40 个 URL 中 33 个
 * 「已抓取 - 尚未编入索引」。可索引 URL 里约 87% 是非英语机器翻译副本（约 420 : 62）。
 * 8-20 的「保留不删、被动衰减」执行 4 个月无效，因此改为主动收口：
 * 非 en 页面继续 200 可访问、保留内链（follow），但强制 noindex。
 *
 * 不要把这个函数改回恒定 'index, follow'，也不要在页面里硬编码 robots meta 绕过它。
 */
export function getRobotsDirective(locale?: string): string {
  return isIndexableLocale(locale) ? 'index, follow' : 'noindex, follow';
}

/** 该 locale 是否允许被搜索引擎索引（只有默认语言 en 可以）。 */
export function isIndexableLocale(locale?: string): boolean {
  return !locale || locale === DEFAULT_LOCALE;
}
