'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

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
            <Link href="https://ctofconverter.com" className="active" aria-current="page">
              Celsius to Fahrenheit
            </Link>
          </li>
          <li>
            <Link
              href="https://ctofconverter.com/fahrenheit-to-celsius/"
              aria-label="Convert Fahrenheit to Celsius"
            >
              Fahrenheit to Celsius
            </Link>
          </li>
          <li>
            <Link
              href="https://ctofconverter.com/c-to-f-calculator/"
              aria-label="Fast Celsius to Fahrenheit calculator"
            >
              C to F Calculator
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

