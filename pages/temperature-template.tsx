import React, { useState, useEffect, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import Head from 'next/head';
import Link from 'next/link';

// 导入工具函数
import {
  celsiusToFahrenheit,
  fahrenheitToCelsius,
  formatTemperature,
  generateHowToStructuredData,
  generateFAQStructuredData,
  generateRelatedTemperatures,
  generatePageUrl,
  generatePageTitle,
  generateMetaDescription,
  generateOGDescription,
  analyzeTemperature,
} from '../utils/temperaturePageHelpers';

import { generateContentStrategy, ContentStrategy } from '../utils/contentStrategy';
import { textSpinner } from '../utils/textSpinner';
import { useTranslation } from '../utils/i18n';

/**
 * 温度转换页面Props接口
 */
export interface TemperaturePageProps {
  celsius: number;
  canonicalUrl?: string;
  lastUpdated?: string;
  extraConversions?: ConversionItem[];
  strategy?: ContentStrategy;
  customNamespace?: string;
  customTitle?: string;
  customDescription?: string;
  customResultHeader?: string;
}

export interface ConversionItem {
  title: string;
  equation: string;
}

/**
 * 动态洞察展示组件
 */
const DynamicInsightsSection: React.FC<{ insights: ContentStrategy['insights'] }> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="insights-section" style={{ margin: '30px 0' }}>
      <div style={{ display: 'grid', gap: '20px' }}>
        {insights.map((insight, idx) => {
          const styles = {
            warning: { border: '#e74c3c', bg: '#fdezea', icon: '⚠️' },
            tip: { border: '#27ae60', bg: '#d4edda', icon: '💡' },
            fact: { border: '#3498db', bg: '#d1ecf1', icon: 'ℹ️' }
          }[insight.type] || { border: '#ccc', bg: '#f8f9fa', icon: '📌' };

          return (
            <div key={idx} style={{
              padding: '20px',
              backgroundColor: styles.bg,
              borderLeft: `5px solid ${styles.border}`,
              borderRadius: '8px',
              boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1.2rem', display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span>{styles.icon}</span>
                <span dangerouslySetInnerHTML={{ __html: insight.title }} />
              </h3>
              <div style={{ margin: 0, lineHeight: '1.6' }} dangerouslySetInnerHTML={{ __html: insight.content }} />
            </div>
          );
        })}
      </div>
    </section>
  );
};

/**
 * 快速转换结果卡片组件
 */
const QuickResultCard: React.FC<{
  celsius: number;
  formattedFahrenheit: string;
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, formattedFahrenheit, t }) => {
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(`${celsius}°C = ${formattedFahrenheit}°F`);
    setCopySuccess(true);
    setTimeout(() => setCopySuccess(false), 2000);
  }, [celsius, formattedFahrenheit]);

  return (
    <div className="quick-result-card">
      <div className="result-header">
        <h2>{t('common.quickResult')}</h2>
      </div>
      <div className="result-display">
        <div className="celsius-value">
          <span className="value">{celsius}</span>
          <span className="unit">°C</span>
        </div>
        <div className="equals-sign">=</div>
        <div className="fahrenheit-value">
          <span className="value">{formattedFahrenheit}</span>
          <span className="unit">°F</span>
        </div>
      </div>
      <button className="copy-btn" onClick={handleCopy}>
        {copySuccess ? t('common.copied') : t('common.copyResult')}
      </button>
    </div>
  );
});

/**
 * 实用场景应用组件
 */
const PracticalApplications: React.FC<{
  celsius: number;
  fahrenheit: number;
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, fahrenheit, t }) => {
  const formattedF = formatTemperature(fahrenheit);
  const applications = useMemo(() => {
    const apps = [];

    // Cooking
    if (celsius >= 100 && celsius <= 250) {
      apps.push({
        icon: '🍳',
        title: t('practical.cooking.title'),
        description: t('practical.cooking.description', { celsius, fahrenheit: formattedF }),
        examples: [
          { label: t('practical.cooking.pastries'), value: t('practical.cooking.pastriesDesc', { celsius }) },
          { label: t('practical.cooking.roasting'), value: t('practical.cooking.roastingDesc', { celsius }) },
          { label: t('practical.cooking.slowRoast'), value: t('practical.cooking.slowRoastDesc', { celsius }) }
        ]
      });
    }

    // Weather
    if (celsius >= -10 && celsius <= 45) {
      const conditionKey = celsius < 0 ? 'freezing' : celsius < 15 ? 'cold' : celsius < 25 ? 'comfortable' : 'hot';
      apps.push({
        icon: '🌡️',
        title: t('practical.weather.title'),
        description: t('practical.weather.description', {
          celsius,
          fahrenheit: formattedF,
          condition: t(`practical.weather.conditions.${conditionKey}`),
          tip: t(`practical.weather.tips.${conditionKey}`)
        }),
      });
    }

    // Body Temp
    if (celsius >= 35 && celsius <= 42) {
      const conditionKey = celsius < 36.5 ? 'below' : celsius < 37.5 ? 'normal' : celsius < 38 ? 'elevated' : celsius < 39 ? 'lowGrade' : celsius < 40 ? 'moderate' : 'high';
      const tipKey = celsius >= 38 ? 'fever' : 'normal';
      apps.push({
        icon: '🏥',
        title: t('practical.body.title'),
        description: t('practical.body.description', {
          celsius,
          fahrenheit: formattedF,
          condition: t(`practical.body.conditions.${conditionKey}`),
          tip: t(`practical.body.tips.${tipKey}`)
        }),
      });
    }

    // Science
    if (celsius === 0 || celsius === 100 || (celsius > 0 && celsius < 100)) {
      const contextKey = celsius === 0 ? 'freezing' : celsius === 100 ? 'boiling' : 'general';
      apps.push({
        icon: '🔬',
        title: t('practical.science.title'),
        description: t('practical.science.description', {
          celsius,
          fahrenheit: formattedF,
          context: t(`practical.science.contexts.${contextKey}`)
        }),
      });
    }

    // Storage
    if (celsius >= -20 && celsius <= 30) {
      const conditionKey = celsius < 0 ? 'frozen' : celsius < 10 ? 'refrigerated' : celsius < 20 ? 'cool' : 'room';
      apps.push({
        icon: '📦',
        title: t('practical.storage.title'),
        description: t('practical.storage.description', {
          celsius,
          fahrenheit: formattedF,
          condition: t(`practical.storage.conditions.${conditionKey}`)
        }),
      });
    }

    return apps;
  }, [celsius, fahrenheit, t]);

  return (
    <div className="formula-section">
      <h2 id="practical-title">{t('practical.title', { celsius, fahrenheit: formattedF })}</h2>
      <div className="practical-uses">
        {applications.map((app, index) => (
          <div key={index} className="use-case">
            <div className="use-case-header">{app.title}</div>
            <div className="use-case-body">
              <p>{app.description}</p>
              {app.examples && (
                <ul className="use-case-examples">
                  {app.examples.map((ex: any, i: number) => (
                    <li key={i}><strong>{ex.label}:</strong> {ex.value}</li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        ))}
      </div>
      {applications.length === 0 && (
        <div className="faq-container">
          <div className="faq-item" style={{ display: 'block' }}>
            <div className="faq-answer">
              <p>{t('practical.extreme', {
                celsius,
                fahrenheit: formattedF,
                type: t(`practical.extremeTypes.${(celsius > 45 || celsius < -10) ? 'extreme' : 'specialized'}`)
              })}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});

/**
 * 详细转换公式和计算组件
 */
const DetailedConversionGuide: React.FC<{
  celsius: number;
  fahrenheit: number;
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, fahrenheit, t }) => {
  const step1 = celsius * 9 / 5;
  const step1Text = textSpinner.getStep1(celsius, t);
  const step2Text = textSpinner.getStep2(celsius, step1, t);
  const conclusionText = textSpinner.getConclusion(celsius, fahrenheit, t);

  return (
    <div className="conversion-formula">
      <h3>{t('common.formulaTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) })}</h3>
      <p>{t('common.formulaIntro')}</p>
      <div className="formula">°F = (°C × 9/5) + 32</div>

      <div className="calculation-steps">
        <h4>{t('common.stepTitle')}</h4>
        <ol>
          <li><strong>{t('common.step1')}:</strong> <span dangerouslySetInnerHTML={{ __html: step1Text }} /> <br /> <em>Calculation:</em> {celsius} × 1.8 = {formatTemperature(step1)}</li>
          <li><strong>{t('common.step2')}:</strong> <span dangerouslySetInnerHTML={{ __html: step2Text }} /> <br /> <em>Calculation:</em> {formatTemperature(step1)} + 32 = {formatTemperature(fahrenheit)}</li>
          <li><strong>{t('common.stepResult')}:</strong> <span dangerouslySetInnerHTML={{ __html: conclusionText }} /></li>
        </ol>
      </div>

      <img
        src={`/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`}
        alt={t('meta.pageTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) })}
        className="conversion-equation-image"
        width="1200"
        height="630"
        style={{ maxWidth: '100%', height: 'auto', marginTop: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
});

/**
 * 温度比较和范围可视化组件
 */
const TemperatureScale: React.FC<{
  celsius: number;
  fahrenheit: number;
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, fahrenheit, t }) => {
  return (
    <section className="temperature-comparison">
      <h2>{t('common.tempComparison')}</h2>

      <div className="comparison-cards">
        <div className="comparison-card primary">
          <div className="card-icon">🎯</div>
          <div className="card-label">{t('common.yourTemp')}</div>
          <div className="card-values">
            <span className="celsius-value">{celsius}°C</span>
            <span className="fahrenheit-value">{formatTemperature(fahrenheit)}°F</span>
          </div>
        </div>

        <div className="comparison-card">
          <div className="card-icon">❄️</div>
          <div className="card-label">{t('common.freezingPoint')}</div>
          <div className="card-values">
            <span className="celsius-value">0°C</span>
            <span className="fahrenheit-value">32°F</span>
          </div>
        </div>

        <div className="comparison-card">
          <div className="card-icon">🌡️</div>
          <div className="card-label">{t('common.roomTemp')}</div>
          <div className="card-values">
            <span className="celsius-value">20°C</span>
            <span className="fahrenheit-value">68°F</span>
          </div>
        </div>

        <div className="comparison-card">
          <div className="card-icon">💧</div>
          <div className="card-label">{t('common.boilingPoint')}</div>
          <div className="card-values">
            <span className="celsius-value">100°C</span>
            <span className="fahrenheit-value">212°F</span>
          </div>
        </div>
      </div>
    </section>
  );
});

/**
 * 增强版FAQ组件
 */
const EnhancedFAQ: React.FC<{
  celsius: number;
  fahrenheit: number;
  temperatureContext: ReturnType<typeof analyzeTemperature>;
  customFaqs?: { question: string; answer: string }[];
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, fahrenheit, temperatureContext, customFaqs = [], t }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(0);

  const faqs = useMemo(() => {
    const formattedF = formatTemperature(fahrenheit);
    const contextDescription = t(`context.descriptions.${temperatureContext.descriptionKey}`);
    const contextCategories = temperatureContext.categoryKeys.map(k => t(`context.categories.${k}`)).join(', ');

    const coreFaqs = [
      {
        question: t('faqs.core.q1', { celsius, fahrenheit: formattedF }),
        answer: t('faqs.core.a1', { celsius, fahrenheit: formattedF })
      },
      {
        question: t('faqs.core.q2', { celsius }),
        answer: t('faqs.core.a2', { celsius, categories: contextCategories, description: contextDescription })
      }
    ];

    return [coreFaqs[0], ...customFaqs, coreFaqs[1]];

  }, [celsius, fahrenheit, temperatureContext, customFaqs, t]);

  const toggleFAQ = useCallback((index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  }, [expandedIndex]);

  return (
    <section className="faq-section">
      <h2>{t('common.faqTitle')}</h2>
      <div className="faq-list">
        {faqs.map((faq, index) => (
          <div key={index} className={`faq-item ${expandedIndex === index ? 'active' : ''}`}>
            <div
              className="faq-question"
              role="button"
              tabIndex={0}
              onClick={() => toggleFAQ(index)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  toggleFAQ(index);
                }
              }}
              aria-expanded={expandedIndex === index}
              dangerouslySetInnerHTML={{ __html: faq.question }}
            />
            <div
              className="faq-answer"
              dangerouslySetInnerHTML={{ __html: faq.answer }}
            />
          </div>
        ))}
      </div>
    </section>
  );
});

const EnhancedConverter: React.FC<{ t: (key: string, repl?: any) => string }> = React.memo(({ t }) => {
  const [celsius, setCelsius] = useState('');
  const [fahrenheit, setFahrenheit] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState(false);

  const handleCelsiusChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCelsius(value);

    if (value && !isNaN(parseFloat(value))) {
      const f = celsiusToFahrenheit(parseFloat(value));
      setFahrenheit(formatTemperature(f));
    } else {
      setFahrenheit(null);
    }
    setCopySuccess(false);
  }, []);

  const handleCopy = useCallback(() => {
    if (fahrenheit) {
      navigator.clipboard.writeText(`${celsius}°C = ${fahrenheit}°F`);
      setCopySuccess(true);
      setTimeout(() => setCopySuccess(false), 2000);
    }
  }, [celsius, fahrenheit]);

  return (
    <div className="converter-form">
      <div className="input-group">
        <div className="input-header">
          <label htmlFor="celsius-input">{t('common.celsiusLabel')}</label>
          <button className="info-btn" title="Water freezes at 0°C and boils at 100°C">ℹ️</button>
        </div>
        <input
          id="celsius-input" type="number" value={celsius} onChange={handleCelsiusChange}
          placeholder={t('common.celsiusLabel')} className="temperature-input"
        />
      </div>

      <div className="result-container" role="region" aria-live="polite">
        <div className="result-header">
          <label>{t('common.fahrenheitLabel')}</label>
          <button className="info-btn" title="Water freezes at 32°F and boils at 212°F">ℹ️</button>
        </div>
        <output className="result-value" style={{ display: 'block', fontSize: '2.5rem', fontWeight: 'bold', margin: '15px 0', minHeight: '60px', color: fahrenheit ? '#2c3e50' : '#bdc3c7' }}>
          {fahrenheit ? fahrenheit : '--'}
        </output>
        <button className="btn" onClick={handleCopy} disabled={!fahrenheit} style={{ width: '100%', marginTop: '10px' }}>
          {copySuccess ? t('common.copied') : t('common.copyResult')}
        </button>
      </div>
    </div>
  );
});

/**
 * 温度转换表格组件
 */
const ConversionTable: React.FC<{
  celsius: number;
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, t }) => {
  const tableData = useMemo(() => {
    const data = [];
    const start = Math.max(-10, Math.floor(celsius / 10) * 10 - 10);
    for (let i = 0; i < 11; i++) {
      const c = start + i;
      const f = celsiusToFahrenheit(c);
      data.push({ celsius: c, fahrenheit: formatTemperature(f), isHighlighted: c === celsius });
    }
    return data;
  }, [celsius]);

  return (
    <section className="conversion-table">
      <h2>{t('common.tableTitle')}</h2>
      <div className="table-wrapper comparison-table">
        <table className="temperature-table">
          <thead>
            <tr>
              <th>{t('common.celsiusLabel')}</th>
              <th>{t('common.fahrenheitLabel')}</th>
              <th>{t('common.descriptionCol')}</th>
            </tr>
          </thead>
          <tbody>
            {tableData.map((row, index) => {
              const context = analyzeTemperature(row.celsius);
              return (
                <tr key={index} className={row.isHighlighted ? 'highlighted-row' : ''}>
                  <td><strong>{row.celsius}°C</strong></td>
                  <td><strong>{row.fahrenheit}°F</strong></td>
                  <td>{t(`context.categories.${context.categoryKeys[0] || 'moderate'}`)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
});

/**
 * 相关温度推荐组件
 */
const RelatedTemperatures: React.FC<{
  celsius: number;
  extraConversions?: ConversionItem[];
  t: (key: string, repl?: any) => string;
}> = React.memo(({ celsius, extraConversions = [], t }) => {
  const relatedConversions = useMemo(() => {
    const val = celsius;
    const fToC = (val - 32) * 5 / 9;
    const cToK = val + 273.15;
    const kToC = val - 273.15;
    const minusCToF = (-val * 9 / 5) + 32;

    const defaultItems = [
      { title: `${val} Fahrenheit to Celsius`, equation: `${val}°F = ${formatTemperature(fToC)}°C` },
      { title: `${val} Celsius to Kelvin`, equation: `${val}°C = ${formatTemperature(cToK)}K` },
      { title: `${val} Kelvin to Celsius`, equation: `${val}K = ${formatTemperature(kToC)}°C` },
      { title: `Minus ${val} Celsius to Fahrenheit`, equation: `-${val}°C = ${formatTemperature(minusCToF)}°F` }
    ];

    return [...defaultItems, ...extraConversions];
  }, [celsius, extraConversions]);

  return (
    <section className="related-conversions">
      <h2>{t('common.relatedTitle')}</h2>
      <div className="update-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '20px' }}>
        {relatedConversions.map((item, index) => (
          <article key={index} className="update-card" style={{ background: '#fff', borderRadius: '8px', padding: '20px', boxShadow: '0 2px 10px rgba(0,0,0,0.05)', borderLeft: '4px solid #3498db' }}>
            <div>
              <h3 style={{ margin: '0 0 10px 0', fontSize: '1rem', color: '#2c3e50', fontWeight: 600 }}>{item.title}</h3>
              <p style={{ margin: 0, color: '#7f8c8d', fontSize: '1rem' }}>{item.equation}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
});

/**
 * 健康预警组件
 */
const HealthAlert: React.FC<{ celsius: number; t: (key: string, repl?: any) => string }> = ({ celsius, t }) => {
  const { message, color, icon } = useMemo(() => {
    if (celsius >= 38) return { message: t('health.highFever'), color: '#e74c3c', icon: '🩺' };
    if (celsius >= 37.5) return { message: t('health.lowFever'), color: '#f39c12', icon: '🩺' };
    if (celsius < 36) return { message: t('health.hypothermia'), color: '#3498db', icon: '🩺' };
    return { message: t('health.normal'), color: '#27ae60', icon: '🩺' };
  }, [celsius, t]);

  return (
    <div style={{ padding: '20px', backgroundColor: `${color}15`, borderLeft: `5px solid ${color}`, borderRadius: '8px', margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '15px' }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <h3 style={{ margin: '0 0 5px 0', color: color }}>{t('common.healthContextTitle')}</h3>
        <div style={{ margin: 0 }}>
          <span dangerouslySetInnerHTML={{ __html: message }} /> {t('common.healthContextFooter')}
        </div>
      </div>
    </div>
  );
};

/**
 * 天气/体感组件
 */
const WeatherWidget: React.FC<{ celsius: number; t: (key: string, repl?: any) => string }> = ({ celsius, t }) => {
  const { tip, icon } = useMemo(() => {
    if (celsius <= 0) return { tip: t('weather.freezing'), icon: '❄️' };
    if (celsius <= 10) return { tip: t('weather.chilly'), icon: '🧥' };
    if (celsius <= 20) return { tip: t('weather.cool'), icon: '🍂' };
    if (celsius <= 25) return { tip: t('weather.warm'), icon: '👕' };
    if (celsius <= 30) return { tip: t('weather.hot'), icon: '☀️' };
    return { tip: t('weather.veryHot'), icon: '🔥' };
  }, [celsius, t]);

  return (
    <div style={{ padding: '20px', background: 'linear-gradient(to right, #f8f9fa, #e9ecef)', borderRadius: '8px', margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #dee2e6' }}>
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <h3 style={{ margin: '0 0 5px 0', color: '#2c3e50' }}>{t('common.weatherFeelTitle')}</h3>
        <div style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: t('common.weatherFeelIntro', { celsius }) + " " + tip }} />
      </div>
    </div>
  );
};

/**
 * 温度转换页面主组件
 */
export const TemperaturePage: React.FC<TemperaturePageProps> = ({
  celsius = 47,
  canonicalUrl,
  lastUpdated,
  extraConversions = [],
  strategy = {
    topic: 'general',
    modules: {
      showOvenGuide: true,
      showHealthAlert: false,
      showHumanFeel: false,
      showConversionGuide: true,
      showPracticalApps: true
    },
    text: { intro: '', description: '' }
  },
  customNamespace,
  customTitle,
  customDescription,
  customResultHeader
}) => {
  const { t: tTemplate, locale } = useTranslation('template');
  const { t: tPage } = useTranslation(customNamespace);

  const t = useMemo(() => (key: string, repl?: any) => {
    if (customNamespace) {
      const res = tPage(key, repl);
      if (res !== key) return res;
    }
    return tTemplate(key, repl);
  }, [tPage, tTemplate, customNamespace]);

  const { fahrenheit, formattedFahrenheit, temperatureContext, pageUrl, structuredData, displayDate } = useMemo(() => {
    const f = celsiusToFahrenheit(celsius);
    const formattedF = formatTemperature(f);
    const context = analyzeTemperature(celsius);
    const url = canonicalUrl || generatePageUrl(celsius, locale);

    // 生成结构化数据
    const howToData = generateHowToStructuredData(celsius, f, t);
    const faqData = generateFAQStructuredData(celsius, f, t, strategy.faqs);

    // 格式化日期
    // 仅在明确提供 lastUpdated 时显示当天，否则显示稳定的历史日期
    const date = lastUpdated ? new Date(lastUpdated) : new Date('2024-12-15T00:00:00Z');
    const displayDateStr = date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' });

    return {
      fahrenheit: f,
      formattedFahrenheit: formattedF,
      temperatureContext: context,
      pageUrl: url,
      structuredData: { howTo: howToData, faq: faqData },
      displayDate: displayDateStr
    };
  }, [celsius, canonicalUrl, locale, t, lastUpdated, strategy.faqs]);

  const { pageTitle, metaDescription, ogDescription } = useMemo(() => {
    const rawTitle = customTitle || generatePageTitle(celsius, fahrenheit, t);
    const rawDesc = customDescription || generateMetaDescription(celsius, fahrenheit, t);

    // 移除 HTML 标签用于 meta 标签
    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

    return {
      pageTitle: stripHtml(rawTitle),
      metaDescription: stripHtml(customDescription || generateMetaDescription(celsius, fahrenheit, t)),
      ogDescription: stripHtml(customDescription || generateOGDescription(celsius, fahrenheit, t))
    };
  }, [celsius, fahrenheit, t, customTitle, customDescription]);

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={pageUrl} />

        {/* Multilingual SEO: hreflang tags */}
        <link rel="alternate" hrefLang="x-default" href={generatePageUrl(celsius, 'en')} />
        {['en', 'zh', 'es', 'hi', 'ar', 'ja', 'fr', 'de', 'id', 'pt-br'].map(l => (
          <link
            key={l}
            rel="alternate"
            hrefLang={l === 'zh' ? 'zh-CN' : (l === 'pt-br' ? 'pt-BR' : l)}
            href={generatePageUrl(celsius, l)}
          />
        ))}

        <meta property="og:title" content={pageTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={pageUrl} />
        <meta property="og:type" content="article" />
        <meta property="og:image" content={`https://ctofconverter.com/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`} />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={pageTitle} />
        <meta name="twitter:description" content={metaDescription} />
        <meta name="twitter:image" content={`https://ctofconverter.com/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.howTo) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }} />
      </Head>

      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <header className="site-header">
          <div className="container">
            <div className="site-logo">
              <Link href="/">
                <span aria-hidden="true">C to F Converter</span>
                <span className="sr-only">Celsius to Fahrenheit Converter</span>
              </Link>
            </div>
            <h1 dangerouslySetInnerHTML={{ __html: customTitle || `${celsius}°C to Fahrenheit (${formattedFahrenheit}°F)` }} />
            <div className="tagline" style={{ marginBottom: '1.5rem', color: '#666' }} dangerouslySetInnerHTML={{ __html: customDescription || strategy.text.intro || t('meta.ogDescription', { celsius, fahrenheit: formattedFahrenheit }) }} />
            <p className="last-updated">{t('common.lastUpdated')} <time dateTime={lastUpdated || '2025-12-19'}>{displayDate}</time></p>
          </div>
        </header>

        <Navigation />

        <main id="main-content" className="container">
          <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
            <ol className="breadcrumb">
              <li><Link href="/">{t('breadcrumb.home')}</Link></li>
              <li aria-current="page">{t('common.breadcrumbCurrent', { celsius })}</li>
            </ol>
          </nav>

          <div className="temperature-content-grid">
            <section className="conversion-section">
              <h2 id="conversion-title" dangerouslySetInnerHTML={{ __html: customResultHeader || t('common.resultHeader', { celsius }) }} />
              <div className="conversion-result">
                <div className="result-box">
                  <output className="result-value">{formattedFahrenheit}°F</output>
                </div>
              </div>

              {strategy.insights && <DynamicInsightsSection insights={strategy.insights} />}
              {strategy.modules.showConversionGuide !== false && <DetailedConversionGuide celsius={celsius} fahrenheit={fahrenheit} t={t} />}
            </section>

            {strategy.modules.showHealthAlert && <HealthAlert celsius={celsius} t={t} />}
            {strategy.modules.showHumanFeel && <WeatherWidget celsius={celsius} t={t} />}

            <section className="converter-tool">
              <h2 className="converter-title">{t('common.quickResult')}</h2>
              <EnhancedConverter t={t} />
            </section>

            {strategy.modules.showPracticalApps !== false && <PracticalApplications celsius={celsius} fahrenheit={fahrenheit} t={t} />}

            {strategy.modules.showOvenGuide && <ConversionTable celsius={celsius} t={t} />}

            <EnhancedFAQ celsius={celsius} fahrenheit={fahrenheit} temperatureContext={temperatureContext} customFaqs={strategy.faqs} t={t} />

            <RelatedTemperatures celsius={celsius} extraConversions={extraConversions} t={t} />
          </div>
        </main>
        <Footer />
        <Analytics />
      </div>
    </Layout>
  );
};

const TemperatureTemplatePage: React.FC = () => {
  const testCelsius = 37;
  const strategy = generateContentStrategy(testCelsius);
  return <TemperaturePage celsius={testCelsius} strategy={strategy} />;
};

export default TemperatureTemplatePage;
