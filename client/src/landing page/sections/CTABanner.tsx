import Button from "../../components/common/Button";
import "../css/CTABanner.css";

export interface CTABannerProps {
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaHref?: string;
  secondaryCtaLabel?: string;
  secondaryCtaHref?: string;
}

export default function CTABanner({
  title = "Ready to Start Your Freelance Journey?",
  subtitle = "Join thousands of clients and freelancers on WorkNest today.",
  primaryCtaLabel = "Join as Freelancer",
  primaryCtaHref = "/signup",
  secondaryCtaLabel = "Hire Talent",
  secondaryCtaHref = "/signup",
}: CTABannerProps) {
  return (
    <section className="wn-cta-section" aria-label="Call to action">
      <div className="wn-cta">
        <div className="wn-cta__inner">
          <div>
            <h2 className="wn-cta__title">{title}</h2>
            <p className="wn-cta__subtitle">{subtitle}</p>
          </div>
          <div className="wn-cta__actions">
            <Button href={primaryCtaHref} className="primary">{primaryCtaLabel}</Button>
            <Button href={secondaryCtaHref} className="secondary">{secondaryCtaLabel}</Button>
          </div>
        </div>
      </div>
    </section>
  );
}
