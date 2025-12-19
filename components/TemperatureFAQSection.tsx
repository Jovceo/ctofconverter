'use client';

import { useState } from 'react';

export interface FAQItem {
  question: string;
  answer: string;
}

interface TemperatureFAQSectionProps {
  faqs?: FAQItem[];
  className?: string;
}

/**
 * 增强版温度FAQ组件
 * 支持自定义FAQ数据，包含默认FAQ，优化的无障碍支持和响应式设计
 */
export default function TemperatureFAQSection({ faqs = [], className = '' }: TemperatureFAQSectionProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);
  
  // 默认FAQ问题，如果没有提供自定义FAQ
  const defaultFAQs: FAQItem[] = [
    {
      question: 'What is the formula to convert Celsius to Fahrenheit?',
      answer: 'The formula to convert Celsius to Fahrenheit is: °F = (°C × 9/5) + 32. This formula works by first multiplying the Celsius temperature by 9/5, then adding 32 to get the equivalent Fahrenheit temperature.'
    },
    {
      question: 'How do you convert Fahrenheit to Celsius?',
      answer: 'To convert Fahrenheit to Celsius, use the formula: °C = (°F - 32) × 5/9. First subtract 32 from the Fahrenheit temperature, then multiply by 5/9 to get the equivalent Celsius temperature.'
    },
    {
      question: 'What is the difference between Celsius and Fahrenheit?',
      answer: 'Celsius and Fahrenheit are two different temperature scales. Celsius is based on the freezing (0°C) and boiling points (100°C) of water. Fahrenheit uses 32°F as the freezing point of water and 212°F as the boiling point. The scales also use different increments for temperature changes.'
    },
    {
      question: 'What is absolute zero in Celsius and Fahrenheit?',
      answer: 'Absolute zero is the lowest possible temperature where all molecular motion ceases. In Celsius, absolute zero is -273.15°C. In Fahrenheit, absolute zero is -459.67°F. Temperatures colder than absolute zero are not theoretically possible.'
    },
    {
      question: 'Is there a point where Celsius and Fahrenheit are equal?',
      answer: 'Yes, Celsius and Fahrenheit are equal at -40 degrees. That means -40°C = -40°F. This is the only temperature point where both scales have the same numerical value.'
    }
  ];
  
  // 使用提供的FAQ或默认FAQ
  const displayFAQs = faqs.length > 0 ? faqs : defaultFAQs;
  
  // 切换FAQ项目展开状态
  const toggleExpand = (index: number) => {
    setExpandedIndex(expandedIndex === index ? null : index);
  };
  
  return (
    <div className={`temperature-faq-section ${className}`}>
      <div className="faq-container">
        {displayFAQs.map((faq, index) => (
          <div 
            key={index} 
            className={`faq-item ${expandedIndex === index ? 'expanded' : ''}`}
            aria-expanded={expandedIndex === index}
            role="group"
          >
            <button
              className="faq-question"
              onClick={() => toggleExpand(index)}
              aria-controls={`faq-answer-${index}`}
              aria-expanded={expandedIndex === index}
              type="button"
            >
              <span className="faq-question-text">{faq.question}</span>
              <span className={`faq-toggle-icon ${expandedIndex === index ? 'rotated' : ''}`}>
                {expandedIndex === index ? '−' : '+'}
              </span>
            </button>
            
            <div
              id={`faq-answer-${index}`}
              className="faq-answer"
              aria-hidden={expandedIndex !== index}
            >
              <p>{faq.answer}</p>
            </div>
          </div>
        ))}
      </div>

      <style jsx>{`
        .temperature-faq-section {
          margin: 2rem 0;
        }
        
        .faq-container {
          border-radius: 8px;
          overflow: hidden;
        }
        
        .faq-item {
          margin-bottom: 0.5rem;
          border: 1px solid #e1e5e9;
          border-radius: 8px;
          overflow: hidden;
          transition: all 0.3s ease;
          background-color: #fff;
        }
        
        .faq-item.expanded {
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
          border-color: #3498db;
        }
        
        .faq-question {
          width: 100%;
          padding: 1rem 1.5rem;
          display: flex;
          justify-content: space-between;
          align-items: center;
          background: none;
          border: none;
          text-align: left;
          cursor: pointer;
          font-size: 1.1rem;
          font-weight: 500;
          color: #333;
          transition: background-color 0.2s ease;
        }
        
        .faq-question:hover {
          background-color: #f8f9fa;
        }
        
        .faq-question:focus {
          outline: none;
          background-color: #f1f7fa;
        }
        
        .faq-question-text {
          flex: 1;
        }
        
        .faq-toggle-icon {
          display: inline-flex;
          align-items: center;
          justify-content: center;
          width: 24px;
          height: 24px;
          font-size: 1.5rem;
          font-weight: bold;
          color: #3498db;
          transition: transform 0.3s ease;
        }
        
        .faq-toggle-icon.rotated {
          transform: rotate(0deg);
        }
        
        .faq-answer {
          padding: 0 1.5rem 1.5rem;
          max-height: 0;
          overflow: hidden;
          transition: max-height 0.3s ease, padding 0.3s ease;
        }
        
        .faq-item.expanded .faq-answer {
          max-height: 500px;
        }
        
        .faq-answer p {
          margin: 0;
          line-height: 1.6;
          color: #555;
        }
        
        @media (max-width: 768px) {
          .faq-question {
            padding: 0.75rem 1rem;
            font-size: 1rem;
          }
          
          .faq-answer {
            padding: 0 1rem 1rem;
          }
        }
      `}</style>
    </div>
  );
}

