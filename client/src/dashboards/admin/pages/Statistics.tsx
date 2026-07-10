import { useCallback, useEffect, useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import {
  Area,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Line,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  dashboardApi,
  type DashboardOverview,
  type PlatformStatisticsPayload,
  type StatusCount,
} from '../../../api/dashboard.api';
import Button from '../../../components/common/Button';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import StatisticsOverview from '../components/statistics/StatisticsOverview';
import MiniDonut from '../components/statistics/MiniDonut';
import {
  CHART,
  GlassTooltip,
  JOB_COLORS,
  PROPOSAL_COLORS,
  PROJECT_COLORS,
  RankedBars,
} from '../components/statistics/chartHelpers';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatCurrency, formatStatusLabel } from '../../../utils/format';
import '../../../css/DesignSystem.css';
import '../../../css/Interviews.css';
import '../../../css/StatisticsAdmin.css';

const PERIOD_OPTIONS = [
  { value: 6, label: '6M' },
  { value: 12, label: '12M' },
  { value: 24, label: '24M' },
] as const;

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

const emptyPayload: PlatformStatisticsPayload = {
  overview: emptyOverview,
  period: '12 Months',
  timeline: [],
  distributions: {
    jobs: [],
    proposals: [],
    projects: [],
    interviews: [],
    users: [],
  },
  jobsByCategory: [],
  topSkills: [],
};

function toPieData(items: StatusCount[] | { role: string; count: number }[], labelKey: 'status' | 'role') {
  return items
    .filter((item) => item.count > 0)
    .map((item) => ({
      name: formatStatusLabel(item[labelKey]),
      value: item.count,
    }));
}

export default function AdminStatistics() {
  const toast = useToast();
  const [months, setMonths] = useState<(typeof PERIOD_OPTIONS)[number]['value']>(12);
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<PlatformStatisticsPayload>(emptyPayload);

  const loadStatistics = useCallback(async (options?: { silent?: boolean; notifySuccess?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const response = await dashboardApi.getStatistics({ months });
      setPayload(response.data.data);
      if (options?.notifySuccess) {
        toast.success('Statistics refreshed.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load statistics.'));
      setPayload(emptyPayload);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [months, toast]);

  useEffect(() => {
    loadStatistics();
  }, [loadStatistics]);

  const { overview, timeline, distributions, jobsByCategory, topSkills } = payload;

  const jobPie = useMemo(() => toPieData(distributions.jobs, 'status'), [distributions.jobs]);
  const proposalPie = useMemo(
    () => toPieData(distributions.proposals, 'status'),
    [distributions.proposals]
  );
  const projectPie = useMemo(
    () => toPieData(distributions.projects, 'status'),
    [distributions.projects]
  );
  const userPie = useMemo(() => toPieData(distributions.users, 'role'), [distributions.users]);

  const categoryRows = useMemo(
    () =>
      jobsByCategory.map((item) => ({
        name: item.category,
        jobs: item.count,
        budget: item.budget,
      })),
    [jobsByCategory]
  );

  const skillRows = useMemo(
    () => topSkills.map((item) => ({ name: item.skill, count: item.count })),
    [topSkills]
  );

  const interviewRows = useMemo(
    () =>
      distributions.interviews.map((item) => ({
        name: formatStatusLabel(item.status),
        count: item.count,
      })),
    [distributions.interviews]
  );

  if (loading) {
    return (
      <div className="wn-stats-studio">
        <div className="wn-stats-studio__backdrop" aria-hidden>
          <span className="wn-stats-studio__blob wn-stats-studio__blob--1" />
          <span className="wn-stats-studio__blob wn-stats-studio__blob--2" />
          <span className="wn-stats-studio__blob wn-stats-studio__blob--3" />
        </div>
        <div className="wn-stats-studio__content">
          <DashboardPageHeader
            hero
            eyebrow="Admin"
            title="Statistics studio"
            subtitle="Loading visual analytics..."
          />
          <div className="wn-stats-overview wn-stats-overview--loading" aria-hidden>
            <div className="wn-stats-overview__spotlight" />
            <div className="wn-stats-overview__tiles">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="wn-stats-overview__tile" />
              ))}
            </div>
          </div>
          <div className="wn-stats-bento wn-stats-bento--loading" aria-hidden>
            <div className="wn-stats-panel wn-stats-panel--hero" />
            <div className="wn-stats-panel" />
            <div className="wn-stats-panel" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-stats-studio">
      <div className="wn-stats-studio__backdrop" aria-hidden>
        <span className="wn-stats-studio__blob wn-stats-studio__blob--1" />
        <span className="wn-stats-studio__blob wn-stats-studio__blob--2" />
        <span className="wn-stats-studio__blob wn-stats-studio__blob--3" />
      </div>

      <div className="wn-stats-studio__content">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Statistics studio"
          subtitle="Glassmorphism analytics with momentum charts, pipeline rings, and market demand insights."
          actions={
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => loadStatistics({ silent: true, notifySuccess: true })}
              disabled={loading}
            >
              Refresh
            </Button>
          }
        />

        <div className="wn-stats-toolbar wn-glass-panel">
          <div className="wn-stats-period" role="tablist" aria-label="Chart period">
            {PERIOD_OPTIONS.map((option) => (
              <button
                key={option.value}
                type="button"
                role="tab"
                aria-selected={months === option.value}
                className={`wn-stats-period__btn${months === option.value ? ' wn-stats-period__btn--active' : ''}`}
                onClick={() => setMonths(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
          <span className="wn-stats-toolbar__hint">{payload.period} rolling window</span>
        </div>

        <StatisticsOverview overview={overview} period={payload.period} />

        <div className="wn-stats-bento">
          {/* Hero momentum chart */}
          <section className="wn-stats-panel wn-stats-panel--hero wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Momentum</p>
                <h2 className="wn-stats-panel__title">Platform activity wave</h2>
                <p className="wn-stats-panel__subtitle">
                  Jobs, signups, and proposals flowing through {payload.period.toLowerCase()}
                </p>
              </div>
              <div className="wn-stats-panel__legend-inline">
                <span><i style={{ background: CHART.purple }} /> Jobs</span>
                <span><i style={{ background: CHART.teal }} /> Signups</span>
                <span><i style={{ background: CHART.orange }} /> Proposals</span>
              </div>
            </header>
            {timeline.length === 0 ? (
              <div className="wn-stats-empty">No timeline data yet.</div>
            ) : (
              <div className="wn-stats-panel__chart wn-stats-panel__chart--tall">
                <ResponsiveContainer>
                  <ComposedChart data={timeline} margin={{ top: 12, right: 8, left: -6, bottom: 0 }}>
                    <defs>
                      <linearGradient id="statJobsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.purple} stopOpacity={0.55} />
                        <stop offset="100%" stopColor={CHART.purple} stopOpacity={0} />
                      </linearGradient>
                      <linearGradient id="statSignupsFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={CHART.teal} stopOpacity={0.5} />
                        <stop offset="100%" stopColor={CHART.teal} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="rgba(110,52,130,0.08)" strokeDasharray="4 6" vertical={false} />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fill: '#8B7A96', fontSize: 11, fontWeight: 500 }}
                      axisLine={false}
                      tickLine={false}
                      dy={8}
                    />
                    <YAxis
                      yAxisId="left"
                      tick={{ fill: '#8B7A96', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      yAxisId="right"
                      orientation="right"
                      tick={{ fill: '#8B7A96', fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <Tooltip content={<GlassTooltip />} />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="jobs"
                      name="Jobs"
                      stroke={CHART.purple}
                      strokeWidth={2.5}
                      fill="url(#statJobsFill)"
                      dot={false}
                      activeDot={{ r: 5, fill: CHART.purple, stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Area
                      yAxisId="left"
                      type="monotone"
                      dataKey="signups"
                      name="Signups"
                      stroke={CHART.teal}
                      strokeWidth={2.5}
                      fill="url(#statSignupsFill)"
                      dot={false}
                      activeDot={{ r: 5, fill: CHART.teal, stroke: '#fff', strokeWidth: 2 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="proposals"
                      name="Proposals"
                      stroke={CHART.orange}
                      strokeWidth={3}
                      dot={false}
                      activeDot={{ r: 6, fill: CHART.orange, stroke: '#fff', strokeWidth: 2 }}
                    />
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Budget - dark accent panel */}
          <section className="wn-stats-panel wn-stats-panel--accent">
            <header className="wn-stats-panel__header wn-stats-panel__header--light">
              <div>
                <p className="wn-stats-panel__eyebrow">Finance</p>
                <h2 className="wn-stats-panel__title">Hiring budget pulse</h2>
                <p className="wn-stats-panel__subtitle">Monthly job budget posted</p>
              </div>
              <strong className="wn-stats-panel__kpi">
                {formatCurrency(overview.financial.totalBudget)}
              </strong>
            </header>
            {timeline.length === 0 ? (
              <div className="wn-stats-empty wn-stats-empty--light">No budget data yet.</div>
            ) : (
              <div className="wn-stats-panel__chart">
                <ResponsiveContainer>
                  <BarChart data={timeline} margin={{ top: 8, right: 4, left: -18, bottom: 0 }}>
                    <CartesianGrid stroke="rgba(255,255,255,0.08)" vertical={false} />
                    <XAxis
                      dataKey="monthLabel"
                      tick={{ fill: 'rgba(255,255,255,0.65)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                    />
                    <YAxis
                      tick={{ fill: 'rgba(255,255,255,0.55)', fontSize: 10 }}
                      axisLine={false}
                      tickLine={false}
                      tickFormatter={(v) => `$${v >= 1000 ? `${Math.round(v / 1000)}k` : v}`}
                    />
                    <Tooltip content={<GlassTooltip />} />
                    <Bar dataKey="budget" name="Budget" radius={[10, 10, 4, 4]} barSize={18}>
                      {timeline.map((_, index) => (
                        <Cell
                          key={index}
                          fill={`rgba(255,255,255,${0.35 + (index % 4) * 0.12})`}
                        />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </section>

          {/* Pipeline rings */}
          <section className="wn-stats-panel wn-stats-panel--pipeline wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Pipeline</p>
                <h2 className="wn-stats-panel__title">Status rings</h2>
                <p className="wn-stats-panel__subtitle">Jobs, proposals, and projects at a glance</p>
              </div>
            </header>
            <div className="wn-stats-pipeline-rings">
              <MiniDonut
                title="Jobs"
                data={jobPie}
                colors={JOB_COLORS}
                centerValue={overview.jobs.total}
                centerLabel="total"
              />
              <MiniDonut
                title="Proposals"
                data={proposalPie}
                colors={PROPOSAL_COLORS}
                centerValue={overview.proposals.acceptanceRate}
                centerLabel="% accepted"
              />
              <MiniDonut
                title="Projects"
                data={projectPie}
                colors={PROJECT_COLORS}
                centerValue={overview.projects.avgProgress}
                centerLabel="% progress"
              />
            </div>
          </section>

          {/* User mix */}
          <section className="wn-stats-panel wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Community</p>
                <h2 className="wn-stats-panel__title">Member composition</h2>
                <p className="wn-stats-panel__subtitle">Clients, freelancers, and admins</p>
              </div>
            </header>
            {userPie.length === 0 ? (
              <div className="wn-stats-empty">No users yet.</div>
            ) : (
              <div className="wn-stats-user-split">
                <div className="wn-stats-user-split__chart">
                  <MiniDonut
                    title=""
                    data={userPie}
                    colors={[CHART.purple, CHART.teal, CHART.lavender]}
                    centerValue={overview.users.total}
                    centerLabel="members"
                  />
                </div>
                <div className="wn-stats-user-split__stats">
                  <div>
                    <span>Active accounts</span>
                    <strong>{overview.users.active}</strong>
                  </div>
                  <div>
                    <span>Clients</span>
                    <strong>{overview.users.clients}</strong>
                  </div>
                  <div>
                    <span>Freelancers</span>
                    <strong>{overview.users.freelancers}</strong>
                  </div>
                  <div>
                    <span>New this month</span>
                    <strong>+{overview.users.thisMonth}</strong>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* Categories */}
          <section className="wn-stats-panel wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Market demand</p>
                <h2 className="wn-stats-panel__title">Top categories</h2>
                <p className="wn-stats-panel__subtitle">Where hiring volume concentrates</p>
              </div>
            </header>
            {categoryRows.length === 0 ? (
              <div className="wn-stats-empty">No category data yet.</div>
            ) : (
              <RankedBars items={categoryRows} valueKey="jobs" labelKey="name" />
            )}
          </section>

          {/* Skills */}
          <section className="wn-stats-panel wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Talent signals</p>
                <h2 className="wn-stats-panel__title">In-demand skills</h2>
                <p className="wn-stats-panel__subtitle">Most requested across job posts</p>
              </div>
            </header>
            {skillRows.length === 0 ? (
              <div className="wn-stats-empty">No skill data yet.</div>
            ) : (
              <RankedBars items={skillRows} valueKey="count" labelKey="name" />
            )}
          </section>

          {/* Interviews */}
          <section className="wn-stats-panel wn-stats-panel--wide wn-glass-panel">
            <header className="wn-stats-panel__header">
              <div>
                <p className="wn-stats-panel__eyebrow">Engagement</p>
                <h2 className="wn-stats-panel__title">Interview lifecycle</h2>
                <p className="wn-stats-panel__subtitle">
                  {overview.interviews.upcoming} upcoming of {overview.interviews.total} total sessions
                </p>
              </div>
            </header>
            {interviewRows.length === 0 ? (
              <div className="wn-stats-empty">No interviews yet.</div>
            ) : (
              <RankedBars items={interviewRows} valueKey="count" labelKey="name" />
            )}
          </section>
        </div>
      </div>
    </div>
  );
}
