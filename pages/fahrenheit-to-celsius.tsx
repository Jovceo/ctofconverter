import React, { useState, useMemo, useCallback } from 'react';
import Head from 'next/head';
import { GetStaticProps } from 'next';
import Footer from '../components/Footer';
import Navigation from '../components/Navigation';
import Analytics from '../components/Analytics';

// 导入 F→C 转换工具函数
import {
    fahrenheitToCelsius,
    formatTemperature,
    getCommonTemperatureReferences,
    validateFahrenheitInput,
    generateConversionSteps,
} from '../utils/fahrenheitHelpers';

// 导入现有工具函数
import { generateBreadcrumbStructuredData } from '../utils/temperaturePageHelpers';
import { useTranslation, getLocalizedLink, SUPPORTED_LOCALES, HREFLANG_MAP } from '../utils/i18n';

/**
 * 华氏度转换器组件
 */
const FahrenheitConverter: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const [fahrenheit, setFahrenheit] = useState('');
    const [celsius, setCelsius] = useState<string | null>(null);
    const [copySuccess, setCopySuccess] = useState(false);
    const [error, setError] = useState<string>('');

    const handleFahrenheitChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setFahrenheit(value);
        setError('');

        if (!value) {
            setCelsius(null);
            return;
        }

        const validation = validateFahrenheitInput(value);
        if (!validation.isValid) {
            setError(validation.message || '');
            setCelsius(null);
        } else if (validation.value !== undefined) {
            const c = fahrenheitToCelsius(validation.value);
            setCelsius(formatTemperature(c));
        }
    }, []);

    const handleCopy = useCallback(() => {
        if (celsius && fahrenheit) {
            navigator.clipboard.writeText(`${fahrenheit}°F = ${celsius}°C`);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 2000);
        }
    }, [celsius, fahrenheit]);

    return (
        <div className="converter-form">
            <div className="input-group">
                <div className="input-header">
                    <label htmlFor="fahrenheit-input">{t('converter.inputLabel')}</label>
                    <button className="info-btn" title={t('converter.inputTooltip')}>ℹ️</button>
                </div>
                <input
                    id="fahrenheit-input"
                    type="number"
                    value={fahrenheit}
                    onChange={handleFahrenheitChange}
                    placeholder={t('converter.inputPlaceholder')}
                    step="0.1"
                />
            </div>

            <div className="result-container">
                <div className="result-header">
                    <label>{t('converter.outputLabel')}</label>
                    <button className="info-btn" title={t('converter.outputTooltip')}>ℹ️</button>
                </div>
                <output className="result-value">{celsius ? `${celsius}°C` : '--'}</output>
                <button className="btn" onClick={handleCopy} disabled={!celsius}>
                    {copySuccess ? t('converter.copied') : t('converter.copyButton')}
                </button>
            </div>

            {error && <div className="validation-message" style={{ color: '#e74c3c', marginTop: '10px' }}>{error}</div>}
        </div>
    );
};

/**
 * 转换表格组件
 */
const FtoCConversionTable: React.FC<{ t: (key: string) => string }> = ({ t }) => {
    const references = useMemo(() => getCommonTemperatureReferences(), []);

    return (
        <section className="conversion-table">
            <h2>{t('table.title')}</h2>
            <div className="table-wrapper comparison-table">
                <table className="temperature-table">
                    <caption>{t('table.caption')}</caption>
                    <thead>
                        <tr>
                            <th>{t('table.fahrenheitCol')}</th>
                            <th>{t('table.celsiusCol')}</th>
                            <th>{t('table.descriptionCol')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {references.map((ref, index) => (
                            <tr key={index}>
                                <td><strong>{formatTemperature(ref.fahrenheit)}°F</strong></td>
                                <td><strong>{formatTemperature(ref.celsius)}°C</strong></td>
                                <td>{t(`table.references.${ref.labelKey}`)}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </section>
    );
};

/**
 * 转换步骤说明组件
 */
const ConversionStepsGuide: React.FC<{ t: (key: string) => string; demoFahrenheit?: number }> = ({ t, demoFahrenheit = 68 }) => {
    const steps = useMemo(() => generateConversionSteps(demoFahrenheit), [demoFahrenheit]);

    return (
        <div className="conversion-steps">
            <h3>{t('steps.title')}</h3>
            <p className="converter-description">{t('steps.description')}</p>
            {steps.map((step) => (
                <div className="step" key={step.step}>
                    <div className="step-number">{step.step}</div>
                    <div className="step-content">
                        <h4 className="step-title">{t(`steps.step${step.step}.title`)}</h4>
                        <div className="step-description">{t(`steps.step${step.step}.description`)}</div>
                        <div className="step-visualization">{step.calculation}</div>
                    </div>
                </div>
            ))}

            <div className="common-errors">
                <h4>{t('steps.commonMistakes.title')}</h4>
                <ul>
                    <li><strong>{t('steps.commonMistakes.mistake1')}</strong> - <span>{t('steps.commonMistakes.mistake1Detail')}</span></li>
                    <li><strong>{t('steps.commonMistakes.mistake2')}</strong> - <span>{t('steps.commonMistakes.mistake2Detail')}</span></li>
                    <li><strong>{t('steps.commonMistakes.mistake3')}</strong> - <span>{t('steps.commonMistakes.mistake3Detail')}</span></li>
                    <li><strong>{t('steps.commonMistakes.mistake4')}</strong> - <span>{t('steps.commonMistakes.mistake4Detail')}</span></li>
                </ul>
            </div>
        </div>
    );
};

/**
 * FAQ 组件
 */
const FAQSection: React.FC<{ t: (key: string, params?: any) => string }> = ({ t }) => {
    const faqs = useMemo(() => {
        const rawFaqs = t('faq.questions', { returnObjects: true });
        return Array.isArray(rawFaqs) ? rawFaqs : [];
    }, [t]);

    return (
        <section className="faq-section">
            <h2>{t('faq.title')}</h2>
            {faqs.map((faq: any, index: number) => (
                <div className="faq-item" key={index}>
                    <div className="faq-question">{faq.question}</div>
                    <div className="faq-answer">{faq.answer}</div>
                </div>
            ))}
        </section>
    );
};

/**
 * 主页面组件
 */
interface FahrenheitToCelsiusPageProps {
    canonicalUrl: string;
    lastUpdated: string;
}

export default function FahrenheitToCelsiusPage({ canonicalUrl, lastUpdated }: FahrenheitToCelsiusPageProps) {
    const { t, locale } = useTranslation('f-to-c');

    //生成结构化数据
    const webAppData = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'WebApplication',
        name: t('meta.title'),
        url: canonicalUrl,
        description: t('meta.description'),
        applicationCategory: 'UtilityApplication',
        operatingSystem: 'All',
        browserRequirements: 'Requires JavaScript',
        offers: {
            '@type': 'Offer',
            price: '0',
            priceCurrency: 'USD'
        }
    }), [t, canonicalUrl]);

    const faqData = useMemo(() => {
        const faqs = t('faq.questions', { returnObjects: true } as any);
        const faqArray = Array.isArray(faqs) ? faqs : [];

        return {
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: faqArray.map((faq: any) => ({
                '@type': 'Question',
                name: faq.question,
                acceptedAnswer: { '@type': 'Answer', text: faq.answer }
            }))
        };
    }, [t]);

    const breadcrumbData = useMemo(() => ({
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: [
            {
                '@type': 'ListItem',
                position: 1,
                name: t('breadcrumb.home'),
                item: 'https://ctofconverter.com'
            },
            {
                '@type': 'ListItem',
                position: 2,
                name: t('breadcrumb.current'),
                item: canonicalUrl
            }
        ]
    }), [t, canonicalUrl]);

    return (
        <>
            <Head>
                <title>{t('meta.title')}</title>
                <meta name="description" content={t('meta.description')} />
                <meta name="viewport" content="width=device-width, initial-scale=1.0" />
                <meta name="author" content="Ctofconverter Team" />
                <meta name="robots" content="index, follow" />
                <link rel="canonical" href={canonicalUrl} />

                {/* hreflang 标签 */}
                <link rel="alternate" hrefLang="x-default" href="https://ctofconverter.com/fahrenheit-to-celsius" />
                {SUPPORTED_LOCALES.map((loc) => {
                    const hreflang = loc === 'zh' ? 'zh-CN' : (HREFLANG_MAP[loc] || loc);
                    return (
                        <link key={loc} rel="alternate" hrefLang={hreflang}
                            href={`https://ctofconverter.com${getLocalizedLink('/fahrenheit-to-celsius', loc)}`}
                        />
                    );
                })}

                {/* Open Graph */}
                <meta property="og:title" content={t('meta.ogTitle')} />
                <meta property="og:description" content={t('meta.ogDescription')} />
                <meta property="og:image" content="https://ctofconverter.com/converter.png" />
                <meta property="og:url" content={canonicalUrl} />
                <meta property="og:type" content="website" />
                <meta name="twitter:card" content="summary_large_image" />
                <meta name="twitter:title" content={t('meta.ogTitle')} />
                <meta name="twitter:description" content={t('meta.ogDescription')} />
                <meta name="apple-mobile-web-app-capable" content="yes" />
                <meta name="theme-color" content="#3498db" />

                {/* 结构化数据 */}
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppData) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqData) }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbData) }} />
            </Head>

            <Analytics />

            <div dir={locale === 'ar' ? 'rtl' : 'ltr'} className={locale === 'ar' ? 'font-ar' : ''}>
                <a className="skip-link" href="#main-content">Skip to main content</a>

                <header className="site-header">
                    <div className="container">
                        <div className="site-logo">
                            <a href={getLocalizedLink('/', locale)} aria-label={`${t('breadcrumb.home')} - ${t('meta.title')}`}>
                                <span aria-hidden="true">{t('header.siteName', { returnObjects: false } as any) || 'C to F Converter'}</span>
                                <span className="sr-only">{t('meta.title')}</span>
                            </a>
                        </div>
                        <h1>{t('header.title')}</h1>
                        <p className="tagline">{t('header.tagline')}</p>
                    </div>
                </header>

                <Navigation />

                <main id="main-content" className="container">
                    <nav aria-label="Breadcrumb navigation">
                        <ol className="breadcrumb">
                            <li><a href={getLocalizedLink('/', locale)}>{t('breadcrumb.home')}</a></li>
                            <li aria-current="page">{t('breadcrumb.current')}</li>
                        </ol>
                    </nav>

                    <section className="converter-tool">
                        <h2 className="converter-title">{t('converter.title')}</h2>
                        <p className="converter-description">{t('converter.description')}</p>
                        <FahrenheitConverter t={t} />
                    </section>

                    <section className="formula-section">
                        <h2>{t('formula.title')}</h2>
                        <div className="formula">
                            <h3>{t('formula.subtitle')}</h3>
                            <div className="formula-box">{t('formula.formula')}</div>
                            <p className="example">{t('formula.example')}</p>
                        </div>
                    </section>

                    <ConversionStepsGuide t={t} demoFahrenheit={68} />
                    <FtoCConversionTable t={t} />

                    <section className="formula-section">
                        <h2>{t('practical.title')}</h2>
                        <div className="practical-uses">
                            {(Array.isArray(t('practical.items', { returnObjects: true } as any)) ? t('practical.items', { returnObjects: true } as any) : []).map((item: any, i: number) => (
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

                    <FAQSection t={t} />
                </main>

                <Footer lastUpdated={lastUpdated} />
            </div>

            <style jsx>{`
                .skip-link {
                    position: absolute;
                    width: 1px;
                    height: 1px;
                    padding: 0;
                    margin: -1px;
                    overflow: hidden;
                    clip: rect(0, 0, 0, 0);
                    border: 0;
                }
                .skip-link:focus {
                    top: 0;
                    left: 0;
                    width: auto;
                    height: auto;
                    clip: auto;
                    background: #fff;
                    z-index: 9999;
                    padding: 10px;
                    color: #000;
                    text-decoration: none;
                }
            `}</style>
        </>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const { getLatestModifiedDate } = await import('../utils/dateHelpers');

    // 计算最后更新时间（与页面显示的时间完全一致）
    const lastUpdated = getLatestModifiedDate([
        'pages/fahrenheit-to-celsius.tsx',
        `locales/${locale}/f-to-c.json`,
        'components/Layout.tsx',
        `locales/${locale}/common.json`
    ]);

    const canonicalUrl = `https://ctofconverter.com${locale === 'en' ? '' : `/${locale}`}/fahrenheit-to-celsius`;
    return { props: { canonicalUrl, lastUpdated } };
};

