import "../css/HowItWorks.css";

interface Step {
  title: string;
  description: string;
}

const DEFAULT_STEPS: Step[] = [
  { title: "Post a Job", description: "Share your project requirements with our community" },
  { title: "Receive Proposals", description: "Get proposals from skilled freelancers" },
  { title: "Hire & Collaborate", description: "Choose the best fit and start working together" },
  { title: "Complete & Pay", description: "Approve the work and release payment securely" },
];

export interface HowItWorksProps {
  id?: string;
  title?: string;
  steps?: Step[];
}

/**
 * WorkNest "How It Works" — the real 4-step job-to-payment sequence, so
 * numbered markers are appropriate here (order carries meaning).
 */
export default function HowItWorks({
  id = "how-it-works",
  title = "How It Works",
  steps = DEFAULT_STEPS,
}: HowItWorksProps) {
  return (
    <section id={id} className="wn-hiw wn-landing-anchor">
      <div className="wn-hiw__inner">
        <h2 className="wn-hiw__title">{title}</h2>
        <div className="wn-hiw__grid">
          {steps.map((step, idx) => (
            <div className="wn-hiw__step" key={step.title}>
              <span className="wn-hiw__number">{idx + 1}</span>
              <h3 className="wn-hiw__step-title">{step.title}</h3>
              <p className="wn-hiw__step-desc">{step.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
