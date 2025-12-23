import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, replacePlaceholders } from '../utils/i18n';
import { celsiusToFahrenheit, formatTemperature, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

interface TranslationItem {
  title?: string;
  content?: string;
  items?: string[];
  question?: string;
  answer?: string;
  result?: string;
  description?: string;
}

interface PageTranslation {
  faq?: { items: TranslationItem[] };
  warning?: TranslationItem;
  context?: {
    medical?: TranslationItem;
    environmental?: TranslationItem;
    cooking?: TranslationItem;
    oven?: TranslationItem;
    industrial?: TranslationItem;
    safety?: TranslationItem;
  };
  negative?: TranslationItem;
  page?: {
    title?: string;
    description?: string;
    resultText?: string;
  };
}

export default function Temperature47C() {
  const celsius = 47;
  const fahrenheit = celsiusToFahrenheit(celsius);
  const { locale, pageTranslation } = useTranslation('47-c-to-f');
  const pageT = useMemo(() => (pageTranslation as PageTranslation) || {}, [pageTranslation]);

  const replacements = useMemo(() => ({
    fahrenheit: formatTemperature(fahrenheit),
    celsius: String(celsius),
    negativeFahrenheit: formatTemperature(celsiusToFahrenheit(-celsius))
  }), [celsius, fahrenheit]);

  const strategy = useMemo(() => {
    const s = generateContentStrategy(celsius);

    const replace = (text: string) => replacePlaceholders(text || '', replacements);

    // 注入 JSON 中的特定 FAQ
    if (pageT.faq && pageT.faq.items) {
      s.faqs = pageT.faq.items.map((item: TranslationItem) => ({
        question: replace(item.question || ''),
        answer: replace(item.answer || '')
      }));
    }

    const insights: { type: 'warning' | 'tip' | 'fact'; title: string; content: string }[] = [];

    // 注入项目列表的辅助函数
    const processContext = (context: TranslationItem | undefined, type: 'warning' | 'tip' | 'fact') => {
      if (!context) return;
      let content = replace(context.content || '');
      if (context.items && Array.isArray(context.items)) {
        content += `<ul style="margin-top: 10px; padding-left: 20px;">${context.items.map((it: string) => `<li>${replace(it)}</li>`).join('')}</ul>`;
      }
      insights.push({ type, title: replace(context.title || ''), content });
    };

    // 注入医学/环境/烹饪警告作为 Insights
    if (pageT.warning) {
      insights.push({
        type: 'warning' as const,
        title: replace(pageT.warning.title || ''),
        content: replace(pageT.warning.content || '')
      });
    }

    processContext(pageT.context?.medical, 'warning');
    processContext(pageT.context?.environmental, 'tip');
    processContext(pageT.context?.cooking, 'fact');

    // 注入负温描述以确保内容完整
    if (pageT.negative) {
      insights.push({
        type: 'fact' as const,
        title: replace(pageT.negative.result || ''),
        content: replace(pageT.negative.description || '')
      });
    }

    s.insights = insights;

    // 禁用默认模块，使用我们注入的高质量内容
    s.modules.showHealthAlert = false;
    s.modules.showHumanFeel = true; // 保留天气组件
    s.modules.showConversionGuide = false;
    s.modules.showPracticalApps = false;

    return s;
  }, [celsius, pageT, replacements]);

  const canonicalUrl = generatePageUrl(celsius, locale);

  return (
    <TemperaturePage
      celsius={celsius}
      strategy={strategy}
      customNamespace="47-c-to-f"
      lastUpdated="2025-12-19"
      canonicalUrl={canonicalUrl}
      customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
      customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
    />
  );
}
