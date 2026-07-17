import type { ReactNode } from 'react';
import '../../../css/DesignSystem.css';

type BadgeVariant = 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' | 'neutral';

export default function Badge({
  children,
  variant = 'default',
  className = '',
}: {
  children: ReactNode;
  variant?: BadgeVariant;
  className?: string;
}) {
  return (
    <span className={`wn-badge wn-badge--${variant} ${className}`.trim()}>
      {children}
    </span>
  );
}
