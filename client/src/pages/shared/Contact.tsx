import { FormEvent, useState } from 'react';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { IconMail, IconUser } from '../../components/auth/AuthIcons';
import '../../css/StaticPage.css';

export default function Contact() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [submittedEmail, setSubmittedEmail] = useState('');

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Simulated submit until a backend contact endpoint is available.
    await new Promise((resolve) => setTimeout(resolve, 800));

    setSubmittedEmail(email.trim());
    setSuccess(true);
    setName('');
    setEmail('');
    setSubject('');
    setMessage('');
    setLoading(false);
  };

  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner wn-static-page__inner--wide">
        <span className="wn-static-page__eyebrow">Get in touch</span>
        <h1 className="wn-static-page__title">Contact Us</h1>
        <p className="wn-static-page__subtitle">
          Have a question about hiring, freelancing, or your account? Send us a message and our
          team will get back to you within one business day.
        </p>

        <div className="wn-static-page__grid">
          <aside className="wn-static-page__card">
            <h2>Contact information</h2>
            <ul className="wn-static-page__info-list">
              <li>
                <strong>Email</strong>
                support@worknest.com
              </li>
              <li>
                <strong>Support hours</strong>
                Monday – Friday, 9:00 AM – 6:00 PM (GMT+3)
              </li>
              <li>
                <strong>Response time</strong>
                We typically reply within 24 hours on business days.
              </li>
            </ul>
          </aside>

          <div className="wn-static-page__card">
            {success ? (
              <div className="wn-static-page__success">
                <h2>Message sent</h2>
                <p>
                  Thanks for reaching out. We have received your message and will respond to{' '}
                  <strong>{submittedEmail}</strong> soon.
                </p>
                <Button
                  type="button"
                  variant="outline"
                  style={{ marginTop: 'var(--space-3)' }}
                  onClick={() => setSuccess(false)}
                >
                  Send another message
                </Button>
              </div>
            ) : (
              <form className="wn-static-page__form" onSubmit={handleSubmit} noValidate>
                <Input
                  label="Full name"
                  name="name"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  leftIcon={<IconUser />}
                />

                <Input
                  label="Email address"
                  type="email"
                  name="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  leftIcon={<IconMail />}
                />

                <Input
                  label="Subject"
                  name="subject"
                  required
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="How can we help?"
                />

                <Input
                  as="textarea"
                  label="Message"
                  name="message"
                  required
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Tell us more about your question..."
                  rows={5}
                />

                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={loading}
                  loadingText="Sending..."
                >
                  Send message
                </Button>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
