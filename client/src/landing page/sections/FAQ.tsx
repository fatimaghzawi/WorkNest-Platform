import { useState } from "react";
import "../css/FAQ.css";

const faqs = [
  {
    question: "How do I hire a freelancer?",
    answer:
      "Simply post a job, receive proposals from qualified freelancers, compare profiles, and hire the best fit for your project.",
  },
  {
    question: "How do freelancers get paid?",
    answer:
      "Payments are handled securely through WorkNest. Funds are released only after the client approves the completed work.",
  },
  {
    question: "Is WorkNest free to join?",
    answer:
      "Yes. Creating an account is free for both clients and freelancers.",
  },
  {
    question: "Can I work remotely?",
    answer:
      "Absolutely. WorkNest connects clients and freelancers from anywhere in the world.",
  },
];

export default function FAQ() {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <section className="wn-faq">
      <div className="wn-faq__container">

        <div className="wn-section-title">
          <h2>Frequently Asked Questions</h2>
          <p>Everything you need to know about WorkNest.</p>
        </div>

        <div className="wn-faq__list">
          {faqs.map((faq, index) => (
            <div key={index} className="wn-faq__item">

              <button
                className="wn-faq__question"
                onClick={() =>
                  setOpen(open === index ? null : index)
                }
              >
                {faq.question}
                <span>{open === index ? "−" : "+"}</span>
              </button>

              {open === index && (
                <div className="wn-faq__answer">
                  {faq.answer}
                </div>
              )}

            </div>
          ))}
        </div>

      </div>
    </section>
  );
}