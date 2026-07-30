// src/pages/Faq.jsx
import { useState } from 'react';

const FAQ_ITEMS = [
  {
    category: 'Shortening URLs',
    question: 'How do I shorten a URL?',
    answer:
      'Paste your long URL into the input box at the top of the home page (e.g. https://example.com/some-long-link) and click "Shorten Now". If you\'re not logged in, you\'ll need to login or sign up first — the short link is generated right after that.',
  },
  {
    category: 'Shortening URLs',
    question: 'Can I shorten unlimited URLs for free?',
    answer:
      'Yes, this product is completely free right now. Once logged in, you can shorten as many URLs as you like, and all of them will be saved in your Dashboard.',
  },
  {
    category: 'Custom Alias',
    question: 'What is a custom alias and how do I set one?',
    answer:
      'A custom alias is a name you choose yourself for your short link — for example localhost:3000/my-link, instead of a random code. While shortening a URL in the Dashboard, type your preferred name into the "custom-alias (optional)" field.',
  },
  {
    category: 'Custom Alias',
    question: 'What happens if I leave the alias field empty?',
    answer:
      'No problem — if you don\'t provide a custom alias, the system will automatically generate a random unique short code for you.',
  },
  {
    category: 'Custom Alias',
    question: 'Can two links use the same custom alias?',
    answer:
      'No. Every alias must be unique. If the alias you chose is already in use by another link, the system will show an error and you\'ll need to try a different one.',
  },
  {
    category: 'Expiry Dates',
    question: 'What does the expiry date do?',
    answer:
      'If you set a date in the "Expires on" field, the short link will stop working and no longer redirect after that date. This is useful when sharing a temporary link, like for an event or an offer.',
  },
  {
    category: 'Expiry Dates',
    question: 'What if I don\'t set an expiry date?',
    answer:
      'The expiry date field is optional — if left empty, the link will never expire and will stay active until you delete it yourself.',
  },
  {
    category: 'Expiry Dates',
    question: 'What happens if someone clicks an expired link?',
    answer:
      'Clicking an expired link will not redirect, and the user will be shown a message letting them know the link has expired.',
  },
  {
    category: 'Analytics',
    question: 'How can I see the clicks on my link?',
    answer:
      'Each link in the Dashboard shows a total click count below it. Clicking on a link to open its analytics also shows a day-wise bar chart, so you can see how many clicks came in on which day.',
  },
  {
    category: 'Analytics',
    question: 'Are clicks updated in real time?',
    answer:
      'Whenever someone opens your short link, the click is recorded in the database immediately. Refreshing the Dashboard or reopening the analytics will show the updated count.',
  },
  {
    category: 'Analytics',
    question: 'Can I see who clicked my link (visitor details)?',
    answer:
      'Right now, only click counts and the day-wise trend are tracked. Individual visitor details (such as IP address or location) are not tracked or shown.',
  },
];

function Faq() {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (index) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  // Group items by category for section headings
  const categories = [...new Set(FAQ_ITEMS.map((item) => item.category))];

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-950 to-purple-950 px-4 py-16">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-5xl font-bold text-white text-center mb-3">
          Frequently Asked Questions
        </h1>
        <p className="text-gray-400 text-center mb-12">
          Everything you need to know about using Shortr.
        </p>

        {categories.map((category) => (
          <div key={category} className="mb-10">
            <h2 className="text-xl font-semibold text-purple-400 mb-4">{category}</h2>
            <div className="space-y-3">
              {FAQ_ITEMS.filter((item) => item.category === category).map((item) => {
                const globalIndex = FAQ_ITEMS.indexOf(item);
                const isOpen = openIndex === globalIndex;
                return (
                  <div
                    key={globalIndex}
                    className="bg-black/50 border border-purple-900/40 rounded-2xl overflow-hidden"
                  >
                    <button
                      onClick={() => toggle(globalIndex)}
                      className="w-full flex items-center justify-between text-left px-6 py-4 text-white font-medium hover:bg-purple-950/20 transition"
                    >
                      <span>{item.question}</span>
                      <span className="text-purple-400 text-xl shrink-0 ml-4">
                        {isOpen ? '−' : '+'}
                      </span>
                    </button>
                    {isOpen && (
                      <div className="px-6 pb-4 text-gray-400 leading-relaxed">
                        {item.answer}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default Faq;