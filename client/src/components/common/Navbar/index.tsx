import { useEffect, useState, type ReactNode } from "react";
import { Link } from "react-router-dom";
import "../../../css/Navbar.css";
import logoImage from "../../../images/logo.png";

export interface NavLink {
  label: string;
  href: string;
  active?: boolean;
  variant?: "link" | "button";
}

export interface NavbarUser {
  name: string;
  avatarUrl?: string;
}

export const PUBLIC_NAV_LINKS: NavLink[] = [
  { label: "Home", href: "/" },
  { label: "Find Talent", href: "/#top-freelancers" },
  { label: "Find Work", href: "/#featured-jobs" },
  { label: "How It Works", href: "/#how-it-works" },
  { label: "Contact", href: "/contact" },
  { label: "Login", href: "/login" },
  { label: "Sign Up", href: "/signup", variant: "button" },
];

const navigationLinks = PUBLIC_NAV_LINKS.filter(
  (link) => link.label !== "Login" && link.label !== "Sign Up"
);

const authLinks = PUBLIC_NAV_LINKS.filter(
  (link) => link.label === "Login" || link.label === "Sign Up"
);

export interface NavbarProps {
  logo?: ReactNode;
  links?: NavLink[];
  actions?: ReactNode;
  notificationCount?: number;
  onNotificationsClick?: () => void;
  user?: NavbarUser;
  onUserClick?: () => void;
  rightSlot?: ReactNode;
  className?: string;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((part) => part[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

const isInternalLink = (href: string) => href.startsWith("/") && !href.startsWith("//");

function NavAnchor({
  href,
  className,
  children,
  active,
  onClick,
}: {
  href: string;
  className: string;
  children: ReactNode;
  active?: boolean;
  onClick?: () => void;
}) {
  if (isInternalLink(href)) {
    const hashIndex = href.indexOf("#");

    if (hashIndex !== -1) {
      const pathname = href.slice(0, hashIndex) || "/";
      const hash = href.slice(hashIndex);

      return (
        <Link
          to={{ pathname, hash }}
          className={className}
          aria-current={active ? "page" : undefined}
          onClick={onClick}
        >
          {children}
        </Link>
      );
    }

    return (
      <Link
        to={href}
        className={className}
        aria-current={active ? "page" : undefined}
        onClick={onClick}
      >
        {children}
      </Link>
    );
  }

  return (
    <a
      href={href}
      className={className}
      aria-current={active ? "page" : undefined}
      onClick={onClick}
    >
      {children}
    </a>
  );
}

export default function Navbar({
  logo = <img src={logoImage} alt="WorkNest" className="wn-navbar__logo" />,
  actions,
  notificationCount,
  onNotificationsClick,
  user,
  onUserClick,
  rightSlot,
  className = "",
}: NavbarProps) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 768) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const closeMobile = () => setMobileOpen(false);

  return (
    <>
      <header className={`wn-navbar ${mobileOpen ? "wn-navbar--open" : ""} ${className}`.trim()}>
        <button
          type="button"
          className="wn-navbar__menu-btn"
          onClick={() => setMobileOpen((open) => !open)}
          aria-expanded={mobileOpen}
          aria-controls="wn-navbar-mobile-menu"
          aria-label={mobileOpen ? "Close navigation menu" : "Open navigation menu"}
        >
          {mobileOpen ? "✕" : "☰"}
        </button>

        <div className="wn-navbar__logo-container">
          <Link to="/" aria-label="WorkNest home" onClick={closeMobile}>
            {logo}
          </Link>
        </div>

        <nav className="wn-navbar__desktop-nav" aria-label="Main">
          <ul className="wn-navbar__links">
            {navigationLinks.map((link) =>
              link.variant === "button" ? (
                <li key={link.label} className="wn-navbar__links-spacer">
                  <NavAnchor href={link.href} className="wn-navbar__link-btn">
                    {link.label}
                  </NavAnchor>
                </li>
              ) : (
                <li key={link.label}>
                  <NavAnchor
                    href={link.href}
                    className={`wn-navbar__link ${link.active ? "wn-navbar__link--active" : ""}`.trim()}
                    active={link.active}
                  >
                    {link.label}
                  </NavAnchor>
                </li>
              )
            )}
          </ul>
        </nav>

        <div className="wn-navbar__actions">
          <div className="wn-navbar__auth-desktop">
            {authLinks.map((link) =>
              link.variant === "button" ? (
                <NavAnchor key={link.label} href={link.href} className="wn-navbar__link-btn">
                  {link.label}
                </NavAnchor>
              ) : (
                <NavAnchor key={link.label} href={link.href} className="wn-navbar__link">
                  {link.label}
                </NavAnchor>
              )
            )}
          </div>

          {actions}

          {notificationCount !== undefined && (
            <button
              type="button"
              className="wn-navbar__icon-btn"
              onClick={onNotificationsClick}
              aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} unread)` : ""}`}
            >
              🔔
              {notificationCount > 0 && (
                <span className="wn-navbar__badge">
                  {notificationCount > 9 ? "9+" : notificationCount}
                </span>
              )}
            </button>
          )}

          {user && (
            <button type="button" className="wn-navbar__user" onClick={onUserClick}>
              {user.avatarUrl ? (
                <img src={user.avatarUrl} alt="" className="wn-navbar__avatar" />
              ) : (
                <span className="wn-navbar__avatar-fallback">{initials(user.name)}</span>
              )}
              <span className="wn-navbar__user-name">{user.name}</span>
            </button>
          )}

          {rightSlot}
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="wn-navbar__backdrop"
          aria-label="Close navigation menu"
          onClick={closeMobile}
        />
      )}

      <nav
        id="wn-navbar-mobile-menu"
        className={`wn-navbar__mobile-menu ${mobileOpen ? "wn-navbar__mobile-menu--open" : ""}`}
        aria-label="Mobile"
        aria-hidden={!mobileOpen}
      >
        <ul className="wn-navbar__mobile-links">
          {PUBLIC_NAV_LINKS.map((link) => (
            <li key={link.label}>
              <NavAnchor
                href={link.href}
                className={
                  link.variant === "button" ? "wn-navbar__mobile-link-btn" : "wn-navbar__mobile-link"
                }
                onClick={closeMobile}
              >
                {link.label}
              </NavAnchor>
            </li>
          ))}
        </ul>
      </nav>
    </>
  );
}
