import { DEFAULT_LOCALE, HREFLANG_MAP, SUPPORTED_LOCALES, getLocalizedLink } from './i18n';

export const SITE_ORIGIN = 'https://ctofconverter.com';

export function getLocalizedAbsoluteUrl(path: string, locale: string = DEFAULT_LOCALE): string {
  return `${SITE_ORIGIN}${getLocalizedLink(path, locale || DEFAULT_LOCALE)}`;
}

export function getXDefaultAbsoluteUrl(path: string): string {
  return getLocalizedAbsoluteUrl(path, DEFAULT_LOCALE);
}

export function getAlternateUrls(path: string) {
  return SUPPORTED_LOCALES.map((locale) => ({
    locale,
    href: getLocalizedAbsoluteUrl(path, locale),
    hreflang: HREFLANG_MAP[locale] || locale,
  }));
}
