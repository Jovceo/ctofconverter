import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, replacePlaceholders } from '../utils/i18n';
import { celsiusToFahrenheit, formatTemperature, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

// Explicitly define interface to match JSON structure
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
    extra?: {
        kelvin?: { title?: string; equation?: string };
        chart?: { title?: string; equation?: string };
    };
}

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/37-5-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/37-5-c-to-f.json`,
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
    const enTrans = loadJSON('en', '37-5-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '37-5-c-to-f.json');
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

export default function Temperature37_5C({ lastUpdatedIso, pageTrans }: { lastUpdatedIso: string, pageTrans: PageTranslation }) {
    const celsius = 37.5;
    const fahrenheit = celsiusToFahrenheit(celsius);

    // Use the passed translations directly
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);
    // Also use the hook for locale awareness if needed, but rely on pageT for content
    const { locale } = useTranslation('37-5-c-to-f');

    const replacements = useMemo(() => ({
        fahrenheit: formatTemperature(fahrenheit),
        celsius: String(celsius)
    }), [celsius, fahrenheit]);

    const strategy = useMemo(() => {
        // Keywords: fever, baby, adults, under arm, axillary, temperature, child, toddler
        const s = generateContentStrategy(celsius, 'fever baby adults under arm axillary temperature convert celsius fahrenheit child toddler');

        const replace = (text: string) => replacePlaceholders(text || '', replacements);

        // Inject FAQs from JSON
        if (pageT.faq && pageT.faq.items) {
            s.faqs = pageT.faq.items.map((item: TranslationItem) => ({
                question: replace(item.question || ''),
                answer: replace(item.answer || '')
            }));
        }

        const insights: { type: 'warning' | 'tip' | 'fact'; title: string; content: string }[] = [];

        const formatInsightContent = (item: TranslationItem) => {
            let content = replace(item.content || '');
            if (item.items && item.items.length > 0) {
                const list = item.items.map(i => `<li>${replace(i)}</li>`).join('');
                content += `<ul style="margin-top: 10px; padding-left: 20px;">${list}</ul>`;
            }
            return content;
        };

        // Add Warning Insight (Medical)
        if (pageT.warning) {
            insights.push({
                type: 'warning' as const,
                title: replace(pageT.warning.title || ''),
                content: formatInsightContent(pageT.warning)
            });
        }

        // Add Medical Context Insight
        if (pageT.context?.medical) {
            insights.push({
                type: 'fact' as const,
                title: replace(pageT.context.medical.title || ''),
                content: formatInsightContent(pageT.context.medical)
            });
        }

        s.insights = insights;

        // Module Configuration for 37.5°C
        s.modules.showHealthAlert = true;      // CRITICAL: Show fever alert
        s.modules.showHumanFeel = false;       // Not needed for fever pages (focus on health)
        s.modules.showConversionGuide = true;
        s.modules.showPracticalApps = false;   // Disable generic apps (cooking/weather), focus on body temp

        // Override Intro Text
        s.text.intro = replace(pageT.page?.intro || '');

        return s;
    }, [celsius, pageT, replacements]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    // Extra conversions (Kelvin) - Localized from JSON
    const extraConversions = [
        {
            title: replacePlaceholders(pageT.extra?.kelvin?.title || "37.5 Celsius to Kelvin", replacements),
            equation: replacePlaceholders(pageT.extra?.kelvin?.equation || "37.5°C = 310.65K", replacements),
            url: ""
        },
        {
            title: replacePlaceholders(pageT.extra?.chart?.title || "Adult and Child Fever Temperature Chart", replacements),
            equation: replacePlaceholders(pageT.extra?.chart?.equation || "View Chart", replacements),
            url: "/fever-temperature-chart"
        }
    ];

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="37-5-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customTitle={replacePlaceholders(pageT.page?.title || '', replacements)}
            customDescription={replacePlaceholders(pageT.page?.description || '', replacements)}
            customIntro={replacePlaceholders(pageT.page?.intro || '', replacements)}
            extraConversions={extraConversions}
        />
    );
}
