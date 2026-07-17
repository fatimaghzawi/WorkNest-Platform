import type { ReactNode } from 'react';
import Button from '../common/Button';
import { IconCheckCircle } from './AuthIcons';

interface AuthSuccessPanelProps {
  title: string;
  children: ReactNode;
  actionTo?: string;
  actionLabel?: string;
}

export default function AuthSuccessPanel({
  title,
  children,
  actionTo,
  actionLabel = 'Continue',
}: AuthSuccessPanelProps) {
  return (
    <div className="wn-auth-success">
      <div className="wn-auth-success__icon-wrap" aria-hidden="true">
        <IconCheckCircle className="wn-auth-success__svg" />
      </div>
      <h2 className="wn-auth-success__title">{title}</h2>
      <div className="wn-auth-success__body">{children}</div>
      {actionTo && (
        <div className="wn-auth-success__actions">
          <Button to={actionTo} variant="primary" fullWidth size="lg">
            {actionLabel}
          </Button>
        </div>
      )}
    </div>
  );
}
