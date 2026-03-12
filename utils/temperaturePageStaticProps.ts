import fs from 'fs';
import path from 'path';
import { GetStaticProps } from 'next';

import { getLatestModifiedDate } from './dateHelpers';
import { SUPPORTED_LOCALES } from './i18n';
import { getAvailableTemperaturePages } from './serverHelpers';

const LOCALES_DIR = path.join(process.cwd(), 'locales');
const PUBLIC_LOCALES_DIR = path.join(process.cwd(), 'public', 'locales');

function getJsonName(pageSlug: string): string {
  return pageSlug === 'index' ? 'home.json' : `${pageSlug}.json`;
}

function sortLocales(locales: string[]): string[] {
  return Array.from(new Set(locales)).sort((a, b) => {
    const aIndex = SUPPORTED_LOCALES.indexOf(a as (typeof SUPPORTED_LOCALES)[number]);
    const bIndex = SUPPORTED_LOCALES.indexOf(b as (typeof SUPPORTED_LOCALES)[number]);
    const safeA = aIndex === -1 ? Number.MAX_SAFE_INTEGER : aIndex;
    const safeB = bIndex === -1 ? Number.MAX_SAFE_INTEGER : bIndex;
    return safeA - safeB;
  });
}

function loadJsonFile<T>(filePath: string): T | Record<string, never> {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8')) as T;
  } catch {
    return {};
  }
}

function deepMerge<T>(target: T, source: unknown): T {
  if (!source || typeof source !== 'object' || Array.isArray(source)) {
    return (source as T) ?? target;
  }

  const nextTarget: Record<string, unknown> =
    target && typeof target === 'object' && !Array.isArray(target)
      ? { ...(target as Record<string, unknown>) }
      : {};

  Object.entries(source as Record<string, unknown>).forEach(([key, value]) => {
    if (value && typeof value === 'object' && !Array.isArray(value)) {
      nextTarget[key] = deepMerge(nextTarget[key], value);
      return;
    }

    if (Array.isArray(value)) {
      nextTarget[key] = value.map((item) =>
        item && typeof item === 'object' && !Array.isArray(item) ? deepMerge({}, item) : item
      );
      return;
    }

    nextTarget[key] = value;
  });

  return nextTarget as T;
}

export function getPageSupportedLocales(pageSlug: string): string[] {
  const jsonName = getJsonName(pageSlug);
  const detectedLocales = SUPPORTED_LOCALES.filter((locale) => {
    const localeFile = path.join(LOCALES_DIR, locale, jsonName);
    const publicLocaleFile = path.join(PUBLIC_LOCALES_DIR, locale, jsonName);
    return fs.existsSync(localeFile) || fs.existsSync(publicLocaleFile);
  });

  if (detectedLocales.length === 0) {
    return ['en'];
  }

  return sortLocales(detectedLocales);
}

export function loadMergedPageTranslation<T>(locale: string, pageSlug: string): T {
  const jsonName = getJsonName(pageSlug);
  const englishFile = path.join(LOCALES_DIR, 'en', jsonName);
  const localeFile = path.join(LOCALES_DIR, locale, jsonName);

  const englishTranslation = loadJsonFile<T>(englishFile) as T;
  if (locale === 'en') {
    return englishTranslation;
  }

  const localeTranslation = loadJsonFile<T>(localeFile);
  return deepMerge(structuredClone(englishTranslation), localeTranslation);
}

export interface LocalizedTemperaturePageProps<T> {
  alternateLocales: string[];
  availablePages: number[];
  lastUpdatedIso: string;
  pageTrans: T;
}

interface StaticPropsOptions {
  supportedLocales?: string[];
}

export function createTemperaturePageStaticProps<T>(
  pageSlug: string,
  options: StaticPropsOptions = {}
): GetStaticProps<LocalizedTemperaturePageProps<T>> {
  return async ({ locale = 'en' }) => {
    const alternateLocales = sortLocales(options.supportedLocales ?? getPageSupportedLocales(pageSlug));

    if (!alternateLocales.includes(locale)) {
      return {
        notFound: true,
      };
    }

    return {
      props: {
        alternateLocales,
        availablePages: getAvailableTemperaturePages(),
        lastUpdatedIso: getLatestModifiedDate([
          `pages/${pageSlug}.tsx`,
          'components/TemperaturePage.tsx',
          `locales/${locale}/${pageSlug}.json`,
          'locales/en/template.json',
        ]),
        pageTrans: loadMergedPageTranslation<T>(locale, pageSlug),
      },
    };
  };
}
