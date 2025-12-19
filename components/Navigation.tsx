'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useTranslation } from '../utils/i18n';
import LanguageSwitcher from './LanguageSwitcher';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { t } = useTranslation();

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
    <nav className="main-nav" role="navigation" aria-label="Main temperature conversion navigation">
      <div className="container">
        <button
          className="mobile-menu-toggle"
          aria-label="Toggle navigation menu"
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
            <Link href="/" className="active" aria-current="page" aria-label="Current page: Celsius to Fahrenheit Converter">
              {t('nav.celsiusToFahrenheit')}
            </Link>
          </li>
          <li>
            <Link
              href="/fahrenheit-to-celsius/"
              aria-label={t('nav.fahrenheitToCelsius')}
              title="Fahrenheit to Celsius Conversion"
            >
              {t('nav.fahrenheitToCelsius')}
            </Link>
          </li>
          <li>
            <Link
              href="/c-to-f-calculator/"
              aria-label={t('nav.calculator')}
              title="C to F Calculator"
            >
              {t('nav.calculator')}
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
