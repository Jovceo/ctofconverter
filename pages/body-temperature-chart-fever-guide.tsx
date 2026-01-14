import React, { useState, useEffect, useCallback, useMemo } from 'react';
import Head from 'next/head';
import Image from 'next/image';
import Link from 'next/link';
import { GetStaticProps } from 'next';
import Layout from '../components/Layout';
import Header from '../components/Header';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import { useTranslation, getLocalizedLink } from '../utils/i18n';
import { celsiusToFahrenheit, fahrenheitToCelsius, formatTemperature } from '../utils/temperaturePageHelpers';
import { getLatestModifiedDate } from '../utils/dateHelpers';
import styles from '../styles/BodyTemperatureGuide.module.css';

interface BodyTemperatureGuideProps {
    lastUpdatedIso: string;
}

export default function BodyTemperatureGuide({ lastUpdatedIso }: BodyTemperatureGuideProps) {
    const { t, locale } = useTranslation('body-temperature-chart-fever-guide');

    // Quick Converter State
    const [tempInput, setTempInput] = useState<string>('');
    const [unitFrom, setUnitFrom] = useState<'c' | 'f'>('c');
    const [conversionResult, setConversionResult] = useState<{ text: string, type: 'normal' | 'warning' | 'danger' | 'info' | '' }>({ text: '', type: '' });

    // Interactive Assessment State
    const [person, setPerson] = useState<'adult' | 'child' | 'infant'>('adult');
    const [sliderUnit, setSliderUnit] = useState<'c' | 'f'>('c');
    const [sliderValue, setSliderValue] = useState<number>(37);
    const [assessment, setAssessment] = useState<{ status: string, severity: string, advice: string, color: string }>({ status: '', severity: '', advice: '', color: '' });

    // --- Quick Converter Logic ---
    const handleConvert = useCallback(() => {
        const temp = parseFloat(tempInput);
        if (isNaN(temp)) {
            setConversionResult({ text: t('converter.error'), type: 'danger' });
            return;
        }

        let result: number;
        let text: string;
        let type: 'normal' | 'warning' | 'danger' | 'info' | '' = '';

        if (unitFrom === 'c') {
            result = celsiusToFahrenheit(temp);
            text = `${temp}°C = ${formatTemperature(result)}°F`;

            if (temp >= 38) {
                text += ` - ${t('converter.feverCriteria')}`;
                type = 'danger';
            } else if (temp >= 37.6) {
                text += ` - ${t('converter.elevatedCriteria')}`;
                type = 'warning';
            } else if (temp >= 36.5) {
                text += ` - ${t('converter.normalCriteria')}`;
                type = 'normal';
            } else {
                text += ` - ${t('converter.belowNormalCriteria')}`;
                type = 'info';
            }
        } else {
            result = fahrenheitToCelsius(temp);
            text = `${temp}°F = ${formatTemperature(result)}°C`;

            if (temp >= 100.4) {
                text += ` - ${t('converter.feverCriteria')}`;
                type = 'danger';
            } else if (temp >= 99.7) {
                text += ` - ${t('converter.elevatedCriteria')}`;
                type = 'warning';
            } else if (temp >= 97.7) {
                text += ` - ${t('converter.normalCriteria')}`;
                type = 'normal';
            } else {
                text += ` - ${t('converter.belowNormalCriteria')}`;
                type = 'info';
            }
        }
        setConversionResult({ text, type });
    }, [tempInput, unitFrom, t]);

    const handleQuickTemp = (temp: string) => {
        setTempInput(temp);
        // Note: handleConvert will use the old state if called immediately here
    };

    // Trigger conversion when quick temp is set
    useEffect(() => {
        if (tempInput !== '') {
            handleConvert();
        }
    }, [tempInput, handleConvert]);

    // --- Interactive Assessment Logic (Enhanced with Age-Aware Thresholds) ---
    const assessTemperature = useCallback(() => {
        let temp = sliderValue;

        // Convert to Celsius for logic
        if (sliderUnit === 'f') {
            temp = fahrenheitToCelsius(temp);
        }

        let status = "", advice = "", color = "#4CAF50", severity = "";

        if (person === 'infant') {
            // Infant specific logic (More strict)
            if (temp < 36.0) {
                status = t('assessment.statuses.hypothermia'); severity = t('assessment.severities.highDanger'); color = "#2c7fb8";
                advice = t('assessment.advice.infant.hypo');
            } else if (temp < 37.6) {
                status = t('assessment.statuses.normal'); severity = t('assessment.severities.normal'); color = "#4CAF50";
                advice = t('assessment.advice.infant.normal');
            } else if (temp < 38.0) {
                status = t('assessment.statuses.elevated'); severity = t('assessment.severities.warning'); color = "#FF9800";
                advice = t('assessment.advice.infant.elevated');
            } else {
                status = t('assessment.statuses.emergency'); severity = t('assessment.severities.critical'); color = "#F44336";
                advice = t('assessment.advice.infant.emergency');
            }
        } else if (person === 'child') {
            // Child logic
            if (temp < 36.0) {
                status = t('assessment.statuses.hypothermia'); severity = t('assessment.severities.danger'); color = "#2c7fb8";
                advice = t('assessment.advice.child.hypo');
            } else if (temp < 37.8) {
                status = t('assessment.statuses.normal'); severity = t('assessment.severities.normal'); color = "#4CAF50";
                advice = t('assessment.advice.child.normal');
            } else if (temp < 39.0) {
                status = t('assessment.statuses.lowGrade'); severity = t('assessment.severities.moderate'); color = "#FF9800";
                advice = t('assessment.advice.child.lowGrade');
            } else {
                status = t('assessment.statuses.high'); severity = t('assessment.severities.highRisk'); color = "#F44336";
                advice = t('assessment.advice.child.high');
            }
        } else {
            // Adult logic
            if (temp < 36.0) {
                status = t('assessment.statuses.hypothermia'); severity = t('assessment.severities.danger'); color = "#2c7fb8";
                advice = t('assessment.advice.adult.hypo');
            } else if (temp < 37.6) {
                status = t('assessment.statuses.normal'); severity = t('assessment.severities.normal'); color = "#4CAF50";
                advice = t('assessment.advice.adult.normal');
            } else if (temp < 38.5) {
                status = t('assessment.statuses.lowGrade'); severity = t('assessment.severities.mild'); color = "#FF9800";
                advice = t('assessment.advice.adult.lowGrade');
            } else if (temp < 40.0) {
                status = t('assessment.statuses.fever'); severity = t('assessment.severities.high'); color = "#F44336";
                advice = t('assessment.advice.adult.fever');
            } else {
                status = t('assessment.statuses.high'); severity = t('assessment.severities.severeDanger'); color = "#cc0000";
                advice = t('assessment.advice.adult.high');
            }
        }

        setAssessment({ status, severity, advice, color });
    }, [sliderValue, sliderUnit, person, t]);

    // Handle smooth unit switching
    const changeSliderUnit = (newUnit: 'c' | 'f') => {
        if (newUnit === sliderUnit) return;

        let newValue: number;
        if (newUnit === 'f') {
            newValue = parseFloat(celsiusToFahrenheit(sliderValue).toFixed(1));
        } else {
            newValue = parseFloat(fahrenheitToCelsius(sliderValue).toFixed(1));
        }

        setSliderUnit(newUnit);
        setSliderValue(newValue);
    };

    useEffect(() => {
        assessTemperature();
    }, [assessTemperature]);

    return (
        <Layout seo={{
            title: t('meta.title'),
            description: t('meta.description'),
            canonical: `https://ctofconverter.com${getLocalizedLink('/body-temperature-chart-fever-guide', locale)}`,
            ogImage: 'https://ctofconverter.com/images/fever-temperature-chart.webp'
        }}>
            <Head>
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "MedicalWebPage",
                        "name": t('intro.title'),
                        "description": t('meta.description'),
                        "lastReviewed": "2026-01-14",
                        "reviewedBy": {
                            "@type": "Organization",
                            "name": "Ctofconverter Editorial Team"
                        },
                        "sourceOrganization": [
                            { "@type": "Organization", "name": "CDC" },
                            { "@type": "Organization", "name": "WHO" },
                            { "@type": "Organization", "name": "NHS" }
                        ]
                    })
                }} />
                <script type="application/ld+json" dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "FAQPage",
                        "mainEntity": (t('faqs.items') as any[] || []).map((faq: any) => ({
                            "@type": "Question",
                            "name": faq.q,
                            "acceptedAnswer": {
                                "@type": "Answer",
                                "text": faq.a
                            }
                        }))
                    })
                }} />
            </Head>
            <Header /> {/* Replaced custom header with Header component */}
            <Navigation />

            <main className="container">
                <nav className="breadcrumb-nav">
                    <ul className="breadcrumb">
                        <li><Link href={getLocalizedLink('/', locale)}>{t('nav.home')}</Link></li>
                        <li>{t('nav.page')}</li>
                    </ul>
                </nav>

                {/* Moved title and key info block here */}
                <section className={styles.introSection}>
                    <h1>{t('intro.title')}</h1>

                    <div style={{ background: '#f0f7ff', borderLeft: '4px solid #3498db', padding: '1.5rem', margin: '1.5rem 0', borderRadius: '0 8px 8px 0' }}>
                        <h2 style={{ fontSize: '1.3rem', marginTop: 0, color: '#2c3e50', textAlign: 'left' }}>{t('intro.featuredSnippet.title')}</h2>
                        <p style={{ margin: 0, fontSize: '1.1rem', color: '#444' }} dangerouslySetInnerHTML={{
                            __html: t('intro.featuredSnippet.content', {
                                normalRange: '<strong>36.5°C to 37.5°C (97.7°F to 99.5°F)</strong>',
                                feverThreshold: '<strong>38.0°C (100.4°F)</strong>',
                                fever: '<strong>fever</strong>'
                            })
                        }} />
                    </div>

                    <p className={styles.tagline}>{t('intro.tagline')}</p>

                    <div className={styles.keyInfo}>
                        <div className={`${styles.infoItem} ${styles.normal}`}>
                            <span>{t('keyInfo.normal.label')}</span>
                            <strong>{t('keyInfo.normal.value')}</strong>
                        </div>
                        <div className={`${styles.infoItem} ${styles.warning}`}>
                            <span>{t('keyInfo.warning.label')}</span>
                            <strong>{t('keyInfo.warning.value')}</strong>
                        </div>
                        <div className={`${styles.infoItem} ${styles.danger}`}>
                            <span>{t('keyInfo.danger.label')}</span>
                            <strong>{t('keyInfo.danger.value')}</strong>
                        </div>
                    </div>
                </section>

                {/* Quick Converter Tool */}
                <section className={styles.converterTool}>
                    <h2>{t('converter.title')}</h2>
                    <div className={styles.converterInputs}>
                        <input
                            type="number"
                            placeholder={t('converter.placeholder')}
                            value={tempInput}
                            onChange={(e) => setTempInput(e.target.value)}
                        />
                        <select value={unitFrom} onChange={(e) => setUnitFrom(e.target.value as 'c' | 'f')}>
                            <option value="c">{t('converter.celsius')}</option>
                            <option value="f">{t('converter.fahrenheit')}</option>
                        </select>
                        <button className="btn" onClick={handleConvert}>{t('converter.btn')}</button>
                    </div>
                    {conversionResult.text && (
                        <div className={`alert alert-${conversionResult.type}`} style={{ padding: '1rem', borderRadius: '8px', background: conversionResult.type === 'danger' ? '#fee2e2' : conversionResult.type === 'warning' ? '#fef3c7' : '#dcfce7', color: conversionResult.type === 'danger' ? '#991b1b' : conversionResult.type === 'warning' ? '#92400e' : '#166534' }}>
                            {conversionResult.text}
                        </div>
                    )}
                    <div className={styles.quickButtons}>
                        <button className={styles.quickTemp} onClick={() => setTempInput('36.5')}>36.5°C</button>
                        <button className={styles.quickTemp} onClick={() => setTempInput('37.2')}>37.2°C</button>
                        <button className={styles.quickTemp} onClick={() => setTempInput('38.0')}>38.0°C</button>
                        <button className={styles.quickTemp} onClick={() => setTempInput('38.5')}>38.5°C</button>
                        <button className={styles.quickTemp} onClick={() => setTempInput('39.0')}>39.0°C</button>
                    </div>
                </section>

                <section className={styles.interactiveTool}>
                    <h2 id="interactive-title">{t('assessment.title')}</h2>
                    <div className={styles.toolControls}>
                        {/* Segmented Control for Person Selection */}
                        <div className={styles.controlGroup}>
                            <input type="radio" id="adult" name="person" className={styles.radioInput} checked={person === 'adult'} onChange={() => setPerson('adult')} />
                            <label htmlFor="adult" className={styles.radioLabel}>{t('assessment.person.adult')}</label>

                            <input type="radio" id="child" name="person" className={styles.radioInput} checked={person === 'child'} onChange={() => setPerson('child')} />
                            <label htmlFor="child" className={styles.radioLabel}>{t('assessment.person.child')}</label>

                            <input type="radio" id="infant" name="person" className={styles.radioInput} checked={person === 'infant'} onChange={() => setPerson('infant')} />
                            <label htmlFor="infant" className={styles.radioLabel}>{t('assessment.person.infant')}</label>
                        </div>

                        <div className={styles.sliderContainer}>
                            <div className={styles.sliderHeader}>
                                <label htmlFor="tempSlider">{t('assessment.temp.label')}</label>
                                <div className={styles.tempValue}>{sliderValue}<span>{sliderUnit === 'c' ? '°C' : '°F'}</span></div>
                            </div>

                            <div className={styles.sliderWrapper}>
                                <input
                                    type="range"
                                    id="tempSlider"
                                    className={styles.slider}
                                    min={sliderUnit === 'c' ? 35 : 95}
                                    max={sliderUnit === 'c' ? 42 : 108}
                                    step="0.1"
                                    value={sliderValue}
                                    onChange={(e) => setSliderValue(parseFloat(e.target.value))}
                                />
                            </div>

                            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
                                <div className={styles.controlGroup}>
                                    <input type="radio" id="unitC" name="unit" className={styles.radioInput} checked={sliderUnit === 'c'} onChange={() => changeSliderUnit('c')} />
                                    <label htmlFor="unitC" className={styles.radioLabel}>{t('assessment.temp.unitC')}</label>
                                    <input type="radio" id="unitF" name="unit" className={styles.radioInput} checked={sliderUnit === 'f'} onChange={() => changeSliderUnit('f')} />
                                    <label htmlFor="unitF" className={styles.radioLabel}>{t('assessment.temp.unitF')}</label>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className={styles.resultBox} style={{
                        backgroundColor: `${assessment.color}08`,
                        borderLeftColor: assessment.color,
                        color: assessment.color
                    }}>
                        <h4>{assessment.status} — {assessment.severity}</h4>
                        <p style={{ color: '#334155' }}><strong>{t('assessment.result.recPrefix')}</strong> {assessment.advice}</p>
                        <p style={{ color: '#64748b', fontSize: '0.9rem' }}>
                            <strong>{t('assessment.result.analysisPrefix', { person: t(`assessment.person.${person}`) })}</strong>
                            {sliderUnit === 'c' ? ` ${sliderValue.toFixed(1)}°C = ${formatTemperature(celsiusToFahrenheit(sliderValue))}°F` : ` ${sliderValue.toFixed(1)}°F = ${formatTemperature(fahrenheitToCelsius(sliderValue))}°C`}
                        </p>
                    </div>
                </section>

                <section className="reference-section">
                    <h2 id="chart-title">{t('chart.title')}</h2>
                    <p className={styles.tableScrollHint}>{t('chart.scrollHint')}</p>

                    <div style={{ textAlign: 'center', margin: '1.5rem 0' }}>
                        <Image
                            src="https://ctofconverter.com/images/fever-temperature-chart.webp"
                            alt={t('chart.imgAlt')}
                            width={800}
                            height={450}
                            itemProp="image"
                            unoptimized
                            style={{ maxWidth: '100%', height: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                        />
                        <p style={{ marginTop: '0.8rem', fontStyle: 'italic', color: '#666', fontSize: '0.9rem' }}>{t('chart.imgCaption')}</p>
                    </div>

                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('chart.headers.status')}</th>
                                    <th>{t('chart.headers.celsius')}</th>
                                    <th>{t('chart.headers.fahrenheit')}</th>
                                    <th>{t('chart.headers.adultAdvice')}</th>
                                    <th>{t('chart.headers.childAdvice')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(t('chart.rows') as any || {}).map((key) => {
                                    const row = t(`chart.rows.${key}`) as any;
                                    return (
                                        <tr key={key}>
                                            <td><strong>{row.status}</strong></td>
                                            <td>{row.c}</td>
                                            <td>{row.f}</td>
                                            <td>{row.adult}</td>
                                            <td>{row.child}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </section>

                <section>
                    <h2 id="guides-title">{t('guides.title')}</h2>
                    <div className={styles.guideCards}>
                        <div className={styles.card}>
                            <h3>{t('guides.adult.title')}</h3>
                            <ul>
                                {(t('guides.adult.items') as string[] || []).map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.card}>
                            <h3>{t('guides.child.title')}</h3>
                            <ul>
                                {(t('guides.child.items') as string[] || []).map((item: string, i: number) => (
                                    <li key={i}>{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>
                </section>

                <section className="faq-section">
                    <h2 id="faq-title">{t('faqs.title')}</h2>
                    {(t('faqs.items') as any[] || []).map((faq: any, i: number) => (
                        <div key={i} className={styles.faqItem}>
                            <h3>{faq.q}</h3>
                            <p dangerouslySetInnerHTML={{ __html: faq.a }} />
                        </div>
                    ))}
                </section>

                <section>
                    <h2 id="measurement-title">{t('measurement.title')}</h2>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('measurement.headers.method')}</th>
                                    <th>{t('measurement.headers.range')}</th>
                                    <th>{t('measurement.headers.bestFor')}</th>
                                    <th>{t('measurement.headers.notes')}</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.keys(t('measurement.rows') as any || {}).map((key) => {
                                    const row = t(`measurement.rows.${key}`) as any;
                                    return (
                                        <tr key={key}>
                                            <td>{row.method}</td>
                                            <td>{row.range}</td>
                                            <td>{row.best}</td>
                                            <td>{row.note}</td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                    <p style={{ marginTop: '1rem', padding: '1rem', background: '#f9f9f9', borderRadius: '6px', fontSize: '0.95rem', color: '#555' }} dangerouslySetInnerHTML={{ __html: t('measurement.note') }} />
                </section>

                <section className={styles.downloadSection}>
                    <h2 id="download-title">{t('download.title')}</h2>
                    <p>{t('download.content')}</p>
                    <a href="/downloads/fever-temperature-chart.pdf" className={styles.btnDownload}>{t('download.btn')}</a>
                </section>

                <section className={styles.disclaimer}>
                    <h2 id="disclaimer-title">{t('authority.disclaimer.title')}</h2>
                    <p dangerouslySetInnerHTML={{ __html: t('authority.disclaimer.content') }} />
                </section>

                <section className={styles.authoritySection}>
                    <h3 id="authority-title">{t('authority.transparency.title')}</h3>
                    <p dangerouslySetInnerHTML={{ __html: t('authority.transparency.reviewProcess') }} />
                    <p><strong>{t('authority.transparency.lastUpdatedPrefix')}</strong> {lastUpdatedIso}</p>
                </section>
            </main>

            <Footer lastUpdated={lastUpdatedIso} />
            {/* JSX Styles omitted for brevity as they are unchanged but wrap them properly */}
            <style jsx>{`
                .container { max-width: 1200px; margin: 0 auto; padding: 0 20px; }
                .breadcrumb-nav { margin: 20px 0; }
                .breadcrumb { display: flex; list-style: none; padding: 0; margin: 0; }
                .breadcrumb li:not(:last-child):after { content: '/'; margin: 0 10px; color: #aaa; }
                .breadcrumb a { color: #3498db; text-decoration: none; }
                .table-container { overflow-x: auto; margin: 20px 0; }
                table { width: 100%; border-collapse: collapse; background: white; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
                th { background-color: #3498db; color: white; padding: 15px; text-align: left; }
                td { padding: 12px 15px; border-bottom: 1px solid #eee; }
                tr:nth-child(even) { background-color: #f8f9fa; }
                tr:hover td { background-color: #f1f1f1; }
                .btn { display: inline-block; background-color: #2ecc71; color: white; padding: 10px 20px; border-radius: 4px; text-decoration: none; border: none; cursor: pointer; transition: all 0.3s; }
                .btn:hover { background-color: #27ae60; transform: translateY(-2px); }
            `}</style>
        </Layout>
    );
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
    const lastUpdatedIso = getLatestModifiedDate([
        'pages/body-temperature-chart-fever-guide.tsx',
        `locales/${locale}/body-temperature-chart-fever-guide.json`
    ]);

    return {
        props: {
            lastUpdatedIso
        }
    };
};
