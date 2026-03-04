import { TemperaturePage } from './temperature-template'
import { generateContentStrategy } from '../utils/contentStrategy'
import { useTranslation, replacePlaceholders, getSceneKeywords } from '../utils/i18n'
import { safeTranslate } from '../utils/translationHelpers'
import { celsiusToFahrenheit, formatTemperature, generatePageUrl } from '../utils/temperaturePageHelpers'
import { useMemo } from 'react'

import { getLatestModifiedDate } from '../utils/dateHelpers'
import { getAvailableTemperaturePages } from '../utils/serverHelpers'
import { GetStaticProps } from 'next'
import fs from 'fs'
import path from 'path'

interface PageTranslation {
  meta?: { title?: string; description?: string; ogTitle?: string; ogDescription?: string }
  conversionFormula?: { title?: string; formula?: string; steps?: string[]; imageAlt?: string }
  bodyTempRanges?: { title?: string; subtitle?: string; intro?: string; normalHighlight?: string; adultStatus?: string; babyStatus?: string; underArmStatus?: string; ranges?: { adult?: string; baby?: string; underArm?: string; normal?: string } }
  measurementMethods?: { title?: string; intro?: string; oral?: { icon?: string; temp?: string; title?: string; description?: string }; underArm?: { icon?: string; temp?: string; title?: string; description?: string }; ear?: { icon?: string; temp?: string; title?: string; description?: string }; rectal?: { icon?: string; temp?: string; title?: string; description?: string } }
  ageGroups?: { newborn?: { title?: string; points?: string[] }; infant?: { title?: string; points?: string[] }; children?: { title?: string; points?: string[] }; adults?: { title?: string; points?: string[] }; elderly?: { title?: string; points?: string[] } }
  temperatureScale?: { title?: string; intro?: string; tableHeaders?: { celsius?: string; fahrenheit?: string; assessment?: string }; rows?: Array<{ celsius?: string; fahrenheit?: string; assessment?: string }> }
  practicalApplications?: { title?: string; adult?: { title?: string; points?: string[] }; pediatric?: { title?: string; points?: string[] }; clinical?: { title?: string; points?: string[] } }
  faq?: Record<string, { question?: string; answer?: string }>
}

export const getStaticProps: GetStaticProps = async ({ locale = 'en' }) => {
  const lastUpdatedIso = getLatestModifiedDate([
    'pages/36-6-c-to-f.tsx',
    'pages/temperature-template.tsx',
    `locales/${locale}/36-6-c-to-f.json`,
    `locales/${locale}/template.json`
  ])

  const availablePages = getAvailableTemperaturePages()

  const loadJSON = (loc: string, p: string) => {
    try {
      const filePath = path.join(process.cwd(), 'locales', loc, p)
      return JSON.parse(fs.readFileSync(filePath, 'utf8'))
    } catch {
      return {}
    }
  }

  const enTrans = loadJSON('en', '36-6-c-to-f.json')
  const locTrans = locale !== 'en' ? loadJSON(locale, '36-6-c-to-f.json') : {}

  const pageTrans = { ...enTrans, ...locTrans, meta: { ...enTrans.meta, ...locTrans.meta }, faq: { ...enTrans.faq, ...locTrans.faq } }

  return { props: { lastUpdatedIso, availablePages, pageTrans } }
}

export default function Temperature36_6C({ lastUpdatedIso, pageTrans, availablePages }: { lastUpdatedIso: string; pageTrans: PageTranslation; availablePages: number[] }) {
  const celsius = 36.6
  const fahrenheit = celsiusToFahrenheit(celsius)
  const { locale } = useTranslation('36-6-c-to-f')
  const { t } = useTranslation('template')

  const pageT = useMemo(() => (pageTrans as PageTranslation) || {}, [pageTrans])
  const formattedF = formatTemperature(fahrenheit)

  const replacements = useMemo(() => ({ fahrenheit: formattedF, celsius: celsius.toString(), celsiusNoDecimal: Math.floor(celsius).toString() }), [formattedF, celsius])

  const strategy = useMemo(() => {
    const localizedKeywords = getSceneKeywords(celsius, 'body', locale)
    const s = generateContentStrategy(celsius, localizedKeywords)

    // Section 1: Is 36.6°C Normal Body Temperature? - using translations
    s.insights = [{
      type: 'fact' as const,
      title: safeTranslate(pageT, 'bodyTempRanges.title', locale),
      content: `
        <div style="background: linear-gradient(135deg, #e8f5e9 0%, #c8e6c9 100%); border-radius: 10px; padding: 25px; margin: 25px 0; border-left: 5px solid #4caf50;">
          <p style="font-size: 1.1em; margin: 0;">${safeTranslate(pageT, 'bodyTempRanges.normalHighlight', locale)}</p>
        </div>
        <div style="display: flex; justify-content: space-between; margin: 20px 0; position: relative; flex-wrap: wrap; gap: 10px;">
          <div style="text-align: center; flex: 1; padding: 15px; min-width: 100px;">
            <div style="font-weight: bold; font-size: 1.2rem; color: #555;">${pageT.temperatureScale?.rows?.[0]?.celsius || '35.5°C'} ${pageT.temperatureScale?.rows?.[0]?.fahrenheit || '(95.9°F)'}</div>
            <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">${pageT.temperatureScale?.rows?.[0]?.assessment || ''}</div>
          </div>
          <div style="text-align: center; flex: 1; padding: 15px; background: rgba(76, 175, 80, 0.1); border-radius: 8px; transform: scale(1.05); box-shadow: 0 4px 8px rgba(0,0,0,0.1); min-width: 100px;">
            <div style="font-weight: bold; font-size: 1.2rem; color: #2e7d32;">${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}</div>
            <div style="font-size: 0.9rem; color: #2e7d32; margin-top: 5px;">${safeTranslate(pageT, 'bodyTempRanges.ranges.normal', locale)}</div>
          </div>
          <div style="text-align: center; flex: 1; padding: 15px; min-width: 100px;">
            <div style="font-weight: bold; font-size: 1.2rem; color: #555;">${pageT.temperatureScale?.rows?.[5]?.celsius || '37.5°C'} ${pageT.temperatureScale?.rows?.[5]?.fahrenheit || '(99.5°F)'}</div>
            <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">${pageT.temperatureScale?.rows?.[5]?.assessment || ''}</div>
          </div>
          <div style="text-align: center; flex: 1; padding: 15px; min-width: 100px;">
            <div style="font-weight: bold; font-size: 1.2rem; color: #555;">${pageT.temperatureScale?.rows?.[6]?.celsius || '38.0°C'} ${pageT.temperatureScale?.rows?.[6]?.fahrenheit || '(100.4°F)'}</div>
            <div style="font-size: 0.9rem; color: #555; margin-top: 5px;">${safeTranslate(pageT, 'bodyTempRanges.ranges.fever', locale)}</div>
          </div>
        </div>
        <div style="background: #f5f5f5; border-radius: 8px; padding: 20px; margin: 20px 0;">
          <h3 style="margin-top: 0;">${safeTranslate(pageT, 'temperatureScale.title', locale)}</h3>
          ${pageT.temperatureScale?.rows?.map((row: any) => `
            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px dashed #ddd; align-items: center;">
              <span>${row.celsius}</span>
              <span>${row.fahrenheit}</span>
              <span>${row.assessment}</span>
            </div>
          `).join('') || ''}
        </div>
      `
    },
    // Section 2: Measurement Methods - using translations
    {
      type: 'fact' as const,
      title: safeTranslate(pageT, 'measurementMethods.title', locale),
      content: `
        <p>${safeTranslate(pageT, 'measurementMethods.intro', locale)}</p>
        <div style="display: grid; gap: 20px; margin-top: 20px; grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));">
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #2196f3;">
            <h3 style="margin-top: 0;">${pageT.measurementMethods?.oral?.icon || '🌡️'} ${safeTranslate(pageT, 'measurementMethods.oral.title', locale)}</h3>
            <p>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}<br>${safeTranslate(pageT, 'measurementMethods.oral.description', locale)}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #9c27b0;">
            <h3>${pageT.measurementMethods?.underArm?.icon || '💪'} ${safeTranslate(pageT, 'measurementMethods.underArm.title', locale)}</h3>
            <p>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}<br>${safeTranslate(pageT, 'measurementMethods.underArm.description', locale)}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #ff9800;">
            <h3>${pageT.measurementMethods?.rectal?.icon || '👶'} ${safeTranslate(pageT, 'measurementMethods.rectal.title', locale)}</h3>
            <p>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}<br>${safeTranslate(pageT, 'measurementMethods.rectal.description', locale)}</p>
          </div>
          <div style="background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 5px rgba(0,0,0,0.1); border-top: 4px solid #f44336;">
            <h3>${pageT.measurementMethods?.ear?.icon || '👂'} ${safeTranslate(pageT, 'measurementMethods.ear.title', locale)}</h3>
            <p>${replacePlaceholders('{celsius}°C = {fahrenheit}°F', replacements)}<br>${safeTranslate(pageT, 'measurementMethods.ear.description', locale)}</p>
          </div>
        </div>
      `
    },
    // Section 3: Age Groups - using translations
    {
      type: 'fact' as const,
      title: safeTranslate(pageT, 'ageGroups.title', locale),
      content: `
        <div style="background: white; border-radius: 8px; padding: 20px; margin-top: 20px; box-shadow: 0 2px 5px rgba(0,0,0,0.1);">
          ${pageT.ageGroups?.newborn ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${pageT.ageGroups.newborn.title}</span>
            <span>${safeTranslate(pageT, 'ageGroups.newborn.range', locale) || '36.4-37.4°C (97.5-99.3°F)'}</span>
          </div>` : ''}
          ${pageT.ageGroups?.infant ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${pageT.ageGroups.infant.title}</span>
            <span>${safeTranslate(pageT, 'ageGroups.infant.range', locale) || '36.5-37.5°C (97.7-99.5°F)'}</span>
          </div>` : ''}
          ${pageT.ageGroups?.children ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${pageT.ageGroups.children.title}</span>
            <span>${safeTranslate(pageT, 'ageGroups.children.range', locale) || '36.4-37.2°C (97.5-99°F)'}</span>
          </div>` : ''}
          ${pageT.ageGroups?.adults ? `
          <div style="display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee;">
            <span>${pageT.ageGroups.adults.title}</span>
            <span>${safeTranslate(pageT, 'ageGroups.adults.range', locale) || '36.1-37.2°C (97-99°F)'}</span>
          </div>` : ''}
        </div>
      `
    },
    // Section 4: Conversion Formula - using translations
    {
      type: 'fact' as const,
      title: safeTranslate(pageT, 'conversionFormula.title', locale),
      content: `
        <div style="display: flex; gap: 20px; align-items: center; flex-wrap: wrap;">
          <div style="flex: 1; min-width: 300px;">
            <p style="font-size: 1.1em; margin-bottom: 15px;">${safeTranslate(pageT, 'conversionFormula.formula', locale)}</p>
            <ol style="margin-left: 20px; line-height: 1.8;">
              ${pageT.conversionFormula?.steps?.map((step: string) => `<li>${step}</li>`).join('') || ''}
            </ol>
          </div>
          <div style="flex: 0 0 auto;">
            <img src="/images/equation/36.6-celsius-to-fahrenheit-conversion.png" alt="${safeTranslate(pageT, 'conversionFormula.imageAlt', locale)}" style="max-width: 300px; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);" />
          </div>
        </div>
      `
    }]

    // Custom FAQs
    if (pageT.faq) {
      const faqEntries = pageT.faq || {}
      s.faqs = [
        ...Object.keys(faqEntries).map(key => ({
          question: replacePlaceholders(faqEntries[key].question || '', replacements),
          answer: `<p>${replacePlaceholders(faqEntries[key].answer || '', replacements)}</p>`
        }))
      ]
    }

    s.modules.showHealthAlert = true
    s.modules.showHumanFeel = false
    s.modules.showOvenGuide = false
    s.modules.showConversionGuide = false
    s.modules.showPracticalApps = false

    // Use translated ogDescription
    s.meta = s.meta || {}
    s.meta.ogDescription = replacePlaceholders(pageT.meta?.ogDescription || '', replacements)

    return s
  }, [celsius, pageT, formattedF, replacements, t])

  const canonicalUrl = generatePageUrl(celsius, locale)
  const customTitle = replacePlaceholders(pageT.meta?.title || '', replacements)
  const customDescription = replacePlaceholders(pageT.meta?.description || '', replacements)

  return (
    <TemperaturePage
      celsius={celsius}
      strategy={strategy}
      customNamespace="36-6-c-to-f"
      lastUpdated={lastUpdatedIso}
      canonicalUrl={canonicalUrl}
      customTitle={customTitle}
      customDescription={customDescription}
      availablePages={availablePages}
      disableSmartFaqs={true}
      showEditorialNote={true}
    />
  )
}
