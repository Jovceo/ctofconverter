import React, { useState, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

// 导入工具函数
import {
  celsiusToFahrenheit,
  formatTemperature,
  generateFAQStructuredData,
  generatePageUrl,
  generatePageTitle,
  generateMetaDescription,
  generateOGDescription,
  analyzeTemperature,
  getTemperatureScene,
} from '../utils/temperaturePageHelpers';

import { ContentStrategy } from '../utils/contentStrategy';
import { textSpinner } from '../utils/textSpinner';
import { useTranslation, getLocalizedLink, SUPPORTED_LOCALES, HREFLANG_MAP } from '../utils/i18n';

/**
 * 翻译函数类型
 */
type TFunction = (key: string, replacements?: Record<string, string | number>) => string;

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
  availablePages?: number[];
  customIntro?: string;
  disableSmartFaqs?: boolean;
  showEditorialNote?: boolean;
}

export interface ConversionItem {
  title: string;
  equation: string;
  url?: string;
  isContextual?: boolean;
}

/**
 * 动态洞察展示组件 */
const DynamicInsightsSection: React.FC<{ insights: ContentStrategy['insights'] }> = ({ insights }) => {
  if (!insights || insights.length === 0) return null;

  return (
    <section className="insights-section" style={{ margin: '30px 0' }}>
      <div style={{ display: 'grid', gap: '20px' }}>
        {insights.map((insight, idx) => {
          const styles = {
            warning: { border: '#e74c3c', bg: '#fde2e2', icon: '⚠️' },
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
 * 实用场景应用组件
 */
const PracticalApplications: React.FC<{
  celsius: number;
  fahrenheit: number;
  t: TFunction;
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
        icon: '🌤️',
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
        icon: '🌡️',
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
        icon: '🧪',
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
  }, [celsius, t, formattedF]);

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
                  {app.examples.map((ex: { label: string; value: string }, i: number) => (
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

PracticalApplications.displayName = 'PracticalApplications';

/**
 * Editorial Note for EEAT - Context Aware
 */
const EditorialNote: React.FC<{ t: TFunction; celsius: number }> = ({ t, celsius }) => {
  const noteData = useMemo(() => {
    let context = 'general';
    // Refined logic matching textSpinner priorities
    if (celsius >= 35 && celsius <= 42.5) context = 'medical';
    else if (celsius >= 60) context = 'cooking';
    else if (celsius >= -60 && celsius <= 55) context = 'weather';

    return {
      note: t(`editorial.${context}.note`),
      sources: t(`editorial.${context}.sources`)
    };
  }, [celsius, t]);

  return (
    <section className="editorial-note" style={{
      marginTop: '40px',
      padding: '25px',
      backgroundColor: '#f8fafc',
      borderRadius: '12px',
      border: '1px solid #e2e8f0',
      fontSize: '0.95rem',
      lineHeight: '1.6',
      color: '#475569'
    }}>
      <h4 style={{
        margin: '0 0 10px 0',
        color: '#1e293b',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '1.1rem'
      }}>
        <span style={{ fontSize: '1.2rem' }}>ℹ️</span> {t('editorial.title')}
      </h4>
      <p style={{ margin: 0 }}>
        {noteData.note}
      </p>
      <p style={{ marginTop: '10px', fontSize: '0.85em', opacity: 0.8 }}>
        {noteData.sources}
      </p>
    </section>
  );
};

EditorialNote.displayName = 'EditorialNote';

/**
 * 详细转换公式和计算组件 */
const DetailedConversionGuide: React.FC<{
  celsius: number;
  fahrenheit: number;
  t: TFunction;
}> = React.memo(({ celsius, fahrenheit, t }) => {
  const step1 = celsius * 9 / 5;
  const step1Text = textSpinner.getStep1(celsius, t);
  const step2Text = textSpinner.getStep2(celsius, step1, t);
  const conclusionText = textSpinner.getConclusion(celsius, fahrenheit, t);

  return (
    <div className="conversion-formula">
      <h3>{textSpinner.getFormulaTitle(celsius, fahrenheit, t)}</h3>
      <p>{t('common.formulaIntro')}</p>
      <div className="formula">°F = (°C × 9/5) + 32</div>

      <div className="calculation-steps">
        <h4>{t('common.stepTitle')}</h4>
        <ol>
          <li><strong>{t('common.step1')}:</strong> <span dangerouslySetInnerHTML={{ __html: step1Text }} /> <br /> <em>{t('common.calculation')}:</em> {celsius} × 1.8 = {formatTemperature(step1)}</li>
          <li><strong>{t('common.step2')}:</strong> <span dangerouslySetInnerHTML={{ __html: step2Text }} /> <br /> <em>{t('common.calculation')}:</em> {formatTemperature(step1)} + 32 = {formatTemperature(fahrenheit)}</li>
          <li><strong>{t('common.result')}:</strong> <span dangerouslySetInnerHTML={{ __html: conclusionText }} /></li>
        </ol>
      </div>

      <Image
        src={`/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`}
        alt={t('common.headerTitle', { celsius, fahrenheit: formatTemperature(fahrenheit) })}
        className="conversion-equation-image"
        width={1200}
        height={630}
        style={{ maxWidth: '100%', height: 'auto', marginTop: '30px', borderRadius: '8px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}
      />
    </div>
  );
});

DetailedConversionGuide.displayName = 'DetailedConversionGuide';

/**
 * 增强FAQ组件
 */
const EnhancedFAQ: React.FC<{
  celsius: number;
  fahrenheit: number;
  customFaqs?: { question: string; answer: string }[];
  disableSmartFaqs?: boolean;
  t: TFunction;
}> = React.memo(({ celsius, fahrenheit, customFaqs = [], disableSmartFaqs = false, t }) => {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const faqs = useMemo(() => {
    // 🚀 Smart FAQ System (2025 Strategy)
    // Replaces static "What is X?" with intent-driven questions.
    const smartFaqs = disableSmartFaqs ? [] : textSpinner.getSmartFAQ(celsius, fahrenheit, t);

    // Merge Smart FAQs (Tier 3/2) with Custom FAQs (Tier 1)
    // Smart FAQs go first as they cover critical PAA intents (Safety/Health etc.)
    return [...smartFaqs, ...customFaqs];
  }, [celsius, fahrenheit, customFaqs, t, disableSmartFaqs]);

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

EnhancedFAQ.displayName = 'EnhancedFAQ';

const EnhancedConverter: React.FC<{ t: TFunction; initialCelsius?: number }> = React.memo(({ t, initialCelsius }) => {
  const [celsius, setCelsius] = useState(initialCelsius !== undefined ? String(initialCelsius) : '');
  const [fahrenheit, setFahrenheit] = useState<string | null>(initialCelsius !== undefined ? formatTemperature(celsiusToFahrenheit(initialCelsius)) : null);
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
          <button className="info-btn" title={t('common.freezingTooltip')}>ℹ️</button>
        </div>
        <input
          id="celsius-input" type="number" value={celsius} onChange={handleCelsiusChange}
          placeholder={t('common.celsiusLabel')} className="temperature-input"
        />
      </div>

      <div className="result-container" role="region" aria-live="polite">
        <div className="result-header">
          <label>{t('common.fahrenheitLabel')}</label>
          <button className="info-btn" title={t('common.fahrenheitTooltip')}>ℹ️</button>
        </div>
        <output id="conversion-result" className="result-value" style={{ display: 'block', fontSize: '2.5rem', fontWeight: 'bold', margin: '15px 0', minHeight: '60px', color: fahrenheit ? '#2c3e50' : '#bdc3c7' }}>
          {fahrenheit ? fahrenheit : '--'}
        </output>
        <button className="btn" onClick={handleCopy} disabled={!fahrenheit} style={{ width: '100%', marginTop: '10px' }}>
          {copySuccess ? t('common.copied') : t('common.copyResult')}
        </button>
      </div>
    </div>
  );
});

EnhancedConverter.displayName = 'EnhancedConverter';

/**
 * 温度转换表格组件
 */
const ConversionTable: React.FC<{
  celsius: number;
  t: TFunction;
  locale: string;
}> = React.memo(({ celsius, t, locale }) => {
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

              if (row.isHighlighted) {
                return (
                  <tr key={index} className="highlighted-row" aria-current="page">
                    <td><strong>{row.celsius}°C</strong></td>
                    <td><strong>{row.fahrenheit}°F</strong></td>
                    <td>{t(`context.categories.${context.categoryKeys[0] || 'moderate'}`)}</td>
                  </tr>
                );
              }

              // 🚀 SEO: Proper HTML structure - use onClick for navigation
              return (
                <tr
                  key={index}
                  onClick={() => { if (typeof window !== 'undefined') window.location.href = getLocalizedLink(`/${row.celsius}-c-to-f`, locale); }}
                  style={{ cursor: 'pointer' }}
                  className="linkable-row"
                >
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

ConversionTable.displayName = 'ConversionTable';

/**
 * 相关温度推荐组件 (Flat Layout)
 */
const RelatedTemperatures: React.FC<{
  celsius: number;
  availablePages?: number[];
  extraConversions?: ConversionItem[];
  t: TFunction;
  locale: string;
}> = React.memo(({ celsius, availablePages = [], extraConversions = [], t, locale }) => {
  // Data Generation (Preserving Strict Filter Logic)
  const allItems = useMemo(() => {
    const val = celsius;
    const scene = getTemperatureScene(val);

    // Check if link valid
    const isPageAvailable = (num: number) => {
      if (!availablePages || availablePages.length === 0) return false;
      return availablePages.includes(num);
    };

    const createItem = (targetC: number, label: string = ''): ConversionItem & { href?: string } | null => {
      if (Math.abs(targetC - val) < 0.01) return null;
      if (targetC === 0) targetC = 0;

      const exists = isPageAvailable(targetC);
      const f = celsiusToFahrenheit(targetC);

      // Localized Title Generation
      // 1. Base: "{celsius} Celsius to Fahrenheit ({fahrenheit}°F)"
      let title = t('related.conversionTitle', { celsius: targetC, fahrenheit: formatTemperature(f) });

      // 2. Add Label: " - Freezing Point" -> localized
      if (label) {
        title += ` - ${label}`;
      }

      return {
        title: title,
        equation: `${targetC}°C = ${formatTemperature(f)}°F`,
        url: `/${targetC}-c-to-f`,
        href: exists ? getLocalizedLink(`/${targetC}-c-to-f`, locale) : undefined,
        isContextual: true
      };
    };

    const closest: (ConversionItem & { href?: string })[] = [];
    const benchmarks: (ConversionItem & { href?: string })[] = [];
    const extras: (ConversionItem & { href?: string })[] = [];

    // 1. Zone B: Precision Neighbors (Max 4)
    if (scene.precisionSteps) {
      const steps = scene.precisionSteps.slice(0, 4);
      steps.forEach(step => {
        const neighbor = parseFloat((val + step).toFixed(2));
        const item = createItem(neighbor, '');
        if (item) closest.push(item);
      });
    }

    // 2. Zone A: Anchors (Top 3 Closest)
    if (scene.anchors) {
      const sortedAnchors = [...scene.anchors].sort((a, b) => {
        const aVal = (a as unknown as { val: number }).val;
        const bVal = (b as unknown as { val: number }).val;
        return Math.abs(aVal - val) - Math.abs(bVal - val);
      });
      const topAnchors = sortedAnchors.slice(0, 3);

      topAnchors.forEach(anchor => {
        const anchorObj = anchor as unknown as { val: number, labelKey?: string };
        // Localize Label Key
        const label = anchorObj.labelKey ? t(`related.labels.${anchorObj.labelKey}`) : '';
        const item = createItem(anchorObj.val, label);
        if (item) benchmarks.push(item);
      });
    }

    // 3. Extras
    const cToK = val + 273.15;
    // Fallback translation for Kelvin if not in JSON (it isn't yet, let's simple string or t('common.cToK')?)
    // t('common.cToK') exists: "Celsius to Kelvin" or "摄氏度转开尔文"
    // Wait, English was "4 Celsius to Kelvin (277.1K)".
    // Chinese "4 摄氏度转开尔文 (277.1K)"?
    // Let's construct it: "{celsius} {t('common.cToK')} ({K}K)"

    extras.push({
      title: `${val} ${t('common.cToK')} (${formatTemperature(cToK)}K)`,
      equation: `${val}°C = ${formatTemperature(cToK)}K`,
      url: undefined
    });

    extraConversions.forEach(ex => {
      extras.push({
        ...ex,
        href: ex.url ? getLocalizedLink(ex.url, locale) : undefined
      });
    });

    return [...closest, ...benchmarks, ...extras];

  }, [celsius, availablePages, extraConversions, locale, t]);

  // Single Flat Grid Render - User Layout + Polished Link Guide
  return (
    <section className="related-conversions" style={{ marginTop: '50px', marginBottom: '40px' }}>
      {/* Centered Title Style (User Screenshot) - Cleaned up */}
      <div style={{ textAlign: 'center', marginBottom: '35px' }}>
        <h2 style={{
          fontSize: '1.8rem',
          color: '#2c3e50',
          marginBottom: '15px',
          fontWeight: '700',
          display: 'inline-block',
          position: 'relative'
        }}>
          {t('common.relatedTitle')} {celsius}°C
        </h2>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '20px' }}>
        {allItems.map((item, idx) => {
          const isClickable = !!item.href;

          const CardContent = (
            <div className="conversion-card" style={{
              background: '#fff',
              borderRadius: '8px',
              padding: '20px 24px',
              // Left border style from user screenshot - UNIFIED PRIMARY BLUE
              borderLeft: `5px solid #3498db`,
              boxShadow: '0 4px 6px rgba(0,0,0,0.05)',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'center',
              transition: 'all 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}>
              <div style={{ width: '100%', paddingRight: isClickable ? '20px' : '0' }}>
                <div style={{
                  fontWeight: 600,
                  color: '#2c3e50',
                  fontSize: '1.05rem',
                  marginBottom: '8px',
                  lineHeight: '1.4'
                }}>
                  {item.title}
                </div>
                <div style={{
                  color: '#7f8c8d',
                  fontSize: '0.9rem',
                  fontWeight: 500
                }}>
                  {item.equation}
                </div>
              </div>

              {/* Refined Arrow for Clickable Items (Polished) */}
              {isClickable && (
                <div className="card-arrow" style={{
                  position: 'absolute',
                  top: '20px',
                  right: '15px',
                  color: '#3498db',
                  opacity: 0.5,
                  transform: 'translateX(-3px)',
                  transition: 'opacity 0.2s, transform 0.2s'
                }}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );

          return isClickable ? (
            <Link key={idx} href={item.href} passHref legacyBehavior>
              <a style={{ textDecoration: 'none', display: 'block' }} className="card-link">
                {CardContent}
              </a>
            </Link>
          ) : (
            <div key={idx} style={{ opacity: 0.85 }}>{CardContent}</div>
          );
        })}
      </div>
      <style jsx global>{`
        .card-link:hover .conversion-card {
          transform: translateY(-4px);
          box-shadow: 0 12px 20px -8px rgba(0, 0, 0, 0.1) !important;
        }
        .card-link:hover .card-arrow {
          opacity: 1 !important;
          transform: translateX(0) !important;
        }
      `}</style>
    </section>
  );
});

RelatedTemperatures.displayName = 'RelatedTemperatures';

/**
 * 健康预警组件
 */
const HealthAlert: React.FC<{ celsius: number; t: TFunction }> = ({ celsius, t }) => {
  const { message, color, icon } = useMemo(() => {
    if (celsius >= 38) return { message: t('health.highFever'), color: '#e74c3c', icon: '🩺' };
    if (celsius >= 37.5) return { message: t('health.lowFever'), color: '#f39c12', icon: '🩺' };
    if (celsius < 36) return { message: t('health.hypothermia'), color: '#3498db', icon: '🩺' };
    return { message: t('health.normal'), color: '#27ae60', icon: '🩺' };
  }, [celsius, t]);

  return (
    <aside style={{ padding: '20px', backgroundColor: `${color}15`, borderLeft: `5px solid ${color}`, borderRadius: '8px', margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '15px' }} aria-label="Contextual Information">
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <span style={{ display: 'block', margin: '0 0 5px 0', color: color, fontSize: '0.95em', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.healthContextTitle')}</span>
        <div style={{ margin: 0 }}>
          <span dangerouslySetInnerHTML={{ __html: message }} /> {t('common.healthContextFooter')}
          <p style={{ marginTop: '10px', fontSize: '0.85em', color: '#666', fontStyle: 'italic' }}>
            {t('common.medicalAdviceNote')}
          </p>
        </div>
      </div>
    </aside>
  );
};

/**
 * Weather/Feel Component
 */
const WeatherWidget: React.FC<{ celsius: number; t: TFunction }> = ({ celsius, t }) => {
  const { tip, icon } = useMemo(() => {
    if (celsius <= 0) return { tip: t('weather.freezing'), color: '#3498db', icon: '❄️' };
    if (celsius <= 10) return { tip: t('weather.chilly'), color: '#5dade2', icon: '🧥' };
    if (celsius <= 20) return { tip: t('weather.cool'), color: '#85c1e9', icon: '🍂' };
    if (celsius <= 25) return { tip: t('weather.warm'), color: '#f4d03f', icon: '👕' };
    if (celsius <= 30) return { tip: t('weather.hot'), color: '#f5b041', icon: '☀️' };
    return { tip: t('weather.veryHot'), color: '#e67e22', icon: '🔥' };
  }, [celsius, t]);

  return (
    <aside style={{ padding: '20px', background: 'linear-gradient(to right, #f8f9fa, #e9ecef)', borderRadius: '8px', margin: '0 0 30px 0', display: 'flex', alignItems: 'center', gap: '15px', border: '1px solid #dee2e6' }} aria-label="Contextual Information">
      <div style={{ fontSize: '2rem' }}>{icon}</div>
      <div>
        <span style={{ display: 'block', margin: '0 0 5px 0', color: '#2c3e50', fontSize: '0.95em', fontWeight: 600, opacity: 0.9, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('common.weatherFeelTitle')}</span>
        <div style={{ margin: 0 }} dangerouslySetInnerHTML={{ __html: t('common.weatherFeelIntro', { celsius }) + " " + tip }} />
      </div>
    </aside>
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
  customResultHeader,
  availablePages,
  customIntro,
  disableSmartFaqs = false,
  showEditorialNote = true
}) => {
  const { t: tTemplate, locale } = useTranslation('template');
  const { t: tPage } = useTranslation(customNamespace);

  // 🚀 Enhanced Translation: Check page-specific namespace first, then fallback to template
  const t: TFunction = useMemo(() => (key: string, repl?: Record<string, string | number>) => {
    if (customNamespace) {
      const res = tPage(key, repl);
      if (res !== key) return res;
    }
    return tTemplate(key, repl);
  }, [tPage, tTemplate, customNamespace]);

  // 1. First: Calculate dates
  const { isoDate } = useMemo(() => {
    // Use lastUpdated if provided, otherwise default base date
    const dateSource = lastUpdated ? new Date(lastUpdated) : new Date('2025-09-15');
    const date = dateSource;
    return {
      displayDate: date.toLocaleDateString(locale, { year: 'numeric', month: 'long', day: 'numeric' }),
      isoDate: date.toISOString() // Return full ISO string with time and timezone
    };
  }, [lastUpdated, locale]);

  // 2. Second: Calculate Titles & Meta (needed for Structured Data)
  const { pageTitle, metaDescription, ogDescription } = useMemo(() => {
    // Note: We need fahrenheit here but it's calculated in the next block.
    // Circular dependency risk. Let's recalculate F simply here or merge blocks.
    // Better strategy: Calculate F first.
    // Better strategy: Calculate F first.
    const f = celsiusToFahrenheit(celsius);
    // 🚀 SEO: Calculate context early for dynamic titles
    const context = analyzeTemperature(celsius);

    const rawTitle = customTitle || generatePageTitle(celsius, f, t, context);

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');
    return {
      pageTitle: stripHtml(rawTitle),
      metaDescription: stripHtml(customDescription || generateMetaDescription(celsius, f, t, context)),
      ogDescription: stripHtml(customDescription || generateOGDescription(celsius, f, t)) // OG usually follows Meta or Title
    };
  }, [celsius, t, customTitle, customDescription]);

  // 3. Third: Main Data & Structured Data (depends on Date & Title)
  const { fahrenheit, formattedFahrenheit, pageUrl, structuredData } = useMemo(() => {
    const f = celsiusToFahrenheit(celsius);
    const formattedF = formatTemperature(f);
    const url = canonicalUrl || generatePageUrl(celsius, locale);

    // 生成结构化数据    // const howToData = generateHowToStructuredData(celsius, f, t); // Deprecated
    const faqData = generateFAQStructuredData(celsius, f, t, strategy.faqs);

    return {
      fahrenheit: f,
      formattedFahrenheit: formattedF,
      pageUrl: url,
      structuredData: {
        // 🚀 SEO Strategy: Use Article schema instead of HowTo for tool pages
        article: {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: pageTitle,
          image: `${new URL(url).origin}/images/equation/c-to-f-conversion.png`,
          author: { '@type': 'Organization', name: t('meta.author') },
          publisher: { '@type': 'Organization', name: t('common.logoText'), logo: { '@type': 'ImageObject', url: `${new URL(url).origin}/logo.png` } },

          dateModified: isoDate,
          description: metaDescription,
          mainEntityOfPage: { '@type': 'WebPage', '@id': url }
        },
        faq: faqData
      },

    };
  }, [celsius, canonicalUrl, locale, t, strategy.faqs, isoDate, pageTitle, metaDescription]);

  // 🚀 Calculate site origin for consistent URL generation across environments
  const siteOrigin = useMemo(() => new URL(pageUrl).origin, [pageUrl]);

  // 🚀 SEO: Generate explicit alternates for Layout to render
  const alternates = useMemo(() => {
    // Add x-default (pointing to English/Default URL)
    const links = [
      {
        href: generatePageUrl(celsius, 'en'),
        hreflang: 'x-default'
      }
    ];

    SUPPORTED_LOCALES.forEach(l => {
      links.push({
        href: generatePageUrl(celsius, l),
        hreflang: HREFLANG_MAP[l] || l
      });
    });

    return links;
  }, [celsius]);

  return (
    <Layout seo={{
      title: pageTitle,
      description: metaDescription,
      canonical: pageUrl,
      ogTitle: pageTitle,
      ogDescription: ogDescription,
      ogUrl: pageUrl,
      ogType: 'article',
      ogImage: `${siteOrigin}/images/equation/c-to-f-conversion.png`,
      twitterCard: 'summary_large_image',
      twitterTitle: pageTitle,
      twitterDescription: ogDescription,
      twitterImage: `${siteOrigin}/images/equation/c-to-f-conversion.png`,
      alternates: alternates
    }}>
      <Head>
        {/* 🚀 Schema: Article + FAQ (No HowTo) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.article) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }} />
      </Head>

      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <header className="site-header">
          <div className="container">
            <div className="site-logo">
              <Link href="/">
                <span aria-hidden="true">{t('common.logoText')}</span>
                <span className="sr-only">{t('common.logoText')}</span>
              </Link>
            </div>
            <h1>{customTitle || t('common.headerTitle', { celsius, fahrenheit: formattedFahrenheit })}</h1>
            <div className="tagline" style={{ marginBottom: '1.5rem', color: '#666' }} dangerouslySetInnerHTML={{ __html: customDescription || strategy.text.intro || t('meta.ogDescription', { celsius, fahrenheit: formattedFahrenheit }) }} />
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
            <section className="converter-tool" style={{ marginBottom: '30px' }}>
              <h2 id="conversion-title" style={{ marginBottom: '20px', fontSize: '1.5rem', fontWeight: 600 }}>
                {customResultHeader || textSpinner.getConverterTitle(celsius, fahrenheit, t)}
              </h2>

              {/* 🚀 SEO: Natural language intro paragraph for indexability */}
              {customIntro ? (
                <p className="intro-text" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', color: '#333' }} dangerouslySetInnerHTML={{ __html: customIntro }} />
              ) : (
                <p className="intro-text" style={{ fontSize: '1.1rem', lineHeight: '1.6', marginBottom: '20px', color: '#333' }}>
                  <span dangerouslySetInnerHTML={{ __html: t('common.introValue', { celsius, fahrenheit: formattedFahrenheit }) + " " + t('common.introConnect') }} />
                  {" "}
                  {/* Dynamic Intro Text Part with Embedded Natural Link */}
                  {(() => {
                    const introData = textSpinner.getIntroText(celsius, formattedFahrenheit, locale, getLocalizedLink, t);
                    const textWithTags = typeof introData === 'string' ? introData : introData.textWithTags;
                    const linkUrl = typeof introData === 'string' ? '' : introData.linkUrl;

                    // Split by <link>...</link> tags
                    if (!textWithTags) return null;

                    // Use a simple regex to capture the content inside <link> tags
                    // The split will result in [text_before, match_content, text_after, ...]
                    const parts = textWithTags.split(/<link>(.*?)<\/link>/);

                    return (
                      <>
                        {parts.map((part: string, i: number) => {
                          // Odd indices are the matches (the text inside tags)
                          if (i % 2 === 1) {
                            return (
                              <Link key={i} href={linkUrl} style={{ textDecoration: 'underline', color: '#3498db', fontWeight: 500 }}>
                                {part}
                              </Link>
                            );
                          }
                          // Even indices are simple text
                          return <span key={i}>{part}</span>;
                        })}
                      </>
                    );
                  })()}
                </p>
              )}

              <EnhancedConverter initialCelsius={celsius} t={t} />
            </section>

            {strategy.modules.showConversionGuide !== false && <DetailedConversionGuide celsius={celsius} fahrenheit={fahrenheit} t={t} />}

            {strategy.insights && <DynamicInsightsSection insights={strategy.insights} />}

            <div className="context-widgets" style={{ display: 'grid', gap: '20px', margin: '20px 0' }}>
              {strategy.modules.showHealthAlert && <HealthAlert celsius={celsius} t={t} />}
              {strategy.modules.showHumanFeel && <WeatherWidget celsius={celsius} t={t} />}
            </div>



            {strategy.modules.showPracticalApps !== false && <PracticalApplications celsius={celsius} fahrenheit={fahrenheit} t={t} />}

            {strategy.modules.showOvenGuide && <ConversionTable celsius={celsius} t={t} locale={locale} />}

            <EnhancedFAQ celsius={celsius} fahrenheit={fahrenheit} customFaqs={strategy.faqs} disableSmartFaqs={disableSmartFaqs} t={t} />

            {showEditorialNote && <EditorialNote t={t} celsius={celsius} />}

            <RelatedTemperatures celsius={celsius} extraConversions={extraConversions} t={t} locale={locale} availablePages={availablePages} />
          </div>
        </main>
        <Footer lastUpdated={isoDate} />
        <Analytics />
      </div>
    </Layout>
  );
};

TemperaturePage.displayName = 'TemperaturePage';

export default TemperaturePage;

