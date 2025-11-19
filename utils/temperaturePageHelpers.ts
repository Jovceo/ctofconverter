/**
 * 温度页面工具函数库
 * 用于生成温度转换页面的结构化数据、Meta信息等
 */

/**
 * 将摄氏度转换为华氏度
 */
export function celsiusToFahrenheit(celsius: number): number {
  return (celsius * 9 / 5) + 32;
}

/**
 * 格式化温度显示（保留1位小数）
 */
export function formatTemperature(value: number, precision: number = 1): string {
  return value.toFixed(precision);
}

/**
 * 生成数字的英文单词（用于温度描述）
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

/**
 * 生成HowTo结构化数据
 */
export function generateHowToStructuredData(celsius: number, fahrenheit: number) {
  const multiplied = celsius * 1.8;
  
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: `How to Convert ${celsius}°C to Fahrenheit`,
    description: `Step-by-step guide to convert ${celsius} degrees Celsius to Fahrenheit`,
    totalTime: 'PT1M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        text: `Start with the temperature in Celsius: ${celsius}°C`,
        name: 'Identify Celsius Value',
      },
      {
        '@type': 'HowToStep',
        text: `Multiply by 9/5: ${celsius} × 9/5 = ${celsius} × 1.8 = ${formatTemperature(multiplied)}`,
        name: 'Multiply by Fraction',
      },
      {
        '@type': 'HowToStep',
        text: `Add 32 to the result: ${formatTemperature(multiplied)} + 32 = ${formatTemperature(fahrenheit)}`,
        name: 'Add 32 Degrees',
      },
      {
        '@type': 'HowToStep',
        text: `The final result is ${formatTemperature(fahrenheit)}°F`,
        name: 'Final Conversion',
      },
    ],
  };
}

/**
 * 生成FAQ结构化数据
 */
export function generateFAQStructuredData(
  celsius: number,
  fahrenheit: number,
  customFAQs?: Array<{ question: string; answer: string }>
) {
  const defaultFAQs = [
    {
      question: `What is ${celsius} degrees Celsius in Fahrenheit?`,
      answer: `${celsius} degrees Celsius equals ${formatTemperature(fahrenheit)} degrees Fahrenheit. To convert, use the formula: °F = (°C × 9/5) + 32`,
    },
    {
      question: `What is minus ${celsius} Celsius to Fahrenheit?`,
      answer: `Minus ${celsius} degrees Celsius equals ${formatTemperature(celsiusToFahrenheit(-celsius))} degrees Fahrenheit.`,
    },
  ];

  const faqs = customFAQs || defaultFAQs;

  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  };
}

/**
 * 生成相关温度链接数据
 */
export function generateRelatedTemperatures(
  celsius: number,
  count: number = 4
): Array<{ celsius: number; fahrenheit: number; href: string }> {
  const related: Array<{ celsius: number; fahrenheit: number; href: string }> = [];
  
  // 生成相邻的温度值
  const offsets = [-2, -1, 1, 2, -3, 3, -4, 4, -5, 5];
  
  for (let i = 0; i < offsets.length && related.length < count; i++) {
    const relatedCelsius = celsius + offsets[i];
    if (relatedCelsius > 0) { // 只包含正数温度
      related.push({
        celsius: relatedCelsius,
        fahrenheit: celsiusToFahrenheit(relatedCelsius),
        href: `/${relatedCelsius}-c-to-f`,
      });
    }
  }
  
  return related;
}

/**
 * 生成页面URL（用于canonical和og:url）
 */
export function generatePageUrl(celsius: number, baseUrl: string = 'https://ctofconverter.com'): string {
  return `${baseUrl}/${celsius}-c-to-f.html`;
}

/**
 * 生成页面标题
 */
export function generatePageTitle(celsius: number, fahrenheit: number): string {
  return `${celsius}°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) | Conversion Guide & Calculator`;
}

/**
 * 生成Meta描述
 */
export function generateMetaDescription(celsius: number, fahrenheit: number, customText?: string): string {
  if (customText) {
    return customText;
  }
  return `Convert ${celsius} degrees Celsius to Fahrenheit quickly. Learn that ${celsius}°C equals ${formatTemperature(fahrenheit)}°F, see the calculation steps, and understand temperature context.`;
}

/**
 * 生成OG描述
 */
export function generateOGDescription(celsius: number, fahrenheit: number, customText?: string): string {
  if (customText) {
    return customText;
  }
  return `Convert ${celsius} degrees Celsius to Fahrenheit instantly. ${celsius}°C equals ${formatTemperature(fahrenheit)}°F - see the calculation steps and practical applications.`;
}

/**
 * 温度范围判断工具
 */
export interface TemperatureContext {
  isBodyTemperature: boolean;
  isFever: boolean;
  isDangerousFever: boolean;
  isExtremeHeat: boolean;
  isCold: boolean;
  isExtremeCold: boolean;
}

export function analyzeTemperature(celsius: number): TemperatureContext {
  return {
    isBodyTemperature: celsius >= 35 && celsius <= 42,
    isFever: celsius >= 38,
    isDangerousFever: celsius >= 41,
    isExtremeHeat: celsius >= 45,
    isCold: celsius < 10,
    isExtremeCold: celsius < -20,
  };
}

