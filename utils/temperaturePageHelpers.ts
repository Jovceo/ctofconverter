/**
 * 温度页面工具函数库
 * 用于生成温度转换页面的结构化数据、Meta信息等
 */

import {
  celsiusToFahrenheit,
  formatTemperature,
  fahrenheitToCelsius,
  numberToWords
} from './temperatureCore';

export {
  celsiusToFahrenheit,
  formatTemperature,
  fahrenheitToCelsius,
  numberToWords
};



/**
 * 生成HowTo结构化数据
 */
export function generateHowToStructuredData(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string) {
  const multiplied = celsius * 1.8;

  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: t('meta.pageTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
    description: t('meta.ogDescription', { celsius, fahrenheit: formatTemperature(fahrenheit) }),
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
        name: 'Step 1',
      },
      {
        '@type': 'HowToStep',
        text: `${formatTemperature(multiplied)} + 32 = ${formatTemperature(fahrenheit)}`,
        name: 'Step 2',
      },
      {
        '@type': 'HowToStep',
        text: `Result: ${formatTemperature(fahrenheit)}°F`,
        name: 'Result',
      },
    ],
  };
}

/**
 * 移除HTML标签以生成纯文本 (SEO Safe)
 */
function stripHtml(html: string): string {
  if (!html) return '';
  return html
    .replace(/<br\s*\/?>/gi, ' ')
    .replace(/<\/p>/gi, ' ')
    .replace(/<\/li>/gi, '. ')
    .replace(/<[^>]+>/g, '') // Strip remaining tags
    .replace(/\s+/g, ' ') // Collapse multiple spaces
    .trim();
}

/**
 * 生成Breadcrumb结构化数据
 */
export function generateBreadcrumbStructuredData(celsius: number, formattedFahrenheit: string) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://ctofconverter.com/'
      },
      {
        '@type': 'ListItem',
        position: 2,
        name: `${celsius} Celsius to Fahrenheit`, // Keep English for Schema ID typical convention or localize if strictly needed (usually English slug match is fine for ID, but name can be localized. For now simple English as per request)
        item: `https://ctofconverter.com/${String(celsius).replace('.', '-')}-c-to-f`
      }
    ]
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
        text: stripHtml(faq.answer),
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
        href: `/${String(relatedCelsius).replace('.', '-')}-c-to-f`,
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
  // Force dash format for decimals (e.g. 37.5 -> 37-5)
  const celsiusSlug = String(celsius).replace('.', '-');
  return `${baseUrl}${localePath}/${celsiusSlug}-c-to-f`;
}

import { textSpinner } from './textSpinner';

/**
 * SEO 策略枚举
 */
export type SeoStrategy = 'GOOGLE_MOBILE' | 'BING_DESKTOP';

/**
 * 获取温度对应的 SEO 策略 (Deterministic Diversification + Keyword Intelligence)
 * 逻辑：
 * 1. 关键词强匹配： 'search'/'quick' -> Google, 'chart'/'table' -> Bing
 * 2. 特殊物理点 (-40, 0, 100) -> 强制通用全能模式 (HYBRID) -> 但此处简化为根据 ID 分配
 * 3. 偶数/整十数 -> BING (更传统，适合桌面搜索)
 * 4. 奇数/非整十数 -> GOOGLE (更现代，适合移动端快速结果)
 * 5. 强 Context (37, 180) -> GOOGLE (Answer First)
 */
export function getSeoStrategy(celsius: number, keywords: string[] = []): SeoStrategy {
  // 0. Keyword Intelligence (Explicit Overrides)
  const k = keywords.join(' ').toLowerCase();

  if (k.includes('search') || k.includes('quick') || k.includes('answer') || k.includes('mobile') || k.includes('what is')) {
    return 'GOOGLE_MOBILE';
  }

  if (k.includes('chart') || k.includes('table') || k.includes('list') || k.includes('pdf') || k.includes('desktop') || k.includes('bing')) {
    return 'BING_DESKTOP';
  }

  // 1. 强 Context 优先给 Google (移动端场景多)
  // (Unless explicit keyword override above)
  const context = analyzeTemperature(celsius);
  if (celsius === 37 || celsius === 180 || Math.abs(celsius + 40) < 0.1) {
    return 'GOOGLE_MOBILE';
  }

  // 2. 简单确定性哈希：整数位偶数给 Bing，奇数给 Google
  // 30 -> Bing, 25 -> Google
  // 这样保证全站分布约 50/50
  const integerPart = Math.floor(Math.abs(celsius));
  return integerPart % 2 === 0 ? 'BING_DESKTOP' : 'GOOGLE_MOBILE';
}

/**
 * 生成页面标题 (Strategy Aware)
 */
export function generatePageTitle(
  celsius: number,
  fahrenheit: number,
  t: (key: string, repl?: any) => string,
  context?: TemperatureContext,
  keywords?: string[]
): string {
  // 1. -40 Exception (Scientific curiosity)
  if (Math.abs(celsius + 40) < 0.1) {
    return t('meta.titles.sameValue', { celsius, fahrenheit: formatTemperature(fahrenheit) });
  }

  // 2. Identify Zone/Scene
  const scene = getTemperatureScene(celsius);

  // 3. Select Template Key based on Zone
  let titleKey = 'meta.titles.general';

  switch (scene.name) {
    case 'BODY':
      // Zone A: Fever / Body Temp -> Question-Based
      titleKey = 'meta.titles.fever';
      break;
    case 'WEATHER':
      // Zone B: Weather -> Guide-Based
      titleKey = 'meta.titles.weather';
      break;
    case 'OVEN':
      // Zone C: Cooking -> Utility-Based
      titleKey = 'meta.titles.cooking';
      break;
    default:
      // Zone D: General / Water / Extreme -> Utility-Based
      titleKey = 'meta.titles.general';
      break;
  }

  // 4. Generate Title with Exact Precision
  // formatTemperature(fahrenheit) now defaults to 2 decimals, ensuring "Always Exact"
  return t(titleKey, {
    celsius,
    fahrenheit: formatTemperature(fahrenheit)
  }).trim();
}

/**
 * 生成 Meta 描述 (Strategy Aware)
 */
export function generateMetaDescription(
  celsius: number,
  fahrenheit: number,
  t: (key: string, repl?: any) => string,
  context?: TemperatureContext,
  keywords?: string[]
): string {
  // -40 Exception
  if (Math.abs(celsius + 40) < 0.1) {
    return t('meta.descriptions.sameValue', { celsius, fahrenheit: formatTemperature(fahrenheit) });
  }

  // Format Fahrenheit to ensure "Always Exact" (2 decimal places)
  const formattedF = formatTemperature(fahrenheit);

  // Context Driven (Body/Cooking/Weather)
  if (context?.scene) {
    return t('meta.descriptions.googleContext', {
      celsius,
      fahrenheit: formattedF,
      contextType: context.scene.intentType || 'measurement',
      // Pass formattedF for any formula placeholders if needed
      weather_context: context.scene.intentType // mapping might need adjustment but 'intentType' is distinct string like 'medical'
    });
  }

  // General Fallback
  return t('meta.descriptions.googleGeneral', {
    celsius,
    fahrenheit: formattedF
  });
}

/**
 * 生成OG描述
 * (Typically same as Meta Description for consistency, or can have its own variant logic)
 */
export function generateOGDescription(celsius: number, fahrenheit: number, t: (key: string, repl?: any) => string): string {
  return textSpinner.getMetaDescription(celsius, fahrenheit, t);
}

/**
 * 温度范围判断工具
 */
/**
 * 温度场景枚举
 */
export type SceneType = 'BODY' | 'WEATHER' | 'OVEN' | 'WATER' | 'EXTREME_COLD' | 'EXTREME_HOT';

/**
 * 场景配置接口 (Enhanced for Grouped Rendering)
 */
interface SceneConfig {
  name: SceneType;
  range: [number, number]; // [min, max] inclusive
  precisionSteps: number[]; // e.g. [-1, 1] for neighbors
  anchors: { val: number; labelKey?: string }[]; // Benchmarks with semantic labels
  reverseRoundTo?: number; // Round Fahrenheit to nearest X
  intentType?: string;
}

/**
 * 全局温度场景配置表
 * SYSTEM CORE: 定义了整个网站的温度世界观
 */
const SCENE_CONFIGS: Record<SceneType, SceneConfig> = {
  // 1. BODY: 32.0 <= T <= 42.9 (Medical Context Dominates)
  // Fix: Extended slightly to cover 42.x, but explicitly stop before 43.
  // 43 is technically survivable short term but usually transitions to "HOT WATER" in common perception unless specifically medical.
  // Let's keep BODY focused. 35-42 is the core.
  BODY: {
    name: 'BODY',
    range: [32.0, 42.99],
    precisionSteps: [-0.5, -0.1, 0.1, 0.5], // Micro-adjustments
    anchors: [
      { val: 36.5, labelKey: 'normalLow' },
      { val: 37.0, labelKey: 'normalBodyTemp' },
      { val: 38.0, labelKey: 'feverThreshold' },
      { val: 39.0, labelKey: 'highFever' },
      { val: 40.0, labelKey: 'dangerousFever' }, // 40 is key
      { val: 42.0, labelKey: 'criticalLimit' }   // 42 is boundary
    ],
    reverseRoundTo: 1, // 98, 99...
    intentType: 'medical'
  },
  // 2. WEATHER: -50.0 <= T < 32.0
  // Refined: Focused on Human-scale weather (-20 to 40), removed excessive noise
  WEATHER: {
    name: 'WEATHER',
    range: [-50.0, 31.99],
    precisionSteps: [-2, -1, 1, 2], // Close neighbors
    anchors: [
      { val: 0, labelKey: 'freezingPoint' },
      { val: 10, labelKey: 'coolWeather' },
      { val: 20, labelKey: 'roomTemp' },
      { val: 25, labelKey: 'warm' },
      { val: 30, labelKey: 'hotWeather' }
    ],
    reverseRoundTo: 10, // 0, 10, 20...
    intentType: 'weather'
  },
  // 3. WATER: 43.0 <= T < 100.0
  // Fix: Starts at 43.0. 
  // Anchor Fix: 47 is WATER scene. 
  // But wait, 47C is "Painful Hot Water" or "Extreme Weather". 
  // The user concern was 47C showing "Green Tea".
  // Green Tea is 70C. 
  // The problem was 47C seeing distant anchors like 70/80.
  // We need Closest logic to handle that (which we did).
  // But also, we need anchors relevant to 40-50 range if possible?
  // 50C is Hot Bath limit.
  WATER: {
    name: 'WATER',
    range: [43.0, 99.99],
    precisionSteps: [-1, 1, 2], // Tighter steps. Removed +5.
    anchors: [
      { val: 50, labelKey: 'extremeHotBath' },
      { val: 60, labelKey: 'hotWater' },
      { val: 70, labelKey: 'greenTea' },
      { val: 80, labelKey: 'coffeeBrewing' },
      { val: 100, labelKey: 'boilingPoint' }
    ],
    reverseRoundTo: 10,
    intentType: 'liquid'
  },
  // 4. OVEN: 100.0 <= T <= 300.0
  OVEN: {
    name: 'OVEN',
    range: [100.0, 300.0],
    precisionSteps: [-10, -5, 5, 10], // Knobs usually 10-20 diff, but we want close neighbors
    anchors: [
      { val: 160, labelKey: 'slowBake' },
      { val: 180, labelKey: 'moderateOven' },
      { val: 200, labelKey: 'hotOven' },
      { val: 220, labelKey: 'veryHot' }
    ],
    reverseRoundTo: 25, // 325, 350, 375
    intentType: 'cooking'
  },
  // 5a. EXTREME_COLD
  EXTREME_COLD: {
    name: 'EXTREME_COLD',
    range: [-Number.MAX_VALUE, -50.01],
    precisionSteps: [-10, 10],
    anchors: [
      { val: -273.15, labelKey: 'absoluteZero' },
      { val: -78.5, labelKey: 'dryIce' }
    ],
    reverseRoundTo: 50,
    intentType: 'science'
  },
  // 5b. EXTREME_HOT
  EXTREME_HOT: {
    name: 'EXTREME_HOT',
    range: [300.01, Number.MAX_VALUE],
    precisionSteps: [-50, 50],
    anchors: [
      { val: 1064, labelKey: 'goldMelting' }
    ],
    reverseRoundTo: 100,
    intentType: 'industrial'
  }
};

/**
 * 获取温度对应的场景配置
 */
export function getTemperatureScene(celsius: number): SceneConfig {
  if (celsius >= 32.0 && celsius <= 43.0) return SCENE_CONFIGS.BODY;
  if (celsius >= 100.0 && celsius <= 300.0) return SCENE_CONFIGS.OVEN; // Check OVEN before WATER edge case if overlapped (not overlapping here)
  if (celsius > 43.0 && celsius < 100.0) return SCENE_CONFIGS.WATER;
  if (celsius >= -50.0 && celsius < 32.0) return SCENE_CONFIGS.WEATHER;
  if (celsius < -50.0) return SCENE_CONFIGS.EXTREME_COLD;
  return SCENE_CONFIGS.EXTREME_HOT;
}

/**
 * 温度范围判断工具 (Enhanced with Scene)
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
  scene?: SceneConfig; // New field
}

/**
 * 分析温度并返回其上下文信息
 * (Legacy + New Scene Logic)
 */
export function analyzeTemperature(celsius: number): TemperatureContext {
  const scene = getTemperatureScene(celsius);

  const isBodyTemperature = celsius >= 35 && celsius <= 42;
  const isFever = celsius >= 38;
  const isDangerousFever = celsius >= 41;
  const isExtremeHeat = celsius >= 45;
  const isCold = celsius < 10;
  const isExtremeCold = celsius < -20;

  const categoryKeys: string[] = [];
  let descriptionKey = '';

  // Legacy mappings (preserving existing UI logic)
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
    descriptionKey,
    scene // Attach new scene config
  };
}


