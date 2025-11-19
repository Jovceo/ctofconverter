'use client';

import { useState } from 'react';
import { useTranslation } from '../utils/i18n';

interface FAQItem {
  question: string;
  answer: string;
}

const fallbackFaqData: FAQItem[] = [
  {
    question: 'What is the difference between Celsius and Fahrenheit?',
    answer:
      'Celsius and Fahrenheit are two different temperature measurement units. 1 degree Celsius = 33.8 degrees Fahrenheit. Celsius is widely used internationally, while Fahrenheit is primarily used in the United States. They use different scales: in Celsius, water freezes at 0°C and boils at 100°C; in Fahrenheit, water freezes at 32°F and boils at 212°F.',
  },
  {
    question: 'How can I quickly estimate the conversion between Celsius and Fahrenheit?',
    answer:
      'A simple estimation method is to multiply the Celsius temperature by 2, then add 30 (instead of the accurate multiplication by 9/5 and adding 32). For example, 20°C is approximately (20×2)+30=70°F (actually 68°F). This method provides a close enough estimate for everyday use.',
  },
  {
    question: 'At what temperature are Celsius and Fahrenheit equal?',
    answer:
      'The Celsius to Fahrenheit function is °F = (°C × 9/5) + 32. Celsius and Fahrenheit are equal at -40 degrees. That is, -40°C = -40°F. This is the intersection point of the two temperature scales.',
  },
  {
    question: 'Is Celsius temperature bad for you?',
    answer:
      'Celsius is just a temperature scale, not inherently good or bad. What matters is the actual temperature value. For example, 37°C is normal body temperature while 60°C can cause burns.',
  },
];

export default function FAQSection() {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const { pageTranslation } = useTranslation('home');

  const faqItems: FAQItem[] = pageTranslation?.faq?.items || fallbackFaqData;
  const faqTitle = pageTranslation?.faq?.title || 'Frequently Asked Questions (FAQ)';

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <section className="faq-section" role="region" aria-labelledby="faq-title">
      <h2 id="faq-title">{faqTitle}</h2>

      {faqItems.map((faq, index) => (
        <div
          key={index}
          className={`faq-item ${activeIndex === index ? 'active' : ''}`}
        >
          <div
            className="faq-question"
            onClick={() => toggleFAQ(index)}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFAQ(index);
              }
            }}
            aria-expanded={activeIndex === index}
          >
            {faq.question}
          </div>
          <div className={`faq-answer ${activeIndex === index ? 'active' : ''}`}>
            {faq.answer}
          </div>
        </div>
      ))}
    </section>
  );
}

