'use client';

import { useState, useEffect } from 'react';

const ABSOLUTE_ZERO = -273.15;
const MAX_TEMP = 1000000;
const HISTORY_MAX_ITEMS = 10;
const HISTORY_KEY = 'conversionHistory';

interface ConversionHistory {
  celsius: number;
  fahrenheit: number;
  timestamp: string;
}

export default function Converter() {
  const [celsius, setCelsius] = useState<string>('');
  const [fahrenheit, setFahrenheit] = useState<string>('--');
  const [validationMessage, setValidationMessage] = useState<{ text: string; type: 'error' | 'success' | '' }>({ text: '', type: '' });
  const [history, setHistory] = useState<ConversionHistory[]>([]);
  const [stepVisualizations, setStepVisualizations] = useState({
    step1: '',
    step2: '',
    step3: '',
  });
  const [copySuccess, setCopySuccess] = useState(false);

  useEffect(() => {
    loadHistory();
  }, []);

  const convertCtoF = (c: number): number => {
    return (c * 9 / 5) + 32;
  };

  const formatTemperature = (temp: number): string => {
    const rounded = Math.round(temp * 10) / 10;
    if (temp < 0 && temp > -1) {
      return rounded.toFixed(1) + '°F';
    }
    if (rounded % 1 === 0) {
      return rounded.toString() + '°F';
    }
    return rounded.toFixed(1) + '°F';
  };

  const handleCelsiusChange = (value: string) => {
    setCelsius(value);
    setValidationMessage({ text: '', type: '' });

    if (value === '') {
      setFahrenheit('--');
      setStepVisualizations({ step1: '', step2: '', step3: '' });
      return;
    }

    const celsiusValue = parseFloat(value);

    if (isNaN(celsiusValue)) {
      setValidationMessage({ text: 'Please enter a valid number', type: 'error' });
      setFahrenheit('--');
      setStepVisualizations({ step1: '', step2: '', step3: '' });
      return;
    }

    if (celsiusValue < ABSOLUTE_ZERO) {
      setValidationMessage({
        text: `Temperature cannot be below absolute zero (${ABSOLUTE_ZERO}°C)`,
        type: 'error',
      });
      setFahrenheit('--');
      setStepVisualizations({ step1: '', step2: '', step3: '' });
      return;
    }

    if (celsiusValue > MAX_TEMP) {
      setValidationMessage({
        text: `Temperature cannot exceed ${MAX_TEMP.toLocaleString()}°C`,
        type: 'error',
      });
      setFahrenheit('--');
      setStepVisualizations({ step1: '', step2: '', step3: '' });
      return;
    }

    const fahrenheitValue = convertCtoF(celsiusValue);
    setFahrenheit(formatTemperature(fahrenheitValue));

    // Update step visualizations
    const step1 = celsiusValue * 9 / 5;
    const step2 = step1 + 32;
    setStepVisualizations({
      step1: `${celsiusValue} × 9/5 = ${step1.toFixed(2)}`,
      step2: `${step1.toFixed(2)} + 32 = ${step2.toFixed(2)}`,
      step3: `Result: ${formatTemperature(fahrenheitValue)}`,
    });

    // Add to history
    addToHistory(celsiusValue, fahrenheitValue);

    // Show success messages for special temperatures
    if (celsiusValue === 0) {
      setValidationMessage({ text: 'Water freezes at 0°C (32°F)', type: 'success' });
    } else if (celsiusValue === 100) {
      setValidationMessage({ text: 'Water boils at 100°C (212°F)', type: 'success' });
    } else if (celsiusValue === -40) {
      setValidationMessage({
        text: '-40°C equals -40°F (the scales meet here!)',
        type: 'success',
      });
    } else if (celsiusValue === 37) {
      setValidationMessage({
        text: 'Normal human body temperature is approximately 37°C (98.6°F)',
        type: 'success',
      });
    }
  };

  const loadHistory = () => {
    if (typeof window === 'undefined') return;
    const historyJSON = localStorage.getItem(HISTORY_KEY);
    const loadedHistory = historyJSON ? JSON.parse(historyJSON) : [];
    setHistory(loadedHistory);
  };

  const addToHistory = (c: number, f: number) => {
    if (typeof window === 'undefined') return;
    const newHistory: ConversionHistory[] = [
      { celsius: c, fahrenheit: f, timestamp: new Date().toISOString() },
      ...history,
    ].slice(0, HISTORY_MAX_ITEMS);
    setHistory(newHistory);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(newHistory));
  };

  const clearHistory = () => {
    if (history.length === 0) return;
    if (confirm('Are you sure you want to clear your conversion history?')) {
      setHistory([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem(HISTORY_KEY);
      }
    }
  };

  const handleCopy = async () => {
    if (fahrenheit === '--') return;

    try {
      await navigator.clipboard.writeText(fahrenheit);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    } catch (err) {
      console.error('Failed to copy: ', err);
      alert('Failed to copy to clipboard. Please try again.');
    }
  };

  const formatTimeSince = (date: Date): string => {
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return 'Just now';
    }

    const diffInMinutes = Math.floor(diffInSeconds / 60);
    if (diffInMinutes < 60) {
      return `${diffInMinutes} min ago`;
    }

    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) {
      return `${diffInHours} hr ago`;
    }

    const diffInDays = Math.floor(diffInHours / 24);
    if (diffInDays < 7) {
      return `${diffInDays} day${diffInDays !== 1 ? 's' : ''} ago`;
    }

    return date.toLocaleDateString();
  };

  return (
    <section className="converter-tool" role="region" aria-labelledby="converter-title">
      <h2 id="converter-title" className="converter-title">
        Celsius to Fahrenheit Converter
      </h2>
      <p className="converter-description">
        Instantly convert <span className="nowrap">°C to °F</span> for free. Ideal for cooking,
        travel, and science. Get accurate results in seconds!
      </p>

      <div className="converter-form">
        <div className="input-group">
          <div className="input-header">
            <label htmlFor="celsius">Celsius (°C)</label>
            <button
              className="info-btn"
              aria-label="About Celsius scale"
              data-tooltip="Water freezes at 0°C and boils at 100°C"
              title="Water freezes at 0°C and boils at 100°C"
            >
              ℹ️
            </button>
          </div>
          <input
            type="number"
            id="celsius"
            inputMode="decimal"
            placeholder="e.g. 37.5"
            step="0.1"
            min={ABSOLUTE_ZERO}
            value={celsius}
            onChange={(e) => handleCelsiusChange(e.target.value)}
            aria-describedby="celsius-help validation-message"
            autoComplete="off"
            autoCorrect="off"
            autoCapitalize="off"
            spellCheck={false}
          />
          <div id="celsius-help" className="sr-only">
            Enter temperature between -273.15°C and 1,000,000°C
          </div>
        </div>

        <div className="result-container" role="region" aria-live="polite" aria-atomic="true">
          <div className="result-header">
            <label id="fahrenheit-label">Fahrenheit (°F)</label>
            <button
              className="info-btn"
              aria-label="About Fahrenheit scale"
              data-tooltip="Water freezes at 32°F and boils at 212°F"
              title="Water freezes at 32°F and boils at 212°F"
            >
              ℹ️
            </button>
          </div>
          <output className="result-value" id="fahrenheit-result">
            {fahrenheit}
          </output>
          <button
            className="btn"
            id="copy-btn"
            onClick={handleCopy}
            aria-label="Copy temperature result to clipboard"
            style={{
              backgroundColor: copySuccess ? '#27ae60' : '',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
            >
              <path
                d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z"
                fill="currentColor"
              />
            </svg>
            <span className="btn-text">{copySuccess ? 'Copied!' : 'Copy'}</span>
            <span className="sr-only">temperature result</span>
          </button>
        </div>
      </div>

      {validationMessage.text && (
        <div
          id="validation-message"
          className={`validation-message ${validationMessage.type}`}
        >
          {validationMessage.text}
        </div>
      )}

      <section className="history-container" aria-labelledby="history-heading">
        <div className="history-header">
          <h3 id="history-heading">Recent Conversions</h3>
          <button
            className="clear-history"
            id="clear-history"
            onClick={clearHistory}
            aria-label="Clear all conversion history"
          >
            <span aria-hidden="true">🗑️</span>
            <span>Clear History</span>
          </button>
        </div>
        <ul id="history-list" className="history-list">
          {history.length === 0 ? (
            <li className="history-empty">No conversions yet</li>
          ) : (
            history.map((conversion, index) => (
              <li key={index}>
                <span>
                  {conversion.celsius}°C = {formatTemperature(conversion.fahrenheit)}
                </span>
                <span className="history-time">
                  {formatTimeSince(new Date(conversion.timestamp))}
                </span>
              </li>
            ))
          )}
        </ul>
        {history.length === 0 && (
          <p id="empty-history-message" className="sr-only" aria-live="polite">
            No conversion history available
          </p>
        )}
      </section>

      <ConversionSteps
        step1={stepVisualizations.step1}
        step2={stepVisualizations.step2}
        step3={stepVisualizations.step3}
      />
    </section>
  );
}

function ConversionSteps({
  step1,
  step2,
  step3,
}: {
  step1: string;
  step2: string;
  step3: string;
}) {
  return (
    <>
      <section className="formula-section" role="region" aria-labelledby="formula-title">
        <h2 id="formula-title">Celsius to Fahrenheit Formula</h2>
        <div className="formula">
          <h3>Equation to Convert Celsius to Fahrenheit</h3>
          <div className="formula-box">°F = (°C × 9/5) + 32</div>
          <p className="example">Example: 20°C = (20 × 9/5) + 32 = 68°F</p>
        </div>
      </section>

      <div className="conversion-steps" itemScope itemType="https://schema.org/HowTo">
        <h3 itemProp="name">How to Convert Celsius to Fahrenheit</h3>
        <p className="converter-description">Click each step to see detailed calculation</p>
        <div className="step" itemScope itemType="https://schema.org/HowToStep">
          <meta itemProp="position" content="1" />
          <div className="step-number">1</div>
          <div className="step-content">
            <h4 className="step-title" itemProp="name">
              Multiply by 9/5
            </h4>
            <div className="step-description" itemProp="text">
              Multiply the Celsius temperature by 9/5 (or 1.8)
            </div>
            <div
              className="step-visualization"
              itemScope
              itemType="https://schema.org/HowToDirection"
            >
              <span itemProp="text" id="step1-viz" aria-live="polite">
                {step1}
              </span>
            </div>
          </div>
        </div>
        <div className="step" itemScope itemType="https://schema.org/HowToStep">
          <meta itemProp="position" content="2" />
          <div className="step-number">2</div>
          <div className="step-content">
            <h4 className="step-title" itemProp="name">
              Add 32
            </h4>
            <div className="step-description" itemProp="text">
              Add 32 to the result from step 1
            </div>
            <div
              className="step-visualization"
              itemScope
              itemType="https://schema.org/HowToDirection"
            >
              <span itemProp="text" id="step2-viz" aria-live="polite">
                {step2}
              </span>
            </div>
          </div>
        </div>
        <div className="step" itemScope itemType="https://schema.org/HowToStep">
          <meta itemProp="position" content="3" />
          <div className="step-number">3</div>
          <div className="step-content">
            <h4 className="step-title" itemProp="name">
              Final Result
            </h4>
            <div className="step-description" itemProp="text">
              Get the final Fahrenheit temperature result
            </div>
            <div
              className="step-visualization"
              itemScope
              itemType="https://schema.org/HowToDirection"
            >
              <span itemProp="text" id="step3-viz" aria-live="polite">
                {step3}
              </span>
            </div>
          </div>
        </div>
        <div className="common-errors">
          <h4>Celsius to Fahrenheit Conversion Common Mistakes</h4>
          <ul>
            <li>
              <strong>Forgetting to add 32</strong> -{' '}
              <span>Only multiplying by 9/5 will give incorrect results</span>
            </li>
            <li>
              <strong>Incorrect order of operations</strong> -{' '}
              <span>Adding 32 first and then multiplying by 9/5 is incorrect</span>
            </li>
            <li>
              <strong>Using the wrong fraction</strong> -{' '}
              <span>Using 2/3 instead of 9/5 is a common error</span>
            </li>
            <li>
              <strong>Rounding too early</strong> -{' '}
              <span>Rounding intermediate results can lead to inaccuracies</span>
            </li>
          </ul>
        </div>
      </div>
    </>
  );
}

