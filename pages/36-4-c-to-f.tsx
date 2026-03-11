import { TemperaturePage } from '../components/TemperaturePage';
import { generateContentStrategy } from '../utils/contentStrategy';
import { useTranslation, replacePlaceholders, getSceneKeywords } from '../utils/i18n';
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
    conversionFormula?: {
        title?: string;
        formula?: string;
        steps?: string[];
        imageAlt?: string;
    };
    bodyTempRanges?: {
        title?: string;
        subtitle?: string;
        intro?: string;
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
    researchUpdate?: {
        title?: string;
        content?: string;
    };
    measurementMethods?: {
        title?: string;
        intro?: string;
        oral?: { icon?: string; temp?: string; title?: string; description?: string };
        underArm?: { icon?: string; temp?: string; title?: string; description?: string };
        ear?: { icon?: string; temp?: string; title?: string; description?: string };
        rectal?: { icon?: string; temp?: string; title?: string; description?: string };
    };
    ageGroups?: {
        title?: string;
        newborn?: { title?: string; points?: string[] };
        infant?: { title?: string; points?: string[] };
        children?: { title?: string; points?: string[] };
        adults?: { title?: string; points?: string[] };
    };
    temperatureScale?: {
        title?: string;
        intro?: string;
        tableHeaders?: {
            celsius?: string;
            fahrenheit?: string;
            assessment?: string;
        };
        rows?: Array<{ celsius?: string; fahrenheit?: string; assessment?: string; }>;
    };
    faq?: Record<string, {
        question?: string;
        answer?: string;
    }>;
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/36-4-c-to-f.tsx',
        'components/TemperaturePage.tsx',
        `locales/${locale}/36-4-c-to-f.json`,
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
    const enTrans = loadJSON('en', '36-4-c-to-f.json');
    const locTrans = locale !== 'en' ? loadJSON(locale, '36-4-c-to-f.json') : {};
    const hasLocalizedResearchUpdate = locale === 'en' || Boolean(locTrans.researchUpdate?.title && locTrans.researchUpdate?.content);

    // 深度合并翻译
    const pageTrans = {
        ...enTrans, ...locTrans,
        meta: { ...enTrans.meta, ...locTrans.meta },
        faq: { ...enTrans.faq, ...locTrans.faq }
    };

    if (!hasLocalizedResearchUpdate) {
        delete pageTrans.researchUpdate;
    }

    return {
        props: {
            lastUpdatedIso,
            availablePages,
            pageTrans,
            hasLocalizedResearchUpdate
        }
    };
};

export default function Temperature36_4C({ lastUpdatedIso, pageTrans, availablePages, hasLocalizedResearchUpdate }: {
    lastUpdatedIso: string,
    pageTrans: PageTranslation,
    availablePages: number[],
    hasLocalizedResearchUpdate: boolean
}) {
    const celsius = 36.4;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('36-4-c-to-f');
    const { t } = useTranslation('template');

    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const formattedF = formatTemperature(fahrenheit);

    const replacements = useMemo(() => ({
        fahrenheit: formattedF,
        celsius: celsius.toString(),
        celsiusNoDecimal: Math.floor(celsius).toString()
    }), [formattedF, celsius]);

    const strategy = useMemo(() => {
        // 使用场景化关键词（正常体温场景）
        const localizedKeywords = getSceneKeywords(celsius, 'body', locale);
        
        const s = generateContentStrategy(celsius, localizedKeywords);

        // 注入自定义正常体温评估（蓝色主题）
        s.insights = [{
            type: 'fact' as const,
            title: safeTranslate(pageT, 'bodyTempRanges.title', locale),
            content: `
                <div style="display: flex; gap: 10px; margin: 30px 0; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">✅</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.adult', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.adultStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">👶</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.baby', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.babyStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #e3f2fd; border-top: 4px solid #2196f3; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">💪</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.underArm', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.underArmStatus', locale)}</small>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'conversionFormula.title', locale) || '36.4°C to Fahrenheit Conversion',
            content: `
                <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="font-size: 1.1em; margin-bottom: 15px;">${safeTranslate(pageT, 'conversionFormula.formula', locale) || `(${replacePlaceholders('{celsius}°C', replacements)} × 9/5) + 32 = ${formattedF}°F`}</p>
                        <ol style="margin-left: 20px; line-height: 1.8;">
                            ${pageT.conversionFormula?.steps?.map((step: string) => `<li>${step}</li>`).join('') || ''}
                        </ol>
                    </div>
                    <div style="flex: 0 0 auto;">
                        <img src="/images/equation/36.4-celsius-to-fahrenheit-conversion.png" alt="${safeTranslate(pageT, 'conversionFormula.imageAlt', locale) || '36.4°C to Fahrenheit conversion formula'}" style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
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
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong><br>${safeTranslate(pageT, 'measurementMethods.oral.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">💪</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.underArm.title', locale)}</h4>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong><br>${safeTranslate(pageT, 'measurementMethods.underArm.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👂</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.ear.title', locale)}</h4>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong><br>${safeTranslate(pageT, 'measurementMethods.ear.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.rectal.title', locale)}</h4>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong><br>${safeTranslate(pageT, 'measurementMethods.rectal.description', locale)}</p>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'ageGroups.title', locale),
            content: `
                <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h3 style="margin: 0; color: #1976d2;">${safeTranslate(pageT, 'ageGroups.newborn.title', locale)}</h3>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.newborn?.points?.map((point: string) => `<li>${point}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h3 style="margin: 0; color: #1976d2;">${safeTranslate(pageT, 'ageGroups.infant.title', locale)}</h3>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.infant?.points?.map((point: string) => `<li>${point}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">🧒</span>
                            <h3 style="margin: 0; color: #1976d2;">${safeTranslate(pageT, 'ageGroups.children.title', locale)}</h3>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.children?.points?.map((point: string) => `<li>${point}</li>`).join('') || ''}
                        </ul>
                    </div>
                    <div style="background: #e3f2fd; padding: 20px; border-radius: 8px; border-left: 4px solid #2196f3;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👨‍🦳</span>
                            <h3 style="margin: 0; color: #1976d2;">${safeTranslate(pageT, 'ageGroups.adults.title', locale)}</h3>
                        </div>
                        <p><strong>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.adults?.points?.map((point: string) => `<li>${point}</li>`).join('') || ''}
                        </ul>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'temperatureScale.title', locale),
            content: `
                <h3 style="margin-top: 0;">${safeTranslate(pageT, 'temperatureScale.intro', locale)}</h3>
                <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
                    <thead>
                        <tr style="background-color: #f8f9fa;">
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6; text-align: left;">${safeTranslate(pageT, 'temperatureScale.tableHeaders.celsius', locale)}</th>
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${safeTranslate(pageT, 'temperatureScale.tableHeaders.fahrenheit', locale)}</th>
                            <th style="padding: 12px; border-bottom: 2px solid #dee2e6;">${safeTranslate(pageT, 'temperatureScale.tableHeaders.assessment', locale)}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${pageT.temperatureScale?.rows ? pageT.temperatureScale.rows.map(row => `
                        <tr ${row.celsius === celsius + '°C' ? 'style="background-color: #e3f2fd;"' : ''}>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === celsius + '°C' ? '<strong>' : ''}${replacePlaceholders(row.celsius || '', replacements)}${row.celsius === celsius + '°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === celsius + '°C' ? '<strong>' : ''}${replacePlaceholders(row.fahrenheit || '', replacements)}${row.celsius === celsius + '°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === celsius + '°C' ? '<strong>' : ''}${replacePlaceholders(row.assessment || '', replacements)}${row.celsius === celsius + '°C' ? '</strong>' : ''}</td>
                        </tr>
                        `).join('') : ''}
                    </tbody>
                </table>
            `
        }];

        if (hasLocalizedResearchUpdate) {
            s.insights.splice(1, 0, {
                type: 'fact' as const,
                title: safeTranslate(pageT, 'researchUpdate.title', locale),
                content: `<div style="background: #f0f7ff; padding: 20px; border-radius: 8px; border-left: 4px solid #1976d2;"><p style="margin: 0;">${safeTranslate(pageT, 'researchUpdate.content', locale)}</p></div>`
            });
        }

        // 自定义FAQs
        if (pageT.faq) {
            const faqEntries = pageT.faq || {};
            s.faqs = [
                ...Object.keys(faqEntries).map(key => ({
                    question: replacePlaceholders(faqEntries[key].question || '', replacements),
                    answer: `<p>${replacePlaceholders(faqEntries[key].answer || '', replacements)}</p>`
                }))
            ];
        }

        // 配置模块
        s.meta = s.meta || {};
        s.meta.ogDescription = replacePlaceholders(pageT.meta?.ogDescription || '', replacements);
        s.modules.showHealthAlert = true;
        s.modules.showHumanFeel = false;
        s.modules.showOvenGuide = false;
        s.modules.showConversionGuide = false;
        s.modules.showPracticalApps = false;

        return s;
    }, [celsius, pageT, formattedF, replacements, t, hasLocalizedResearchUpdate]);

    const canonicalUrl = generatePageUrl(celsius, locale);

    // 自定义Title和Description
    const customMetaTitle = replacePlaceholders(pageT.meta?.title || '', replacements);
    const customMetaDescription = replacePlaceholders(pageT.meta?.description || '', replacements);
    const customHeaderTitle = customMetaTitle;
    const customTagline = customMetaDescription;
    const customResultHeader = replacePlaceholders(
        pageT.conversionFormula?.title || pageT.meta?.ogTitle || `${celsius}°C to Fahrenheit Converter`,
        replacements
    );
    const customIntro = replacePlaceholders(
        pageT.bodyTempRanges?.intro || customMetaDescription,
        replacements
    );

    return (
        <TemperaturePage
            celsius={celsius}
            strategy={strategy}
            customNamespace="36-4-c-to-f"
            lastUpdated={lastUpdatedIso}
            canonicalUrl={canonicalUrl}
            customMetaTitle={customMetaTitle}
            customMetaDescription={customMetaDescription}
            customHeaderTitle={customHeaderTitle}
            customTagline={customTagline}
            customResultHeader={customResultHeader}
            customIntro={customIntro}
            availablePages={availablePages}
            disableSmartFaqs={true}
            showEditorialNote={true}
        />
    );
}
