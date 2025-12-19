import Link from 'next/link';
import { useTranslation } from '../utils/i18n';

export default function Header() {

  return (
    <header className="site-header">
      <div className="container">
        <div className="site-logo">
          <Link href="https://ctofconverter.com" aria-label="Home - Celsius to Fahrenheit Converter">
            <span aria-hidden="true">C to F Converter</span>
            <span className="sr-only">Celsius to Fahrenheit Converter</span>
          </Link>
        </div>
      </div>
    </header>
  );
}

/**
 * 简洁版头部组件 - 不包含描述文字
 */
export function SimpleHeader() {
  return (
    <header className="site-header">
      <div className="container">
        <div className="site-logo">
          <Link href="https://ctofconverter.com" aria-label="Home - Celsius to Fahrenheit Converter">
            <span aria-hidden="true">C to F Converter</span>
            <span className="sr-only">Celsius to Fahrenheit Converter</span>
          </Link>
        </div>
      </div>
    </header>
  );
}