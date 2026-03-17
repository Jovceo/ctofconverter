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
    'fever-temperature-chart': require('../locales/en/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/en/39-c-to-f.json'),
    '40-c-to-f': require('../locales/en/40-c-to-f.json'),
    '41-c-to-f': require('../locales/en/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/zh/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/zh/39-c-to-f.json'),
    '40-c-to-f': require('../locales/zh/40-c-to-f.json'),
    '41-c-to-f': require('../locales/zh/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/es/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/es/39-c-to-f.json'),
    '40-c-to-f': require('../locales/es/40-c-to-f.json'),
    '41-c-to-f': require('../locales/es/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/hi/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/hi/39-c-to-f.json'),
    '40-c-to-f': require('../locales/hi/40-c-to-f.json'),
    '41-c-to-f': require('../locales/hi/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/ar/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/ar/39-c-to-f.json'),
    '40-c-to-f': require('../locales/ar/40-c-to-f.json'),
    '41-c-to-f': require('../locales/ar/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/ja/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/ja/39-c-to-f.json'),
    '40-c-to-f': require('../locales/ja/40-c-to-f.json'),
    '41-c-to-f': require('../locales/ja/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/id/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/id/39-c-to-f.json'),
    '40-c-to-f': require('../locales/id/40-c-to-f.json'),
    '41-c-to-f': require('../locales/id/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/pt-br/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/pt-br/39-c-to-f.json'),
    '40-c-to-f': require('../locales/pt-br/40-c-to-f.json'),
    '41-c-to-f': require('../locales/pt-br/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/fr/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/fr/39-c-to-f.json'),
    '40-c-to-f': require('../locales/fr/40-c-to-f.json'),
    '41-c-to-f': require('../locales/fr/41-c-to-f.json'),
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
    'fever-temperature-chart': require('../locales/de/fever-temperature-chart.json'),
    '39-c-to-f': require('../locales/de/39-c-to-f.json'),
    '40-c-to-f': require('../locales/de/40-c-to-f.json'),
    '41-c-to-f': require('../locales/de/41-c-to-f.json'),
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

// 🎯 本地化关键词映射（用于SEO优化）
// 每个语言独立的关键词，用于contentStrategy
export const LOCALE_KEYWORDS: Record<Locale, string> = {
  en: 'fever body temperature medical health hypothermia',
  zh: '发烧 体温 医疗 健康 低体温',
  es: 'fiebre temperatura corporal médica salud hipotermia',
  fr: 'fièvre température corporelle médicale santé hypothermie',
  de: 'Fieber Körpertemperatur medizinische Gesundheit Hypothermie',
  ja: '発熱 体温 医療 健康 低体温',
  'pt-br': 'febre temperatura corporal médica saúde hipotermia',
  hi: 'बुखार शरीर ताप मैडिकल स्वास्थ्य कम ताप',
  ar: 'حمى درجة حرارة الجسم طبي صحة انخفاض الحرارة',
  id: 'demam suhu tubuh medis kesehatan suhu tubuh rendah'
};

/**
 * 获取本地化关键词
 * @param locale 语言代码
 * @returns 本地化关键词字符串
 */
export function getLocalizedKeywords(locale: Locale | string): string {
  const safeLocale = locale as Locale;
  return LOCALE_KEYWORDS[safeLocale] || LOCALE_KEYWORDS.en;
}

/**
 * 温度场景关键词映射
 * 根据温度和场景返回最合适的本地化关键词
 */
export const TEMPERATURE_SCENE_KEYWORDS: Record<Locale, Record<string, string>> = {
  en: {
    body: 'fever body temperature medical health',
    cooking: 'oven baking cooking temperature',
    weather: 'weather cold freezing outdoor',
    water: 'boiling steam water temperature',
    general: 'temperature conversion celsius fahrenheit'
  },
  zh: {
    body: '发烧 体温 医疗 健康',
    cooking: '烤箱 烘焙 烹饪 温度',
    weather: '天气 寒冷 冰冻 户外',
    water: '沸腾 蒸汽 水温',
    general: '温度转换 摄氏度 华氏度'
  },
  es: {
    body: 'fiebre temperatura corporal médica salud',
    cooking: 'horno hornear cocina temperatura',
    weather: 'clima frío congelación exterior',
    water: 'hirviendo vapor temperatura agua',
    general: 'conversión temperatura celsius fahrenheit'
  },
  fr: {
    body: 'fièvre température corporelle médicale santé',
    cooking: 'four cuisson cuisine température',
    weather: 'météo froid gel extérieur',
    water: 'ébullition vapeur température eau',
    general: 'conversion température celsius fahrenheit'
  },
  de: {
    body: 'Fieber Körpertemperatur medizinische Gesundheit',
    cooking: 'Ofen Backen Kochen Temperatur',
    weather: 'Wetter Kalt Frost Außen',
    water: 'Kochen Dampf Wassertemperatur',
    general: 'Temperaturumrechnung Celsius Fahrenheit'
  },
  ja: {
    body: '発熱 体温 医療 健康',
    cooking: 'オーブン ベーキング 料理 温度',
    weather: '天気 寒い 凍結 屋外',
    water: '沸騰 蒸気 水温',
    general: '温度変換 摂氏 華氏'
  },
  'pt-br': {
    body: 'febre temperatura corporal médica saúde',
    cooking: 'forno assar cozinha temperatura',
    weather: 'clima frio congelamento exterior',
    water: 'fervendo vapor temperatura água',
    general: 'conversão temperatura celsius fahrenheit'
  },
  hi: {
    body: 'बुखार शरीर ताप मैडिकल स्वास्थ्य',
    cooking: 'ओवन बेकिंग खाना पकाना तापमान',
    weather: 'मौसम ठंडा जमाव बाहर',
    water: 'उबाल भाप पानी का तापमान',
    general: 'तापमान रूपांतरण सेल्सियस फ़ारेनहाइट'
  },
  ar: {
    body: 'حمى درجة حرارة الجسم طبي صحة',
    cooking: 'فرن خبز طبخ درجة الحرارة',
    weather: 'طقس بارد تجمد خارجي',
    water: 'غليان بخار درجة حرارة الماء',
    general: 'تحويل درجة الحرارة مئوي فهرنهايت'
  },
  id: {
    body: 'demam suhu tubuh medis kesehatan',
    cooking: 'oven baking memasak suhu',
    weather: 'cuaca dingin beku luar',
    water: 'mendidih uap suhu air',
    general: 'konversi suhu celsius fahrenheit'
  }
};

/**
 * 根据温度和场景获取最佳本地化关键词
 * @param celsius 温度值
 * @param scene 场景（body, cooking, weather, water, general）
 * @param locale 语言代码
 * @returns 本地化关键词字符串
 */
export function getSceneKeywords(celsius: number, scene: string, locale: Locale | string): string {
  const safeLocale = locale as Locale;
  const sceneMap = TEMPERATURE_SCENE_KEYWORDS[safeLocale] || TEMPERATURE_SCENE_KEYWORDS.en;
  
  // 如果没有指定场景，自动判断
  if (!scene || scene === 'auto') {
    if (celsius >= 35 && celsius <= 42.5) {
      scene = 'body';
    } else if (celsius >= 60) {
      scene = 'cooking';
    } else if (celsius >= -60 && celsius <= 55) {
      scene = 'weather';
    } else {
      scene = 'general';
    }
  }
  
  return sceneMap[scene] || sceneMap.general;
}
