import { TemperaturePage } from './temperature-template';
import { GetStaticProps } from 'next';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation } from '../utils/i18n';
import { celsiusToFahrenheit, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import fs from 'fs';
import path from 'path';

// Define Interface for Page Translation
interface PageTranslation {
    page?: {
        title?: string;
        description?: string;
    };
    faq?: Record<string, {
        question?: string;
        answer?: string;
    }>;
    boilingPointFeature?: {
        title?: string;
        description?: string;
        cards?: {
            boiling?: string;
            freezing?: string;
            baking?: string;
            body?: string;
        };
    };
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/100-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/100-c-to-f.json`,
        `locales/${locale}/template.json`
    ]);

    const availablePages = getAvailableTemperaturePages();

    // Helper to load JSON
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
    const enTrans = loadJSON('en', '100-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '100-c-to-f.json');
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

export default function Temperature100C({ lastUpdatedIso, availablePages, pageTrans }: { lastUpdatedIso: string, availablePages: number[], pageTrans: PageTranslation }) {
    const celsius = 100;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { t, locale } = useTranslation('template');

    // Ensure pageTrans is an object
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const strategy = useMemo(() => {
        // Keywords for 100°C: boiling point, water, steam, cooking
        // Using "boiling" to trigger the new sterilization insight we added in contentStrategy.ts
        const baseStrategy = generateContentStrategy(celsius, 'boiling point water steam cooking temperature celsius fahrenheit conversion science', t);

        // Inject Boiling Point Feature as an Insight
        // We replicate the HTML structure from public/100-c-to-f.html using inline styles for React
        const featureTitle = pageT.boilingPointFeature?.title || 'Water Boiling Point Reference';
        const featureDesc = pageT.boilingPointFeature?.description || '100°C (212°F) is the standard boiling point of water at sea level.';

        const cards = pageT.boilingPointFeature?.cards || {};
        const labelBoiling = cards.boiling || 'Water Boils';
        const labelFreezing = cards.freezing || 'Water Freezes';
        const labelBaking = cards.baking || 'Baking Temp';
        const labelBody = cards.body || 'Body Temp';

        const boilingFeatureHtml = `
            <div style="background: linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%); border-radius: 12px; padding: 25px; margin: 30px 0; border-left: 5px solid #3498db; box-shadow: 0 5px 15px rgba(0,0,0,0.08);">
                <h3 style="color: #1e40af; margin-bottom: 15px; font-size: 1.4rem; display: flex; align-items: center;">
                    <span style="margin-right: 10px; font-size: 1.3rem;">💧</span> ${featureTitle}
                </h3>
                <p><strong>100°C (212°F)</strong> ${featureDesc.replace('100°C (212°F)', '')}</p>
                
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(140px, 1fr)); gap: 15px; margin: 20px 0;">
                    <div style="background: linear-gradient(135deg, #dbeafe 0%, #fff 100%); border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #3b82f6;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2d3748; margin: 5px 0;">100°C</div>
                        <div style="font-size: 0.9rem; color: #718096;">212°F (${labelBoiling})</div>
                    </div>
                    <div style="background: white; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #3498db;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2d3748; margin: 5px 0;">0°C</div>
                        <div style="font-size: 0.9rem; color: #718096;">32°F (${labelFreezing})</div>
                    </div>
                    <div style="background: white; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #f59e0b;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2d3748; margin: 5px 0;">180°C</div>
                        <div style="font-size: 0.9rem; color: #718096;">356°F (${labelBaking})</div>
                    </div>
                    <div style="background: white; border-radius: 8px; padding: 15px; text-align: center; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #ef4444;">
                        <div style="font-size: 1.5rem; font-weight: bold; color: #2d3748; margin: 5px 0;">37°C</div>
                        <div style="font-size: 0.9rem; color: #718096;">98.6°F (${labelBody})</div>
                    </div>
                </div>
            </div>
        `;

        // Prepend this feature to insights so it appears at the top
        baseStrategy.insights = [
            {
                type: 'fact',
                title: featureTitle,
                content: boilingFeatureHtml
            },
            ...(baseStrategy.insights || [])
        ];

        // Correct the baking temperature display which had a typo in the previous block attempt
        // Re-injecting with correct text
        baseStrategy.insights[0].content = boilingFeatureHtml.replace('margin: 180°C', 'margin: 5px 0;">180°C');


        // Override/Inject FAQs from JSON
        const faqEntries = pageT.faq || {};
        if (Object.keys(faqEntries).length > 0) {
            baseStrategy.faqs = Object.keys(faqEntries).map(key => ({
                question: faqEntries[key].question || '',
                answer: faqEntries[key].answer || ''
            }));
        }

        return baseStrategy;
    }, [celsius, pageT]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="100-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            availablePages={availablePages}
            disableSmartFaqs={true} // Override smart FAQs with our custom JSON ones
            showEditorialNote={true}
            customTitle={pageT.page?.title}
            customDescription={pageT.page?.description}
        />
    );
}
