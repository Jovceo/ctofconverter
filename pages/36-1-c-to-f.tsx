import { TemperaturePage } from './temperature-template';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, replacePlaceholders, getLocalizedKeywords, getSceneKeywords } from '../utils/i18n';
import { safeTranslate } from '../utils/translationHelpers';
import { celsiusToFahrenheit, formatTemperature, generatePageUrl } from '../utils/temperaturePageHelpers';
import { useMemo } from 'react';

import { getLatestModifiedDate } from '../utils/dateHelpers';
import { getAvailableTemperaturePages } from '../utils/serverHelpers';
import { GetStaticProps } from 'next';
import fs from 'fs';
import path from 'path';

// 定义翻译接口
interface PageTranslation {
    meta?: {
        title?: string;
        description?: string;
        ogTitle?: string;
        ogDescription?: string;
    };
    bodyTempRanges?: {
        title?: string;
        normalHighlight?: string;
        adultStatus?: string;
        babyStatus?: string;
        underArmStatus?: string;
        ranges?: {
            adult?: string;
            baby?: string;
            underArm?: string;
            normal?: string;
        };
    };
    measurementMethods?: {
        title?: string;
        intro?: string;
        oral?: { title?: string; description?: string };
        underArm?: { title?: string; description?: string };
        ear?: { title?: string; description?: string };
        rectal?: { title?: string; description?: string };
    };
    ageGroups?: {
        title?: string;
        newborn?: { title?: string; points: string[] };
        children?: { title?: string; points: string[] };
        adults?: { title?: string; points: string[] };
    };
    feverScale?: {
        title?: string;
        intro?: string;
        tableHeaders?: {
            celsius?: string;
            fahrenheit?: string;
            assessment?: string;
        };
        rows?: Array<{ celsius: string; fahrenheit: string; assessment: string; }>;
    };
    faq?: Record<string, {
        question?: string;
        answer?: string;
    }>;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/36-1-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/36-1-c-to-f.json`,
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

    // 加载翻译数据
    const enTrans = loadJSON('en', '36-1-c-to-f.json');
    const locTrans = locale !== 'en' ? loadJSON(locale, '36-1-c-to-f.json') : {};

    // 深度合并翻译
    const pageTrans = {
        ...enTrans, ...locTrans,
        meta: { ...enTrans.meta, ...locTrans.meta },
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

export default function Temperature36_1C({ lastUpdatedIso, pageTrans, availablePages }: {
    lastUpdatedIso: string,
    pageTrans: PageTranslation,
    availablePages: number[]
}) {
    const celsius = 36.1;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('36-1-c-to-f');
    const { t } = useTranslation('template');

    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const formattedF = formatTemperature(fahrenheit);

    const replacements = useMemo(() => ({
        fahrenheit: formattedF,
        celsius: '36.1',
        celsiusNoDecimal: '36'
    }), [formattedF]);

    const strategy = useMemo(() => {
        // 🎯 使用本地化关键词（根据语言动态选择）
        // 方案1：使用基础本地化关键词
        // const localizedKeywords = getLocalizedKeywords(locale);
        
        // 方案2：使用场景化关键词（更智能）
        const localizedKeywords = getSceneKeywords(celsius, 'body', locale);
        
        const s = generateContentStrategy(celsius, localizedKeywords);

        // 注入自定义医疗评估
        s.insights = [{
            type: 'fact' as const,
            title: safeTranslate(pageT, 'bodyTempRanges.title', locale),
            content: `
                <div style="display: flex; gap: 10px; margin: 30px 0; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.adult', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>36.1°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.adultStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.baby', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>36.1°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.babyStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.underArm', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>36.1°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.underArmStatus', locale)}</small>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'measurementMethods.title', locale),
            content: `
                <p>${safeTranslate(pageT, 'measurementMethods.intro', locale).replace('{fahrenheit}', formattedF)}</p>
                <div style="display: grid; gap: 15px; margin-top: 15px; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));">
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">🌡️</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.oral.title', locale)}</h4>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.oral.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">💪</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.underArm.title', locale)}</h4>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.underArm.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👂</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.ear.title', locale)}</h4>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.ear.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.rectal.title', locale)}</h4>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.rectal.description', locale)}</p>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'ageGroups.title', locale),
            content: `
                <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h3 style="margin: 0;">${safeTranslate(pageT, 'ageGroups.newborn.title', locale)}</h3>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.newborn?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">🧒</span>
                            <h3 style="margin: 0;">${safeTranslate(pageT, 'ageGroups.children.title', locale)}</h3>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.children?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                    <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #9c27b0;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👨‍🦳</span>
                            <h3 style="margin: 0;">${safeTranslate(pageT, 'ageGroups.adults.title', locale)}</h3>
                        </div>
                        <p><strong>36.1°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.adults?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.adults.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.adults.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.adults.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.adults.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'feverScale.title', locale),
            content: `
                <h3 style="margin-top: 0;">${safeTranslate(pageT, 'feverScale.intro', locale)}</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">${safeTranslate(pageT, 'feverScale.tableHeaders.celsius', locale)}</th>
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${safeTranslate(pageT, 'feverScale.tableHeaders.fahrenheit', locale)}</th>
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${safeTranslate(pageT, 'feverScale.tableHeaders.assessment', locale)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageT.feverScale?.rows ? pageT.feverScale.rows.map(row => `
                        <tr ${row.celsius === '36.1°C' ? 'style="background-color: #e8f5e8;"' : ''}>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '36.1°C' ? '<strong>' : ''}${replacePlaceholders(row.celsius, {fahrenheit: formattedF})}${row.celsius === '36.1°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '36.1°C' ? '<strong>' : ''}${replacePlaceholders(row.fahrenheit, {fahrenheit: formattedF})}${row.celsius === '36.1°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '36.1°C' ? '<strong>' : ''}${replacePlaceholders(row.assessment, {fahrenheit: formattedF})}${row.celsius === '36.1°C' ? '</strong>' : ''}</td>
                        </tr>
                        `).join('') : `
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">35.5°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">95.9°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">Low normal / Mild hypothermia risk</td>
                        </tr>
                        <tr style="background-color: #e8f5e8;">
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>36.1°C</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>${formattedF}°F</strong></td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;"><strong>Normal body temperature</strong></td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">36.5°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">97.7°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">Mid-normal range</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">37.0°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">98.6°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">Classic "normal" temperature</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">37.5°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">99.5°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">High normal / Very low-grade fever</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">38.0°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">100.4°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">Fever threshold</td>
                        </tr>
                        <tr>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">38.5°C</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">101.3°F</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">Moderate fever</td>
                        </tr>
                        `}
                    </tbody>
                </table>
            `
        }];

        // 自定义FAQs
        if (pageT.faq) {
            const faqEntries = pageT.faq || {};
            s.faqs = [
                // 自定义的6个核心FAQ
                ...Object.keys(faqEntries).map(key => ({
                    question: replacePlaceholders(faqEntries[key].question || '', replacements),
                    answer: `<p>${replacePlaceholders(faqEntries[key].answer || '', replacements)}</p>`
                }))
            ];
        }

        // 配置模块
        s.modules.showHealthAlert = true;
        s.modules.showHumanFeel = false;
        s.modules.showOvenGuide = false;
        s.modules.showConversionGuide = false;
        s.modules.showPracticalApps = false;

        return s;
    }, [celsius, pageT, formattedF, replacements, t]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    // 自定义Title和Description
    const customTitle = replacePlaceholders(pageT.meta?.title || '', replacements);
    const customDescription = replacePlaceholders(pageT.meta?.description || '', replacements);

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="36-1-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customTitle={customTitle}
            customDescription={customDescription}
            availablePages={availablePages}
            disableSmartFaqs={true}
            showEditorialNote={true}
        />
    );
}
