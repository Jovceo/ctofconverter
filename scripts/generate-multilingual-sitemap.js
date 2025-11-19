const fs = require('fs');
const path = require('path');

const BASE_FILE = path.join(__dirname, '../public/sitemap.base.xml');
const OUTPUT_FILE = path.join(__dirname, '../public/sitemap.xml');

const SUPPORTED_LOCALES = ['en', 'zh', 'es', 'hi', 'id', 'pt-br', 'fr', 'de'];
const DEFAULT_LOCALE = 'en';
const SITE_ORIGIN = 'https://ctofconverter.com';
const HREFLANG_MAP = {
  en: 'en',
  zh: 'zh-CN',
  es: 'es',
  hi: 'hi',
  id: 'id',
  'pt-br': 'pt-BR',
  fr: 'fr',
  de: 'de',
};
const today = new Date().toISOString().split('T')[0];

// Multilingual priority: homepage > newly updated Next.js page
const MULTILINGUAL_PAGES = [
  {
    path: '/',
    lastmod: today,
    changefreq: 'weekly',
    priority: '1.0',
  },
  {
    path: '/47-c-to-f',
    lastmod: today,
    changefreq: 'weekly',
    priority: '0.9',
  },
];

const readBaseSitemap = () => {
  if (!fs.existsSync(BASE_FILE)) {
    throw new Error(`Base sitemap file not found at ${BASE_FILE}`);
  }
  return fs.readFileSync(BASE_FILE, 'utf-8');
};

const buildLocalizedUrl = (pathname, locale) => {
  const normalized = pathname === '/' ? '/' : pathname.replace(/\/+$/, '');
  if (normalized === '/') {
    if (locale === DEFAULT_LOCALE) {
      return `${SITE_ORIGIN}/`;
    }
    return `${SITE_ORIGIN}/${locale}/`;
  }

  const suffix = normalized.startsWith('/') ? normalized : `/${normalized}`;
  const prefix = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  return `${SITE_ORIGIN}${prefix}${suffix}`;
};

const normalizePath = (loc) => {
  try {
    const url = new URL(loc);
    let pathname = url.pathname || '/';
    if (pathname !== '/' && pathname.endsWith('/')) {
      pathname = pathname.slice(0, -1);
    }
    return pathname || '/';
  } catch (error) {
    console.warn('Failed to parse URL:', loc);
    return '/';
  }
};

const parseBaseEntries = (xml) => {
  const urlBlocks = xml.match(/<url>[\s\S]*?<\/url>/g) || [];
  return urlBlocks.map((block) => {
    const locMatch = block.match(/<loc>([^<]+)<\/loc>/);
    return {
      block,
      loc: locMatch ? locMatch[1].trim() : '',
      normalized: locMatch ? normalizePath(locMatch[1].trim()) : '/',
    };
  });
};

const buildMultilingualBlock = (page) => {
  const { path: pathname, lastmod, changefreq, priority } = page;
  const loc = buildLocalizedUrl(pathname, DEFAULT_LOCALE);

  const alternateLinks = SUPPORTED_LOCALES.map((locale) => {
    const href = buildLocalizedUrl(pathname, locale);
    const hreflang = HREFLANG_MAP[locale] || locale;
    return `    <xhtml:link rel="alternate" hreflang="${hreflang}" href="${href}" />`;
  });
  alternateLinks.push(`    <xhtml:link rel="alternate" hreflang="x-default" href="${loc}" />`);

  const lines = [
    '  <url>',
    `    <loc>${loc}</loc>`,
    ...alternateLinks,
  ];

  if (lastmod) lines.push(`    <lastmod>${lastmod}</lastmod>`);
  if (changefreq) lines.push(`    <changefreq>${changefreq}</changefreq>`);
  if (priority) lines.push(`    <priority>${priority}</priority>`);
  lines.push('  </url>');

  return {
    block: lines.join('\n'),
    normalized: normalizePath(loc),
  };
};

const run = () => {
  const baseXml = readBaseSitemap();
  const headerMatch = baseXml.match(/^([\s\S]*?<urlset[^>]*>)/);
  const footerMatch = baseXml.match(/<\/urlset>\s*$/);

  const header = headerMatch ? headerMatch[1] : '<?xml version="1.0" encoding="UTF-8"?><urlset>';
  const footer = footerMatch ? footerMatch[0] : '</urlset>';

  const baseEntries = parseBaseEntries(baseXml);
  const multilingualEntries = MULTILINGUAL_PAGES.map(buildMultilingualBlock);

  const multilingualPaths = new Set(multilingualEntries.map((entry) => entry.normalized));
  const filteredBaseEntries = baseEntries.filter(
    (entry) => !multilingualPaths.has(entry.normalized)
  );

  const orderedBlocks = [
    ...multilingualEntries.map((entry) => entry.block),
    ...filteredBaseEntries.map((entry) => entry.block),
  ];

  const body = orderedBlocks.join('\n');
  const output = `${header}\n${body}\n${footer}\n`;
  fs.writeFileSync(OUTPUT_FILE, output, 'utf-8');
  console.log(
    `Generated sitemap with ${multilingualEntries.length} multilingual entries prepended at ${OUTPUT_FILE}`
  );
};

run();

