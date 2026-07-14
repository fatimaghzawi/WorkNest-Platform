import type { ReactNode } from 'react';
import '../../../css/Interviews.css';
import '../../../css/FreelancerStudio.css';

export default function DashboardStudioShell({ children }: { children: ReactNode }) {
  return (
    <div className="wn-interviews-page wn-studio wn-freelancer-studio">
      <div className="wn-interviews-page__backdrop" aria-hidden>
        <span className="wn-interviews-page__blob wn-interviews-page__blob--1" />
        <span className="wn-interviews-page__blob wn-interviews-page__blob--2" />
        <span className="wn-interviews-page__blob wn-interviews-page__blob--3" />
      </div>
      <div className="wn-interviews-page__content wn-analytics">{children}</div>
    </div>
  );
}
