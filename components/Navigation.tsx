'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation, getLocalizedLink } from '../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t, locale } = useTranslation();
  const currentLocale = locale || 'en';

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (
        isMenuOpen &&
        !target.closest('.nav-links') &&
        !target.closest('.mobile-menu-toggle')
      ) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('click', handleClickOutside);
    }

    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="main-nav" role="navigation" aria-label={t('nav.logoText')}>
      <div className="container">
        <button
          className="mobile-menu-toggle"
          aria-label={t('nav.toggleMenu')}
          aria-expanded={isMenuOpen}
          aria-controls="nav-links"
          onClick={toggleMenu}
        >
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
          <span className="menu-icon"></span>
        </button>
        <ul className={`nav-links ${isMenuOpen ? 'active' : ''}`} id="nav-links">
          <li>
            <Link href={getLocalizedLink('/', currentLocale)} className="active" aria-current="page" aria-label={t('nav.celsiusToFahrenheit')}>
              {t('nav.celsiusToFahrenheit')}
            </Link>
          </li>
          <li>
            <Link
              href={getLocalizedLink('/fahrenheit-to-celsius/', currentLocale)}
              aria-label={t('nav.fahrenheitToCelsius')}
              title={t('nav.fahrenheitToCelsius')}
            >
              {t('nav.fahrenheitToCelsius')}
            </Link>
          </li>
          <li>
            <Link
              href={getLocalizedLink('/c-to-f-calculator/', currentLocale)}
              aria-label={t('nav.calculator')}
              title={t('nav.calculator')}
            >
              {t('nav.calculator')}
            </Link>
          </li>
          <li>
            <Link
              href={getLocalizedLink('/temperature-conversion-challenge/', currentLocale)}
              className="nav-game-link"
              aria-label={t('nav.game')}
              title={t('nav.game')}
              style={{ color: '#ef4444', fontWeight: 'bold' }}
            >
              {t('nav.game')}
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          <LanguageSwitcher />
        </div>
      </div>
    </nav>
  );
}
