'use client';

import Head from 'next/head';
import { ReactNode, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation, DEFAULT_LOCALE, SUPPORTED_LOCALES, HREFLANG_MAP } from '../utils/i18n';

interface LayoutProps {
  children: ReactNode;
}

const SITE_ORIGIN = 'https://ctofconverter.com';

const stripQueryAndHash = (value: string): string => {
  if (!value) return '/';
  const [path] = value.split(/[?#]/);
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const normalizeBasePath = (path: string, locale: string, defaultLocale: string): string => {
  const cleanPath = stripQueryAndHash(path);
  if (locale === defaultLocale) {
    return cleanPath === '' ? '/' : cleanPath;
  }
  const localePrefix = `/${locale}`;
  if (cleanPath.startsWith(localePrefix)) {
    const nextPath = cleanPath.slice(localePrefix.length) || '/';
    return nextPath.startsWith('/') ? nextPath : `/${nextPath}`;
  }
  return cleanPath || '/';
};

const buildLocalePath = (basePath: string, locale: string, defaultLocale: string): string => {
  const normalizedBase = basePath === '/' ? '/' : basePath.replace(/\/+$/, '');
  if (normalizedBase === '/') {
    if (locale === defaultLocale) {
      return '/';
    }
    return `/${locale}/`;
  }

  const suffix = normalizedBase.startsWith('/') ? normalizedBase : `/${normalizedBase}`;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${prefix}${suffix}`;
};

export default function Layout({ children }: LayoutProps) {
  const router = useRouter();
  const { locale = DEFAULT_LOCALE, defaultLocale = DEFAULT_LOCALE, asPath = '/' } = router;
  const { common } = useTranslation();
  const meta = common?.meta || {};

  const basePath = useMemo(
    () => normalizeBasePath(asPath || '/', locale, defaultLocale || DEFAULT_LOCALE),
    [asPath, locale, defaultLocale]
  );

  const canonical = useMemo(() => {
    const localizedPath = buildLocalePath(basePath, locale, defaultLocale || DEFAULT_LOCALE);
    return `${SITE_ORIGIN}${localizedPath === '/' ? '/' : localizedPath}`;
  }, [basePath, locale, defaultLocale]);

  const alternateLinks = SUPPORTED_LOCALES.map((supportedLocale) => {
    const localizedPath = buildLocalePath(
      basePath,
      supportedLocale,
      defaultLocale || DEFAULT_LOCALE
    );
    const href = `${SITE_ORIGIN}${localizedPath === '/' ? '/' : localizedPath}`;
    return { locale: supportedLocale, href, hreflang: HREFLANG_MAP[supportedLocale] || supportedLocale };
  });

  const defaultAlternate = alternateLinks.find((link) => link.locale === DEFAULT_LOCALE) || {
    locale: DEFAULT_LOCALE,
    href: canonical,
  };

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title key="title">{meta.defaultTitle || 'Celsius to Fahrenheit | °C to °F Converter'}</title>
        <meta
          key="description"
          name="description"
          content={
            meta.defaultDescription ||
            'Convert Celsius to Fahrenheit quickly with the C to F Converter. Get results instantly, learn the formula, and check the conversion chart.'
          }
        />
        <meta name="author" content={meta.author || 'Temperature Conversion Experts'} />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="https://ctofconverter.com/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://ctofconverter.com/apple-touch-icon.png" />
        <link key="canonical" rel="canonical" href={canonical} />

        {alternateLinks.map((link) => (
          <link key={`alternate-${link.locale}`} rel="alternate" hrefLang={link.hreflang} href={link.href} />
        ))}
        <link key="alternate-default" rel="alternate" hrefLang="x-default" href={defaultAlternate.href} />

        <meta key="og:title" property="og:title" content={meta.ogTitle || meta.defaultTitle || 'Celsius to Fahrenheit Converter'} />
        <meta
          key="og:description"
          property="og:description"
          content={
            meta.ogDescription ||
            meta.defaultDescription ||
            'Free Online Temperature Calculator for Instant Conversions. Instantly convert temperatures from Celsius (°C) to Fahrenheit (°F) with precise results and step-by-step details.'
          }
        />
        <meta key="og:image" property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta key="og:url" property="og:url" content={canonical} />
        <meta key="og:type" property="og:type" content="website" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta
          key="twitter:title"
          name="twitter:title"
          content={meta.twitterTitle || meta.defaultTitle || 'Celsius to Fahrenheit Converter'}
        />
        <meta
          key="twitter:description"
          name="twitter:description"
          content={
            meta.twitterDescription ||
            meta.defaultDescription ||
            'Free Online Temperature Calculator for Instant Conversions. Instantly convert temperatures from Celsius (°C) to Fahrenheit (°F) with precise results and step-by-step details.'
          }
        />

        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <meta name="application-name" content="C to F Converter" />
        <meta name="theme-color" content="#3498db" />
      </Head>
      <a className="sr-only sr-only-focusable" href="#main-content">
        Skip to main content
      </a>
      {children}
    </>
  );
}

