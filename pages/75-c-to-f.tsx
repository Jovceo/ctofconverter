import { TemperaturePage } from '../components/TemperaturePage';
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
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/75-c-to-f.tsx',
        'components/TemperaturePage.tsx',
        `locales/${locale}/75-c-to-f.json`,
        `locales/${locale}/template.json`
    ]);

    // Auto-detect existing pages for smart linking
    const availablePages = getAvailableTemperaturePages();

    // Helper to deep merge objects
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const deepMerge = (target: any, source: any) => {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    };

    const loadJSON = (loc: string, p: string) => {
        try {
            const filePath = path.join(process.cwd(), 'locales', loc, p);
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContent);
        } catch {
            return {};
        }
    };

    // 1. Load English (Base)
    const enTrans = loadJSON('en', '75-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '75-c-to-f.json');
        pageTrans = deepMerge(JSON.parse(JSON.stringify(enTrans)), locTrans);
    }

    return {
        props: {
            lastUpdatedIso,
            availablePages,
            pageTrans
        }
    };
};

export default function Temperature75C({ lastUpdatedIso, pageTrans, availablePages }: { lastUpdatedIso: string, pageTrans: PageTranslation, availablePages: number[] }) {
    const celsius = 75;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('75-c-to-f');
    // Use passed translations directly
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

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
            // 🔒 Content Locking: Prevent template updates from changing this refined page
            customIntro={replacePlaceholders(pageT.page?.intro || '', replacements)}
            disableSmartFaqs={true} // Only show our refined custom FAQs, no auto-generated ones
            showEditorialNote={true} // Keep editorial note but control it explicitly
            availablePages={availablePages}
        />
    );
}
