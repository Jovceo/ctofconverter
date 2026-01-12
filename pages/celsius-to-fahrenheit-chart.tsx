import React, { useState, useMemo } from 'react';
import { GetStaticProps } from 'next';
import Link from 'next/link';
import { useRouter } from 'next/router';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { getLocalizedLink } from '../utils/i18n';

interface ChartPageProps {
    lastUpdatedIso: string;
}

export default function TemperatureChartPage({ lastUpdatedIso }: ChartPageProps) {
    const router = useRouter();
    const { locale = 'en' } = router;
    const [searchQuery, setSearchQuery] = useState('');

    // Generate full dataset from -50 to 150
    const temperatureData = useMemo(() => {
        const data = [];
        for (let c = -50; c <= 150; c++) {
            const f = (c * 1.8) + 32;
            data.push({
                c,
                f: parseFloat(f.toFixed(1)),
                isTier1: [0, 10, 20, 30, 37, 100].includes(c)
            });
        }
        return data;
    }, []);

    // Filtered data based on search
    const filteredData = useMemo(() => {
        if (!searchQuery) return temperatureData;
        const query = searchQuery.toLowerCase();
        return temperatureData.filter(item =>
            item.c.toString().includes(query) ||
            item.f.toString().includes(query)
        );
    }, [searchQuery, temperatureData]);

    return (
        <Layout
            seo={{
                title: "Celsius to Fahrenheit Conversion Chart | Complete Temperature Guide",
                description: "Complete Celsius to Fahrenheit conversion chart (-50°C to 150°C). Free searchable temperature guide with accurate formulas and PDF download.",
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
                                "@id": "https://ctofconverter.com/celsius-to-fahrenheit-chart",
                                "url": "https://ctofconverter.com/celsius-to-fahrenheit-chart",
                                "name": "Celsius to Fahrenheit Conversion Chart | Complete Temperature Guide",
                                "description": "Complete Celsius to Fahrenheit conversion chart (-50°C to 150°C). Free searchable temperature guide with accurate formulas and PDF download.",
                                "dateModified": lastUpdatedIso,
                                "mainEntityOfPage": {
                                    "@type": "WebPage",
                                    "@id": "https://ctofconverter.com/celsius-to-fahrenheit-chart"
                                }
                            },
                            {
                                "@type": "FAQPage",
                                "mainEntity": [
                                    {
                                        "@type": "Question",
                                        "name": "How do I read a temperature conversion chart?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Simply find your known Celsius value in the left column, and the corresponding Fahrenheit value will be in the right column. Use our search tool above for instant lookup."
                                        }
                                    },
                                    {
                                        "@type": "Question",
                                        "name": "Why are conversion charts useful?",
                                        "acceptedAnswer": {
                                            "@type": "Answer",
                                            "text": "Charts provide a quick visual reference for multiple temperatures simultaneously, which is ideal for cooking, weather tracking, and scientific documentation without needing a calculator for every step."
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
                                        "name": "Home",
                                        "item": "https://ctofconverter.com/"
                                    },
                                    {
                                        "@type": "ListItem",
                                        "position": 2,
                                        "name": "Conversion Chart",
                                        "item": "https://ctofconverter.com/celsius-to-fahrenheit-chart"
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
                            <Link href={getLocalizedLink('/', locale)} aria-label="Home - Celsius to Fahrenheit Converter">
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
                            <li><Link href={getLocalizedLink('/', locale)}>Home</Link></li>
                            <li aria-current="page">Conversion Chart</li>
                        </ol>
                    </nav>

                    <section className="hero-section">
                        <div className="kicker">Full Range Reference</div>
                        <h1>Celsius to Fahrenheit Conversion Chart</h1>
                        <p className="description-intro">
                            Access our <strong>complete Celsius to Fahrenheit conversion chart</strong> covering temperatures from -50°C to 150°C. This professional reference tool is essential for international travel, scientific research, and global cooking standards.
                        </p>
                    </section>

                    <section className="article-content">
                        <h2>Understanding Celsius and Fahrenheit</h2>
                        <p>
                            <strong>Celsius (°C):</strong> The Celsius scale is the global standard for weather, cooking, and science. It defines the freezing point of water at <strong>0°C</strong> and the boiling point at <strong>100°C</strong>.
                        </p>
                        <p>
                            <strong>Fahrenheit (°F):</strong> Primarily used in the United States, the Fahrenheit scale sets the freezing point of water at <strong>32°F</strong> and the boiling point at <strong>212°F</strong>.
                        </p>
                    </section>

                    <div className="interactive-container">
                        <div className="search-bar">
                            <input
                                type="text"
                                placeholder="Search temperature (e.g. 37 or 100)..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <div className="search-icon">🔍</div>
                        </div>

                        <div className="chart-wrapper">
                            <table className="premium-chart">
                                <thead>
                                    <tr>
                                        <th>Celsius (°C)</th>
                                        <th>Fahrenheit (°F)</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredData.map(item => (
                                        <tr key={item.c} className={item.isTier1 ? 'highlight-row' : ''}>
                                            <td>
                                                {item.isTier1 ? (
                                                    <Link href={getLocalizedLink(`/${item.c}-c-to-f`, locale)}>
                                                        {item.c}°C
                                                    </Link>
                                                ) : `${item.c}°C`}
                                            </td>
                                            <td>{item.f}°F</td>
                                            <td className="status-label">
                                                {item.c === 0 && 'Freezing Point'}
                                                {item.c === 20 && 'Room Temp'}
                                                {item.c === 37 && 'Body Temp'}
                                                {item.c === 100 && 'Boiling Point'}
                                                {item.c < 0 && 'Below Freezing'}
                                                {item.c > 40 && item.c <= 100 && 'Industrial/Cooking'}
                                                {(item.c > 20 && item.c < 37) && 'Warm'}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                            {filteredData.length === 0 && (
                                <div className="no-results">No temperatures found matching your search.</div>
                            )}
                        </div>
                    </div>

                    <div className="download-cta">
                        <div className="cta-icon">📄</div>
                        <div className="cta-text">
                            <h3>Need an offline version?</h3>
                            <p>Download our professional high-resolution PDF chart for your kitchen, lab, or office reference.</p>
                        </div>
                        <a href="/downloads/celsius-to-fahrenheit-chart.pdf" download className="download-btn">
                            Download PDF Chart
                        </a>
                    </div>

                    <div className="sr-only">
                        This table lists Celsius to Fahrenheit conversions. For example, 0 degrees Celsius is 32 degrees Fahrenheit, and 100 degrees Celsius is 212 degrees Fahrenheit. Use the search box above to filter values.
                    </div>

                    <table style={{ display: 'none' }} aria-hidden="true">
                        <thead>
                            <tr><th>Celsius (°C)</th><th>Fahrenheit (°F)</th></tr>
                        </thead>
                        <tbody>
                            {temperatureData.filter(i => i.c % 10 === 0).map(item => (
                                <tr key={`hidden-${item.c}`}><td>{item.c}</td><td>{item.f}</td></tr>
                            ))}
                        </tbody>
                    </table>

                    <section className="article-content">
                        <h2>How the Temperature Chart Works</h2>
                        <p>
                            A <strong>temperature conversion chart</strong> provides a mapping between the metric Celsius scale (widely used globally) and the Fahrenheit scale (primarily used in the United States). By using a curated dataset, we've eliminated the need for manual calculations for common reference points.
                        </p>

                        <h3>The Formula Behind the Chart</h3>
                        <p>
                            Every value in this table is derived using the official conversion formula: <strong>°F = (°C × 1.8) + 32</strong>. For those who prefer direct tools, our <Link href={getLocalizedLink('/c-to-f-calculator', locale)}>Celsius to Fahrenheit Calculator</Link> provides real-time precision for any decimal value.
                        </p>

                        <h3>Key Benchmarks</h3>
                        <ul className="info-list">
                            <li><strong>Absolute Zero</strong>: -273.15°C / -459.67°F</li>
                            <li><strong>Water Freezes</strong>: 0°C / 32°F</li>
                            <li><strong>Human Body</strong>: 37°C / 98.6°F</li>
                            <li><strong>Water Boils</strong>: 100°C / 212°F</li>
                        </ul>

                        <h2>Practical Uses of Temperature Conversions</h2>
                        <p>Temperature conversions are essential in several everyday scenarios:</p>
                        <ul className="info-list">
                            <li><strong>Weather Forecasting</strong>: Interpreting international weather reports.</li>
                            <li><strong>Health Monitoring</strong>: Detecting fevers using clinical thermometers.</li>
                            <li><strong>Culinary Arts</strong>: Converting oven settings for international recipes.</li>
                            <li><strong>Education & Science</strong>: Standardizing data across different units of measurement.</li>
                        </ul>
                    </section>
                </main>

                <Footer />

                <style jsx>{`
                    .container { max-width: 1000px; margin: 0 auto; padding: 0 1.5rem; }
                    .hero-section { text-align: center; padding: 3rem 0; border-bottom: 1px solid #edf2f7; margin-bottom: 2rem; }
                    .kicker { color: #3182ce; font-weight: 700; text-transform: uppercase; letter-spacing: 0.1em; font-size: 0.9rem; margin-bottom: 0.5rem; }
                    h1 { font-size: 2.5rem; color: #1a202c; margin-bottom: 1.5rem; }
                    .description-intro { font-size: 1.15rem; line-height: 1.8; color: #4a5568; max-width: 800px; margin: 0 auto; }

                    /* Search Bar */
                    .interactive-container { margin-bottom: 3rem; }
                    .search-bar { position: relative; max-width: 600px; margin: 2rem auto; }
                    .search-bar input { width: 100%; padding: 1rem 1rem 1rem 3rem; font-size: 1.1rem; border: 2px solid #e2e8f0; border-radius: 12px; transition: all 0.2s; box-shadow: 0 4px 6px rgba(0,0,0,0.02); }
                    .search-bar input:focus { outline: none; border-color: #3182ce; box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.15); }
                    .search-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); font-size: 1.2rem; }

                    /* Chart Table */
                    .chart-wrapper { background: #fff; border-radius: 16px; border: 1px solid #e2e8f0; overflow: hidden; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.05); }
                    .premium-chart { width: 100%; border-collapse: collapse; text-align: left; }
                    .premium-chart th { background: #f7fafc; padding: 1rem 1.5rem; color: #718096; text-transform: uppercase; font-size: 0.8rem; letter-spacing: 0.05em; border-bottom: 2px solid #edf2f7; }
                    .premium-chart td { padding: 0.75rem 1.5rem; border-bottom: 1px solid #f1f5f9; color: #2d3748; transition: background 0.1s; }
                    .premium-chart tr:hover td { background: #f8fafc; }
                    .highlight-row td { background: #ebf8ff; font-weight: 600; color: #2b6cb0; }
                    .highlight-row td a { color: #2b6cb0; text-decoration: underline; }
                    .status-label { font-size: 0.85rem; color: #a0aec0; font-style: italic; }

                    .no-results { padding: 3rem; text-align: center; color: #718096; font-style: italic; }

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
                        .premium-chart td, .premium-chart th { padding: 0.75rem 1rem; }
                        .status-label { display: none; }
                    }
                `}</style>
            </div>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async () => {
    const lastUpdatedIso = '2026-01-12';
    return {
        props: {
            lastUpdatedIso,
        },
    };
};
