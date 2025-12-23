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
        storage?: TranslationItem;
        weather?: TranslationItem;
    };
    negative?: TranslationItem;
    page?: {
        title?: string;
        description?: string;
        resultText?: string;
    };
}

export default function Temperature4C() {
    const celsius = 4;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale, pageTranslation } = useTranslation('4-c-to-f');
    const pageT = useMemo(() => (pageTranslation as PageTranslation) || {}, [pageTranslation]);

    const replacements = useMemo(() => ({
        fahrenheit: formatTemperature(fahrenheit),
        celsius: String(celsius),
        negativeFahrenheit: formatTemperature(celsiusToFahrenheit(-celsius))
    }), [celsius, fahrenheit]);

    const strategy = useMemo(() => {
        // 传递触发关键词：cold refrigerator storage weather freezing temperature chart
        const s = generateContentStrategy(celsius, 'cold refrigerator storage weather freezing temperature chart celsius fahrenheit conversion');

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

        // 添加天气相关的洞察
        if (pageT.context?.weather) {
            insights.push({
                type: 'tip' as const,
                title: replace(pageT.context.weather.title || ''),
                content: replace(pageT.context.weather.content || '')
            });
        }

        // 添加存储相关的洞察
        if (pageT.context?.storage) {
            insights.push({
                type: 'tip' as const,
                title: replace(pageT.context.storage.title || ''),
                content: replace(pageT.context.storage.content || '')
            });
        }

        // 添加安全相关的洞察
        if (pageT.context?.safety) {
            insights.push({
                type: 'warning' as const,
                title: replace(pageT.context.safety.title || ''),
                content: replace(pageT.context.safety.content || '')
            });
        }

        // 添加环境相关的洞察
        if (pageT.context?.environmental) {
            insights.push({
                type: 'fact' as const,
                title: replace(pageT.context.environmental.title || ''),
                content: replace(pageT.context.environmental.content || '')
            });
        }

        // 注入负温描述以确保内容完整
        if (pageT.negative) {
            insights.push({
                type: 'fact' as const,
                title: replace(pageT.negative.result || ''),
                content: replace(pageT.negative.description || '')
            });
        }

        s.insights = insights;

        // 针对4°C的特殊配置
        s.modules.showHealthAlert = true; // 启用健康预警（低温提示）
        s.modules.showHumanFeel = true; // 启用天气体感（寒冷天气建议）
        s.modules.showConversionGuide = true; // 显示转换指南
        s.modules.showPracticalApps = true; // 显示实用应用场景

        // 🟢 SEO Optimization: Add unique, non-templated text for 4°C
        s.text.intro = "4°C (39.2°F) is a scientifically significant temperature where water reaches its maximum density. In daily life, this is the gold standard for refrigerator settings, ensuring food stays fresh and safe without freezing.";

        return s;
    }, [celsius, pageT, replacements]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="4-c-to-f"
            lastUpdated="2025-12-19"
            canonicalUrl={canonicalUrl}
            customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
            customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
            customResultHeader={replacePlaceholders(pageT.page?.resultText || '', replacements)}
        />
    );
}