import Link from 'next/link';
import { useCommonTranslation } from '../utils/common-i18n';
import { getDisplayLocale, getLocalizedLink } from '../utils/locale-config';

interface FooterProps {
  lastUpdated?: string;
}

function parseLastUpdated(value?: string) {
  if (!value) return null;

  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T00:00:00.000Z` : value;
  const date = new Date(normalized);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return {
    date,
    dateTime: date.toISOString().split('T')[0],
  };
}

export default function Footer({ lastUpdated }: FooterProps) {
  const { t, locale } = useCommonTranslation();
  const currentLocale = locale || 'en';
  const parsedLastUpdated = parseLastUpdated(lastUpdated);
  const year = parsedLastUpdated?.date.getUTCFullYear() || new Date().getUTCFullYear();
  const formatted = parsedLastUpdated
    ? new Intl.DateTimeFormat(getDisplayLocale(currentLocale), {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(parsedLastUpdated.date)
    : null;

  return (
    <footer className="site-footer" role="contentinfo" id="footer">
      <div className="container">
        <nav className="footer-navigation" aria-label={t('footer.footerNavigation')}>
          <div className="footer-links-grid">
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-nav-heading">
                {t('footer.navigationHeading')}
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-nav-heading">
                <li>
                  <Link href={getLocalizedLink('/', currentLocale)} className="footer-link">
                    {t('footer.links.celsiusToFahrenheit')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedLink('/fahrenheit-to-celsius', currentLocale)}
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
                    href={getLocalizedLink('/celsius-to-fahrenheit-chart', currentLocale)}
                    className="footer-link"
                  >
                    {t('footer.links.celsiusToFahrenheitChart')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedLink('/fan-oven-conversion-chart', currentLocale)}
                    className="footer-link"
                  >
                    {t('footer.links.fanOvenChart')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedLink('/body-temperature-chart-fever-guide', currentLocale)}
                    className="footer-link"
                  >
                    {t('footer.links.bodyTemperatureGuide')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedLink('/fever-temperature-chart', currentLocale)}
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
                    href={getLocalizedLink('/privacy-policy', currentLocale)}
                    className="footer-link"
                  >
                    {t('footer.links.privacyPolicy')}
                  </Link>
                </li>
                <li>
                  <Link
                    href={getLocalizedLink('/terms-of-service', currentLocale)}
                    className="footer-link"
                  >
                    {t('footer.links.termsOfService')}
                  </Link>
                </li>
                <li>
                  <Link href={getLocalizedLink('/about-us', currentLocale)} className="footer-link">
                    {t('footer.links.aboutUs')}
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="footer-extra">
          <div className="copyright-notice">
            <p>{t('footer.copyright', { year })}</p>
            {parsedLastUpdated && formatted && (
              <p className="footer-meta">
                <span>
                  {t('footer.lastUpdated')}{' '}
                  <time dateTime={parsedLastUpdated.dateTime}>{formatted}</time>
                </span>
              </p>
            )}
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

