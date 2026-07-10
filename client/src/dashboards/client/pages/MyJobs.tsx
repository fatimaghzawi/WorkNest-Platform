import { useCallback, useEffect, useState } from 'react';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import CategoryIcon from '../../../components/jobs/CategoryIcon';
import StatusBadge from '../../../components/jobs/StatusBadge';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import type { Job, JobStatus } from '../../../types/job';
import { getApiErrorMessage } from '../../../utils/apiError';
import { formatCurrency, formatDate, getDeadlineUrgency } from '../../../utils/format';
import '../../../css/DashboardFeatures.css';

const FILTER_STATUS_OPTIONS: JobStatus[] = ['open', 'closed', 'in_progress'];

const isJobLocked = (status: JobStatus) => status === 'closed' || status === 'in_progress';

export default function MyJobs() {
  const toast = useToast();
  const confirm = useConfirm();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<JobStatus | ''>('');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const loadJobs = useCallback(async () => {
    setLoading(true);

    try {
      const response = await jobsApi.getMyJobs({
        page,
        limit: 10,
        status: status || undefined,
        sort: 'newest',
        search: search || undefined,
      });

      setJobs(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load your jobs.'));
    } finally {
      setLoading(false);
    }
  }, [page, status, search, toast]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  const handleDelete = async (job: Job) => {
    const confirmed = await confirm({
      title: 'Delete job',
      message: `Delete "${job.title}"? This permanently removes the job and all related proposals. This cannot be undone.`,
      confirmLabel: 'Delete job',
      variant: 'danger',
    });
    if (!confirmed) return;

    try {
      await jobsApi.delete(job._id);
      toast.success('Job deleted successfully.');
      await loadJobs();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to delete job.'));
    }
  };

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="My jobs"
        subtitle="Manage listings, review proposals, and track project status."
        actions={
          <Button to="/client/jobs/new" variant="primary">
            Post a job
          </Button>
        }
      />

      <div className="wn-dash-toolbar">
        <input
          type="text"
          className="wn-dash-search"
          placeholder="Search by title, description or category..."
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
        />

        <select
          className="wn-dash-select"
          value={status}
          onChange={(e) => {
            setStatus(e.target.value as JobStatus | '');
            setPage(1);
          }}
        >
          <option value="">All statuses</option>

          {FILTER_STATUS_OPTIONS.map((option) => (
            <option key={option} value={option}>
              {option.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>

      <div className="wn-dash-page__card">
        {loading ? (
          <p>Loading your jobs...</p>
        ) : jobs.length === 0 ? (
          <EmptyState
            title="No jobs posted yet"
            description="Create your first job to start receiving proposals."
            actionLabel="Post a job"
            actionTo="/client/jobs/new"
          />
        ) : (
          <>
            <div className="wn-job-grid">
              {jobs.map((job) => {
                const urgency = getDeadlineUrgency(job.deadline);
                return (
                  <article key={job._id} className={`wn-job-card wn-job-card--${job.status}`}>
                    <div className="wn-job-card__top">
                      <span className="wn-job-card__category">
                        <span className="wn-job-card__category-icon">
                          <CategoryIcon />
                        </span>
                        {job.category}
                      </span>
                      <StatusBadge status={job.status} kind="job" />
                    </div>
                    <h3 className="wn-job-card__title">{job.title}</h3>
                    <p className="wn-job-card__desc">{job.description}</p>
                    <div className="wn-job-card__meta-row">
                      <span className="wn-job-card__budget">{formatCurrency(job.budget)}</span>
                      <span className={`wn-urgency-chip wn-urgency-chip--${urgency.level}`}>
                        {urgency.label}
                      </span>
                    </div>
                    {job.skills.length > 0 && (
                      <div className="wn-job-card__skills">
                        {job.skills.slice(0, 6).map((skill) => (
                          <span key={skill} className="wn-dash-skill">
                            {skill}
                          </span>
                        ))}
                      </div>
                    )}
                    <div className="wn-job-card__footer">
                      <span style={{ fontSize: 12, color: 'var(--color-text-secondary)' }}>
                        Due {formatDate(job.deadline)}
                      </span>
                    </div>
                    <div className="wn-job-card__actions">
                      {!isJobLocked(job.status) && (
                        <Button size="sm" variant="outline" to={`/client/jobs/${job._id}/edit`}>
                          Edit
                        </Button>
                      )}
                      <Button size="sm" variant="outline" to={`/client/jobs/${job._id}/proposals`}>
                        Proposals
                      </Button>
                      {(job.status === 'in_progress' || job.status === 'closed') && (
                        <Button size="sm" to={`/client/workspace?jobId=${job._id}`}>
                          View workspace
                        </Button>
                      )}
                      {job.status === 'open' && (
                        <Button size="sm" variant="danger" onClick={() => handleDelete(job)}>
                          Delete
                        </Button>
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
            {totalPages > 1 && (
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            )}
          </>
        )}
      </div>
    </div>
  );
}
