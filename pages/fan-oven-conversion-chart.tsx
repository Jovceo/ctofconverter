import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
// import { useTranslation } from '../utils/i18n'; // Removed to reduce bundle size
import styles from '../styles/fan-oven-conversion-chart.module.css';
import { GetStaticProps } from 'next';
import { useLightTranslation } from '../utils/i18n-lite';
import fs from 'fs';
import path from 'path';
import { useRouter } from 'next/router';

type StructuredHowToStep = {
  name: string;
  text: string;
};

type QuickConversionItem = {
  text: string;
};

type NavigationLink = {
  text: string;
  anchor: string;
};

type FoodGuideItem = {
  text: string;
};

type ProTip = {
  title: string;
  text: string;
};

type FaqItem = {
  question: string;
  answer: string;
};

type FaqAccordionTable = {
  headers: string[];
  rows: string[][];
};

type FaqAccordionItem = {
  question: string;
  answer: string;
  points?: string[];
  steps?: string[];
  table?: FaqAccordionTable;
  conclusion?: string;
};

import { getLatestModifiedDate } from '../utils/dateHelpers';

export const getStaticProps: GetStaticProps = async ({ locale }) => {
  const currentLocale = locale || 'en';
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/fan-oven-conversion-chart.tsx',
    `locales/${currentLocale}/fan-oven-conversion-chart.json`
  ]);

  // Helper to deep merge objects
  const deepMerge = (target: any, source: any) => {
    for (const key of Object.keys(source)) {
      if (source[key] instanceof Object && key in target) {
        Object.assign(source[key], deepMerge(target[key], source[key]));
      }
    }
    Object.assign(target || {}, source);
    return target;
  };

  const loadJSON = (loc: string, p: string) => {
    try {
      const filePath = path.join(process.cwd(), 'locales', loc, p);
      const fileContent = fs.readFileSync(filePath, 'utf8');
      return JSON.parse(fileContent);
    } catch {
      return {};
    }
  };

  // 1. Load English (Base)
  const enTrans = loadJSON('en', 'fan-oven-conversion-chart.json');

  // 2. Load Current Locale (if different)
  let pageTrans = enTrans;
  if (currentLocale !== 'en') {
    const locTrans = loadJSON(currentLocale, 'fan-oven-conversion-chart.json');
    // Simple deep merge or spread for critical sections
    // Given the structure, a recursive merge is safest to ensure 'tableRows' are preserved if missing in target
    pageTrans = deepMerge(JSON.parse(JSON.stringify(enTrans)), locTrans);
  }
  // We might not need common if keys are full? But let's load it just in case if keys use 'common:' prefix or similar?
  // Looking at the code, it uses 't' with keys like 'intro.title'.
  // But wait, Layout/Header/Footer might use common translations.
  // The 't' passed to children is usually from global context or they use their own useTranslation.
  // Header/Footer import 'useTranslation' from 'utils/i18n' internally.
  // So WE are optimizing the Page content, but Header/Footer will still pull in the big bundle?
  // YES. Because Header imports utils/i18n.

  // To truly fix the bundle, we need Header/Footer to NOT import utils/i18n.
  // That's a larger refactor.
  // BUT, by not importing it HERE, we save some, but if 'Header' is imported, 'utils/i18n' is imported.
  // So the 'utils/i18n' module is EVALUATED.

  // So the ONLY way to fix this "Reduce unused JS" properly is to fix 'utils/i18n.ts' itself.

  return {
    props: {
      lastUpdatedIso,
      pageTrans
    }
  };
};

export default function FanOvenConversionChart({ lastUpdatedIso, pageTrans }: { lastUpdatedIso: string, pageTrans: Record<string, unknown> }) {
  const router = useRouter(); // Use router for locale
  const locale = router.locale || 'en';
  // Use lightweight translation for this page's content
  const { t } = useLightTranslation(pageTrans, locale);

  const currentLocale = locale;
  const pagePath = currentLocale === 'en' ? '/fan-oven-conversion-chart' : `/${currentLocale}/fan-oven-conversion-chart`;
  const homePath = currentLocale === 'en' ? '/' : `/${currentLocale}/`;


  // Calculator state
  const [tempValue, setTempValue] = useState<string>('');
  const [fromUnit, setFromUnit] = useState<string>('conventional');
  const [toUnit, setToUnit] = useState<string>('fan');
  const [result, setResult] = useState<string>(() => String(t('calculator.resultDefault')));

  // Tab state
  const [activeTab, setActiveTab] = useState<string>('celsius');

  // Accordion state
  const [expandedAccordion, setExpandedAccordion] = useState<number | null>(null);

  // Conversion logic with improved error handling
  const convertTemperature = useCallback(() => {
    const temp = parseFloat(tempValue);
    if (isNaN(temp) || tempValue === '') {
      setResult(t('calculator.errorInvalidNumber'));
      return;
    }

    // Boundary checks for Gas Mark
    if (fromUnit === 'gas') {
      const validGasMarks = [0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      if (!validGasMarks.includes(temp)) {
        setResult(t('calculator.errorGasMarkRange') || 'Gas Mark must be 0.5, 1, 2, 3, 4, 5, 6, 7, 8, 9, or 10');
        return;
      }
    }

    // Temperature range checks (reasonable oven temperatures)
    const minTemp = fromUnit === 'conventional-f' ? -40 : -50;
    const maxTemp = fromUnit === 'conventional-f' ? 600 : 300;

    if (fromUnit !== 'gas' && (temp < minTemp || temp > maxTemp)) {
      setResult(t('calculator.errorTemperatureRange') || `Temperature must be between ${minTemp} and ${maxTemp}`);
      return;
    }

    let convertedValue: number | string = temp;

    // Conversion logic from script.js
    if (fromUnit === 'conventional' && toUnit === 'fan') {
      convertedValue = temp - 20;
    } else if (fromUnit === 'fan' && toUnit === 'conventional') {
      convertedValue = temp + 20;
    } else if (fromUnit === 'conventional-f' && toUnit === 'fan') {
      const conventionalC = (temp - 32) * 5 / 9;
      convertedValue = Math.round(conventionalC - 20);
    } else if (fromUnit === 'fan' && toUnit === 'conventional-f') {
      const conventionalC = temp + 20;
      convertedValue = Math.round(conventionalC * 9 / 5 + 32);
    } else if (fromUnit === 'conventional' && toUnit === 'conventional-f') {
      convertedValue = Math.round(temp * 9 / 5 + 32);
    } else if (fromUnit === 'conventional-f' && toUnit === 'conventional') {
      convertedValue = Math.round((temp - 32) * 5 / 9);
    } else if (fromUnit === 'gas') {
      const gasToCelsius: Record<number, number> = {
        0.5: 120, 1: 140, 2: 150, 3: 160, 4: 180, 5: 190,
        6: 200, 7: 220, 8: 230, 9: 240, 10: 260
      };
      const conventionalC = gasToCelsius[temp];
      if (conventionalC === undefined) {
        setResult(t('calculator.errorGasMarkRange') || 'Invalid Gas Mark. Please use 0.5, 1-10');
        return;
      }
      if (toUnit === 'conventional') {
        convertedValue = conventionalC;
      } else if (toUnit === 'fan') {
        convertedValue = conventionalC - 20;
      } else if (toUnit === 'conventional-f') {
        convertedValue = Math.round(conventionalC * 9 / 5 + 32);
      } else {
        convertedValue = t('calculator.errorNotSupported');
      }
    } else if (fromUnit === 'conventional' && toUnit === 'gas') {
      const gasMarks: Record<number, number> = {
        120: 0.5, 140: 1, 150: 2, 160: 3, 180: 4,
        190: 5, 200: 6, 220: 7, 230: 8, 240: 9
      };
      const closest = Object.keys(gasMarks).reduce((prev, curr) =>
        Math.abs(parseInt(curr) - temp) < Math.abs(parseInt(prev) - temp) ? curr : prev
      );
      convertedValue = gasMarks[parseInt(closest)];
      // Format Gas Mark display
      if (convertedValue === 0.5) {
        convertedValue = '½';
      }
    } else if (fromUnit === 'fan' && toUnit === 'gas') {
      const conventionalC = temp + 20;
      const gasMarks: Record<number, number> = {
        120: 0.5, 140: 1, 150: 2, 160: 3, 180: 4,
        190: 5, 200: 6, 220: 7, 230: 8, 240: 9
      };
      const closest = Object.keys(gasMarks).reduce((prev, curr) =>
        Math.abs(parseInt(curr) - conventionalC) < Math.abs(parseInt(prev) - conventionalC) ? curr : prev
      );
      convertedValue = gasMarks[parseInt(closest)];
      // Format Gas Mark display
      if (convertedValue === 0.5) {
        convertedValue = '½';
      }
    } else if (fromUnit === toUnit) {
      convertedValue = temp;
    } else {
      convertedValue = t('calculator.errorNotSupported');
    }

    // Format result
    if (typeof convertedValue === 'number') {
      if (toUnit === 'conventional-f') {
        setResult(`${Math.round(convertedValue)}°F`);
      } else if (toUnit === 'gas') {
        setResult(`Gas Mark ${convertedValue}`);
      } else {
        setResult(`${Math.round(convertedValue)}°C`);
      }
    } else if (typeof convertedValue === 'string' && convertedValue !== t('calculator.errorNotSupported') && convertedValue !== (t('calculator.errorGasMarkRange') || '')) {
      // Handle Gas Mark ½ display
      setResult(`Gas Mark ${convertedValue}`);
    } else {
      setResult(convertedValue);
    }
  }, [tempValue, fromUnit, toUnit, t]);

  // Handle from unit change
  useEffect(() => {
    if (toUnit === fromUnit) {
      // Auto-select different unit
      const options = ['conventional', 'conventional-f', 'fan', 'gas'];
      const newToUnit = options.find(opt => opt !== fromUnit);
      if (newToUnit) {
        setToUnit(newToUnit);
      }
    }
  }, [fromUnit, toUnit]);

  // Toggle accordion
  const toggleAccordion = useCallback((index: number) => {
    setExpandedAccordion(expandedAccordion === index ? null : index);
  }, [expandedAccordion]);

  // Handle accordion keyboard navigation
  const handleAccordionKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleAccordion(index);
    }
  }, [toggleAccordion]);

  // Handle keyboard navigation for tabs
  const handleTabKeyDown = useCallback((e: React.KeyboardEvent, tabId: string) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setActiveTab(tabId);
    } else if (e.key === 'ArrowRight' || e.key === 'ArrowLeft') {
      e.preventDefault();
      const tabs = ['celsius', 'fahrenheit', 'gas-mark'];
      const currentIndex = tabs.indexOf(activeTab);
      const nextIndex = e.key === 'ArrowRight'
        ? (currentIndex + 1) % tabs.length
        : (currentIndex - 1 + tabs.length) % tabs.length;
      setActiveTab(tabs[nextIndex]);
      // Focus the new tab button
      const nextTabButton = document.getElementById(`${tabs[nextIndex]}-tab`);
      if (nextTabButton) {
        nextTabButton.focus();
      }
    }
  }, [activeTab]);

  // Structured data
  // Get protocol and host dynamically if possible, otherwise fallback to production
  const siteOrigin = typeof window !== 'undefined'
    ? window.location.origin
    : 'https://ctofconverter.com';

  const canonicalUrl = `${siteOrigin}${pagePath === '/' ? '/' : pagePath}`;

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('structuredData.howTo.name'),
    description: t('structuredData.howTo.description'),
    totalTime: t('structuredData.howTo.totalTime'),
    supply: (t('structuredData.howTo.supplies') as unknown as string[] || []).map((name: string) => ({
      '@type': 'HowToSupply',
      name
    })),
    step: (t('structuredData.howTo.steps') as unknown as StructuredHowToStep[] || []).map((step) => ({
      '@type': 'HowToStep',
      text: step.text,
      name: step.name
    }))
  };

  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: t('breadcrumb.home'),
        item: `${siteOrigin}${homePath}`,
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: t('breadcrumb.current'),
        item: canonicalUrl,
      },
    ],
  };

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: (t('faqs.items') as unknown as FaqItem[] || []).map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  };

  // Article schema for better SEO
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: t('meta.title'),
    description: t('meta.description'),
    author: {
      '@type': 'Person',
      name: t('meta.author'),
    },
    datePublished: lastUpdatedIso,
    dateModified: lastUpdatedIso,
    publisher: {
      '@type': 'Organization',
      name: 'Ctofconverter',
      url: siteOrigin
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonicalUrl,
    }
  };

  return (
    <Layout seo={{
      title: t('meta.title'),
      description: t('meta.description'),
      author: t('meta.author'),
      ogTitle: t('meta.ogTitle'),
      ogDescription: t('meta.ogDescription'),
      ogImage: `${siteOrigin}${t('meta.ogImage')}`,
      ogType: t('meta.ogType'),
      twitterTitle: t('meta.twitterTitle'),
      twitterDescription: t('meta.twitterDescription'),
      twitterImage: `${siteOrigin}${t('meta.twitterImage')}`,
      twitterCard: t('meta.twitterCard'),
      canonical: canonicalUrl
    }}>
      <Head>
        {/* Structured Data only - Meta tags are handled by Layout */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
        />
      </Head>
      <Analytics />
      <Header />
      <Navigation />
      <main className="container" id="main-content">
        <nav className="breadcrumb" aria-label="Breadcrumb navigation">
          <div className="container">
            <Link href="/">{t('breadcrumb.home')}</Link>
            <span aria-hidden="true"> › </span>
            <span>{t('breadcrumb.current')}</span>
          </div>
        </nav>

        <section className={styles.introSection}>
          <h1>{t('intro.title')}</h1>
          <p className={styles.subtitle}>{t('intro.subtitle')}</p>
          <div className={styles.metaInfo}>
            <span className={styles.author}>{t('intro.author')}</span>
          </div>
        </section>

        <section className={styles.quickConversions}>
          <h3>{t('quickConversions.title')}</h3>
          <div className={styles.conversionGrid}>
            {(t('quickConversions.items') as QuickConversionItem[]).map((item, index: number) => (
              <div key={index} className={styles.conversionItem}>
                <strong dangerouslySetInnerHTML={{ __html: item.text }} />
              </div>
            ))}
          </div>
          <p>
            <em>{t('quickConversions.generalRule')}</em>
          </p>
        </section>

        <section className={styles.conversionTool}>
          <h2>{t('calculator.title')}</h2>
          <div className={styles.toolContainer}>
            <div className={styles.inputSection}>
              <div className={styles.inputGroup}>
                <label htmlFor="temp-value">{t('calculator.temperatureLabel')}</label>
                <input
                  type="number"
                  id="temp-value"
                  placeholder={t('calculator.temperaturePlaceholder')}
                  value={tempValue}
                  onChange={(e) => setTempValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      convertTemperature();
                    }
                  }}
                  aria-label={t('calculator.temperatureLabel')}
                  min={fromUnit === 'gas' ? 0.5 : (fromUnit === 'conventional-f' ? -40 : -50)}
                  max={fromUnit === 'gas' ? 10 : (fromUnit === 'conventional-f' ? 600 : 300)}
                  step={fromUnit === 'gas' ? 0.5 : 1}
                />
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="from-unit">{t('calculator.fromLabel')}</label>
                <select
                  id="from-unit"
                  value={fromUnit}
                  onChange={(e) => setFromUnit(e.target.value)}
                  aria-label={t('calculator.fromLabel')}
                >
                  <option value="conventional">{t('calculator.options.conventional')}</option>
                  <option value="conventional-f">{t('calculator.options.conventionalF')}</option>
                  <option value="fan">{t('calculator.options.fan')}</option>
                  <option value="gas">{t('calculator.options.gas')}</option>
                </select>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="to-unit">{t('calculator.toLabel')}</label>
                <select
                  id="to-unit"
                  value={toUnit}
                  onChange={(e) => setToUnit(e.target.value)}
                  aria-label={t('calculator.toLabel')}
                >
                  <option value="fan">{t('calculator.options.fan')}</option>
                  <option value="conventional">{t('calculator.options.conventional')}</option>
                  <option value="conventional-f">{t('calculator.options.conventionalF')}</option>
                  <option value="gas">{t('calculator.options.gas')}</option>
                </select>
              </div>
              <button
                className={styles.primaryBtn}
                onClick={convertTemperature}
                aria-label={t('calculator.convertButton')}
              >
                {t('calculator.convertButton')}
              </button>
            </div>
            <div className={styles.resultSection}>
              <div className={styles.resultBox}>
                <div className={styles.resultLabel}>{t('calculator.resultLabel')}</div>
                <div
                  className={styles.resultValue}
                  role="status"
                  aria-live="polite"
                  aria-atomic="true"
                  id="conversion-result"
                >
                  {result}
                </div>
              </div>
              <div className={styles.timeNote}>
                <p dangerouslySetInnerHTML={{ __html: t('calculator.timeNote') }} />
              </div>
            </div>
          </div>
        </section>

        <section className={styles.contentNav}>
          <h3>{t('navigation.title')}</h3>
          <ul>
            {(t('navigation.links') as NavigationLink[]).map((link, index: number) => (
              <li key={index}>
                <a href={link.anchor}>{link.text}</a>
              </li>
            ))}
          </ul>
        </section>

        <section className={styles.temperatureGuide} id="celsius-conversions">
          <h2>{t('charts.title')}</h2>

          <h3 id="what-is-gas-mark-4-in-fan-oven">{t('charts.gasMark4Title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('charts.gasMark4Text') }} />

          <h3 id="450-fahrenheit-to-celsius-fan-oven">{t('charts.fahrenheit450Title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('charts.fahrenheit450Text') }} />

          <h3 id="180-conventional-to-fan">{t('charts.conventional180Title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('charts.conventional180Text') }} />

          <h3 id="gas-mark-6-fan-oven">{t('charts.gasMark6Title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('charts.gasMark6Text') }} />

          <h3 id="350f-to-c-fan">{t('charts.fahrenheit350Title')}</h3>
          <p dangerouslySetInnerHTML={{ __html: t('charts.fahrenheit350Text') }} />

          <div className={styles.tabbedInterface} role="tablist" aria-label="Temperature conversion charts">
            <div className={styles.tabButtons}>
              <button
                className={`${styles.tabBtn} ${activeTab === 'celsius' ? styles.active : ''}`}
                onClick={() => setActiveTab('celsius')}
                onKeyDown={(e) => handleTabKeyDown(e, 'celsius')}
                role="tab"
                aria-selected={activeTab === 'celsius'}
                aria-controls="celsius-tabpanel"
                id="celsius-tab"
                tabIndex={activeTab === 'celsius' ? 0 : -1}
              >
                {t('charts.tabs.celsius')}
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'fahrenheit' ? styles.active : ''}`}
                onClick={() => setActiveTab('fahrenheit')}
                onKeyDown={(e) => handleTabKeyDown(e, 'fahrenheit')}
                role="tab"
                aria-selected={activeTab === 'fahrenheit'}
                aria-controls="fahrenheit-tabpanel"
                id="fahrenheit-tab"
                tabIndex={activeTab === 'fahrenheit' ? 0 : -1}
              >
                {t('charts.tabs.fahrenheit')}
              </button>
              <button
                className={`${styles.tabBtn} ${activeTab === 'gas-mark' ? styles.active : ''}`}
                onClick={() => setActiveTab('gas-mark')}
                onKeyDown={(e) => handleTabKeyDown(e, 'gas-mark')}
                role="tab"
                aria-selected={activeTab === 'gas-mark'}
                aria-controls="gas-mark-tabpanel"
                id="gas-mark-tab"
                tabIndex={activeTab === 'gas-mark' ? 0 : -1}
              >
                {t('charts.tabs.gasMark')}
              </button>
            </div>

            {activeTab === 'celsius' && (
              <div
                className={`${styles.tabContent} ${styles.active}`}
                id="celsius-tabpanel"
                role="tabpanel"
                aria-labelledby="celsius-tab"
                tabIndex={0}
              >
                <div className={styles.tableWrapper}>
                  <table className={styles.conversionTable}>
                    <thead>
                      <tr>
                        <th scope="col">{t('charts.tableHeaders.conventionalC')}</th>
                        <th scope="col">{t('charts.tableHeaders.fanC')}</th>
                        <th scope="col">{t('charts.tableHeaders.commonUses')}</th>
                        <th scope="col">{t('charts.tableHeaders.proTips')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(t('charts.tableRows.celsius') as any[] || []).map((row, i) => (
                        <tr key={i}>
                          <td>
                            {row.link ? (
                              <a
                                href={row.link}
                                title={row.ariaLabel}
                                aria-label={row.ariaLabel}
                              >
                                {row.temp}
                              </a>
                            ) : (
                              row.temp
                            )}
                          </td>
                          <td>{row.fanTemp}</td>
                          <td>{row.uses}</td>
                          <td>{row.tip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'fahrenheit' && (
              <div
                className={`${styles.tabContent} ${styles.active}`}
                id="fahrenheit-tabpanel"
                role="tabpanel"
                aria-labelledby="fahrenheit-tab"
                tabIndex={0}
              >
                <div className={styles.tableWrapper}>
                  <table className={styles.conversionTable}>
                    <thead>
                      <tr>
                        <th scope="col">{t('charts.tableHeaders.conventionalF')}</th>
                        <th scope="col">{t('charts.tableHeaders.fanF')}</th>
                        <th scope="col">{t('charts.tableHeaders.commonUses')}</th>
                        <th scope="col">{t('charts.tableHeaders.proTips')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(t('charts.tableRows.fahrenheit') as any[] || []).map((row, i) => (
                        <tr key={i}>
                          <td>{row.temp}</td>
                          <td>{row.fanTemp}</td>
                          <td>{row.uses}</td>
                          <td>{row.tip}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {activeTab === 'gas-mark' && (
              <div
                className={`${styles.tabContent} ${styles.active}`}
                id="gas-mark-tabpanel"
                role="tabpanel"
                aria-labelledby="gas-mark-tab"
                tabIndex={0}
              >
                <div className={styles.tableWrapper}>
                  <table className={styles.conversionTable}>
                    <thead>
                      <tr>
                        <th scope="col">{t('charts.tableHeaders.gasMark')}</th>
                        <th scope="col">{t('charts.tableHeaders.fanC')}</th>
                        <th scope="col">{t('charts.tableHeaders.fanF')}</th>
                        <th scope="col">{t('charts.tableHeaders.commonUses')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(t('charts.tableRows.gasMark') as any[] || []).map((row, i) => (
                        <tr key={i}>
                          <td>{row.mark}</td>
                          <td>{row.fanC}</td>
                          <td>{row.fanF}</td>
                          <td>{row.uses}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>

          <div className={styles.downloadSection}>
            <a href="/downloads/fan-oven-conversion-chart.pdf" className={styles.downloadBtn} download>
              {t('charts.download.text')}
            </a>
          </div>
        </section>

        <section className={styles.foodSpecific} id="food-guide">
          <h2>{t('foodGuide.title')}</h2>
          <div className={styles.foodGrid}>
            <div className={styles.foodCard}>
              <h3>{t('foodGuide.breads.title')}</h3>
              <ul>
                {(t('foodGuide.breads.items') as FoodGuideItem[]).map((item, index: number) => (
                  <li key={index}>
                    <strong dangerouslySetInnerHTML={{ __html: item.text }} />
                  </li>
                ))}
              </ul>
              <p className={styles.tip}>{t('foodGuide.breads.tip')}</p>
            </div>
            <div className={styles.foodCard}>
              <h3>{t('foodGuide.cakes.title')}</h3>
              <ul>
                {(t('foodGuide.cakes.items') as FoodGuideItem[]).map((item, index: number) => (
                  <li key={index}>
                    <strong dangerouslySetInnerHTML={{ __html: item.text }} />
                  </li>
                ))}
              </ul>
              <p className={styles.tip}>{t('foodGuide.cakes.tip')}</p>
            </div>
            <div className={styles.foodCard}>
              <h3>{t('foodGuide.meats.title')}</h3>
              <ul>
                {(t('foodGuide.meats.items') as FoodGuideItem[]).map((item, index: number) => (
                  <li key={index}>
                    <strong dangerouslySetInnerHTML={{ __html: item.text }} />
                  </li>
                ))}
              </ul>
              <p className={styles.tip}>{t('foodGuide.meats.tip')}</p>
            </div>
          </div>
        </section>

        <section className={styles.proTips} id="pro-tips">
          <h2>{t('proTips.title')}</h2>
          <div className={styles.tipsGrid}>
            {(t('proTips.tips') as ProTip[]).map((tip, index: number) => (
              <div key={index} className={styles.tipCard}>
                <h3>{tip.title}</h3>
                <p>{tip.text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className={styles.faqSection} id="faqs">
          <h2>{t('faqs.title')}</h2>

          <div className={styles.faqGrid}>
            {(t('faqs.items') as FaqItem[]).map((faq, index: number) => (
              <div key={index} className={styles.faqItem}>
                <h4>{faq.question}</h4>
                <p>{faq.answer}</p>
              </div>
            ))}
          </div>

          <div className={styles.accordion}>
            {(t('faqs.accordion') as FaqAccordionItem[]).map((item, index: number) => (
              <div key={index} className={styles.accordionItem}>
                <button
                  className={`${styles.accordionBtn} ${expandedAccordion === index ? styles.active : ''}`}
                  onClick={() => toggleAccordion(index)}
                  onKeyDown={(e) => handleAccordionKeyDown(e, index)}
                  aria-expanded={expandedAccordion === index}
                  aria-controls={`accordion-content-${index}`}
                  id={`accordion-button-${index}`}
                >
                  {item.question}
                  <span className={styles.icon} aria-hidden="true">{expandedAccordion === index ? '−' : '+'}</span>
                </button>
                <div
                  className={`${styles.accordionContent} ${expandedAccordion === index ? styles.active : ''}`}
                  id={`accordion-content-${index}`}
                  role="region"
                  aria-labelledby={`accordion-button-${index}`}
                >
                  <p>{item.answer}</p>
                  {item.points && (
                    <ul>
                      {item.points.map((point: string, pointIndex: number) => (
                        <li key={pointIndex}>{point}</li>
                      ))}
                    </ul>
                  )}
                  {item.steps && (
                    <ol>
                      {item.steps.map((step: string, stepIndex: number) => (
                        <li key={stepIndex}>{step}</li>
                      ))}
                    </ol>
                  )}
                  {item.table && (
                    <table className={styles.comparisonTable}>
                      <thead>
                        <tr>
                          {item.table.headers.map((header: string, headerIndex: number) => (
                            <th key={headerIndex}>{header}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {item.table.rows.map((row: string[], rowIndex: number) => (
                          <tr key={rowIndex}>
                            {row.map((cell: string, cellIndex: number) => (
                              <td key={cellIndex}>{cell}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                  {item.conclusion && <p>{item.conclusion}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="editorial-note" style={{
          marginTop: '40px',
          padding: '25px',
          backgroundColor: '#f8fafc',
          borderRadius: '12px',
          border: '1px solid #e2e8f0',
          fontSize: '0.95rem',
          lineHeight: '1.6',
          color: '#475569',
          marginBottom: '40px'
        }}>
          <h4 style={{
            margin: '0 0 10px 0',
            color: '#1e293b',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '1.1rem'
          }}>
            <span style={{ fontSize: '1.2rem' }}>🛡️</span> {t('editorialNote.title')}
          </h4>
          <p style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: String(t('editorialNote.content')) }} />
        </section>
      </main>
      <Footer lastUpdated={lastUpdatedIso} />
    </Layout>
  );
}
