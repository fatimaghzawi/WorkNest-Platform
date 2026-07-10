import { useCallback, useEffect, useMemo, useState } from 'react';
import { Briefcase } from 'lucide-react';
import Pagination from '../../../components/common/Pagination';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import JobPipelineBoard from '../components/jobs/JobPipelineBoard';
import JobInspectorPanel from '../components/jobs/JobInspectorPanel';
import JobsPipelineOverview, { type JobPipelineStats } from '../components/jobs/JobsPipelineOverview';
import type { Job, JobStatus } from '../../../types/job';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useDebouncedValue } from '../../../hooks/useDebouncedValue';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import { formatStatusLabel } from '../../../utils/format';
import '../../../css/DesignSystem.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DashboardFeatures.css';
import '../../../css/JobsAdmin.css';

type StatusFilter = JobStatus | 'all';
type SortOption = 'newest' | 'budget_desc' | 'budget_asc';

const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
  { value: 'all', label: 'All jobs' },
  { value: 'open', label: 'Open' },
  { value: 'in_progress', label: 'In progress' },
  { value: 'closed', label: 'Closed' },
];

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: 'newest', label: 'Newest first' },
  { value: 'budget_desc', label: 'Highest budget' },
  { value: 'budget_asc', label: 'Lowest budget' },
];

const emptyStats: JobPipelineStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  closed: 0,
};

export default function AdminJobs() {
  const toast = useToast();
  const confirm = useConfirm();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [stats, setStats] = useState<JobPipelineStats>(emptyStats);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [sort, setSort] = useState<SortOption>('newest');
  const [loading, setLoading] = useState(true);
  const [actionBusy, setActionBusy] = useState(false);

  const listParams = useMemo(
    () => ({
      page,
      limit: statusFilter === 'all' ? 24 : 15,
      search: debouncedSearch.trim() || undefined,
      status: statusFilter === 'all' ? undefined : statusFilter,
      sort,
    }),
    [page, debouncedSearch, statusFilter, sort]
  );

  const loadStats = useCallback(async () => {
    try {
      const response = await jobsApi.getStats();
      setStats(response.data.data);
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not refresh job overview stats.'));
    }
  }, [toast]);

  const loadJobs = useCallback(async (silent = false) => {
    if (!silent) setLoading(true);
    try {
      const response = await jobsApi.list(listParams);
      const nextJobs = response.data.data;
      setJobs(nextJobs);
      setTotalPages(response.data.meta?.totalPages || 1);

      setSelectedJob((current) => {
        if (!current) return null;
        return nextJobs.find((job) => job._id === current._id) ?? current;
      });
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load jobs.'));
    } finally {
      if (!silent) setLoading(false);
    }
  }, [listParams, toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  useEffect(() => {
    loadStats();
  }, [loadStats]);

  const refreshAll = async (silent = true) => {
    await Promise.all([loadJobs(silent), loadStats()]);
  };

  const handleStatusChange = async (status: JobStatus) => {
    if (!selectedJob || selectedJob.status === status) return;

    if (status === 'closed') {
      const confirmed = await confirm({
        title: 'Close job',
        message: `Close "${selectedJob.title}"? It will no longer accept new proposals.`,
        confirmLabel: 'Close job',
      });
      if (!confirmed) return;
    }

    setActionBusy(true);
    try {
      const response = await jobsApi.updateStatus(selectedJob._id, status);
      const updated = response.data.data;
      setJobs((current) => current.map((job) => (job._id === updated._id ? updated : job)));
      setSelectedJob(updated);
      toast.success(`Job marked as ${formatStatusLabel(status).toLowerCase()}.`);
      void loadStats();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update job status.'));
    } finally {
      setActionBusy(false);
    }
  };

  const handleStageClick = (status: JobStatus) => {
    setStatusFilter((current) => (current === status ? 'all' : status));
    setPage(1);
  };

  useEffect(() => {
    if (!loading && jobs.length > 0) {
      setSelectedJob((current) => {
        if (current && jobs.some((job) => job._id === current._id)) return current;
        return jobs[0];
      });
    } else if (!loading && jobs.length === 0) {
      setSelectedJob(null);
    }
  }, [loading, jobs]);

  const visibleLanes =
    statusFilter === 'all'
      ? undefined
      : [statusFilter];

  const hasFilters = Boolean(debouncedSearch.trim()) || statusFilter !== 'all';

  if (loading && jobs.length === 0) {
    return (
      <div className="wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Admin"
          title="Job pipeline"
          subtitle="Loading listings..."
        />
        <div className="wn-jobs-overview wn-jobs-overview--loading" aria-hidden>
          <div className="wn-jobs-overview__spotlight" />
          <div className="wn-jobs-overview__tiles">
            <div className="wn-jobs-overview__tile" />
            <div className="wn-jobs-overview__tile" />
            <div className="wn-jobs-overview__tile" />
            <div className="wn-jobs-overview__tile" />
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
        title="Job pipeline"
        subtitle="Track listings through each stage — open, in progress, and closed."
      />

      <JobsPipelineOverview
        stats={stats}
        activeFilter={statusFilter}
        onStageClick={handleStageClick}
      />

      <section className="wn-analytics-card wn-jobs-toolbar">
        <label className="wn-jobs-sort">
          <span>Sort by</span>
          <select
            className="wn-dash-select"
            value={sort}
            onChange={(e) => {
              setSort(e.target.value as SortOption);
              setPage(1);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        <input
          className="wn-dash-search wn-jobs-search"
          placeholder="Search jobs..."
          value={search}
          onChange={(e) => { setSearch(e.target.value); setPage(1); }}
          aria-label="Search jobs"
        />

        <div className="wn-jobs-filters">
          {STATUS_FILTERS.map((filter) => (
            <button
              key={filter.value}
              type="button"
              className={`wn-jobs-chip ${statusFilter === filter.value ? 'wn-jobs-chip--active' : ''}`}
              onClick={() => { setStatusFilter(filter.value); setPage(1); }}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </section>

      <div className="wn-analytics__layout wn-jobs-studio">
        <section className="wn-analytics-card wn-jobs-board-wrap">
          {loading ? (
            <div className="wn-jobs-board-skeleton" aria-hidden>
              <div />
              <div />
              <div />
            </div>
          ) : jobs.length === 0 ? (
            <EmptyState
              icon={Briefcase}
              title={hasFilters ? 'No jobs match your filters' : 'No jobs in this view'}
              description={
                hasFilters
                  ? 'Try another pipeline stage or adjust your search.'
                  : 'Jobs will appear here once clients start posting.'
              }
            />
          ) : (
            <>
              <JobPipelineBoard
                jobs={jobs}
                selectedId={selectedJob?._id}
                onSelect={setSelectedJob}
                visibleStatuses={visibleLanes}
              />
              {totalPages > 1 && (
                <div className="wn-jobs-pagination">
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </section>

        {selectedJob && (
          <JobInspectorPanel
            job={selectedJob}
            onClose={() => setSelectedJob(null)}
            onStatusChange={handleStatusChange}
            busy={actionBusy}
          />
        )}
      </div>
    </div>
  );
}
