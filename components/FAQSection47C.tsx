'use client';

import { useState } from 'react';

interface FAQItem {
  question: string;
  answer: string;
}

interface FAQSection47CProps {
  fahrenheit: number;
  locale?: string;
  faqItems?: FAQItem[];
}

export default function FAQSection47C({ fahrenheit, locale = 'en', faqItems }: FAQSection47CProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  // 如果提供了外部 FAQ 数据，使用外部数据；否则使用默认英文数据
  const faqData: FAQItem[] = faqItems || [
    {
      question: 'What is 47 degrees Celsius in Fahrenheit?',
      answer: `47 degrees Celsius equals ${fahrenheit.toFixed(1)} degrees Fahrenheit. To convert, use the formula: °F = (°C × 9/5) + 32. So 47 × 1.8 + 32 = ${fahrenheit.toFixed(1)}°F.`,
    },
    {
      question: 'Is 47°C a fever temperature?',
      answer: `Yes, 47°C (${fahrenheit.toFixed(1)}°F) is an extremely dangerous fever temperature. Normal body temperature is around 37°C (98.6°F), and 47°C represents life-threatening hyperthermia that requires immediate medical emergency attention. This is not a typical fever but a medical emergency.`,
    },
    {
      question: 'How warm is 47 degrees Celsius?',
      answer: `47°C (${fahrenheit.toFixed(1)}°F) is extremely hot. As an environmental temperature, it represents dangerous heat conditions that can cause heatstroke. This temperature is hotter than most desert climates and requires extreme caution. It's similar to temperatures found during extreme heatwaves in the hottest regions on Earth.`,
    },
    {
      question: 'What is minus 47 Celsius to Fahrenheit?',
      answer: `Minus 47 degrees Celsius equals ${((-47 * 9 / 5) + 32).toFixed(1)} degrees Fahrenheit. This is extremely cold, similar to temperatures found in polar regions during winter months. The conversion formula is the same: °F = (-47 × 9/5) + 32 = ${((-47 * 9 / 5) + 32).toFixed(1)}°F.`,
    },
  ];

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div className="faq-section">
      {faqData.map((faq, index) => (
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
    </div>
  );
}


