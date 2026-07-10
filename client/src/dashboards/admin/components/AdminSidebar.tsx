import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import logoImage from '../../../images/logo.png';
import { ADMIN_NAV_LINKS } from '../nav';
import DashboardNavUser from '../../_shared/DashboardNavUser';
import '../../../css/AdminSidebar.css';

function isActivePath(currentPath: string, href: string) {
  if (href === currentPath) return true;
  if (href !== '/' && currentPath.startsWith(`${href}/`)) return true;
  return false;
}

export default function AdminSidebar({
  mobileOpen,
  onMobileClose,
}: {
  mobileOpen: boolean;
  onMobileClose: () => void;
}) {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    onMobileClose();
  }, [location.pathname, onMobileClose]);

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  return (
    <>
      <button
        type="button"
        className={`wn-admin-sidebar__backdrop ${mobileOpen ? 'wn-admin-sidebar__backdrop--visible' : ''}`}
        aria-label="Close sidebar"
        onClick={onMobileClose}
      />

      <aside
        className={`wn-admin-sidebar ${mobileOpen ? 'wn-admin-sidebar--open' : ''}`}
        aria-label="Admin sidebar"
      >
        <Link to="/admin/dashboard" className="wn-admin-sidebar__brand" onClick={onMobileClose}>
          <img src={logoImage} alt="WorkNest" className="wn-admin-sidebar__logo" />
          <span className="wn-admin-sidebar__badge">Admin</span>
        </Link>

        <nav className="wn-admin-sidebar__nav" aria-label="Admin navigation">
          <ul className="wn-admin-sidebar__links">
            {ADMIN_NAV_LINKS.map((link) => {
              const active = isActivePath(location.pathname, link.href);
              return (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className={`wn-admin-sidebar__link ${active ? 'wn-admin-sidebar__link--active' : ''}`}
                    onClick={onMobileClose}
                  >
                    {link.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="wn-admin-sidebar__footer">
          {user && (
            <DashboardNavUser
              user={user}
              profilePath="/admin/profile"
              linkClassName="wn-admin-sidebar__user-link"
              className="wn-admin-sidebar__user-chip"
              onNavigate={onMobileClose}
            />
          )}
          {user?.email && <span className="wn-admin-sidebar__email">{user.email}</span>}
          <Button
            variant="outline"
            size="sm"
            fullWidth
            onClick={async () => {
              await logout();
              navigate('/login');
            }}
          >
            Log out
          </Button>
        </div>
      </aside>
    </>
  );
}
