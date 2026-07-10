import { useCallback, useEffect, useMemo, useState } from 'react';
import { Download, RefreshCw } from 'lucide-react';
import {
  dashboardApi,
  type DashboardCustomer,
  type DashboardOverview,
  type DashboardRecentJob,
  type PlatformReportPayload,
} from '../../../api/dashboard.api';
import Button from '../../../components/common/Button';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import ReportsOverview from '../components/reports/ReportsOverview';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatCurrency, formatDate, formatStatusLabel } from '../../../utils/format';
import { generatePlatformReportPdf } from '../../../utils/generatePlatformReportPdf';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/ReportsAdmin.css';

const MONTHS = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

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

const emptyPayload: PlatformReportPayload = {
  overview: emptyOverview,
  chart: { period: '12 Months', points: [] },
  recentJobs: [],
  customers: [],
};

export default function AdminReports() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [exporting, setExporting] = useState(false);
  const [generatedAt, setGeneratedAt] = useState(() => new Date());
  const [payload, setPayload] = useState<PlatformReportPayload>(emptyPayload);

  const loadReport = useCallback(async (options?: { silent?: boolean; notifySuccess?: boolean }) => {
    if (!options?.silent) setLoading(true);
    try {
      const data = await dashboardApi.getPlatformReport();
      setPayload(data);
      setGeneratedAt(new Date());
      if (options?.notifySuccess) {
        toast.success('Report data refreshed.');
      }
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load platform report.'));
      setPayload(emptyPayload);
    } finally {
      if (!options?.silent) setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadReport();
  }, [loadReport]);

  const { overview, chart, recentJobs, customers } = payload;

  const monthlyRows = useMemo(
    () =>
      chart.points.map((point) => ({
        ...point,
        label: `${MONTHS[point.month - 1]} ${point.year}`,
      })),
    [chart.points]
  );

  const handleDownloadPdf = async () => {
    setExporting(true);
    try {
      generatePlatformReportPdf({
        overview,
        chart,
        recentJobs,
        customers,
        generatedAt,
      });
      toast.success('Platform report downloaded as PDF.');
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to generate PDF.'));
    } finally {
      setExporting(false);
    }
  };

  if (loading) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Platform reports"
          subtitle="Loading report data..."
        />
        <div className="wn-reports-overview wn-reports-overview--loading" aria-hidden>
          <div className="wn-reports-overview__spotlight" />
          <div className="wn-reports-overview__tiles">
            <div className="wn-reports-overview__tile" />
            <div className="wn-reports-overview__tile" />
            <div className="wn-reports-overview__tile" />
            <div className="wn-reports-overview__tile" />
            <div className="wn-reports-overview__tile" />
            <div className="wn-reports-overview__tile" />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-analytics">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="Platform reports"
        subtitle="Exportable snapshot of users, jobs, proposals, projects, and monthly activity across WorkNest."
        actions={
          <>
            <Button
              variant="outline"
              leftIcon={<RefreshCw size={16} />}
              onClick={() => loadReport({ silent: true, notifySuccess: true })}
              disabled={loading || exporting}
            >
              Refresh data
            </Button>
            <Button
              leftIcon={<Download size={16} />}
              loading={exporting}
              loadingText="Generating PDF..."
              onClick={handleDownloadPdf}
            >
              Download PDF
            </Button>
          </>
        }
      />

      <ReportsOverview overview={overview} generatedAt={generatedAt} />

      <p className="wn-reports-preview-note">
        This page mirrors the PDF export: executive metrics, pipeline breakdowns, monthly trends,
        recent jobs, and latest members — all pulled from live platform data.
      </p>

      <div className="wn-reports-grid">
        <section className="wn-analytics-card">
          <div className="wn-analytics-card__header">
            <div>
              <h2 className="wn-analytics-card__title">Monthly activity</h2>
              <p className="wn-analytics-card__subtitle">{chart.period} of jobs, proposals, and budget</p>
            </div>
          </div>
          <div className="wn-reports-table-wrap">
            <table className="wn-reports-table">
              <thead>
                <tr>
                  <th>Month</th>
                  <th>Jobs</th>
                  <th>Proposals</th>
                  <th>Budget</th>
                </tr>
              </thead>
              <tbody>
                {monthlyRows.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No monthly activity recorded yet.</td>
                  </tr>
                ) : (
                  monthlyRows.map((row) => (
                    <tr key={`${row.year}-${row.month}`}>
                      <td>{row.label}</td>
                      <td>
                        <strong>{row.jobs}</strong>
                      </td>
                      <td>{row.proposals}</td>
                      <td>{formatCurrency(row.budget)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="wn-analytics-card">
          <div className="wn-analytics-card__header">
            <div>
              <h2 className="wn-analytics-card__title">Pipeline snapshot</h2>
              <p className="wn-analytics-card__subtitle">Key operational metrics for this report</p>
            </div>
          </div>
          <ul className="wn-reports-kpi-list">
            <li>
              <span>New users this month</span>
              <strong>
                {overview.users.thisMonth}{' '}
                <small style={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  ({overview.users.growthPct >= 0 ? '+' : ''}
                  {overview.users.growthPct}%)
                </small>
              </strong>
            </li>
            <li>
              <span>New jobs this month</span>
              <strong>
                {overview.jobs.thisMonth}{' '}
                <small style={{ fontWeight: 500, fontSize: '0.75rem' }}>
                  ({overview.jobs.growthPct >= 0 ? '+' : ''}
                  {overview.jobs.growthPct}%)
                </small>
              </strong>
            </li>
            <li>
              <span>Proposals submitted</span>
              <strong>{overview.proposals.thisMonth}</strong>
            </li>
            <li>
              <span>Projects started</span>
              <strong>{overview.projects.thisMonth}</strong>
            </li>
            <li>
              <span>Proposal acceptance</span>
              <strong>{overview.proposals.acceptanceRate}%</strong>
            </li>
            <li>
              <span>Project completion</span>
              <strong>{overview.projects.completionRate}%</strong>
            </li>
            <li>
              <span>Closed job budget</span>
              <strong>{formatCurrency(overview.financial.closedBudget)}</strong>
            </li>
          </ul>
        </section>
      </div>

      <div className="wn-reports-grid">
        <section className="wn-analytics-card">
          <div className="wn-analytics-card__header">
            <div>
              <h2 className="wn-analytics-card__title">Recent jobs</h2>
              <p className="wn-analytics-card__subtitle">Latest postings included in the export</p>
            </div>
          </div>
          <div className="wn-reports-table-wrap">
            <table className="wn-reports-table">
              <thead>
                <tr>
                  <th>Job</th>
                  <th>Client</th>
                  <th>Status</th>
                  <th>Budget</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {recentJobs.length === 0 ? (
                  <tr>
                    <td colSpan={5}>No jobs to include yet.</td>
                  </tr>
                ) : (
                  recentJobs.map((job: DashboardRecentJob) => (
                    <tr key={job.id}>
                      <td>{job.title}</td>
                      <td>{job.clientName}</td>
                      <td>{formatStatusLabel(job.status)}</td>
                      <td>{formatCurrency(job.budget)}</td>
                      <td>{job.createdAt ? formatDate(job.createdAt) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>

        <section className="wn-analytics-card">
          <div className="wn-analytics-card__header">
            <div>
              <h2 className="wn-analytics-card__title">Latest members</h2>
              <p className="wn-analytics-card__subtitle">Newest clients and freelancers on the platform</p>
            </div>
          </div>
          <div className="wn-reports-table-wrap">
            <table className="wn-reports-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                </tr>
              </thead>
              <tbody>
                {customers.length === 0 ? (
                  <tr>
                    <td colSpan={4}>No members to include yet.</td>
                  </tr>
                ) : (
                  customers.map((user: DashboardCustomer) => (
                    <tr key={user.id}>
                      <td>
                        {user.firstName} {user.lastName}
                        <br />
                        <small style={{ color: 'var(--color-text-secondary)' }}>{user.email}</small>
                      </td>
                      <td>{formatStatusLabel(user.role)}</td>
                      <td>{user.isActive ? 'Active' : 'Inactive'}</td>
                      <td>{user.createdAt ? formatDate(user.createdAt) : '—'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
