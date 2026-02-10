import { TemperaturePage } from './temperature-template';
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
        feverHighlight?: string;
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
        oral?: { icon?: string; temp?: string; title?: string; description?: string };
        underArm?: { icon?: string; temp?: string; title?: string; description?: string };
        ear?: { icon?: string; temp?: string; title?: string; description?: string };
        rectal?: { icon?: string; temp?: string; title?: string; description?: string };
    };
    antipyretics?: {
        title?: string;
        intro?: string;
        adults?: {
            title?: string;
            conditions?: string[];
            medications?: Array<{ name: string; dose: string; max: string }>;
            warning?: string;
        };
        children?: {
            title?: string;
            conditions?: string[];
            medications?: Array<{ name: string; dose: string; max: string }>;
            warning?: string;
        };
    };
    ageGroups?: {
        title?: string;
        newborn?: { title?: string; points: string[] };
        infant?: { title?: string; points: string[] };
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
        'pages/38-c-to-f.tsx',
        'pages/temperature-template.tsx',
        `locales/${locale}/38-c-to-f.json`,
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
    const enTrans = loadJSON('en', '38-c-to-f.json');
    const locTrans = locale !== 'en' ? loadJSON(locale, '38-c-to-f.json') : {};

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

export default function Temperature38C({ lastUpdatedIso, pageTrans, availablePages }: {
    lastUpdatedIso: string,
    pageTrans: PageTranslation,
    availablePages: number[]
}) {
    const celsius = 38;
    const fahrenheit = celsiusToFahrenheit(celsius);
    const { locale } = useTranslation('38-c-to-f');
    const { t } = useTranslation('template');

    const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans]);

    const formattedF = formatTemperature(fahrenheit);

    const replacements = useMemo(() => ({
        fahrenheit: formattedF,
        celsius: '38',
        celsiusNoDecimal: '38'
    }), [formattedF]);

    const strategy = useMemo(() => {
        // 🎯 使用场景化关键词（发烧场景）
        const localizedKeywords = getSceneKeywords(celsius, 'fever', locale);
        
        const s = generateContentStrategy(celsius, localizedKeywords);

        // 注入自定义发烧评估（橙色主题）
        s.insights = [{
            type: 'warning' as const,
            title: safeTranslate(pageT, 'bodyTempRanges.title', locale),
            content: `
                <div style="display: flex; gap: 10px; margin: 30px 0; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #fff3e0; border-top: 4px solid #ff9800; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.adult', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>38°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.adultStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #fff3e0; border-top: 4px solid #ff9800; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">🚨</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.baby', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>38°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.babyStatus', locale)}</small>
                    </div>
                    <div style="flex: 1; min-width: 140px; padding: 15px; border-radius: 8px; background: #fff3e0; border-top: 4px solid #ff9800; text-align: center;">
                        <div style="font-size: 2rem; margin-bottom: 10px;">⚠️</div>
                        <h3 style="margin: 0 0 10px 0; font-size: 1rem;">${safeTranslate(pageT, 'bodyTempRanges.ranges.underArm', locale)}</h3>
                        <p><strong>${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</strong><br>38°C = ${formattedF}°F</p>
                        <small>${safeTranslate(pageT, 'bodyTempRanges.underArmStatus', locale)}</small>
                    </div>
                </div>
            `
        }, {
            type: 'fact' as const,
            title: safeTranslate(pageT, 'conversionFormula.title', locale) || '38°C to Fahrenheit Conversion',
            content: `
                <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
                    <div style="flex: 1; min-width: 300px;">
                        <p style="font-size: 1.1em; margin-bottom: 15px;">${safeTranslate(pageT, 'conversionFormula.formula', locale) || `(38°C × 9/5) + 32 = ${formattedF}°F`}</p>
                        <ol style="margin-left: 20px; line-height: 1.8;">
                            ${pageT.conversionFormula?.steps?.map((step: string) => `<li>${step}</li>`).join('') || `
                            <li>Multiply 38 by 9/5: 38 × 1.8 = 68.4</li>
                            <li>Add 32 to the result: 68.4 + 32 = 100.4</li>
                            <li>Final result: 38°C = 100.4°F</li>
                            `}
                        </ol>
                        <p style="margin-top: 15px;"><a href="/c-to-f-formula" style="color: #3498db; text-decoration: underline;">Learn more about the conversion formula →</a></p>
                    </div>
                    <div style="flex: 0 0 auto;">
                        <img src="/images/equation/38-celsius-to-fahrenheit-conversion.png" alt="${safeTranslate(pageT, 'conversionFormula.imageAlt', locale) || '38°C to Fahrenheit conversion formula'}" style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
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
                        <p><strong>38°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.oral.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">💪</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.underArm.title', locale)}</h4>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.underArm.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👂</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.ear.title', locale)}</h4>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.ear.description', locale)}</p>
                    </div>
                    <div style="background: white; padding: 15px; border-radius: 6px; text-align: center;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 10px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👶</span>
                            <h4 style="margin: 0;">${safeTranslate(pageT, 'measurementMethods.rectal.title', locale)}</h4>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong><br>${safeTranslate(pageT, 'measurementMethods.rectal.description', locale)}</p>
                    </div>
                </div>
            `
        }, {
            type: 'tip' as const,
            title: safeTranslate(pageT, 'antipyretics.title', locale),
            content: `
                <p>${safeTranslate(pageT, 'antipyretics.intro', locale)}</p>
                <div style="display: grid; gap: 20px; margin-top: 15px; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));">
                    <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                        <h4 style="margin-top: 0; color: #e65100;">${safeTranslate(pageT, 'antipyretics.adults.title', locale)}</h4>
                        <ul style="margin: 10px 0;">
                            ${pageT.antipyretics?.adults?.conditions?.map((cond: string) => `<li>${cond}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'antipyretics.adults.conditions.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'antipyretics.adults.conditions.1', locale)}</li>
                            `}
                        </ul>
                        <table style="width: 100%; margin-top: 10px; font-size: 0.9em; border-collapse: collapse;">
                            <tr style="background: #ffecb3;">
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Medication</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Dose</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Max</th>
                            </tr>
                            ${pageT.antipyretics?.adults?.medications?.map((med: any) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.name}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.dose}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.max}</td>
                            </tr>
                            `).join('') || ''}
                        </table>
                        <p style="color: #d32f2f; font-weight: bold; margin-top: 15px; font-size: 0.9em;">⚠️ ${safeTranslate(pageT, 'antipyretics.adults.warning', locale)}</p>
                    </div>
                    <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                        <h4 style="margin-top: 0; color: #e65100;">${safeTranslate(pageT, 'antipyretics.children.title', locale)}</h4>
                        <ul style="margin: 10px 0;">
                            ${pageT.antipyretics?.children?.conditions?.map((cond: string) => `<li>${cond}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'antipyretics.children.conditions.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'antipyretics.children.conditions.1', locale)}</li>
                            `}
                        </ul>
                        <table style="width: 100%; margin-top: 10px; font-size: 0.9em; border-collapse: collapse;">
                            <tr style="background: #ffecb3;">
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Medication</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Dose</th>
                                <th style="padding: 8px; text-align: left; border-bottom: 1px solid #ddd;">Max</th>
                            </tr>
                            ${pageT.antipyretics?.children?.medications?.map((med: any) => `
                            <tr>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.name}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.dose}</td>
                                <td style="padding: 8px; border-bottom: 1px solid #eee;">${med.max}</td>
                            </tr>
                            `).join('') || ''}
                        </table>
                        <p style="color: #d32f2f; font-weight: bold; margin-top: 15px; font-size: 0.9em;">⚠️ ${safeTranslate(pageT, 'antipyretics.children.warning', locale)}</p>
                    </div>
                </div>
            `
        }, {
            type: 'warning' as const,
            title: safeTranslate(pageT, 'ageGroups.title', locale),
            content: `
                <div style="display: grid; gap: 20px; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));">
                    <div style="background: #ffebee; padding: 20px; border-radius: 8px; border-left: 4px solid #f44336;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">🚨</span>
                            <h3 style="margin: 0; color: #c62828;">${safeTranslate(pageT, 'ageGroups.newborn.title', locale)}</h3>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.newborn?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.newborn.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                    <div style="background: #fff3e0; padding: 20px; border-radius: 8px; border-left: 4px solid #ff9800;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">⚠️</span>
                            <h3 style="margin: 0; color: #e65100;">${safeTranslate(pageT, 'ageGroups.infant.title', locale)}</h3>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.infant?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.infant.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.infant.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.infant.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.infant.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                    <div style="background: #fff8e1; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">🧒</span>
                            <h3 style="margin: 0; color: #f57f17;">${safeTranslate(pageT, 'ageGroups.children.title', locale)}</h3>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong></p>
                        <ul style="margin: 10px 0 0 20px; padding: 0;">
                            ${pageT.ageGroups?.children?.points?.map((point: string) => `<li>${point}</li>`).join('') || `
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.0', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.1', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.2', locale)}</li>
                            <li>${safeTranslate(pageT, 'ageGroups.children.points.3', locale)}</li>
                            `}
                        </ul>
                    </div>
                    <div style="background: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #4caf50;">
                        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 15px;">
                            <span style="font-size: 1.5rem;" aria-hidden="true">👨‍🦳</span>
                            <h3 style="margin: 0; color: #2e7d32;">${safeTranslate(pageT, 'ageGroups.adults.title', locale)}</h3>
                        </div>
                        <p><strong>38°C = ${formattedF}°F</strong></p>
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
                        <tr ${row.celsius === '38.0°C' ? 'style="background-color: #fff3e0;"' : ''}>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '38.0°C' ? '<strong>' : ''}${replacePlaceholders(row.celsius, {fahrenheit: formattedF})}${row.celsius === '38.0°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '38.0°C' ? '<strong>' : ''}${replacePlaceholders(row.fahrenheit, {fahrenheit: formattedF})}${row.celsius === '38.0°C' ? '</strong>' : ''}</td>
                            <td style="padding: 10px; border-bottom: 1px solid #eee;">${row.celsius === '38.0°C' ? '<strong>' : ''}${replacePlaceholders(row.assessment, {fahrenheit: formattedF})}${row.celsius === '38.0°C' ? '</strong>' : ''}</td>
                        </tr>
                        `).join('') : ''}
                    </tbody>
                </table>
            `
        }];

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
            customNamespace="38-c-to-f"
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
