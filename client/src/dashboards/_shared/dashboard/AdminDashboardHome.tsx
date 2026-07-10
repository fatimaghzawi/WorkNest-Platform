import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  FileText,
  ShieldCheck,
  Users,
} from 'lucide-react';
import {
  Bar,
  CartesianGrid,
  ComposedChart,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Cell,
} from 'recharts';
import {
  dashboardApi,
  type AdminDashboardPayload,
  type DashboardOverview,
} from '../../../api/dashboard.api';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import DashboardPageHeader from '../DashboardPageHeader';
import { formatCurrency } from '../../../utils/format';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';

const PURPLE = '#49225B';
const ORANGE = '#F97316';
const TEAL = '#14B8A6';
const LIGHT = '#E7DBEF';

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

const emptyOverview: DashboardOverview = {
  users: { total: 0, active: 0, clients: 0, freelancers: 0, growthPct: 0, thisMonth: 0 },
  jobs: { total: 0, open: 0, inProgress: 0, closed: 0, growthPct: 0, thisMonth: 0 },
  proposals: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0,
    thisMonth: 0,
  },
  projects: {
    total: 0,
    active: 0,
    completed: 0,
    avgProgress: 0,
    completionRate: 0,
    thisMonth: 0,
  },
  interviews: { total: 0, upcoming: 0 },
  financial: { totalBudget: 0, openBudget: 0, inProgressBudget: 0, closedBudget: 0 },
  categories: 0,
  period: '1 Month',
};

export default function AdminDashboardHome() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<AdminDashboardPayload | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getAdminDashboard();
        if (active) setPayload(response.data.data);
      } catch (error) {
        if (active) setPayload(null);
        toast.error(getApiErrorMessage(error, 'Failed to load dashboard analytics.'));
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

  const gaugeData = useMemo(() => {
    const accepted = overview.proposals.acceptanceRate || 0;
    return [
      { name: 'Accepted', value: Math.max(accepted, 1), fill: ORANGE },
      { name: 'Other', value: Math.max(100 - accepted, 1), fill: TEAL },
    ];
  }, [overview.proposals.acceptanceRate]);

  if (loading) {
    return (
      <div>
        <DashboardPageHeader
          eyebrow="Analytics"
          title="Admin dashboard"
          subtitle="Loading platform insights..."
        />
        <StatGridSkeleton count={4} />
      </div>
    );
  }

  return (
    <div className="wn-analytics">
      <DashboardPageHeader
        eyebrow="Analytics"
        title="Platform analytics"
        subtitle="Live overview of users, jobs, proposals, and project momentum across WorkNest."
      />

      <div className="wn-analytics__layout">
        <div style={{ display: 'grid', gap: 20 }}>
          <div className="wn-analytics__main">
            <section className="wn-analytics-card">
              <div className="wn-chart-kpi">
                <div>
                  <strong>{formatCompact(overview.financial.totalBudget)}</strong>
                  <span>Total job budget</span>
                </div>
                <div>
                  <strong>{overview.period}</strong>
                  <span>Period</span>
                </div>
                <div>
                  <strong>{overview.projects.active}</strong>
                  <span>Active projects</span>
                </div>
              </div>

              <div style={{ width: '100%', height: 260 }}>
                <ResponsiveContainer>
                  <ComposedChart data={chartPoints} margin={{ top: 8, right: 8, left: -16, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#EDE4F3" vertical={false} />
                    <XAxis dataKey="label" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis yAxisId="left" tick={{ fill: '#9CA3AF', fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#9CA3AF', fontSize: 12 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: '1px solid #E7DBEF',
                        boxShadow: '0 8px 24px rgba(73,34,91,0.12)',
                      }}
                    />
                    <Bar yAxisId="left" dataKey="jobs" fill={PURPLE} radius={[8, 8, 0, 0]} barSize={18} name="Jobs" />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="proposals"
                      stroke={ORANGE}
                      strokeWidth={3}
                      dot={false}
                      name="Proposals"
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            </section>

            <div className="wn-finance-stack">
              <div className="wn-finance-tile wn-finance-tile--purple">
                <span>Open listings</span>
                <strong>{formatCurrency(overview.financial.openBudget)}</strong>
              </div>
              <div className="wn-finance-tile wn-finance-tile--orange">
                <span>Accepted proposals</span>
                <strong>{overview.proposals.accepted}</strong>
              </div>
              <div className="wn-finance-tile wn-finance-tile--teal">
                <span>In-progress budget</span>
                <strong>{formatCurrency(overview.financial.inProgressBudget)}</strong>
              </div>
            </div>
          </div>

          <div className="wn-metric-row">
            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <Users size={18} />
                </div>
                <Delta value={overview.users.growthPct} />
              </div>
              <p className="wn-metric-card__label">Total connections</p>
              <p className="wn-metric-card__value">{overview.users.total.toLocaleString()}</p>
              <div className="wn-metric-card__bar">
                <span style={{ width: `${Math.min(100, Math.max(12, overview.users.growthPct))}%` }} />
              </div>
            </article>

            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <ShieldCheck size={18} />
                </div>
                <Delta value={overview.proposals.acceptanceRate} />
              </div>
              <p className="wn-metric-card__label">Proposal acceptance</p>
              <p className="wn-metric-card__value">{overview.proposals.acceptanceRate}%</p>
              <div className="wn-metric-card__bar">
                <span style={{ width: `${Math.min(100, overview.proposals.acceptanceRate)}%` }} />
              </div>
            </article>

            <article className="wn-metric-card">
              <div className="wn-metric-card__top">
                <div className="wn-metric-card__icon">
                  <FileText size={18} />
                </div>
                <Delta value={overview.jobs.growthPct} />
              </div>
              <p className="wn-metric-card__label">Total jobs</p>
              <p className="wn-metric-card__value">{overview.jobs.total.toLocaleString()}</p>
              <div className="wn-metric-card__bar">
                <span style={{ width: `${Math.min(100, Math.max(12, overview.jobs.growthPct))}%` }} />
              </div>
            </article>
          </div>
        </div>

        <aside className="wn-analytics-side">
          <section className="wn-campaign-card">
            <h3>Engagement pulse</h3>
            <p>Proposal conversion & hiring spend this month</p>

            <div className="wn-donut-wrap" style={{ height: 120 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={gaugeData}
                    dataKey="value"
                    innerRadius={36}
                    outerRadius={52}
                    startAngle={180}
                    endAngle={0}
                    stroke="none"
                  >
                    {gaugeData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="wn-donut-center" style={{ top: 28 }}>
                <strong style={{ color: 'white' }}>{overview.proposals.acceptanceRate}%</strong>
                <span style={{ color: 'rgba(255,255,255,0.8)' }}>accepted</span>
              </div>
            </div>

            <div className="wn-campaign-stats">
              <div>
                <span>Pipeline budget</span>
                <strong>{formatCompact(overview.financial.openBudget + overview.financial.inProgressBudget)}</strong>
                <div className="wn-campaign-delta wn-campaign-delta--up">
                  +{overview.jobs.thisMonth} jobs
                </div>
              </div>
              <div>
                <span>Proposals</span>
                <strong>{overview.proposals.thisMonth}</strong>
                <div className="wn-campaign-delta wn-campaign-delta--warn">
                  {overview.proposals.pending} pending
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
              <p>Need deeper reports? Explore projects, interviews, and proposal activity.</p>
              <Link to="/admin/projects">Open projects →</Link>
            </div>
          </section>
        </aside>
      </div>
    </div>
  );
}
