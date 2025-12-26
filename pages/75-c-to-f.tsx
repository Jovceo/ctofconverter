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
        intro?: string;
        resultText?: string;
    };
}

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { GetStaticProps } from 'next';

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/75-c-to-f.tsx',
        `locales/${locale}/75-c-to-f.json`
    ]);

    return {
        props: {
            lastUpdatedIso
        }
    };
};

export default function Temperature75C({ lastUpdatedIso }: { lastUpdatedIso: string }) {
    const celsius = 75;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale, pageTranslation } = useTranslation('75-c-to-f');
    const pageT = useMemo(() => (pageTranslation as PageTranslation) || {}, [pageTranslation]);

    const replacements = useMemo(() => ({
        fahrenheit: formatTemperature(fahrenheit),
        celsius: String(celsius),
        negativeFahrenheit: formatTemperature(celsiusToFahrenheit(-celsius))
    }), [celsius, fahrenheit]);

    const strategy = useMemo(() => {
        // 传递触发关键词：tea(绿茶), chicken(禽肉安全), water(烫伤风险), oven(烤箱)
        const s = generateContentStrategy(celsius, 'tea chicken water oven baking search');

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

        if (pageT.warning) {
            insights.push({
                type: 'warning' as const,
                title: replace(pageT.warning.title || ''),
                content: replace(pageT.warning.content || '')
            });
        }

        processContext(pageT.context?.oven, 'tip');
        processContext(pageT.context?.industrial, 'fact');
        processContext(pageT.context?.safety, 'warning');

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
        s.modules.showHumanFeel = false; // 75度超出了人类体感范围，不显示天气
        s.modules.showConversionGuide = false; // 隐藏默认公式说明，保持简洁
        s.modules.showPracticalApps = false; // 已在 insights 中包含特定应用场景

        // 🟢 SEO Optimization: Use localized unique text
        s.text.intro = replace(pageT.page?.intro || '');

        return s;
    }, [celsius, pageT, replacements]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="75-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
            customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
        />
    );
}
