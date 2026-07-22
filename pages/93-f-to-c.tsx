import fs from 'fs';
import path from 'path';
import { useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { FahrenheitToCelsiusPage } from '../components/FahrenheitToCelsiusPage';
import pageStyles from '../styles/TemperatureTemplate.module.css';
import { getLatestModifiedDate } from '../utils/dateHelpers';

const FAHRENHEIT = 93;
const CANONICAL_URL = 'https://ctofconverter.com/93-f-to-c';

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
    bodyTemp: {
      title: string;
      intro: string;
      stagesTable: {
        title: string;
        headers: { stage: string; tempF: string; tempC: string; symptoms: string };
        rows: Array<{ stage: string; tempF: string; tempC: string; symptoms: string }>;
        note: string;
      };
    };
    whatToDo: {
      title: string;
      intro: string;
      steps: Array<{ action: string; detail: string }>;
      warnings: string[];
      emergency: string;
      disclaimer: string;
    };
    weather: {
      title: string;
      intro: string;
      heatIndexTable: {
        title: string;
        headers: { humidity: string; feelsLikeF: string; feelsLikeC: string; riskLevel: string };
        rows: Array<{ humidity: string; feelsLikeF: string; feelsLikeC: string; riskLevel: string }>;
        note: string;
      };
      safetyTips: string[];
    };
    comparisonTable: {
      title: string;
      headers: { reading: string; celsius: string; meaning: string };
      rows: Array<{ reading: string; celsius: string; meaning: string }>;
    };
    formula: {
      title: string;
      intro: string;
      formula: string;
      steps: Array<{ step: string; calculation: string }>;
      shortcut: string;
    };
  };
  faq: Array<{ question: string; answer: string }>;
}

export const getStaticProps: GetStaticProps = async () => {
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/93-f-to-c.tsx',
    'locales/en/93-f-to-c.json',
  ]);

  const filePath = path.join(process.cwd(), 'locales', 'en', '93-f-to-c.json');
  const pageTrans: PageTranslation = JSON.parse(fs.readFileSync(filePath, 'utf8'));

  return {
    props: {
      lastUpdatedIso,
      pageTrans,
    },
  };
};

export default function Temperature93FtoC({
  lastUpdatedIso,
  pageTrans,
}: {
  lastUpdatedIso: string;
  pageTrans: PageTranslation;
}) {
  const pageT = useMemo(() => pageTrans, [pageTrans]);

  const customSections = useMemo(() => (
    <>
      {/* Section 1: Body Temperature - Hypothermia */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.bodyTemp.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.bodyTemp.intro}</p>
        <h3 className={pageStyles.boxTitle}>{pageT.sections.bodyTemp.stagesTable.title}</h3>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.bodyTemp.stagesTable.headers.stage}</th>
                <th scope="col">{pageT.sections.bodyTemp.stagesTable.headers.tempF}</th>
                <th scope="col">{pageT.sections.bodyTemp.stagesTable.headers.tempC}</th>
                <th scope="col">{pageT.sections.bodyTemp.stagesTable.headers.symptoms}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.bodyTemp.stagesTable.rows.map((row) => (
                <tr key={row.stage}>
                  <td><strong>{row.stage}</strong></td>
                  <td>{row.tempF}</td>
                  <td>{row.tempC}</td>
                  <td>{row.symptoms}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>{pageT.sections.bodyTemp.stagesTable.note}</div>
      </section>

      {/* Section 2: What to Do */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.whatToDo.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.whatToDo.intro}</p>
        <ol className={pageStyles.customList}>
          {pageT.sections.whatToDo.steps.map((step) => (
            <li key={step.action}>
              <strong>{step.action}</strong> - {step.detail}
            </li>
          ))}
        </ol>
        <h3 className={pageStyles.boxTitle}>What NOT to Do</h3>
        <ul className={pageStyles.customList}>
          {pageT.sections.whatToDo.warnings.map((warning) => (
            <li key={warning}>{warning}</li>
          ))}
        </ul>
        <div className={pageStyles.noteBox}>
          <strong>Emergency:</strong> {pageT.sections.whatToDo.emergency}
        </div>
        <div className={pageStyles.noteBox}>
          <em>{pageT.sections.whatToDo.disclaimer}</em>
        </div>
      </section>

      {/* Section 3: Weather - Heat Index */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.weather.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.weather.intro}</p>
        <h3 className={pageStyles.boxTitle}>{pageT.sections.weather.heatIndexTable.title}</h3>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.weather.heatIndexTable.headers.humidity}</th>
                <th scope="col">{pageT.sections.weather.heatIndexTable.headers.feelsLikeF}</th>
                <th scope="col">{pageT.sections.weather.heatIndexTable.headers.feelsLikeC}</th>
                <th scope="col">{pageT.sections.weather.heatIndexTable.headers.riskLevel}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.weather.heatIndexTable.rows.map((row) => (
                <tr key={row.humidity}>
                  <td>{row.humidity}</td>
                  <td>{row.feelsLikeF}</td>
                  <td>{row.feelsLikeC}</td>
                  <td>{row.riskLevel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>{pageT.sections.weather.heatIndexTable.note}</div>
        <h3 className={pageStyles.boxTitle}>Heat Safety Tips</h3>
        <ul className={pageStyles.customList}>
          {pageT.sections.weather.safetyTips.map((tip) => (
            <li key={tip}>{tip}</li>
          ))}
        </ul>
      </section>

      {/* Section 4: Body Temperature Comparison Chart */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.comparisonTable.title}</h2>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.comparisonTable.headers.reading}</th>
                <th scope="col">{pageT.sections.comparisonTable.headers.celsius}</th>
                <th scope="col">{pageT.sections.comparisonTable.headers.meaning}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.comparisonTable.rows.map((row) => (
                <tr key={row.reading} style={row.reading === '93°F' ? { backgroundColor: '#fef3c7' } : undefined}>
                  <td><strong>{row.reading}</strong></td>
                  <td>{row.celsius}</td>
                  <td>{row.meaning}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Section 5: Conversion Formula */}
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
        <p className={pageStyles.sectionText}>{pageT.sections.formula.shortcut}</p>
      </section>

      {/* Internal Links */}
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>Related Resources</h2>
        <ul className={pageStyles.customList}>
          <li>
            <Link href="/c-to-f-calculator" className={pageStyles.sectionLink}>
              Celsius to Fahrenheit Calculator
            </Link>
            {' '}- Universal temperature converter tool
          </li>
          <li>
            <Link href="/fahrenheit-to-celsius" className={pageStyles.sectionLink}>
              Fahrenheit to Celsius Guide
            </Link>
            {' '}- Complete F to C conversion reference
          </li>
          <li>
            <Link href="/fever-temperature-chart" className={pageStyles.sectionLink}>
              Fever Temperature Chart
            </Link>
            {' '}- Body temperature guide covering hypothermia to high fever
          </li>
          <li>
            <Link href="/body-temperature-chart-fever-guide" className={pageStyles.sectionLink}>
              Body Temperature Guide
            </Link>
            {' '}- Detailed body temperature reference for all ages
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
      howToName={pageT.sections.whatToDo.title}
      howToSteps={pageT.sections.whatToDo.steps.map(s => ({ name: s.action, text: s.detail }))}
    />
  );
}
