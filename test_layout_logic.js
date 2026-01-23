
const SUPPORTED_LOCALES = ['en', 'zh', 'es', 'fr', 'de', 'ja', 'pt-br', 'ar', 'id', 'hi'];
const DEFAULT_LOCALE = 'en';
const SITE_ORIGIN = 'https://ctofconverter.com';
const HREFLANG_MAP = {
    'en': 'en',
    'zh': 'zh-Hans',
    'es': 'es',
    'fr': 'fr',
    'de': 'de',
    'ja': 'ja',
    'pt-br': 'pt-BR',
    'ar': 'ar',
    'id': 'id',
    'hi': 'hi'
};

const stripQueryAndHash = (value) => {
  if (!value) return '/';
  const [path] = value.split(/[?#]/);
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const normalizeBasePath = (path, locale, defaultLocale) => {
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

const buildLocalePath = (basePath, locale, defaultLocale) => {
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

// 模拟测试 Case
const testCases = [
    { asPath: '/37-c-to-f', locale: 'en' },
    { asPath: '/zh/37-c-to-f', locale: 'zh' },
    { asPath: '/c-to-f-calculator', locale: 'en' }
];

testCases.forEach(({ asPath, locale }) => {
    console.log(`\n=== Testing: ${asPath} (Locale: ${locale}) ===`);
    
    // 1. Calculate Base Path
    const basePath = normalizeBasePath(asPath, locale, DEFAULT_LOCALE);
    console.log(`Base Path: ${basePath}`);

    // 2. Generate Canonical
    const localizedPath = buildLocalePath(basePath, locale, DEFAULT_LOCALE);
    const canonicalUrl = `${SITE_ORIGIN}${localizedPath}`;
    console.log(`Canonical: ${canonicalUrl}`);

    // 3. Generate Alternates
    const alternateLinks = SUPPORTED_LOCALES.map((supportedLocale) => {
        const localizedPath = buildLocalePath(
          basePath,
          supportedLocale,
          DEFAULT_LOCALE
        );
        const href = `${SITE_ORIGIN}${localizedPath}`;
        return { locale: supportedLocale, href, hreflang: HREFLANG_MAP[supportedLocale] || supportedLocale };
    });
    
    alternateLinks.forEach(link => {
        console.log(`Alternate [${link.hreflang}]: ${link.href}`);
    });
});
