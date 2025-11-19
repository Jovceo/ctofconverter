import Link from 'next/link';
import { useTranslation, getDisplayLocale } from '../utils/i18n';

interface ConversionCard {
  title: string;
  url: string;
  date: string;
}

const conversionCards: ConversionCard[] = [
  { title: '38.5°C to Fahrenheit (101.7°F)', url: 'https://ctofconverter.com/38-5-c-to-f.html', date: '2025-11-11' },
  { title: '36.5°C to Fahrenheit (97.7°F)', url: 'https://ctofconverter.com/36-5-c-to-f.html', date: '2025-11-05' },
  { title: '36.8°C to Fahrenheit (98.24°F)', url: 'https://ctofconverter.com/36-8-c-to-f.html', date: '2025-10-28' },
  { title: '90°C to Fahrenheit (162°F)', url: 'https://ctofconverter.com/90-c-to-f.html', date: '2025-10-27' },
  { title: '38.2°C to Fahrenheit (100.76°F)', url: 'https://ctofconverter.com/38-2-c-to-f.html', date: '2025-10-26' },
  { title: '37.1°C to Fahrenheit (98.78°F)', url: 'https://ctofconverter.com/37-1-c-to-f.html', date: '2025-10-24' },
  { title: '36.9°C to Fahrenheit (98.42°F)', url: 'https://ctofconverter.com/36-9-c-to-f.html', date: '2025-10-23' },
  { title: '103°F to Celsius (39.44°C)', url: 'fahrenheit-to-celsius/103-f-to-c.html', date: '2025-08-03' },
  { title: '1°C to Fahrenheit (33.8°F)', url: '1-c-to-f.html', date: '2025-07-26' },
  { title: '60°C to Fahrenheit (140°F)', url: '60-c-to-f.html', date: '2025-06-30' },
  { title: '35°C to Fahrenheit (95°F)', url: '35-c-to-f.html', date: '2025-05-23' },
  { title: '46°C to Fahrenheit (114.8°F)', url: '46-c-to-f.html', date: '2025-05-22' },
  { title: '13°C to Fahrenheit (55.4°F)', url: '13-c-to-f.html', date: '2025-05-21' },
  { title: '44°C to Fahrenheit (111.2°F)', url: '44-c-to-f.html', date: '2025-05-16' },
  { title: '120°C to Fahrenheit (248°F)', url: '120-c-to-f.html', date: '2025-05-15' },
  { title: '42°C to Fahrenheit (107.6°F)', url: '42-c-to-f.html', date: '2025-05-14' },
  { title: '105°C to Fahrenheit (221°F)', url: '105-c-to-f.html', date: '2025-05-13' },
  { title: '73°C to Fahrenheit (163.4°F)', url: '73-c-to-f.html', date: '2025-05-09' },
  { title: '210°C to Fahrenheit (410°F)', url: '210-c-to-f.html', date: '2025-05-08' },
  { title: '39°C to Fahrenheit (102.2°F)', url: '39-c-to-f.html', date: '2025-05-06' },
  { title: '76°C to Fahrenheit (168.8°F)', url: 'https://ctofconverter.com/76-c-to-f.html', date: '2025-04-25' },
  { title: '48°C to Fahrenheit (118.4°F)', url: 'https://ctofconverter.com/48-c-to-f.html', date: '2025-04-24' },
  { title: '36.7°C to Fahrenheit (98.06°F)', url: 'https://ctofconverter.com/36-7-c-to-f.html', date: '2025-04-14' },
];

const formatDateForLocale = (dateString: string, locale: string) => {
  const date = new Date(dateString);
  const formatter = new Intl.DateTimeFormat(getDisplayLocale(locale), {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  return formatter.format(date);
};

export default function ReferenceSection() {
  const { locale = 'en', pageTranslation } = useTranslation('home');
  const reference = pageTranslation?.reference;

  if (!reference) {
    return null;
  }

  return (
    <section className="reference-section" role="region" aria-labelledby="reference-title">
      <h2 id="reference-title">{reference.title}</h2>
      <div className="update-grid">
        {conversionCards.map((card, index) => (
          <article key={index} className="update-card">
            <p>
              <Link href={card.url} className="update-title">
                {card.title}
              </Link>
            </p>
            <time dateTime={card.date}>
              {reference.updatedLabel} {formatDateForLocale(card.date, locale)}
            </time>
          </article>
        ))}
      </div>

      <a
        href="https://ctofconverter.com/downloads/celsius-to-fahrenheit-chart.pdf"
        id="download-pdf-btn"
        className="pdf-download-btn"
        aria-label={reference.downloadButton.aria}
      >
        <span className="btn-icon">📄</span>
        <span className="btn-text">{reference.downloadButton.text}</span>
      </a>

      <div className="info-cards">
        <div className="info-card">
          <h3>{reference.infoCard.title}</h3>
          {reference.infoCard.paragraphs.map((paragraph: string, idx: number) => (
            <p key={idx}>
              <span dangerouslySetInnerHTML={{ __html: paragraph }} />
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

