'use client';

import { useRouter } from 'next/router';
import { useCommonTranslation } from '../utils/common-i18n';

const LOCALES = [
  { code: 'en', label: 'English' },
  { code: 'zh', label: 'Chinese' },
  { code: 'es', label: 'Spanish' },
  { code: 'hi', label: 'Hindi' },
  { code: 'ar', label: 'Arabic' },
  { code: 'ja', label: 'Japanese' },
  { code: 'fr', label: 'French' },
  { code: 'de', label: 'German' },
  { code: 'id', label: 'Indonesian' },
  { code: 'pt-br', label: 'Portuguese (Brazil)' },
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
