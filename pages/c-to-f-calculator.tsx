import React, { useState, useEffect, useRef } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';

interface CalculatorPageProps {
    lastUpdatedIso: string;
    t: any;
    common: any;
    locale: string;
}

export default function CalculatorPage({ lastUpdatedIso, t, common, locale }: CalculatorPageProps) {
    const [inputValue, setInputValue] = useState<string>('');
    const [resultValue, setResultValue] = useState<string>('--');
    const [mode, setMode] = useState<'c-to-f' | 'f-to-c'>('c-to-f');
    const [feverStatus, setFeverStatus] = useState<{ text: string; className: string }>({ text: '', className: '' });
    const resultRef = useRef<HTMLDivElement>(null);

    // Safety check for translations
    if (!t || !common) {
        return null;
    }

    const handleCopy = () => {
        if (resultValue !== '--') {
            navigator.clipboard.writeText(resultValue).then(() => {
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
            const formatted = f.toFixed(2).replace(/\.00$/, '');
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
            const formatted = c.toFixed(2).replace(/\.00$/, '');
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
        <Layout
            seo={{
                title: t.seo.title,
                description: t.seo.description,
            }}
        >
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@graph": [
                            {
                                "@type": "WebPage",
                                "@id": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/c-to-f-calculator`,
                                "url": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/c-to-f-calculator`,
                                "name": t.seo.title,
                                "description": t.seo.description,
                                "dateModified": lastUpdatedIso,
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/c-to-f-calculator`
                                }
                            },
                            {
                                "@type": "WebApplication",
                                "name": t.hero.title,
                                "url": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/c-to-f-calculator`,
                                "applicationCategory": "UtilityApplication",
                                "operatingSystem": "All",
                                "offers": {
                                    "@type": "Offer",
                                    "price": "0",
                                    "priceCurrency": "USD"
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": t.faqs.items.map((item: any) => ({
                                    "@type": "Question",
                                    "name": item.q,
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": item.a
                                    }
                                }))
                            },
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": t.breadcrumb.home,
                                        "item": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/`
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": t.breadcrumb.current,
                                        "item": `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/c-to-f-calculator`
                                    }
                                ]
                            }
                        ]
                    })
                }}
            />

            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`calculator-page ${locale === 'ar' ? 'font-ar' : ''}`}>
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label={`${t.breadcrumb.home} - ${common.nav.logoText}`}>
                                <span aria-hidden="true">C to F Converter</span>
                                <span className="sr-only">{common.nav.logoText}</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
                        <ol className="breadcrumb">
                            <li><Link href={getLocalizedLink('/', locale)}>{t.breadcrumb.home}</Link></li>
                            <li aria-current="page">{t.breadcrumb.current}</li>
                        </ol>
                    </nav>

                    <section className="hero-section">
                        <div className="kicker">{t.hero.kicker}</div>
                        <h1>{t.hero.title}</h1>
                        <p className="snippet-definition">
                            {t.hero.description}
                        </p>
                    </section>

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
                    </div>

                    <div className="sr-only">
                        Temperature converter result: {resultValue}. Calculated using {mode === 'c-to-f' ? 'F equals C multiplied by 1.8 plus 32' : 'C equals F minus 32 divided by 1.8'}.
                    </div>

                    <table style={{ display: 'none' }} aria-hidden="true">
                        <thead>
                            <tr><th>Celsius (°C)</th><th>Fahrenheit (°F)</th></tr>
                        </thead>
                        <tbody>
                            {[0, 10, 20, 30, 37, 100].map(c => (
                                <tr key={c}><td>{c}</td><td>{(c * 1.8 + 32).toFixed(1)}</td></tr>
                            ))}
                        </tbody>
                    </table>

                    <section className="info-card">
                        <h2>{t.formula.title}</h2>
                        <div className="formula-display-box">
                            <p>{t.formula.introCtoF}</p>
                            <div className="formula-code-card">°F = (°C × 9/5) + 32</div>
                            <p>{t.formula.introFtoC}</p>
                            <div className="formula-code-card">°C = (°F - 32) × 5/9</div>
                            <p className="approximation-tip">
                                {t.formula.tip}
                            </p>
                        </div>
                    </section>

                    <section className="info-card">
                        <h2>{t.commonTable.title}</h2>
                        <p>{t.commonTable.intro}</p>
                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>{t.commonTable.columns.celsius}</th>
                                        <th>{t.commonTable.columns.fahrenheit}</th>
                                        <th>{t.commonTable.columns.description}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>-40</td><td>-40</td><td>{t.commonTable.descriptions.equilibrium}</td></tr>
                                    <tr><td><Link href={getLocalizedLink('/0-c-to-f', locale)}>0°C</Link></td><td>32°F</td><td>{t.commonTable.descriptions.freezing}</td></tr>
                                    <tr><td><Link href={getLocalizedLink('/20-c-to-f', locale)}>20°C</Link></td><td>68°F</td><td>{t.commonTable.descriptions.room}</td></tr>
                                    <tr><td><Link href={getLocalizedLink('/37-c-to-f', locale)}>37°C</Link></td><td>98.6°F</td><td>{t.commonTable.descriptions.body}</td></tr>
                                    <tr><td><Link href={getLocalizedLink('/100-c-to-f', locale)}>100°C</Link></td><td>212°F</td><td>{t.commonTable.descriptions.boiling}</td></tr>
                                </tbody>
                            </table>
                        </div>
                    </section>

                    <section className="info-card">
                        <h2>{t.howTo.title}</h2>
                        <p>{t.howTo.intro}</p>
                        <ul className="elegant-list">
                            {t.howTo.steps.map((step: string, index: number) => (
                                <li key={index}><strong>{step.split(':')[0]}</strong>: {step.split(':')[1]}</li>
                            ))}
                        </ul>
                        <p>{t.howTo.linkPrefix}<Link href={getLocalizedLink('/c-to-f-formula', locale)}>{t.howTo.linkText}</Link>{t.howTo.linkSuffix}</p>
                    </section>

                    <section className="info-card">
                        <h2>{t.feverTable.title}</h2>
                        <div className="table-responsive">
                            <table className="premium-table">
                                <thead>
                                    <tr>
                                        <th>{t.feverTable.columns.celsius}</th>
                                        <th>{t.feverTable.columns.fahrenheit}</th>
                                        <th>{t.feverTable.columns.condition}</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    <tr><td>36.5 - 37.2°C</td><td>97.7 - 99.0°F</td><td>{t.feverTable.conditions.normal}</td></tr>
                                    <tr><td>37.3 - 38.0°C</td><td>99.1 - 100.4°F</td><td>{t.feverTable.conditions.low}</td></tr>
                                    <tr><td>38.1 - 39.0°C</td><td>100.6 - 102.2°F</td><td>{t.feverTable.conditions.moderate}</td></tr>
                                    <tr><td>&gt; 39.1°C</td><td>&gt; 102.4°F</td><td><span style={{ color: '#e53e3e', fontWeight: 'bold' }}>{t.feverTable.conditions.high}</span></td></tr>
                                </tbody>
                            </table>
                        </div>
                        <p className="disclaimer">{t.feverTable.disclaimer}</p>
                    </section>

                    <section className="info-card">
                        <h2>{t.faqs.title}</h2>
                        <div className="faq-grid">
                            {t.faqs.items.map((item: any, index: number) => (
                                <div className="faq-box" key={index}>
                                    <h3>{item.q}</h3>
                                    <p dangerouslySetInnerHTML={{ __html: item.a.replace(/Celsius to Fahrenheit formula/g, `<a href="${getLocalizedLink('/c-to-f-formula', locale)}">${t.howTo.linkText}</a>`) }} />
                                </div>
                            ))}
                        </div>
                    </section>
                </main>

                <Footer />

                <style jsx>{`
                    .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
                    .hero-section { text-align: center; padding: 3rem 0; }
                    .kicker { color: #3182ce; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9rem; margin-bottom: 0.5rem; }
                    h1 { font-size: 2.5rem; color: #2d3748; margin-bottom: 1.5rem; }
                    .snippet-definition { font-size: 1.15rem; line-height: 1.8; color: #4a5568; max-width: 800px; margin: 0 auto; }
                    
                    /* Calculator Widget */
                    .glass-card { background: #fff; border-radius: 20px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); border: 1px solid #edf2f7; padding: 2.5rem; margin-bottom: 3rem; }
                    .mode-tabs { display: flex; background: #f7fafc; border-radius: 12px; padding: 0.5rem; margin-bottom: 2rem; }
                    .tab-btn { flex: 1; padding: 0.8rem; border: none; background: transparent; border-radius: 8px; font-weight: 600; color: #718096; cursor: pointer; transition: all 0.2s; }
                    .tab-btn.active { background: #fff; color: #3182ce; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
                    
                    .input-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 2rem; margin-bottom: 2rem; }
                    label { display: block; font-size: 0.9rem; color: #718096; margin-bottom: 0.75rem; font-weight: 600; }
                    input { width: 100%; padding: 1rem; font-size: 1.5rem; border: 2px solid #edf2f7; border-radius: 12px; color: #2d3748; transition: border-color 0.2s; }
                    input:focus { outline: none; border-color: #3182ce; }
                    
                    .display-result { width: 100%; padding: 1rem; font-size: 1.5rem; background: #ebf8ff; border-radius: 12px; color: #2b6cb0; font-weight: 700; border: 2px solid transparent; }
                    
                    .fever-banner { padding: 1rem; border-radius: 12px; text-align: center; font-weight: 700; margin-bottom: 1.5rem; animation: slideDown 0.3s ease; }
                    .fever-normal { background: #c6f6d5; color: #22543d; }
                    .fever-low { background: #fefcbf; color: #744210; }
                    .fever-moderate { background: #feebc8; color: #7b341e; }
                    .fever-high { background: #fed7d7; color: #822727; }
                    
                    .quick-action-strip { display: flex; gap: 1rem; margin-bottom: 1.5rem; }
                    .quick-action-strip button { flex: 1; padding: 0.75rem; border: 1px solid #edf2f7; border-radius: 8px; background: #fff; color: #4a5568; font-weight: 600; cursor: pointer; transition: background 0.2s; }
                    .quick-action-strip button:hover:not(:disabled) { background: #f7fafc; }
                    
                    .quick-presets { display: grid; grid-template-columns: repeat(4, 1fr); gap: 0.75rem; }
                    .quick-presets button { padding: 0.5rem; background: #f7fafc; border: none; border-radius: 6px; color: #3182ce; font-weight: 600; cursor: pointer; }
                    
                    /* Content Cards */
                    .info-card { background: #fff; padding: 2rem; border-radius: 16px; margin-bottom: 2rem; border: 1px solid #edf2f7; }
                    h2 { font-size: 1.5rem; color: #2d3748; margin-bottom: 1.25rem; }
                    p { line-height: 1.7; color: #4a5568; margin-bottom: 1rem; }
                    .elegant-list { padding-left: 1.5rem; color: #4a5568; }
                    .elegant-list li { margin-bottom: 0.75rem; }

                    .formula-code-card { background: #f8fafc; padding: 1rem; border-radius: 8px; font-family: monospace; font-size: 1.25rem; font-weight: bold; color: #2d3748; text-align: center; border: 1px dashed #cbd5e0; margin: 1rem 0; }
                    .approximation-tip { font-size: 0.95rem; color: #718096; font-style: italic; background: #fffaf0; padding: 0.75rem; border-left: 4px solid #ed8936; }
                    
                    .premium-table { width: 100%; border-collapse: collapse; margin-top: 1rem; }
                    .premium-table th { background: #f7fafc; padding: 1rem; text-align: left; color: #718096; border-bottom: 2px solid #edf2f7; }
                    .premium-table td { padding: 1rem; border-bottom: 1px solid #edf2f7; color: #4a5568; }
                    
                    .faq-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 1.5rem; margin-top: 1rem; }
                    .faq-box { padding: 1.5rem; background: #f8fafc; border-radius: 12px; }
                    .faq-box h3 { font-size: 1.1rem; color: #2d3748; margin-bottom: 0.5rem; }
                    
                    @keyframes slideDown { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } }
                    
                    @media (max-width: 768px) {
                        .input-grid { grid-template-columns: 1fr; gap: 1rem; }
                        .faq-grid { grid-template-columns: 1fr; }
                        .hero-section { padding: 2rem 0; }
                        h1 { font-size: 1.8rem; }
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    const loc = locale || 'en';
    const path = require('path');
    const fs = require('fs');

    const jsonPath = path.join(process.cwd(), 'public', 'locales', loc, 'c-to-f-calculator.json');
    const commonPath = path.join(process.cwd(), 'locales', loc, 'common.json');

    const raw = fs.readFileSync(jsonPath, 'utf-8');
    const t = JSON.parse(raw);

    const commonRaw = fs.readFileSync(commonPath, 'utf-8');
    const common = JSON.parse(commonRaw);

    const lastUpdatedIso = '2026-01-12';
    return {
        props: {
            lastUpdatedIso,
            t,
            common,
            locale: loc,
        },
    };
};
