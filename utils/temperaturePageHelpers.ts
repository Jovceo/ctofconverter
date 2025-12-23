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
  const fixed = value.toFixed(precision);
  return parseFloat(fixed).toString();
}

/**
 * 生成数字的英文单词（用于温度描述）
 * TODO: 如果需要其他语言的单词生成，可以在此扩展
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
export function generateHowToStructuredData(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) {
  const multiplied = celsius * 1.8;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('meta.pageTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
    description: t('meta.description', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
    totalTime: 'PT1M',
    estimatedCost: {
      '@type': 'MonetaryAmount',
      currency: 'USD',
      value: '0',
    },
    step: [
      {
        '@type': 'HowToStep',
        text: `Starting value: ${celsius}°C`, // Simplified for now
        name: t('common.stepTitle'),
      },
      {
        '@type': 'HowToStep',
        text: `${celsius} × 1.8 = ${formatTemperature(multiplied)}`,
        name: t('common.step1'),
      },
      {
        '@type': 'HowToStep',
        text: `${formatTemperature(multiplied)} + 32 = ${formatTemperature(fahrenheit)}`,
        name: t('common.step2'),
      },
      {
        '@type': 'HowToStep',
        text: t('common.stepResult') + `: ${formatTemperature(fahrenheit)}°F`,
        name: t('common.stepResult'),
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
  t: (key: string, repl?: any) => string,
  customFAQs?: Array<{ question: string; answer: string }>
) {
  const defaultFAQs = [
    {
      question: t('faqs.core.q1', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
      answer: t('faqs.core.a1', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
    },
    {
      question: t('faqs.core.q3'),
      answer: t('faqs.core.a3'),
    },
  ];

  const faqs = (customFAQs && customFAQs.length > 0) ? customFAQs : defaultFAQs;

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
    if (relatedCelsius > 0) {
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
export function generatePageUrl(celsius: number, locale: string = 'en', baseUrl: string = 'https://ctofconverter.com'): string {
  const localePath = locale === 'en' ? '' : `/${locale}`;
  return `${baseUrl}${localePath}/${celsius}-c-to-f`;
}

/**
 * 生成页面标题
 */
export function generatePageTitle(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string): string {
  return t('meta.pageTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) });
}

/**
 * 生成Meta描述
 */
export function generateMetaDescription(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string): string {
  return t('meta.description', { celsius, fahrenheit: formatTemperature(fahrenheit) });
}

/**
 * 生成OG描述
 */
export function generateOGDescription(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string): string {
  return t('meta.ogDescription', { celsius, fahrenheit: formatTemperature(fahrenheit) });
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
  categoryKeys: string[];
  descriptionKey: string;
}

/**
 * 分析温度并返回其上下文信息
 */
export function analyzeTemperature(celsius: number): TemperatureContext {
  const isBodyTemperature = celsius >= 35 && celsius <= 42;
  const isFever = celsius >= 38;
  const isDangerousFever = celsius >= 41;
  const isExtremeHeat = celsius >= 45;
  const isCold = celsius < 10;
  const isExtremeCold = celsius < -20;

  const categoryKeys: string[] = [];
  let descriptionKey = '';

  if (isBodyTemperature) {
    categoryKeys.push('body');
    if (isFever) {
      if (isDangerousFever) {
        categoryKeys.push('dangerousFever');
        descriptionKey = 'dangerousFever';
      } else {
        categoryKeys.push('fever');
        descriptionKey = 'fever';
      }
    } else {
      descriptionKey = 'elevated';
    }
  } else if (isExtremeHeat) {
    categoryKeys.push('extremeHeat');
    descriptionKey = 'extremeHeat';
  } else if (celsius > 40) {
    categoryKeys.push('veryHot');
    descriptionKey = 'veryHot';
  } else if (celsius > 30) {
    categoryKeys.push('hot');
    descriptionKey = 'hot';
  } else if (celsius > 20) {
    categoryKeys.push('warm');
    descriptionKey = 'warm';
  } else if (celsius > 15) {
    categoryKeys.push('mild');
    descriptionKey = 'mild';
  } else if (celsius > 10) {
    categoryKeys.push('cool');
    descriptionKey = 'cool';
  } else if (isExtremeCold) {
    categoryKeys.push('extremeCold');
    descriptionKey = 'extremeCold';
  } else if (isCold) {
    categoryKeys.push('cold');
    descriptionKey = 'cold';
  } else {
    categoryKeys.push('moderate');
    descriptionKey = 'moderate';
  }

  return {
    isBodyTemperature,
    isFever,
    isDangerousFever,
    isExtremeHeat,
    isCold,
    isExtremeCold,
    categoryKeys,
    descriptionKey
  };
}

/**
 * 将华氏度转换为摄氏度
 */
export function fahrenheitToCelsius(fahrenheit: number): number {
  return (fahrenheit - 32) * 5 / 9;
}
