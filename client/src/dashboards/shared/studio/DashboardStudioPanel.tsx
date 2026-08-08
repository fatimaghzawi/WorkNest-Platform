import type { ReactNode } from 'react';

export default function DashboardStudioPanel({
  title,
  meta,
  children,
  className = '',
}: {
  title?: string;
  meta?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section className={`wn-analytics-card wn-freelancer-studio__panel wn-glass-panel ${className}`.trim()}>
      {(title || meta) && (
        <header className="wn-freelancer-studio__panel-head">
          {title && <h2 className="wn-freelancer-studio__panel-title">{title}</h2>}
          {meta && <span className="wn-freelancer-studio__panel-meta">{meta}</span>}
        </header>
      )}
      <div className="wn-freelancer-studio__panel-body">{children}</div>
    </section>
  );
}
