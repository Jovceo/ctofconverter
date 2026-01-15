import React, { useState, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useTranslation, getLocalizedLink } from '../utils/i18n';

export default function FeverTemperatureChart() {
    const { t, locale } = useTranslation('fever-temperature-chart');

    // Converter State
    const [celsius, setCelsius] = useState<string>('');
    const [fahrenheit, setFahrenheit] = useState<string>('--');
    const [validationMsg, setValidationMsg] = useState<{ text: string, type: 'error' | 'warning' | 'success' | '' }>({ text: '', type: '' });
    const [copySuccess, setCopySuccess] = useState(false);

    // Convert Logic
    const handleCelsiusChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCelsius(val);
        setCopySuccess(false);

        if (val === '') {
            setFahrenheit('--');
            setValidationMsg({ text: '', type: '' });
            return;
        }

        const cVal = parseFloat(val);
        if (isNaN(cVal)) {
            setFahrenheit('--');
            setValidationMsg({ text: 'Please enter a valid number', type: 'error' });
            return;
        }

        if (cVal < 35 || cVal > 42) {
            setValidationMsg({ text: 'Please enter a temperature between 35°C and 42°C', type: 'error' });
            setFahrenheit('--');
            return;
        }

        // Calculation
        const fVal = (cVal * 9 / 5) + 32;
        // Format
        const rounded = Math.round(fVal * 10) / 10;
        const fStr = (rounded % 1 === 0 ? rounded.toString() : rounded.toFixed(1)) + '°F';
        setFahrenheit(fStr);

        // Validation / Guidance Messages
        if (cVal >= 41) {
            setValidationMsg({ text: t('converter.validation.danger'), type: 'error' });
        } else if (cVal >= 40) {
            setValidationMsg({ text: t('converter.validation.high'), type: 'error' });
        } else if (cVal >= 39) {
            setValidationMsg({ text: t('converter.validation.moderate'), type: 'warning' });
        } else if (cVal >= 38) {
            setValidationMsg({ text: t('converter.validation.lowGrade'), type: 'success' });
        } else if (cVal >= 37.6) {
            setValidationMsg({ text: t('converter.validation.elevated'), type: 'success' });
        } else if (cVal >= 36.5) {
            setValidationMsg({ text: t('converter.validation.normal'), type: 'success' });
        } else {
            setValidationMsg({ text: t('converter.validation.low'), type: 'warning' });
        }
    };

    const handleCopy = () => {
        if (fahrenheit !== '--') {
            navigator.clipboard.writeText(fahrenheit);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    const handlePrintChartOnly = () => {
        // Add a class to body to indicate chart only printing, logic handled in CSS media query or JS manipulation
        // For React/Next.js, easiest is often just window.print() and use CSS @media print to hide other sections
        // But the original script replaced body content. Let's try to stick to CSS solution if possible, 
        // or emulate the behavior by toggling a comprehensive 'print-mode' state if needed.
        // For simplicity and better UX in React, we will rely on CSS @media print.
        // However, user specifically asked for "Print Chart Only". 
        // Let's implement a specific print style that hides everything except chart and key info.

        document.body.classList.add('print-chart-only');
        window.print();
        document.body.classList.remove('print-chart-only');
    };

    return (
        <Layout seo={{
            title: t('meta.title'),
            description: t('meta.description'),
            canonical: "https://ctofconverter.com/fever-temperature-chart",
            ogType: "article",
            ogTitle: t('meta.ogTitle'),
            ogDescription: t('meta.ogDescription'),
        }}>
            <Head>
                {/* 1. MedicalWebPage Schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MedicalWebPage",
                        "headline": t('schema.medicalHeadline'),
                        "description": t('schema.medicalDesc'),
                        "medicalAudience": "Patient",
                        "lastReviewed": "2025-09-28",
                        "relevantSpecialty": "FamilyMedicine"
                    })
                }} />

                {/* 2. FAQPage Schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": [
                            {
                                "@type": "Question",
                                "name": t('faq.q1'),
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": t('faq.a1')
                                }
                            },
                            {
                                "@type": "Question",
                                "name": t('faq.q2'),
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": t('faq.a2')
                                }
                            },
                            {
                                "@type": "Question",
                                "name": t('faq.q3'),
                                "acceptedAnswer": {
                                    "@type": "Answer",
                                    "text": t('faq.a3')
                                }
                            }
                        ]
                    })
                }} />

                {/* 3. BreadcrumbList Schema */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BreadcrumbList",
                        "itemListElement": [
                            {
                                "@type": "ListItem",
                                "position": 1,
                                "name": "Home",
                                "item": "https://ctofconverter.com"
                            },
                            {
                                "@type": "ListItem",
                                "position": 2,
                                "name": t('breadcrumb.page'),
                                "item": "https://ctofconverter.com/fever-temperature-chart"
                            }
                        ]
                    })
                }} />
            </Head>
            <div className="fever-page-layout-wrapper">
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label={`${t('nav.home')} - Celsius to Fahrenheit Converter`}>
                                <span aria-hidden="true">C to F Converter</span>
                                <span className="sr-only">{t('meta.logoText')}</span>
                            </Link>
                        </div>

                        <h1>{t('hero.title')}</h1>
                        <p className="tagline">{t('hero.tagline')}</p>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
                        <ol className="breadcrumb">
                            <li><Link href={getLocalizedLink('/', locale)}>{t('breadcrumb.home')}</Link></li>
                            <li aria-current="page">{t('breadcrumb.page')}</li>
                        </ol>
                    </nav>

                    <section className="fever-chart-hero" id="hero-section">
                        <h2>{t('hero.subtitle')}</h2>
                        <p>{t('hero.subTagline')}</p>
                    </section>

                    {/* Featured Snippet Bait Section */}
                    <section className="featured-snippet-bait" style={{
                        backgroundColor: '#fff',
                        padding: '2rem',
                        borderRadius: '12px',
                        border: '2px solid #e2e8f0',
                        margin: '2rem 0',
                        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                    }}>
                        <h2 style={{
                            textAlign: 'left',
                            fontSize: '1.5rem',
                            color: '#1e293b',
                            marginBottom: '1rem',
                            borderBottom: 'none',
                            paddingBottom: 0
                        }} id="fever-definition">{t('definition.title')}</h2>
                        <p style={{
                            fontSize: '1.25rem',
                            lineHeight: '1.75',
                            color: '#334155',
                            margin: 0
                        }} dangerouslySetInnerHTML={{ __html: t('definition.content') }} />
                    </section>

                    <section className="converter-tool section-no-print">
                        <h2>{t('converter.title')}</h2>
                        <p>{t('converter.description')}</p>
                        <div className="converter-form">
                            <div className="input-group">
                                <div className="input-header">
                                    <label htmlFor="celsius-input">{t('converter.celsiusLabel')}</label>
                                </div>
                                <input
                                    type="number"
                                    id="celsius-input"
                                    placeholder={t('converter.placeholder')}
                                    step="0.1"
                                    min="35"
                                    max="42"
                                    value={celsius}
                                    onChange={handleCelsiusChange}
                                />
                            </div>

                            <div className="result-container">
                                <div className="result-header">
                                    <label>{t('converter.fahrenheitLabel')}</label>
                                </div>
                                <output className="result-value">{fahrenheit}</output>
                                <button className={`btn copy-btn ${copySuccess ? 'success' : ''}`} onClick={handleCopy} aria-label="Copy temperature result">
                                    {copySuccess ? t('converter.copied') : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                                <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor" />
                                            </svg>
                                            <span className="btn-text">{t('converter.copy')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                        {validationMsg.text && (
                            <div className={`validation-message ${validationMsg.type}`}>
                                {validationMsg.text}
                            </div>
                        )}
                    </section>

                    <section className="chart-section">
                        <h2>{t('levels.title')}</h2>
                        <p>{t('levels.description')}</p>

                        <div className="fever-levels">
                            <div className="fever-level normal">
                                <h3>{t('levels.normal.title')}</h3>
                                <div className="temp-range">{t('levels.normal.range')}</div>
                                <p>{t('levels.normal.desc')}</p>
                                <ul>
                                    {(t('levels.normal.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>

                            <div className="fever-level elevated">
                                <h3>{t('levels.elevated.title')}</h3>
                                <div className="temp-range">{t('levels.elevated.range')}</div>
                                <p>{t('levels.elevated.desc')}</p>
                                <ul>
                                    {(t('levels.elevated.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>

                            <div className="fever-level low-grade">
                                <h3>{t('levels.lowGrade.title')}</h3>
                                <div className="temp-range">{t('levels.lowGrade.range')}</div>
                                <p>{t('levels.lowGrade.desc')}</p>
                                <ul>
                                    {(t('levels.lowGrade.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>

                            <div className="fever-level moderate">
                                <h3>{t('levels.moderate.title')}</h3>
                                <div className="temp-range"><Link href={getLocalizedLink('/39-c-to-f', locale)}>39.0°C</Link> - {t('levels.moderate.range').split(' - ')[1]}</div>
                                <p>{t('levels.moderate.desc')}</p>
                                <ul>
                                    {(t('levels.moderate.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>

                            <div className="fever-level high">
                                <h3>{t('levels.high.title')}</h3>
                                <div className="temp-range"><Link href={getLocalizedLink('/40-c-to-f', locale)}>40.0°C</Link> - <Link href={getLocalizedLink('/41-c-to-f', locale)}>41.0°C</Link> ({t('levels.high.range').split('(')[1]}</div>
                                <p>{t('levels.high.desc')}</p>
                                <ul>
                                    {(t('levels.high.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>

                            <div className="fever-level danger">
                                <h3>{t('levels.danger.title')}</h3>
                                <div className="temp-range">{t('levels.danger.range')}</div>
                                <p>{t('levels.danger.desc')}</p>
                                <ul>
                                    {(t('levels.danger.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="age-specific-section">
                        <h2>{t('ageGroups.title')}</h2>

                        <div className="age-group">
                            <h3>{t('ageGroups.infants.title')}</h3>
                            <p dangerouslySetInnerHTML={{ __html: t('ageGroups.infants.threshold') }} />
                            <ul>
                                {(t('ageGroups.infants.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                            </ul>
                        </div>

                        <div className="age-group">
                            <h3>{t('ageGroups.children.title')}</h3>
                            <p dangerouslySetInnerHTML={{ __html: t('ageGroups.children.threshold') }} />
                            <ul>
                                {(t('ageGroups.children.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                            </ul>
                        </div>

                        <div className="age-group">
                            <h3>{t('ageGroups.adults.title')}</h3>
                            <p dangerouslySetInnerHTML={{ __html: t('ageGroups.adults.threshold') }} />
                            <ul>
                                {(t('ageGroups.adults.tips') as string[] || []).map((tip, idx) => <li key={idx}>{tip}</li>)}
                            </ul>
                        </div>
                    </section>

                    <section className="measurement-section section-no-print">
                        <h2>{t('measurement.title')}</h2>
                        <p>{t('measurement.description')}</p>

                        <div className="measurement-methods">
                            <div className="method-card">
                                <div className="method-icon">👄</div>
                                <h3>{t('measurement.oral.title')}</h3>
                                <p><strong>{t('measurement.oral.range')}</strong></p>
                                <p>{t('measurement.oral.note')}</p>
                            </div>

                            <div className="method-card">
                                <div className="method-icon">🦻</div>
                                <h3>{t('measurement.ear.title')}</h3>
                                <p><strong>{t('measurement.ear.range')}</strong></p>
                                <p>{t('measurement.ear.note')}</p>
                            </div>

                            <div className="method-card">
                                <div className="method-icon">🤚</div>
                                <h3>{t('measurement.forehead.title')}</h3>
                                <p><strong>{t('measurement.forehead.range')}</strong></p>
                                <p>{t('measurement.forehead.note')}</p>
                            </div>

                            <div className="method-card">
                                <div className="method-icon">🩹</div>
                                <h3>{t('measurement.axillary.title')}</h3>
                                <p><strong>{t('measurement.axillary.range')}</strong></p>
                                <p>{t('measurement.axillary.note')}</p>
                            </div>
                        </div>
                    </section>

                    <section className="pdf-download-section section-no-print">
                        <h2>{t('download.title')}</h2>
                        <p>{t('download.description')}</p>

                        <a href="/downloads/fever-temperature-chart.pdf" className="btn-download" download="Fever-Temperature-Chart.pdf">
                            <span>📄</span>
                            {t('download.btn')}
                        </a>

                        <div className="print-options">
                            <button className="print-btn" onClick={handlePrint}>
                                <span>🖨️</span>
                                {t('download.printPage')}
                            </button>

                            <button className="print-btn" onClick={handlePrintChartOnly}>
                                <span>📊</span>
                                {t('download.printChart')}
                            </button>
                        </div>

                        <p><small>{t('download.note')}</small></p>
                    </section>

                    <section className="disclaimer">
                        <h2>{t('disclaimer.title')}</h2>
                        <p dangerouslySetInnerHTML={{ __html: t('disclaimer.content') }} />
                    </section>
                </main>

                <Footer lastUpdated="2025-09-28" />
            </div>

            <style jsx>{`
                /* Hero */
                .fever-chart-hero {
                    background: linear-gradient(135deg, #2c7fb8, #41b6e6);
                    color: white;
                    padding: 2.5rem 2rem;
                    text-align: center;
                    margin-bottom: 2rem;
                    border-radius: 10px;
                }
                .fever-chart-hero h1 {
                    color: white;
                    margin-bottom: 1rem;
                }

                /* Converter Tool */
                .converter-tool {
                    background-color: #f8f9fa;
                    padding: 1.8rem;
                    border-radius: 10px;
                    margin: 2rem 0;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .converter-tool h2 {
                    margin-top: 0;
                    color: #2c7fb8;
                }
                .converter-form {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 1.5rem;
                    align-items: flex-end;
                    margin-top: 1.5rem;
                }
                .input-group, .result-container {
                    flex: 1;
                    min-width: 250px;
                }
                .input-header, .result-header {
                    margin-bottom: 0.5rem;
                    font-weight: 600;
                    color: #555;
                }
                input[type="number"] {
                    width: 100%;
                    padding: 0.8rem;
                    font-size: 1.2rem;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                }
                .result-value {
                    display: block;
                    width: 100%;
                    padding: 0.8rem;
                    font-size: 1.2rem;
                    background: #fff;
                    border: 1px solid #ddd;
                    border-radius: 6px;
                    font-weight: bold;
                    min-height: 52px; /* Visual match */
                    box-sizing: border-box;
                }
                .copy-btn {
                    margin-top: 10px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    gap: 6px;
                    background: #3498db;
                    color: white;
                    border: none;
                    padding: 8px 16px;
                    border-radius: 4px;
                    cursor: pointer;
                    width: 100%;
                    transition: background 0.2s;
                }
                .copy-btn:hover { background: #2980b9; }
                .copy-btn.success { background: #27ae60; }
                
                .validation-message {
                    margin-top: 1rem;
                    padding: 1rem;
                    border-radius: 6px;
                    font-weight: 500;
                }
                .validation-message.error { background: #ffebee; color: #c0392b; border: 1px solid #ffcdd2; }
                .validation-message.warning { background: #fff3e0; color: #e67e22; border: 1px solid #ffe0b2; }
                .validation-message.success { background: #e8f5e9; color: #27ae60; border: 1px solid #c8e6c9; }

                /* Fever Levels Grid */
                .fever-levels {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                    gap: 1.5rem;
                    margin: 2rem 0;
                }
                .fever-level {
                    background: white;
                    border-radius: 10px;
                    padding: 1.5rem;
                    box-shadow: 0 4px 12px rgba(0,0,0,0.08);
                    border-left: 5px solid;
                    transition: transform 0.3s;
                }
                .fever-level:hover { transform: translateY(-5px); }
                .fever-level.normal { border-left-color: #4CAF50; }
                .fever-level.elevated { border-left-color: #FF9800; }
                .fever-level.low-grade { border-left-color: #FF5722; }
                .fever-level.moderate { border-left-color: #F44336; }
                .fever-level.high { border-left-color: #D32F2F; }
                .fever-level.danger { border-left-color: #B71C1C; }
                
                .fever-level h3 {
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                    margin-top: 0;
                }
                .temp-range {
                    font-size: 1.2rem;
                    font-weight: bold;
                    margin: 0.5rem 0;
                }

                /* Age Specific */
                .age-specific-section { margin: 2rem 0; }
                .age-group {
                    background: white;
                    border-radius: 10px;
                    padding: 1.5rem;
                    margin-bottom: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                }
                .age-group h3 {
                    color: #2c7fb8;
                    border-bottom: 2px solid #e0e0e0;
                    padding-bottom: 0.5rem;
                    margin-bottom: 1rem;
                }

                /* Measurement Methods */
                .measurement-methods {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 1.5rem;
                    margin: 2rem 0;
                }
                .method-card {
                    background: white;
                    border-radius: 10px;
                    padding: 1.5rem;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.05);
                    text-align: center;
                }
                .method-icon {
                    font-size: 2.5rem;
                    margin-bottom: 1rem;
                }

                /* Download Section */
                .pdf-download-section {
                    background: linear-gradient(135deg, #f5f7fa, #e3f2fd);
                    border-radius: 12px;
                    padding: 3rem 2rem;
                    text-align: center;
                    margin: 3rem 0;
                }
                .pdf-download-section h2 {
                    color: #2c7fb8;
                    margin-bottom: 1rem;
                }
                .btn-download {
                    background-color: #4CAF50;
                    color: white;
                    padding: 1rem 2rem;
                    border-radius: 6px;
                    text-decoration: none;
                    font-weight: bold;
                    display: inline-flex;
                    align-items: center;
                    justify-content: center;
                    gap: 0.5rem;
                    margin-top: 1.5rem;
                    transition: all 0.3s;
                }
                .btn-download:hover {
                    background-color: #3d8b40;
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0,0,0,0.15);
                }
                .print-options {
                    display: flex;
                    gap: 1rem;
                    justify-content: center;
                    flex-wrap: wrap;
                    margin-top: 1.5rem;
                }
                .print-btn {
                    background-color: #2c7fb8;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    padding: 0.5rem 1rem;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 0.5rem;
                }

                /* Disclaimer */
                .disclaimer {
                    background: #f9f9f9;
                    padding: 1.5rem;
                    border-radius: 8px;
                    border-left: 4px solid #95a5a6;
                    margin-bottom: 2rem;
                }
                .disclaimer h2 { font-size: 1.2rem; margin-top: 0; }

                /* Breadcrumb Override - matching site style */
                .breadcrumb {
                    display: flex;
                    list-style: none;
                    padding: 0;
                    margin-bottom: 20px;
                    font-size: 0.9em;
                }
                .breadcrumb li + li:before {
                    padding: 0 5px;
                    color: #ccc;
                    content: "/";
                }

                @media (max-width: 768px) {
                    .fever-levels, .measurement-methods { grid-template-columns: 1fr; }
                    .print-options { flex-direction: column; align-items: center; }
                }

                /* Printing Styles */
                @media print {
                    .section-no-print { display: none !important; }
                    .fever-page-container { margin: 0; padding: 0; }
                    /* In "Print Chart Only" mode (hack enabled via class), hiding everything except intended regions is tricky without JS restructuring.
                       But standard window.print() combined with hiding nav/hero/footer via Layout (if Layout handles it) is standard.
                       Layout typically isn't hidden by default print styles unless we define it globally.
                       We'll rely on global print styles if they exist, or user's browser default, 
                       plus our specific hides. */
                }
            `}</style>

            {/* Global print helper for "Chart Only" which we simulate by hiding siblings */}
            <style jsx global>{`
                @media print {
                    /* If body has 'print-chart-only' class, hide everything... */
                    body.print-chart-only * {
                        visibility: hidden;
                    }
                    /* ...except our chart and age sections */
                    body.print-chart-only .fever-levels, 
                    body.print-chart-only .fever-levels *,
                    body.print-chart-only .age-specific-section,
                    body.print-chart-only .age-specific-section * {
                        visibility: visible;
                    }
                    /* Re-positioning trick */
                    body.print-chart-only .chart-section {
                        position: absolute;
                        top: 0;
                        left: 0;
                    }
                    body.print-chart-only .age-specific-section {
                        position: absolute;
                        top: 1000px; /* Rough estimate, or let them flow naturally if wrapper is positioned */
                        left: 0;
                    }
                }
            `}</style>
        </Layout>
    );
}
