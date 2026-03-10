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
  zh: 'zh-CN',
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
  if (locale === DEFAULT_LOCALE) {
    return path.startsWith('/') ? path : `/${path}`;
  }

  const cleanPath = path.startsWith('/') ? path.substring(1) : path;
  return `/${locale}/${cleanPath}`;
}

export function getDisplayLocale(locale: string): string {
  return DATE_LOCALE_MAP[locale] || 'en-US';
}
