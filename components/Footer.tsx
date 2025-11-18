import Link from 'next/link';

function getCurrentDate(): { dateTime: string; formatted: string } {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.toLocaleDateString('en-US', { month: 'long' });
  const day = now.getDate();
  
  // Format dateTime as YYYY-MM-DD
  const dateTime = `${year}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
  // Format display as "Month Day, Year"
  const formatted = `${month} ${day}, ${year}`;
  
  return { dateTime, formatted };
}

export default function Footer() {
  const { dateTime, formatted } = getCurrentDate();

  return (
    <footer className="site-footer" role="contentinfo">
      <div className="container">
        <nav className="footer-navigation" aria-label="Footer navigation">
          <div className="footer-links-grid">
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-nav-heading">
                Navigation
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-nav-heading">
                <li>
                  <Link href="https://ctofconverter.com" className="footer-link">
                    Celsius to Fahrenheit
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fahrenheit-to-celsius/"
                    className="footer-link"
                  >
                    Fahrenheit to Celsius
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-chart-heading">
                Chart
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-chart-heading">
                <li>
                  <Link
                    href="https://ctofconverter.com/celsius-to-fahrenheit-chart/"
                    className="footer-link"
                  >
                    Celsius to Fahrenheit Conversion Chart
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fan-oven-conversion-chart/"
                    className="footer-link"
                  >
                    Fan Oven Temperature Conversion Chart
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/body-temperature-chart-fever-guide/"
                    className="footer-link"
                  >
                    Body Temperature Chart & Fever Guide
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/fever-temperature-chart/"
                    className="footer-link"
                  >
                    Fever Temperature Chart
                  </Link>
                </li>
              </ul>
            </div>
            <div className="footer-links-group">
              <h3 className="footer-heading" id="footer-legal-heading">
                Legal
              </h3>
              <ul className="footer-link-list" aria-labelledby="footer-legal-heading">
                <li>
                  <Link
                    href="https://ctofconverter.com/privacy-policy.html"
                    className="footer-link"
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    href="https://ctofconverter.com/terms-of-service.html"
                    className="footer-link"
                  >
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="https://ctofconverter.com/about-us.html" className="footer-link">
                    About Us
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </nav>

        <div className="footer-extra">
          <div className="copyright-notice">
            <p>© 2025 Ctofconverter. All rights reserved.</p>
            <p className="footer-meta">
              <span>
                Last updated: <time dateTime={dateTime}>{formatted}</time>
              </span>
            </p>
          </div>
          <div className="back-to-top">
            <a href="#top" className="back-to-top-link" aria-label="Back to top">
              <svg aria-hidden="true" width="16" height="16" viewBox="0 0 24 24">
                <path
                  d="M7.41 15.41L12 10.83l4.59 4.58L18 14l-6-6-6 6z"
                  fill="currentColor"
                ></path>
              </svg>
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}

