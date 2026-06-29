import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import OvenTemperatureConverter from '../components/OvenTemperatureConverter';
import styles from '../styles/oven-to-air-fryer.module.css';

const SITE_ORIGIN = 'https://ctofconverter.com';
const CANONICAL_URL = `${SITE_ORIGIN}/oven-to-air-fryer`;

const AIR_FRYER_CHART = [
  { dish: 'Frozen french fries', conventionalC: 220, conventionalF: 428, airFryer: 200, time: '12-15 min' },
  { dish: 'Chicken wings', conventionalC: 200, conventionalF: 392, airFryer: 180, time: '20-25 min' },
  { dish: 'Chicken breast (boneless)', conventionalC: 200, conventionalF: 392, airFryer: 180, time: '12-15 min' },
  { dish: 'Salmon fillet', conventionalC: 190, conventionalF: 374, airFryer: 170, time: '10-12 min' },
  { dish: 'Roasted vegetables', conventionalC: 220, conventionalF: 428, airFryer: 200, time: '10-15 min' },
  { dish: 'Frozen chicken nuggets', conventionalC: 200, conventionalF: 392, airFryer: 180, time: '8-10 min' },
  { dish: 'Baked potato', conventionalC: 200, conventionalF: 392, airFryer: 180, time: '35-40 min' },
  { dish: 'Steak (medium-rare)', conventionalC: 230, conventionalF: 446, airFryer: 200, time: '8-12 min' },
  { dish: 'Muffins / cupcakes', conventionalC: 180, conventionalF: 356, airFryer: 160, time: '10-12 min' },
  { dish: 'Pizza (reheat)', conventionalC: 200, conventionalF: 392, airFryer: 180, time: '3-5 min' },
];

const HOWTO_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'How to Convert Oven Recipes for Air Fryer',
  description: 'Convert conventional oven temperatures and cooking times for air fryer use.',
  step: [
    { '@type': 'HowToStep', name: 'Reduce the temperature', text: 'Subtract 20°C (35°F) from the conventional oven temperature. For example, 200°C becomes 180°C for the air fryer.' },
    { '@type': 'HowToStep', name: 'Reduce the cooking time', text: 'Check for doneness 20-25% earlier than the recipe suggests. Start checking at 75% of the original cooking time.' },
    { '@type': 'HowToStep', name: 'Prepare the food', text: 'Lightly coat food with oil for crispiness. Do not overfill the basket — leave space for air circulation.' },
    { '@type': 'HowToStep', name: 'Cook and check', text: 'Shake or flip halfway through cooking. Use a food thermometer to confirm internal temperature meets USDA guidelines.' },
  ],
};

const FAQ_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: 'How do I convert a conventional oven recipe to air fryer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Reduce the temperature by 20°C (or 35°F). For example, if a recipe says 200°C/400°F in a conventional oven, set your air fryer to 180°C/350°F. Also reduce cooking time by about 20-25%.' }
    },
    {
      '@type': 'Question',
      name: 'Can I bake in an air fryer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Yes, air fryers work well for small-batch baking like muffins, cookies, and small cakes. Reduce the recipe temperature by 20°C and check for doneness 5 minutes early to avoid burning.' }
    },
    {
      '@type': 'Question',
      name: 'Do I need to preheat an air fryer?',
      acceptedAnswer: { '@type': 'Answer', text: 'Most air fryers reach temperature in 3-5 minutes, much faster than conventional ovens. Preheating is recommended for best results, but is not strictly necessary for longer cooks.' }
    },
    {
      '@type': 'Question',
      name: 'Why does air fryer food cook faster than oven food?',
      acceptedAnswer: { '@type': 'Answer', text: 'Air fryers are smaller and circulate hot air more intensely than full-size convection ovens. The concentrated heat cooks food faster, which is why both temperature and time reductions are needed.' }
    },
  ],
};

const WEBPAGE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  name: 'Oven to Air Fryer Temperature Conversion',
  description: 'Convert conventional oven temperatures to air fryer settings. Free interactive converter with cooking chart for chicken, vegetables, fries, steak, and more.',
  url: CANONICAL_URL,
  inLanguage: 'en',
  datePublished: '2026-06-29',
  dateModified: '2026-06-29',
  publisher: { '@type': 'Organization', name: 'Ctofconverter', url: SITE_ORIGIN },
  about: { '@type': 'Thing', name: 'Air Fryer Temperature Conversion' },
};

export default function OvenToAirFryer() {
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
      title: 'Oven to Air Fryer Temperature Conversion — °C to °F Converter',
      description: 'Convert conventional oven temperatures to air fryer settings instantly. Interactive tool with cooking chart for chicken, fries, vegetables, steak, and more.',
      canonical: CANONICAL_URL,
      ogTitle: 'Oven to Air Fryer Temperature Conversion',
      ogDescription: 'Convert oven recipes to air fryer settings. Interactive temperature converter with cooking time chart.',
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
          <span>Oven to Air Fryer Temperature Conversion</span>
        </nav>

        <h1>Oven to Air Fryer Temperature Conversion</h1>

        <div className={styles.answerCapsule}>
          <strong>Answer:</strong> To convert a conventional oven recipe for an air fryer, reduce the temperature by 20°C (or 35°F) and check for doneness about 20-25% earlier. For example, a recipe calling for 200°C (400°F) in a conventional oven should be cooked at 180°C (350°F) in an air fryer.
        </div>

        <section className={styles.toolSection}>
          <h2>Air Fryer Temperature Converter</h2>
          <p>Enter any temperature to see conversions across oven types, including air fryer.</p>
          <OvenTemperatureConverter />
        </section>

        <section className={styles.contentSection}>
          <h2>How to Convert Oven Recipes for Air Fryer</h2>
          <p>The conversion is straightforward but requires two adjustments:</p>

          <h3>1. Reduce Temperature by 20°C (35°F)</h3>
          <p>Air fryers are compact convection ovens. The concentrated heat means you need a lower temperature than a conventional oven. The standard reduction is <strong>20°C</strong> or roughly <strong>35°F</strong>.</p>

          <h3>2. Reduce Cooking Time by 20-25%</h3>
          <p>Because air fryers cook faster, start checking your food earlier. If a recipe says 30 minutes in a conventional oven, check at 20-22 minutes in the air fryer. Cooking times vary by air fryer model, batch size, and food density.</p>

          <div className={styles.tipBox}>
            <h3>Quick Rule of Thumb</h3>
            <p>Set your air fryer to the <strong>same temperature as a fan/convection oven</strong> recipe. If you only have a conventional oven recipe, subtract 20°C. When in doubt, it is better to cook at a slightly lower temperature and add time than to burn the outside while the inside is still raw.</p>
          </div>
        </section>

        <section className={styles.contentSection}>
          <h2>Common Oven-to-Air-Fryer Conversions</h2>
          <div className={styles.chartWrapper}>
            <table className={styles.conversionTable}>
              <thead>
                <tr>
                  <th>Dish</th>
                  <th>Conventional Oven</th>
                  <th>Air Fryer</th>
                  <th>Air Fryer Time</th>
                </tr>
              </thead>
              <tbody>
                {AIR_FRYER_CHART.map((row, i) => (
                  <tr key={i}>
                    <td>{row.dish}</td>
                    <td>{row.conventionalC}°C / {row.conventionalF}°F</td>
                    <td>{row.airFryer}°C</td>
                    <td>{row.time}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p><small>Times are approximate. Always check internal temperature with a food thermometer. USDA recommends 74°C (165°F) for poultry, 63°C (145°F) for steaks and fish. Temperature conversion formula per NIST.</small></p>
        </section>

        <section className={styles.contentSection}>
          <h2>Tips for Better Air Fryer Results</h2>

          <h3>Do Not Overfill the Basket</h3>
          <p>Air fryers need space for hot air to circulate. Fill the basket no more than halfway for crispy results. Overcrowding leads to steaming instead of air frying.</p>

          <h3>Shake or Flip Halfway Through</h3>
          <p>For even cooking, shake the basket (for fries, vegetables, nuggets) or flip larger items (chicken, fish, steak) halfway through the cooking time.</p>

          <h3>Oil is Optional but Helps</h3>
          <p>A light spray of oil (1-2 teaspoons) helps achieve a golden, crispy exterior. Use an oil sprayer or brush — tossing food in a bowl with oil works best for even coverage.</p>

          <h3>Use an Oven-Safe Thermometer</h3>
          <p>Since air fryers cook faster than ovens, relying on time alone can lead to undercooked or overcooked food. A probe thermometer inserted into the thickest part of meat takes the guesswork out.</p>
        </section>

        <section className={styles.faqSection}>
          <h2>Frequently Asked Questions</h2>

          {[
            { q: 'How do I convert a conventional oven recipe to air fryer?', a: 'Reduce the temperature by 20°C (or 35°F) and reduce cooking time by about 20-25%. For example, 200°C/400°F for 30 minutes in a conventional oven becomes 180°C/350°F for 20-22 minutes in an air fryer.' },
            { q: 'Can I bake in an air fryer?', a: 'Yes, air fryers work well for small-batch baking. Muffins, cookies, and small cakes bake well at 160°C (fan equivalent) with about 5 minutes less time than a conventional oven recipe calls for.' },
            { q: 'Do I need to preheat an air fryer?', a: 'Most air fryers reach temperature in 3-5 minutes. Preheating is recommended for best results but is not essential for longer cooks (over 15 minutes).' },
            { q: 'Why does air fryer food cook faster than oven food?', a: 'Air fryers are smaller and circulate hot air more intensely than full-size ovens. The concentrated heat cooks food faster, which is why both temperature and time reductions are needed.' },
          ].map((faq, i) => (
            <div key={i} className={styles.faqItem}>
              <button
                className={styles.faqTrigger}
                onClick={() => toggleFaq(i)}
                onKeyDown={(e) => handleFaqKeyDown(e, i)}
                aria-expanded={expandedFaq === i}
                aria-controls={`af-faq-answer-${i}`}
                id={`af-faq-question-${i}`}
              >
                {faq.q}
                <span className={styles.faqIcon} aria-hidden="true">{expandedFaq === i ? '−' : '+'}</span>
              </button>
              <div
                id={`af-faq-answer-${i}`}
                role="region"
                aria-labelledby={`af-faq-question-${i}`}
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
            <li><Link href="/oven-temperature-conversion">Oven Temperature Conversion Guide — °C to °F, Gas Mark &amp; Fan</Link></li>
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
