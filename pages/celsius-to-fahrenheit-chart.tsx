import React from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import fs from 'fs';
import path from 'path';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import SearchableChart from '../components/SearchableChart';
import { getLocalizedLink } from '../utils/i18n';

interface TemperatureItem {
    c: number;
    f: number;
    isTier1: boolean;
}

interface ChartPageProps {
    lastUpdatedIso: string;
    temperatureData: TemperatureItem[];
    t: any;
}

export default function TemperatureChartPage({ lastUpdatedIso, temperatureData, t }: ChartPageProps) {
    const router = useRouter();
    const { locale = 'en' } = router;

    return (
        <Layout
            seo={{
                title: t.seo_title,
                description: t.seo_description,
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
                                "@id": `https://ctofconverter.com${locale !== 'en' ? `/${locale}` : ''}/celsius-to-fahrenheit-chart`,
                                "url": `https://ctofconverter.com${locale !== 'en' ? `/${locale}` : ''}/celsius-to-fahrenheit-chart`,
                                "name": t.seo_title,
                                "description": t.seo_description,
                                "dateModified": lastUpdatedIso,
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": `https://ctofconverter.com${locale !== 'en' ? `/${locale}` : ''}/celsius-to-fahrenheit-chart`
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": t.faq_q1,
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": t.faq_a1
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": t.faq_q2,
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": t.faq_a2
                                        }
                                    }
                                ]
                            },
                            {
                                "@type": "BreadcrumbList",
                                "itemListElement": [
                                    {
                                        "@type": "ListItem",
                                        "position": 1,
                                        "name": t.breadcrumb_home,
                                        "item": `https://ctofconverter.com${locale !== 'en' ? `/${locale}` : ''}/`
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": t.breadcrumb_chart,
                                        "item": `https://ctofconverter.com${locale !== 'en' ? `/${locale}` : ''}/celsius-to-fahrenheit-chart`
                                    }
                                ]
                            }
                        ]
                    })
                }}
            />

            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={`chart-page ${locale === 'ar' ? 'font-ar' : ''}`}>
                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href={getLocalizedLink('/', locale)} aria-label={`${t.breadcrumb_home} - Celsius to Fahrenheit Converter`}>
                                <span aria-hidden="true">C to F Converter</span>
                                <span className="sr-only">Celsius to Fahrenheit Converter</span>
                            </Link>
                        </div>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
                        <ol className="breadcrumb">
                            <li><Link href={getLocalizedLink('/', locale)}>{t.breadcrumb_home}</Link></li>
                            <li aria-current="page">{t.breadcrumb_chart}</li>
                        </ol>
                    </nav>

                    <section className="hero-section">
                        <div className="kicker">{t.hero_kicker}</div>
                        <h1>{t.hero_h1}</h1>
                        <p className="description-intro">
                            {t.hero_desc}
                        </p>
                    </section>

                    <section className="article-content">
                        <h2>{t.section1_h2}</h2>
                        <p>
                            <strong>{t.section1_c_label}</strong> {t.section1_c_text}
                        </p>
                        <p>
                            <strong>{t.section1_f_label}</strong> {t.section1_f_text}
                        </p>
                    </section>

                    <p className="description-intro" style={{ marginBottom: '1rem' }}>
                        {t.snippet_hook}
                    </p>

                    <SearchableChart initialData={temperatureData} locale={locale} t={t} />

                    <div className="download-cta">
                        <div className="cta-icon">📄</div>
                        <div className="cta-text">
                            <h3>{t.download_h3}</h3>
                            <p>{t.download_p}</p>
                        </div>
                        <a href="/downloads/celsius-to-fahrenheit-chart.pdf" download className="download-btn">
                            {t.download_btn}
                        </a>
                    </div>

                    <div className="sr-only">
                        {t.sr_only_desc}
                    </div>

                    <table style={{ display: 'none' }} aria-hidden="true">
                        <thead>
                            <tr><th>{t.th_c}</th><th>{t.th_f}</th></tr>
                        </thead>
                        <tbody>
                            {temperatureData.filter(i => i.c % 10 === 0).map(item => (
                                <tr key={`hidden-${item.c}`}><td>{item.c}°C</td><td>{item.f}°F</td></tr>
                            ))}
                        </tbody>
                    </table>

                    <section className="article-content">
                        <h2>{t.section2_h2}</h2>
                        <p>
                            {t.section2_p}
                        </p>

                        <h3>{t.section2_h3_formula}</h3>
                        <p>
                            {t.section2_p_formula1}<Link href={getLocalizedLink('/c-to-f-calculator', locale)}>{t.section2_p_formula2}</Link>{t.section2_p_formula3}
                        </p>

                        <h3>{t.section2_h3_benchmarks}</h3>
                        <ul className="info-list">
                            <li><strong>{t.section2_abs_zero}</strong>: -273.15°C / -459.67°F</li>
                            <li><strong>{t.section2_water_freezes}</strong>: 0°C / 32°F</li>
                            <li><strong>{t.section2_human_body}</strong>: 37°C / 98.6°F</li>
                            <li><strong>{t.section2_water_boils}</strong>: 100°C / 212°F</li>
                        </ul>

                        <h2>{t.section3_h2}</h2>
                        <p>{t.section3_p}</p>
                        <ul className="info-list">
                            <li>{t.section3_use1}</li>
                            <li>{t.section3_use2}</li>
                            <li>{t.section3_use3}</li>
                            <li>{t.section3_use4}</li>
                        </ul>

                        <p style={{ marginTop: '2rem', fontStyle: 'italic', color: '#4a5568' }}>
                            {t.trust_signal}
                        </p>
                    </section>
                </main>

                <Footer />

                <style jsx>{`
                    .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
                    .hero-section { text-align: center; padding: 3rem 0; border-bottom: 1px solid #edf2f7; margin-bottom: 2rem; }
                    .kicker { color: #3182ce; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9rem; margin-bottom: 0.5rem; }
                    h1 { font-size: 2.5rem; color: #1a202c; margin-bottom: 1.5rem; }
                    .description-intro { font-size: 1.15rem; line-height: 1.8; color: #4a5568; max-width: 800px; margin: 0 auto; }

                    /* Download Section */
                    .download-cta { display: flex; align-items: center; gap: 2rem; background: #2d3748; color: #fff; padding: 2rem; border-radius: 16px; margin: 3rem 0; }
                    .cta-icon { font-size: 2.5rem; }
                    .cta-text h3 { margin: 0 0 0.5rem 0; color: #fff; }
                    .cta-text p { margin: 0; color: #cbd5e0; font-size: 0.95rem; }
                    .download-btn { background: #3182ce; color: #fff; padding: 0.75rem 1.5rem; border-radius: 8px; font-weight: 700; text-decoration: none; transition: background 0.2s; white-space: nowrap; }
                    .download-btn:hover { background: #2b6cb0; }

                    /* Article Content */
                    .article-content { padding: 3rem 0; border-top: 1px solid #edf2f7; }
                    h2 { font-size: 1.75rem; color: #1a202c; margin-bottom: 1.5rem; }
                    h3 { font-size: 1.3rem; color: #2d3748; margin-top: 2rem; margin-bottom: 1rem; }
                    p { font-size: 1.1rem; line-height: 1.75; color: #4a5568; margin-bottom: 1.5rem; }
                    .info-list { margin-bottom: 2rem; padding-left: 1.5rem; }
                    .info-list li { margin-bottom: 0.75rem; color: #4a5568; font-size: 1.05rem; }

                    @media (max-width: 768px) {
                        .download-cta { flex-direction: column; text-align: center; gap: 1rem; }
                        h1 { font-size: 1.8rem; }
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = '2026-01-12';

    // Load translations
    let t = {};
    try {
        const filePath = path.join(process.cwd(), 'locales', locale, 'celsius-to-fahrenheit-chart.json');
        if (fs.existsSync(filePath)) {
            t = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        } else {
            // Fallback to English
            const englishPath = path.join(process.cwd(), 'locales', 'en', 'celsius-to-fahrenheit-chart.json');
            t = JSON.parse(fs.readFileSync(englishPath, 'utf8'));
        }
    } catch (error) {
        console.error('Error loading translations:', error);
    }

    const temperatureData = [];
    for (let c = -50; c <= 150; c++) {
        const f = (c * 1.8) + 32;
        temperatureData.push({
            c,
            f: parseFloat(f.toFixed(1)),
            isTier1: [0, 4, 20, 37, 47, 75, 100].includes(c)
        });
    }

    return {
        props: {
            lastUpdatedIso,
            temperatureData,
            t,
        },
    };
};
