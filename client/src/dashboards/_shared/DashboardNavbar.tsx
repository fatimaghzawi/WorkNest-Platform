import { useEffect, useState, type ReactNode } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';
import DashboardNavUser from './DashboardNavUser';
import DashboardNavMobileFooter from './DashboardNavMobileFooter';
import NotificationBell from './NotificationBell';
import logoImage from '../../images/logo.png';
import '../../css/Dashboard.css';

export interface DashboardNavLink {
  label: string;
  href: string;
}

export interface DashboardNavbarProps {
  roleLabel: string;
  roleBadgeClass: 'admin' | 'client' | 'freelancer';
  links: DashboardNavLink[];
  homePath: string;
}

function isActivePath(currentPath: string, href: string) {
  if (href === currentPath) return true;
  if (href !== '/' && currentPath.startsWith(`${href}/`)) return true;
  return false;
}

export default function DashboardNavbar({
  roleLabel,
  roleBadgeClass,
  links,
  homePath,
}: DashboardNavbarProps) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  const renderLink = (link: DashboardNavLink, className: string, activeClass: string) => {
    const active = isActivePath(location.pathname, link.href);
    return (
      <Link
        key={link.href}
        to={link.href}
        className={`${className} ${active ? activeClass : ''}`.trim()}
      >
        {link.label}
      </Link>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <>
      <header className="wn-dash-nav">
        <div className="wn-dash-nav__bar">
          <button
            type="button"
            className="wn-dash-nav__menu-btn"
            onClick={() => setMobileOpen((open) => !open)}
            aria-expanded={mobileOpen}
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileOpen ? '✕' : '☰'}
          </button>

          <Link to={homePath} className="wn-dash-nav__brand">
            <img src={logoImage} alt="WorkNest" className="wn-dash-nav__logo" />
            <span className={`wn-dash-nav__badge wn-dash-nav__badge--${roleBadgeClass}`}>
              {roleLabel}
            </span>
          </Link>

          <nav aria-label={`${roleLabel} navigation`}>
            <ul className="wn-dash-nav__links">
              {links.map((link) => (
                <li key={link.href}>
                  {renderLink(link, 'wn-dash-nav__link', 'wn-dash-nav__link--active')}
                </li>
              ))}
            </ul>
          </nav>

          <div className="wn-dash-nav__actions">
            <NotificationBell />
            {user && <DashboardNavUser user={user} className="wn-dash-nav__user--bar" />}
            <Button
              variant="primary"
              size="sm"
              className="wn-dash-nav__logout--bar"
              onClick={handleLogout}
            >
              Log out
            </Button>
          </div>
        </div>
      </header>

      {mobileOpen && (
        <button
          type="button"
          className="wn-dash-nav__backdrop"
          aria-label="Close menu"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <nav
        className={`wn-dash-nav__mobile ${mobileOpen ? 'wn-dash-nav__mobile--open' : ''}`}
        aria-label={`${roleLabel} mobile navigation`}
        aria-hidden={!mobileOpen}
      >
        <ul className="wn-dash-nav__mobile-links">
          {links.map((link) => (
            <li key={link.href}>
              {renderLink(link, 'wn-dash-nav__mobile-link', 'wn-dash-nav__mobile-link--active')}
            </li>
          ))}
        </ul>
        {user && <DashboardNavMobileFooter user={user} onLogout={handleLogout} />}
      </nav>
    </>
  );
}

export function DashboardPageShell({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  children?: ReactNode;
}) {
  return (
    <div>
      <p className="wn-dash-page__eyebrow">{eyebrow}</p>
      <h1 className="wn-dash-page__title">{title}</h1>
      {subtitle && <p className="wn-dash-page__subtitle">{subtitle}</p>}
      {children && <div className="wn-dash-page__card">{children}</div>}
    </div>
  );
}
