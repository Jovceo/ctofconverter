import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import CalculatorWidget from '../components/CalculatorWidget';
import { getLocalizedLink } from '../utils/i18n';

interface CalculatorPageProps {
    lastUpdatedIso: string;
    t: any;
    common: any;
    locale: string;
}

export default function CalculatorPage({ lastUpdatedIso, t, common, locale }: CalculatorPageProps) {
    // Safety check for translations
    if (!t || !common) {
        return null;
    }

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

                    <CalculatorWidget t={t} locale={locale} />

                    <div className="sr-only">
                        Detailed temperature conversion tools and reference tables for Celsius to Fahrenheit conversions. Includes formula explanations, benchmark data, and health-related temperature guides.
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
                    
                    @media (max-width: 768px) {
                        .container { padding: 0 1rem; }
                        .faq-grid { grid-template-columns: 1fr; }
                        .hero-section { padding: 2rem 0 1.5rem; }
                        h1 { font-size: 1.75rem; margin-bottom: 1rem; }
                        .kicker { font-size: 0.8rem; margin-bottom: 0.25rem; }
                        .snippet-definition { font-size: 1rem; line-height: 1.6; }
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale }) => {
    const loc = locale || 'en';
    const jsonPath = path.join(process.cwd(), 'public', 'locales', loc, 'c-to-f-calculator.json');
    const commonPath = path.join(process.cwd(), 'locales', loc, 'common.json');

    const t = JSON.parse(fs.readFileSync(jsonPath, 'utf-8'));
    const common = JSON.parse(fs.readFileSync(commonPath, 'utf-8'));

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
