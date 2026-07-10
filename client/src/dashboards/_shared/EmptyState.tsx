import type { ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';
import Button from '../../components/common/Button';
import '../../css/DesignSystem.css';

export default function EmptyState({
  title,
  description,
  actionLabel,
  actionTo,
  onAction,
  icon: Icon,
  children,
}: {
  title: string;
  description?: string;
  actionLabel?: string;
  actionTo?: string;
  onAction?: () => void;
  icon?: LucideIcon;
  children?: ReactNode;
}) {
  return (
    <div className="wn-empty">
      {Icon && (
        <span className="wn-empty__icon" aria-hidden="true">
          <Icon size={28} />
        </span>
      )}
      <h3 className="wn-empty__title">{title}</h3>
      {description && <p className="wn-empty__desc">{description}</p>}
      {children}
      {(actionLabel && actionTo) || (actionLabel && onAction) ? (
        <div className="wn-empty__actions">
          {actionTo ? (
            <Button to={actionTo}>{actionLabel}</Button>
          ) : (
            <Button onClick={onAction}>{actionLabel}</Button>
          )}
        </div>
      ) : null}
    </div>
  );
}
