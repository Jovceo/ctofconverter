import React from 'react';
import Head from 'next/head';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Link from 'next/link';
import { useTranslation } from '../utils/i18n';
import { useRouter } from 'next/router';
import dynamic from 'next/dynamic';

const HotOrColdEngine = dynamic(() => import('../components/Game/HotOrColdEngine'), {
    loading: () => <div style={{ padding: '2rem', textAlign: 'center' }}>Loading Game...</div>,
    ssr: false
});

export default function TemperatureConversionChallenge() {
    const { t } = useTranslation('game');
    const router = useRouter();
    const { locale } = router;

    // Default to 'en' if locale is undefined, but for canonical we want to be explicit
    // If locale is 'en', canonical should be root. If 'zh', then /zh/...
    const canonicalLocale = locale === 'en' ? '' : `/${locale}`;
    const canonicalUrl = `https://ctofconverter.com${canonicalLocale}/temperature-conversion-challenge`;

    const meta = {
        title: t('meta.title'),
        description: t('meta.description'),
        ogTitle: t('meta.ogTitle'),
        ogDescription: t('meta.ogDescription'),
        canonical: canonicalUrl
    };

    const gameSchema = {
        "@context": "https://schema.org",
        "@type": "Game",
        "name": t('gameSchema.name'),
        "description": t('gameSchema.description'),
        "url": canonicalUrl,
        "genre": [t('gameSchema.genre.educational'), t('gameSchema.genre.quiz'), t('gameSchema.genre.arcade')],
        "audience": {
            "@type": "PeopleAudience",
            "suggestedMinAge": "10"
        },
        "numberOfPlayers": {
            "@type": "QuantitativeValue",
            "value": 1
        }
    };

    const faqSchema = {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
            {
                "@type": "Question",
                "name": t('faq.howToPlay.question'),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('faq.howToPlay.answer')
                }
            },
            {
                "@type": "Question",
                "name": t('faq.ovenSettings.question'),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('faq.ovenSettings.answer')
                }
            },
            {
                "@type": "Question",
                "name": t('faq.gasMarks.question'),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('faq.gasMarks.answer')
                }
            },
            {
                "@type": "Question",
                "name": t('faq.exact.question'),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('faq.exact.answer')
                }
            },
            {
                "@type": "Question",
                "name": t('faq.logic.question'),
                "acceptedAnswer": {
                    "@type": "Answer",
                    "text": t('faq.logic.answer')
                }
            }
        ]
    };

    const breadcrumbSchema = {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
            {
                "@type": "ListItem",
                "position": 1,
                "name": t('links.home'),
                "item": "https://ctofconverter.com/"
            },
            {
                "@type": "ListItem",
                "position": 2,
                "name": t('links.challenge'),
                "item": "https://ctofconverter.com/temperature-conversion-challenge"
            }
        ]
    };

    return (
        <Layout seo={meta}>
            <Head>
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(gameSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
                />
                <script
                    type="application/ld+json"
                    dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
                />
            </Head>
            <Header />
            <Navigation />

            <main className="container" id="main-content" style={{ paddingBottom: '4rem' }}>

                {/* Breadcrumb */}
                <nav aria-label="Breadcrumb navigation" className="breadcrumb" style={{ margin: '1rem 0' }}>
                    <Link href="/">{t('links.home')}</Link>
                    <span aria-hidden="true"> › </span>
                    <span aria-current="page">{t('links.challenge')}</span>
                </nav>

                <section style={{ textAlign: 'center', marginBottom: '3rem', marginTop: '1rem' }}>
                    <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', color: '#1e293b' }}>
                        {t('hero.title')}
                    </h1>
                    <p style={{ fontSize: '1.2rem', color: '#64748b', maxWidth: '700px', margin: '0 auto' }}>
                        {t('hero.subtitle')}
                    </p>
                </section>

                <section id="game-area">
                    <HotOrColdEngine />
                </section>

                {/* How to Play Section */}
                <section style={{ marginTop: '4rem', padding: '2rem', background: '#fff', borderRadius: '12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
                    <h2 style={{ textAlign: 'center', color: '#334155', marginBottom: '2rem' }}>{t('howTo.title')}</h2>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem', textAlign: 'center' }}>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⏱️</div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('howTo.sixtySeconds')}</h3>
                            <p style={{ color: '#64748b' }}>{t('howTo.sixtySecondsDesc')}</p>
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>⚖️</div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('howTo.compare')}</h3>
                            <p style={{ color: '#64748b' }} dangerouslySetInnerHTML={{ __html: t('howTo.compareDesc') }} />
                        </div>
                        <div>
                            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>👆</div>
                            <h3 style={{ fontSize: '1.2rem', marginBottom: '0.5rem' }}>{t('howTo.decide')}</h3>
                            <p style={{ color: '#64748b' }} dangerouslySetInnerHTML={{ __html: t('howTo.decideDesc') }} />
                        </div>
                    </div>
                </section>

                {/* Educational Section */}
                <section style={{ marginTop: '3rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '3rem' }}>
                    <div style={{ padding: '2rem', background: '#f0f9ff', borderRadius: '12px', borderLeft: '5px solid #0ea5e9' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#0369a1' }}>{t('educational.title')}</h2>
                        <p style={{ color: '#334155', lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: t('educational.text') }} />
                        <ul style={{ marginTop: '1rem', paddingLeft: '1.5rem', color: '#334155' }}>
                            <li style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: t('educational.points.simmering') }} />
                            <li style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: t('educational.points.lowBake') }} />
                            <li style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: t('educational.points.standardBake') }} />
                            <li style={{ marginBottom: '0.5rem' }} dangerouslySetInnerHTML={{ __html: t('educational.points.roasting') }} />
                        </ul>
                    </div>

                    <div style={{ padding: '2rem', background: '#fff7ed', borderRadius: '12px', borderLeft: '5px solid #f97316' }}>
                        <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem', color: '#c2410c' }}>{t('faq.title')}</h2>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#9a3412' }}>{t('faq.gasMarks.question')}</h3>
                            <p style={{ color: '#334155' }}>{t('faq.gasMarks.answer')}</p>
                        </div>
                        <div style={{ marginBottom: '1.5rem' }}>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#9a3412' }}>{t('faq.exact.question')}</h3>
                            <p style={{ color: '#334155' }}>{t('faq.exact.answer')}</p>
                        </div>
                        <div>
                            <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '0.5rem', color: '#9a3412' }}>{t('faq.logic.question')}</h3>
                            <div style={{ background: '#fff', padding: '1rem', borderRadius: '8px', border: '1px solid #fed7aa', fontSize: '0.95rem' }}>
                                <p style={{ color: '#334155', marginBottom: '0.5rem' }}>{t('faq.logic.answer')}</p>
                                <div style={{ display: 'flex', gap: '1rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                                    <span style={{ padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.85rem' }}>200°C vs 400°F? 🔥 400°F (Hoher)</span>
                                    <span style={{ padding: '2px 8px', background: '#e0f2fe', color: '#0369a1', borderRadius: '4px', fontSize: '0.85rem' }}>Gas 6 vs 350°F? 🔥 Gas 6 (Hotter)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Cheat Sheet Section */}
                <section style={{ marginTop: '3rem', padding: '2rem', background: '#f8fafc', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
                    <h2 style={{ textAlign: 'center', color: '#334155', marginBottom: '2rem' }}>{t('cheatSheet.title')}</h2>
                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.95rem' }}>
                            <caption className="sr-only">{t('cheatSheet.caption')}</caption>
                            <thead>
                                <tr style={{ background: '#e2e8f0', color: '#475569' }}>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('cheatSheet.headers.gasMark')}</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('cheatSheet.headers.fahrenheit')}</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('cheatSheet.headers.celsius')}</th>
                                    <th style={{ padding: '0.75rem', textAlign: 'left' }}>{t('cheatSheet.headers.description')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 1/4</td>
                                    <td style={{ padding: '0.75rem' }}>225°F</td>
                                    <td style={{ padding: '0.75rem' }}>110°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.verySlow')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 1</td>
                                    <td style={{ padding: '0.75rem' }}>275°F</td>
                                    <td style={{ padding: '0.75rem' }}>140°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.slow')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 3</td>
                                    <td style={{ padding: '0.75rem' }}>325°F</td>
                                    <td style={{ padding: '0.75rem' }}>160°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.moderate')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#ecfdf5', borderLeft: '4px solid #10b981' }}>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>Gas 4</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>350°F</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>180°C</td>
                                    <td style={{ padding: '0.75rem', fontWeight: 'bold' }}>{t('cheatSheet.rows.moderateBaking')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 5</td>
                                    <td style={{ padding: '0.75rem' }}>375°F</td>
                                    <td style={{ padding: '0.75rem' }}>190°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.modHot')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#f8fafc' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 6</td>
                                    <td style={{ padding: '0.75rem' }}>400°F</td>
                                    <td style={{ padding: '0.75rem' }}>200°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.hot')}</td>
                                </tr>
                                <tr style={{ borderBottom: '1px solid #cbd5e1', background: '#fff' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 7</td>
                                    <td style={{ padding: '0.75rem' }}>425°F</td>
                                    <td style={{ padding: '0.75rem' }}>220°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.hotRoast')}</td>
                                </tr>
                                <tr style={{ background: '#f8fafc' }}>
                                    <td style={{ padding: '0.75rem' }}>Gas 9</td>
                                    <td style={{ padding: '0.75rem' }}>475°F</td>
                                    <td style={{ padding: '0.75rem' }}>240°C</td>
                                    <td style={{ padding: '0.75rem' }}>{t('cheatSheet.rows.veryHot')}</td>
                                </tr>
                            </tbody>
                        </table>
                        <p style={{ marginTop: '1rem', fontSize: '0.9rem', color: '#64748b', fontStyle: 'italic' }}>
                            {t('cheatSheet.note')}
                        </p>
                    </div>
                </section>

                <section style={{ marginTop: '4rem', textAlign: 'center' }}>
                    <p style={{ marginBottom: '1rem', color: '#64748b' }}>{t('links.needReference')}</p>
                    <Link href="/fan-oven-conversion-chart" style={{ textDecoration: 'none', color: '#3b82f6', fontWeight: 'bold' }}>
                        {t('links.conversionChart')}
                    </Link>
                </section>

            </main>

            <Footer />
        </Layout>
    );
}
