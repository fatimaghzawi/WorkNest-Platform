import type { ReactNode } from 'react';
import { IconCheckCircle } from './AuthIcons';

interface AuthSuccessPanelProps {
  title: string;
  children: ReactNode;
}

export default function AuthSuccessPanel({ title, children }: AuthSuccessPanelProps) {
  return (
    <div className="wn-auth-success">
      <div className="wn-auth-success__icon-wrap" aria-hidden="true">
        <IconCheckCircle className="wn-auth-success__svg" />
      </div>
      <h2 className="wn-auth-success__title">{title}</h2>
      <div className="wn-auth-success__body">{children}</div>
    </div>
  );
}
