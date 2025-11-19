import Link from 'next/link';
import { useTranslation } from '../utils/i18n';

export default function Header() {
  const { pageTranslation } = useTranslation('home');
  const header = pageTranslation?.header;

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-logo">
          <Link href="https://ctofconverter.com" aria-label="Home - Celsius to Fahrenheit Converter">
            <span aria-hidden="true">C to F Converter</span>
            <span className="sr-only">Celsius to Fahrenheit Converter</span>
          </Link>
        </div>

        <h1>{header?.title || 'Celsius to Fahrenheit Converter (°C to °F)'}</h1>
        <p className="tagline">
          {header?.tagline ||
            'Free online temperature conversion tool that instantly converts degrees Celsius (°C) to degrees Fahrenheit (°F), with conversion formulas and detailed steps.'}
        </p>
      </div>
    </header>
  );
}

