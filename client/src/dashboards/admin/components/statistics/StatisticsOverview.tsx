import {
  Briefcase,
  DollarSign,
  FileText,
  FolderKanban,
  TrendingUp,
  Users,
  Video,
} from 'lucide-react';
import type { DashboardOverview } from '../../../../api/dashboard.api';
import { formatCurrency } from '../../../../utils/format';

const TILES = [
  { key: 'users', icon: Users, label: 'Members', tone: 'purple' },
  { key: 'jobs', icon: Briefcase, label: 'Jobs', tone: 'violet' },
  { key: 'proposals', icon: FileText, label: 'Proposals', tone: 'orange' },
  { key: 'projects', icon: FolderKanban, label: 'Projects', tone: 'teal' },
  { key: 'budget', icon: DollarSign, label: 'Platform profit', tone: 'blue' },
  { key: 'interviews', icon: Video, label: 'Interviews', tone: 'pink' },
] as const;

export default function StatisticsOverview({
  overview,
  period,
}: {
  overview: DashboardOverview;
  period: string;
}) {
  const values: Record<(typeof TILES)[number]['key'], { main: string; hint: string }> = {
    users: {
      main: overview.users.total.toLocaleString(),
      hint: `${overview.users.active} active · +${overview.users.thisMonth} this month`,
    },
    jobs: {
      main: overview.jobs.total.toLocaleString(),
      hint: `${overview.jobs.open} open · ${overview.jobs.inProgress} in progress`,
    },
    proposals: {
      main: overview.proposals.total.toLocaleString(),
      hint: `${overview.proposals.acceptanceRate}% acceptance`,
    },
    projects: {
      main: overview.projects.total.toLocaleString(),
      hint: `${overview.projects.completionRate}% completed`,
    },
    budget: {
      main: formatCurrency(overview.financial.platformRevenue || 0),
      hint: `${formatCurrency(overview.financial.platformRevenueThisMonth || 0)} this month · ${formatCurrency(overview.financial.totalBudget)} total job budget`,
    },
    interviews: {
      main: overview.interviews.total.toLocaleString(),
      hint: `${overview.interviews.upcoming} upcoming`,
    },
  };

  return (
    <section className="wn-stats-overview" aria-label="Platform overview">
      <div className="wn-stats-overview__spotlight wn-glass-panel">
        <span className="wn-stats-overview__orb wn-stats-overview__orb--a" aria-hidden />
        <span className="wn-stats-overview__orb wn-stats-overview__orb--b" aria-hidden />
        <p className="wn-stats-overview__eyebrow">
          <TrendingUp size={14} /> Live analytics
        </p>
        <p className="wn-stats-overview__total">{overview.proposals.acceptanceRate}%</p>
        <p className="wn-stats-overview__headline">Proposal acceptance across the platform</p>
        <p className="wn-stats-overview__period">{period} · {overview.users.growthPct >= 0 ? '+' : ''}{overview.users.growthPct}% member growth</p>
        <div className="wn-stats-overview__chips">
          <span>{overview.jobs.thisMonth} jobs this month</span>
          <span>{overview.proposals.pending} pending reviews</span>
          <span>{overview.projects.avgProgress}% avg project progress</span>
        </div>
      </div>

      <div className="wn-stats-overview__tiles">
        {TILES.map((tile) => {
          const Icon = tile.icon;
          const data = values[tile.key];
          return (
            <article
              key={tile.key}
              className={`wn-stats-overview__tile wn-stats-overview__tile--${tile.tone} wn-glass-card`}
            >
              <span className="wn-stats-overview__tile-icon" aria-hidden>
                <Icon size={18} />
              </span>
              <p className="wn-stats-overview__tile-label">{tile.label}</p>
              <p className="wn-stats-overview__tile-value">{data.main}</p>
              <p className="wn-stats-overview__tile-hint">{data.hint}</p>
            </article>
          );
        })}
      </div>
    </section>
  );
}
