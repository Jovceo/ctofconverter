import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Converter from '../components/Converter';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import FAQSection47C from '../components/FAQSection47C';
import Head from 'next/head';
import Link from 'next/link';
import {
  celsiusToFahrenheit,
  formatTemperature,
  generateHowToStructuredData,
  generateFAQStructuredData,
  generatePageUrl,
} from '../utils/temperaturePageHelpers';
import { useTranslation } from '../utils/i18n';

// 47°C to Fahrenheit conversion
const celsius = 47;
const fahrenheit = celsiusToFahrenheit(celsius); // 116.6°F

export default function Temperature47C() {
  const { locale, t, pageTranslation } = useTranslation('47-c-to-f');
  const pageT = pageTranslation || {};

  // 根据语言获取内容
  const meta = pageT.meta || {};
  const page = pageT.page || {};
  const warning = pageT.warning || {};
  const context = pageT.context || {};
  const negative = pageT.negative || {};
  const faq = pageT.faq || {};

  // 替换占位符的辅助函数
  const replace = (text: string) => {
    const negativeFahrenheit = formatTemperature(celsiusToFahrenheit(-47));
    return text
      .replace(/{fahrenheit}/g, formatTemperature(fahrenheit))
      .replace(/{celsius}/g, String(celsius))
      .replace(/{negativeFahrenheit}/g, negativeFahrenheit);
  };

  // 生成结构化数据（使用工具函数）
  const structuredData = generateHowToStructuredData(celsius, fahrenheit);

  // 生成FAQ结构化数据（根据语言）
  const faqItems = faq.items || [];
  const faqStructuredData = generateFAQStructuredData(
    celsius,
    fahrenheit,
    faqItems.map((item: any) => ({
      question: replace(item.question),
      answer: replace(item.answer),
    }))
  );

  // 生成Meta信息
  const pageTitle = meta.title ? replace(meta.title) : `47°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) | Conversion Guide & Calculator`;
  const metaDescription = meta.description ? replace(meta.description) : `Convert 47 degrees Celsius to Fahrenheit quickly. Learn that 47°C equals ${formatTemperature(fahrenheit)}°F, see the calculation steps, and understand temperature context including fever and environmental heat.`;
  const ogTitle = meta.ogTitle ? replace(meta.ogTitle) : `47°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) Converter`;
  const ogDescription = meta.ogDescription ? replace(meta.ogDescription) : `Convert 47 degrees Celsius to Fahrenheit instantly. 47°C equals ${formatTemperature(fahrenheit)}°F - see the calculation steps and practical applications.`;
  const canonicalUrl = generatePageUrl(celsius, 'https://ctofconverter.com');

  // 获取面包屑文本
  const breadcrumbHome = t('breadcrumb.home');

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={ogTitle} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={ogTitle} />
        <meta name="twitter:description" content={ogDescription} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqStructuredData) }}
        />
      </Head>
      <Navigation />
      <main id="main-content" className="container">
        <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li>
              <Link href="/">{breadcrumbHome}</Link>
            </li>
            <li aria-current="page">47°C to Fahrenheit</li>
          </ol>
        </nav>

        <article>
          <header style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>
              {page.title ? replace(page.title) : `47°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) - Complete Conversion Guide`}
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
              <span dangerouslySetInnerHTML={{ __html: page.description ? replace(page.description) : `Convert <strong>47 degrees Celsius to Fahrenheit</strong> instantly. <strong>47°C equals ${formatTemperature(fahrenheit)}°F</strong>. Learn the exact conversion formula, step-by-step calculation, and understand why 47°C is an extremely dangerous temperature for body temperature and represents extreme heat in environmental conditions.` }} />
            </p>
            {warning.title && (
              <div style={{
                background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
                color: 'white',
                padding: '1.5rem',
                borderRadius: '12px',
                marginTop: '1.5rem',
                border: '3px solid #c92a2a',
              }}>
                <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem' }}>
                  {replace(warning.title)}
                </h2>
                <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
                  <span dangerouslySetInnerHTML={{ __html: replace(warning.content) }} />
                </p>
              </div>
            )}
          </header>

          <section className="conversion-result-box" style={{
            background: 'linear-gradient(135deg, #fff3e0 0%, #ffe0b2 100%)',
            borderRadius: '12px',
            padding: '2rem',
            margin: '2rem 0',
            textAlign: 'center',
            border: '3px solid #f39c12',
          }}>
            <div style={{ fontSize: '3rem', fontWeight: 'bold', color: '#e65100', marginBottom: '0.5rem' }}>
              47°C = {formatTemperature(fahrenheit)}°F
            </div>
            <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
              {page.resultText ? replace(page.resultText) : `Forty-seven degrees Celsius equals ${formatTemperature(fahrenheit)} degrees Fahrenheit`}
            </p>
          </section>

          <section>
            <h2>{t('formula.title', { celsius })}</h2>
            <p>
              {t('formula.description', { celsius })}
            </p>
            <div className="formula-box" style={{ fontSize: '1.5rem', margin: '1.5rem 0' }}>
              {t('formula.formula')}
            </div>
            <p>{t('formula.applying', { celsius })}</p>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              margin: '1rem 0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}>
              <p><strong>{t('formula.step1', { celsius })}</strong></p>
              <p style={{ marginLeft: '2rem' }}>47 × 1.8 = {formatTemperature(celsius * 1.8)}</p>
              <p><strong>{t('formula.step2')}</strong></p>
              <p style={{ marginLeft: '2rem' }}>
                {formatTemperature(celsius * 1.8)} + 32 = <strong>{formatTemperature(fahrenheit)}°F</strong>
              </p>
            </div>
          </section>

          <section>
            <h2>47°C Temperature Context and Applications</h2>

            {context.medical && (
              <div style={{
                background: '#ffebee',
                borderLeft: '5px solid #e53935',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#c62828', marginTop: 0 }}>{replace(context.medical.title)}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: replace(context.medical.content) }} />
                </p>
                <ul>
                  {context.medical.items && context.medical.items.map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: replace(item) }} />
                  ))}
                </ul>
              </div>
            )}

            {context.environmental && (
              <div style={{
                background: '#fff3e0',
                borderLeft: '5px solid #ff9800',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#e65100', marginTop: 0 }}>{replace(context.environmental.title)}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: replace(context.environmental.content) }} />
                </p>
                <ul>
                  {context.environmental.items && context.environmental.items.map((item: string, index: number) => (
                    <li key={index}>{replace(item)}</li>
                  ))}
                </ul>
              </div>
            )}

            {context.cooking && (
              <div style={{
                background: '#e3f2fd',
                borderLeft: '5px solid #2196f3',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#1565c0', marginTop: 0 }}>{replace(context.cooking.title)}</h3>
                <p>{replace(context.cooking.content)}</p>
                <ul>
                  {context.cooking.items && context.cooking.items.map((item: string, index: number) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: replace(item) }} />
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>{t('comparison.title', { celsius })}</h2>
            <p>
              {t('comparison.description', { celsius })}
            </p>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              margin: '1.5rem 0',
              background: 'white',
              borderRadius: '8px',
              overflow: 'hidden',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}>
              <thead>
                <tr style={{ background: '#3498db', color: 'white' }}>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Temperature</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Celsius</th>
                  <th style={{ padding: '12px', textAlign: 'left' }}>Fahrenheit</th>
                </tr>
              </thead>
              <tbody>
                <tr style={{ background: '#e3f2fd' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{t('comparison.thisTemperature', { celsius })}</td>
                  <td style={{ padding: '10px 12px' }}>47°C</td>
                  <td style={{ padding: '10px 12px' }}>{formatTemperature(fahrenheit)}°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>{t('comparison.normalBody')}</td>
                  <td style={{ padding: '10px 12px' }}>37°C</td>
                  <td style={{ padding: '10px 12px' }}>98.6°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>{t('comparison.boilingPoint')}</td>
                  <td style={{ padding: '10px 12px' }}>100°C</td>
                  <td style={{ padding: '10px 12px' }}>212°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>{t('comparison.roomTemp')}</td>
                  <td style={{ padding: '10px 12px' }}>20-22°C</td>
                  <td style={{ padding: '10px 12px' }}>68-72°F</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>{t('negative.title', { celsius })}</h2>
            <p>
              <span
                dangerouslySetInnerHTML={{
                  __html: t('negative.description', { celsius }),
                }}
              />
            </p>
            <div style={{
              background: '#e1f5fe',
              borderLeft: '5px solid #03a9f4',
              padding: '1.5rem',
              borderRadius: '8px',
              margin: '1.5rem 0',
            }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                {negative.result ? replace(negative.result) : `-47°C = ${formatTemperature(celsiusToFahrenheit(-47))}°F`}
              </p>
              <p>
                <span dangerouslySetInnerHTML={{ __html: negative.description ? replace(negative.description) : `Minus 47 degrees Celsius equals <strong>${formatTemperature(celsiusToFahrenheit(-47))} degrees Fahrenheit</strong>. This is extremely cold, similar to temperatures found in polar regions during winter months.` }} />
              </p>
            </div>
          </section>

          <section>
            <h2>{t('faq.title')}</h2>
            <FAQSection47C 
              fahrenheit={fahrenheit} 
              faqItems={faqItems.map((item: any) => ({
                question: replace(item.question),
                answer: replace(item.answer),
              }))} 
            />
          </section>

          <section>
            <h2>{t('converter.title')}</h2>
            <p>
              {t('converter.description')}
            </p>
            <Converter />
          </section>

          {/* 相关温度链接组件暂时禁用 */}
        </article>
      </main>
      <Footer />
      <Analytics />
    </Layout>
  );
}
