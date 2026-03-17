'use client';

import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import { useCommonTranslation } from '../utils/common-i18n';
import { AlternateLanguageLinksContext } from './AlternateLanguageLinksContext';
import { DEFAULT_LOCALE, getLocalizedLink } from '../utils/locale-config';

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

const SITE_ORIGIN = 'https://ctofconverter.com';

const stripQueryAndHash = (value: string): string => {
  const [path] = value.split(/[?#]/);
  if (!path) return '/';
  return path.startsWith('/') ? path : `/${path}`;
};

const normalizeBasePath = (path: string, locale: string): string => {
  const cleanPath = stripQueryAndHash(path);

  if (locale === DEFAULT_LOCALE) {
    return cleanPath || '/';
  }

  const localePrefix = `/${locale}`;
  if (cleanPath === localePrefix) {
    return '/';
  }

  if (cleanPath.startsWith(`${localePrefix}/`)) {
    return cleanPath.slice(localePrefix.length) || '/';
  }

  return cleanPath || '/';
};

const toRelativeHref = (href: string): string => {
  if (href.startsWith(SITE_ORIGIN)) {
    return href.slice(SITE_ORIGIN.length) || '/';
  }

  return href;
};

export default function LanguageSwitcher() {
  const router = useRouter();
  const { locale, asPath } = router;
  const currentLocale = (locale as string) || 'en';
  const { t } = useCommonTranslation();
  const alternateLinks = useContext(AlternateLanguageLinksContext);
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handlePointerDown = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handlePointerDown);
    document.addEventListener('keydown', handleEscape);

    return () => {
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('keydown', handleEscape);
    };
  }, []);

  useEffect(() => {
    setIsOpen(false);
  }, [asPath]);

  const currentLocaleLabel =
    LOCALES.find((lang) => lang.code === currentLocale)?.label || currentLocale;

  const languageLinks = useMemo(() => {
    const basePath = normalizeBasePath(asPath, currentLocale);
    const alternateMap = new Map(
      alternateLinks
        .filter((link) => link.locale)
        .map((link) => [link.locale as string, toRelativeHref(link.href)])
    );

    return LOCALES.map((lang) => ({
      code: lang.code,
      label: lang.label,
      href: alternateMap.get(lang.code) || getLocalizedLink(basePath, lang.code),
      isCurrent: lang.code === currentLocale,
    }));
  }, [alternateLinks, asPath, currentLocale]);

  return (
    <div className="language-switcher" aria-label={t('nav.languageSelector')}>
      <span className="sr-only">
        {t('nav.selectLanguage')}
      </span>
      <div className="language-menu" ref={menuRef}>
        <button
          type="button"
          className="language-trigger"
          aria-expanded={isOpen}
          aria-haspopup="true"
          onClick={() => setIsOpen((value) => !value)}
        >
          <span>{currentLocaleLabel}</span>
          <span className={`caret ${isOpen ? 'open' : ''}`} aria-hidden="true">
            ▾
          </span>
        </button>
        <div className={`language-dropdown ${isOpen ? 'open' : ''}`}>
          <div className="language-dropdown-label">Languages</div>
          <div className="language-grid">
            {languageLinks.map((lang) =>
              lang.isCurrent ? (
                <span
                  key={lang.code}
                  className="language-option current"
                  lang={lang.code}
                  aria-current="true"
                >
                  {lang.label}
                </span>
              ) : (
                <a
                  key={lang.code}
                  href={lang.href}
                  className="language-option"
                  hrefLang={lang.code}
                  lang={lang.code}
                  tabIndex={isOpen ? 0 : -1}
                >
                  {lang.label}
                </a>
              )
            )}
          </div>
        </div>
      </div>
      <style jsx>{`
        .language-switcher {
          display: flex;
          align-items: center;
        }
        .language-menu {
          position: relative;
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
        .language-trigger {
          display: inline-flex;
          align-items: center;
          gap: 0.45rem;
          background: rgba(15, 23, 42, 0.55);
          border: 1px solid rgba(255, 255, 255, 0.85);
          border-radius: 6px;
          color: #f8fafc;
          padding: 0.25rem 0.75rem;
          font-size: 0.9rem;
          cursor: pointer;
          min-width: 7.5rem;
          justify-content: space-between;
        }
        .language-trigger:focus {
          outline: none;
          border-color: #ffffff;
          box-shadow: 0 0 0 2px rgba(255, 255, 255, 0.4);
        }
        .caret {
          transition: transform 0.2s ease;
        }
        .caret.open {
          transform: rotate(180deg);
        }
        .language-dropdown {
          position: absolute;
          top: calc(100% + 0.55rem);
          right: 0;
          width: min(22rem, calc(100vw - 2rem));
          background: #ffffff;
          border: 1px solid rgba(148, 163, 184, 0.35);
          border-radius: 12px;
          box-shadow: 0 18px 36px rgba(15, 23, 42, 0.18);
          padding: 0.85rem;
          opacity: 0;
          transform: translateY(-6px);
          pointer-events: none;
          transition: opacity 0.18s ease, transform 0.18s ease;
          z-index: 1100;
        }
        .language-dropdown.open {
          opacity: 1;
          transform: translateY(0);
          pointer-events: auto;
        }
        .language-dropdown-label {
          color: #475569;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin-bottom: 0.75rem;
        }
        .language-grid {
          display: grid;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 0.45rem;
        }
        .language-option {
          display: block;
          color: #0f172a;
          background: #f8fafc;
          border: 1px solid rgba(148, 163, 184, 0.3);
          border-radius: 8px;
          padding: 0.5rem 0.65rem;
          font-size: 0.88rem;
          line-height: 1.25;
          text-decoration: none;
          transition: background-color 0.18s ease, border-color 0.18s ease, color 0.18s ease;
        }
        .language-option:hover,
        .language-option:focus {
          background: #e0f2fe;
          border-color: rgba(56, 189, 248, 0.55);
          color: #0f172a;
          outline: none;
        }
        .language-option.current {
          background: #dbeafe;
          border-color: rgba(59, 130, 246, 0.45);
          color: #1d4ed8;
          font-weight: 600;
        }
        @media (max-width: 768px) {
          .language-dropdown {
            right: auto;
            left: 0;
            width: min(20rem, calc(100vw - 2rem));
          }
        }
        @media (max-width: 480px) {
          .language-grid {
            grid-template-columns: 1fr;
          }
          .language-trigger {
            min-width: 6.75rem;
          }
        }
      `}</style>
    </div>
  );
}
