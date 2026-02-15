/**
 * 文本变体生成器 (Text Spinner)
 * 用于生成多样化的文案，避免搜索引擎判定为重复内容。
 * 使用“确定性随机”：相同的输入 (celsius) 总是返回相同的文案变体。
 */

/**
 * 根据输入值选择确定的变体下标
 */
function getVariantIndex(seed: number, length: number): number {
    return Math.abs(Math.round(seed)) % length;
}

import { formatTemperature } from './temperatureCore';

export const textSpinner = {
    getStep1: (celsius: number, t: (key: string, replacements?: any) => any) => {
        const variants = t('spinner.step1');
        if (!Array.isArray(variants)) return `Multiply ${celsius} by 1.8`;
        const idx = getVariantIndex(celsius, variants.length);
        const text = variants[idx];
        return typeof text === 'string' ? text.replace('{celsius}', celsius.toString()) : text;
    },

    getStep2: (celsius: number, step1Result: number, t: (key: string, replacements?: any) => any) => {
        const variants = t('spinner.step2');
        if (!Array.isArray(variants)) return `Add 32 to the result`;
        const idx = getVariantIndex(celsius + 1, variants.length);
        const formattedVal = formatTemperature(step1Result);
        const text = variants[idx];
        return typeof text === 'string' ? text.replace('{val}', formattedVal) : text;
    },

    getConclusion: (celsius: number, fahrenheit: number, t: (key: string, replacements?: any) => any) => {
        const variants = t('spinner.conclusion');
        if (!Array.isArray(variants)) return `${celsius}°C = ${fahrenheit}°F`;
        const idx = getVariantIndex(celsius + 2, variants.length);
        const formattedF = formatTemperature(fahrenheit);
        const text = variants[idx];
        if (typeof text !== 'string') return text;
        return text.replace('{celsius}', celsius.toString()).replace('{fahrenheit}', formattedF);
    },

    getFormulaTitle: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) => {
        const variants = t('spinner.formulaTitle');
        // Fallback for languages without variants
        if (!Array.isArray(variants)) {
            return t('common.formulaTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) });
        }

        const idx = getVariantIndex(celsius + 3, variants.length); // Offset seed for variety
        const text = variants[idx];
        const formattedF = formatTemperature(fahrenheit);
        return text.replace(/{celsius}/g, celsius.toString())
            .replace(/{fahrenheit}/g, formattedF)
            .replace(/{c}/g, celsius.toString()) // Short code support
            .replace(/{f}/g, formattedF);
    },

    getPageTitle: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) => {
        const variants = t('meta.pageTitle');
        const formattedF = formatTemperature(fahrenheit);

        // Fallback or static string handling
        if (!Array.isArray(variants)) {
            // If it returned the key name, try the alternative nested structure
            if (variants === 'meta.pageTitle') {
                const alt = t('meta.titles.general', { celsius, fahrenheit: formattedF });
                if (alt !== 'meta.titles.general') return alt;
            } else if (typeof variants === 'string') {
                // If it's a real string (already translated or has placeholders)
                return variants.replace(/{celsius}/g, celsius.toString()).replace(/{fahrenheit}/g, formattedF);
            }
            return `${celsius}°C to Fahrenheit (${formattedF}°F)`; // Emergency fallback
        }

        const idx = getVariantIndex(celsius + 4, variants.length);
        const text = variants[idx];
        return text.replace(/{celsius}/g, celsius.toString())
            .replace(/{fahrenheit}/g, formattedF);
    },

    getMetaDescription: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) => {
        const variants = t('meta.ogDescription');
        const formattedF = formatTemperature(fahrenheit);

        if (!Array.isArray(variants)) {
            if (variants === 'meta.ogDescription') {
                const alt = t('meta.descriptions.googleGeneral', { celsius, fahrenheit: formattedF });
                if (alt === 'meta.descriptions.googleGeneral') {
                    const alt2 = t('meta.description', { celsius, fahrenheit: formattedF });
                    if (alt2 !== 'meta.description') return alt2;
                } else {
                    return alt;
                }
            } else if (typeof variants === 'string') {
                return variants.replace(/{celsius}/g, celsius.toString()).replace(/{fahrenheit}/g, formattedF);
            }
            return `Convert ${celsius} Celsius to Fahrenheit. ${celsius}°C equals ${formattedF}°F.`;
        }

        const idx = getVariantIndex(celsius + 5, variants.length);
        const text = variants[idx];
        return text.replace(/{celsius}/g, celsius.toString())
            .replace(/{fahrenheit}/g, formattedF);
    },

    getConverterTitle: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) => {
        const variants = t('common.resultHeaderDefault');
        if (!Array.isArray(variants)) {
            if (typeof variants === 'string') {
                return t('common.resultHeaderDefault', { celsius, fahrenheit: formatTemperature(fahrenheit) });
            }
            return "Celsius to Fahrenheit Converter";
        }

        const idx = getVariantIndex(celsius + 6, variants.length);
        const text = variants[idx];
        const formattedF = formatTemperature(fahrenheit);
        return text.replace(/{celsius}/g, celsius.toString())
            .replace(/{fahrenheit}/g, formattedF);
    },

    getIntroText: (celsius: number, formattedFahrenheit: string, locale: string, getLocalizedLink: any, t: (key: string, repl?: any) => any) => {
        // Determine context type
        let type = 'General';
        let key = 'introGeneral';
        let url = '/celsius-to-fahrenheit-chart';

        if (celsius >= 35 && celsius <= 42) {
            type = 'Medical';
            key = 'introMedical';
            url = '/fever-temperature-chart';
        }
        else if (celsius >= -20 && celsius <= 40) {
            type = 'Weather';
            key = 'introWeather';
            url = '/celsius-to-fahrenheit-chart';
        } // Broad weather range
        else if (celsius >= 100 && celsius <= 250) {
            type = 'Cooking';
            key = 'introCooking';
            url = '/fan-oven-conversion-chart';
        }

        // Fetch variants using the specific key
        const variants = t(`common.${key}`);

        // Handle Fallback
        if (!Array.isArray(variants)) {
            return {
                textWithTags: typeof variants === 'string' ? variants : "scientific applications.",
                linkUrl: getLocalizedLink(url, locale)
            };
        }

        const idx = getVariantIndex(celsius + 7, variants.length);

        return {
            textWithTags: variants[idx],
            linkUrl: getLocalizedLink(url, locale)
        };
        return {
            textWithTags: variants[idx],
            linkUrl: getLocalizedLink(url, locale)
        };
    },

    getIntroValue: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => any) => {
        const variants = t('common.introValue');
        const formattedF = formatTemperature(fahrenheit);

        // Fallback if not an array (e.g. other languages)
        if (!Array.isArray(variants)) {
            if (typeof variants === 'string') {
                return variants.replace(/{celsius}/g, celsius.toString())
                    .replace(/{fahrenheit}/g, formattedF);
            }
            return `<strong>${celsius} degrees Celsius</strong> equals <strong>${formattedF} degrees Fahrenheit</strong>.`;
        }

        const idx = getVariantIndex(celsius + 8, variants.length); // Offset seed
        const text = variants[idx];
        return text.replace(/{celsius}/g, celsius.toString())
            .replace(/{fahrenheit}/g, formattedF);
    },

    getIntroConnect: (celsius: number, t: (key: string) => any) => {
        const variants = t('common.introConnect');
        if (!Array.isArray(variants)) return 'This temperature conversion is commonly used in';

        const idx = getVariantIndex(celsius + 9, variants.length);
        return variants[idx];
    },

    /**
     * Smart FAQ Generation System (2025 Strategy)
     * Replaces redundant "What is X?" questions with context-aware, intent-driven Q&A.
     * Uses 6-Template System: Safety, Normalcy, Suitability, Health, Importance, Device.
     */
    getSmartFAQ: (celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) => {
        const faqs = [];
        const formattedF = formatTemperature(fahrenheit);
        const cVal = celsius.toString();

        // Template 1: Safety/Danger (Freezing)
        if (celsius < 0) {
            faqs.push({
                question: `Is ${cVal}°C considered freezing?`,
                answer: `<strong>Yes, water freezes at 0°C.</strong> ${cVal}°C is below the freezing point. Expect ice, frost, and potential pipe bursts if not insulated.`
            });
        }

        // Template 3: Suitability (Cold Weather)
        if (celsius >= 0 && celsius <= 10) {
            faqs.push({
                question: `Do I need a winter coat for ${cVal}°C?`,
                answer: `<strong>Yes, ${cVal}°C is considered chilly.</strong> A warm coat, gloves, and a hat are recommended for prolonged outdoor exposure.`
            });
        }

        // Template 2: Normalcy (Comfort)
        if (celsius >= 20 && celsius <= 25) {
            faqs.push({
                question: `Is ${cVal}°C good room temperature?`,
                answer: `<strong>Yes, in most cases.</strong> ${cVal}°C falls within the ideal "Comfort Zone" for living spaces (20-22°C), though personal preference varies.`
            });
        }

        // Template 4: Health (Fever)
        if (celsius >= 36 && celsius <= 38) {
            faqs.push({
                question: `Is ${cVal}°C a fever for adults?`,
                answer: `<strong>No, ${cVal}°C is typically not a fever.</strong> Normal body temperature is around 37°C. A fever is usually defined as 38°C (100.4°F) or higher.`
            });
        }

        // Template 1: Safety (Cooking)
        if (celsius >= 60 && celsius <= 85) {
            const isSafe = celsius >= 74 ? "Yes" : "Not necessarily";
            const safeContext = celsius >= 74
                ? `${cVal}°C exceeds the USDA safety threshold (74°C) for poultry.`
                : `${cVal}°C is below the recommended 74°C for immediate safety.`;

            faqs.push({
                question: `Is chicken safe at ${cVal}°C?`,
                answer: `<strong>${isSafe}, depending on time.</strong> ${safeContext} Salmonella is killed instantly at 74°C, but lower temperatures can be safe with longer holding times.`
            });
        }

        // Template 3: Suitability (Baking)
        if (celsius >= 160 && celsius <= 220) {
            faqs.push({
                question: `What can I bake at ${cVal}°C?`,
                answer: `<strong>Many standard recipes.</strong> ${cVal}°C is a common setting for baking cakes, cookies, and roasting vegetables, promoting the Maillard reaction.`
            });
        }

        // Template 5: Importance (Boiling)
        if (celsius === 100) {
            faqs.push({
                question: `What is special about ${cVal}°C?`,
                answer: `<strong>It is the boiling point of water.</strong> At standard sea-level pressure, water transitions from liquid to gas (steam) at exactly ${cVal}°C.`
            });
        }

        // Fallback for ranges not covered above (Generic "Method" Intent)
        if (faqs.length === 0) {
            faqs.push({
                question: `How do I convert ${cVal}°C to Fahrenheit manually?`,
                answer: `<strong>Multiply by 1.8, then add 32.</strong> The formula is: (${cVal} × 9/5) + 32 = ${formattedF}°F. This gives you the exact result.`
            });
        }

        return faqs;
    }
};
