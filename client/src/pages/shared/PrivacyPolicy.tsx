import '../../css/StaticPage.css';

export default function PrivacyPolicy() {
  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner">
        <span className="wn-static-page__eyebrow">Legal</span>
        <h1 className="wn-static-page__title">Privacy Policy</h1>
        <p className="wn-static-page__subtitle">
          Last updated: July 5, 2026. This policy explains how WorkNest collects, uses, and
          protects your information.
        </p>

        <div className="wn-static-page__content">
          <h2>Information we collect</h2>
          <p>
            We collect information you provide when creating an account, posting jobs, submitting
            proposals, or contacting support — including your name, email address, profile details,
            and messages sent through the platform.
          </p>

          <h2>How we use your information</h2>
          <ul>
            <li>To create and manage your WorkNest account</li>
            <li>To connect clients and freelancers on projects</li>
            <li>To send account, security, and service-related communications</li>
            <li>To improve platform performance and user experience</li>
          </ul>

          <h2>Data security</h2>
          <p>
            We use industry-standard safeguards to protect your data, including encrypted
            connections and secure session handling. Passwords are never stored in plain text.
          </p>

          <h2>Your choices</h2>
          <p>
            You may update profile information from your account settings and request account
            deletion by contacting support. You can opt out of non-essential emails at any time.
          </p>

          <h2>Contact</h2>
          <p>
            For privacy questions, email support@worknest.com or visit our contact page.
          </p>
        </div>
      </div>
    </div>
  );
}
