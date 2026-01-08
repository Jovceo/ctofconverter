import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, replacePlaceholders } from '../utils/i18n';
import { celsiusToFahrenheit, generatePageUrl, formatTemperature } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

interface PageTranslation {
    scaleComparison?: {
        title?: string;
        subtitle?: string;
        intro?: string;
        chartLink?: string;
        scales?: { celsius?: string; fahrenheit?: string; kelvin?: string };
        waterFreezes?: string;
        table?: {
            headers?: Record<string, string>;
            rows?: Record<string, string>;
        };
        formulas?: {
            title?: string;
            text?: string;
        };
    };
    faq?: Record<string, {
        question?: string;
        answer?: string;
        items?: string[];
    }>;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/0-c-to-f.tsx',
        `locales/${locale}/0-c-to-f.json`
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
    const enTrans = loadJSON('en', '0-c-to-f.json');

    // 2. Load Current Locale (if different)
    let pageTrans = enTrans;
    if (locale !== 'en') {
        const locTrans = loadJSON(locale, '0-c-to-f.json');
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

export default function Temperature0C({ lastUpdatedIso, availablePages, pageTrans }: { lastUpdatedIso: string, availablePages: number[], pageTrans: PageTranslation }) {
    const celsius = 0;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('template');
    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const strategy = useMemo(() => {
        // Keywords for 0°C: freezing point, water, ice
        const baseStrategy = generateContentStrategy(celsius, 'freezing point water ice temperature celsius fahrenheit conversion');

        const sc = pageT.scaleComparison;

        // Add Temperature Scale Comparison as insights section
        baseStrategy.insights = [
            {
                type: 'fact' as const,
                title: sc?.title || 'Temperature Scale Comparison',
                content: `
                    <h3 style="margin-top: 0;">${sc?.subtitle || 'Key Temperature Points Across Scales'}</h3>
                    <p>${sc?.intro || '0°C (32°F) is a fundamental reference point across temperature scales.'}</p>
                    
                    <div style="display: flex; justify-content: space-around; margin: 30px 0; flex-wrap: wrap;">
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #e74c3c;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${sc?.scales?.celsius || 'Celsius (°C)'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">0°C</div>
                            <div>${sc?.waterFreezes || 'Water Freezes'}</div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #3498db;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${sc?.scales?.fahrenheit || 'Fahrenheit (°F)'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">32°F</div>
                            <div>${sc?.waterFreezes || 'Water Freezes'}</div>
                        </div>
                        
                        <div style="text-align: center; padding: 20px; border-radius: 8px; background-color: #fff; box-shadow: 0 2px 10px rgba(0,0,0,0.1); margin: 10px; flex: 1; min-width: 200px; border-top: 4px solid #9b59b6;">
                            <div style="font-size: 1.2rem; color: #7f8c8d;">${sc?.scales?.kelvin || 'Kelvin (K)'}</div>
                            <div style="font-size: 2rem; font-weight: 700; margin: 10px 0;">273.15K</div>
                            <div>${sc?.waterFreezes || 'Water Freezes'}</div>
                        </div>
                    </div>
                    
                    <p>${sc?.chartLink || 'For a comprehensive view of temperature conversions across different values, check out our Celsius to Fahrenheit Chart.'}</p>
                    
                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr>
                                <th style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${sc?.table?.headers?.description || 'Description'}</th>
                                <th style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${sc?.table?.headers?.celsius || 'Celsius (°C)'}</th>
                                <th style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${sc?.table?.headers?.fahrenheit || 'Fahrenheit (°F)'}</th>
                                <th style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0; background-color: #f8f9fa; font-weight: 600;">${sc?.table?.headers?.kelvin || 'Kelvin (K)'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr style="background-color: #e8f5e9;">
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">${sc?.table?.rows?.waterFreezes || 'Water Freezes'}</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">0°C</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">32°F</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">273.15K</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">${sc?.table?.rows?.waterBoils || 'Water Boils'}</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">100°C</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">212°F</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">373.15K</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">${sc?.table?.rows?.absoluteZero || 'Absolute Zero'}</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">-273.15°C</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">-459.67°F</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">0K</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">${sc?.table?.rows?.bodyTemp || 'Human Body Temperature'}</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;"><a href="/37-c-to-f">37°C</a></td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">98.6°F</td>
                                <td style="padding: 12px 15px; text-align: center; border-bottom: 1px solid #e0e0e0;">310.15K</td>
                            </tr>
                            <tr>
                                <td style="padding: 12px 15px; text-align: center;">${sc?.table?.rows?.roomTemp || 'Room Temperature'}</td>
                                <td style="padding: 12px 15px; text-align: center;">20-25°C</td>
                                <td style="padding: 12px 15px; text-align: center;">68-77°F</td>
                                <td style="padding: 12px 15px; text-align: center;">293-298K</td>
                            </tr>
                        </tbody>
                    </table>
                    
                    <div style="background-color: #f8f9fa; border-left: 4px solid #3498db; padding: 15px; margin: 20px 0; border-radius: 4px;">
                        <p><strong>${sc?.formulas?.title || 'Conversion formulas:'}</strong></p>
                        <p>${sc?.formulas?.text || '°F = (°C × 9/5) + 32  |  °C = (°F - 32) × 5/9  |  K = °C + 273.15'}</p>
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

        return baseStrategy;
    }, [celsius, pageT]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="0-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            availablePages={availablePages}
            disableSmartFaqs={true}
            showEditorialNote={true}
        />
    );
}
