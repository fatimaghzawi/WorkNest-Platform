import type { ReactNode } from 'react';
import '../../../css/DesignSystem.css';

export default function Card({
  children,
  className = '',
  hover = false,
  flat = false,
}: {
  children: ReactNode;
  className?: string;
  hover?: boolean;
  flat?: boolean;
}) {
  const classes = [
    'wn-card',
    hover ? 'wn-card--hover' : '',
    flat ? 'wn-card--flat' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return <div className={classes}>{children}</div>;
}

export function CardHeader({
  title,
  subtitle,
  action,
}: {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}) {
  return (
    <div className="wn-card__header">
      <div>
        <h3 className="wn-card__title">{title}</h3>
        {subtitle && <p className="wn-card__subtitle">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function CardBody({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`wn-card__body ${className}`.trim()}>{children}</div>;
}

export function CardFooter({ children }: { children: ReactNode }) {
  return <div className="wn-card__footer">{children}</div>;
}
