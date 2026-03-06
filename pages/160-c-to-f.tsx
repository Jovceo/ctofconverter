import fs from 'fs';
import path from 'path';
import { useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { TemperaturePage } from '../components/TemperaturePage';
import pageStyles from '../styles/TemperatureTemplate.module.css';
import { generateContentStrategy } from '../utils/contentStrategy';
import { getLatestModifiedDate } from '../utils/dateHelpers';
import { useTranslation, getLocalizedLink, getSceneKeywords } from '../utils/i18n';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { generatePageUrl } from '../utils/temperaturePageHelpers';

const CELSIUS = 160;

interface PageTranslation {
  page: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    headerTitle: string;
    tagline: string;
    resultHeader: string;
  };
  sections: {
    about: {
      title: string;
      paragraph1Prefix: string;
      boilingPointLinkText: string;
      paragraph1Suffix: string;
      paragraph2: string;
      paragraph3: string;
    };
    applications: {
      title: string;
      cards: Array<{
        title: string;
        items: string[];
      }>;
    };
    ovenGuide: {
      title: string;
      headers: {
        ovenType: string;
        adjustedTemperature: string;
        bestUse: string;
      };
      rows: Array<{
        type: string;
        temperature: string;
        bestUse: string;
      }>;
      notePrefix: string;
      noteLinkText: string;
      noteSuffix: string;
    };
  };
  faq: Array<{
    question: string;
    answer: string;
  }>;
}

function loadJSON(locale: string, file: string): Partial<PageTranslation> {
  try {
    const filePath = path.join(process.cwd(), 'locales', locale, file);
    return JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch {
    return {};
  }
}

function mergePageTranslations(
  base: Partial<PageTranslation>,
  override: Partial<PageTranslation>
): PageTranslation {
  return {
    page: {
      ...(base.page || {}),
      ...(override.page || {}),
    },
    sections: {
      about: {
        ...(base.sections?.about || {}),
        ...(override.sections?.about || {}),
      },
      applications: {
        ...(base.sections?.applications || {}),
        ...(override.sections?.applications || {}),
        cards: override.sections?.applications?.cards || base.sections?.applications?.cards || [],
      },
      ovenGuide: {
        ...(base.sections?.ovenGuide || {}),
        ...(override.sections?.ovenGuide || {}),
        headers: {
          ...(base.sections?.ovenGuide?.headers || {}),
          ...(override.sections?.ovenGuide?.headers || {}),
        },
        rows: override.sections?.ovenGuide?.rows || base.sections?.ovenGuide?.rows || [],
      },
    },
    faq: override.faq || base.faq || [],
  } as PageTranslation;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/160-c-to-f.tsx',
    'components/TemperaturePage.tsx',
    'public/160-c-to-f.html',
    'locales/en/160-c-to-f.json',
    `locales/${locale}/160-c-to-f.json`,
    'config/migrated-routes.json',
  ]);

  const enTrans = loadJSON('en', '160-c-to-f.json');
  const locTrans = locale !== 'en' ? loadJSON(locale, '160-c-to-f.json') : {};

  return {
    props: {
      lastUpdatedIso,
      availablePages: getAvailableTemperaturePages(),
      pageTrans: mergePageTranslations(enTrans, locTrans),
    },
  };
};

export default function Temperature160C({
  lastUpdatedIso,
  availablePages,
  pageTrans,
}: {
  lastUpdatedIso: string;
  availablePages: number[];
  pageTrans: PageTranslation;
}) {
  const { locale, t } = useTranslation('template');
  const boilingPointUrl = useMemo(() => getLocalizedLink('/100-c-to-f', locale), [locale]);
  const fanOvenChartUrl = useMemo(() => getLocalizedLink('/fan-oven-conversion-chart', locale), [locale]);
  const pageT = useMemo(() => pageTrans, [pageTrans]);

  const strategy = useMemo(() => {
    const localizedKeywords = getSceneKeywords(CELSIUS, 'cooking', locale);
    const baseStrategy = generateContentStrategy(CELSIUS, localizedKeywords, t);

    baseStrategy.insights = [];
    baseStrategy.modules.showPracticalApps = false;
    baseStrategy.modules.showOvenGuide = false;
    baseStrategy.faqs = pageT.faq.map((item) => ({
      question: item.question,
      answer: item.answer,
    }));
    baseStrategy.meta = {
      ...(baseStrategy.meta || {}),
      ogDescription: pageT.page.ogDescription,
    };

    return baseStrategy;
  }, [locale, pageT, t]);

  const customSections = useMemo(() => (
    <>
      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.about.title}</h2>
        <p className={pageStyles.sectionText}>
          {pageT.sections.about.paragraph1Prefix}
          <Link href={boilingPointUrl} className={pageStyles.sectionLink}>
            {pageT.sections.about.boilingPointLinkText}
          </Link>
          {pageT.sections.about.paragraph1Suffix}
        </p>
        <p className={pageStyles.sectionText}>{pageT.sections.about.paragraph2}</p>
        <p className={pageStyles.sectionText}>{pageT.sections.about.paragraph3}</p>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.applications.title}</h2>
        <div className={pageStyles.customGrid}>
          {pageT.sections.applications.cards.map((card) => (
            <article key={card.title} className={pageStyles.customPanel}>
              <h3 className={pageStyles.customPanelTitle}>{card.title}</h3>
              <ul className={pageStyles.customList}>
                {card.items.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.ovenGuide.title}</h2>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.ovenGuide.headers.ovenType}</th>
                <th scope="col">{pageT.sections.ovenGuide.headers.adjustedTemperature}</th>
                <th scope="col">{pageT.sections.ovenGuide.headers.bestUse}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.ovenGuide.rows.map((row) => (
                <tr key={row.type}>
                  <td>{row.type}</td>
                  <td>{row.temperature}</td>
                  <td>{row.bestUse}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>
          {pageT.sections.ovenGuide.notePrefix}
          <Link href={fanOvenChartUrl} className={pageStyles.sectionLink}>
            {pageT.sections.ovenGuide.noteLinkText}
          </Link>
          {pageT.sections.ovenGuide.noteSuffix}
        </div>
      </section>
    </>
  ), [boilingPointUrl, fanOvenChartUrl, pageT]);

  const canonicalUrl = generatePageUrl(CELSIUS, locale);

  return (
    <TemperaturePage
      celsius={CELSIUS}
      strategy={strategy}
      canonicalUrl={canonicalUrl}
      lastUpdated={lastUpdatedIso}
      availablePages={availablePages}
      customMetaTitle={pageT.page.metaTitle}
      customMetaDescription={pageT.page.metaDescription}
      customHeaderTitle={pageT.page.headerTitle}
      customTagline={pageT.page.tagline}
      customResultHeader={pageT.page.resultHeader}
      customSections={customSections}
      disableSmartFaqs={true}
      showEditorialNote={true}
    />
  );
}
