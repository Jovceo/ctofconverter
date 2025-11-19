/**
 * 多语言工具函数
 */

import { useRouter } from 'next/router';
import commonEn from '../locales/en/common.json';
import commonZh from '../locales/zh/common.json';
import commonEs from '../locales/es/common.json';
import commonHi from '../locales/hi/common.json';
import commonId from '../locales/id/common.json';
import commonPtBr from '../locales/pt-br/common.json';

// 支持的语言
export type Locale = 'en' | 'zh' | 'es' | 'hi' | 'id' | 'pt-br' | 'fr' | 'de';
export const SUPPORTED_LOCALES: Locale[] = ['en', 'zh', 'es', 'hi', 'id', 'pt-br', 'fr', 'de'];
export const DEFAULT_LOCALE: Locale = 'en';

export const DATE_LOCALE_MAP: Record<string, string> = {
  en: 'en-US',
  zh: 'zh-CN',
  es: 'es-ES',
  hi: 'hi-IN',
  id: 'id-ID',
  'pt-br': 'pt-BR',
  fr: 'fr-FR',
  de: 'de-DE',
};

export const COMMON_TRANSLATIONS: Record<Locale, typeof commonEn> = {
  en: commonEn,
  zh: commonZh,
  es: commonEs,
  hi: commonHi,
  id: commonId,
  'pt-br': commonPtBr,
  fr: commonEn,
  de: commonEn,
};

export const HREFLANG_MAP: Record<Locale, string> = {
  en: 'en',
  zh: 'zh-CN',
  es: 'es',
  hi: 'hi',
  id: 'id',
  'pt-br': 'pt-BR',
  fr: 'fr',
  de: 'de',
};

const PAGE_TRANSLATIONS: Record<Locale, Record<string, any>> = {
  en: {
    '47-c-to-f': require('../locales/en/47-c-to-f.json'),
    home: require('../locales/en/home.json'),
  },
  zh: {
    '47-c-to-f': require('../locales/zh/47-c-to-f.json'),
    home: require('../locales/zh/home.json'),
  },
  es: {
    '47-c-to-f': require('../locales/es/47-c-to-f.json'),
    home: require('../locales/es/home.json'),
  },
  hi: {
    '47-c-to-f': require('../locales/hi/47-c-to-f.json'),
    home: require('../locales/hi/home.json'),
  },
  id: {
    '47-c-to-f': require('../locales/id/47-c-to-f.json'),
    home: require('../locales/id/home.json'),
  },
  'pt-br': {
    '47-c-to-f': require('../locales/pt-br/47-c-to-f.json'),
    home: require('../locales/pt-br/home.json'),
  },
  fr: {},
  de: {},
};

const getLocalePageTranslation = (locale: Locale, page: string) => {
  const map = PAGE_TRANSLATIONS[locale];
  if (map && map[page]) {
    return map[page];
  }
  const fallback = PAGE_TRANSLATIONS.en[page];
  return fallback || null;
};

/**
 * 加载页面特定的翻译文件
 */
export async function loadPageTranslation(locale: Locale, page: string): Promise<any> {
  try {
    const translation = await import(`../locales/${locale}/${page}.json`);
    return translation.default;
  } catch (error) {
    console.warn(`Translation file not found: locales/${locale}/${page}.json`);
    return null;
  }
}

/**
 * 同步加载页面特定的翻译文件（用于 getStaticProps）
 */
export function getPageTranslation(locale: Locale, page: string): any {
  try {
    return getLocalePageTranslation(locale, page);
  } catch (error) {
    console.warn(`Translation file not found: locales/${locale}/${page}.json`);
    return null;
  }
}

/**
 * 获取通用翻译
 */
export function getCommonTranslation(locale: Locale): typeof commonEn {
  return COMMON_TRANSLATIONS[locale] || commonEn;
}

/**
 * 替换翻译文本中的占位符
 */
export function replacePlaceholders(
  text: string,
  replacements: Record<string, string | number>
): string {
  let result = text;
  Object.keys(replacements).forEach((key) => {
    const value = String(replacements[key]);
    result = result.replace(new RegExp(`\\{${key}\\}`, 'g'), value);
  });
  return result;
}

/**
 * Hook: 获取当前语言和翻译
 */
export function useTranslation(page?: string) {
  const router = useRouter();
  const { locale = 'en' } = router;
  const currentLocale = (locale as Locale) || 'en';

  // 获取通用翻译
  const common = getCommonTranslation(currentLocale);

  // 获取页面特定翻译
  let pageTranslation: any = null;
  if (page) {
    pageTranslation = getLocalePageTranslation(currentLocale, page);
  }

  return {
    locale: currentLocale,
    t: (key: string, replacements?: Record<string, string | number>) => {
      // 先尝试从页面翻译获取
      if (pageTranslation) {
        const keys = key.split('.');
        let value: any = pageTranslation;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            value = null;
            break;
          }
        }
        if (value) {
          const text = String(value);
          return replacements ? replacePlaceholders(text, replacements) : text;
        }
      }

      // 然后尝试从通用翻译获取
      const keys = key.split('.');
      let value: any = common;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          return key; // 如果找不到，返回key本身
        }
      }

      const text = String(value);
      return replacements ? replacePlaceholders(text, replacements) : text;
    },
    common,
    pageTranslation,
  };
}

export function getDisplayLocale(locale: string): string {
  return DATE_LOCALE_MAP[locale] || 'en-US';
}

