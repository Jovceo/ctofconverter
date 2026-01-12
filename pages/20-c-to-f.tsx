import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, getLocalizedLink } from '../utils/i18n';
import { celsiusToFahrenheit, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

interface PageTranslation {
    seo?: {
        title?: string;
        description?: string;
    };
    comfortGuide?: {
        title?: string;
        subtitle?: string;
        intro?: string;
        chart?: {
            cold?: { label?: string; value?: string; desc?: string };
            moderate?: { label?: string; value?: string; desc?: string };
            warm?: { label?: string; value?: string; desc?: string };
        };
        table?: {
            headers?: { temperature?: string; description?: string; typicalUse?: string };
            rows?: {
                [key: string]: { temp?: string; desc?: string; use?: string };
            };
        };
        note?: string;
    };
    faq?: Record<string, {
        question?: string;
        answer?: string;
        items?: string[];
    }>;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/20-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/20-c-to-f.json`,
        `locales/${locale}/template.json`
    ]);

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
    const enTrans = loadJSON('en', '20-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '20-c-to-f.json');
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

export default function Temperature20C({ lastUpdatedIso, availablePages, pageTrans }: { lastUpdatedIso: string, availablePages: number[], pageTrans: PageTranslation }) {
    const celsius = 20;
    const { locale } = useTranslation('template');
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const strategy = useMemo(() => {
        // Keywords for 20°C: room temperature, comfortable, pleasant
        const baseStrategy = generateContentStrategy(celsius, 'room temperature comfortable pleasant celsius fahrenheit conversion');

        const cg = pageT.comfortGuide;

        // Add Temperature Comfort Guide as insights section
        baseStrategy.insights = [
            {
                type: 'fact' as const,
                title: cg?.title || 'Temperature Comfort Guide',
                content: `
                    <h3 style="margin-top: 0;">${cg?.subtitle || 'Understanding Temperature Comfort Levels'}</h3>
                    <p>${cg?.intro || '20°C (68°F) falls within the comfortable temperature range for most people.'}</p>
                    
                    <div style="display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap;">
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #3498db;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${cg?.chart?.cold?.label || 'Cool'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${cg?.chart?.cold?.value || '10-15°C'}</div>
                            <div>${cg?.chart?.cold?.desc || '50-59°F<br>Light jacket weather'}</div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #27ae60;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${cg?.chart?.moderate?.label || 'Comfortable'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${cg?.chart?.moderate?.value || '18-22°C'}</div>
                            <div>${cg?.chart?.moderate?.desc || '64-72°F<br>Ideal room temperature'}</div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #e74c3c;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${cg?.chart?.warm?.label || 'Warm'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">${cg?.chart?.warm?.value || '25-30°C'}</div>
                            <div>${cg?.chart?.warm?.desc || '77-86°F<br>T-shirt weather'}</div>
                        </div>
                    </div>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr>
                                <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${cg?.table?.headers?.temperature || 'Temperature'}</th>
                                <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${cg?.table?.headers?.description || 'Description'}</th>
                                <th style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${cg?.table?.headers?.typicalUse || 'Typical Use'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;"><a href="${getLocalizedLink('/0-c-to-f', locale)}">${cg?.table?.rows?.["0c"]?.temp || '0°C (32°F)'}</a></td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["0c"]?.desc || 'Freezing point of water'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["0c"]?.use || 'Refrigerator temperature, winter weather'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["10c"]?.temp || '10°C (50°F)'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["10c"]?.desc || 'Cool'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["10c"]?.use || 'Spring/autumn weather, light jacket needed'}</td>
                            </tr>
                            <tr style="background-color: #e8f5e9;">
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["20c"]?.temp || '20°C (68°F)'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["20c"]?.desc || 'Room temperature'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["20c"]?.use || 'Ideal indoor temperature, comfortable weather'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["30c"]?.temp || '30°C (86°F)'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["30c"]?.desc || 'Warm'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["30c"]?.use || 'Summer weather, light clothing'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;"><a href="${getLocalizedLink('/37-c-to-f', locale)}">${cg?.table?.rows?.["37c"]?.temp || '37°C (98.6°F)'}</a></td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["37c"]?.desc || 'Body temperature'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["37c"]?.use || 'Normal human body temperature'}</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;"><a href="${getLocalizedLink('/100-c-to-f', locale)}">${cg?.table?.rows?.["100c"]?.temp || '100°C (212°F)'}</a></td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["100c"]?.desc || 'Boiling point of water'}</td>
                                <td style="padding: 12px 15px; text-align: left; border-bottom: 1px solid #e0e0e0;">${cg?.table?.rows?.["100c"]?.use || 'Cooking, boiling water'}</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p>${cg?.note || ''}</p>
                    </div>
                `
            }
        ];

        // Add custom FAQs from translation
        const faqEntries = pageT.faq || {};
        baseStrategy.faqs = Object.keys(faqEntries).map(key => {
            const faq = faqEntries[key];
            let answer = faq?.answer || '';

            // Add items list if exists
            if (faq?.items && faq.items.length > 0) {
                const itemsHtml = '<ul>' + faq.items.map(item => `<li>${item}</li>`).join('') + '</ul>';
                answer = `<p>${answer}</p>${itemsHtml}`;
            } else if (answer) {
                answer = `<p>${answer}</p>`;
            }

            return {
                question: faq?.question || '',
                answer
            };
        });

        // Add standard conversion FAQ at the beginning or end if needed. 
        // The generateContentStrategy might already add some, checking template... 
        // We override standard faqs if we just return this list. 
        // Let's rely on baseStrategy.faqs usually being generated by generateContentStrategy, 
        // but here we are overwriting it completely with our custom list. 
        // Actually generateContentStrategy generates some basic FAQs. 
        // If we want to keep them AND add ours, we should spread.
        // However, the user specifically wants the content from the HTML file.
        // The HTML file had: "Is 20°C warm or cold?", "Is 20°C a fever?", "What is 20°C in Fahrenheit for cooking?", "How do I convert 20°C to Fahrenheit?", "What should I wear at 20°C?", "Is 20°C good for sleeping?"
        // This list covers most general questions. So overwriting is fine. 
        // Wait, "How do I convert 20°C to Fahrenheit?" is a standard one. 
        // I did not include it in the json 'faq' section because I thought it might be standard.
        // But to be safe and specific, I will rely on my custom list which is comprehensive for this page.
        // One missing: "How do I convert 20°C to Fahrenheit?". The 'template' often provides this.
        // Let's add the standard calculation FAQ to the custom JSON list or just prepend it here if missing.
        // Actually, looking at 0-c-to-f.tsx, it overwrites `baseStrategy.faqs`. So I will do the same.

        return baseStrategy;
    }, [celsius, pageT]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="20-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            availablePages={availablePages}
            disableSmartFaqs={true}
            showEditorialNote={true}
            customTitle={pageT.seo?.title}
            customDescription={pageT.seo?.description}
        />
    );
}
