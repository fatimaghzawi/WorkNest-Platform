import '../../css/StaticPage.css';

export default function About() {
  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner">
        <span className="wn-static-page__eyebrow">Company</span>
        <h1 className="wn-static-page__title">About WorkNest</h1>
        <p className="wn-static-page__subtitle">
          WorkNest is a freelance marketplace built to help clients and freelancers collaborate
          from first brief to final delivery — with clear milestones, messaging, and payments in
          one place.
        </p>

        <div className="wn-static-page__content">
          <h2>Our mission</h2>
          <p>
            We believe great work happens when hiring is simple, communication is transparent,
            and both sides can focus on outcomes instead of admin. WorkNest connects businesses
            with skilled freelancers while keeping projects organized and secure.
          </p>

          <h2>What we offer</h2>
          <ul>
            <li>Job posting and proposal tools for clients and freelancers</li>
            <li>Role-based workspaces for clients, freelancers, and admins</li>
            <li>Structured project flows from interview to delivery</li>
            <li>Secure account management with email verification</li>
          </ul>

          <h2>Who we serve</h2>
          <p>
            Whether you are a business looking to hire talent or a freelancer searching for your
            next project, WorkNest gives you a single workspace to find opportunities, manage
            work, and build long-term professional relationships.
          </p>
        </div>
      </div>
    </div>
  );
}
