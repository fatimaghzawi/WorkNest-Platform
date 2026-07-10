import Button from "../../components/common/Button";
import "../css/ContactSection.css";

export default function ContactSection() {
  return (
    <section className="wn-contact-cta">
      <div className="wn-contact-cta__content">
        <h2>We're Here to Help</h2>

        <p>
          Have questions about WorkNest? Whether you're hiring talent or
          looking for freelance work, our team is ready to assist you.
        </p>

        <Button  href="/contact" size="lg">
          Contact Us
        </Button>
      </div>
    </section>
  );
}