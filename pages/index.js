import Head from 'next/head'
import { useState, useEffect } from 'react'
import { celsiusToFahrenheit, formatTemperature } from '../utils/converter'

export default function HomePage() {
  const [celsius, setCelsius] = useState('')
  const [fahrenheit, setFahrenheit] = useState('--')
  const [history, setHistory] = useState([])
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [faqOpen, setFaqOpen] = useState({})
  const [lastUpdated, setLastUpdated] = useState({ dateString: '', formatted: '' })
  
  // Get current date for "Last updated" - only on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const now = new Date()
      const year = now.getFullYear()
      const month = now.toLocaleDateString('en-US', { month: 'long' })
      const day = now.getDate()
      const dateString = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
      setLastUpdated({ dateString, formatted: `${month} ${day}, ${year}` })
    }
  }, [])

  // Load history from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedHistory = localStorage.getItem('conversionHistory')
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory))
      }
    }
  }, [])

  // Handle conversion
  const handleConversion = (value) => {
    if (value === '' || value === null || value === undefined) {
      setFahrenheit('--')
      return
    }

    const celsiusValue = parseFloat(value)
    if (isNaN(celsiusValue)) {
      setFahrenheit('--')
      return
    }

    if (celsiusValue < -273.15) {
      setFahrenheit('--')
      return
    }

    const fahrenheitValue = celsiusToFahrenheit(celsiusValue)
    setFahrenheit(formatTemperature(fahrenheitValue, 'F', 1))

    // Add to history
    if (celsiusValue !== 0 && celsiusValue !== 100) {
      const newEntry = {
        celsius: celsiusValue,
        fahrenheit: fahrenheitValue,
        timestamp: Date.now()
      }
      const newHistory = [newEntry, ...history.filter(h => 
        Math.abs(h.celsius - celsiusValue) > 0.1
      )].slice(0, 10)
      setHistory(newHistory)
      if (typeof window !== 'undefined') {
        localStorage.setItem('conversionHistory', JSON.stringify(newHistory))
      }
    }
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setCelsius(value)
    handleConversion(value)
  }

  const handleCopy = () => {
    if (fahrenheit !== '--') {
      navigator.clipboard.writeText(fahrenheit)
    }
  }

  const clearHistory = () => {
    setHistory([])
    if (typeof window !== 'undefined') {
      localStorage.removeItem('conversionHistory')
    }
  }

  const toggleFaq = (index) => {
    setFaqOpen(prev => ({
      ...prev,
      [index]: !prev[index]
    }))
  }

  const step1Value = celsius ? (parseFloat(celsius) * 9/5).toFixed(2) : '--'
  const step2Value = celsius ? (parseFloat(celsius) * 9/5 + 32).toFixed(2) : '--'

  return (
    <>
      <Head>
        <title>Celsius to Fahrenheit | °C to °F Converter</title>
        <meta name="description" content="Convert Celsius to Fahrenheit quickly with the C to F Converter. Get results instantly, learn the formula, and check the conversion chart." />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://ctofconverter.com" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta property="og:title" content="Celsius to Fahrenheit Converter" />
        <meta property="og:description" content="Free Online Temperature Calculator for Instant Conversions. Instantly convert temperatures from Celsius (°C) to Fahrenheit (°F) with precise results and step-by-step details." />
        <meta property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta property="og:url" content="https://ctofconverter.com/" />
        <meta property="og:type" content="website" />
        <meta name="theme-color" content="#3498db" />
        
        {/* WebApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "Celsius to Fahrenheit Converter",
              "url": "https://ctofconverter.com/",
              "description": "Free online tool to convert temperatures from Celsius to Fahrenheit with detailed calculation steps",
              "applicationCategory": "UtilityApplication",
              "operatingSystem": "All",
              "browserRequirements": "Requires JavaScript",
              "screenshot": "https://ctofconverter.com/converter.png",
              "offers": {
                "@type": "Offer",
                "price": "0",
                "priceCurrency": "USD"
              },
              "creator": {
                "@type": "Organization",
                "name": "Temperature Conversion Experts"
              },
              "potentialAction": {
                "@type": "ConvertAction",
                "target": {
                  "@type": "EntryPoint",
                  "actionPlatform": [
                    "http://schema.org/DesktopWebPlatform",
                    "http://schema.org/MobileWebPlatform"
                  ],
                  "urlTemplate": "https://ctofconverter.com/?celsius={celsius}"
                },
                "object": {
                  "@type": "PropertyValueSpecification",
                  "valueName": "celsius",
                  "valueRequired": true,
                  "defaultValue": "25"
                },
                "result": {
                  "@type": "PropertyValueSpecification",
                  "valueName": "fahrenheit"
                }
              }
            })
          }}
        />

        {/* FAQPage Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "FAQPage",
              "mainEntity": [
                {
                  "@type": "Question",
                  "name": "What is the difference between Celsius and Fahrenheit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Celsius and Fahrenheit are two different temperature measurement units. 1 degree Celsius = 33.8 degrees Fahrenheit. Celsius is widely used internationally, while Fahrenheit is primarily used in the United States. They use different scales: in Celsius, water freezes at 0°C and boils at 100°C; in Fahrenheit, water freezes at 32°F and boils at 212°F."
                  }
                },
                {
                  "@type": "Question",
                  "name": "How can I quickly estimate the conversion between Celsius and Fahrenheit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "A simple estimation method is to multiply the Celsius temperature by 2, then add 30 (instead of the accurate multiplication by 9/5 and adding 32). For example, 20°C is approximately (20×2)+30=70°F (actually 68°F). This method provides a close enough estimate for everyday use."
                  }
                },
                {
                  "@type": "Question",
                  "name": "At what temperature are Celsius and Fahrenheit equal?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "The Celsius to Fahrenheit function is °F = (°C × 9/5) + 32. Celsius and Fahrenheit are equal at -40 degrees. That is, -40°C = -40°F. This is the intersection point of the two temperature scales."
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is Celsius temperature bad for you?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": "Celsius is just a temperature scale, not inherently good or bad. What matters is the actual temperature value. For example, 37°C is normal body temperature while 60°C can cause burns."
                  }
                }
              ]
            })
          }}
        />

        {/* HowTo Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": "How to Convert Celsius to Fahrenheit",
              "description": "Step-by-step guide to convert temperatures from Celsius to Fahrenheit using the formula °F = (°C × 9/5) + 32",
              "step": [
                {
                  "@type": "HowToStep",
                  "position": 1,
                  "name": "Multiply by 9/5",
                  "text": "Multiply the Celsius temperature by 9/5 (or 1.8). For example, if you have 20°C, multiply 20 by 9/5 to get 36.",
                  "itemListElement": {
                    "@type": "HowToDirection",
                    "text": "Multiply the Celsius temperature by 9/5"
                  }
                },
                {
                  "@type": "HowToStep",
                  "position": 2,
                  "name": "Add 32",
                  "text": "Add 32 to the result from step 1. Continuing the example: 36 + 32 = 68.",
                  "itemListElement": {
                    "@type": "HowToDirection",
                    "text": "Add 32 to the result from step 1"
                  }
                },
                {
                  "@type": "HowToStep",
                  "position": 3,
                  "name": "Final Result",
                  "text": "The final result is the Fahrenheit temperature. In our example, 20°C equals 68°F.",
                  "itemListElement": {
                    "@type": "HowToDirection",
                    "text": "The final result is the Fahrenheit temperature"
                  }
                }
              ],
              "totalTime": "PT1M"
            })
          }}
        />
      </Head>

      <a className="skip-link" href="#main-content">Skip to main content</a>
      
      <header className="site-header">
        <div className="container">
          <div className="site-logo">
            <a href="/" aria-label="Home - Celsius to Fahrenheit Converter">
              <span aria-hidden="true">C to F Converter</span>
              <span className="sr-only">Celsius to Fahrenheit Converter</span>
            </a>
          </div>
          <h1>Celsius to Fahrenheit Converter (°C to °F)</h1>
          <p className="tagline">Free online temperature conversion tool that instantly converts degrees Celsius (°C) to degrees Fahrenheit (°F), with conversion formulas and detailed steps.</p>
        </div>
      </header>

      <nav className="main-nav" role="navigation" aria-label="Main temperature conversion navigation">
        <div className="container">
          <button 
            className="mobile-menu-toggle" 
            aria-label="Toggle navigation menu" 
            aria-expanded={mobileMenuOpen}
            aria-controls="nav-links"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
            <span className="menu-icon"></span>
          </button>
          <ul className={`nav-links ${mobileMenuOpen ? 'active' : ''}`} id="nav-links">
            <li>
              <a href="/" className="active" aria-current="page">Celsius to Fahrenheit</a>
            </li>
            <li>
              <a href="/fahrenheit-to-celsius/" aria-label="Convert Fahrenheit to Celsius">Fahrenheit to Celsius</a>
            </li>
            <li>
              <a href="/c-to-f-calculator/" aria-label="Fast Celsius to Fahrenheit calculator">C to F Calculator</a>
            </li>
          </ul>
        </div>
      </nav>

      <main id="main-content" className="container">
        <nav aria-label="Breadcrumb navigation" className="breadcrumb-nav">
          <ol className="breadcrumb">
            <li><a href="/">Home</a></li>
            <li aria-current="page">Celsius to Fahrenheit</li>
          </ol>
        </nav>

        <section className="converter-tool" role="region" aria-labelledby="converter-title">
          <h2 id="converter-title" className="converter-title">Celsius to Fahrenheit Converter</h2>
          <p className="converter-description">Instantly convert <span className="nowrap">°C to °F</span> for free. Ideal for cooking, travel, and science. Get accurate results in seconds!</p>

          <div className="converter-form">
            <div className="input-group">
              <div className="input-header">
                <label htmlFor="celsius">Celsius (°C)</label>
                <button className="info-btn" aria-label="About Celsius scale" title="Water freezes at 0°C and boils at 100°C">ℹ️</button>
              </div>
              <input
                type="number"
                id="celsius"
                inputMode="decimal"
                placeholder="e.g. 37.5"
                step="0.1"
                min="-273.15"
                value={celsius}
                onChange={handleInputChange}
                aria-describedby="celsius-help"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <div id="celsius-help" className="sr-only">Enter temperature between -273.15°C and 1,000,000°C</div>
            </div>

            <div className="result-container" role="region" aria-live="polite" aria-atomic="true">
              <div className="result-header">
                <label id="fahrenheit-label">Fahrenheit (°F)</label>
                <button className="info-btn" aria-label="About Fahrenheit scale" title="Water freezes at 32°F and boils at 212°F">ℹ️</button>
              </div>
              <output className="result-value" id="fahrenheit-result">{fahrenheit}</output>
              <button className="btn" id="copy-btn" onClick={handleCopy} aria-label="Copy temperature result to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                </svg>
                <span className="btn-text">Copy</span>
                <span className="sr-only">temperature result</span>
              </button>
            </div>
          </div>

          <section className="history-container" aria-labelledby="history-heading">
            <div className="history-header">
              <h3 id="history-heading">Recent Conversions</h3>
              {history.length > 0 && (
                <button className="clear-history" onClick={clearHistory} aria-label="Clear all conversion history">
                  <span aria-hidden="true">🗑️</span>
                  <span>Clear History</span>
                </button>
              )}
            </div>
            {history.length > 0 ? (
              <ul id="history-list" className="history-list">
                {history.map((item, index) => (
                  <li key={index}>
                    <strong>{formatTemperature(item.celsius, 'C', 1)}</strong> = {formatTemperature(item.fahrenheit, 'F', 1)}
                  </li>
                ))}
              </ul>
            ) : (
              <p id="empty-history-message" className="sr-only" aria-live="polite">No conversion history available</p>
            )}
          </section>

          <section className="formula-section" role="region" aria-labelledby="formula-title">
            <h2 id="formula-title">Celsius to Fahrenheit Formula</h2>
            <div className="formula">
              <h3>Equation to Convert Celsius to Fahrenheit</h3>
              <div className="formula-box">°F = (°C × 9/5) + 32</div>
              <p className="example">Example: 20°C = (20 × 9/5) + 32 = 68°F</p>
            </div>
          </section>

          <div className="conversion-steps">
            <h3>How to Convert Celsius to Fahrenheit</h3>
            <p className="converter-description">Click each step to see detailed calculation</p>
            
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4 className="step-title">Multiply by 9/5</h4>
                <div className="step-description">Multiply the Celsius temperature by 9/5 (or 1.8)</div>
                <div className="step-visualization" aria-live="polite">
                  {celsius ? `${celsius} × 9/5 = ${step1Value}` : 'Enter a temperature to see calculation'}
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4 className="step-title">Add 32</h4>
                <div className="step-description">Add 32 to the result from step 1</div>
                <div className="step-visualization" aria-live="polite">
                  {celsius ? `${step1Value} + 32 = ${step2Value}°F` : 'Enter a temperature to see calculation'}
                </div>
              </div>
            </div>

            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4 className="step-title">Final Result</h4>
                <div className="step-description">Get the final Fahrenheit temperature result</div>
                <div className="step-visualization" aria-live="polite">
                  {celsius && fahrenheit !== '--' ? `Result: ${fahrenheit}` : 'Enter a temperature to see result'}
                </div>
              </div>
            </div>

            <div className="common-errors">
              <h4>Celsius to Fahrenheit Conversion Common Mistakes</h4>
              <ul>
                <li><strong>Forgetting to add 32</strong> - <span>Only multiplying by 9/5 will give incorrect results</span></li>
                <li><strong>Incorrect order of operations</strong> - <span>Adding 32 first and then multiplying by 9/5 is incorrect</span></li>
                <li><strong>Using the wrong fraction</strong> - <span>Using 2/3 instead of 9/5 is a common error</span></li>
                <li><strong>Rounding too early</strong> - <span>Rounding intermediate results can lead to inaccuracies</span></li>
              </ul>
            </div>
          </div>
        </section>

        <section className="reference-section" role="region" aria-labelledby="reference-title">
          <h2 id="reference-title">Common Celsius to Fahrenheit Conversions</h2>
          <div className="update-grid">
            {[
              { temp: '38.5', f: '101.7', date: '2025-11-11' },
              { temp: '36.5', f: '97.7', date: '2025-11-05' },
              { temp: '36.8', f: '98.24', date: '2025-10-28' },
              { temp: '90', f: '162', date: '2025-10-27' },
              { temp: '38.2', f: '100.76', date: '2025-10-26' },
              { temp: '37.1', f: '98.78', date: '2025-10-24' },
              { temp: '36.9', f: '98.42', date: '2025-10-23' },
              { temp: '103', f: '39.44', link: 'fahrenheit-to-celsius/103-f-to-c.html', date: '2025-08-03' },
              { temp: '1', f: '33.8', date: '2025-07-26' },
              { temp: '60', f: '140', date: '2025-06-30' },
              { temp: '35', f: '95', date: '2025-05-23' },
              { temp: '46', f: '114.8', date: '2025-05-22' },
              { temp: '13', f: '55.4', date: '2025-05-21' },
              { temp: '44', f: '111.2', date: '2025-05-16' },
              { temp: '120', f: '248', date: '2025-05-15' },
              { temp: '42', f: '107.6', date: '2025-05-14' },
              { temp: '105', f: '221', date: '2025-05-13' },
              { temp: '73', f: '163.4', date: '2025-05-09' },
              { temp: '210', f: '410', date: '2025-05-08' },
              { temp: '39', f: '102.2', date: '2025-05-06' },
            ].map((item, index) => (
              <article key={index} className="update-card">
                <p>
                  <a href={item.link || `${item.temp.replace('.', '-')}-c-to-f.html`} className="update-title">
                    {item.temp}°C to Fahrenheit ({item.f}°F)
                  </a>
                </p>
                <time dateTime={item.date}>
                  Updated: {new Date(item.date).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time>
              </article>
            ))}
          </div>

          <a href="/downloads/celsius-to-fahrenheit-chart.pdf" id="download-pdf-btn" className="pdf-download-btn">
            <span className="btn-icon">📄</span>
            <span className="btn-text">Download the Celsius to Fahrenheit Conversion Chart (PDF)</span>
          </a>

          <div className="info-cards">
            <div className="info-card">
              <h3>About Celsius and Fahrenheit Temperature Units</h3>
              <p><strong>Celsius (°C)</strong> is widely used internationally. At standard atmospheric pressure, water freezes at 0°C and boils at 100°C.</p>
              <p><strong>Fahrenheit (°F)</strong> is primarily used in the United States. At standard atmospheric pressure, water freezes at 32°F and boils at 212°F.</p>
            </div>
          </div>
        </section>

        <section className="formula-section" role="region" aria-labelledby="practical-title">
          <h2 id="practical-title">Practical Scenarios for Celsius to Fahrenheit Conversion</h2>
          <div className="practical-uses">
            <div className="use-case">
              <div className="use-case-header">Cooking</div>
              <div className="use-case-body">
                <p>Oven temperature settings, recipe temperature conversions, controlling temperatures for melting sugar syrups and chocolate.</p>
                <ul className="use-case-examples">
                  <li><strong>Baking temperature:</strong> 180°C = 356°F (standard baking temperature)</li>
                  <li><strong>Low temperature cooking:</strong> 65°C = 149°F (ideal temperature for slow cooking meat)</li>
                  <li><strong>Chocolate melting:</strong> 45°C = 113°F (avoid overheating chocolate)</li>
                </ul>
              </div>
            </div>

            <div className="use-case">
              <div className="use-case-header">Weather Forecast</div>
              <div className="use-case-body">
                <p>Understanding local temperatures during international travel, adapting to different countries' weather reporting systems.</p>
                <ul className="use-case-examples">
                  <li><strong>Summer comfort temperature:</strong> 22-26°C = 72-79°F</li>
                  <li><strong>Winter indoor temperature:</strong> 20-22°C = 68-72°F</li>
                  <li><strong>Heat wave warning:</strong> &gt;35°C = &gt;95°F (temperature at which most countries issue heat wave warnings)</li>
                </ul>
              </div>
            </div>

            <div className="use-case">
              <div className="use-case-header">Medical</div>
              <div className="use-case-body">
                <p>Body temperature monitoring, medical equipment temperature conversion, medication storage temperature requirements.</p>
                <ul className="use-case-examples">
                  <li><strong>Normal body temperature:</strong> 36.5-37.5°C = 97.7-99.5°F</li>
                  <li><strong>Fever:</strong> &gt;38°C = &gt;100.4°F</li>
                  <li><strong>Hypothermia risk:</strong> &lt;35°C = &lt;95°F</li>
                </ul>
              </div>
            </div>

            <div className="use-case">
              <div className="use-case-header">Scientific Research</div>
              <div className="use-case-body">
                <p>Laboratory temperature control, temperature unit conversion in scientific literature, international research collaboration.</p>
                <ul className="use-case-examples">
                  <li><strong>Laboratory standard temperature:</strong> 20-25°C = 68-77°F</li>
                  <li><strong>Freezer storage:</strong> -80°C = -112°F (long-term biological sample preservation)</li>
                  <li><strong>PCR reaction:</strong> 95°C = 203°F (DNA denaturation temperature)</li>
                </ul>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" role="region" aria-labelledby="faq-title">
          <h2 id="faq-title">Frequently Asked Questions (FAQ)</h2>

          {[
            {
              q: 'What is the difference between Celsius and Fahrenheit?',
              a: 'Celsius and Fahrenheit are two different temperature measurement units. 1 degree Celsius = 33.8 degrees Fahrenheit. Celsius is widely used internationally, while Fahrenheit is primarily used in the United States. They use different scales: in Celsius, water freezes at 0°C and boils at 100°C; in Fahrenheit, water freezes at 32°F and boils at 212°F.'
            },
            {
              q: 'How can I quickly estimate the conversion between Celsius and Fahrenheit?',
              a: 'A simple estimation method is to multiply the Celsius temperature by 2, then add 30 (instead of the accurate multiplication by 9/5 and adding 32). For example, 20°C is approximately (20×2)+30=70°F (actually 68°F). This method provides a close enough estimate for everyday use.'
            },
            {
              q: 'At what temperature are Celsius and Fahrenheit equal?',
              a: 'The Celsius to Fahrenheit function is °F = (°C × 9/5) + 32. Celsius and Fahrenheit are equal at -40 degrees. That is, -40°C = -40°F. This is the intersection point of the two temperature scales.'
            },
            {
              q: 'Is Celsius temperature bad for you?',
              a: 'Celsius is just a temperature scale, not inherently good or bad. What matters is the actual temperature value. For example, 37°C is normal body temperature while 60°C can cause burns.'
            }
          ].map((faq, index) => (
            <div key={index} className={`faq-item ${faqOpen[index] ? 'active' : ''}`}>
              <div 
                className="faq-question" 
                onClick={() => toggleFaq(index)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && toggleFaq(index)}
                aria-expanded={faqOpen[index]}
              >
                {faq.q}
              </div>
              <div className="faq-answer">
                {faq.a}
              </div>
            </div>
          ))}
        </section>
      </main>

      <footer className="site-footer" role="contentinfo">
        <div className="container">
          <nav className="footer-navigation" aria-label="Footer navigation">
            <div className="footer-links-grid">
              <div className="footer-links-group">
                <h3 className="footer-heading" id="footer-nav-heading">Navigation</h3>
                <ul className="footer-link-list" aria-labelledby="footer-nav-heading">
                  <li><a href="/" className="footer-link">Celsius to Fahrenheit</a></li>
                  <li><a href="/fahrenheit-to-celsius/" className="footer-link">Fahrenheit to Celsius</a></li>
                </ul>
              </div>
              <div className="footer-links-group">
                <h3 className="footer-heading" id="footer-chart-heading">Chart</h3>
                <ul className="footer-link-list" aria-labelledby="footer-chart-heading">
                  <li><a href="/celsius-to-fahrenheit-chart/" className="footer-link">Celsius to Fahrenheit Conversion Chart</a></li>
                  <li><a href="/fan-oven-conversion-chart/" className="footer-link">Fan Oven Temperature Conversion Chart</a></li>
                  <li><a href="/body-temperature-chart-fever-guide/" className="footer-link">Body Temperature Chart & Fever Guide</a></li>
                  <li><a href="/fever-temperature-chart/" className="footer-link">Fever Temperature Chart</a></li>
                </ul>
              </div>
              <div className="footer-links-group">
                <h3 className="footer-heading" id="footer-legal-heading">Legal</h3>
                <ul className="footer-link-list" aria-labelledby="footer-legal-heading">
                  <li><a href="/privacy-policy.html" className="footer-link">Privacy Policy</a></li>
                  <li><a href="/terms-of-service.html" className="footer-link">Terms of Service</a></li>
                  <li><a href="/about-us.html" className="footer-link">About Us</a></li>
                </ul>
              </div>
            </div>
          </nav>

          <div className="footer-extra">
            <div className="copyright-notice">
              <p>© 2025 Ctofconverter. All rights reserved.</p>
              <p className="footer-meta">
                <span>Last updated: <time dateTime={lastUpdated.dateString || new Date().toISOString().split('T')[0]}>
                  {lastUpdated.formatted || new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
                </time></span>
              </p>
            </div>
            <div className="back-to-top">
              <a href="#top" className="back-to-top-link" aria-label="Back to top">
                <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
                  <path d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z" fill="currentColor"></path>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </footer>
    </>
  )
}