import Layout from '../components/Layout';
import Navigation from '../components/Navigation';
import Converter from '../components/Converter';
import Footer from '../components/Footer';
import Analytics from '../components/Analytics';
import TemperatureFAQSection, { FAQItem } from '../components/TemperatureFAQSection';
import Head from 'next/head';
import Link from 'next/link';
import {
  celsiusToFahrenheit,
  formatTemperature,
  generateHowToStructuredData,
  generateFAQStructuredData,
  generateRelatedTemperatures,
  generatePageUrl,
  generatePageTitle,
  generateMetaDescription,
  generateOGDescription,
} from '../utils/temperaturePageHelpers';

// ============================================
// 🔧 配置区域 - 修改这些值来创建新页面
// ============================================

// 温度值（摄氏度）
const celsius = 47; // ⚠️ 修改为你的目标温度值

// 计算华氏度
const fahrenheit = celsiusToFahrenheit(celsius);

// 页面URL路径（用于canonical链接）
// 例如：47 -> "47-c-to-f.html", 36.5 -> "36-5-c-to-f.html"
const pagePath = `${celsius}-c-to-f.html`; // ⚠️ 根据实际URL格式修改

// 自定义描述文本（可选，如果不提供则使用默认生成）
const customMetaDescription = undefined; // ⚠️ 可选：自定义meta描述
const customOGDescription = undefined; // ⚠️ 可选：自定义OG描述

// 自定义FAQ问题（可选，如果不提供则使用默认）
const customFAQs: FAQItem[] = [
  {
    question: `What is ${celsius} degrees Celsius in Fahrenheit?`,
    answer: `${celsius} degrees Celsius equals ${formatTemperature(fahrenheit)} degrees Fahrenheit. To convert, use the formula: °F = (°C × 9/5) + 32. So ${celsius} × 1.8 + 32 = ${formatTemperature(fahrenheit)}°F.`,
  },
  // ⚠️ 在这里添加更多自定义FAQ问题
  // {
  //   question: '你的问题',
  //   answer: '你的答案',
  // },
];

// 相关温度链接（可选，如果不提供则自动生成相邻温度）
const relatedTemperatures = generateRelatedTemperatures(celsius, 4); // ⚠️ 可以自定义相关温度

// ============================================
// 📝 内容自定义区域
// ============================================

// 页面标题描述（header部分的描述文本）
const headerDescription = `Convert <strong>${celsius} degrees Celsius to Fahrenheit</strong> instantly. <strong>${celsius}°C equals ${formatTemperature(fahrenheit)}°F</strong>.
Learn the exact conversion formula, step-by-step calculation, and understand the temperature context.`; // ⚠️ 自定义描述

// 警告框内容（可选，如果不需要可以设为null）
const warningBox = {
  title: `⚠️ Critical: ${celsius}°C (${formatTemperature(fahrenheit)}°F) is Life-Threatening`,
  content: `If this is a body temperature reading, <strong>seek immediate medical emergency attention</strong>.
${celsius}°C represents severe hyperthermia that can be fatal. This is not a normal fever but a medical emergency.`,
}; // ⚠️ 根据温度值自定义或设为null

// 温度上下文描述（医疗、环境、烹饪等）
const temperatureContext = {
  medical: {
    title: `⚠️ Medical Warning: ${celsius}°C Body Temperature`,
    content: `<strong>${celsius}°C (${formatTemperature(fahrenheit)}°F) is an extremely dangerous body temperature.</strong> Normal human body
temperature is approximately 37°C (98.6°F). A temperature of ${celsius}°C represents severe hyperthermia
that can be life-threatening and requires immediate medical emergency attention.`,
    list: [
      `<strong>Normal body temperature:</strong> 36.5-37.5°C (97.7-99.5°F)`,
      `<strong>Fever threshold:</strong> 38°C (100.4°F)`,
      `<strong>High fever:</strong> 39-40°C (102.2-104°F)`,
      `<strong>Dangerous hyperthermia:</strong> 41°C+ (105.8°F+)`,
      `<strong>${celsius}°C (${formatTemperature(fahrenheit)}°F):</strong> Life-threatening - seek immediate medical help`,
    ],
  },
  environmental: {
    title: `Environmental Temperature: How Warm is ${celsius}°C?`,
    content: `As an environmental temperature, <strong>${celsius}°C (${formatTemperature(fahrenheit)}°F) is extremely hot</strong> and represents
dangerous heat conditions:`,
    list: [
      `Hotter than most desert climates (Death Valley average: 38-46°C)`,
      `Can cause heatstroke and heat exhaustion`,
      `Requires extreme heat safety precautions`,
      `Similar to temperatures in extremely hot regions during heatwaves`,
    ],
  },
  cooking: {
    title: `Cooking Applications`,
    content: `In cooking, ${celsius}°C (${formatTemperature(fahrenheit)}°F) is used for:`,
    list: [
      `<strong>Low-temperature cooking:</strong> Sous vide techniques for delicate proteins`,
      `<strong>Food safety:</strong> Above the danger zone (4-60°C) for bacterial growth`,
      `<strong>Temperature holding:</strong> Keeping cooked food warm`,
    ],
  },
}; // ⚠️ 根据温度值自定义这些内容

// 负数温度描述（可选）
const negativeTemperatureDescription = `Minus ${celsius} degrees Celsius equals <strong>${formatTemperature(celsiusToFahrenheit(-celsius))} degrees Fahrenheit</strong>.
This is extremely cold, similar to temperatures found in polar regions during winter months.`; // ⚠️ 自定义负数温度描述

// ============================================
// 🎨 样式自定义区域（可选）
// ============================================

// 警告框样式
const warningBoxStyle = {
  background: 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)',
  color: 'white',
  padding: '1.5rem',
  borderRadius: '12px',
  marginTop: '1.5rem',
  border: '3px solid #c92a2a',
}; // ⚠️ 可以自定义样式

// ============================================
// 🚀 页面组件
// ============================================

export default function TemperaturePage() {
  // 生成结构化数据
  const structuredData = generateHowToStructuredData(celsius, fahrenheit);
  const faqStructuredData = generateFAQStructuredData(celsius, fahrenheit, customFAQs);

  // 生成Meta信息
  const pageTitle = generatePageTitle(celsius, fahrenheit);
  const metaDescription = generateMetaDescription(celsius, fahrenheit, customMetaDescription);
  const ogDescription = generateOGDescription(celsius, fahrenheit, customOGDescription);
  const canonicalUrl = generatePageUrl(celsius);

  return (
    <Layout>
      <Head>
        <title>{pageTitle}</title>
        <meta name="description" content={metaDescription} />
        <link rel="canonical" href={canonicalUrl} />
        <meta property="og:title" content={`${celsius}°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) Converter`} />
        <meta property="og:description" content={ogDescription} />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`${celsius}°C to Fahrenheit (${formatTemperature(fahrenheit)}°F) Converter`} />
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
              <Link href="/">Home</Link>
            </li>
            <li aria-current="page">{celsius}°C to Fahrenheit</li>
          </ol>
        </nav>

        <article>
          <header style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2.5rem', marginBottom: '1rem', lineHeight: '1.2' }}>
              {celsius}°C to Fahrenheit ({formatTemperature(fahrenheit)}°F) - Complete Conversion Guide
            </h1>
            <p style={{ fontSize: '1.2rem', color: '#666', marginBottom: '1rem' }}>
              <span dangerouslySetInnerHTML={{ __html: headerDescription }} />
            </p>
            {warningBox && (
              <div style={warningBoxStyle}>
                <h2 style={{ color: 'white', marginTop: 0, fontSize: '1.5rem' }}>
                  {warningBox.title}
                </h2>
                <p style={{ marginBottom: 0, fontSize: '1.1rem' }}>
                  <span dangerouslySetInnerHTML={{ __html: warningBox.content }} />
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
              {celsius}°C = {formatTemperature(fahrenheit)}°F
            </div>
            <p style={{ fontSize: '1.2rem', color: '#666', margin: 0 }}>
              {/* 这里可以添加数字转文字的显示，例如 "Forty-seven degrees..." */}
              {celsius} degrees Celsius equals {formatTemperature(fahrenheit)} degrees Fahrenheit
            </p>
          </section>

          <section>
            <h2>{celsius} Celsius to Fahrenheit Conversion Formula</h2>
            <p>
              To convert {celsius}°C to Fahrenheit, use the standard Celsius to Fahrenheit conversion formula:
            </p>
            <div className="formula-box" style={{ fontSize: '1.5rem', margin: '1.5rem 0' }}>
              °F = (°C × 9/5) + 32
            </div>
            <p>Applying this formula to {celsius}°C:</p>
            <div style={{
              background: 'white',
              padding: '1.5rem',
              borderRadius: '8px',
              margin: '1rem 0',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
            }}>
              <p><strong>Step 1:</strong> Multiply {celsius} by 9/5 (or 1.8)</p>
              <p style={{ marginLeft: '2rem' }}>{celsius} × 1.8 = {formatTemperature(celsius * 1.8)}</p>
              <p><strong>Step 2:</strong> Add 32 to the result</p>
              <p style={{ marginLeft: '2rem' }}>
                {formatTemperature(celsius * 1.8)} + 32 = <strong>{formatTemperature(fahrenheit)}°F</strong>
              </p>
            </div>
          </section>

          <section>
            <h2>{celsius}°C Temperature Context and Applications</h2>

            {temperatureContext.medical && (
              <div style={{
                background: '#ffebee',
                borderLeft: '5px solid #e53935',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#c62828', marginTop: 0 }}>{temperatureContext.medical.title}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: temperatureContext.medical.content }} />
                </p>
                <ul>
                  {temperatureContext.medical.list.map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>
            )}

            {temperatureContext.environmental && (
              <div style={{
                background: '#fff3e0',
                borderLeft: '5px solid #ff9800',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#e65100', marginTop: 0 }}>{temperatureContext.environmental.title}</h3>
                <p>
                  <span dangerouslySetInnerHTML={{ __html: temperatureContext.environmental.content }} />
                </p>
                <ul>
                  {temperatureContext.environmental.list.map((item, index) => (
                    <li key={index}>{item}</li>
                  ))}
                </ul>
              </div>
            )}

            {temperatureContext.cooking && (
              <div style={{
                background: '#e3f2fd',
                borderLeft: '5px solid #2196f3',
                padding: '1.5rem',
                borderRadius: '8px',
                margin: '1.5rem 0',
              }}>
                <h3 style={{ color: '#1565c0', marginTop: 0 }}>{temperatureContext.cooking.title}</h3>
                <p>{temperatureContext.cooking.content}</p>
                <ul>
                  {temperatureContext.cooking.list.map((item, index) => (
                    <li key={index} dangerouslySetInnerHTML={{ __html: item }} />
                  ))}
                </ul>
              </div>
            )}
          </section>

          <section>
            <h2>{celsius} Celsius vs Fahrenheit Comparison</h2>
            <p>
              Understanding how {celsius}°C compares in both temperature scales helps put this temperature in context:
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
                  <td style={{ padding: '10px 12px', fontWeight: 'bold' }}>{celsius}°C (This temperature)</td>
                  <td style={{ padding: '10px 12px' }}>{celsius}°C</td>
                  <td style={{ padding: '10px 12px' }}>{formatTemperature(fahrenheit)}°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>Normal body temperature</td>
                  <td style={{ padding: '10px 12px' }}>37°C</td>
                  <td style={{ padding: '10px 12px' }}>98.6°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>Water boiling point</td>
                  <td style={{ padding: '10px 12px' }}>100°C</td>
                  <td style={{ padding: '10px 12px' }}>212°F</td>
                </tr>
                <tr>
                  <td style={{ padding: '10px 12px' }}>Room temperature</td>
                  <td style={{ padding: '10px 12px' }}>20-22°C</td>
                  <td style={{ padding: '10px 12px' }}>68-72°F</td>
                </tr>
              </tbody>
            </table>
          </section>

          <section>
            <h2>Negative {celsius} Celsius to Fahrenheit</h2>
            <p>
              For those searching for <strong>"minus {celsius} c to f"</strong> or <strong>"negative {celsius} celsius to fahrenheit"</strong>:
            </p>
            <div style={{
              background: '#e1f5fe',
              borderLeft: '5px solid #03a9f4',
              padding: '1.5rem',
              borderRadius: '8px',
              margin: '1.5rem 0',
            }}>
              <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: '0.5rem 0' }}>
                -{celsius}°C = {formatTemperature(celsiusToFahrenheit(-celsius))}°F
              </p>
              <p>
                <span dangerouslySetInnerHTML={{ __html: negativeTemperatureDescription }} />
              </p>
            </div>
          </section>

          <section>
            <h2>Frequently Asked Questions</h2>
            <TemperatureFAQSection faqs={customFAQs} />
          </section>

          <section>
            <h2>Use Our Temperature Converter</h2>
            <p>
              Need to convert other temperatures? Use our interactive converter below to convert any Celsius
              temperature to Fahrenheit instantly.
            </p>
            <Converter />
          </section>

          <section>
            <h2>Related Temperature Conversions</h2>
            <p>Explore similar temperature conversions:</p>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
              gap: '1rem',
              margin: '1.5rem 0',
            }}>
              {relatedTemperatures.map((temp) => (
                <Link
                  key={temp.celsius}
                  href={temp.href}
                  style={{
                    background: 'white',
                    padding: '1rem',
                    borderRadius: '8px',
                    boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
                    textDecoration: 'none',
                    color: 'inherit',
                    display: 'block',
                  }}
                >
                  <strong>{temp.celsius}°C to Fahrenheit</strong>
                  <br />
                  <span style={{ color: '#777', fontSize: '0.9rem' }}>
                    {formatTemperature(temp.fahrenheit)}°F
                  </span>
                </Link>
              ))}
            </div>
          </section>
        </article>
      </main>
      <Footer />
      <Analytics />
    </Layout>
  );
}

