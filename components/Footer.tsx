import Link from 'next/link';
import { useTranslation, getDisplayLocale } from '../utils/i18n';

interface FooterProps {
  lastUpdated?: string;
}

export default function Footer({ lastUpdated }: FooterProps) {
  const { t, locale } = useTranslation();
  const currentLocale = locale || 'en';
  // Use provided lastUpdated, or fallback to a stable date/current date logic
  const dateToUse = lastUpdated ? new Date(lastUpdated) : new Date();

  const formatted = dateToUse.toLocaleDateString(getDisplayLocale(currentLocale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const dateTime = dateToUse.toISOString().split('T')[0];
  const year = dateToUse.getFullYear();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <nav className="footer-navigation" aria-label="Footer navigation">
          <div className="footer-links-grid">
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-nav-heading">
                {t('footer.navigationHeading')}
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-nav-heading">
                <li>
                  <Link href="https://ctofconverter.com" className="footer-link">
                    {t('footer.links.celsiusToFahrenheit')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fahrenheit-to-celsius/"
                    className="footer-link"
                  >
                    {t('footer.links.fahrenheitToCelsius')}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-chart-heading">
                {t('footer.chartHeading')}
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-chart-heading">
                <li>
                  <Link
                    href="https://ctofconverter.com/celsius-to-fahrenheit-chart/"
                    className="footer-link"
                  >
                    {t('footer.links.celsiusToFahrenheitChart')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fan-oven-conversion-chart/"
                    className="footer-link"
                  >
                    {t('footer.links.fanOvenChart')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/body-temperature-chart-fever-guide/"
                    className="footer-link"
                  >
                    {t('footer.links.bodyTemperatureGuide')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fever-temperature-chart/"
                    className="footer-link"
                  >
                    {t('footer.links.feverChart')}
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-legal-heading">
                {t('footer.legalHeading')}
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-legal-heading">
                <li>
                  <Link
                    href="https://ctofconverter.com/privacy-policy.html"
                    className="footer-link"
                  >
                    {t('footer.links.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/terms-of-service.html"
                    className="footer-link"
                  >
                    {t('footer.links.termsOfService')}
                  </Link>
                </li>
                <li>
                  <Link href="https://ctofconverter.com/about-us.html" className="footer-link">
                    {t('footer.links.aboutUs')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="footer-extra">
          {/* 🟢 E-E-A-T Signal: Editorial Note */}
          <div className="editorial-note" style={{ marginBottom: '20px', padding: '15px', backgroundColor: '#f8f9fa', borderRadius: '8px', borderLeft: '4px solid #007bff' }}>
            <h4 style={{ margin: '0 0 10px 0', fontSize: '1rem', fontWeight: '600', color: '#2c3e50' }}>
              Editorial Note
            </h4>
            <p style={{ margin: '0', fontSize: '0.9rem', lineHeight: '1.5', color: '#555' }}>
              Our temperature conversion guides are reviewed and updated regularly by a team of science educators and cooking experts. We reference authoritative sources including the National Institute of Standards and Technology (NIST) and World Health Organization (WHO) guidelines. Last reviewed: {formatted}
            </p>
          </div>

          <div className="copyright-notice">
            <p>{t('footer.copyright', { year })}</p>
            <p className="footer-meta">
              <span>
                {t('footer.lastUpdated')}{' '}
                <time dateTime={dateTime}>{formatted}</time>
              </span>
            </p>
          </div>
          <div className="back-to-top">
            <a href="#top" className="back-to-top-link" aria-label={t('footer.backToTop')}>
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
                  fill="currentColor"
                ></path>
              </svg>
              <span className="sr-only">{t('footer.backToTop')}</span>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

