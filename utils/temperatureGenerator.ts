// Simple conversion helpers
const cToF = (c: number) => Math.round((c * 9) / 5 + 32);
const fToC = (f: number) => Math.round(((f - 32) * 5) / 9);
// Simplified Gas Mark map for game purposes
const gasMarksConfig: Record<string, number> = {
    'Gas Mark ¼': 110,
    'Gas Mark ½': 120,
    'Gas Mark 1': 140,
    'Gas Mark 2': 150,
    'Gas Mark 3': 160,
    'Gas Mark 4': 180,
    'Gas Mark 5': 190,
    'Gas Mark 6': 200,
    'Gas Mark 7': 220,
    'Gas Mark 8': 230,
    'Gas Mark 9': 240,
};

type Unit = 'C' | 'F' | 'Gas';

export interface GameRound {
    baseValue: number;
    baseUnit: Unit;
    baseDisplay: string;

    challengeValue: number; // In baseUnit for easier comparison logic, but maybe we store raw
    challengeUnit: Unit;
    challengeDisplay: string;

    correctAnswer: 'HOTTER' | 'COLDER' | 'EQUAL';
}

function getRandomInt(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

function formatTemp(val: number, unit: Unit): string {
    if (unit === 'Gas') {
        // Find closest gas mark reverse lookup or just return valid string if generated specifically
        // For simplicity in generation, we will pick from keys.
        return '';
    }
    return `${val}°${unit}`;
}

export function generateRound(): GameRound {
    // 1. Pick a base temperature in C (common oven range: 100C to 250C)
    const baseC = getRandomInt(100, 250);

    // 2. Decide units for Base and Challenge
    const units: Unit[] = ['C', 'F'];
    // Add Gas only if baseC is within gas mark range (approx 110-240)
    if (baseC >= 110 && baseC <= 240) {
        units.push('Gas');
    }

    const baseUnit = units[getRandomInt(0, units.length - 1)];
    let challengeUnit = units[getRandomInt(0, units.length - 1)];

    // Ensure units are different for interest, unless we want to test same unit (too easy?)
    // Let's force different units if possible.
    while (units.length > 1 && challengeUnit === baseUnit) {
        challengeUnit = units[getRandomInt(0, units.length - 1)];
    }

    // 3. Prepare Base Display
    let baseDisplay = '';
    if (baseUnit === 'C') baseDisplay = `${baseC}°C`;
    else if (baseUnit === 'F') baseDisplay = `${cToF(baseC)}°F`;
    else {
        // Find closest Gas Mark
        let closestGas = 'Gas Mark 4';
        let minDiff = 1000;
        for (const [mark, tempC] of Object.entries(gasMarksConfig)) {
            if (Math.abs(tempC - baseC) < minDiff) {
                minDiff = Math.abs(tempC - baseC);
                closestGas = mark;
            }
        }
        baseDisplay = closestGas;
    }

    // 4. Generate Challenge Temp
    // We want it to be somewhat close to confuse the user, but clearly distinct.
    // Let's say +/- 10C to 50C difference.
    const diff = getRandomInt(15, 60) * (Math.random() < 0.5 ? -1 : 1);
    let challengeC = baseC + diff;

    // Clamping
    if (challengeC < 80) challengeC = 80;
    if (challengeC > 280) challengeC = 280;

    // 5. Prepare Challenge Display
    let challengeDisplay = '';
    if (challengeUnit === 'C') challengeDisplay = `${challengeC}°C`;
    else if (challengeUnit === 'F') challengeDisplay = `${cToF(challengeC)}°F`;
    else {
        // Pick a valid Gas Mark Close to challengeC
        let closestGas = 'Gas Mark 4';
        let minDiff = 1000;
        for (const [mark, tempC] of Object.entries(gasMarksConfig)) {
            // If we force gas, we might adjust challengeC to exactly match a gas mark to be fair
            if (Math.abs(tempC - challengeC) < minDiff) {
                minDiff = Math.abs(tempC - challengeC);
                closestGas = mark;
            }
        }
        // Snap challengeC to the gas mark's exact C for fair comparison
        challengeDisplay = closestGas;
        challengeC = gasMarksConfig[closestGas];
    }

    // Avoid exact ties for "Hotter/Colder" game unless we add "Equal" button (which adds complexity)
    if (challengeC === baseC) {
        challengeC += 10;
        if (challengeUnit === 'C') challengeDisplay = `${challengeC}°C`;
        else if (challengeUnit === 'F') challengeDisplay = `${cToF(challengeC)}°F`;
    }

    // 6. Determine Answer
    const correctAnswer = challengeC > baseC ? 'HOTTER' : 'COLDER';

    return {
        baseValue: baseC, // normalizing comparison to Celsius
        baseUnit,
        baseDisplay,
        challengeValue: challengeC, // normalizing comparison to Celsius
        challengeUnit,
        challengeDisplay,
        correctAnswer
    };
}
