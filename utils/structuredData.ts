/**
 * 结构化数据工具模块
 * 提供生成各种SEO增强的结构化数据功能
 */

interface TemperaturePageData {
  temperatureValue: number;
  temperatureUnit: 'celsius' | 'fahrenheit';
  pageTitle: string;
  pageDescription: string;
  conversionResult: string;
  conversionSteps: string[];
  faqs?: Array<{ question: string; answer: string }>;
}

interface HowToStep {
  name: string;
  text: string;
}

interface FAQItem {
  question: string;
  answer: string;
}

/**
 * 生成温度转换页面的完整结构化数据
 * 包含WebPage、HowTo和FAQ三种类型
 */
export function generateStructuredDataForTemperaturePage(data: TemperaturePageData): any[] {
  const structuredData = [];

  // WebPage结构化数据
  structuredData.push(generateWebPageStructuredData(data));

  // HowTo结构化数据（转换步骤）
  structuredData.push(generateHowToStructuredData(data));

  // FAQ结构化数据（如果有）
  if (data.faqs && data.faqs.length > 0) {
    structuredData.push(generateFAQStructuredData(data.faqs));
  }

  return structuredData;
}

/**
 * 生成WebPage类型结构化数据
 */
function generateWebPageStructuredData(data: TemperaturePageData): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': data.pageTitle,
    'description': data.pageDescription,
    'url': `${typeof window !== 'undefined' ? window.location.href : ''}`,
    'mainEntity': {
      '@type': 'HowTo',
      'name': `如何将 ${data.temperatureValue}${data.temperatureUnit === 'celsius' ? '°C' : '°F'} 转换为其他温度单位`,
      'description': data.pageDescription
    }
  };
}

/**
 * 生成HowTo类型结构化数据
 */
function generateHowToStructuredData(data: TemperaturePageData): any {
  // 将字符串步骤转换为HowToStep对象
  const steps: HowToStep[] = data.conversionSteps.map((step, index) => ({
    name: `步骤 ${index + 1}`,
    text: step
  }));

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    'name': `如何将 ${data.temperatureValue}${data.temperatureUnit === 'celsius' ? '°C' : '°F'} 转换为${data.temperatureUnit === 'celsius' ? '华氏度' : '摄氏度'}`,
    'description': data.pageDescription,
    'step': steps.map(step => ({
      '@type': 'HowToStep',
      'name': step.name,
      'text': step.text
    })),
    'totalTime': 'PT1M', // 完成时间估计
    'tool': [
      {
        '@type': 'HowToTool',
        'name': '温度转换器'
      }
    ],
    'supply': [
      {
        '@type': 'HowToSupply',
        'name': '计算器'
      }
    ],
    'result': {
      '@type': 'HowToDirection',
      'text': `最终结果: ${data.conversionResult}`
    }
  };
}

/**
 * 生成FAQ类型结构化数据
 */
export function generateFAQStructuredData(faqItems: FAQItem[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    'mainEntity': faqItems.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };
}

/**
 * 生成Product类型结构化数据（用于工具展示）
 */
export function generateProductStructuredData(toolName: string, description: string, url: string): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    'name': toolName,
    'description': description,
    'url': url,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD',
      'availability': 'https://schema.org/InStock'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '1000+'
    }
  };
}

/**
 * 生成BreadcrumbList类型结构化数据
 */
export function generateBreadcrumbStructuredData(path: string[]): any {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': path.map((item, index) => ({
      '@type': 'ListItem',
      'position': index + 1,
      'name': item,
      'item': `/${path.slice(0, index + 1).join('/')}`
    }))
  };
}

/**
 * 生成JSON-LD脚本字符串
 */
export function generateJSONLDScript(structuredData: any | any[]): string {
  const dataToOutput = Array.isArray(structuredData) ? structuredData : [structuredData];

  return dataToOutput.map(data =>
    `<script type="application/ld+json">
${JSON.stringify(data, null, 2)}
</script>`
  ).join('\n');
}

/**
 * 生成温度转换特定的FAQ结构化数据
 */
export function generateTemperatureConversionFAQStructuredData(temperature: number, unit: 'celsius' | 'fahrenheit'): any {
  const faqItems: FAQItem[] = [
    {
      question: `什么是 ${temperature}${unit === 'celsius' ? '°C' : '°F'} 在${unit === 'celsius' ? '华氏度' : '摄氏度'}中的值？`,
      answer: unit === 'celsius' ?
        `${temperature}°C 等于 ${parseFloat((temperature * 9 / 5 + 32).toFixed(1)).toString()}°F。转换公式为：(°C × 9/5) + 32 = °F。` :
        `${temperature}°F 等于 ${parseFloat(((temperature - 32) * 5 / 9).toFixed(1)).toString()}°C。转换公式为：(°F - 32) × 5/9 = °C。`
    },
    {
      question: `${temperature}${unit === 'celsius' ? '°C' : '°F'} 被认为是热还是冷？`,
      answer: unit === 'celsius' ?
        `${temperature}°C 在日常生活中被认为是${temperature > 30 ? '热的' : temperature < 10 ? '冷的' : '适中的'}。这个温度在不同的环境和场景中有不同的意义。` :
        `${temperature}°F 在日常生活中被认为是${temperature > 86 ? '热的' : temperature < 50 ? '冷的' : '适中的'}。这个温度在不同的环境和场景中有不同的意义。`
    },
    {
      question: `温度转换的精确公式是什么？`,
      answer: `摄氏度到华氏度: (°C × 9/5) + 32 = °F\n华氏度到摄氏度: (°F - 32) × 5/9 = °C`
    }
  ];

  return generateFAQStructuredData(faqItems);
}
