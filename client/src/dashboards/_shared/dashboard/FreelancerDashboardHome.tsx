import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Briefcase,
  CalendarDays,
  Send,
  Users,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  dashboardApi,
  type FreelancerDashboardPayload,
  type FreelancerDashboardOverview,
} from '../../../api/dashboard.api';
import Button from '../../../components/common/Button';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import DashboardPageHeader from '../DashboardPageHeader';
import { formatCurrency } from '../../../utils/format';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import DashboardInterviewMiniCalendar from './DashboardInterviewMiniCalendar';
import FreelancerStudioShell from '../../freelancer/components/FreelancerStudioShell';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/Interviews.css';
import '../../../css/FreelancerStudio.css';

const PURPLE = '#49225B';
const ORANGE = '#F97316';
const TEAL = '#14B8A6';
const LIGHT = '#E7DBEF';

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  pending: ORANGE,
  accepted: TEAL,
  rejected: '#C084FC',
};

const PROJECT_STATUS_COLORS: Record<string, string> = {
  active: TEAL,
  completed: PURPLE,
  cancelled: ORANGE,
};

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

function Delta({ value }: { value: number }) {
  const sign = value > 0 ? '+' : '';
  return (
    <span className="wn-metric-card__delta">
      {sign}
      {value}%
    </span>
  );
}

const emptyOverview: FreelancerDashboardOverview = {
  proposals: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0,
    growthPct: 0,
    thisMonth: 0,
  },
  projects: { total: 0, active: 0, completed: 0, avgProgress: 0, completionRate: 0 },
  interviews: { total: 0, upcoming: 0 },
  financial: { totalProposed: 0, pendingValue: 0, activeEarnings: 0, completedEarnings: 0 },
  period: '1 Month',
};

export default function FreelancerDashboardHome() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<FreelancerDashboardPayload | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getFreelancerDashboard();
        if (active) setPayload(response.data.data);
      } catch (error) {
        if (active) setPayload(null);
        toast.error(getApiErrorMessage(error, 'Failed to load your freelance analytics.'));
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [toast]);

  const overview = payload?.overview ?? emptyOverview;
  const chartPoints = payload?.chart.points ?? [];
  const proposalDistribution = payload?.distributions.proposals ?? [];
  const projectDistribution = payload?.distributions.projects ?? [];

  const winRateData = useMemo(() => {
    const rate = overview.proposals.acceptanceRate || 0;
    return [
      { name: 'Accepted', value: Math.max(rate, 1), fill: ORANGE },
      { name: 'Other', value: Math.max(100 - rate, 1), fill: TEAL },
    ];
  }, [overview.proposals.acceptanceRate]);

  const proposalPieData = useMemo(
    () =>
      proposalDistribution
        .filter((item) => item.count > 0)
        .map((item) => ({
          name: item.status,
          value: item.count,
          fill: PROPOSAL_STATUS_COLORS[item.status] || PURPLE,
        })),
    [proposalDistribution]
  );

  const projectPieData = useMemo(
    () =>
      projectDistribution
        .filter((item) => item.count > 0)
        .map((item) => ({
          name: item.status,
          value: item.count,
          fill: PROJECT_STATUS_COLORS[item.status] || PURPLE,
        })),
    [projectDistribution]
  );

  if (loading) {
    return (
      <FreelancerStudioShell>
        <DashboardPageHeader
          hero
          eyebrow="Freelancer workspace"
          title="Your freelance command center"
          subtitle="Loading your proposals, projects, and earnings insights..."
          actions={
            <Button to="/freelancer/jobs" variant="primary">
              Browse jobs
            </Button>
          }
        />
        <StatGridSkeleton count={4} />
      </FreelancerStudioShell>
    );
  }

  return (
    <FreelancerStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer workspace"
        title="Your freelance command center"
        subtitle="Track proposals sent, win rate, interview pipeline, and active project momentum — all in one place."
        actions={
          <Button to="/freelancer/jobs" variant="primary">
            Browse jobs
          </Button>
        }
      />

      <div className="wn-analytics__layout">
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="wn-analytics__hero-row">
            <section className="wn-analytics-card wn-analytics-card--compact-chart">
              <div className="wn-analytics-card__header">
                <div>
                  <h3 className="wn-analytics-card__title">Proposal activity</h3>
                  <p className="wn-analytics-card__subtitle">
                    Proposals sent vs wins
                  </p>
                </div>
              </div>

              <div className="wn-chart-kpi wn-chart-kpi--compact">
                <div>
                  <strong>{formatCurrency(overview.financial.totalProposed)}</strong>
                  <span>Proposed value</span>
                </div>
                <div>
                  <strong>{overview.proposals.total}</strong>
                  <span>Sent</span>
                </div>
                <div>
                  <strong>{overview.projects.active}</strong>
                  <span>Active projects</span>
                </div>
              </div>

              <div className="wn-analytics-card__chart">
                <ResponsiveContainer>
                  <ComposedChart data={chartPoints} margin={{ top: 4, right: 4, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4F3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 10 }} axisLine={false} tickLine={false} width={32} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#9CA3AF', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      width={28}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E7DBEF',
                        boxShadow: '0 8px 24px rgba(73,34,91,0.12)',
                        fontSize: 12,
                      }}
                    />
                    <Bar yAxisId="left" dataKey="jobs" fill={PURPLE} radius={[6, 6, 0, 0]} barSize={14} name="Proposals sent" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="proposals"
                      stroke={ORANGE}
                      strokeWidth={2}
                      dot={false}
                      name="Wins"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <section className="wn-analytics-card wn-analytics-card--calendar">
              <DashboardInterviewMiniCalendar interviewsPath="/freelancer/interviews" />
            </section>
          </div>

          <div className="wn-finance-strip">
            <div className="wn-finance-tile wn-finance-tile--purple">
              <span>Pending value</span>
              <strong>{formatCurrency(overview.financial.pendingValue)}</strong>
            </div>
            <div className="wn-finance-tile wn-finance-tile--orange">
              <span>Active earnings</span>
              <strong>{formatCurrency(overview.financial.activeEarnings)}</strong>
            </div>
            <div className="wn-finance-tile wn-finance-tile--teal">
              <span>Completed earnings</span>
              <strong>{formatCurrency(overview.financial.completedEarnings)}</strong>
            </div>
          </div>

          <div className="wn-analytics__top">
            <section className="wn-analytics-card wn-status-card">
              <div>
                <p className="wn-status-card__label">Proposal pipeline</p>
                <p className="wn-status-card__value">{overview.proposals.total} sent</p>
                <div className="wn-status-card__progress">
                  <span style={{ width: `${overview.proposals.acceptanceRate}%` }} />
                </div>
                <p className="wn-analytics-card__subtitle">
                  {overview.proposals.pending} pending · {overview.proposals.accepted} accepted ·{' '}
                  {overview.proposals.rejected} declined
                </p>
              </div>
              <div style={{ width: 140, height: 140 }}>
                {proposalPieData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={proposalPieData} dataKey="value" innerRadius={38} outerRadius={58} stroke="none">
                        {proposalPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="wn-empty-inline">Send proposals to see distribution</p>
                )}
              </div>
            </section>

            <section className="wn-analytics-card wn-status-card">
              <div>
                <p className="wn-status-card__label">Project pipeline</p>
                <p className="wn-status-card__value">{overview.projects.total} engagements</p>
                <div className="wn-status-card__progress">
                  <span
                    style={{
                      width: `${overview.projects.total > 0 ? Math.round((overview.projects.active / overview.projects.total) * 100) : 0}%`,
                    }}
                  />
                </div>
                <p className="wn-analytics-card__subtitle">
                  {overview.projects.active} active · {overview.projects.completed} completed
                </p>
              </div>
              <div style={{ width: 140, height: 140 }}>
                {projectPieData.length > 0 ? (
                  <ResponsiveContainer>
                    <PieChart>
                      <Pie data={projectPieData} dataKey="value" innerRadius={38} outerRadius={58} stroke="none">
                        {projectPieData.map((entry) => (
                          <Cell key={entry.name} fill={entry.fill} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="wn-empty-inline">Win a proposal to start a project</p>
                )}
              </div>
            </section>
          </div>

          <div className="wn-metric-row">
            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <Send size={18} />
                </div>
                <Delta value={overview.proposals.growthPct} />
              </div>
              <p className="wn-metric-card__label">Proposals sent</p>
              <p className="wn-metric-card__value">{overview.proposals.total}</p>
              <div className="wn-metric-card__bar">
                <span
                  style={{
                    width: `${Math.min(100, Math.max(12, overview.proposals.growthPct))}%`,
                  }}
                />
              </div>
            </article>

            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <Briefcase size={18} />
                </div>
                <Delta value={overview.proposals.acceptanceRate} />
              </div>
              <p className="wn-metric-card__label">Win rate</p>
              <p className="wn-metric-card__value">{overview.proposals.acceptanceRate}%</p>
              <div className="wn-metric-card__bar">
                <span style={{ width: `${overview.proposals.acceptanceRate}%` }} />
              </div>
            </article>

            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <CalendarDays size={18} />
                </div>
              </div>
              <p className="wn-metric-card__label">Upcoming interviews</p>
              <p className="wn-metric-card__value">{overview.interviews.upcoming}</p>
              <div className="wn-metric-card__bar">
                <span
                  style={{
                    width: `${overview.interviews.total > 0 ? Math.round((overview.interviews.upcoming / overview.interviews.total) * 100) : 0}%`,
                  }}
                />
              </div>
            </article>
          </div>
        </div>

        <aside className="wn-analytics-side">
          <section className="wn-campaign-card">
            <h3>Win pulse</h3>
            <p>Proposal conversion & project progress this month</p>

            <div className="wn-donut-wrap" style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={winRateData}
                    dataKey="value"
                    innerRadius={36}
                    outerRadius={52}
                    startAngle={180}
                    endAngle={0}
                    stroke="none"
                  >
                    {winRateData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="wn-donut-center" style={{ top: 28 }}>
                <strong style={{ color: 'white' }}>{overview.proposals.acceptanceRate}%</strong>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>won</span>
              </div>
            </div>

            <div className="wn-campaign-stats">
              <div>
                <span>Pipeline value</span>
                <strong>
                  {formatCompact(overview.financial.pendingValue + overview.financial.activeEarnings)}
                </strong>
                <div className="wn-campaign-delta wn-campaign-delta--up">
                  +{overview.proposals.thisMonth} proposals this month
                </div>
              </div>
              <div>
                <span>Pending</span>
                <strong>{overview.proposals.pending}</strong>
                <div className="wn-campaign-delta wn-campaign-delta--warn">
                  awaiting client review
                </div>
              </div>
            </div>

            <div style={{ width: '100%', height: 48, marginTop: 12, opacity: 0.85 }}>
              <ResponsiveContainer>
                <ComposedChart data={chartPoints.slice(-8)}>
                  <Bar dataKey="jobs" fill="rgba(255,255,255,0.35)" barSize={6} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="proposals" stroke={LIGHT} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="wn-campaign-promo">
              <p>Active projects are {overview.projects.avgProgress}% complete on average.</p>
              <Link to="/freelancer/workspace">Open workspace →</Link>
            </div>
          </section>

          <section className="wn-analytics-card wn-profile-panel">
            <div className="wn-profile-ring">
              <span>
                <Users size={28} />
              </span>
            </div>
            <h3>Project health</h3>
            <p>{overview.projects.active} active · {overview.projects.completed} completed</p>
            <div className="wn-profile-stats">
              <div>
                <strong>{overview.projects.avgProgress}%</strong>
                <span>Avg progress</span>
              </div>
              <div>
                <strong>{overview.projects.completionRate}%</strong>
                <span>Completion</span>
              </div>
              <div>
                <strong>{overview.interviews.total}</strong>
                <span>Interviews</span>
              </div>
            </div>
          </section>
        </aside>
      </div>
    </FreelancerStudioShell>
  );
}
