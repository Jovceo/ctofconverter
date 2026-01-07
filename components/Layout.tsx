'use client';

import Head from 'next/head';
import { ReactNode, useMemo } from 'react';
import { useRouter } from 'next/router';
import { useTranslation, DEFAULT_LOCALE, SUPPORTED_LOCALES, HREFLANG_MAP } from '../utils/i18n';

export interface SEOProps {
  title?: string;
  description?: string;

  author?: string;
  robots?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogUrl?: string;
  ogType?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterCard?: string;
  canonical?: string;
  alternates?: { href: string; hreflang: string; locale?: string }[];
}

interface LayoutProps {
  children: ReactNode;
  seo?: SEOProps;
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
    return `/${locale}`;
  }

  const suffix = normalizedBase.startsWith('/') ? normalizedBase : `/${normalizedBase}`;
  const prefix = locale === defaultLocale ? '' : `/${locale}`;
  return `${prefix}${suffix}`;
};

export default function Layout({ children, seo }: LayoutProps) {
  const router = useRouter();
  const { locale = DEFAULT_LOCALE, defaultLocale = DEFAULT_LOCALE, asPath = '/' } = router;
  const { common } = useTranslation();
  const meta = common?.meta || {};

  const basePath = useMemo(
    () => normalizeBasePath(asPath || '/', locale, defaultLocale || DEFAULT_LOCALE),
    [asPath, locale, defaultLocale]
  );

  const canonicalUrl = useMemo(() => {
    if (seo?.canonical) return seo.canonical;
    const localizedPath = buildLocalePath(basePath, locale, defaultLocale || DEFAULT_LOCALE);
    return `${SITE_ORIGIN}${localizedPath}`;
  }, [basePath, locale, defaultLocale, seo?.canonical]);

  const alternateLinks = SUPPORTED_LOCALES.map((supportedLocale) => {
    const localizedPath = buildLocalePath(
      basePath,
      supportedLocale,
      defaultLocale || DEFAULT_LOCALE
    );
    const href = `${SITE_ORIGIN}${localizedPath}`;
    return { locale: supportedLocale, href, hreflang: HREFLANG_MAP[supportedLocale] || supportedLocale };
  });

  const defaultAlternate = alternateLinks.find((link) => link.locale === DEFAULT_LOCALE) || {
    locale: DEFAULT_LOCALE,
    href: canonicalUrl,
  };

  // SEO Helpers: Prioritize props over default translations
  const title = seo?.title || meta.defaultTitle || 'Celsius to Fahrenheit | °C to °F Converter';
  const description = seo?.description || meta.defaultDescription || 'Convert Celsius to Fahrenheit quickly with the C to F Converter.';

  const author = seo?.author || meta.author || 'Temperature Conversion Experts';
  const robots = seo?.robots || 'index, follow';

  // OG / Social
  const ogTitle = seo?.ogTitle || seo?.title || meta.ogTitle || meta.defaultTitle || title;
  const ogDescription = seo?.ogDescription || seo?.description || meta.ogDescription || meta.defaultDescription || description;
  const ogImage = seo?.ogImage || 'https://ctofconverter.com/converter.png';
  const ogUrl = seo?.ogUrl || canonicalUrl;
  const ogType = seo?.ogType || 'website';

  // Twitter
  const twitterTitle = seo?.twitterTitle || ogTitle;
  const twitterDescription = seo?.twitterDescription || ogDescription;
  const twitterImage = seo?.twitterImage || ogImage;
  const twitterCard = seo?.twitterCard || 'summary_large_image';

  return (
    <>
      <Head>
        <meta charSet="UTF-8" key="charset" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" key="viewport" />
        <title key="title">{title}</title>
        <meta key="description" name="description" content={description} />

        <meta key="author" name="author" content={author} />
        <meta key="robots" name="robots" content={robots} />
        <link rel="icon" href="https://ctofconverter.com/favicon.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://ctofconverter.com/apple-touch-icon.png" />
        <link key="canonical" rel="canonical" href={canonicalUrl} />

        {/* Priority: Explicit alternates from props, otherwise verify auto-generated ones */}
        {seo?.alternates ? (
          seo.alternates.map((link) => (
            <link key={`alternate-${link.hreflang}`} rel="alternate" hrefLang={link.hreflang} href={link.href} />
          ))
        ) : (
          <>
            {alternateLinks.map((link) => (
              <link key={`alternate-${link.locale}`} rel="alternate" hrefLang={link.hreflang} href={link.href} />
            ))}
            <link key="alternate-default" rel="alternate" hrefLang="x-default" href={defaultAlternate.href} />
          </>
        )}

        <meta key="og:title" property="og:title" content={ogTitle} />
        <meta key="og:description" property="og:description" content={ogDescription} />
        <meta key="og:image" property="og:image" content={ogImage} />
        <meta key="og:url" property="og:url" content={ogUrl} />
        <meta key="og:type" property="og:type" content={ogType} />

        <meta key="twitter:card" name="twitter:card" content={twitterCard} />
        <meta key="twitter:title" name="twitter:title" content={twitterTitle} />
        <meta key="twitter:description" name="twitter:description" content={twitterDescription} />
        <meta key="twitter:image" name="twitter:image" content={twitterImage} />

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

