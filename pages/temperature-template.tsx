import React, { useState, useMemo, useCallback } from 'react';
import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import Head from 'next/head';
import Link from 'next/link';
import Image from 'next/image';

// 导入CSS Modules
import insightsStyles from '../components/TemperatureInsights/index.module.css';
import conversionToolStyles from '../components/ConversionTool/index.module.css';
import practicalAppsStyles from '../components/PracticalApps/index.module.css';
import pageStyles from '../styles/TemperatureTemplate.module.css';

// 导入工具函数
import {
  celsiusToFahrenheit,
  formatTemperature,
  generateFAQStructuredData,
  generateBreadcrumbStructuredData,
  generatePageUrl,
  generatePageTitle,
  generateMetaDescription,
  generateOGDescription,
  analyzeTemperature,
  getTemperatureScene,
} from '../utils/temperaturePageHelpers';
import { getGranularContext } from '../utils/temperatureContext';

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
  customOgImage?: string;
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
    <section className={insightsStyles.insightsSection}>
      <div className={insightsStyles.insightsGrid}>
        {insights.map((insight, idx) => {
          const cardTypeStyles = {
            warning: insightsStyles.insightCardWarning,
            tip: insightsStyles.insightCardTip,
            fact: insightsStyles.insightCardFact,
          }[insight.type] || insightsStyles.insightCardDefault;

          return (
            <div key={idx} className={`${insightsStyles.insightCard} ${cardTypeStyles}`}>
              <div className={insightsStyles.insightHeader}>
                <span className={insightsStyles.insightIcon} aria-hidden="true">
                  {insight.type === 'warning' && '⚠️'}
                  {insight.type === 'tip' && '💡'}
                  {insight.type === 'fact' && 'ℹ️'}
                </span>
                <h3 className={insightsStyles.insightTitle} dangerouslySetInnerHTML={{ __html: insight.title }} />
              </div>
              <div className={insightsStyles.insightContent} dangerouslySetInnerHTML={{ __html: insight.content }} />
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
    <div className={practicalAppsStyles.formulaSection}>
      <h2 id="practical-title">{t('practical.title', { celsius, fahrenheit: formattedF })}</h2>
      <div className={practicalAppsStyles.practicalUses}>
        {applications.map((app, index) => (
          <div key={index} className={practicalAppsStyles.useCase}>
            <div className={practicalAppsStyles.useCaseHeader}>{app.title}</div>
            <div className={practicalAppsStyles.useCaseBody}>
              <p>{app.description}</p>
              {app.examples && (
                <ul className={practicalAppsStyles.useCaseExamples}>
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
    <section className={pageStyles.editorialNote}>
      <h4 className={pageStyles.editorialNoteTitle}>
        <span className={pageStyles.editorialNoteIcon}>ℹ️</span> {t('editorial.title')}
      </h4>
      <p className={pageStyles.editorialNoteText}>
        {noteData.note}
      </p>
      <p className={pageStyles.editorialNoteSources}>
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
    <div className={conversionToolStyles.converterTool}>
      <div className={conversionToolStyles.converterForm}>
        <div className={conversionToolStyles.inputGroup}>
          <div className={conversionToolStyles.inputHeader}>
            <label htmlFor="celsius-input">{t('common.celsiusLabel')}</label>
            <button className="info-btn" title={t('common.freezingTooltip')}>ℹ️</button>
          </div>
          <input
            id="celsius-input" type="number" value={celsius} onChange={handleCelsiusChange}
            placeholder={t('common.celsiusLabel')} className={conversionToolStyles.temperatureInput}
          />
        </div>

        <div className={conversionToolStyles.resultContainer} role="region" aria-live="polite">
          <div className={conversionToolStyles.resultHeader}>
            <label>{t('common.fahrenheitLabel')}</label>
            <button className="info-btn" title={t('common.fahrenheitTooltip')}>ℹ️</button>
          </div>
          <output id="conversion-result" className={conversionToolStyles.resultValue}>
            {fahrenheit ? fahrenheit : '--'}
          </output>
          <button className={`${conversionToolStyles.copyButton} ${!fahrenheit ? conversionToolStyles.copyButtonDisabled : ''}`} onClick={handleCopy} disabled={!fahrenheit}>
            {copySuccess ? t('common.copied') : t('common.copyResult')}
          </button>
        </div>
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
              <th scope="col">{t('common.celsiusLabel')}</th>
              <th scope="col">{t('common.fahrenheitLabel')}</th>
              <th scope="col">{t('common.descriptionCol')}</th>
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

              // 🚀 SEO: Use proper <a> tags so crawlers can discover internal links
              const rowHref = getLocalizedLink(`/${row.celsius}-c-to-f`, locale);
              return (
                <tr key={index} className="linkable-row">
                  <td>
                    <Link href={rowHref}>
                      <strong>{row.celsius}°C</strong>
                    </Link>
                  </td>
                  <td>
                    <Link href={rowHref}>
                      <strong>{row.fahrenheit}°F</strong>
                    </Link>
                  </td>
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
        url: `/${String(targetC).replace('.', '-')}-c-to-f`,
        href: exists ? getLocalizedLink(`/${String(targetC).replace('.', '-')}-c-to-f`, locale) : undefined,
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
    <section className={pageStyles.related}>
      {/* Centered Title Style (User Screenshot) - Cleaned up */}
      <div className={pageStyles.relatedHead}>
        <h2 className={pageStyles.relatedTitle}>
          {t('common.relatedTitle')} {celsius}°C
        </h2>
      </div>

      <div className={pageStyles.grid}>
        {allItems.map((item, idx) => {
          const isClickable = !!item.href;

          const CardContent = (
            <div className={pageStyles.card}>
              <div className={`${pageStyles.content} ${isClickable ? pageStyles.clickable : ''}`}>
                <div className={pageStyles.cardTitle}>
                  {item.title}
                </div>
                <div className={pageStyles.equation}>
                  {item.equation}
                </div>
              </div>

              {/* Refined Arrow for Clickable Items (Polished) */}
              {isClickable && (
                <div className={pageStyles.arrow}>
                  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              )}
            </div>
          );

          return isClickable ? (
            <Link key={idx} href={item.href || ''} className={pageStyles.link}>
              {CardContent}
            </Link>
          ) : (
            <div key={idx} className={pageStyles.disabled}>{CardContent}</div>
          );
        })}
      </div>
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
    <aside className={pageStyles.healthAlert} style={{ backgroundColor: `${color}15`, borderLeft: `5px solid ${color}` }} aria-label="Contextual Information">
      <div className={pageStyles.healthAlertIcon}>{icon}</div>
      <div>
        <span className={pageStyles.healthAlertLabel} style={{ color }}>{t('common.healthContextTitle')}</span>
        <div>
          <span dangerouslySetInnerHTML={{ __html: message }} /> {t('common.healthContextFooter')}
          <p className={pageStyles.healthAlertNote}>
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
    <aside className={pageStyles.weatherWidget} aria-label="Contextual Information">
      <div className={pageStyles.weatherWidgetIcon}>{icon}</div>
      <div>
        <span className={pageStyles.weatherWidgetLabel}>{t('common.weatherFeelTitle')}</span>
        <div dangerouslySetInnerHTML={{ __html: t('common.weatherFeelIntro', { celsius }) + " " + tip }} />
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
  showEditorialNote = true,
  customOgImage
}) => {
  const { t: tTemplate, locale } = useTranslation('template');
  const { t: tPage } = useTranslation(customNamespace);

  // 🚀 New: Get granular context
  const granularContext = useMemo(() => getGranularContext(celsius), [celsius]);

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
  const { fahrenheit, pageTitle, metaDescription, ogDescription, context } = useMemo(() => {
    // Better strategy: Calculate F first.
    const f = celsiusToFahrenheit(celsius);
    // 🚀 SEO: Calculate context early for dynamic titles
    const context = analyzeTemperature(celsius);

    const stripHtml = (html: string) => html.replace(/<[^>]*>/g, '');

    // 🚀 SEO: Page Title Logic
    const pageTitle = stripHtml(customTitle || strategy?.meta?.title || generatePageTitle(celsius, f, t, context));

    // 🚀 SEO: Meta 描述逻辑 - 尝试使用细粒度上下文
    let metaDescription = customDescription || strategy?.meta?.description;
    if (!metaDescription) {
      // Enhance description with specific context if available
      if (granularContext.key !== 'general' && granularContext.description) {
        const baseDesc = generateMetaDescription(celsius, f, t, context);
        metaDescription = `${baseDesc} ${granularContext.description}`;
      } else {
        metaDescription = generateMetaDescription(celsius, f, t, context);
      }
    }
    metaDescription = stripHtml(metaDescription);

    // 🚀 SEO: OG 描述逻辑
    let ogDescription = strategy?.meta?.ogDescription;
    if (!ogDescription) {
      if (granularContext.key !== 'general' && granularContext.description) {
        ogDescription = granularContext.description;
      } else {
        ogDescription = generateOGDescription(celsius, f, t);
      }
    }
    ogDescription = stripHtml(ogDescription);

    return {
      fahrenheit: f,
      pageTitle,
      metaDescription,
      ogDescription,
      context
    };
  }, [celsius, t, customTitle, customDescription, strategy, granularContext]);

  // 3. Third: Main Data & Structured Data (depends on Date & Title)
  const { formattedFahrenheit, pageUrl, structuredData } = useMemo(() => {
    const formattedF = formatTemperature(fahrenheit);
    const url = canonicalUrl || generatePageUrl(celsius, locale);

    // 生成结构化数据
    const faqData = generateFAQStructuredData(celsius, fahrenheit, t, strategy.faqs);
    // 🚀 SEO Fix: Pass locale and t for localized breadcrumbs
    const breadcrumbData = generateBreadcrumbStructuredData(celsius, formattedF, locale, t);

    return {
      formattedFahrenheit: formattedF,
      pageUrl: url,
      structuredData: {
        // 🚀 SEO Strategy: Use WebPage schema for tool pages (safer than Article)
        webPage: {
          '@context': 'https://schema.org',
          '@type': 'WebPage',
          name: pageTitle,
          description: metaDescription,
          url: url,
          inLanguage: HREFLANG_MAP[locale] || locale,
          mainEntity: {
            '@type': 'SoftwareApplication',
            name: t('structuredData.appName', { celsius, fahrenheit: formattedF }) || `${celsius}°C to °F Converter`,
            applicationCategory: 'UtilityApplication',
            operatingSystem: 'Any',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'USD'
            }
          },
          dateModified: isoDate,
          image: customOgImage || `${new URL(url).origin}/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`
        },
        faq: faqData,
        breadcrumb: breadcrumbData
      },

    };
  }, [celsius, canonicalUrl, locale, t, strategy.faqs, isoDate, pageTitle, metaDescription, customOgImage, fahrenheit]);

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

  // 🚀 New: Granular Analysis Box Helper
  const renderGranularInsight = () => {
    if (granularContext.key === 'general') return null;
    return (
      <section className={insightsStyles.granularInsightCard} style={{ borderLeftColor: granularContext.color }}>
        <h3 className={insightsStyles.granularInsightTitle} style={{ color: granularContext.color }}>
          💡 Analysis: {granularContext.label}
        </h3>
        <p className={insightsStyles.granularInsightText}>
          {granularContext.description}
        </p>
      </section>
    );
  };

  return (
    <Layout seo={{
      title: pageTitle,
      description: metaDescription,
      canonical: pageUrl,
      ogTitle: pageTitle,
      ogDescription: ogDescription,
      ogUrl: pageUrl,
      ogType: 'article',
      ogImage: customOgImage || `${siteOrigin}/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`,
      twitterCard: 'summary_large_image',
      twitterTitle: pageTitle,
      twitterDescription: ogDescription,
      twitterImage: customOgImage || `${siteOrigin}/images/equation/${celsius}-celsius-to-fahrenheit-conversion.png`,
      alternates: alternates
    }}>
      <Head>
        {/* 🚀 Schema: WebPage + SoftwareApp + FAQ + Breadcrumb */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.webPage) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.faq) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData.breadcrumb) }} />
      </Head>

      <div dir={locale === 'ar' ? 'rtl' : 'ltr'}>
        <header className="site-header">
          <div className="container">
            <div className="site-logo">
              <Link href={getLocalizedLink('/', locale)}>
                <span aria-hidden="true">{t('common.logoText')}</span>
                <span className="sr-only">{t('common.logoText')}</span>
              </Link>
            </div>
            <h1>{customTitle || t('common.headerTitle', { celsius, fahrenheit: formattedFahrenheit })}</h1>
            <p className={pageStyles.tagline} dangerouslySetInnerHTML={{ __html: customDescription || strategy.text.intro || t('meta.ogDescription', { celsius, fahrenheit: formattedFahrenheit }) }} />
          </div>
        </header>

        <Navigation />

        <main id="main-content" className="container">
          <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
            <ol className="breadcrumb">
              <li><Link href={getLocalizedLink('/', locale)}>{t('breadcrumb.home')}</Link></li>
              <li aria-current="page">{t('common.breadcrumbCurrent', { celsius })}</li>
            </ol>
          </nav>

          <div className="temperature-content-grid">
            <section className={pageStyles.box}>
              <h2 id="conversion-title" className={pageStyles.boxTitle}>
                {customResultHeader || textSpinner.getConverterTitle(celsius, fahrenheit, t)}
              </h2>

              {/* 🚀 SEO: Natural language intro paragraph for indexability */}
              {customIntro ? (
                <p className={pageStyles.introText} dangerouslySetInnerHTML={{ __html: customIntro }} />
              ) : (
                <p className={pageStyles.introText}>
                  <span dangerouslySetInnerHTML={{ __html: textSpinner.getIntroValue(celsius, fahrenheit, t) + " " + textSpinner.getIntroConnect(celsius, t) }} />
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
                              <Link key={i} href={linkUrl} className={pageStyles.introLink}>
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

            {/* 🚀 New: Granular Context Insight (Disabled per user request) */}
            {/* {renderGranularInsight()} */}

            {strategy.modules.showConversionGuide !== false && <DetailedConversionGuide celsius={celsius} fahrenheit={fahrenheit} t={t} />}

            {strategy.insights && <DynamicInsightsSection insights={strategy.insights} />}

            <div className={pageStyles.contextWidgets}>
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
