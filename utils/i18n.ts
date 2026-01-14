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
import commonFr from '../locales/fr/common.json';
import commonDe from '../locales/de/common.json';
import commonAr from '../locales/ar/common.json';
import commonJa from '../locales/ja/common.json';

// 支持的语言
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

export const COMMON_TRANSLATIONS: Record<string, any> = {
  en: commonEn,
  zh: commonZh,
  es: commonEs,
  hi: commonHi,
  ar: commonAr,
  ja: commonJa,
  id: commonId,
  'pt-br': commonPtBr,
  fr: commonFr,
  de: commonDe,
};

export const HREFLANG_MAP: Record<string, string> = {
  en: 'en',
  zh: 'zh',
  es: 'es',
  hi: 'hi',
  ar: 'ar',
  ja: 'ja',
  id: 'id',
  'pt-br': 'pt-BR',
  fr: 'fr',
  de: 'de',
};

const PAGE_TRANSLATIONS: Record<string, any> = {
  en: {
    '47-c-to-f': require('../locales/en/47-c-to-f.json'),
    '75-c-to-f': require('../locales/en/75-c-to-f.json'),
    '4-c-to-f': require('../locales/en/4-c-to-f.json'),
    home: require('../locales/en/home.json'),
    template: require('../locales/en/template.json'),
    'fan-oven-conversion-chart': require('../locales/en/fan-oven-conversion-chart.json'),
    '37-5-c-to-f': require('../locales/en/37-5-c-to-f.json'),
    '37-c-to-f': require('../locales/en/37-c-to-f.json'),
    '0-c-to-f': require('../locales/en/0-c-to-f.json'),
    'f-to-c': require('../locales/en/f-to-c.json'),
    game: require('../locales/en/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/en/body-temperature-chart-fever-guide.json'),
  },
  zh: {
    '47-c-to-f': require('../locales/zh/47-c-to-f.json'),
    '75-c-to-f': require('../locales/zh/75-c-to-f.json'),
    '4-c-to-f': require('../locales/zh/4-c-to-f.json'),
    home: require('../locales/zh/home.json'),
    template: require('../locales/zh/template.json'),
    'fan-oven-conversion-chart': require('../locales/zh/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/zh/37-c-to-f.json'),
    '0-c-to-f': require('../locales/zh/0-c-to-f.json'),
    'f-to-c': require('../locales/zh/f-to-c.json'),
    game: require('../locales/zh/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/zh/body-temperature-chart-fever-guide.json'),
  },
  es: {
    '47-c-to-f': require('../locales/es/47-c-to-f.json'),
    '75-c-to-f': require('../locales/es/75-c-to-f.json'),
    '4-c-to-f': require('../locales/es/4-c-to-f.json'),
    home: require('../locales/es/home.json'),
    template: require('../locales/es/template.json'),
    'fan-oven-conversion-chart': require('../locales/es/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/es/37-c-to-f.json'),
    '0-c-to-f': require('../locales/es/0-c-to-f.json'),
    'f-to-c': require('../locales/es/f-to-c.json'),
    game: require('../locales/es/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/es/body-temperature-chart-fever-guide.json'),
  },
  hi: {
    '47-c-to-f': require('../locales/hi/47-c-to-f.json'),
    '75-c-to-f': require('../locales/hi/75-c-to-f.json'),
    '4-c-to-f': require('../locales/hi/4-c-to-f.json'),
    home: require('../locales/hi/home.json'),
    template: require('../locales/hi/template.json'),
    'fan-oven-conversion-chart': require('../locales/hi/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/hi/37-c-to-f.json'),
    '0-c-to-f': require('../locales/hi/0-c-to-f.json'),
    'f-to-c': require('../locales/hi/f-to-c.json'),
    game: require('../locales/hi/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/hi/body-temperature-chart-fever-guide.json'),
  },
  ar: {
    '47-c-to-f': require('../locales/ar/47-c-to-f.json'),
    '75-c-to-f': require('../locales/ar/75-c-to-f.json'),
    '4-c-to-f': require('../locales/ar/4-c-to-f.json'),
    home: require('../locales/ar/home.json'),
    template: require('../locales/ar/template.json'),
    'fan-oven-conversion-chart': require('../locales/ar/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/ar/37-c-to-f.json'),
    '0-c-to-f': require('../locales/ar/0-c-to-f.json'),
    'f-to-c': require('../locales/ar/f-to-c.json'),
    game: require('../locales/ar/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/ar/body-temperature-chart-fever-guide.json'),
  },
  ja: {
    '47-c-to-f': require('../locales/ja/47-c-to-f.json'),
    '75-c-to-f': require('../locales/ja/75-c-to-f.json'),
    '4-c-to-f': require('../locales/ja/4-c-to-f.json'),
    home: require('../locales/ja/home.json'),
    template: require('../locales/ja/template.json'),
    'fan-oven-conversion-chart': require('../locales/ja/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/ja/37-c-to-f.json'),
    '0-c-to-f': require('../locales/ja/0-c-to-f.json'),
    'f-to-c': require('../locales/ja/f-to-c.json'),
    game: require('../locales/ja/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/ja/body-temperature-chart-fever-guide.json'),
  },
  id: {
    '47-c-to-f': require('../locales/id/47-c-to-f.json'),
    '75-c-to-f': require('../locales/id/75-c-to-f.json'),
    '4-c-to-f': require('../locales/id/4-c-to-f.json'),
    home: require('../locales/id/home.json'),
    template: require('../locales/id/template.json'),
    'fan-oven-conversion-chart': require('../locales/id/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/id/37-c-to-f.json'),
    '0-c-to-f': require('../locales/id/0-c-to-f.json'),
    'f-to-c': require('../locales/id/f-to-c.json'),
    game: require('../locales/id/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/id/body-temperature-chart-fever-guide.json'),
  },
  'pt-br': {
    '47-c-to-f': require('../locales/pt-br/47-c-to-f.json'),
    '75-c-to-f': require('../locales/pt-br/75-c-to-f.json'),
    '4-c-to-f': require('../locales/pt-br/4-c-to-f.json'),
    home: require('../locales/pt-br/home.json'),
    template: require('../locales/pt-br/template.json'),
    'fan-oven-conversion-chart': require('../locales/pt-br/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/pt-br/37-c-to-f.json'),
    '0-c-to-f': require('../locales/pt-br/0-c-to-f.json'),
    'f-to-c': require('../locales/pt-br/f-to-c.json'),
    game: require('../locales/pt-br/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/pt-br/body-temperature-chart-fever-guide.json'),
  },
  fr: {
    '47-c-to-f': require('../locales/fr/47-c-to-f.json'),
    '75-c-to-f': require('../locales/fr/75-c-to-f.json'),
    '4-c-to-f': require('../locales/fr/4-c-to-f.json'),
    home: require('../locales/fr/home.json'),
    template: require('../locales/fr/template.json'),
    'fan-oven-conversion-chart': require('../locales/fr/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/fr/37-c-to-f.json'),
    '0-c-to-f': require('../locales/fr/0-c-to-f.json'),
    'f-to-c': require('../locales/fr/f-to-c.json'),
    game: require('../locales/fr/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/fr/body-temperature-chart-fever-guide.json'),
  },
  de: {
    '47-c-to-f': require('../locales/de/47-c-to-f.json'),
    '75-c-to-f': require('../locales/de/75-c-to-f.json'),
    '4-c-to-f': require('../locales/de/4-c-to-f.json'),
    home: require('../locales/de/home.json'),
    template: require('../locales/de/template.json'),
    'fan-oven-conversion-chart': require('../locales/de/fan-oven-conversion-chart.json'),
    '37-c-to-f': require('../locales/de/37-c-to-f.json'),
    '0-c-to-f': require('../locales/de/0-c-to-f.json'),
    'f-to-c': require('../locales/de/f-to-c.json'),
    game: require('../locales/de/game.json'),
    'body-temperature-chart-fever-guide': require('../locales/de/body-temperature-chart-fever-guide.json'),
  },
};

const getLocalePageTranslation = (locale: string, page: string) => {
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
export async function loadPageTranslation(locale: string, page: string): Promise<any> {
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
export function getPageTranslation(locale: string, page: string): any {
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
export function getCommonTranslation(locale: string): any {
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
 * 创建翻译函数
 */
export function createTranslation(locale: string, page?: string) {
  const currentLocale = (locale as Locale) || 'en';
  const common = getCommonTranslation(currentLocale);
  const pageTranslation = page ? getLocalePageTranslation(currentLocale, page) : null;

  return {
    locale: currentLocale,
    t: (key: string, replacements?: Record<string, string | number>) => {
      // 内部辅助函数：处理值
      const processValue = (val: any) => {
        if (typeof val === 'string') {
          return replacements ? replacePlaceholders(val, replacements) : val;
        }
        return val;
      };

      // 处理显式的 common: 前缀
      let lookupKey = key;
      let forceCommon = false;
      if (key.startsWith('common:')) {
        lookupKey = key.substring(7); // "common:".length === 7
        forceCommon = true;
      }

      const keys = lookupKey.split('.');

      // 如果不是强制 common，先尝试从页面翻译获取
      if (!forceCommon && pageTranslation) {
        let value: any = pageTranslation;
        let found = true;
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            found = false;
            break;
          }
        }
        if (found && value !== null && value !== undefined) {
          return processValue(value);
        }
      }

      // 然后尝试从通用翻译获取
      let value: any = common;
      let found = true;
      for (const k of keys) {
        if (value && typeof value === 'object' && k in value) {
          value = value[k];
        } else {
          found = false;
          break;
        }
      }

      if (found && value !== null && value !== undefined) {
        return processValue(value);
      }

      return key; // 如果找不到，返回原 key (带前缀)
    },
    common,
    pageTranslation,
  };
}

/**
 * Hook: 获取当前语言和翻译
 */
export function useTranslation(page?: string) {
  const router = useRouter();
  const { locale = 'en' } = router;
  return createTranslation(locale as string, page);
}

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
