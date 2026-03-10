'use client';

import { useRouter } from 'next/router';
import { useCommonTranslation } from '../utils/common-i18n';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: '中文' },
  { code: 'es', label: 'Español' },
  { code: 'hi', label: 'हिन्दी' },
  { code: 'ar', label: 'العربية' },
  { code: 'ja', label: '日本語' },
  { code: 'fr', label: 'Français' },
  { code: 'de', label: 'Deutsch' },
  { code: 'id', label: 'Bahasa Indonesia' },
  { code: 'pt-br', label: 'Português (Brasil)' },
];

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, pathname, query, asPath } = router;
  const currentLocale = (locale as string) || 'en';
  const { t } = useCommonTranslation();

  const handleChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newLocale = event.target.value;
    if (newLocale === currentLocale) return;

    router.push({ pathname, query }, asPath, { locale: newLocale });
  };

  return (
    <div className="language-switcher" aria-label={t('nav.languageSelector')}>
      <label htmlFor="language-select" className="sr-only">
        {t('nav.selectLanguage')}
      </label>
      <select
        id="language-select"
        className="language-select"
        value={currentLocale}
        onChange={handleChange}
      >
        {LOCALES.map((lang) => (
          <option key={lang.code} value={lang.code}>
            {lang.label}
          </option>
        ))}
      </select>
      <style jsx>{`
        .language-switcher {
          display: flex;
          align-items: center;
        }
        .sr-only {
          position: absolute;
          width: 1px;
          height: 1px;
          padding: 0;
          margin: -1px;
          overflow: hidden;
          clip: rect(0, 0, 0, 0);
          border: 0;
        }
        .language-select {
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 6px;
          color: #f8fafc;
          padding: 0.25rem 0.75rem;
          font-size: 0.9rem;
          cursor: pointer;
        }
        .language-select:focus {
          outline: none;
          border-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
        }
      `}</style>
    </div>
  );
}

