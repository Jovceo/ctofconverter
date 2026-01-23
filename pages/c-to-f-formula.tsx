import React, { useState, useEffect } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';
import { getLatestModifiedDate } from '../utils/dateHelpers';
import fs from 'fs';
import path from 'path';

interface FormulaPageProps {
    lastUpdatedIso: string;
    t: any;
    common: any;
}

export default function FormulaPage({ lastUpdatedIso, t, common }: FormulaPageProps) {
    const router = useRouter();
    const { locale = 'en' } = router;

    // Hooks must be called unconditionally first
    const [celsius, setCelsius] = useState<string>('20');
    const [fahrenheit, setFahrenheit] = useState<number>(68);
    const [step1, setStep1] = useState<string>('36.0');
    const [step2, setStep2] = useState<string>('68.0');

    useEffect(() => {
        const val = parseFloat(celsius);
        if (!isNaN(val)) {
            const f = (val * 9) / 5 + 32;
            setFahrenheit(f);
            setStep1((val * 1.8).toFixed(1));
            setStep2(f.toFixed(1));
        } else {
            setFahrenheit(NaN);
        }
    }, [celsius]);

    if (!t || !common) return null;

    return (
        <Layout
            seo={{
                title: t.meta.title,
                description: t.meta.description,
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
                                "@id": "https://ctofconverter.com/c-to-f-formula",
                                "url": "https://ctofconverter.com/c-to-f-formula",
                                "name": t.meta.title,
                                "description": t.meta.description,
                                "dateModified": lastUpdatedIso,
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": "https://ctofconverter.com/c-to-f-formula"
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": t.faq?.items?.map((item: any) => ({
                                    "@type": "Question",
                                    "name": item.question,
                                    "acceptedAnswer": {
                                        "@type": "Answer",
                                        "text": item.answer.replace(/<\/?[^>]+(>|$)/g, "")
                                    }
                                })) || []
                            },
                            {
                                "@type": "HowTo",
                                "name": t.howTo?.title || "How to Convert Celsius to Fahrenheit",
                                "description": t.meta.description,
                                "totalTime": "PT1M",
                                "estimatedCost": {
                                    "@type": "MonetaryAmount",
                                    "currency": "USD",
                                    "value": "0"
                                },
                                "tool": [
                                    {
                                        "@type": "HowToTool",
                                        "name": "Temperature Formula"
                                    }
                                ],
                                "step": t.howTo?.steps?.map((step: string, idx: number) => ({
                                    "@type": "HowToStep",
                                    "name": `Step ${idx + 1}`,
                                    "text": step
                                })) || []
                            },
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": t.breadcrumb?.home || "Home",
                                        "item": "https://ctofconverter.com" + getLocalizedLink("/", locale)
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": t.breadcrumb?.current || "Celsius to Fahrenheit Formula",
                                        "item": "https://ctofconverter.com" + getLocalizedLink("/c-to-f-formula", locale)
                                    }
                                ]
                            }
                        ]
                    })
                }}
            />
            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'font-ar' : ''}>
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label={common.nav?.logoText || 'Home - Celsius to Fahrenheit Converter'}>
                                <span aria-hidden="true">{common.nav?.logoText || 'C to F Converter'}</span>
                                <span className="sr-only">{common.nav?.logoText || 'Celsius to Fahrenheit Converter'}</span>
                            </Link>
                        </div>
                        <h1>{t.header?.title}</h1>
                        <p className="tagline">{t.header?.tagline}</p>
                        <div className="sr-only">{t.header?.tagline}</div>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
                        <ol className="breadcrumb">
                            <li><Link href={getLocalizedLink('/', locale)}>{t.breadcrumb?.home}</Link></li>
                            <li aria-current="page">{t.breadcrumb?.current}</li>
                        </ol>
                    </nav>

                    <section className="info-card">
                        <h2>{t.mainSection?.title}</h2>
                        <div className="answer-box" style={{ background: '#f0f9ff', border: '2px solid #3182ce', padding: '1.5rem', borderRadius: '8px', marginBottom: '1.5rem' }}>
                            <p style={{ margin: 0, fontSize: '1.1rem' }}><strong>Answer:</strong> {t.mainSection?.explanation1}</p>
                        </div>

                        <p>{t.mainSection?.explanation2}</p>

                        <div className="snippet-list">
                            <p>{t.howTo?.description}</p>
                            <ol>
                                {t.howTo?.steps?.map((step: string, i: number) => <li key={i}>{step}</li>)}
                            </ol>
                        </div>
                        <p><strong>{t.howTo?.exampleTitle}</strong> {t.howTo?.exampleContent}<br />{t.howTo?.exampleCalculation}</p>

                        <div className="sr-only">
                            {t.mainSection?.equation}
                        </div>
                        <div className="formula-equation main-equation">
                            {t.mainSection?.equation}
                        </div>
                        <p style={{ textAlign: 'center', color: '#718096', fontSize: '0.95rem', marginTop: '-1rem', marginBottom: '1.5rem' }}>{t.mainSection?.cta}</p>
                        <p className="last-updated" style={{ fontSize: '0.9rem', color: '#718096', fontStyle: 'italic' }}>{common.footer?.lastUpdated} {lastUpdatedIso}</p>
                    </section>

                    <div className="formula-grid">
                        <div className="formula-card easy" style={{ gridColumn: '1 / -1' }}>
                            <h3>{t.easyMethod?.title}</h3>
                            <p>{t.easyMethod?.description}</p>
                            <div className="inner-formula-equation" style={{ fontSize: '1.8rem', display: 'inline-block', margin: '0.5rem 0', fontWeight: 'bold', color: '#2b6cb0' }}>{t.easyMethod?.equation}</div>
                            <p>{t.easyMethod?.content}</p>
                            <p><strong>{t.easyMethod?.example}</strong></p>
                        </div>
                    </div>

                    <section className="info-card">
                        <h2>{t.interactive?.title}</h2>
                        <p>{t.interactive?.prompt}</p>

                        <div className="interactive-converter">
                            <div className="input-group">
                                <label htmlFor="interactive-celsius">{t.interactive?.labelCelsius}</label>
                                <input
                                    type="number"
                                    id="interactive-celsius"
                                    value={celsius}
                                    onChange={(e) => setCelsius(e.target.value)}
                                />
                            </div>
                            <div className="result-display">
                                <div id="interactive-fahrenheit" className="interactive-result">{!isNaN(fahrenheit) ? fahrenheit.toFixed(1) + '°F' : '--'}</div>
                                {!isNaN(fahrenheit) && (
                                    <div className="calculation-steps">
                                        <h4>{t.interactive?.stepsTitle}</h4>
                                        <p><strong>{t.interactive?.step1}:</strong> {celsius} × 9/5 = {step1}</p>
                                        <p><strong>{t.interactive?.step2}:</strong> {step1} + 32 = {step2}</p>
                                        <p><strong>{t.interactive?.finalResult}</strong> {celsius}°C = {step2}°F</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </section>

                    <section className="info-card">
                        <h2>{t.derivation?.title}</h2>
                        <p>{t.derivation?.intro}</p>
                        <ul>
                            {t.derivation?.points?.map((p: string, i: number) => <li key={i}>{p}</li>)}
                        </ul>
                        <p>{t.derivation?.rangeExplanation}</p>

                        <div className="formula-steps-container">
                            {t.derivation?.steps?.map((step: any, i: number) => (
                                <div className="formula-step-item" key={i}>
                                    <div className="formula-step-icon">{i + 1}</div>
                                    <div className="formula-step-info">
                                        <h3 className="formula-step-heading">{step.title}</h3>
                                        <p>{step.description}</p>
                                        <div className="formula-step-viz">{step.visualization}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p>{t.derivation?.tip?.content}</p>
                    </section>

                    <section className="info-card">
                        <h2 id="common-title">{t.table?.title}</h2>
                        <div className="common-conversions">
                            {t.table?.rows?.filter((row: any) => ['0', '20', '30', '37', '100'].includes(row.c)).map((row: any, i: number) => (
                                <div className="conversion-example" key={i}>
                                    <div className="temp"><Link href={getLocalizedLink(`/${row.c}-c-to-f`, locale)}>{row.c}°C</Link></div>
                                    <div className="result">{row.f}°F ({row.d})</div>
                                </div>
                            ))}
                        </div>



                        <h2>{t.table?.title}</h2>
                        <table className="comparison-table">
                            <thead>
                                <tr>
                                    <th>{t.table?.headers?.celsius}</th>
                                    <th>{t.table?.headers?.fahrenheit}</th>
                                    <th>{t.table?.headers?.description}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {t.table?.rows?.map((row: any, i: number) => (
                                    <tr key={i}>
                                        <td>{row.c}</td>
                                        <td>{row.f}</td>
                                        <td>{row.d}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </section>

                    <section className="info-card">
                        <h2 className="text-center">{t.otherFormulas?.title}</h2>
                        <div className="other-formula-grid">
                            <div className="formula-card other">
                                <h3>{t.otherFormulas?.fToC?.title}</h3>
                                <div className="inner-formula-equation" style={{ fontSize: '2rem', display: 'block', margin: '1rem 0', fontWeight: 'bold', color: '#2b6cb0' }}>{t.otherFormulas?.fToC?.formula}</div>
                                <p>{t.otherFormulas?.fToC?.description}</p>
                                <p><strong>{t.otherFormulas?.fToC?.example}</strong></p>
                                <div className="tip-box">
                                    <h4>{t.otherFormulas?.fToC?.quickTitle}</h4>
                                    <p>{t.otherFormulas?.fToC?.quickFormula}</p>
                                    <p>{t.otherFormulas?.fToC?.quickExample}</p>
                                </div>
                            </div>
                            <div className="formula-card other">
                                <h3>{t.otherFormulas?.cToK?.title}</h3>
                                <div className="inner-formula-equation" style={{ fontSize: '2rem', display: 'block', margin: '1rem 0', fontWeight: 'bold', color: '#2b6cb0' }}>{t.otherFormulas?.cToK?.formula}</div>
                                <p>{t.otherFormulas?.cToK?.description}</p>
                                <p><strong>{t.otherFormulas?.cToK?.example}</strong></p>
                                <div className="tip-box">
                                    <h4>{t.otherFormulas?.cToK?.reverseTitle}</h4>
                                    <p>{t.otherFormulas?.cToK?.reverseFormula}</p>
                                    <p>{t.otherFormulas?.cToK?.reverseExample}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="info-card">
                        <h2>{t.example30?.title}</h2>
                        <p>{t.example30?.intro}</p>
                        <div className="formula-steps-container">
                            {t.example30?.steps?.map((step: any, i: number) => (
                                <div className="formula-step-item" key={i}>
                                    <div className="formula-step-icon">{i + 1}</div>
                                    <div className="formula-step-info">
                                        <h3 className="formula-step-heading">{step.title}</h3>
                                        <div className="formula-step-viz">{step.value}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <p>{t.example30?.approxNote}</p>
                    </section>

                    <section className="info-card">
                        <h2>{t.commonMistakes?.title}</h2>
                        <ul>
                            {t.commonMistakes?.items?.map((item: any, i: number) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="info-card">
                        <h2>{t.whenToUse?.title}</h2>
                        <p>{t.whenToUse?.intro}</p>
                        <ul>
                            {t.whenToUse?.items?.map((item: any, i: number) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                    </section>

                    <section className="info-card">
                        <h2>{t.difference?.title}</h2>
                        <p>{t.difference?.p1}</p>
                        <p>{t.difference?.p2}</p>
                    </section>

                    <section className="info-card">
                        <h2>{t.vs?.title}</h2>
                        <p>{t.vs?.intro}</p>
                        <ul>
                            {t.vs?.items?.map((item: any, i: number) => (
                                <li key={i}><strong>{item.bold}</strong> {item.text}</li>
                            ))}
                        </ul>
                        <p>{t.vs?.footer}</p>
                    </section>

                    <section className="faq-section">
                        <h2 id="faq-title">{t.faq?.title}</h2>
                        {t.faq?.items?.map((item: any, i: number) => (
                            <div className="faq-item" key={i}>
                                <h3>{item.question}</h3>
                                <p dangerouslySetInnerHTML={{ __html: item.answer }} />
                            </div>
                        ))}
                    </section>

                    <div className="calculator-link" style={{ textAlign: 'center', margin: '2rem 0' }}>
                        <p>{t.footer?.calculatorLink} <Link href={getLocalizedLink('/c-to-f-calculator', locale)}>{common.nav?.logoText || 'Celsius to Fahrenheit calculator'}</Link>.</p>
                    </div>
                </main>

                <Footer lastUpdated={lastUpdatedIso} />
            </div>

            <style jsx>{`
        .breadcrumb-nav { margin: 1rem 0; }
        .breadcrumb { display: flex; list-style: none; padding: 0; }
        .breadcrumb li:not(:last-child)::after { content: "/"; margin: 0 0.5rem; color: #718096; }
        .breadcrumb a { color: #3182ce; text-decoration: none; }
        .main-equation { font-size: 2.5rem; text-align: center; margin: 2rem 0; color: #2b6cb0; font-weight: bold; }
        @media (max-width: 768px) { .main-equation { font-size: 1.8rem; } }
        .formula-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
        .formula-card { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); }
        .formula-card.primary { border-top: 4px solid #3182ce; }
        .formula-card.easy { border-top: 4px solid #38a169; }
        .formula-card.other { border-top: 4px solid #805ad5; }
        .formula-card h3 { color: #2d3748; margin-top: 0; margin-bottom: 1rem; }
        .formula-card p { line-height: 1.6; color: #4a5568; margin-bottom: 1rem; }
        .formula-card ol { margin-bottom: 1rem; padding-left: 1.5rem; }
        .info-card { background: #fff; padding: 2rem; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.05); margin-bottom: 2rem; }
        .info-card h2 { color: #2d3748; margin-top: 0; margin-bottom: 1.5rem; border-bottom: 2px solid #edf2f7; padding-bottom: 0.5rem; }
        .info-card p { line-height: 1.8; color: #4a5568; margin-bottom: 1.25rem; }
        .keyword-highlight { font-weight: bold; color: #2c5282; }
        .common-conversions { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 1rem; margin-bottom: 2rem; }
        .conversion-example { background: #f8fafc; padding: 1rem; border-radius: 8px; text-align: center; border: 1px solid #edf2f7; }
        .conversion-example .temp a { font-size: 1.5rem; font-weight: bold; color: #3182ce; text-decoration: none; }
        .conversion-example .result { color: #4a5568; margin-top: 0.5rem; }
        .comparison-table { width: 100%; border-collapse: collapse; margin-top: 1.5rem; }
        .comparison-table th { background: #3182ce; color: #fff; padding: 1rem; text-align: left; }
        .comparison-table td { padding: 1rem; border-bottom: 1px solid #edf2f7; color: #4a5568; }
        .formula-steps-container { margin: 1.5rem 0; }
        .formula-step-item { display: flex; gap: 1.5rem; margin-bottom: 2rem; align-items: flex-start; }
        .formula-step-info { flex: 1; min-width: 0; }
        .formula-step-icon { width: 32px; height: 32px; background: #3182ce; color: #fff; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; font-weight: bold; margin-top: 0.25rem; }
        .formula-step-heading { margin: 0 0 0.5rem 0; font-size: 1.2rem; color: #2d3748; }
        .formula-step-viz { background: #f8fafc; padding: 0.75rem 1rem; border-radius: 8px; font-family: 'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace; font-size: 1.15rem; color: #1a365d; font-weight: 600; border: 1px dashed #cbd5e0; margin-top: 0.5rem; word-break: break-word; overflow-wrap: break-word; box-shadow: inset 0 1px 2px rgba(0,0,0,0.02); }
        @media (max-width: 640px) {
            .formula-step-item { flex-direction: column; gap: 0.75rem; }
            .formula-step-icon { margin-top: 0; }
        }
        .faq-item { margin-bottom: 1.5rem; }
        .faq-item h3 { font-size: 1.1rem; color: #2d3748; margin-bottom: 0.5rem; }
        .text-center { text-align: center; }
        
        /* Interactive Converter Styles */
        .interactive-converter { background: #ebf8ff; padding: 2rem; border-radius: 12px; margin: 1.5rem 0; }
        .interactive-converter .input-group { margin-bottom: 1.5rem; }
        .interactive-converter label { display: block; font-weight: bold; margin-bottom: 0.5rem; }
        .interactive-converter input { width: 100%; padding: 0.75rem; font-size: 1.2rem; border-radius: 6px; border: 1px solid #cbd5e0; }
        .result-display { text-align: center; padding: 1.5rem; background: #fff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
        .interactive-result { font-size: 2.5rem; font-weight: bold; color: #2b6cb0; }
        @media (max-width: 768px) { .interactive-result { font-size: 1.8rem; } }
        .interactive-converter .calculation-steps { margin-top: 1.5rem; text-align: left; border-top: 1px solid #edf2f7; padding-top: 1rem; }
      `}</style>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/c-to-f-formula.tsx',
        `locales/${locale}/c-to-f-formula.json`,
        `locales/${locale}/common.json`
    ]);

    // Helper to deep merge objects
    const deepMerge = (target: any, source: any) => {
        for (const key of Object.keys(source)) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], deepMerge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    };

    const loadJSON = (loc: string, p: string) => {
        try {
            const filePath = path.join(process.cwd(), 'locales', loc, p);
            if (!fs.existsSync(filePath)) return {};
            const fileContent = fs.readFileSync(filePath, 'utf8');
            return JSON.parse(fileContent);
        } catch {
            return {};
        }
    };

    // 1. Load English (Base)
    const enCommon = loadJSON('en', 'common.json');
    const enTrans = loadJSON('en', 'c-to-f-formula.json');

    // 2. Load Current Locale (if different)
    let commonTrans = enCommon;
    let pageTrans = enTrans;

    if (locale !== 'en') {
        const locCommon = loadJSON(locale, 'common.json');
        const locTrans = loadJSON(locale, 'c-to-f-formula.json');
        commonTrans = deepMerge(JSON.parse(JSON.stringify(enCommon)), locCommon);
        pageTrans = deepMerge(JSON.parse(JSON.stringify(enTrans)), locTrans);
    }

    return {
        props: {
            lastUpdatedIso,
            t: pageTrans,
            common: commonTrans,
        },
    };
};
