import { Link } from 'react-router-dom';
import '../../css/StaticPage.css';

const FAQ_ITEMS = [
  {
    question: 'How do I create an account?',
    answer:
      'Click Sign Up, choose whether you want to hire talent or find work, then complete registration. Verify your email before signing in.',
  },
  {
    question: 'How do clients post a job?',
    answer:
      'After signing in as a client, use your dashboard to create a job listing with title, budget, skills, and project details.',
  },
  {
    question: 'How do freelancers find work?',
    answer:
      'Freelancers can browse available jobs from their dashboard, review details, and submit proposals to clients.',
  },
  {
    question: 'I forgot my password. What should I do?',
    answer:
      'Go to the sign-in page and click Forgot password. We will email you a secure reset link that expires in 15 minutes.',
  },
  {
    question: 'How do I contact support?',
    answer:
      'Visit our contact page to send a message to the WorkNest team. We respond within one business day.',
  },
];

export default function HelpCenter() {
  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner">
        <span className="wn-static-page__eyebrow">Support</span>
        <h1 className="wn-static-page__title">Help Center</h1>
        <p className="wn-static-page__subtitle">
          Quick answers to common questions about getting started, accounts, and using WorkNest.
          Still need help? <Link to="/contact">Contact us</Link>.
        </p>

        <div className="wn-static-page__faq">
          {FAQ_ITEMS.map((item) => (
            <article key={item.question} className="wn-static-page__faq-item">
              <h3>{item.question}</h3>
              <p>{item.answer}</p>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}
