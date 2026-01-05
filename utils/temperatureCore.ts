/**
 * Core Temperature Calculation & Formatting Utilities
 * Independent module to prevent circular dependencies.
 */

/**
 * 将摄氏度转换为华氏度
 */
export function celsiusToFahrenheit(celsius: number): number {
    return (celsius * 9 / 5) + 32;
}

/**
 * 将华氏度转换为摄氏度
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
    return (fahrenheit - 32) * 5 / 9;
}

/**
 * 格式化温度显示（保留1位小数，如果是整数则去除小数位）
 * Logic Reverted to strip trailing zeros:
 * 99.50 -> "99.5"
 * 50.00 -> "50"
 */
export function formatTemperature(value: number, precision: number = 1): string {
    const fixed = value.toFixed(precision);
    return parseFloat(fixed).toString();
}

/**
 * 生成数字的英文单词（用于温度描述）
 * Moved here as it's a pure transformation utility
 */
export function numberToWords(num: number): string {
    const ones = ['', 'one', 'two', 'three', 'four', 'five', 'six', 'seven', 'eight', 'nine'];
    const teens = ['ten', 'eleven', 'twelve', 'thirteen', 'fourteen', 'fifteen', 'sixteen', 'seventeen', 'eighteen', 'nineteen'];
    const tens = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];

    if (num === 0) return 'zero';
    if (num < 10) return ones[num];
    if (num < 20) return teens[num - 10];
    if (num < 100) {
        const ten = Math.floor(num / 10);
        const one = num % 10;
        return tens[ten] + (one > 0 ? '-' + ones[one] : '');
    }
    return num.toString();
}
