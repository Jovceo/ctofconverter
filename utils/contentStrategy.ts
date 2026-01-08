// 核心内容策略接口定义
export interface ContentStrategy {
    topic: 'cooking' | 'weather' | 'health' | 'science' | 'general';
    modules: {
        showOvenGuide: boolean;
        showHumanFeel: boolean;
        showHealthAlert: boolean;
        showConversionGuide?: boolean;
        showPracticalApps?: boolean;
    };
    text: {
        intro: string;
        description: string;
    };
    // 🏷️ 原始关键词 (用于 SEO 策略)
    keywords?: string[];
    // 🧠 动态洞察
    insights?: {
        title: string;
        content: string;
        type: 'warning' | 'tip' | 'fact';
    }[];
    // ❓ 自定义FAQ
    faqs?: {
        question: string;
        answer: string;
    }[];
}

// 🧠 知识库：针对特定关键词的预制高价值内容
// 在实际生产中，这个可以替换为调用 LLM API 或查询数据库
interface KnowledgeEntry {
    insights: ContentStrategy['insights'];
    faqs?: ContentStrategy['faqs'];
    matchType?: 'exact' | 'partial'; // Default: 'exact' (whole word)
    tempRange?: [number, number]; // [min, max] Inclusive
}

const KNOWLEDGE_BASE: Record<string, KnowledgeEntry> = {
    // 🍵 Tea: 仅在中温区触发 (60-90°C)
    'tea': {
        tempRange: [60, 90],
        insights: [{
            type: 'tip',
            title: 'Tea Brewing Expert Tip',
            content: 'Different teas need different temperatures. 75°C-80°C is the "Gold Standard" for delicate Green Tea and White Tea to prevent bitterness.'
        }],
        faqs: [{
            question: "Is 75°C good for tea?",
            answer: "Yes, 75°C (167°F) is perfect for Green Tea. Boiling water (100°C) burns delicate leaves, destroying antioxidants and creating a bitter taste."
        }]
    },
    // 🍗 Chicken: 仅在巴氏杀菌/烹饪区触发 (65-90°C)
    'chicken': {
        tempRange: [65, 90],
        insights: [{
            type: 'fact',
            title: 'Food Safety: Poultry',
            content: 'USDA recommends cooking chicken to an internal temperature of 165°F (74°C). At 75°C, your chicken is perfectly safe and juicy.'
        }],
        faqs: [{
            question: "Is chicken done at 75°C?",
            answer: "Yes. 75°C converts to 167°F, which is slightly above the USDA safe minimum of 165°F (74°C) for poultry. It is fully cooked."
        }]
    },
    // 💧 Water (General): 宽泛匹配，但避免极端情况覆盖
    // Note: Scalding warning moved to specific key or separate logic
    'water': {
        // No specific range, applies generally unless overridden by more specific keys
        insights: [],
        faqs: []
    },
    // 🔥 Scalding Risk: 中高温区 (55-90°C)
    // 避免在 100°C (已是沸水，不用强调"可以摸吗") 或 0°C (冰水) 出现奇怪的问题
    'burn': {
        tempRange: [50, 95], // 95+ usually implies boiling warnings instead
        insights: [{
            type: 'warning',
            title: 'Safety Warning: Scalding Risk',
            content: 'Water in this range causes severe burns in seconds. It is much hotter than standard domestic hot water (usually 50-60°C).'
        }],
        faqs: [{
            question: "Can I touch this water?",
            answer: "No! Water at this temperature is scalding hot and dangerous. Always mix with cold water before contact."
        }]
    },
    // 沸腾 / 蒸汽 (95-105°C)
    'boiling': {
        tempRange: [95, 105],
        insights: [{
            type: 'fact',
            title: 'Sterilization Zone',
            content: 'Water at this temperature kills most bacteria, viruses, and protozoa. It is the standard for safe drinking water sterilization.'
        }],
        faqs: [{
            question: "Is boiling water always 100°C?",
            answer: "At sea level, yes. However, at higher altitudes, the boiling point drops. For example, in Denver (Mile High City), water boils at about 95°C (203°F)."
        }]
    },
    'steam': {
        tempRange: [95, 150],
        insights: [{
            type: 'warning',
            title: 'Steam Burn Hazard',
            content: 'Steam contains more heat energy than boiling water at the same temperature due to latent heat. Steam burns can be more severe than water burns.'
        }]
    },
    // 🧊 结冰 ((-5)-5°C)
    'freezing': {
        tempRange: [-5, 5],
        insights: [{
            type: 'warning',
            title: 'Black Ice Risk',
            content: 'Road surfaces can freeze even when air temperature is slightly above zero. Always drive with caution near 0°C.'
        }],
        faqs: [{
            question: "Does 0°C always mean ice?",
            answer: "For pure water at standard pressure, yes. But salt water freezes at lower temperatures (like ocean water at -2°C). Supercooled water can also remain liquid below 0°C if undisturbed."
        }]
    },
    'ice': {
        tempRange: [-50, 5],
        insights: [{
            type: 'tip',
            title: 'Phase Change',
            content: 'At 0°C, ice and water can coexist in equilibrium. Adding energy melts ice; removing energy freezes water.'
        }]
    }
};

interface TranslationFunction {
    (key: string, options?: any): string;
}

export function generateContentStrategy(celsius: number, keyword: string = '', t?: TranslationFunction): ContentStrategy {
    // Normalize keyword string and split into individual word tokens for whole-word matching
    const normalizedInput = keyword.toLowerCase();
    const tokens = normalizedInput.split(/[\s,]+/); // Split by space or comma

    // 0. 🔍 挖掘引擎：尝试匹配知识库
    let detectedInsights: NonNullable<ContentStrategy['insights']> = [];
    let detectedFaqs: NonNullable<ContentStrategy['faqs']> = [];

    // Helper: Check if token matches key (Exact or Partial)
    const isMatch = (key: string, type: 'exact' | 'partial' = 'exact') => {
        if (type === 'partial') return normalizedInput.includes(key);
        // Exact match (default): token must equal key
        return tokens.includes(key);
    };

    // Helper: Check if temperature is within range
    const isInRange = (range?: [number, number]) => {
        if (!range) return true; // No range limit
        return celsius >= range[0] && celsius <= range[1];
    };

    // 遍历知识库查找匹配词
    Object.keys(KNOWLEDGE_BASE).forEach(key => {
        const entry = KNOWLEDGE_BASE[key];

        // 1. Keyword Match
        if (isMatch(key, entry.matchType) && isInRange(entry.tempRange)) {
            if (entry.insights) {
                if (t) {
                    // 🚀 Localization: If translator provided, override text
                    const localizedInsights = entry.insights.map(insight => ({
                        ...insight,
                        title: t(`common:strategy.insights.${key}.title`) !== `common:strategy.insights.${key}.title`
                            ? t(`common:strategy.insights.${key}.title`)
                            : insight.title,
                        content: t(`common:strategy.insights.${key}.content`) !== `common:strategy.insights.${key}.content`
                            ? t(`common:strategy.insights.${key}.content`)
                            : insight.content
                    }));
                    detectedInsights = [...detectedInsights, ...localizedInsights];
                } else {
                    detectedInsights = [...detectedInsights, ...entry.insights];
                }
            }
            if (entry.faqs) detectedFaqs = [...detectedFaqs, ...entry.faqs];
        }
    });

    // Fallback: If 'water' is present and temp is in scalding range (55-90), inject 'burn' warnings automatically
    // This restores the "75C safety warning" feature but safely constraints it.
    if (tokens.includes('water') && celsius >= 55 && celsius <= 90) {
        const burnEntry = KNOWLEDGE_BASE['burn'];
        // Avoid duplication if 'burn' was already matched
        if (!tokens.includes('burn')) {
            if (burnEntry.insights) {
                if (t) {
                    const localizedInsights = burnEntry.insights.map(insight => ({
                        ...insight,
                        title: t(`common:strategy.insights.burn.title`) !== `common:strategy.insights.burn.title`
                            ? t(`common:strategy.insights.burn.title`)
                            : insight.title,
                        content: t(`common:strategy.insights.burn.content`) !== `common:strategy.insights.burn.content`
                            ? t(`common:strategy.insights.burn.content`)
                            : insight.content
                    }));
                    detectedInsights = [...detectedInsights, ...localizedInsights];
                } else {
                    detectedInsights = [...detectedInsights, ...burnEntry.insights];
                }
            }
            if (burnEntry.faqs) detectedFaqs = [...detectedFaqs, ...burnEntry.faqs];
        }
    }

    // 1. Health / Body Temperature Strategy
    // Tiggers: Specific keywords OR temperature range typical for human body (35-42°C)
    const isHealthContext =
        normalizedInput.includes('fever') ||
        normalizedInput.includes('baby') ||
        normalizedInput.includes('body') ||
        normalizedInput.includes('human') ||
        (celsius >= 35 && celsius <= 42.5);

    if (isHealthContext) {
        return {
            topic: 'health',
            modules: {
                showOvenGuide: false, // No ovens for fever!
                showHumanFeel: false,
                showHealthAlert: true, // Show fever warning
            },
            text: {
                intro: '',
                description: ''
            },
            insights: detectedInsights,
            faqs: detectedFaqs
        };
    }

    // 2. Cooking / Oven Strategy
    // Triggers: "oven", "baking", "fryer" OR high temperatures typical for cooking (>= 60°C to match 75°C case)
    // Adjusted threshold to include 75°C water/sous-vide users if they search for cooking
    const isCookingContext =
        normalizedInput.includes('oven') ||
        normalizedInput.includes('bake') ||
        normalizedInput.includes('baking') ||
        normalizedInput.includes('fryer') ||
        normalizedInput.includes('roast') ||
        celsius >= 60; // Lowered from 80 to catch 75°C users

    if (isCookingContext) {
        return {
            topic: 'cooking',
            modules: {
                showOvenGuide: true, // Show the oven chart
                showHumanFeel: false,
                showHealthAlert: false,
            },
            text: {
                intro: '',
                description: ''
            },
            insights: detectedInsights,
            faqs: detectedFaqs
        };
    }

    // 3. Weather / Environmental Strategy
    // Triggers: "weather", "outside" OR typical Earth weather range (-60°C to 55°C)
    // We check this AFTER Health, so 37°C is caught by Health first.
    const isWeatherContext =
        normalizedInput.includes('weather') ||
        celsius >= -60 && celsius <= 55;

    if (isWeatherContext) {
        return {
            topic: 'weather',
            modules: {
                showOvenGuide: false,
                showHumanFeel: true, // Show "feels like" or clothing tips
                showHealthAlert: false,
            },
            text: {
                intro: '',
                description: ''
            },
            insights: detectedInsights,
            faqs: detectedFaqs
        };
    }

    // 4. Default / Science Strategy
    return {
        topic: 'general',
        modules: {
            showOvenGuide: false,
            showHumanFeel: false,
            showHealthAlert: false,
        },
        text: {
            intro: '',
            description: ''
        },
        keywords: tokens,
        insights: detectedInsights,
        faqs: detectedFaqs
    };
}
