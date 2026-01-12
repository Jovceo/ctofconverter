import React, { useState, useEffect } from 'react';
import { getLocalizedLink } from '../utils/i18n';

interface CalculatorWidgetProps {
    t: any;
    locale: string;
}

export default function CalculatorWidget({ t, locale }: CalculatorWidgetProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [resultValue, setResultValue] = useState<string>('--');
    const [mode, setMode] = useState<'c-to-f' | 'f-to-c'>('c-to-f');
    const [feverStatus, setFeverStatus] = useState<{ text: string; className: string }>({ text: '', className: '' });

    const handleCopy = () => {
        if (resultValue !== '--') {
            const valToCopy = resultValue.split(' ')[0];
            navigator.clipboard.writeText(valToCopy).then(() => {
                alert(t.calculator.actions.copied);
            });
        }
    };

    const handleClear = () => {
        setInputValue('');
        setResultValue('--');
        setFeverStatus({ text: '', className: '' });
    };

    useEffect(() => {
        const val = parseFloat(inputValue);
        if (isNaN(val)) {
            setResultValue('--');
            setFeverStatus({ text: '', className: '' });
            return;
        }

        if (mode === 'c-to-f') {
            const f = (val * 1.8) + 32;
            const formatted = f.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
            setResultValue(`${formatted} °F`);

            // Fever logic for C
            if (val >= 36.5 && val <= 37.2) {
                setFeverStatus({ text: t.calculator.feverStatus.normal, className: 'fever-normal' });
            } else if (val >= 37.3 && val <= 38.0) {
                setFeverStatus({ text: t.calculator.feverStatus.low, className: 'fever-low' });
            } else if (val >= 38.1 && val <= 39.0) {
                setFeverStatus({ text: t.calculator.feverStatus.moderate, className: 'fever-moderate' });
            } else if (val > 39.0) {
                setFeverStatus({ text: t.calculator.feverStatus.high, className: 'fever-high' });
            } else {
                setFeverStatus({ text: '', className: '' });
            }
        } else {
            const c = (val - 32) / 1.8;
            const formatted = c.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
            setResultValue(`${formatted} °C`);

            // Fever logic for F
            if (val >= 97.7 && val <= 99.0) {
                setFeverStatus({ text: t.calculator.feverStatus.normal, className: 'fever-normal' });
            } else if (val >= 99.1 && val <= 100.4) {
                setFeverStatus({ text: t.calculator.feverStatus.low, className: 'fever-low' });
            } else if (val >= 100.5 && val <= 102.2) {
                setFeverStatus({ text: t.calculator.feverStatus.moderate, className: 'fever-moderate' });
            } else if (val > 102.2) {
                setFeverStatus({ text: t.calculator.feverStatus.high, className: 'fever-high' });
            } else {
                setFeverStatus({ text: '', className: '' });
            }
        }
    }, [inputValue, mode, t]);

    return (
        <div className="glass-card calculator-widget">
            <div className="mode-tabs">
                <button
                    className={`tab-btn ${mode === 'c-to-f' ? 'active' : ''}`}
                    onClick={() => setMode('c-to-f')}
                >
                    {t.calculator.modeTabs.cToF}
                </button>
                <button
                    className={`tab-btn ${mode === 'f-to-c' ? 'active' : ''}`}
                    onClick={() => setMode('f-to-c')}
                >
                    {t.calculator.modeTabs.fToC}
                </button>
            </div>

            <div className="input-grid">
                <div className="input-field">
                    <label htmlFor="temp-input">{mode === 'c-to-f' ? t.calculator.labels.celsius : t.calculator.labels.fahrenheit}</label>
                    <input
                        type="number"
                        id="temp-input"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        placeholder={t.calculator.labels.enterValue}
                        autoFocus
                    />
                </div>
                <div className="output-field">
                    <label>{mode === 'c-to-f' ? t.calculator.labels.fahrenheit : t.calculator.labels.celsius}</label>
                    <div className="display-result">{resultValue}</div>
                </div>
            </div>

            {feverStatus.text && (
                <div className={`fever-banner ${feverStatus.className}`}>
                    {feverStatus.text}
                </div>
            )}

            <div className="quick-action-strip">
                <button onClick={handleCopy} disabled={resultValue === '--'}>{t.calculator.actions.copy}</button>
                <button onClick={handleClear}>{t.calculator.actions.clear}</button>
            </div>

            <div className="quick-presets">
                {[0, 20, 37, 100].map((temp) => (
                    <button key={temp} onClick={() => { setMode('c-to-f'); setInputValue(temp.toString()); }}>
                        {temp}°C
                    </button>
                ))}
            </div>

            <style jsx>{`
                .glass-card { background: #fff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #edf2f7; padding: 2.5rem; margin-bottom: 3rem; }
                .mode-tabs { display: flex; background: #f7fafc; border-radius: 12px; padding: 0.5rem; margin-bottom: 2rem; }
                .tab-btn { flex: 1; padding: 0.8rem; border: none; background: transparent; border-radius: 8px; font-weight: 600; color: #718096; cursor: pointer; transition: all 0.2s; }
                .tab-btn.active { background: #fff; color: #3182ce; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                
                .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
                label { display: block; font-size: 0.9rem; color: #718096; margin-bottom: 0.75rem; font-weight: 600; }
                input { width: 100%; padding: 1rem; font-size: 1.5rem; border: 2px solid #edf2f7; border-radius: 12px; color: #2d3748; transition: border-color 0.2s; }
                input:focus { outline: none; border-color: #3182ce; }
                
                .display-result { width: 100%; padding: 1rem; font-size: 1.5rem; background: #ebf8ff; border-radius: 12px; color: #2b6cb0; font-weight: 700; border: 2px solid transparent; min-height: 4rem; display: flex; align-items: center; }
                
                .fever-banner { padding: 1rem; border-radius: 12px; text-align: center; font-weight: 700; margin-bottom: 1.5rem; animation: slideDown 0.3s ease; }
                .fever-normal { background: #c6f6d5; color: #22543d; }
                .fever-low { background: #fefcbf; color: #744210; }
                .fever-moderate { background: #feebc8; color: #7b341e; }
                .fever-high { background: #fed7d7; color: #822727; }
                
                .quick-action-strip { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                .quick-action-strip button { flex: 1; padding: 0.75rem; border: 1px solid #edf2f7; border-radius: 8px; background: #fff; color: #4a5568; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .quick-action-strip button:hover:not(:disabled) { background: #f7fafc; }
                .quick-action-strip button:disabled { opacity: 0.5; cursor: not-allowed; }
                
                .quick-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
                .quick-presets button { padding: 0.5rem; background: #f7fafc; border: none; border-radius: 6px; color: #3182ce; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                .quick-presets button:hover { background: #edf2f7; }

                @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }

                @media (max-width: 768px) {
                    .input-grid { grid-template-columns: 1fr; gap: 1rem; }
                    .glass-card { padding: 1.5rem; }
                }
            `}</style>
        </div>
    );
}
