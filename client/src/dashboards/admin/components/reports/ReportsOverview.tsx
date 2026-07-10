import {
  Briefcase,
  DollarSign,
  FileText,
  FolderKanban,
  Users,
  Video,
} from 'lucide-react';
import type { DashboardOverview } from '../../../../api/dashboard.api';
import { formatCurrency } from '../../../../utils/format';

export interface ReportsOverviewProps {
  overview: DashboardOverview;
  generatedAt: Date;
}

export default function ReportsOverview({ overview, generatedAt }: ReportsOverviewProps) {
  const dateLabel = generatedAt.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return (
    <section className="wn-reports-overview" aria-label="Report summary">
      <div className="wn-reports-overview__spotlight">
        <span className="wn-reports-overview__glow" aria-hidden />
        <span className="wn-reports-overview__rings" aria-hidden>
          <span />
          <span />
        </span>
        <p className="wn-reports-overview__eyebrow">Platform report</p>
        <p className="wn-reports-overview__total">{overview.users.total}</p>
        <p className="wn-reports-overview__headline">Registered members on WorkNest</p>
        <p className="wn-reports-overview__meta">{dateLabel}</p>
        <div className="wn-reports-overview__highlights">
          <span>
            <strong>{formatCurrency(overview.financial.totalBudget)}</strong> total job budget
          </span>
          <span>
            <strong>{overview.proposals.acceptanceRate}%</strong> proposal acceptance
          </span>
        </div>
      </div>

      <div className="wn-reports-overview__tiles">
        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <Users size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Users</p>
          <p className="wn-reports-overview__tile-value">{overview.users.active}</p>
          <p className="wn-reports-overview__tile-hint">
            {overview.users.clients} clients · {overview.users.freelancers} freelancers
          </p>
        </article>

        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <Briefcase size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Jobs</p>
          <p className="wn-reports-overview__tile-value">{overview.jobs.total}</p>
          <p className="wn-reports-overview__tile-hint">
            {overview.jobs.open} open · {overview.jobs.inProgress} in progress
          </p>
        </article>

        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <FileText size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Proposals</p>
          <p className="wn-reports-overview__tile-value">{overview.proposals.total}</p>
          <p className="wn-reports-overview__tile-hint">
            {overview.proposals.pending} pending · {overview.proposals.accepted} accepted
          </p>
        </article>

        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <FolderKanban size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Projects</p>
          <p className="wn-reports-overview__tile-value">{overview.projects.active}</p>
          <p className="wn-reports-overview__tile-hint">
            {overview.projects.completed} completed · {overview.projects.avgProgress}% avg progress
          </p>
        </article>

        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <DollarSign size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Open budget</p>
          <p className="wn-reports-overview__tile-value">
            {formatCurrency(overview.financial.openBudget)}
          </p>
          <p className="wn-reports-overview__tile-hint">
            {formatCurrency(overview.financial.inProgressBudget)} in active delivery
          </p>
        </article>

        <article className="wn-reports-overview__tile">
          <span className="wn-reports-overview__tile-icon" aria-hidden>
            <Video size={18} />
          </span>
          <p className="wn-reports-overview__tile-label">Interviews</p>
          <p className="wn-reports-overview__tile-value">{overview.interviews.upcoming}</p>
          <p className="wn-reports-overview__tile-hint">
            Upcoming · {overview.categories} categories live
          </p>
        </article>
      </div>
    </section>
  );
}
