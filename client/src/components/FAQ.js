'use client';
import { useState } from 'react';

const faqData = [
  {
    question: "Who is Prismatique?",
    answer: "Prismatique is a verified casino streamer broadcasting daily on Kick (kick.com/Prismatique) and Twitch (twitch.tv/prismatique). He plays high-volatility Hacksaw Gaming slots, KENO multipliers, and Mines, with frequent big-win moments shared on his YouTube clips channel."
  },
  {
    question: "What is the Qzino bonus code for Prismatique?",
    answer: "The Qzino code is `PRIS50` — sign up at qzino.ai and enter PRIS50 during registration. Make a deposit and clear the $2,000 wagering requirement (40x) to claim your $50 bonus. Qzino is Prismatique's exclusive casino partner."
  },
  {
    question: "Where can I watch Prismatique live?",
    answer: "Prismatique streams primarily on Kick (kick.com/Prismatique) and simulcasts on Twitch (twitch.tv/prismatique). When live, the embedded player on prismatique.tv automatically shows the active stream and chat side-by-side."
  },
  {
    question: "What casino bonuses does Prismatique offer?",
    answer: "Prismatique is an official Qzino partner. Enter code `PRIS50` at signup, then deposit and clear the $2,000 wagering requirement (40x) to claim a $50 bonus. Qzino is Prismatique's exclusive partner casino — no other operators are promoted on this site."
  },
  {
    question: "What slots does Prismatique play?",
    answer: "Prismatique focuses on high-volatility Hacksaw Gaming titles like Wanted Dead or a Wild, KENO multi-room sessions, and Mines for big multipliers. Recent clips on his YouTube include a 2254x Mines win and a Wanted spin that paid huge."
  },
  {
    question: "Is Prismatique verified?",
    answer: "Yes — Prismatique is verified on X (formerly Twitter) with a blue checkmark at x.com/Prismatiquee, and his Kick channel is established with active daily streams. All bonuses listed on prismatique.tv are direct affiliate partnerships."
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
