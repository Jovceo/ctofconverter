import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import OvenTemperatureConverter from '../components/OvenTemperatureConverter';
import styles from '../styles/oven-temperature-conversion.module.css';

const SITE_ORIGIN = 'https://ctofconverter.com';
const CANONICAL_URL = `${SITE_ORIGIN}/oven-temperature-conversion`;

const CONVERSION_ROWS = [
  { c: 120, f: 248, fan: 100, gas: '½', use: 'Very low — keeping food warm, meringues' },
  { c: 140, f: 284, fan: 120, gas: '1', use: 'Low — slow roasts, stews' },
  { c: 150, f: 302, fan: 130, gas: '2', use: 'Low — roasting lamb, pork shoulder' },
  { c: 160, f: 320, fan: 140, gas: '3', use: 'Moderate — baked custards, cheesecakes' },
  { c: 170, f: 338, fan: 150, gas: '3', use: 'Moderate — sponge cakes, cookies' },
  { c: 180, f: 356, fan: 160, gas: '4', use: 'Moderate — most baking, bread, roasted chicken' },
  { c: 190, f: 374, fan: 170, gas: '5', use: 'Moderately hot — pastries, puff pastry' },
  { c: 200, f: 392, fan: 180, gas: '6', use: 'Hot — roasting vegetables, pizza' },
  { c: 210, f: 410, fan: 190, gas: '6', use: 'Hot — naan bread, quick roasts' },
  { c: 220, f: 428, fan: 200, gas: '7', use: 'Hot — searing meats, thin-crust pizza' },
  { c: 230, f: 446, fan: 210, gas: '8', use: 'Very hot — broiling, steak' },
  { c: 240, f: 464, fan: 220, gas: '9', use: 'Very hot — high-heat roasting' },
  { c: 250, f: 482, fan: 230, gas: '9+', use: 'Extremely hot — searing, wok cooking' },
  { c: 260, f: 500, fan: 240, gas: '10', use: 'Maximum — pizza ovens, professional use' },
];

const HOWTO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Oven Temperatures',
  description: 'Convert oven temperatures between Celsius, Fahrenheit, Gas Mark, fan oven, and air fryer settings.',
  step: [
    { '@type': 'HowToStep', name: 'Identify the recipe temperature', text: 'Note the temperature and unit from your recipe (Celsius, Fahrenheit, Gas Mark, or fan oven).' },
    { '@type': 'HowToStep', name: 'Convert to Celsius if needed', text: 'Use the formula °C = (°F − 32) × 5/9 to convert Fahrenheit. Look up Gas Mark in a conversion chart.' },
    { '@type': 'HowToStep', name: 'Adjust for oven type', text: 'Reduce the conventional temperature by 20°C for fan/convection ovens and air fryers. Use the interactive converter for exact values.' },
    { '@type': 'HowToStep', name: 'Set your oven', text: 'Set your oven to the converted temperature. For gas ovens, set the Gas Mark. Preheat before cooking.' },
  ],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'What is 180°C in Fahrenheit for baking?',
      acceptedAnswer: { '@type': 'Answer', text: '180°C (conventional) equals 356°F. This is the most common baking temperature and translates to Gas Mark 4 or 160°C in a fan oven.' }
    },
    {
      '@type': 'Question',
      name: 'How do I convert a fan oven temperature to a conventional oven?',
      acceptedAnswer: { '@type': 'Answer', text: 'Add 20°C to the fan oven temperature to get the conventional oven equivalent. For example, a fan oven at 160°C is 180°C in a conventional oven.' }
    },
    {
      '@type': 'Question',
      name: 'What gas mark is 200°C?',
      acceptedAnswer: { '@type': 'Answer', text: '200°C is Gas Mark 6. At 200°C, a fan oven should be set to 180°C and an air fryer to 180°C as well.' }
    },
    {
      '@type': 'Question',
      name: 'How do I convert oven temperature for an air fryer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Set your air fryer 20°C lower than a conventional oven recipe calls for. If a recipe says 200°C in a conventional oven, use 180°C in the air fryer.' }
    },
    {
      '@type': 'Question',
      name: 'What is the difference between a fan oven and a conventional oven?',
      acceptedAnswer: { '@type': 'Answer', text: 'A fan oven (also called convection oven) uses a fan to circulate hot air, cooking food faster and more evenly. Temperatures should be reduced by 20°C compared to conventional oven recipes.' }
    },
  ],
};

const WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Oven Temperature Conversion Guide — °C to °F, Gas Mark, Fan & Air Fryer',
  description: 'Convert oven temperatures between Celsius, Fahrenheit, Gas Mark, fan oven, and air fryer. Interactive tool with conversion chart and cooking tips.',
  url: CANONICAL_URL,
  inLanguage: 'en',
  datePublished: '2026-06-29',
  dateModified: '2026-06-29',
  publisher: { '@type': 'Organization', name: 'Ctofconverter', url: SITE_ORIGIN },
  about: { '@type': 'Thing', name: 'Oven Temperature Conversion' },
};

export default function OvenTemperatureConversion() {
  const [expandedFaq, setExpandedFaq] = useState<number | null>(null);

  const toggleFaq = useCallback((index: number) => {
    setExpandedFaq(expandedFaq === index ? null : index);
  }, [expandedFaq]);

  const handleFaqKeyDown = useCallback((e: React.KeyboardEvent, index: number) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleFaq(index);
    }
  }, [toggleFaq]);

  return (
    <Layout seo={{
      title: 'Oven Temperature Conversion Guide — °C to °F, Gas Mark & Fan Oven',
      description: 'Convert oven temperatures between Celsius, Fahrenheit, Gas Mark, fan oven, and air fryer. Interactive calculator with quick-reference chart for 120°C to 260°C.',
      canonical: CANONICAL_URL,
      ogTitle: 'Oven Temperature Conversion Guide — °C to °F, Gas Mark & Fan Oven',
      ogDescription: 'Interactive oven temperature converter with quick-reference chart. Convert between conventional °C, °F, Gas Mark, fan oven, and air fryer temperatures.',
      alternates: [{ hreflang: 'en', href: CANONICAL_URL, locale: 'en' }, { hreflang: 'x-default', href: CANONICAL_URL }],
    }}>
      <Head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBPAGE_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(HOWTO_SCHEMA) }} />
      </Head>
      <Header />
      <Navigation />

      <main id="main-content" className={styles.page}>
        <nav className={styles.breadcrumb} aria-label="Breadcrumb">
          <Link href="/">Home</Link>
          <span aria-hidden="true"> › </span>
          <span>Oven Temperature Conversion Guide</span>
        </nav>

        <h1>Oven Temperature Conversion Guide — °C to °F, Gas Mark, Fan &amp; Air Fryer</h1>

        <div className={styles.answerCapsule}>
          <strong>Answer:</strong> Convert oven temperatures between Celsius (°C), Fahrenheit (°F), Gas Mark, fan ovens, and air fryers using the interactive calculator. See the quick-reference chart for common baking and roasting temperatures from 50°C to 300°C.
        </div>

        <section className={styles.toolSection}>
          <h2>Interactive Oven Temperature Converter</h2>
          <p>Enter a temperature and select the oven type. All corresponding values are shown instantly.</p>
          <OvenTemperatureConverter />
        </section>

        <section className={styles.contentSection}>
          <h2>Oven Temperature Conversion Chart</h2>
          <p>Quick reference for the most common oven temperatures used in baking and roasting.</p>
          <div className={styles.chartWrapper}>
            <table className={styles.conversionTable}>
              <thead>
                <tr>
                  <th>Conventional °C</th>
                  <th>Conventional °F</th>
                  <th>Fan / Convection °C</th>
                  <th>Gas Mark</th>
                  <th>Common Use</th>
                </tr>
              </thead>
              <tbody>
                {CONVERSION_ROWS.map((row, i) => (
                  <tr key={i}>
                    <td>{row.c}°C</td>
                    <td>{row.f}°F</td>
                    <td>{row.fan}°C</td>
                    <td>{row.gas}</td>
                    <td>{row.use}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><small>Gas Mark values per UK Government standards. Temperature conversions use the formula °F = (°C × 9/5) + 32 (NIST). Common uses based on standard baking and roasting guidelines.</small></p>
        </section>

        <section className={styles.contentSection}>
          <h2>How to Convert Oven Temperatures</h2>

          <h3>Celsius to Fahrenheit</h3>
          <p>The standard formula for converting oven temperatures is: <strong>°F = (°C × 9/5) + 32</strong>. For example, 180°C × 9/5 + 32 = 356°F. To go the other way: <strong>°C = (°F − 32) × 5/9</strong>. So 350°F − 32 = 318, × 5/9 = 177°C, which rounds to 180°C.</p>

          <h3>Conventional Oven to Fan / Convection Oven</h3>
          <p>Fan ovens (also called convection ovens) circulate hot air, cooking food about 20% faster. <strong>Reduce the conventional temperature by 20°C</strong>. If a recipe says 200°C in a conventional oven, set your fan oven to 180°C. No need to adjust cooking time — the lower temperature compensates for the faster heat transfer.</p>

          <h3>Conventional Oven to Gas Mark</h3>
          <p>Gas Mark is a temperature scale used on gas ovens in the UK and Commonwealth countries. Each Gas Mark number corresponds to a specific Celsius range. <strong>Gas Mark 4 = 180°C (conventional)</strong> and is the most commonly called-for temperature. Gas Mark 1 starts at 140°C and Gas Mark 9 is 240°C.</p>

          <h3>Oven to Air Fryer Conversion</h3>
          <p>Air fryers are essentially small, powerful convection ovens. <strong>Reduce the conventional oven temperature by 20°C</strong> when converting to air fryer. Since air fryers cook faster due to their compact size, also check for doneness 20-25% earlier than the recipe suggests.</p>
        </section>

        <section className={styles.contentSection}>
          <h2>Temperature Guide by Oven Type</h2>

          <div className={styles.byTypeGrid}>
            <div className={styles.typeCard}>
              <h3>Fan / Convection Oven</h3>
              <p>Uses a fan to circulate hot air. Cooks food faster and more evenly. Always reduce conventional recipe temperature by 20°C. Common range: 100°C (keep warm) to 230°C (searing).</p>
              <ul>
                <li><strong>Baking:</strong> 160°C (conventional 180°C)</li>
                <li><strong>Roasting:</strong> 180°C (conventional 200°C)</li>
                <li><strong>Pizza:</strong> 200°C (conventional 220°C)</li>
              </ul>
            </div>

            <div className={styles.typeCard}>
              <h3>Gas Oven (Gas Mark)</h3>
              <p>Common in UK, Ireland, Australia, and New Zealand. Gas Mark ranges from ½ (120°C) to 10 (260°C). Gas ovens can have hot spots — rotate trays halfway through cooking.</p>
              <ul>
                <li><strong>Gas Mark 4:</strong> 180°C — standard baking</li>
                <li><strong>Gas Mark 6:</strong> 200°C — roasting, pizza</li>
                <li><strong>Gas Mark 8:</strong> 230°C — broiling, steak</li>
              </ul>
            </div>

            <div className={styles.typeCard}>
              <h3>Air Fryer</h3>
              <p>Compact convection oven. Same 20°C reduction rule applies. Check food 20-25% earlier than recipe time. Common range: 150°C (frozen fries) to 200°C (chicken wings).</p>
              <ul>
                <li><strong>Frozen foods:</strong> 180°C, 10-15 min</li>
                <li><strong>Fresh meat:</strong> 180°C, adjust time based on thickness</li>
                <li><strong>Vegetables:</strong> 200°C, 8-12 min</li>
              </ul>
            </div>

            <div className={styles.typeCard}>
              <h3>UK vs US vs Europe Differences</h3>
              <p>Recipes from different countries use different scales. UK recipes use Gas Mark and °C. US recipes use °F. European recipes use °C with fan oven as default. Always check which scale your recipe uses.</p>
              <ul>
                <li><strong>UK:</strong> Gas Mark + °C (conventional)</li>
                <li><strong>US:</strong> °F (conventional)</li>
                <li><strong>Europe:</strong> °C (fan/convection by default)</li>
              </ul>
            </div>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2>Common Cooking Temperatures Reference</h2>
          <div className={styles.chartWrapper}>
            <table className={styles.conversionTable}>
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Conventional °C</th>
                  <th>Conventional °F</th>
                  <th>Fan °C</th>
                  <th>Gas Mark</th>
                </tr>
              </thead>
              <tbody>
                <tr><td>Meringues</td><td>120°C</td><td>248°F</td><td>100°C</td><td>½</td></tr>
                <tr><td>Slow-roast pork shoulder</td><td>150°C</td><td>302°F</td><td>130°C</td><td>2</td></tr>
                <tr><td>Sponge cake</td><td>170°C</td><td>338°F</td><td>150°C</td><td>3</td></tr>
                <tr><td>Bread / sandwich loaf</td><td>180°C</td><td>356°F</td><td>160°C</td><td>4</td></tr>
                <tr><td>Roast chicken</td><td>190°C</td><td>374°F</td><td>170°C</td><td>5</td></tr>
                <tr><td>Pizza</td><td>220°C</td><td>428°F</td><td>200°C</td><td>7</td></tr>
                <tr><td>Steak (broiling)</td><td>230°C</td><td>446°F</td><td>210°C</td><td>8</td></tr>
              </tbody>
            </table>
          </div>
          <p><small>Source: USDA Safe Minimum Internal Temperature Chart, UK Government Gas Mark standards. Always use a food thermometer for meat doneness.</small></p>
        </section>

        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>

          {[
            { q: 'What is 180°C in Fahrenheit for baking?', a: '180°C (conventional) equals 356°F. This is the most common baking temperature and translates to Gas Mark 4 or 160°C in a fan oven.' },
            { q: 'How do I convert a fan oven temperature to a conventional oven?', a: 'Add 20°C to the fan oven temperature to get the conventional oven equivalent. For example, a fan oven at 160°C is 180°C in a conventional oven.' },
            { q: 'What gas mark is 200°C?', a: '200°C is Gas Mark 6. At 200°C, a fan oven should be set to 180°C and an air fryer to 180°C.' },
            { q: 'How do I convert oven temperature for an air fryer?', a: 'Set your air fryer 20°C lower than a conventional oven recipe calls for. If a recipe says 200°C in a conventional oven, use 180°C in the air fryer.' },
            { q: 'What is the difference between a fan oven and a conventional oven?', a: 'A fan oven (convection oven) uses a fan to circulate hot air, cooking food faster and more evenly. Temperatures should be reduced by 20°C compared to conventional oven recipes.' },
          ].map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqTrigger}
                onClick={() => toggleFaq(i)}
                onKeyDown={(e) => handleFaqKeyDown(e, i)}
                aria-expanded={expandedFaq === i}
                aria-controls={`faq-answer-${i}`}
                id={`faq-question-${i}`}
              >
                {faq.q}
                <span className={styles.faqIcon} aria-hidden="true">{expandedFaq === i ? '−' : '+'}</span>
              </button>
              <div
                id={`faq-answer-${i}`}
                role="region"
                aria-labelledby={`faq-question-${i}`}
                className={`${styles.faqAnswer}${expandedFaq === i ? ` ${styles.faqAnswerOpen}` : ''}`}
              >
                <p>{faq.a}</p>
              </div>
            </div>
          ))}
        </section>

        <div className={styles.internalLinks}>
          <h3>Related Guides</h3>
          <ul>
            <li><Link href="/oven-to-air-fryer">Oven to Air Fryer Temperature Conversion</Link></li>
            <li><Link href="/fan-oven-conversion-chart">Fan Oven Temperature Conversion Chart</Link></li>
            <li><Link href="/celsius-to-fahrenheit-chart">Celsius to Fahrenheit Conversion Chart</Link></li>
          </ul>
        </div>

        <p className={styles.lastUpdated}>Last updated: June 29, 2026</p>
      </main>

      <Footer lastUpdated="2026-06-29" />
    </Layout>
  );
}
