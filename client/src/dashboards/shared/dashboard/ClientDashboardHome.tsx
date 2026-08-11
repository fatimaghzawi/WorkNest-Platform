import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowUpRight,
  Briefcase,
  CalendarDays,
  FolderKanban,
  Send,
  Sparkles,
  TrendingUp,
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
  type ClientDashboardPayload,
  type ClientDashboardOverview,
} from '@/api/dashboard.api';
import Button from '@/components/Button';
import { StatGridSkeleton } from '@/components/Skeleton';
import DashboardPageHeader from '@/dashboards/shared/DashboardPageHeader';
import DashboardInterviewMiniCalendar from '@/dashboards/shared/dashboard/DashboardInterviewMiniCalendar';
import DashboardStudioShell from '@/dashboards/shared/studio/DashboardStudioShell';
import { formatCurrency } from '@/utils/format';
import { useToast } from '@/hooks/useToast';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import { getApiErrorMessage } from '@/utils/apiError';
import '@/styles/DesignSystem.css';
import '@/styles/AdminAnalytics.css';
import '@/styles/Interviews.css';
import '@/styles/FreelancerStudio.css';
import '@/styles/ClientDashboard.css';

const PURPLE = '#49225B';
const ORANGE = '#F97316';
const TEAL = '#14B8A6';
const LIGHT = '#E7DBEF';

const JOB_STATUS_COLORS: Record<string, string> = {
  open: TEAL,
  in_progress: ORANGE,
  closed: PURPLE,
};

const PROPOSAL_STATUS_COLORS: Record<string, string> = {
  pending: ORANGE,
  accepted: TEAL,
  rejected: '#C084FC',
};

function formatCompact(value: number) {
  if (value >= 1_000_000) return `${(value / 1_000_000).toFixed(1)}M`;
  if (value >= 1_000) return `${(value / 1_000).toFixed(value >= 10_000 ? 0 : 1)}k`;
  return String(value);
}

const emptyOverview: ClientDashboardOverview = {
  jobs: { total: 0, open: 0, inProgress: 0, closed: 0, growthPct: 0, thisMonth: 0 },
  proposals: {
    total: 0,
    pending: 0,
    accepted: 0,
    rejected: 0,
    acceptanceRate: 0,
    thisMonth: 0,
  },
  projects: { total: 0, active: 0, completed: 0, avgProgress: 0, completionRate: 0 },
  interviews: { total: 0, upcoming: 0 },
  financial: { totalBudget: 0, openBudget: 0, inProgressBudget: 0, closedBudget: 0 },
  period: '1 Month',
};

export default function ClientDashboardHome() {
  const toast = useToast();
  const isCompact = useMediaQuery('(max-width: 768px)');
  const [loading, setLoading] = useState(true);
  const [payload, setPayload] = useState<ClientDashboardPayload | null>(null);

  useEffect(() => {
    let active = true;

    const load = async () => {
      setLoading(true);
      try {
        const response = await dashboardApi.getClientDashboard();
        if (active) setPayload(response.data.data);
      } catch (error) {
        if (active) setPayload(null);
        toast.error(getApiErrorMessage(error, 'Failed to load your hiring analytics.'));
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
  const jobDistribution = payload?.distributions.jobs ?? [];
  const proposalDistribution = payload?.distributions.proposals ?? [];

  const hireRateData = useMemo(() => {
    const rate = overview.proposals.acceptanceRate || 0;
    return [
      { name: 'Accepted', value: Math.max(rate, 1), fill: ORANGE },
      { name: 'Other', value: Math.max(100 - rate, 1), fill: 'rgba(255,255,255,0.22)' },
    ];
  }, [overview.proposals.acceptanceRate]);

  const jobPieData = useMemo(
    () =>
      jobDistribution
        .filter((item) => item.count > 0)
        .map((item) => ({
          name: item.status.replace('_', ' '),
          value: item.count,
          fill: JOB_STATUS_COLORS[item.status] || PURPLE,
        })),
    [jobDistribution]
  );

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

  const pipelinePct =
    overview.jobs.total > 0
      ? Math.round((overview.jobs.inProgress / overview.jobs.total) * 100)
      : 0;

  if (loading) {
    return (
      <DashboardStudioShell>
        <DashboardPageHeader
          hero
          eyebrow="Client HQ"
          title="Hiring command center"
          subtitle="Loading your jobs, proposals, and project insights..."
          actions={
            <Button to="/client/jobs/new" variant="primary">
              Post a new job
            </Button>
          }
        />
        <StatGridSkeleton count={4} />
      </DashboardStudioShell>
    );
  }

  return (
    <DashboardStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Client HQ"
        title="Hiring command center"
        subtitle="Track postings, proposal flow, interviews, and project momentum in one cinematic workspace."
        actions={
          <Button to="/client/jobs/new" variant="primary">
            Post a new job
          </Button>
        }
      />

      <div className="wn-client-hq">
        <div className="wn-client-hq__signal-row">
          <article className="wn-client-signal wn-client-signal--jobs">
            <div className="wn-client-signal__icon">
              <Briefcase size={18} />
            </div>
            <div className="wn-client-signal__copy">
              <span>My jobs</span>
              <strong>{overview.jobs.total}</strong>
            </div>
            <em className="wn-client-signal__delta">
              <TrendingUp size={12} />
              {overview.jobs.growthPct > 0 ? '+' : ''}
              {overview.jobs.growthPct}%
            </em>
            <div className="wn-client-signal__meter" aria-hidden>
              <span style={{ width: `${Math.min(100, Math.max(10, overview.jobs.growthPct))}%` }} />
            </div>
          </article>

          <article className="wn-client-signal wn-client-signal--hire">
            <div className="wn-client-signal__icon">
              <Send size={18} />
            </div>
            <div className="wn-client-signal__copy">
              <span>Hire rate</span>
              <strong>{overview.proposals.acceptanceRate}%</strong>
            </div>
            <em className="wn-client-signal__delta">{overview.proposals.accepted} hired</em>
            <div className="wn-client-signal__meter" aria-hidden>
              <span style={{ width: `${overview.proposals.acceptanceRate}%` }} />
            </div>
          </article>

          <article className="wn-client-signal wn-client-signal--talks">
            <div className="wn-client-signal__icon">
              <CalendarDays size={18} />
            </div>
            <div className="wn-client-signal__copy">
              <span>Interviews</span>
              <strong>{overview.interviews.upcoming}</strong>
            </div>
            <em className="wn-client-signal__delta">{overview.interviews.total} total</em>
            <div className="wn-client-signal__meter" aria-hidden>
              <span
                style={{
                  width: `${
                    overview.interviews.total > 0
                      ? Math.round((overview.interviews.upcoming / overview.interviews.total) * 100)
                      : 0
                  }%`,
                }}
              />
            </div>
          </article>

          <article className="wn-client-signal wn-client-signal--build">
            <div className="wn-client-signal__icon">
              <FolderKanban size={18} />
            </div>
            <div className="wn-client-signal__copy">
              <span>Active builds</span>
              <strong>{overview.projects.active}</strong>
            </div>
            <em className="wn-client-signal__delta">{overview.projects.avgProgress}% avg</em>
            <div className="wn-client-signal__meter" aria-hidden>
              <span style={{ width: `${overview.projects.avgProgress}%` }} />
            </div>
          </article>
        </div>

        <div className="wn-client-hq__stage">
          <section className="wn-client-window">
            <header className="wn-client-window__chrome">
              <div className="wn-client-window__dots" aria-hidden>
                <i />
                <i />
                <i />
              </div>
              <div>
                <h3>Hiring activity</h3>
                <p>Jobs posted vs proposals received</p>
              </div>
              <span className="wn-client-window__live">
                <Sparkles size={12} />
                Live
              </span>
            </header>

            <div className="wn-client-window__kpis">
              <div>
                <strong>{formatCurrency(overview.financial.totalBudget)}</strong>
                <span>Posted budget</span>
              </div>
              <div>
                <strong>{overview.proposals.total}</strong>
                <span>Proposals</span>
              </div>
              <div>
                <strong>{overview.projects.active}</strong>
                <span>Active projects</span>
              </div>
            </div>

            <div className="wn-client-window__chart">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <ComposedChart
                  data={chartPoints}
                  margin={
                    isCompact
                      ? { top: 8, right: 4, left: 0, bottom: 4 }
                      : { top: 4, right: 4, left: 0, bottom: 0 }
                  }
                >
                  <defs>
                    <linearGradient id="clientJobsBar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor={PURPLE} stopOpacity={1} />
                      <stop offset="100%" stopColor="#A56ABD" stopOpacity={0.75} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#EDE4F3" vertical={false} />
                  <XAxis
                    dataKey="label"
                    tick={{ fill: '#9CA3AF', fontSize: isCompact ? 9 : 10 }}
                    axisLine={false}
                    tickLine={false}
                    interval={isCompact ? 'preserveStartEnd' : 0}
                    minTickGap={isCompact ? 16 : 8}
                  />
                  <YAxis
                    yAxisId="left"
                    tick={{ fill: '#9CA3AF', fontSize: isCompact ? 9 : 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={isCompact ? 28 : 32}
                  />
                  <YAxis
                    yAxisId="right"
                    orientation="right"
                    tick={{ fill: '#9CA3AF', fontSize: isCompact ? 9 : 10 }}
                    axisLine={false}
                    tickLine={false}
                    width={isCompact ? 24 : 28}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 14,
                      border: '1px solid #E7DBEF',
                      boxShadow: '0 12px 28px rgba(73,34,91,0.14)',
                      fontSize: 12,
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="jobs"
                    fill="url(#clientJobsBar)"
                    radius={[8, 8, 0, 0]}
                    barSize={isCompact ? 10 : 14}
                    name="Jobs posted"
                  />
                  <Line
                    yAxisId="right"
                    type="monotone"
                    dataKey="proposals"
                    stroke={ORANGE}
                    strokeWidth={2.5}
                    dot={false}
                    name="Proposals"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </section>

          <section className="wn-client-cal-panel">
            <DashboardInterviewMiniCalendar interviewsPath="/client/interviews" />
          </section>
        </div>

        <div className="wn-client-ledger">
          <article className="wn-client-ledger__tile wn-client-ledger__tile--a">
            <span>Open listings</span>
            <strong>{formatCurrency(overview.financial.openBudget)}</strong>
            <small>Budget still hiring</small>
          </article>
          <article className="wn-client-ledger__tile wn-client-ledger__tile--b">
            <span>Pending proposals</span>
            <strong>{overview.proposals.pending}</strong>
            <small>Waiting on your review</small>
          </article>
          <article className="wn-client-ledger__tile wn-client-ledger__tile--c">
            <span>In-progress spend</span>
            <strong>{formatCurrency(overview.financial.inProgressBudget)}</strong>
            <small>Active project capital</small>
          </article>
        </div>

        <div className="wn-client-hq__split">
          <div className="wn-client-hq__main">
            <div className="wn-client-pipes">
              <section className="wn-client-pipe">
                <header className="wn-client-pipe__head">
                  <div>
                    <p className="wn-client-pipe__label">Job pipeline</p>
                    <h3>{overview.jobs.total} postings</h3>
                  </div>
                  <div className="wn-client-pipe__chart">
                    {jobPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <PieChart>
                          <Pie data={jobPieData} dataKey="value" innerRadius={34} outerRadius={52} stroke="none">
                            {jobPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="wn-client-pipe__empty">Post a job</p>
                    )}
                  </div>
                </header>
                <div className="wn-client-pipe__track" aria-hidden>
                  <span style={{ width: `${pipelinePct}%` }} />
                </div>
                <ul className="wn-client-pipe__legend">
                  <li>
                    <i className="is-open" />
                    {overview.jobs.open} open
                  </li>
                  <li>
                    <i className="is-progress" />
                    {overview.jobs.inProgress} in progress
                  </li>
                  <li>
                    <i className="is-closed" />
                    {overview.jobs.closed} closed
                  </li>
                </ul>
              </section>

              <section className="wn-client-pipe">
                <header className="wn-client-pipe__head">
                  <div>
                    <p className="wn-client-pipe__label">Proposal inbox</p>
                    <h3>{overview.proposals.total} received</h3>
                  </div>
                  <div className="wn-client-pipe__chart">
                    {proposalPieData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%" debounce={50}>
                        <PieChart>
                          <Pie
                            data={proposalPieData}
                            dataKey="value"
                            innerRadius={34}
                            outerRadius={52}
                            stroke="none"
                          >
                            {proposalPieData.map((entry) => (
                              <Cell key={entry.name} fill={entry.fill} />
                            ))}
                          </Pie>
                        </PieChart>
                      </ResponsiveContainer>
                    ) : (
                      <p className="wn-client-pipe__empty">Awaiting bids</p>
                    )}
                  </div>
                </header>
                <div className="wn-client-pipe__track" aria-hidden>
                  <span style={{ width: `${overview.proposals.acceptanceRate}%` }} />
                </div>
                <ul className="wn-client-pipe__legend">
                  <li>
                    <i className="is-pending" />
                    {overview.proposals.pending} pending
                  </li>
                  <li>
                    <i className="is-accepted" />
                    {overview.proposals.accepted} accepted
                  </li>
                  <li>
                    <i className="is-rejected" />
                    {overview.proposals.rejected} declined
                  </li>
                </ul>
              </section>
            </div>

            <section className="wn-client-health">
              <div className="wn-client-health__orb" aria-hidden>
                <UsersGlyph />
              </div>
              <div className="wn-client-health__copy">
                <p className="wn-client-pipe__label">Project health</p>
                <h3>
                  {overview.projects.active} active · {overview.projects.completed} completed
                </h3>
              </div>
              <div className="wn-client-health__stats">
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
          </div>

          <aside className="wn-client-mission">
            <div className="wn-client-mission__glow" aria-hidden />
            <p className="wn-client-mission__eyebrow">Hiring pulse</p>
            <h3>Conversion this month</h3>
            <p className="wn-client-mission__caption">
              Proposal conversion & project progress at a glance
            </p>

            <div className="wn-client-mission__gauge">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <PieChart>
                  <Pie
                    data={hireRateData}
                    dataKey="value"
                    innerRadius={42}
                    outerRadius={58}
                    startAngle={210}
                    endAngle={-30}
                    stroke="none"
                  >
                    {hireRateData.map((entry) => (
                      <Cell key={entry.name} fill={entry.fill} />
                    ))}
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="wn-client-mission__gauge-center">
                <strong>{overview.proposals.acceptanceRate}%</strong>
                <span>hired</span>
              </div>
            </div>

            <div className="wn-client-mission__stats">
              <div>
                <span>Pipeline budget</span>
                <strong>
                  {formatCompact(
                    overview.financial.openBudget + overview.financial.inProgressBudget
                  )}
                </strong>
                <em>+{overview.jobs.thisMonth} jobs this month</em>
              </div>
              <div>
                <span>Proposals</span>
                <strong>{overview.proposals.thisMonth}</strong>
                <em>{overview.proposals.pending} pending review</em>
              </div>
            </div>

            <div className="wn-client-mission__spark">
              <ResponsiveContainer width="100%" height="100%" debounce={50}>
                <ComposedChart
                  data={chartPoints.slice(-8)}
                  margin={{ top: 0, right: 0, left: 0, bottom: 0 }}
                >
                  <Bar dataKey="jobs" fill="rgba(255,255,255,0.32)" barSize={6} radius={[4, 4, 0, 0]} />
                  <Line type="monotone" dataKey="proposals" stroke={LIGHT} strokeWidth={2} dot={false} />
                </ComposedChart>
              </ResponsiveContainer>
            </div>

            <div className="wn-client-mission__cta">
              <p>Active projects are {overview.projects.avgProgress}% complete on average.</p>
              <Link to="/client/projects">
                Open projects
                <ArrowUpRight size={14} />
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </DashboardStudioShell>
  );
}

function UsersGlyph() {
  return (
    <svg viewBox="0 0 24 24" width="28" height="28" fill="none" aria-hidden>
      <path
        d="M16 11a3 3 0 1 0-2.83-4M8 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
      <path
        d="M4.5 19a4.5 4.5 0 0 1 9 0M14 19a4 4 0 0 1 6.5-3.1"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
      />
    </svg>
  );
}
