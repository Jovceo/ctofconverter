/**
 * 华氏度转摄氏度工具函数
 * Fahrenheit to Celsius Conversion Utilities
 */

/**
 * 华氏度转摄氏度核心转换函数
 * @param fahrenheit - 华氏度温度值
 * @returns 摄氏度温度值
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
    // 公式: °C = (°F - 32) × 5/9
    return ((fahrenheit - 32) * 5) / 9;
}

/**
 * 摄氏度转华氏度（辅助函数，用于验证）
 * @param celsius - 摄氏度温度值
 * @returns 华氏度温度值
 */
export function celsiusToFahrenheit(celsius: number): number {
    // 公式: °F = (°C × 9/5) + 32
    return (celsius * 9) / 5 + 32;
}

/**
 * 格式化温度显示
 * @param value - 温度值
 * @param decimals - 保留小数位数（默认2位）
 * @returns 格式化后的温度字符串
 */
export function formatTemperature(value: number, decimals: number = 2): string {
    // 处理特殊值
    if (!isFinite(value)) return '--';

    // 对于整数或接近整数的值，不显示小数
    if (Math.abs(value - Math.round(value)) < 0.01) {
        return Math.round(value).toString();
    }

    // 保留指定小数位
    return value.toFixed(decimals).replace(/\.?0+$/, '');
}

/**
 * 生成转换表格数据
 * @param startF - 起始华氏度值
 * @param count - 生成数据行数
 * @param step - 步长（默认10）
 * @returns 表格数据数组
 */
export interface FtoCTableRow {
    fahrenheit: number;
    celsius: number;
    fahrenheitFormatted: string;
    celsiusFormatted: string;
    description?: string;
}

export function generateFtoCTableData(
    startF: number = -40,
    count: number = 30,
    step: number = 10
): FtoCTableRow[] {
    const data: FtoCTableRow[] = [];

    for (let i = 0; i < count; i++) {
        const f = startF + i * step;
        const c = fahrenheitToCelsius(f);

        data.push({
            fahrenheit: f,
            celsius: c,
            fahrenheitFormatted: formatTemperature(f),
            celsiusFormatted: formatTemperature(c)
        });
    }

    return data;
}

/**
 * 获取温度的描述性标签（用于表格）
 * @param fahrenheit - 华氏度温度值
 * @param locale - 语言代码
 * @returns 描述文本（需要从翻译文件获取）
 */
export function getTemperatureLabel(fahrenheit: number, locale: string = 'en'): string {
    // 特殊参考点
    const referencePoints: Record<number, string> = {
        '-459.67': 'absoluteZero',
        '-40': 'intersection',
        '0': 'extremelyCold',
        '32': 'freezingPoint',
        '68': 'roomTemperature',
        '98.6': 'bodyTemperature',
        '212': 'boilingPoint',
    };

    const key = fahrenheit.toString();
    return (referencePoints as Record<string, string>)[key] || '';
}

/**
 * 分析温度范围，返回场景分类
 * @param fahrenheit - 华氏度温度值
 * @returns 场景对象
 */
export interface TemperatureScene {
    category: 'extreme-cold' | 'cold' | 'cool' | 'comfortable' | 'warm' | 'hot' | 'extreme-hot' | 'cooking';
    icon: string;
    colorCode: string;
}

export function analyzeTemperatureScene(fahrenheit: number): TemperatureScene {
    if (fahrenheit < -40) {
        return { category: 'extreme-cold', icon: '🥶', colorCode: '#0066cc' };
    } else if (fahrenheit < 32) {
        return { category: 'cold', icon: '❄️', colorCode: '#3498db' };
    } else if (fahrenheit < 50) {
        return { category: 'cool', icon: '🧥', colorCode: '#5dade2' };
    } else if (fahrenheit < 68) {
        return { category: 'comfortable', icon: '😊', colorCode: '#27ae60' };
    } else if (fahrenheit < 86) {
        return { category: 'warm', icon: '☀️', colorCode: '#f39c12' };
    } else if (fahrenheit < 100) {
        return { category: 'hot', icon: '🔥', colorCode: '#e67e22' };
    } else if (fahrenheit < 200) {
        return { category: 'extreme-hot', icon: '🌡️', colorCode: '#e74c3c' };
    } else {
        return { category: 'cooking', icon: '🍳', colorCode: '#8e44ad' };
    }
}

/**
 * 验证华氏度输入值
 * @param value - 输入值
 * @returns 验证结果
 */
export interface ValidationResult {
    isValid: boolean;
    message?: string;
    value?: number;
}

export function validateFahrenheitInput(value: string): ValidationResult {
    // 空值检查
    if (!value || value.trim() === '') {
        return { isValid: false, message: 'Please enter a temperature value' };
    }

    // 数值检查
    const num = parseFloat(value);
    if (isNaN(num)) {
        return { isValid: false, message: 'Please enter a valid number' };
    }

    // 范围检查（绝对零度以上）
    if (num < -459.67) {
        return { isValid: false, message: 'Temperature cannot be below absolute zero (-459.67°F)' };
    }

    // 实用范围警告（可选）
    if (num > 10000) {
        return { isValid: true, value: num, message: 'Warning: This is an extremely high temperature' };
    }

    return { isValid: true, value: num };
}

/**
 * 生成转换步骤说明（用于教学）
 * @param fahrenheit - 华氏度温度值
 * @returns 步骤说明数组
 */
export interface ConversionStep {
    step: number;
    title: string;
    formula: string;
    calculation: string;
    result: string;
}

export function generateConversionSteps(fahrenheit: number): ConversionStep[] {
    const step1 = fahrenheit - 32;
    const step2 = step1 * 5;
    const celsius = step2 / 9;

    return [
        {
            step: 1,
            title: 'Subtract 32',
            formula: '°F - 32',
            calculation: `${formatTemperature(fahrenheit, 2)} - 32 = ${formatTemperature(step1, 2)}`,
            result: formatTemperature(step1, 2)
        },
        {
            step: 2,
            title: 'Multiply by 5',
            formula: '(°F - 32) × 5',
            calculation: `${formatTemperature(step1, 2)} × 5 = ${formatTemperature(step2, 2)}`,
            result: formatTemperature(step2, 2)
        },
        {
            step: 3,
            title: 'Divide by 9',
            formula: '[(°F - 32) × 5] ÷ 9',
            calculation: `${formatTemperature(step2, 2)} ÷ 9 = ${formatTemperature(celsius, 2)}`,
            result: formatTemperature(celsius, 2)
        }
    ];
}

/**
 * 生成常见温度参考点数据
 * @returns 参考点数组
 */
export interface TemperatureReference {
    fahrenheit: number;
    celsius: number;
    labelKey: string;
    category: string;
}

export function getCommonTemperatureReferences(): TemperatureReference[] {
    return [
        { fahrenheit: -459.67, celsius: -273.15, labelKey: 'absoluteZero', category: 'science' },
        { fahrenheit: -40, celsius: -40, labelKey: 'intersection', category: 'science' },
        { fahrenheit: 0, celsius: -17.78, labelKey: 'extremelyCold', category: 'weather' },
        { fahrenheit: 32, celsius: 0, labelKey: 'freezingPoint', category: 'science' },
        { fahrenheit: 50, celsius: 10, labelKey: 'coolDay', category: 'weather' },
        { fahrenheit: 68, celsius: 20, labelKey: 'roomTemperature', category: 'comfort' },
        { fahrenheit: 77, celsius: 25, labelKey: 'warmDay', category: 'weather' },
        { fahrenheit: 86, celsius: 30, labelKey: 'hotDay', category: 'weather' },
        { fahrenheit: 98.6, celsius: 37, labelKey: 'bodyTemperature', category: 'health' },
        { fahrenheit: 100, celsius: 37.78, labelKey: 'fever', category: 'health' },
        { fahrenheit: 212, celsius: 100, labelKey: 'boilingPoint', category: 'science' },
        { fahrenheit: 350, celsius: 176.67, labelKey: 'bakingTemp', category: 'cooking' },
        { fahrenheit: 450, celsius: 232.22, labelKey: 'broilingTemp', category: 'cooking' },
    ];
}
