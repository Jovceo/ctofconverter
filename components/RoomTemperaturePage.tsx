import { useMemo } from 'react';

import { TemperaturePage } from './TemperaturePage';
import { generateContentStrategy } from '../utils/contentStrategy';
import { getLocalizedLink, useTranslation } from '../utils/i18n';
import { generatePageUrl } from '../utils/temperaturePageHelpers';
import { normalizeMigratedUrl } from '../utils/normalizeMigratedUrl';
import { LocalizedTemperaturePageProps } from '../utils/temperaturePageStaticProps';

interface GuideCard {
  desc?: string;
  label?: string;
  value?: string;
}

interface GuideRow {
  desc?: string;
  highlight?: boolean;
  href?: string;
  temp?: string;
  use?: string;
}

export interface RoomTemperaturePageTranslation {
  conversion?: {
    intro?: string;
  };
  comfortGuide?: {
    chart?: {
      cold?: GuideCard;
      moderate?: GuideCard;
      warm?: GuideCard;
    };
    intro?: string;
    note?: string;
    subtitle?: string;
    table?: {
      headers?: {
        description?: string;
        temperature?: string;
        typicalUse?: string;
      };
      rows?: GuideRow[];
    };
    title?: string;
  };
  faq?: Array<{
    answer?: string;
    answerHtml?: string;
    items?: string[];
    question?: string;
  }>;
  header?: {
    tagline?: string;
    title?: string;
  };
  seo?: {
    description?: string;
    title?: string;
  };
  strategy?: {
    keywords?: string;
  };
}

interface RoomTemperaturePageProps extends LocalizedTemperaturePageProps<RoomTemperaturePageTranslation> {
  celsius: number;
}

function normalizeHtmlLinks(html: string, locale: string): string {
  return html.replace(/href="([^"]+)"/g, (_, href: string) => {
    const normalizedHref = normalizeMigratedUrl(href);

    if (/^https?:\/\//.test(normalizedHref)) {
      return `href="${normalizedHref}"`;
    }

    // Keep legacy .html links at the site root until those pages are migrated.
    if (normalizedHref.startsWith('/') && normalizedHref.endsWith('.html')) {
      return `href="${normalizedHref}"`;
    }

    if (normalizedHref.startsWith('/')) {
      return `href="${getLocalizedLink(normalizedHref, locale)}"`;
    }

    return `href="${normalizedHref}"`;
  });
}

function renderTableRows(rows: GuideRow[] = [], locale: string): string {
  return rows
    .map((row) => {
      const normalizedHref = row.href ? normalizeMigratedUrl(row.href) : '';
      const resolvedHref =
        normalizedHref.startsWith('/') && !normalizedHref.endsWith('.html')
          ? getLocalizedLink(normalizedHref, locale)
          : normalizedHref;
      const temperature = row.href ? `<a href="${resolvedHref}">${row.temp || ''}</a>` : row.temp || '';
      const rowStyle = row.highlight ? ' style="background-color: #e8f5e9;"' : '';

      return `
        <tr${rowStyle}>
          <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${temperature}</td>
          <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${row.desc || ''}</td>
          <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${row.use || ''}</td>
        </tr>
      `;
    })
    .join('');
}

function buildComfortGuideHtml(guide: RoomTemperaturePageTranslation['comfortGuide'] | undefined, locale: string): string {
  const rows = guide?.table?.rows || [];

  return `
    <h3 style="margin-top: 0;">${guide?.subtitle || 'How this temperature feels'}</h3>
    <p>${guide?.intro || ''}</p>

    <div style="display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap;">
      <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #3498db;">
        <div style="font-size: 1.2rem; color: #7f8c8d;">${guide?.chart?.cold?.label || 'Cool'}</div>
        <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${guide?.chart?.cold?.value || '10-15°C'}</div>
        <div>${guide?.chart?.cold?.desc || '50-59°F<br>Light jacket weather'}</div>
      </div>

      <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #27ae60;">
        <div style="font-size: 1.2rem; color: #7f8c8d;">${guide?.chart?.moderate?.label || 'Comfortable'}</div>
        <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${guide?.chart?.moderate?.value || '18-24°C'}</div>
        <div>${guide?.chart?.moderate?.desc || '64-75°F<br>Comfortable indoor range'}</div>
      </div>

      <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #e67e22;">
        <div style="font-size: 1.2rem; color: #7f8c8d;">${guide?.chart?.warm?.label || 'Warm'}</div>
        <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${guide?.chart?.warm?.value || '25-30°C'}</div>
        <div>${guide?.chart?.warm?.desc || '77-86°F<br>Warm weather and light clothing'}</div>
      </div>
    </div>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      <thead>
        <tr>
          <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${guide?.table?.headers?.temperature || 'Temperature'}</th>
          <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${guide?.table?.headers?.description || 'Description'}</th>
          <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${guide?.table?.headers?.typicalUse || 'Typical use'}</th>
        </tr>
      </thead>
      <tbody>
        ${renderTableRows(rows, locale)}
      </tbody>
    </table>

    <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px;">
      <p>${guide?.note || ''}</p>
    </div>
  `;
}

function getDefaultKeywords(celsius: number): string {
  if (celsius <= 22) {
    return 'room temperature comfortable indoor weather celsius fahrenheit conversion';
  }

  return 'warm weather room temperature indoor comfort celsius fahrenheit conversion';
}

export default function RoomTemperaturePage({
  alternateLocales,
  availablePages,
  celsius,
  lastUpdatedIso,
  pageTrans,
}: RoomTemperaturePageProps) {
  const { locale } = useTranslation('template');
  const pageT = useMemo(() => pageTrans || {}, [pageTrans]);

  const strategy = useMemo(() => {
    const baseStrategy = generateContentStrategy(celsius, pageT.strategy?.keywords || getDefaultKeywords(celsius));

    baseStrategy.meta = {
      ...baseStrategy.meta,
      description: pageT.seo?.description || baseStrategy.meta?.description,
      ogDescription: pageT.seo?.description || baseStrategy.meta?.ogDescription,
      title: pageT.seo?.title || baseStrategy.meta?.title,
    };

    baseStrategy.insights = [
      {
        type: 'fact',
        title: pageT.comfortGuide?.title || 'Temperature comfort guide',
        content: buildComfortGuideHtml(pageT.comfortGuide, locale),
      },
    ];

    baseStrategy.faqs = (pageT.faq || []).map((faq) => {
      const answerHtml = faq.answerHtml ? normalizeHtmlLinks(faq.answerHtml, locale) : '';
      const itemsHtml =
        faq.items && faq.items.length > 0
          ? `<ul>${faq.items.map((item) => `<li>${item}</li>`).join('')}</ul>`
          : '';
      const answer = faq.answer ? `<p>${faq.answer}</p>` : '';

      return {
        answer: answerHtml || `${answer}${itemsHtml}`,
        question: faq.question || '',
      };
    });

    baseStrategy.modules.showHealthAlert = false;
    baseStrategy.modules.showHumanFeel = true;
    baseStrategy.modules.showOvenGuide = false;
    baseStrategy.modules.showPracticalApps = true;

    return baseStrategy;
  }, [celsius, locale, pageT]);

  return (
    <TemperaturePage
      alternateLocales={alternateLocales}
      availablePages={availablePages}
      canonicalUrl={generatePageUrl(celsius, locale)}
      celsius={celsius}
      customDescription={pageT.seo?.description}
      customHeaderTitle={pageT.header?.title}
      customIntro={pageT.conversion?.intro}
      customTagline={pageT.header?.tagline}
      customTitle={pageT.seo?.title}
      disableSmartFaqs={true}
      lastUpdated={lastUpdatedIso}
      showEditorialNote={true}
      strategy={strategy}
    />
  );
}
