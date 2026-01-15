import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation } from '../utils/i18n';
import { celsiusToFahrenheit, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

interface PageTranslation {
    meta?: {
        titles?: { fever?: string };
        ogDescription?: string;
    };
    bodyTempRanges?: {
        title?: string;
        subtitle?: string;
        intro?: string;
        ranges?: { hypothermia?: string; normal?: string; fever?: string; highFever?: string };
        table?: {
            headers?: { condition?: string; celsius?: string; fahrenheit?: string };
            rows?: { hypothermia?: string; normal?: string; elevated?: string; fever?: string; highFever?: string };
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
        'pages/41-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/41-c-to-f.json`,
        `locales/${locale}/template.json`
    ]);

    const availablePages = getAvailableTemperaturePages();

    const loadJSON = (loc: string, p: string) => {
        try {
            const filePath = path.join(process.cwd(), 'locales', loc, p);
            return JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } catch {
            return {};
        }
    };

    // Load Locale Data
    const enTrans = loadJSON('en', '41-c-to-f.json');
    const locTrans = locale !== 'en' ? loadJSON(locale, '41-c-to-f.json') : {};

    // Simple deep merge for this use case
    const pageTrans = {
        ...enTrans, ...locTrans,
        meta: { ...enTrans.meta, ...locTrans.meta },
        bodyTempRanges: { ...enTrans.bodyTempRanges, ...locTrans.bodyTempRanges },
        faq: { ...enTrans.faq, ...locTrans.faq }
    };

    return {
        props: {
            lastUpdatedIso,
            availablePages,
            pageTrans
        }
    };
};

export default function Temperature41C({ lastUpdatedIso, availablePages, pageTrans }: { lastUpdatedIso: string, availablePages: number[], pageTrans: PageTranslation }) {
    const celsius = 41;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('template');

    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const strategy = useMemo(() => {
        const baseStrategy = generateContentStrategy(celsius, 'medical emergency hyperpyrexia 41 celsius 105.8 fahrenheit conversion heart stroke health alerts');
        const bt = pageT.bodyTempRanges;

        // Add Fever Guide as Insights
        baseStrategy.insights = [
            {
                type: 'fact' as const,
                title: bt?.title || 'Medical Emergency: 41°C (105.8°F)',
                content: `
                    <h3 style="margin-top: 0;">${bt?.subtitle || 'Is 41°C a Dangerous Fever?'}</h3>
                    <p>${bt?.intro || 'Yes, 41°C (105.8°F) is a medical emergency known as hyperpyrexia.'}</p>
                    
                    <div style="display: flex; gap: 10px; margin: 30px 0; flex-wrap: wrap;">
                        <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e8f5e9; border-top: 4px solid #4CAF50; text-align: center;">
                            <strong>${bt?.ranges?.normal || 'Normal'}</strong><br>36.1-37.2°C
                        </div>
                        <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #fff3e0; border-top: 4px solid #ff9800; text-align: center;">
                            <strong>${bt?.ranges?.fever || 'Fever'}</strong><br>38-40°C
                        </div>
                        <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #ffebee; border-top: 4px solid #f44336; text-align: center;">
                            <strong>${bt?.ranges?.highFever || 'Emergency'}</strong><br>41°C +
                        </div>
                    </div>

                    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                        <thead>
                            <tr style="background-color: #f8f9fa;">
                                <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">${bt?.table?.headers?.condition || 'Condition'}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${bt?.table?.headers?.celsius || 'Celsius'}</th>
                                <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${bt?.table?.headers?.fahrenheit || 'Fahrenheit'}</th>
                            </tr>
                        </thead>
                        <tbody>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${bt?.table?.rows?.normal || 'Healthy Range'}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">36.1 - 37.2°C</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">97.0 - 99.0°F</td>
                            </tr>
                            <tr>
                                <td style="padding: 10px; border-bottom: 1px solid #eee;">${bt?.table?.rows?.elevated || 'Low-grade Fever'}</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">37.3 - 37.9°C</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">99.1 - 100.3°F</td>
                            </tr>
                            <tr style="background-color: #ffebee;">
                                <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${bt?.table?.rows?.highFever || 'Medical Emergency'}</strong></td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">41.0°C +</td>
                                <td style="padding: 10px; border-bottom: 1px solid #eee; text-align: center;">105.8°F +</td>
                            </tr>
                        </tbody>
                    </table>

                    <div style="padding: 15px; border-radius: 8px; background: #fff3e0; border: 1px solid #ff9800; margin-top: 20px;">
                        <strong>Note:</strong> hyperpyrexia (above 41.1°C / 106°F) can lead to permanent damage if not reversed immediately.
                    </div>
                `
            }
        ];

        // Custom FAQs
        const faqEntries = pageT.faq || {};
        baseStrategy.faqs = Object.keys(faqEntries).map(key => {
            const faq = faqEntries[key];
            let answer = `<p>${faq.answer || ''}</p>`;
            if (faq.items && faq.items.length > 0) {
                answer += `<ul>${faq.items.map(item => `<li>${item}</li>`).join('')}</ul>`;
            }
            return {
                question: faq.question || '',
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
            customNamespace="41-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            availablePages={availablePages}
            disableSmartFaqs={true}
            showEditorialNote={true}
        />
    );
}
