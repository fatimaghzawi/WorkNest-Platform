import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import type { LucideIcon } from 'lucide-react';
import '../../css/DesignSystem.css';

export type StatTone = 'purple' | 'violet' | 'mint' | 'amber' | 'blue';

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  tone = 'purple',
}: {
  label: string;
  value: string | number;
  hint?: string;
  icon?: LucideIcon;
  tone?: StatTone;
}) {
  return (
    <article className={`wn-stat-card wn-stat-card--${tone}`}>
      {Icon && (
        <span className="wn-stat-card__icon" aria-hidden="true">
          <Icon size={20} />
        </span>
      )}
      <p className="wn-stat-card__label">{label}</p>
      <p className="wn-stat-card__value">{value}</p>
      {hint && <p className="wn-stat-card__hint">{hint}</p>}
    </article>
  );
}

export function QuickLinkCard({
  to,
  title,
  description,
  icon: Icon,
}: {
  to: string;
  title: string;
  description: string;
  icon: LucideIcon;
}) {
  return (
    <Link to={to} className="wn-quick-link">
      <span className="wn-quick-link__icon" aria-hidden="true">
        <Icon size={22} />
      </span>
      <span>
        <span className="wn-quick-link__title">{title}</span>
        <span className="wn-quick-link__desc">{description}</span>
      </span>
    </Link>
  );
}

export function DashboardPageHeader({
  eyebrow,
  title,
  subtitle,
  actions,
  hero = false,
}: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  hero?: boolean;
}) {
  const content = (
    <>
      <p className={hero ? 'wn-page-hero__eyebrow' : 'wn-dash-page__eyebrow'}>{eyebrow}</p>
      <h1 className={hero ? 'wn-page-hero__title' : 'wn-dash-page__title'}>{title}</h1>
      {subtitle && (
        <p className={hero ? 'wn-page-hero__subtitle' : 'wn-dash-page__subtitle'}>{subtitle}</p>
      )}
      {actions && (
        <div className={hero ? 'wn-page-hero__actions' : 'wn-dash-page__header-actions'}>
          {actions}
        </div>
      )}
    </>
  );

  if (hero) {
    return (
      <header className="wn-page-hero">
        <div className="wn-page-hero__inner">{content}</div>
      </header>
    );
  }

  return <header>{content}</header>;
}

export default DashboardPageHeader;
