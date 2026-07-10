import '../../css/StaticPage.css';

export default function TermsOfService() {
  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner">
        <span className="wn-static-page__eyebrow">Legal</span>
        <h1 className="wn-static-page__title">Terms of Service</h1>
        <p className="wn-static-page__subtitle">
          Last updated: July 5, 2026. By using WorkNest, you agree to these terms.
        </p>

        <div className="wn-static-page__content">
          <h2>Using WorkNest</h2>
          <p>
            WorkNest provides a platform for clients and freelancers to discover opportunities,
            communicate, and manage projects. You agree to provide accurate account information and
            use the service lawfully and respectfully.
          </p>

          <h2>Accounts and roles</h2>
          <p>
            Users may register as clients or freelancers. You are responsible for activity under
            your account and for keeping your login credentials secure.
          </p>

          <h2>Projects and payments</h2>
          <p>
            Clients and freelancers are responsible for agreeing on scope, deliverables, and
            payment terms. WorkNest may provide tools to facilitate collaboration but is not a
            party to contracts between users unless explicitly stated.
          </p>

          <h2>Prohibited conduct</h2>
          <ul>
            <li>Harassment, fraud, or misrepresentation</li>
            <li>Attempting to bypass platform security or fees</li>
            <li>Posting illegal, infringing, or harmful content</li>
          </ul>

          <h2>Termination</h2>
          <p>
            We may suspend or terminate accounts that violate these terms. You may stop using
            WorkNest at any time by closing your account.
          </p>

          <h2>Changes</h2>
          <p>
            We may update these terms from time to time. Continued use of WorkNest after changes
            are posted constitutes acceptance of the revised terms.
          </p>
        </div>
      </div>
    </div>
  );
}
