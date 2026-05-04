'use client';
import { useState } from 'react';

const faqData = [
  {
    question: "Is my money safe at these casinos?",
    answer: "Absolutely! All our partner casinos operate under strict regulatory oversight with military-grade SSL encryption, certified RNG, and segregated funds for complete security."
  },
  {
    question: "Do I need to enter a manual code?",
    answer: "No! Our proprietary tracking system automatically applies your exclusive bonuses when you register through our links - no codes needed."
  },
  {
    question: "Are bonuses automatic?",
    answer: "Yes! All bonuses are 100% automatic and instant - applied immediately after registration through our links."
  },
  {
    question: "Can I participate in wager races from any casino?",
    answer: "Yes! Most partners offer daily races, weekly tournaments, and monthly events with massive prize pools."
  }
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <section id="faq" className="faq-section">
      <div className="container">
        <h2 className="section-title">Frequently Asked Questions</h2>
        <div className="faq-grid">
          {faqData.map((item, index) => (
            <div key={index} className={`faq-item ${openIndex === index ? 'active' : ''}`}>
              <div className="faq-question" onClick={() => toggleFAQ(index)}>
                <h3>{item.question}</h3>
                <i className={`fas fa-chevron-down`} style={{ transform: openIndex === index ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.3s' }}></i>
              </div>
              <div className="faq-answer" style={{ display: openIndex === index ? 'block' : 'none' }}>
                <p>{item.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
