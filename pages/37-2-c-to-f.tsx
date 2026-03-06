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
        'pages/37-2-c-to-f.tsx',
        'components/TemperaturePage.tsx',
        `locales/${locale}/37-2-c-to-f.json`,
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
    const enTrans = loadJSON('en', '37-2-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '37-2-c-to-f.json');
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

export default function Temperature37_2C({ lastUpdatedIso, pageTrans, availablePages }: { lastUpdatedIso: string, pageTrans: PageTranslation, availablePages: number[] }) {
    const celsius = 37.2;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('37-2-c-to-f');
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const replacements = useMemo(() => ({
        fahrenheit: formatTemperature(fahrenheit),
        celsius: String(celsius),
    }), [celsius, fahrenheit]);

    const strategy = useMemo(() => {
        // Keywords: fever, body temperature, baby, adults, underarm
        const s = generateContentStrategy(celsius, 'fever body temperature baby adults underarm evening mouth forehead normal range');

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
                type: 'fact' as const, // 37.2 is usually Fact/Tip, not Warning unless context implies
                title: replace(pageT.warning.title || ''),
                content: replace(pageT.warning.content || '')
            });
        }

        processContext(pageT.context?.medical, 'tip'); // Medical context is key here

        s.insights = insights;

        // 针对37.2°C的特殊配置
        s.modules.showHealthAlert = true;
        s.modules.showHumanFeel = true;
        s.modules.showConversionGuide = false;
        s.modules.showPracticalApps = false; // Not needed for body temp focused page

        // 🟢 SEO Optimization
        s.text.intro = replace(pageT.page?.intro || '');

        return s;
    }, [celsius, pageT, replacements]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="37-2-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
            customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
            customIntro={replacePlaceholders(pageT.page?.intro || '', replacements)}
            disableSmartFaqs={true}
            showEditorialNote={true}
            availablePages={availablePages}
        />
    );
}
