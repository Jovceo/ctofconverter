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
const KNOWLEDGE_BASE: Record<string, { insights: ContentStrategy['insights'], faqs?: ContentStrategy['faqs'] }> = {
    // 关键词: 包含 'tea'
    'tea': {
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
    // 关键词: 包含 'chicken' 或 'meat'
    'chicken': {
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
    // 关键词: 包含 'water' 或 'burn' 或 'scald'
    'water': {
        insights: [{
            type: 'warning',
            title: 'Safety Warning: Scalding Risk',
            content: 'Water at 75°C (167°F) causes severe burns in < 1 second. It is much hotter than standard domestic hot water (usually 50-60°C).'
        }],
        faqs: [{
            question: "Can I touch 75°C water?",
            answer: "No! 75°C water is scalding hot and dangerous. Always mix with cold water before contact."
        }]
    }
};

export function generateContentStrategy(celsius: number, keyword: string = ''): ContentStrategy {
    // Normalize keyword
    const k = keyword.toLowerCase();

    // 0. 🔍 挖掘引擎：尝试匹配知识库
    // 简单的关键词匹配逻辑，生产环境可用 AI 替代
    let detectedInsights: NonNullable<ContentStrategy['insights']> = [];
    let detectedFaqs: NonNullable<ContentStrategy['faqs']> = [];

    // 遍历知识库查找匹配词
    Object.keys(KNOWLEDGE_BASE).forEach(key => {
        if (k.includes(key)) {
            const data = KNOWLEDGE_BASE[key];
            if (data.insights) detectedInsights = [...detectedInsights, ...data.insights];
            if (data.faqs) detectedFaqs = [...detectedFaqs, ...data.faqs];
        }
    });

    // 1. Health / Body Temperature Strategy
    // Tiggers: Specific keywords OR temperature range typical for human body (35-42°C)
    const isHealthContext =
        k.includes('fever') ||
        k.includes('baby') ||
        k.includes('body') ||
        k.includes('human') ||
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
                intro: `Converting ${celsius}°C to Fahrenheit is essential for monitoring body temperature and checking for fever.`,
                description: `Check if ${celsius}°C indicates a fever. Accurate conversion for adults, children, and babies.`
            },
            insights: detectedInsights,
            faqs: detectedFaqs
        };
    }

    // 2. Cooking / Oven Strategy
    // Triggers: "oven", "baking", "fryer" OR high temperatures typical for cooking (>= 60°C to match 75°C case)
    // Adjusted threshold to include 75°C water/sous-vide users if they search for cooking
    const isCookingContext =
        k.includes('oven') ||
        k.includes('bake') ||
        k.includes('baking') ||
        k.includes('fryer') ||
        k.includes('roast') ||
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
                intro: `${celsius}°C is a common temperature in cooking and food safety. Convert it to Fahrenheit for baking or checking meat doneness.`,
                description: `Cooking calculator: Convert ${celsius}°C to °F for baking, roasting, and food safety checks.`,
            },
            insights: detectedInsights,
            faqs: detectedFaqs
        };
    }

    // 3. Weather / Environmental Strategy
    // Triggers: "weather", "outside" OR typical Earth weather range (-60°C to 55°C)
    // We check this AFTER Health, so 37°C is caught by Health first.
    const isWeatherContext =
        k.includes('weather') ||
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
                intro: `Understanding ${celsius}°C in Fahrenheit helps you dress appropriately for the weather and plan outdoor activities.`,
                description: `Weather conversion: See what ${celsius}°C feels like in Fahrenheit.`
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
            intro: `Free online temperature conversion tool that instantly converts ${celsius} degrees Celsius (${celsius}°C) to degrees Fahrenheit (°F).`,
            description: `Instantly convert ${celsius}°C to °F for free. Ideal for science and general calculations.`
        },
        insights: detectedInsights,
        faqs: detectedFaqs
    };
}
