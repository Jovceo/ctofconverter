import React, { useState, useMemo, useCallback } from 'react';
import Layout from './Layout';
import Navigation from './Navigation';
import Footer from './Footer';
import Head from 'next/head';
import Link from 'next/link';
import pageStyles from '../styles/TemperatureTemplate.module.css';
import conversionToolStyles from './ConversionTool/index.module.css';
import { fahrenheitToCelsius, formatTemperature } from '../utils/fahrenheitHelpers';
import { getLatestModifiedDate } from '../utils/dateHelpers';

export interface FahrenheitToCelsiusPageProps {
  fahrenheit: number;
  canonicalUrl: string;
  lastUpdated: string;
  customMetaTitle: string;
  customMetaDescription: string;
  customHeaderTitle: string;
  customTagline: string;
  customResultHeader: string;
  customIntro: string;
  customSections: React.ReactNode;
  faq: Array<{ question: string; answer: string }>;
  howToSteps?: Array<{ name: string; text: string }>;
  howToName?: string;
  customDisclaimer?: string;
}

// F->C Converter Component
const FToCConverter: React.FC<{ initialFahrenheit: number }> = React.memo(({ initialFahrenheit }) => {
  const [fahrenheit, setFahrenheit] = useState(String(initialFahrenheit));
  const [celsius, setCelsius] = useState<string | null>(
    formatTemperature(fahrenheitToCelsius(initialFahrenheit), 1)
  );
  const [copySuccess, setCopySuccess] = useState(false);

  const handleFahrenheitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFahrenheit(value);

    if (value && !isNaN(parseFloat(value))) {
      const c = fahrenheitToCelsius(parseFloat(value));
      setCelsius(formatTemperature(c, 1));
    } else {
      setCelsius(null);
    }
    setCopySuccess(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (celsius) {
      navigator.clipboard.writeText(`${fahrenheit}°F = ${celsius}°C`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [fahrenheit, celsius]);

  return (
    <div className={conversionToolStyles.converterTool}>
      <div className={conversionToolStyles.converterForm}>
        <div className={conversionToolStyles.inputGroup}>
          <div className={conversionToolStyles.inputHeader}>
            <label htmlFor="fahrenheit-input">Fahrenheit (°F)</label>
          </div>
          <input
            id="fahrenheit-input"
            type="number"
            value={fahrenheit}
            onChange={handleFahrenheitChange}
            placeholder="Enter Fahrenheit"
            className={conversionToolStyles.temperatureInput}
          />
        </div>

        <div className={conversionToolStyles.resultContainer} role="region" aria-live="polite">
          <div className={conversionToolStyles.resultHeader}>
            <label>Celsius (°C)</label>
          </div>
          <output className={conversionToolStyles.resultValue}>
            {celsius ? celsius : '--'}
          </output>
          <button
            className={`${conversionToolStyles.copyButton} ${!celsius ? conversionToolStyles.copyButtonDisabled : ''}`}
            onClick={handleCopy}
            disabled={!celsius}
          >
            {copySuccess ? 'Copied!' : 'Copy Result'}
          </button>
        </div>
      </div>
    </div>
  );
});

FToCConverter.displayName = 'FToCConverter';

// FAQ Accordion Component — answers always rendered in DOM, CSS controls visibility
const FAQAccordion: React.FC<{ faqs: Array<{ question: string; answer: string }> }> = React.memo(({ faqs }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const toggleFAQ = useCallback((index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  return (
    <section className="faq-section">
      <h2>Frequently Asked Questions</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${expandedIndex === index ? 'active' : ''}`}>
            <div
              className="faq-question"
              role="button"
              tabIndex={0}
              aria-expanded={expandedIndex === index}
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFAQ(index);
                }
              }}
            >
              {faq.question}
            </div>
            <div
              className={`faq-answer${expandedIndex === index ? ' faq-answer-visible' : ''}`}
              role="region"
              aria-hidden={expandedIndex !== index}
            >
              {faq.answer}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

FAQAccordion.displayName = 'FAQAccordion';

// Main Component
export const FahrenheitToCelsiusPage: React.FC<FahrenheitToCelsiusPageProps> = ({
  fahrenheit,
  canonicalUrl,
  lastUpdated,
  customMetaTitle,
  customMetaDescription,
  customHeaderTitle,
  customTagline,
  customResultHeader,
  customIntro,
  customSections,
  faq,
  howToSteps,
  howToName,
  customDisclaimer,
}) => {
  const celsius = useMemo(() => fahrenheitToCelsius(fahrenheit), [fahrenheit]);
  const formattedCelsius = useMemo(() => formatTemperature(celsius, 1), [celsius]);
  const formattedFahrenheit = useMemo(() => formatTemperature(fahrenheit), [fahrenheit]);

  const isoDate = useMemo(() => {
    const date = lastUpdated ? new Date(lastUpdated) : new Date();
    return date.toISOString();
  }, [lastUpdated]);

  // Structured Data
  const structuredData = useMemo(() => {
    const siteOrigin = new URL(canonicalUrl).origin;

    return {
      webPage: {
        '@context': 'https://schema.org',
        '@type': 'WebPage',
        name: customMetaTitle,
        description: customMetaDescription,
        url: canonicalUrl,
        inLanguage: 'en',
        mainEntity: {
          '@type': 'SoftwareApplication',
          name: `${fahrenheit}°F to °C Converter`,
          applicationCategory: 'UtilityApplication',
          operatingSystem: 'Any',
          offers: { '@type': 'Offer', price: '0', priceCurrency: 'USD' },
        },
        dateModified: isoDate,
      },
      faq: {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faq.map(item => ({
          '@type': 'Question',
          name: item.question,
          acceptedAnswer: {
            '@type': 'Answer',
            text: item.answer,
          },
        })),
      },
      breadcrumb: {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: siteOrigin },
          { '@type': 'ListItem', position: 2, name: `${fahrenheit}°F to Celsius`, item: canonicalUrl },
        ],
      },
      howTo: howToSteps && howToSteps.length > 0 ? {
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: howToName || `What to Do If a Body Temperature Reads ${fahrenheit}°F`,
        step: howToSteps.map((step, index) => ({
          '@type': 'HowToStep',
          position: index + 1,
          name: step.name,
          text: step.text,
        })),
      } : null,
    };
  }, [canonicalUrl, customMetaTitle, customMetaDescription, fahrenheit, faq, isoDate, howToSteps, howToName]);

  const alternates = useMemo(() => [
    { href: canonicalUrl, hreflang: 'x-default' },
    { href: canonicalUrl, hreflang: 'en' },
  ], [canonicalUrl]);

  return (
    <Layout seo={{
      title: customMetaTitle,
      description: customMetaDescription,
      canonical: canonicalUrl,
      ogTitle: customMetaTitle,
      ogDescription: customMetaDescription,
      ogUrl: canonicalUrl,
      ogType: 'article',
      twitterCard: 'summary_large_image',
      twitterTitle: customMetaTitle,
      twitterDescription: customMetaDescription,
      alternates,
    }}>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webPage) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.breadcrumb) }} />
        {structuredData.howTo && (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.howTo) }} />
        )}
      </Head>

      <div>
        <header className="site-header">
          <div className="container">
            <div className="site-logo">
              <Link href="/">
                <span aria-hidden="true">C to F Converter</span>
              </Link>
            </div>
            <h1>{customHeaderTitle}</h1>
            <p className={pageStyles.tagline} dangerouslySetInnerHTML={{ __html: customTagline }} />
          </div>
        </header>

        <Navigation />

        <main id="main-content" className="container">
          <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
            <ol className="breadcrumb">
              <li><Link href="/">Home</Link></li>
              <li aria-current="page">{fahrenheit}°F to Celsius</li>
            </ol>
          </nav>

          <div className="temperature-content-grid">
            <section className={pageStyles.box}>
              <h2 id="conversion-title" className={pageStyles.boxTitle}>
                {customResultHeader}
              </h2>

              {/* Answer Capsule */}
              <p
                className={pageStyles.introText}
                dangerouslySetInnerHTML={{ __html: customIntro }}
              />

              {/* F->C Converter */}
              <FToCConverter initialFahrenheit={fahrenheit} />
            </section>

            {/* Custom sections (body temperature, weather, tables, etc.) */}
            {customSections}

            {/* FAQ */}
            <FAQAccordion faqs={faq} />

            {/* Editorial note */}
            <section className={pageStyles.box}>
              <p className={pageStyles.sectionText}>
                <em>Last updated: {new Date(isoDate).toLocaleDateString('en', { year: 'numeric', month: 'long', day: 'numeric' })}. {customDisclaimer ?? 'This page is for informational purposes only and is not a substitute for professional medical advice. In emergencies, call 911 immediately.'}</em>
              </p>
            </section>
          </div>
        </main>

        <Footer lastUpdated={isoDate} />
      </div>
    </Layout>
  );
};

FahrenheitToCelsiusPage.displayName = 'FahrenheitToCelsiusPage';

export default FahrenheitToCelsiusPage;
