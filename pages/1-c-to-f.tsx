import { useMemo } from 'react';

import { TemperaturePage } from '../components/TemperaturePage';
import { generateContentStrategy } from '../utils/contentStrategy';
import { replacePlaceholders, useTranslation } from '../utils/i18n';
import { celsiusToFahrenheit, formatTemperature, generatePageUrl } from '../utils/temperaturePageHelpers';
import {
  createTemperaturePageStaticProps,
  LocalizedTemperaturePageProps,
} from '../utils/temperaturePageStaticProps';

interface TranslationItem {
  answer?: string;
  content?: string;
  description?: string;
  items?: string[];
  question?: string;
  result?: string;
  title?: string;
}

interface PageTranslation {
  context?: {
    environmental?: TranslationItem;
    safety?: TranslationItem;
    weather?: TranslationItem;
  };
  faq?: { items: TranslationItem[] };
  negative?: TranslationItem;
  page?: {
    description?: string;
    intro?: string;
    title?: string;
  };
  warning?: TranslationItem;
}

export const getStaticProps = createTemperaturePageStaticProps<PageTranslation>('1-c-to-f');

export default function Temperature1C({
  alternateLocales,
  availablePages,
  lastUpdatedIso,
  pageTrans,
}: LocalizedTemperaturePageProps<PageTranslation>) {
  const celsius = 1;
  const fahrenheit = celsiusToFahrenheit(celsius);
  const { locale } = useTranslation('1-c-to-f');
  const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

  const replacements = useMemo(
    () => ({
      celsius: String(celsius),
      fahrenheit: formatTemperature(fahrenheit),
      negativeFahrenheit: formatTemperature(celsiusToFahrenheit(-celsius)),
    }),
    [celsius, fahrenheit]
  );

  const strategy = useMemo(() => {
    const replace = (text: string) => replacePlaceholders(text || '', replacements);
    const s = generateContentStrategy(
      celsius,
      '1 celsius to fahrenheit near freezing weather frost formula kelvin fever comparison'
    );

    if (pageT.faq?.items) {
      s.faqs = pageT.faq.items.map((item) => ({
        answer: replace(item.answer || ''),
        question: replace(item.question || ''),
      }));
    }

    const insights: { content: string; title: string; type: 'warning' | 'tip' | 'fact' }[] = [];

    const processContext = (context: TranslationItem | undefined, type: 'warning' | 'tip' | 'fact') => {
      if (!context) {
        return;
      }

      let content = replace(context.content || '');
      if (context.items && Array.isArray(context.items)) {
        content += `<ul style="margin-top: 10px; padding-left: 20px;">${context.items
          .map((item) => `<li>${replace(item)}</li>`)
          .join('')}</ul>`;
      }

      insights.push({
        content,
        title: replace(context.title || ''),
        type,
      });
    };

    if (pageT.warning) {
      insights.push({
        content: replace(pageT.warning.content || ''),
        title: replace(pageT.warning.title || ''),
        type: 'warning',
      });
    }

    processContext(pageT.context?.weather, 'tip');
    processContext(pageT.context?.safety, 'warning');
    processContext(pageT.context?.environmental, 'fact');

    if (pageT.negative) {
      insights.push({
        content: replace(pageT.negative.description || ''),
        title: replace(pageT.negative.result || ''),
        type: 'fact',
      });
    }

    s.insights = insights;
    s.modules.showConversionGuide = false;
    s.modules.showHealthAlert = true;
    s.modules.showHumanFeel = true;
    s.modules.showPracticalApps = false;
    s.text.intro = replace(pageT.page?.intro || '');

    return s;
  }, [celsius, pageT, replacements]);

  return (
    <TemperaturePage
      alternateLocales={alternateLocales}
      availablePages={availablePages}
      canonicalUrl={generatePageUrl(celsius, locale)}
      celsius={celsius}
      customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
      customIntro={replacePlaceholders(pageT.page?.intro || '', replacements)}
      customNamespace="1-c-to-f"
      customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
      disableSmartFaqs={true}
      lastUpdated={lastUpdatedIso}
      showEditorialNote={true}
      strategy={strategy}
    />
  );
}
