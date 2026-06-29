import React, { useState, useMemo } from 'react';

type InputType = 'conventional-c' | 'conventional-f' | 'fan-c' | 'gas-mark' | 'air-fryer-c';

interface ConversionResult {
  conventionalC: string;
  conventionalF: string;
  fanC: string;
  gasMark: string;
  airFryerC: string;
}

const GAS_MARK_TO_C: Record<number, number> = {
  0.5: 120, 1: 140, 2: 150, 3: 160, 4: 180, 5: 190,
  6: 200, 7: 220, 8: 230, 9: 240, 10: 260,
};

const C_TO_GAS_MARK: Record<number, number | string> = {
  120: 0.5, 140: 1, 150: 2, 160: 3, 180: 4,
  190: 5, 200: 6, 220: 7, 230: 8, 240: 9, 260: 10,
};

const INPUT_TYPES: { value: InputType; label: string; placeholder: string }[] = [
  { value: 'conventional-c', label: 'Conventional Oven (°C)', placeholder: 'e.g. 180' },
  { value: 'conventional-f', label: 'Conventional Oven (°F)', placeholder: 'e.g. 350' },
  { value: 'fan-c', label: 'Fan / Convection Oven (°C)', placeholder: 'e.g. 160' },
  { value: 'gas-mark', label: 'Gas Mark', placeholder: 'e.g. 4' },
  { value: 'air-fryer-c', label: 'Air Fryer (°C)', placeholder: 'e.g. 160' },
];

function findClosestGasMark(celsius: number): string {
  const marks = Object.keys(C_TO_GAS_MARK).map(Number);
  const closest = marks.reduce((prev, curr) =>
    Math.abs(curr - celsius) < Math.abs(prev - celsius) ? curr : prev
  );
  const val = C_TO_GAS_MARK[closest];
  return val === 0.5 ? '½' : String(val);
}

export default function OvenTemperatureConverter() {
  const [value, setValue] = useState<string>('');
  const [inputType, setInputType] = useState<InputType>('conventional-c');

  const result: ConversionResult | null = useMemo(() => {
    const num = parseFloat(value);
    if (isNaN(num) || value === '') return null;

    let conventionalC: number;

    switch (inputType) {
      case 'conventional-c':
        conventionalC = num;
        break;
      case 'conventional-f':
        conventionalC = (num - 32) * 5 / 9;
        break;
      case 'fan-c':
        conventionalC = num + 20;
        break;
      case 'gas-mark': {
        const temp = GAS_MARK_TO_C[num];
        if (temp === undefined) return null;
        conventionalC = temp;
        break;
      }
      case 'air-fryer-c':
        conventionalC = num + 20;
        break;
      default:
        return null;
    }

    if (conventionalC < 50 || conventionalC > 300) return null;

    const conventionalF = conventionalC * 9 / 5 + 32;
    const fanC = conventionalC - 20;

    return {
      conventionalC: `${Math.round(conventionalC)}°C`,
      conventionalF: `${Math.round(conventionalF)}°F`,
      fanC: `${Math.round(fanC)}°C`,
      gasMark: findClosestGasMark(Math.round(conventionalC)),
      airFryerC: `${Math.round(conventionalC - 20)}°C`,
    };
  }, [value, inputType]);

  return (
    <div className="oven-converter">
      <div className="oven-converter-inputs">
        <div className="oven-converter-field">
          <label htmlFor="oven-temp-value" className="oven-converter-label">Temperature</label>
          <input
            id="oven-temp-value"
            type="number"
            className="oven-converter-input"
            placeholder={INPUT_TYPES.find(t => t.value === inputType)?.placeholder}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            aria-label="Enter temperature value"
          />
        </div>
        <div className="oven-converter-field">
          <label htmlFor="oven-input-type" className="oven-converter-label">From</label>
          <select
            id="oven-input-type"
            className="oven-converter-select"
            value={inputType}
            onChange={(e) => { setInputType(e.target.value as InputType); setValue(''); }}
            aria-label="Select input type"
          >
            {INPUT_TYPES.map(t => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </div>
      </div>

      {!result && value === '' && (
        <p className="oven-converter-hint">Enter a number above — all oven equivalents appear instantly (e.g., 180°C = 356°F, Gas Mark 4, Fan 160°C).</p>
      )}

      {result && (
        <div className="oven-converter-results">
          <div className="oven-result-card">
            <span className="oven-result-label">Conventional °C</span>
            <span className="oven-result-value">{result.conventionalC}</span>
          </div>
          <div className="oven-result-card">
            <span className="oven-result-label">Conventional °F</span>
            <span className="oven-result-value">{result.conventionalF}</span>
          </div>
          <div className="oven-result-card">
            <span className="oven-result-label">Fan / Convection °C</span>
            <span className="oven-result-value">{result.fanC}</span>
          </div>
          <div className="oven-result-card">
            <span className="oven-result-label">Gas Mark</span>
            <span className="oven-result-value">{result.gasMark}</span>
          </div>
          <div className="oven-result-card">
            <span className="oven-result-label">Air Fryer °C</span>
            <span className="oven-result-value">{result.airFryerC}</span>
          </div>
        </div>
      )}

      {!result && value !== '' && (
        <p className="oven-converter-error">
          {inputType === 'gas-mark'
            ? 'Gas Mark must be ½, 1, 2, 3, 4, 5, 6, 7, 8, 9, or 10.'
            : 'Temperature must be between 50°C (122°F) and 300°C (572°F), standard oven range.'}
        </p>
      )}
    </div>
  );
}
