import React, { useState, useEffect, useCallback } from 'react';
import Head from 'next/head';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import { useTranslation } from '../utils/i18n';
import { celsiusToFahrenheit, formatTemperature } from '../utils/temperaturePageHelpers';

// 历史记录类型定义
interface ConversionHistoryItem {
    celsius: number;
    fahrenheit: string;
    timestamp: number;
}

import fs from 'fs';
import path from 'path';

interface HomeProps {
    dynamicRecentUpdates: Array<{ c: number; f: number; date: string; url: string }>;
}

export default function Home({ dynamicRecentUpdates = [] }: HomeProps) {
    const { t, locale } = useTranslation('home');

    // 转换器状态
    const [celsius, setCelsius] = useState<string>('');
    const [fahrenheit, setFahrenheit] = useState<string>('--');
    const [copySuccess, setCopySuccess] = useState(false);

    // 历史记录状态
    const [history, setHistory] = useState<ConversionHistoryItem[]>([]);

    // 初始化加载历史记录
    useEffect(() => {
        const savedHistory = localStorage.getItem('conversionHistory');
        if (savedHistory) {
            try {
                setHistory(JSON.parse(savedHistory));
            } catch (e) {
                console.error('Failed to parse history', e);
            }
        }
    }, []);

    // 更新历史记录
    const addToHistory = useCallback((c: number, f: string) => {
        setHistory(prev => {
            if (prev.length > 0 && prev[0].celsius === c) {
                return prev;
            }
            const newItem = { celsius: c, fahrenheit: f, timestamp: Date.now() };
            const newHistory = [newItem, ...prev].slice(0, 5);
            localStorage.setItem('conversionHistory', JSON.stringify(newHistory));
            return newHistory;
        });
    }, []);

    const clearHistory = useCallback(() => {
        setHistory([]);
        localStorage.removeItem('conversionHistory');
    }, []);

    const handleCelsiusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const val = e.target.value;
        setCelsius(val);

        if (val === '') {
            setFahrenheit('--');
            return;
        }

        const cVal = parseFloat(val);
        if (!isNaN(cVal)) {
            const fVal = celsiusToFahrenheit(cVal);
            const fStr = formatTemperature(fVal);
            setFahrenheit(fStr);
        } else {
            setFahrenheit('--');
        }
    }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            const cVal = parseFloat(celsius);
            if (!isNaN(cVal) && fahrenheit !== '--') {
                addToHistory(cVal, fahrenheit);
            }
        }, 1500);

        return () => clearTimeout(timer);
    }, [celsius, fahrenheit, addToHistory]);

    const handleCopy = useCallback(() => {
        if (fahrenheit !== '--') {
            navigator.clipboard.writeText(`${celsius}°C = ${fahrenheit}°F`);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    }, [celsius, fahrenheit]);


    // 使用动态获取的数据，如果未获取到则使用空数组 (SSR会填充它)
    const recentUpdates = dynamicRecentUpdates.length > 0 ? dynamicRecentUpdates : [
        // Fallback or empty if strictly dynamic
    ];

    return (
        <>
            <Head>
                <title>{t('meta.title')}</title>
                <meta name="description" content={t('meta.description')} />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Ctofconverter Team" />
                <meta name="robots" content="index, follow" />

                {/* SEO Multi-language Linking */}
                <link rel="canonical" href={`https://ctofconverter.com${locale === 'en' ? '/' : '/' + locale + '/'}`} />
                <link rel="alternate" hrefLang="x-default" href="https://ctofconverter.com/" />
                {['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'].map(l => (
                    <link
                        key={l}
                        rel="alternate"
                        hrefLang={l === 'zh' ? 'zh-CN' : (l === 'pt-br' ? 'pt-BR' : l)}
                        href={`https://ctofconverter.com${l === 'en' ? '' : '/' + l}/`}
                    />
                ))}

                <meta property="og:title" content={t('meta.ogTitle')} />
                <meta property="og:description" content={t('meta.ogDescription')} />
                <meta property="og:image" content="https://ctofconverter.com/converter.png" />
                <meta property="og:url" content="https://ctofconverter.com/" />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('meta.twitterTitle')} />
                <meta name="twitter:description" content={t('meta.twitterDescription')} />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#3498db" />
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "WebApplication",
                        "name": t('meta.title'),
                        "url": "https://ctofconverter.com/",
                        "description": t('meta.description'),
                        "applicationCategory": "UtilityApplication",
                        "operatingSystem": "All"
                    })
                }} />
            </Head>

            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'font-ar' : ''}>
                <a className="skip-link" href="#main-content">{t('common:footer.backToTop')}</a>

                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <Link href="/" aria-label={`${t('nav.home')} - Celsius to Fahrenheit Converter`}>
                                <span aria-hidden="true">C to F Converter</span>
                                <span className="sr-only">{t('meta.title')}</span>
                            </Link>
                        </div>
                        <h1>{t('header.title')}</h1>
                        <p className="tagline">{t('header.tagline')}</p>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation">
                        <ol className="breadcrumb">
                            <li><Link href="/">{t('breadcrumb.home')}</Link></li>
                            <li aria-current="page">{t('breadcrumb.current')}</li>
                        </ol>
                    </nav>

                    <section className="converter-tool">
                        <h2 className="converter-title">{t('converter.title')}</h2>
                        <p className="converter-description" dangerouslySetInnerHTML={{ __html: t('converter.description') }} />

                        <div className="converter-form">
                            <div className="input-group">
                                <div className="input-header">
                                    <label htmlFor="celsius">{t('converter.inputLabel')}</label>
                                    <button className="info-btn" title={t('converter.infoCelsius')}>ℹ️</button>
                                </div>
                                <input
                                    type="number" id="celsius" placeholder={t('converter.inputPlaceholder')}
                                    step="0.1" value={celsius} onChange={handleCelsiusChange}
                                />
                            </div>

                            <div className="result-container">
                                <div className="result-header">
                                    <label>{t('converter.resultLabel')}</label>
                                    <button className="info-btn" title={t('converter.infoFahrenheit')}>ℹ️</button>
                                </div>
                                <output className="result-value">{fahrenheit}</output>
                                <button className="btn" onClick={handleCopy}>
                                    {copySuccess ? t('converter.copied') : (
                                        <>
                                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"></path></svg>
                                            <span className="btn-text">{t('converter.copy')}</span>
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>

                        <section className="history-container">
                            <div className="history-header">
                                <h3>{t('history.title')}</h3>
                                {history.length > 0 && (
                                    <button className="clear-history" onClick={clearHistory}>{t('history.clearLabel')}</button>
                                )}
                            </div>
                            <ul className="history-list">
                                {history.length === 0 ? (
                                    <li className="history-empty">{t('history.empty')}</li>
                                ) : (
                                    history.map((item, idx) => (
                                        <li key={idx} onClick={() => { setCelsius(item.celsius.toString()); setFahrenheit(item.fahrenheit); }} className="history-item">
                                            {item.celsius}°C = {item.fahrenheit}°F
                                        </li>
                                    ))
                                )}
                            </ul>
                        </section>

                        <section className="formula-section">
                            <h2>{t('formula.title')}</h2>
                            <div className="formula">
                                <h3>{t('formula.subtitle')}</h3>
                                <div className="formula-box">{t('formula.box')}</div>
                                <p className="example">{t('formula.example')}</p>
                            </div>
                        </section>

                        <div className="conversion-steps">
                            <h3>{t('steps.title')}</h3>
                            <p className="converter-description">{t('steps.description')}</p>
                            {(Array.isArray(t('steps.items')) ? t('steps.items') : []).map((step: { title: string; description: string }, idx: number) => (
                                <div className="step" key={idx}>
                                    <div className="step-number">{idx + 1}</div>
                                    <div className="step-content">
                                        <h4 className="step-title">{step.title}</h4>
                                        <div className="step-description">{step.description}</div>
                                    </div>
                                </div>
                            ))}

                            <div className="common-errors">
                                <h4>{t('commonMistakes.title')}</h4>
                                <ul>
                                    {(Array.isArray(t('commonMistakes.items')) ? t('commonMistakes.items') : []).map((item: string, idx: number) => (
                                        <li key={idx} dangerouslySetInnerHTML={{ __html: item }} />
                                    ))}
                                </ul>
                            </div>
                        </div>
                    </section>

                    <section className="reference-section">
                        <h2>{t('reference.title')}</h2>
                        <div className="update-grid">
                            {recentUpdates.map((item, i) => (
                                <article className="update-card" key={i}>
                                    <p>
                                        <Link href={item.url} className="update-title" title={`${item.c}°C to ${item.f}°F`}>
                                            {t('common:nav.seoLinkText', { celsius: item.c, fahrenheit: item.f })}
                                        </Link>
                                    </p>
                                    <time>{t('reference.updatedLabel')} {new Date(item.date).toLocaleDateString(locale)}</time>
                                </article>
                            ))}
                        </div>

                        <a href="/downloads/celsius-to-fahrenheit-chart.pdf" className="pdf-download-btn">
                            <span className="btn-icon">📄</span>
                            <span className="btn-text">{t('reference.downloadButton.text')}</span>
                        </a>

                        <div className="info-cards">
                            <div className="info-card">
                                <h3>{t('reference.infoCard.title')}</h3>
                                {(Array.isArray(t('reference.infoCard.paragraphs')) ? t('reference.infoCard.paragraphs') : []).map((p: string, i: number) => (
                                    <p key={i} dangerouslySetInnerHTML={{ __html: p }} />
                                ))}
                            </div>
                        </div>
                    </section>

                    <section className="formula-section">
                        <h2>{t('practical.title')}</h2>
                        <div className="practical-uses">
                            {(Array.isArray(t('practical.items')) ? t('practical.items') : []).map((item: { title: string; description: string; bullets: string[] }, i: number) => (
                                <div className="use-case" key={i}>
                                    <div className="use-case-header">{item.title}</div>
                                    <div className="use-case-body">
                                        <p>{item.description}</p>
                                        <ul className="use-case-examples">
                                            {item.bullets.map((b: string, j: number) => (
                                                <li key={j} dangerouslySetInnerHTML={{ __html: b }} />
                                            ))}
                                        </ul>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>

                    <section className="faq-section">
                        <h2>{t('faq.title')}</h2>
                        {(Array.isArray(t('faq.items')) ? t('faq.items') : []).map((item: { question: string; answer: string }, i: number) => (
                            <div className="faq-item" key={i}>
                                <div className="faq-question">{item.question}</div>
                                <div className="faq-answer">{item.answer}</div>
                            </div>
                        ))}
                    </section>
                </main>

                <Footer />

            </div>

            <style jsx>{`
        .language-switcher { display: flex; align-items: center; }
        .language-select { background: transparent; border: 1px solid rgba(255,255,255,.6); border-radius: 6px; color: white; padding: .25rem .75rem; font-size: .9rem; cursor: pointer; }
        .language-select:focus { outline: none; border-color: #fff; box-shadow: 0 0 0 2px rgba(255,255,255,.3); }
        .language-select option { color: #333; }
        .skip-link { position: absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0,0,0,0); border:0; }
        .skip-link:focus { top:0; left:0; width:auto; height:auto; clip:auto; background:#fff; z-index:9999; padding:10px; }
        .update-title { color: inherit; text-decoration: none; }
        .update-title:hover { text-decoration: underline; }
        .history-item { cursor: pointer; }
        @media (max-width: 768px) { .language-switcher { margin-top: 10px; } }
      `}</style>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    // 动态扫描pages目录下的温度转换页面
    const pagesDir = path.join(process.cwd(), 'pages');
    const filenames = fs.readdirSync(pagesDir);

    const dynamicRecentUpdates = filenames
        .filter(name => name.match(/^(-?\d+)-c-to-f\.tsx$/))
        .map(name => {
            const match = name.match(/^(-?\d+)-c-to-f\.tsx$/);
            const c = parseInt(match![1], 10);
            const f = celsiusToFahrenheit(c);
            const filePath = path.join(pagesDir, name);
            const stats = fs.statSync(filePath);

            return {
                c,
                f: parseFloat(formatTemperature(f)),
                date: stats.mtime.toISOString().split('T')[0], // 使用最后修改时间，或者这里也可以用固定的逻辑
                url: `/${name.replace('.tsx', '')}`
            };
        })
        .sort((a, b) => b.date.localeCompare(a.date));
    // 核心逻辑：按修改时间倒序排列，模拟“最近更新”

    return {
        props: {
            locale,
            dynamicRecentUpdates
        }
    };
};
