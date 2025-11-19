'use client';

import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface TemperatureFAQSectionProps {
  faqs: FAQItem[];
}

/**
 * 通用温度FAQ组件
 * 接收自定义的FAQ数据数组，可以完全自定义问题和答案
 */
export default function TemperatureFAQSection({ faqs }: TemperatureFAQSectionProps) {
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const toggleFAQ = (index: number) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  if (!faqs || faqs.length === 0) {
    return null;
  }

  return (
    <div className="faq-section">
      {faqs.map((faq, index) => (
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

