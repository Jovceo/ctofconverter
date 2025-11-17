import Head from 'next/head'
import { useState, useEffect } from 'react'
import { celsiusToFahrenheit, formatTemperature, getTemperatureContext } from '../utils/converter'

export default function Celsius47Page() {
  const celsius = 47
  const fahrenheit = celsiusToFahrenheit(celsius)
  const context = getTemperatureContext(celsius)
  const [inputCelsius, setInputCelsius] = useState('')
  const [inputFahrenheit, setInputFahrenheit] = useState('--')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Step calculations
  const step1 = (celsius * 9/5).toFixed(2)
  const step2 = fahrenheit.toFixed(1)

  // Handle conversion for interactive converter
  const handleConversion = (value) => {
    if (value === '' || value === null || value === undefined) {
      setInputFahrenheit('--')
      return
    }

    const celsiusValue = parseFloat(value)
    if (isNaN(celsiusValue)) {
      setInputFahrenheit('--')
      return
    }

    if (celsiusValue < -273.15) {
      setInputFahrenheit('--')
      return
    }

    const fahrenheitValue = celsiusToFahrenheit(celsiusValue)
    setInputFahrenheit(formatTemperature(fahrenheitValue, 'F', 1))
  }

  const handleInputChange = (e) => {
    const value = e.target.value
    setInputCelsius(value)
    handleConversion(value)
  }

  const handleCopy = () => {
    if (inputFahrenheit !== '--') {
      navigator.clipboard.writeText(inputFahrenheit)
    }
  }

  // Get current date
  const [lastUpdated, setLastUpdated] = useState({ dateString: '', formatted: '' })
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

  return (
    <>
      <Head>
        <title>47°C to Fahrenheit ({fahrenheit.toFixed(1)}°F) | Conversion Guide, Chart & Safety Info</title>
        <meta name="description" content={`Convert 47 degrees Celsius to Fahrenheit: 47°C = ${fahrenheit.toFixed(1)}°F. Learn the formula, see calculation steps, temperature chart, and critical safety warnings. Is 47°C a fever? How hot is 47°C?`} />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="canonical" href="https://ctofconverter.com/47-c-to-f.html" />
        <meta name="author" content="Temperature Conversion Experts" />
        <meta name="robots" content="index, follow" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <meta property="og:title" content={`47°C to Fahrenheit (${fahrenheit.toFixed(1)}°F) | Conversion Chart & Safety Guide`} />
        <meta property="og:description" content={`Convert 47°C to ${fahrenheit.toFixed(1)}°F instantly. Learn the formula, see temperature chart, and critical safety warnings. Is 47°C a fever? How hot is 47°C?`} />
        <meta property="og:image" content="https://ctofconverter.com/converter.png" />
        <meta property="og:url" content="https://ctofconverter.com/47-c-to-f.html" />
        <meta property="og:type" content="website" />
        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content={`47°C to Fahrenheit (${fahrenheit.toFixed(1)}°F) | Chart & Safety Info`} />
        <meta name="twitter:description" content={`47°C = ${fahrenheit.toFixed(1)}°F. Complete conversion guide with formula, temperature chart, and critical safety warnings.`} />
        <meta name="theme-color" content="#3498db" />

        {/* HowTo Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "HowTo",
              "name": `How to Convert 47°C to Fahrenheit`,
              "description": "Step-by-step guide to convert Celsius to Fahrenheit",
              "totalTime": "PT1M",
              "estimatedCost": {
                "@type": "MonetaryAmount",
                "currency": "USD",
                "value": "0"
              },
              "step": [
                {
                  "@type": "HowToStep",
                  "text": `Start with the temperature in Celsius: ${celsius}°C`,
                  "name": "Identify Celsius Value"
                },
                {
                  "@type": "HowToStep",
                  "text": `Multiply by 9/5: ${celsius} × 9/5 = ${celsius} × 1.8 = ${step1}`,
                  "name": "Multiply by Fraction"
                },
                {
                  "@type": "HowToStep",
                  "text": `Add 32 to the result: ${step1} + 32 = ${step2}`,
                  "name": "Add 32 Degrees"
                },
                {
                  "@type": "HowToStep",
                  "text": `The final result is ${fahrenheit.toFixed(1)}°F`,
                  "name": "Final Conversion"
                }
              ]
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
                  "name": `What is ${celsius} degrees Celsius in Fahrenheit?`,
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `${celsius} degrees Celsius equals ${fahrenheit.toFixed(1)} degrees Fahrenheit. To convert, use the formula: °F = (°C × 9/5) + 32`,
                    "datePublished": new Date().toISOString().split('T')[0],
                    "author": {"@type": "Organization", "name": "Temperature Experts"}
                  }
                },
                {
                  "@type": "Question",
                  "name": "Is 47°C a fever?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `No, 47°C (${fahrenheit.toFixed(1)}°F) is NOT a normal fever. Normal fevers range from 38-40°C (100.4-104°F). A body temperature of 47°C indicates a severe medical emergency requiring immediate medical attention.`,
                    "datePublished": new Date().toISOString().split('T')[0]
                  }
                },
                {
                  "@type": "Question",
                  "name": "How warm is 47 degrees Celsius?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `47°C (${fahrenheit.toFixed(1)}°F) is extremely hot and dangerous. It's comparable to extreme heatwave conditions, industrial high-temperature processes, or a car interior in direct sunlight. This temperature can cause heatstroke and organ damage with prolonged exposure.`,
                    "datePublished": new Date().toISOString().split('T')[0]
                  }
                },
                {
                  "@type": "Question",
                  "name": "What is minus 47 Celsius in Fahrenheit?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `-47°C equals ${celsiusToFahrenheit(-47).toFixed(1)}°F. This is an extremely cold temperature, well below freezing, found in polar regions or specialized cryogenic applications.`,
                    "datePublished": new Date().toISOString().split('T')[0]
                  }
                },
                {
                  "@type": "Question",
                  "name": "47 Celsius vs Fahrenheit - what's the difference?",
                  "acceptedAnswer": {
                    "@type": "Answer",
                    "text": `47°C and ${fahrenheit.toFixed(1)}°F represent the same temperature - they're just different measurement scales. Celsius is used internationally, while Fahrenheit is primarily used in the United States. Both indicate an extremely dangerous, life-threatening heat level.`,
                    "datePublished": new Date().toISOString().split('T')[0]
                  }
                }
              ]
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
          <h1>{celsius}°C to Fahrenheit ({celsius} Degrees Celsius to °F)</h1>
          <p className="tagline">Free online temperature conversion tool that instantly converts {celsius} degrees Celsius ({celsius}°C) to degrees Fahrenheit (°F), with conversion formulas and detailed steps.</p>
          {lastUpdated.formatted && (
            <p className="last-updated">Last updated: <time dateTime={lastUpdated.dateString}>{lastUpdated.formatted}</time></p>
          )}
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
            <li><a href="/">Celsius to Fahrenheit</a></li>
            <li aria-current="page">{celsius}°C to Fahrenheit</li>
          </ol>
        </nav>

        <section className="conversion-section" role="region" aria-labelledby="conversion-title">
          <h2 id="conversion-title">{celsius} Degrees Celsius to Fahrenheit Conversion</h2>
          
          <div className="conversion-result">
            <div className="result-box">
              <div className="result-header">{celsius}°C in Fahrenheit is:</div>
              <div className="result-value">{fahrenheit.toFixed(1)}°F</div>
            </div>
          </div>

          <div className="conversion-highlight">
            <p>{celsius}°C converts to <span className="highlight-value">{fahrenheit.toFixed(1)}°F</span></p>
            {context && <p>{context.description}</p>}
          </div>
          
          <div className="conversion-formula">
            <h3>How to Convert {celsius} Celsius to Fahrenheit: Exact Formula</h3>
            <p>To convert from Celsius to Fahrenheit, use the following formula:</p>
            <div className="formula">°F = (°C × 9/5) + 32</div>
            
            <div className="calculation-steps">
              <h4>Step-by-Step Calculation</h4>
              <ol>
                <li>Start with the temperature in Celsius: {celsius}°C</li>
                <li>Multiply by 9/5: {celsius} × 9/5 = {celsius} × 1.8 = {step1}</li>
                <li>Add 32: {step1} + 32 = {step2}</li>
                <li>Result: {celsius}°C = {fahrenheit.toFixed(1)}°F</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="converter-tool" role="region" aria-labelledby="converter-title">
          <h2 id="converter-title" className="converter-title">Celsius to Fahrenheit Converter</h2>
          <p className="converter-description">
            Instantly convert <span className="nowrap">°C to °F</span> for free. Ideal for cooking, travel, and science. Get accurate results in seconds!
          </p>
          
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
                placeholder={`Enter Celsius temperature (e.g., ${celsius})`}
                step="0.1"
                min="-273.15"
                value={inputCelsius}
                onChange={handleInputChange}
                aria-describedby="celsius-help"
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
              <div id="celsius-help" className="sr-only">
                Enter temperature between -273.15°C (absolute zero) and 1,000,000°C
              </div>
            </div>
            
            <div className="result-container" role="region" aria-live="polite" aria-atomic="true">
              <div className="result-header">
                <label id="fahrenheit-label">Fahrenheit (°F)</label>
                <button className="info-btn" aria-label="About Fahrenheit scale" title="Water freezes at 32°F and boils at 212°F">ℹ️</button>
              </div>
              <output className="result-value" id="fahrenheit-result" aria-labelledby="fahrenheit-label">
                {inputFahrenheit}
              </output>
              <button className="btn" id="copy-btn" onClick={handleCopy} aria-label="Copy temperature result to clipboard">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                  <path d="M16 1H4C2.9 1 2 1.9 2 3V17H4V3H16V1ZM19 5H8C6.9 5 6 5.9 6 7V21C6 22.1 6.9 23 8 23H19C20.1 23 21 22.1 21 21V7C21 5.9 20.1 5 19 5ZM19 21H8V7H19V21Z" fill="currentColor"/>
                </svg>
                <span className="btn-text">Copy</span>
                <span className="sr-only">temperature result</span>
              </button>
            </div>
          </div>
        </section>

        <section className="temperature-feel" role="region" aria-labelledby="feel-title">
          <h2 id="feel-title">How Hot is {celsius}°C ({fahrenheit.toFixed(1)}°F)? Temperature Feel and Safety</h2>
          <p><strong>{celsius}°C ({fahrenheit.toFixed(1)}°F) is extremely hot and dangerous.</strong> This temperature is far above normal body temperature (37°C/98.6°F) and poses serious health risks. It's comparable to extreme heatwave conditions or industrial high-temperature processes.</p>
          
          <div className="comfort-scale">
            <div className="comfort-item">
              <div className="comfort-temp">37°C (98.6°F)</div>
              <div className="comfort-desc">Normal Body Temp</div>
            </div>
            <div className="comfort-item">
              <div className="comfort-temp">40°C (104°F)</div>
              <div className="comfort-desc">High Fever</div>
            </div>
            <div className="comfort-item active">
              <div className="comfort-temp">{celsius}°C ({fahrenheit.toFixed(1)}°F)</div>
              <div className="comfort-desc">Extremely Dangerous</div>
            </div>
            <div className="comfort-item">
              <div className="comfort-temp">50°C (122°F)</div>
              <div className="comfort-desc">Life-Threatening</div>
            </div>
          </div>

          <div style={{ background: '#fff3cd', border: '2px solid #ffc107', borderRadius: '8px', padding: '1.5rem', marginTop: '1.5rem' }}>
            <h3 style={{ color: '#856404', marginBottom: '1rem' }}>⚠️ Critical Safety Warning</h3>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>If this is body temperature:</strong> {celsius}°C ({fahrenheit.toFixed(1)}°F) is NOT a normal fever - this is a medical emergency requiring immediate medical attention</li>
              <li><strong>If this is environmental temperature:</strong> Extended exposure can cause heatstroke, organ damage, and death</li>
              <li><strong>Protection required:</strong> Specialized cooling equipment, hydration, and time limits for exposure</li>
              <li><strong>Never leave children or pets</strong> in environments at {celsius}°C ({fahrenheit.toFixed(1)}°F)</li>
            </ul>
          </div>
        </section>

        <section className="medical-warning" role="region" aria-labelledby="medical-title" style={{ background: '#f8d7da', border: '2px solid #dc3545', borderRadius: '8px', padding: '1.5rem', margin: '2rem 0' }}>
          <h2 id="medical-title">Is {celsius}°C ({fahrenheit.toFixed(1)}°F) a Fever? Medical Safety Information</h2>
          <div style={{ lineHeight: '1.8' }}>
            <p><strong>No, {celsius}°C ({fahrenheit.toFixed(1)}°F) is NOT a normal fever temperature.</strong> This is an extremely dangerous temperature that requires immediate medical intervention.</p>
            
            <h3>Normal vs. Dangerous Temperature Ranges:</h3>
            <ul style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li><strong>Normal body temperature:</strong> 36.5-37.5°C (97.7-99.5°F)</li>
              <li><strong>Low-grade fever:</strong> 37.6-38°C (99.7-100.4°F)</li>
              <li><strong>Fever:</strong> 38.1-40°C (100.5-104°F)</li>
              <li><strong>High fever (dangerous):</strong> 40.1-41°C (104.2-105.8°F)</li>
              <li><strong>{celsius}°C ({fahrenheit.toFixed(1)}°F) - CRITICAL:</strong> Far exceeds normal fever range, indicates severe hyperthermia or measurement error</li>
            </ul>

            <p><strong>If you or someone has a body temperature of {celsius}°C ({fahrenheit.toFixed(1)}°F):</strong></p>
            <ol style={{ marginLeft: '1.5rem', marginBottom: '1rem' }}>
              <li>Seek immediate medical emergency care</li>
              <li>This may indicate severe hyperthermia, heatstroke, or thermometer malfunction</li>
              <li>Apply cooling measures while waiting for medical help (if safe to do so)</li>
              <li>Do not attempt to treat this temperature at home</li>
            </ol>
          </div>
        </section>

        <section className="conversion-chart" role="region" aria-labelledby="chart-title">
          <h2 id="chart-title">{celsius}°C to Fahrenheit Conversion Chart</h2>
          <p>Quick reference chart showing {celsius}°C and nearby temperatures in both Celsius and Fahrenheit:</p>
          
          <div className="table-responsive" style={{ marginTop: '1.5rem' }}>
            <table className="table table-striped" style={{ background: 'white' }}>
              <thead className="table-dark">
                <tr>
                  <th>Celsius (°C)</th>
                  <th>Fahrenheit (°F)</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {[45, 46, 47, 48, 49, 50].map(temp => {
                  const f = celsiusToFahrenheit(temp)
                  let desc = ''
                  if (temp === 37) desc = 'Normal Body Temperature'
                  else if (temp < 40) desc = 'High Fever'
                  else if (temp < 45) desc = 'Extremely Hot'
                  else if (temp < 50) desc = 'Dangerously Hot'
                  else desc = 'Life-Threatening'
                  
                  return (
                    <tr key={temp} className={temp === celsius ? 'table-danger' : ''}>
                      <td><strong>{temp}°C</strong></td>
                      <td><strong>{f.toFixed(1)}°F</strong></td>
                      <td>{desc}</td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>

          <div style={{ marginTop: '1.5rem', padding: '1rem', background: '#e7f3ff', borderRadius: '8px' }}>
            <h3>Negative {celsius}°C to Fahrenheit</h3>
            <p>For those searching for <strong>minus {celsius}°C</strong> or <strong>negative {celsius}°C</strong>:</p>
            <p><strong>-{celsius}°C = {celsiusToFahrenheit(-celsius).toFixed(1)}°F</strong></p>
            <p>This is an extremely cold temperature, well below freezing. At -{celsius}°C ({celsiusToFahrenheit(-celsius).toFixed(1)}°F), water freezes instantly, and exposure can cause severe frostbite within minutes.</p>
          </div>
        </section>

        <section className="practical-applications" role="region" aria-labelledby="practical-title">
          <h2 id="practical-title">47°C vs Fahrenheit: Practical Applications and Context</h2>
          
          <div className="practical-uses">
            <div className="use-case">
              <div className="use-case-header">Industrial and Scientific Applications</div>
              <div className="use-case-body">
                <p>{celsius}°C ({fahrenheit.toFixed(1)}°F) is used in specialized high-temperature processes:</p>
                <ul className="use-case-examples">
                  <li><strong>Heat treatment:</strong> Metal tempering and annealing processes</li>
                  <li><strong>Chemical processing:</strong> High-temperature reactions and distillation</li>
                  <li><strong>Material testing:</strong> Stress testing under extreme heat conditions</li>
                  <li><strong>Laboratory research:</strong> Controlled high-temperature experiments</li>
                </ul>
                <p><strong>Safety requirement:</strong> All operations at {celsius}°C require specialized protective equipment, cooling systems, and strict safety protocols.</p>
              </div>
            </div>

            <div className="use-case">
              <div className="use-case-header">Environmental Context</div>
              <div className="use-case-body">
                <p>When {celsius}°C ({fahrenheit.toFixed(1)}°F) occurs as environmental temperature:</p>
                <ul className="use-case-examples">
                  <li><strong>Extreme heatwaves:</strong> Record-breaking temperatures in hot climates</li>
                  <li><strong>Desert conditions:</strong> Peak temperatures in extreme desert environments</li>
                  <li><strong>Industrial environments:</strong> Near furnaces, kilns, or heat-generating equipment</li>
                  <li><strong>Vehicle interiors:</strong> Cars left in direct sunlight can reach these temperatures</li>
                </ul>
                <p><strong>Human safety:</strong> Extended exposure to {celsius}°C can cause heatstroke, organ failure, and death within minutes to hours.</p>
              </div>
            </div>

            <div className="use-case">
              <div className="use-case-header">Temperature Comparison Reference</div>
              <div className="use-case-body">
                <div className="comparison-grid">
                  <div className="comparison-item">
                    <strong>Normal Body Temperature</strong>
                    <p>37°C (98.6°F)</p>
                    <small>Healthy human baseline</small>
                  </div>
                  <div className="comparison-item">
                    <strong>High Fever</strong>
                    <p>40°C (104°F)</p>
                    <small>Medical emergency threshold</small>
                  </div>
                  <div className="comparison-item" style={{ background: '#fff3cd', border: '2px solid #ffc107' }}>
                    <strong>This Temperature</strong>
                    <p>{celsius}°C ({fahrenheit.toFixed(1)}°F)</p>
                    <small>Extremely dangerous</small>
                  </div>
                  <div className="comparison-item">
                    <strong>Hot Shower</strong>
                    <p>40-43°C (104-109°F)</p>
                    <small>Maximum comfortable</small>
                  </div>
                  <div className="comparison-item">
                    <strong>Water Boiling</strong>
                    <p>100°C (212°F)</p>
                    <small>At sea level</small>
                  </div>
                  <div className="comparison-item">
                    <strong>Oven Temperature</strong>
                    <p>180-220°C (356-428°F)</p>
                    <small>Typical baking range</small>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="faq-section" role="region" aria-labelledby="faq-title">
          <h2 id="faq-title">Frequently Asked Questions: 47°C to Fahrenheit</h2>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              What is 47 degrees Celsius in Fahrenheit?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p><strong>47 degrees Celsius equals {fahrenheit.toFixed(1)} degrees Fahrenheit.</strong> To convert, use the formula: °F = (°C × 9/5) + 32. For 47°C: (47 × 9/5) + 32 = 84.6 + 32 = {fahrenheit.toFixed(1)}°F.</p>
            </div>
          </div>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              Is 47°C a fever?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p><strong>No, 47°C ({fahrenheit.toFixed(1)}°F) is NOT a normal fever.</strong> Normal fevers range from 38-40°C (100.4-104°F). A body temperature of 47°C indicates a severe medical emergency (hyperthermia or heatstroke) requiring immediate medical attention. This temperature is life-threatening and far exceeds normal fever ranges.</p>
            </div>
          </div>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              How warm is 47 degrees Celsius?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p><strong>47°C ({fahrenheit.toFixed(1)}°F) is extremely hot and dangerous.</strong> It's comparable to:</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li>Extreme heatwave conditions (record-breaking temperatures)</li>
                <li>Industrial high-temperature processes (requires protective equipment)</li>
                <li>A car interior left in direct sunlight on a hot day</li>
                <li>Near-furnace or kiln temperatures</li>
              </ul>
              <p style={{ marginTop: '0.5rem' }}>This temperature can cause heatstroke, organ damage, and death with prolonged exposure. It's approximately 10°C (18°F) above normal body temperature.</p>
            </div>
          </div>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              What is minus 47 Celsius in Fahrenheit?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p><strong>-47°C equals {celsiusToFahrenheit(-47).toFixed(1)}°F.</strong> This is an extremely cold temperature, well below freezing. At -47°C ({celsiusToFahrenheit(-47).toFixed(1)}°F), exposure can cause severe frostbite within minutes. This temperature is found in polar regions during winter or in specialized cryogenic applications.</p>
            </div>
          </div>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              47 Celsius vs Fahrenheit - What's the difference?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p><strong>47°C and {fahrenheit.toFixed(1)}°F represent the same temperature</strong> - they're just different measurement scales:</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>Celsius (°C):</strong> Used internationally, water freezes at 0°C and boils at 100°C</li>
                <li><strong>Fahrenheit (°F):</strong> Primarily used in the United States, water freezes at 32°F and boils at 212°F</li>
                <li><strong>Conversion:</strong> The formula to convert is °F = (°C × 9/5) + 32</li>
                <li><strong>At this temperature:</strong> Both scales indicate an extremely dangerous, life-threatening heat level</li>
              </ul>
            </div>
          </div>

          <div className="faq-item" style={{ display: 'block', marginBottom: '1.5rem' }}>
            <div className="faq-question" style={{ fontWeight: 'bold', padding: '1rem', background: '#f8f9fa', borderRadius: '8px 8px 0 0' }}>
              Where is 47°C ({fahrenheit.toFixed(1)}°F) commonly found?
            </div>
            <div className="faq-answer" style={{ padding: '1rem', background: 'white', borderRadius: '0 0 8px 8px', border: '1px solid #dee2e6', borderTop: 'none' }}>
              <p>47°C ({fahrenheit.toFixed(1)}°F) can occur in:</p>
              <ul style={{ marginLeft: '1.5rem', marginTop: '0.5rem' }}>
                <li><strong>Extreme weather:</strong> Record-breaking heatwaves in hot desert climates</li>
                <li><strong>Industrial settings:</strong> Near furnaces, kilns, smelters, or heat-treatment equipment</li>
                <li><strong>Vehicle interiors:</strong> Cars parked in direct sunlight on hot days</li>
                <li><strong>Specialized processes:</strong> High-temperature manufacturing, material processing, or scientific research</li>
              </ul>
              <p style={{ marginTop: '0.5rem' }}><strong>Important:</strong> This temperature is never safe for prolonged human exposure without specialized protection and cooling systems.</p>
            </div>
          </div>
        </section>

        <section className="related-temperatures" role="region" aria-labelledby="related-title">
          <h2 id="related-title">Related Temperature Conversions</h2>
          <p>Explore nearby temperature conversions and important reference points:</p>
          
          <div className="update-grid" style={{ marginTop: '1.5rem' }}>
            {[46, 48, 45, 50, 40, 37, 100].map(temp => {
              const f = celsiusToFahrenheit(temp)
              return (
                <article key={temp} className="update-card">
                  <p>
                    <a href={temp === celsius ? '#' : `/${temp}-c-to-f.html`} className="update-title">
                      {temp}°C to Fahrenheit ({f.toFixed(1)}°F)
                    </a>
                  </p>
                  <p style={{ fontSize: '0.9rem', color: '#6c757d', marginTop: '0.5rem' }}>
                    {temp === 37 ? 'Normal body temperature' : 
                     temp === 40 ? 'High fever threshold' :
                     temp === 100 ? 'Water boiling point' :
                     temp < celsius ? `${celsius - temp}°C cooler than ${celsius}°C` :
                     `${temp - celsius}°C warmer than ${celsius}°C`}
                  </p>
                </article>
              )
            })}
          </div>

          <div style={{ marginTop: '2rem', padding: '1.5rem', background: '#e7f3ff', borderRadius: '8px' }}>
            <h3>Quick Conversion Reference</h3>
            <p>For quick conversions around {celsius}°C, remember:</p>
            <ul style={{ marginLeft: '1.5rem', lineHeight: '1.8' }}>
              <li><strong>45°C = 113°F</strong> - Still extremely hot, but slightly cooler</li>
              <li><strong>46°C = 114.8°F</strong> - Very close to {celsius}°C</li>
              <li><strong>{celsius}°C = {fahrenheit.toFixed(1)}°F</strong> - Current temperature</li>
              <li><strong>48°C = 118.4°F</strong> - Even hotter than {celsius}°C</li>
              <li><strong>50°C = 122°F</strong> - Life-threatening temperature</li>
            </ul>
          </div>
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
              {lastUpdated.formatted && (
                <p className="footer-meta">
                  <span>Last updated: <time dateTime={lastUpdated.dateString}>{lastUpdated.formatted}</time></span>
                </p>
              )}
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
