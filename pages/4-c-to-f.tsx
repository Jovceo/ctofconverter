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
        'pages/4-c-to-f.tsx',
        `locales/${locale}/4-c-to-f.json`
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
    const enTrans = loadJSON('en', '4-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '4-c-to-f.json');
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

export default function Temperature4C({ lastUpdatedIso, pageTrans }: { lastUpdatedIso: string, pageTrans: PageTranslation }) {
    const celsius = 4;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('4-c-to-f');
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const replacements = useMemo(() => ({
        fahrenheit: formatTemperature(fahrenheit),
        celsius: String(celsius),
        negativeFahrenheit: formatTemperature(celsiusToFahrenheit(-celsius))
    }), [celsius, fahrenheit]);

    const strategy = useMemo(() => {
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

        // 添加预警洞察
        if (pageT.warning) {
            insights.push({
                type: 'warning' as const,
                title: replace(pageT.warning.title || ''),
                content: replace(pageT.warning.content || '')
            });
        }

        processContext(pageT.context?.weather, 'tip');
        processContext(pageT.context?.storage, 'tip');
        processContext(pageT.context?.safety, 'warning');
        processContext(pageT.context?.environmental, 'fact');

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
        s.modules.showHealthAlert = true; // 4C is cold, show alert
        s.modules.showHumanFeel = true;
        s.modules.showConversionGuide = false; // Customize: Hide generic guide, we have insights
        s.modules.showPracticalApps = false;

        // 🟢 SEO Optimization: Use localized unique text for 4°C
        s.text.intro = replace(pageT.page?.intro || '');

        return s;
    }, [celsius, pageT, replacements]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="4-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
            customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
            // 🔒 Content Locking
            customIntro={replacePlaceholders(pageT.page?.intro || '', replacements)}
            disableSmartFaqs={true}
            showEditorialNote={true}
            availablePages={availablePages}
        />
    );
}