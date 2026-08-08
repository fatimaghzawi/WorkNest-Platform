import { NavLink, useLocation } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import {
  Briefcase,
  FolderKanban,
  LayoutDashboard,
  Layers,
  Wallet,
} from 'lucide-react';

export interface BottomNavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  /** Also treat nested paths under this prefix as active (e.g. /client/jobs/:id). */
  matchPrefix?: string;
}

export const CLIENT_BOTTOM_NAV: BottomNavItem[] = [
  { label: 'Home', href: '/client/dashboard', icon: LayoutDashboard },
  { label: 'Jobs', href: '/client/jobs', icon: Briefcase, matchPrefix: '/client/jobs' },
  { label: 'Projects', href: '/client/projects', icon: FolderKanban },
  { label: 'Workspace', href: '/client/workspace', icon: Layers },
  { label: 'Payments', href: '/client/payments', icon: Wallet },
];

export const FREELANCER_BOTTOM_NAV: BottomNavItem[] = [
  { label: 'Home', href: '/freelancer/dashboard', icon: LayoutDashboard },
  {
    label: 'Jobs',
    href: '/freelancer/jobs',
    icon: Briefcase,
    matchPrefix: '/freelancer/jobs',
  },
  { label: 'Projects', href: '/freelancer/projects', icon: FolderKanban },
  { label: 'Workspace', href: '/freelancer/workspace', icon: Layers },
  { label: 'Wallet', href: '/freelancer/wallet', icon: Wallet },
];

function isTabActive(pathname: string, item: BottomNavItem) {
  if (pathname === item.href) return true;
  if (item.matchPrefix && pathname.startsWith(`${item.matchPrefix}/`)) return true;
  return false;
}

interface Props {
  items: BottomNavItem[];
  ariaLabel: string;
}

export default function DashboardBottomNav({ items, ariaLabel }: Props) {
  const { pathname } = useLocation();

  return (
    <nav className="wn-bottom-nav" aria-label={ariaLabel}>
      <ul className="wn-bottom-nav__list">
        {items.map((item) => {
          const Icon = item.icon;
          const active = isTabActive(pathname, item);
          return (
            <li key={item.href} className="wn-bottom-nav__item">
              <NavLink
                to={item.href}
                end={item.href.endsWith('/dashboard')}
                className={`wn-bottom-nav__link${active ? ' wn-bottom-nav__link--active' : ''}`}
                aria-current={active ? 'page' : undefined}
              >
                <span className="wn-bottom-nav__icon-wrap" aria-hidden>
                  <Icon
                    className="wn-bottom-nav__icon"
                    size={22}
                    strokeWidth={active ? 2.4 : 2}
                  />
                </span>
                <span className="wn-bottom-nav__label">{item.label}</span>
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
