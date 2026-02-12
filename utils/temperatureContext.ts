import { SCENE_CONFIGS, getTemperatureScene } from './temperaturePageHelpers';

export interface TemperatureContext {
    key: string;  // e.g., 'fever_low', 'water_freeze'
    label: string; // e.g., 'Low Grade Fever', 'Freezing Point'
    description: string; // Dynamic description based on exact value
    color: string; // Hints for UI (e.g., '#ef4444' for fever)
}

/**
 * Validates if a temperature is "standard" (integer or .5) vs "specific" (e.g., 37.1)
 */
export const isStandardTemperature = (celsius: number): boolean => {
    return Number.isInteger(celsius) || celsius % 0.5 === 0;
};

/**
 * Universal Context Generator
 * Uses SCENE_CONFIGS to generate unique context for ANY temperature value.
 */
export const getGranularContext = (celsius: number): TemperatureContext => {
    // 1. Get the scene (Context: Body, Weather, Oven, etc.)
    const sceneConfig = getTemperatureScene(celsius);
    const sceneName = sceneConfig.name;

    // 2. Exact Anchor Match? (e.g., exactly 37.0 or 100.0)
    // We check if value is very close to an anchor
    const exactAnchor = sceneConfig.anchors.find(a => Math.abs(a.val - celsius) < 0.05);

    if (exactAnchor) {
        // We have a direct hit on a known concept
        return {
            key: `${sceneName.toLowerCase()}_${exactAnchor.labelKey || 'anchor'}`,
            label: formatLabel(exactAnchor.labelKey || 'Benchmark'),
            description: getDescriptionForScene(sceneName, celsius, true, exactAnchor.labelKey),
            color: getColorForScene(sceneName, celsius)
        };
    }

    // 3. Relative Anchor Logic (The "Gap Filler")
    // Find the two checking points: one below, one above
    // Sort anchors by value
    const sortedAnchors = [...sceneConfig.anchors].sort((a, b) => a.val - b.val);

    let lowerAnchor = sortedAnchors[0];
    let upperAnchor = sortedAnchors[sortedAnchors.length - 1];

    for (let i = 0; i < sortedAnchors.length - 1; i++) {
        if (celsius > sortedAnchors[i].val && celsius < sortedAnchors[i + 1].val) {
            lowerAnchor = sortedAnchors[i];
            upperAnchor = sortedAnchors[i + 1];
            break;
        }
    }

    // 4. Generate "Between" Description
    const isHigher = celsius > upperAnchor.val; // Above max anchor
    const isLower = celsius < lowerAnchor.val;  // Below min anchor

    let description = '';
    let label = 'Analysis';

    if (isHigher) {
        description = `${celsius}°C is significantly hotter than ${formatLabel(upperAnchor.labelKey)}.`;
        label = `Extreme ${formatLabel(sceneName)}`;
    } else if (isLower) {
        description = `${celsius}°C is colder than ${formatLabel(lowerAnchor.labelKey)}.`;
        label = `Extreme ${formatLabel(sceneName)}`;
    } else {
        // The Gold Standard: "Hotter than X but cooler than Y"
        description = `${celsius}°C is hotter than ${formatLabel(lowerAnchor.labelKey)} (${lowerAnchor.val}°C) but cooler than ${formatLabel(upperAnchor.labelKey)} (${upperAnchor.val}°C).`;
        label = `${formatLabel(sceneName)} Context`;
    }

    // 🚀 High Value Content Upgrade: Micro-Paragraph Generation
    // Sentence 2: Physical State / Feeling (Derived from Scene Intent)
    let sensory = '';
    if (sceneName === 'BODY') sensory = 'This range reflects internal human physiology.';
    else if (sceneName === 'WEATHER') sensory = 'This temperature affects how humans dress and feel outdoors.';
    else if (sceneName === 'WATER') sensory = 'At this level, water is liquid but can range from tepid to scalding.';
    else if (sceneName === 'OVEN') sensory = 'This heat level is used to alter the chemical structure of food.';
    else if (sceneName === 'EXTREME_COLD') sensory = 'Biological functions cease and materials become brittle.';
    else if (sceneName === 'EXTREME_HOT') sensory = 'Matter transitions states or glows with thermal radiation.';

    // Sentence 3: Actionable Advice (Safety/Usage)
    // We used to have generic fillers, now we use specific Strategy Data
    const safety = sceneConfig.safety_tips || '';
    const usage = sceneConfig.practical_use || '';

    // Combine for a rich, unique paragraph
    // Description (Relative) + Sensory + Value (Safety/Usage)
    description = `${description} ${sensory} ${safety} ${usage}`;

    return {
        key: `${sceneName.toLowerCase()}_relative`,
        label: label,
        description: description,
        color: getColorForScene(sceneName, celsius)
    };
};

// --- Helpers ---

const formatLabel = (key?: string) => {
    if (!key) return 'Standard';
    // Convert camelCase to Title Case (e.g., normalBodyTemp -> Normal Body Temp)
    return key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase()).trim();
};

const getColorForScene = (scene: string, celsius: number): string => {
    switch (scene) {
        case 'BODY':
            if (celsius < 36) return '#3b82f6'; // Cold
            if (celsius > 38) return '#ef4444'; // Fever
            return '#10b981'; // Normal
        case 'WEATHER':
            if (celsius < 0) return '#3b82f6'; // Ice
            if (celsius > 30) return '#f97316'; // Hot
            return '#10b981'; // Comfortable
        case 'WATER':
            if (celsius >= 100) return '#ef4444'; // Boiling
            return '#06b6d4'; // Liquid
        case 'OVEN':
            return '#f59e0b'; // Baking Orange
        default:
            return '#64748b'; // Gray
    }
};

const getDescriptionForScene = (scene: string, celsius: number, isExact: boolean, labelKey?: string): string => {
    // This could also be key-based for i18n later, but hardcoded English for now is fine for the logic
    if (scene === 'BODY') {
        if (labelKey === 'normalBodyTemp') return `${celsius}°C is the textbook standard for human body temperature.`;
        if (labelKey === 'feverThreshold') return `${celsius}°C marks the threshold for a fever.`;
        return `${celsius}°C is a specific body temperature benchmark.`;
    }
    if (scene === 'WATER') {
        if (celsius === 100) return '100°C is the boiling point of water at sea level.';
        if (celsius === 0) return '0°C is the freezing point of water.';
    }
    return `${celsius}°C is a significant ${formatLabel(scene).toLowerCase()} benchmark.`;
};
