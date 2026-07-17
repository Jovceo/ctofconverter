import fs from 'fs';
import path from 'path';
import { useMemo } from 'react';
import type { GetStaticProps } from 'next';
import Link from 'next/link';

import { TemperaturePage } from '../components/TemperaturePage';
import pageStyles from '../styles/TemperatureTemplate.module.css';
import { generateContentStrategy } from '../utils/contentStrategy';
import { getLatestModifiedDate } from '../utils/dateHelpers';
import { useTranslation, getSceneKeywords } from '../utils/i18n';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { generatePageUrl } from '../utils/temperaturePageHelpers';

const CELSIUS = 180;
const FAN_OVEN_CHART_URL = '/fan-oven-conversion-chart';

interface PageTranslation {
  page: {
    metaTitle: string;
    metaDescription: string;
    ogDescription: string;
    headerTitle: string;
    tagline: string;
    resultHeader: string;
    customIntro?: string;
  };
  sections: {
    about: {
      title: string;
      paragraph1: string;
      paragraph2: string;
      paragraph3Prefix: string;
      fanLinkText: string;
      paragraph3Suffix: string;
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
    bakingTimes: {
      title: string;
      intro: string;
      headers: {
        food: string;
        time: string;
        doneness: string;
      };
      rows: Array<{
        food: string;
        time: string;
        doneness: string;
      }>;
      note: string;
    };
    foodSafety: {
      title: string;
      intro: string;
      headers: {
        foodType: string;
        tempF: string;
        tempC: string;
      };
      rows: Array<{
        foodType: string;
        tempF: string;
        tempC: string;
      }>;
      source: string;
    };
    whatNotToBake: {
      title: string;
      intro: string;
      items: Array<{
        food: string;
        reason: string;
      }>;
    };
    troubleshooting: {
      title: string;
      intro: string;
      headers: {
        problem: string;
        cause: string;
        fix: string;
      };
      rows: Array<{
        problem: string;
        cause: string;
        fix: string;
      }>;
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
      bakingTimes: {
        ...(base.sections?.bakingTimes || {}),
        ...(override.sections?.bakingTimes || {}),
        headers: {
          ...(base.sections?.bakingTimes?.headers || {}),
          ...(override.sections?.bakingTimes?.headers || {}),
        },
        rows: override.sections?.bakingTimes?.rows || base.sections?.bakingTimes?.rows || [],
      },
      foodSafety: {
        ...(base.sections?.foodSafety || {}),
        ...(override.sections?.foodSafety || {}),
        headers: {
          ...(base.sections?.foodSafety?.headers || {}),
          ...(override.sections?.foodSafety?.headers || {}),
        },
        rows: override.sections?.foodSafety?.rows || base.sections?.foodSafety?.rows || [],
      },
      whatNotToBake: {
        ...(base.sections?.whatNotToBake || {}),
        ...(override.sections?.whatNotToBake || {}),
        items: override.sections?.whatNotToBake?.items || base.sections?.whatNotToBake?.items || [],
      },
      troubleshooting: {
        ...(base.sections?.troubleshooting || {}),
        ...(override.sections?.troubleshooting || {}),
        headers: {
          ...(base.sections?.troubleshooting?.headers || {}),
          ...(override.sections?.troubleshooting?.headers || {}),
        },
        rows: override.sections?.troubleshooting?.rows || base.sections?.troubleshooting?.rows || [],
      },
    },
    faq: override.faq || base.faq || [],
  } as PageTranslation;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/180-c-to-f.tsx',
    'components/TemperaturePage.tsx',
    'public/180-c-to-f',
    'locales/en/180-c-to-f.json',
    `locales/${locale}/180-c-to-f.json`,
    'config/migrated-routes.json',
  ]);

  const enTrans = loadJSON('en', '180-c-to-f.json');
  const locTrans = locale !== 'en' ? loadJSON(locale, '180-c-to-f.json') : {};
  const pageIntro = enTrans.page?.customIntro;

  return {
    props: {
      lastUpdatedIso,
      availablePages: getAvailableTemperaturePages(),
      pageTrans: mergePageTranslations(enTrans, locTrans),
      pageIntro: pageIntro || null,
    },
  };
};

export default function Temperature180C({
  lastUpdatedIso,
  availablePages,
  pageTrans,
  pageIntro,
}: {
  lastUpdatedIso: string;
  availablePages: number[];
  pageTrans: PageTranslation;
  pageIntro?: string | null;
}) {
  const { locale, t } = useTranslation('template');
  const pageT = useMemo(() => pageTrans, [pageTrans]);

  const strategy = useMemo(() => {
    const localizedKeywords = getSceneKeywords(CELSIUS, 'cooking', locale);
    const baseStrategy = generateContentStrategy(
      CELSIUS,
      `${localizedKeywords} oven air fryer baking roasting convection fan oven`,
      t
    );

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
        <p className={pageStyles.sectionText}>{pageT.sections.about.paragraph1}</p>
        <p className={pageStyles.sectionText}>{pageT.sections.about.paragraph2}</p>
        <p className={pageStyles.sectionText}>
          {pageT.sections.about.paragraph3Prefix}
          <Link href={FAN_OVEN_CHART_URL} className={pageStyles.sectionLink}>
            {pageT.sections.about.fanLinkText}
          </Link>
          {pageT.sections.about.paragraph3Suffix}
        </p>
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
          <Link href={FAN_OVEN_CHART_URL} className={pageStyles.sectionLink}>
            {pageT.sections.ovenGuide.noteLinkText}
          </Link>
          {pageT.sections.ovenGuide.noteSuffix}
        </div>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.bakingTimes.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.bakingTimes.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.bakingTimes.headers.food}</th>
                <th scope="col">{pageT.sections.bakingTimes.headers.time}</th>
                <th scope="col">{pageT.sections.bakingTimes.headers.doneness}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.bakingTimes.rows.map((row) => (
                <tr key={row.food}>
                  <td>{row.food}</td>
                  <td>{row.time}</td>
                  <td>{row.doneness}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>{pageT.sections.bakingTimes.note}</div>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.foodSafety.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.foodSafety.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.foodSafety.headers.foodType}</th>
                <th scope="col">{pageT.sections.foodSafety.headers.tempF}</th>
                <th scope="col">{pageT.sections.foodSafety.headers.tempC}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.foodSafety.rows.map((row) => (
                <tr key={row.foodType}>
                  <td>{row.foodType}</td>
                  <td>{row.tempF}</td>
                  <td>{row.tempC}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className={pageStyles.noteBox}>{pageT.sections.foodSafety.source}</div>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.whatNotToBake.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.whatNotToBake.intro}</p>
        <ul className={pageStyles.customList}>
          {pageT.sections.whatNotToBake.items.map((item) => (
            <li key={item.food}>
              <strong>{item.food}</strong> — {item.reason}
            </li>
          ))}
        </ul>
      </section>

      <section className={pageStyles.box}>
        <h2 className={pageStyles.boxTitle}>{pageT.sections.troubleshooting.title}</h2>
        <p className={pageStyles.sectionText}>{pageT.sections.troubleshooting.intro}</p>
        <div className={pageStyles.customTableWrap}>
          <table className={pageStyles.customTable}>
            <thead>
              <tr>
                <th scope="col">{pageT.sections.troubleshooting.headers.problem}</th>
                <th scope="col">{pageT.sections.troubleshooting.headers.cause}</th>
                <th scope="col">{pageT.sections.troubleshooting.headers.fix}</th>
              </tr>
            </thead>
            <tbody>
              {pageT.sections.troubleshooting.rows.map((row) => (
                <tr key={row.problem}>
                  <td>{row.problem}</td>
                  <td>{row.cause}</td>
                  <td>{row.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </>
  ), [pageT]);

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
      customIntro={pageIntro || undefined}
      customSections={customSections}
      disableSmartFaqs={true}
      showEditorialNote={true}
      alternateLocales={['en']}
    />
  );
}
