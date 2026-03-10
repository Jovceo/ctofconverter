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
import { DEFAULT_LOCALE, Locale } from './locale-config';
import { createTranslator, TranslationDictionary } from './translation-runtime';

const COMMON_TRANSLATIONS: Record<string, TranslationDictionary> = {
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

export function getCommonTranslation(locale: string): TranslationDictionary {
  return COMMON_TRANSLATIONS[locale] || commonEn;
}

export function createCommonTranslation(locale: string) {
  const currentLocale = (locale as Locale) || DEFAULT_LOCALE;
  const common = getCommonTranslation(currentLocale);
  return createTranslator({ locale: currentLocale, common });
}

export function useCommonTranslation() {
  const router = useRouter();
  const { locale = DEFAULT_LOCALE } = router;
  return createCommonTranslation(locale as string);
}
