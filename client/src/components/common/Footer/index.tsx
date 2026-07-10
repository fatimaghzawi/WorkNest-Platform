import React from "react";
import { Link } from "react-router-dom";
import "../../../css/Footer.css";
import LogoImage from "../../../images/logo.png";

interface FooterLink {
  label: string;
  href: string;
}

const isInternalLink = (href: string) => href.startsWith("/") && !href.startsWith("//");

function FooterAnchor({
  href,
  className,
  children,
}: {
  href: string;
  className: string;
  children: React.ReactNode;
}) {
  if (isInternalLink(href)) {
    return (
      <Link to={href} className={className}>
        {children}
      </Link>
    );
  }

  return (
    <a href={href} className={className}>
      {children}
    </a>
  );
}

interface SocialLink extends FooterLink {
  icon: React.ReactNode;
}

interface FooterProps {
  navLinks?: FooterLink[];
  socialLinks?: SocialLink[];
  legalLinks?: FooterLink[];
  year?: number;
  className?: string;
}

const DEFAULT_NAV_LINKS: FooterLink[] = [
  { label: "About WorkNest", href: "/about" },
  { label: "Contact", href: "/contact" },
  { label: "Help Center", href: "/help" },
];

const DEFAULT_SOCIAL_LINKS: SocialLink[] = [
  { label: "LinkedIn", href: "https://linkedin.com", icon: "in" },
  { label: "X (Twitter)", href: "https://x.com", icon: "X" },
  { label: "GitHub", href: "https://github.com", icon: "gh" },
];

const DEFAULT_LEGAL_LINKS: FooterLink[] = [
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Terms of Service", href: "/terms" },
];

export default function Footer({
  navLinks = DEFAULT_NAV_LINKS,
  socialLinks = DEFAULT_SOCIAL_LINKS,
  legalLinks = DEFAULT_LEGAL_LINKS,
  year = new Date().getFullYear(),
  className = "",
}: FooterProps) {
  return (
    <footer className={`wn-footer ${className}`.trim()}>
      <div className="wn-footer__inner">
        <div className="wn-footer__main">
          <div className="wn-footer__brand">
            <FooterAnchor href="/" className="wn-footer__logo">
              <img src={LogoImage} alt="WorkNest Logo" />
            </FooterAnchor>

            <p className="wn-footer__tagline">
              One workspace to hire, collaborate, deliver, and get paid — from job
              post to final review.
            </p>

            <div className="wn-footer__social">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="wn-footer__social-link"
                  aria-label={social.label}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          <nav className="wn-footer__nav" aria-label="Company">
            <p className="wn-footer__nav-title">Company</p>
            <ul className="wn-footer__links">
              {navLinks.map((link) => (
                <li key={link.label}>
                  <FooterAnchor href={link.href} className="wn-footer__link">
                    {link.label}
                  </FooterAnchor>
                </li>
              ))}
            </ul>
          </nav>
        </div>

        <div className="wn-footer__bottom">
          <span className="wn-footer__copyright">
            © {year} WorkNest. All rights reserved.
          </span>

          <ul className="wn-footer__legal-links">
            {legalLinks.map((link) => (
              <li key={link.label}>
                <FooterAnchor href={link.href} className="wn-footer__link">
                  {link.label}
                </FooterAnchor>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </footer>
  );
}
