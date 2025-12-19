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
        const formattedVal = Number.isInteger(step1Result) ? step1Result.toString() : step1Result.toFixed(1);
        const text = variants[idx];
        return typeof text === 'string' ? text.replace('{val}', formattedVal) : text;
    },

    getConclusion: (celsius: number, fahrenheit: number, t: (key: string, replacements?: any) => any) => {
        const variants = t('spinner.conclusion');
        if (!Array.isArray(variants)) return `${celsius}°C = ${fahrenheit}°F`;
        const idx = getVariantIndex(celsius + 2, variants.length);
        const formattedF = Number.isInteger(fahrenheit) ? fahrenheit.toString() : fahrenheit.toFixed(2);
        const text = variants[idx];
        if (typeof text !== 'string') return text;
        return text.replace('{celsius}', celsius.toString()).replace('{fahrenheit}', formattedF);
    }
};
