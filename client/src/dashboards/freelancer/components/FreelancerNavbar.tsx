import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { ChevronDown, LayoutGrid } from 'lucide-react';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { projectsApi, type Project } from '../../../api/projects.api';
import { projectStatusLabel } from '../../_shared/projects/projectStatus';
import logoImage from '../../../images/logo.png';
import { FREELANCER_NAV_LINKS, FREELANCER_PROJECTS_PATH } from '../nav';
import DashboardNavUser from '../../_shared/DashboardNavUser';
import DashboardNavMobileFooter from '../../_shared/DashboardNavMobileFooter';
import NotificationBell from '../../_shared/NotificationBell';
import '../../../css/Dashboard.css';

function isActivePath(currentPath: string, href: string) {
  if (href === currentPath) return true;
  if (href !== '/' && currentPath.startsWith(`${href}/`)) return true;
  return false;
}

const BEFORE_PROJECTS = FREELANCER_NAV_LINKS.slice(0, 3);
const AFTER_PROJECTS = FREELANCER_NAV_LINKS.slice(3);

export default function FreelancerNavbar() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [projectsOpen, setProjectsOpen] = useState(false);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(false);
  const dropdownRef = useRef<HTMLLIElement>(null);

  const projectsActive =
    isActivePath(location.pathname, FREELANCER_PROJECTS_PATH) ||
    location.pathname.startsWith('/freelancer/workspace');

  const sortedProjects = useMemo(
    () =>
      [...projects].sort((a, b) => {
        if (a.status === 'active' && b.status !== 'active') return -1;
        if (b.status === 'active' && a.status !== 'active') return 1;
        return (a.jobTitle || a.title).localeCompare(b.jobTitle || b.title);
      }),
    [projects]
  );

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [mobileOpen]);

  useEffect(() => {
    setMobileOpen(false);
    setProjectsOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const onResize = () => {
      if (window.innerWidth > 1024) setMobileOpen(false);
    };
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  useEffect(() => {
    let active = true;

    const loadProjects = async () => {
      setLoadingProjects(true);
      try {
        const response = await projectsApi.list({ limit: 20 });
        if (active) setProjects(response.data.data);
      } catch {
        if (active) setProjects([]);
      } finally {
        if (active) setLoadingProjects(false);
      }
    };

    loadProjects();
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!projectsOpen) return;

    const onPointerDown = (event: MouseEvent) => {
      if (!dropdownRef.current?.contains(event.target as Node)) {
        setProjectsOpen(false);
      }
    };

    document.addEventListener('mousedown', onPointerDown);
    return () => document.removeEventListener('mousedown', onPointerDown);
  }, []);

  const renderLink = (href: string, label: string, className: string, activeClass: string) => {
    const active = isActivePath(location.pathname, href);
    return (
      <Link to={href} className={`${className} ${active ? activeClass : ''}`.trim()}>
        {label}
      </Link>
    );
  };

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const renderProjectRows = (compact = false) => {
    if (loadingProjects) {
      return <p className="wn-dash-nav__projects-empty">Loading projects...</p>;
    }

    if (sortedProjects.length === 0) {
      return (
        <p className="wn-dash-nav__projects-empty">
          No active projects yet. Win a proposal to unlock workspaces.
        </p>
      );
    }

    return (
      <ul className={`wn-dash-nav__projects-list ${compact ? 'wn-dash-nav__projects-list--compact' : ''}`}>
        {sortedProjects.map((project) => (
          <li key={project.id} className="wn-dash-nav__project-item">
            <div className="wn-dash-nav__project-copy">
              <strong>{project.jobTitle || project.title}</strong>
              <span>{projectStatusLabel(project.status)} · {project.progress}%</span>
            </div>
            <Link
              to={`/freelancer/workspace?jobId=${project.jobId}`}
              className="wn-dash-nav__project-workspace"
            >
              <LayoutGrid size={14} />
              Workspace
            </Link>
          </li>
        ))}
      </ul>
    );
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

          <Link to="/freelancer/dashboard" className="wn-dash-nav__brand">
            <img src={logoImage} alt="WorkNest" className="wn-dash-nav__logo" />
            <span className="wn-dash-nav__badge wn-dash-nav__badge--freelancer">Freelancer</span>
          </Link>

          <nav aria-label="Freelancer navigation">
            <ul className="wn-dash-nav__links">
              {BEFORE_PROJECTS.map((link) => (
                <li key={link.href}>
                  {renderLink(link.href, link.label, 'wn-dash-nav__link', 'wn-dash-nav__link--active')}
                </li>
              ))}

              <li
                ref={dropdownRef}
                className={`wn-dash-nav__dropdown ${projectsOpen ? 'wn-dash-nav__dropdown--open' : ''}`}
              >
                <button
                  type="button"
                  className={`wn-dash-nav__link wn-dash-nav__dropdown-trigger ${
                    projectsActive ? 'wn-dash-nav__link--active' : ''
                  }`}
                  aria-expanded={projectsOpen}
                  aria-haspopup="true"
                  onClick={() => setProjectsOpen((open) => !open)}
                >
                  My Projects
                  <ChevronDown size={16} className="wn-dash-nav__dropdown-icon" />
                </button>

                <div className="wn-dash-nav__dropdown-panel">
                  <div className="wn-dash-nav__dropdown-header">
                    <strong>Your projects</strong>
                    <Link to={FREELANCER_PROJECTS_PATH} className="wn-dash-nav__dropdown-view-all">
                      View all
                    </Link>
                  </div>
                  {renderProjectRows()}
                </div>
              </li>

              {AFTER_PROJECTS.map((link) => (
                <li key={link.href}>
                  {renderLink(link.href, link.label, 'wn-dash-nav__link', 'wn-dash-nav__link--active')}
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
        aria-label="Freelancer mobile navigation"
        aria-hidden={!mobileOpen}
      >
        <ul className="wn-dash-nav__mobile-links">
          {BEFORE_PROJECTS.map((link) => (
            <li key={link.href}>
              {renderLink(link.href, link.label, 'wn-dash-nav__mobile-link', 'wn-dash-nav__mobile-link--active')}
            </li>
          ))}

          <li className="wn-dash-nav__mobile-projects">
            <div className="wn-dash-nav__mobile-projects-head">
              <span>My Projects</span>
              <Link to={FREELANCER_PROJECTS_PATH} className="wn-dash-nav__dropdown-view-all">
                View all
              </Link>
            </div>
            {renderProjectRows(true)}
          </li>

          {AFTER_PROJECTS.map((link) => (
            <li key={link.href}>
              {renderLink(link.href, link.label, 'wn-dash-nav__mobile-link', 'wn-dash-nav__mobile-link--active')}
            </li>
          ))}
        </ul>
        {user && <DashboardNavMobileFooter user={user} onLogout={handleLogout} />}
      </nav>
    </>
  );
}
