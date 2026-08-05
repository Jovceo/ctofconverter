import fs from 'fs';
import path from 'path';
import { useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { FahrenheitToCelsiusPage } from '../components/FahrenheitToCelsiusPage';
import pageStyles from '../styles/TemperatureTemplate.module.css';
import { getLatestModifiedDate } from '../utils/dateHelpers';

const FAHRENHEIT = 375;
const CANONICAL_URL = 'https://ctofconverter.com/375-f-to-c';
const DISCLAIMER = 'Baking times are guidelines based on standard home conventions. Always confirm doneness with a food thermometer, especially for poultry and fish. Source: USDA Food Safety and Inspection Service.';

interface PageTranslation {
  page: {
    metaTitle: string;
    metaDescription: string;
    headerTitle: string;
    tagline: string;
    resultHeader: string;
    customIntro: string;
  };
  sections: {
    why375: {
      title: string;
      paragraph1: string;
      paragraph2: string;
    };
    bakingFoods: {
      title: string;
      intro: string;
      headers: { food: string; celsius: string; time: string; note: string };
      rows: Array<{ food: string; celsius: string; time: string; note: string }>;
      source: string;
    };
    ovenTypes: {
      title: string;
      intro: string;
      headers: { ovenType: string; equivalent: string; note: string };
      rows: Array<{ ovenType: string; equivalent: string; note: string }>;
    };
    tempCompare: {
      title: string;
      intro: string;
      headers: { temp: string; celsius: string; gasMark: string; typical: string };
      rows: Array<{ temp: string; celsius: string; gasMark: string; typical: string }>;
    };
    formula: {
      title: string;
      intro: string;
      formula: string;
      steps: Array<{ step: string; calculation: string }>;
      note: string;
    };
  };
  faq: Array<{ question: string; answer: string }>;
}

export const getStaticProps: GetStaticProps = async () => {
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/375-f-to-c.tsx',
    'locales/en/375-f-to-c.json',
  ]);

  const filePath = path.join(process.cwd(), 'locales', 'en', '375-f-to-c.json');
  const pageTrans: PageTranslation = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    props: {
      lastUpdatedIso,
      pageTrans,
    },
  };
};

export default function Temperature375FtoC({
  lastUpdatedIso,
  pageTrans,
}: {
  lastUpdatedIso: string;
  pageTrans: PageTranslation;
}) {
  const pageT = useMemo(() => pageTrans, [pageTrans]);

  const customSections = useMemo(() => (
    <>
      {/* Section 1: Why 375 */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.why375.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.why375.paragraph1}</p>
        <p className={pageStyles.sectionText}>{pageT.sections.why375.paragraph2}</p>
      </section>

      {/* Section 2: What to Bake at 375 */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.bakingFoods.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.bakingFoods.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.bakingFoods.headers.food}</th>
                <th scope="col">{pageT.sections.bakingFoods.headers.celsius}</th>
                <th scope="col">{pageT.sections.bakingFoods.headers.time}</th>
                <th scope="col">{pageT.sections.bakingFoods.headers.note}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.bakingFoods.rows.map((row) => (
                <tr key={row.food}>
                  <td><strong>{row.food}</strong></td>
                  <td>{row.celsius}</td>
                  <td>{row.time}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>{pageT.sections.bakingFoods.source}</div>
      </section>

      {/* Section 3: Oven Types */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.ovenTypes.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.ovenTypes.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.ovenTypes.headers.ovenType}</th>
                <th scope="col">{pageT.sections.ovenTypes.headers.equivalent}</th>
                <th scope="col">{pageT.sections.ovenTypes.headers.note}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.ovenTypes.rows.map((row) => (
                <tr key={row.ovenType}>
                  <td><strong>{row.ovenType}</strong></td>
                  <td>{row.equivalent}</td>
                  <td>{row.note}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 4: Temp Comparison */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.tempCompare.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.tempCompare.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.tempCompare.headers.temp}</th>
                <th scope="col">{pageT.sections.tempCompare.headers.celsius}</th>
                <th scope="col">{pageT.sections.tempCompare.headers.gasMark}</th>
                <th scope="col">{pageT.sections.tempCompare.headers.typical}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.tempCompare.rows.map((row) => (
                <tr key={row.temp} style={row.temp === '375°F' ? { backgroundColor: '#fef3c7' } : undefined}>
                  <td><strong>{row.temp}</strong></td>
                  <td>{row.celsius}</td>
                  <td>{row.gasMark}</td>
                  <td>{row.typical}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Formula */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.formula.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.formula.intro}</p>
        <div className={pageStyles.noteBox}>
          <strong>{pageT.sections.formula.formula}</strong>
        </div>
        <ol className={pageStyles.customList}>
          {pageT.sections.formula.steps.map((step) => (
            <li key={step.step}>
              <strong>{step.step}</strong>: {step.calculation}
            </li>
          ))}
        </ol>
        <p className={pageStyles.sectionText}>{pageT.sections.formula.note}</p>
      </section>

      {/* Internal Links */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>Related Resources</h2>
        <ul className={pageStyles.customList}>
          <li>
            <Link href="/oven-temperature-conversion" className={pageStyles.sectionLink}>
              Oven Temperature Conversion Guide
            </Link>
            {' '}- Convert between °C, °F, Gas Mark, fan, and air fryer
          </li>
          <li>
            <Link href="/fan-oven-conversion-chart" className={pageStyles.sectionLink}>
              Fan Oven Conversion Chart
            </Link>
            {' '}- Conventional to fan oven temperature mapping
          </li>
          <li>
            <Link href="/oven-to-air-fryer" className={pageStyles.sectionLink}>
              Oven to Air Fryer
            </Link>
            {' '}- Temperature and time adjustments for air fryers
          </li>
          <li>
            <Link href="/180-c-to-f" className={pageStyles.sectionLink}>
              180°C to Fahrenheit
            </Link>
            {' '}- The UK equivalent baking temperature
          </li>
          <li>
            <Link href="/c-to-f-calculator" className={pageStyles.sectionLink}>
              Celsius to Fahrenheit Calculator
            </Link>
            {' '}- Universal temperature converter tool
          </li>
        </ul>
      </section>
    </>
  ), [pageT]);

  return (
    <FahrenheitToCelsiusPage
      fahrenheit={FAHRENHEIT}
      canonicalUrl={CANONICAL_URL}
      lastUpdated={lastUpdatedIso}
      customMetaTitle={pageT.page.metaTitle}
      customMetaDescription={pageT.page.metaDescription}
      customHeaderTitle={pageT.page.headerTitle}
      customTagline={pageT.page.tagline}
      customResultHeader={pageT.page.resultHeader}
      customIntro={pageT.page.customIntro}
      customSections={customSections}
      faq={pageT.faq}
      customDisclaimer={DISCLAIMER}
    />
  );
}