import Button from '../../../../components/common/Button';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Job, JobClient, JobStatus } from '../../../../types/job';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/format';
import '../../../../css/JobsAdmin.css';

const STATUS_OPTIONS: JobStatus[] = ['open', 'closed', 'in_progress'];

function getClient(job: Job): JobClient | null {
  return typeof job.clientId === 'object' ? job.clientId : null;
}

export default function JobInspectorPanel({
  job,
  onClose,
  onStatusChange,
  busy,
}: {
  job: Job;
  onClose: () => void;
  onStatusChange: (status: JobStatus) => void;
  busy: boolean;
}) {
  const client = getClient(job);

  return (
    <aside className="wn-analytics-card wn-job-inspector" aria-label={`Job ${job.title}`}>
      <button
        type="button"
        className="wn-job-inspector__close"
        onClick={onClose}
        aria-label="Close job inspector"
      >
        ×
      </button>

      <div className={`wn-job-inspector__hero wn-job-inspector__hero--${job.status}`}>
        <StatusBadge status={job.status} />
        <h2 className="wn-job-inspector__title">{job.title}</h2>
        <p className="wn-job-inspector__budget">{formatCurrency(job.budget)}</p>
        {client && (
          <p className="wn-job-inspector__client">
            {client.firstName} {client.lastName}
            {client.email ? ` · ${client.email}` : ''}
          </p>
        )}
      </div>

      <div className="wn-job-inspector__body">
        <div className="wn-job-inspector__facts">
          <div className="wn-job-inspector__fact">
            <span>Category</span>
            <strong>{job.category}</strong>
          </div>
          <div className="wn-job-inspector__fact">
            <span>Deadline</span>
            <strong>{formatDate(job.deadline)}</strong>
          </div>
          <div className="wn-job-inspector__fact">
            <span>Listed</span>
            <strong>{formatDate(job.createdAt)}</strong>
          </div>
          <div className="wn-job-inspector__fact">
            <span>Status</span>
            <select
              className="wn-dash-select"
              value={job.status}
              disabled={busy}
              onChange={(e) => onStatusChange(e.target.value as JobStatus)}
            >
              {STATUS_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option.replace('_', ' ')}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <p className="wn-job-inspector__label">Description</p>
          <p className="wn-job-inspector__description">{job.description}</p>
        </div>

        {job.skills.length > 0 && (
          <div>
            <p className="wn-job-inspector__label">Required skills</p>
            <div className="wn-job-inspector__skills">
              {job.skills.map((skill) => (
                <span key={skill}>{skill}</span>
              ))}
            </div>
          </div>
        )}

        <p className="wn-job-inspector__meta">Posted {formatDateTime(job.createdAt)}</p>
      </div>

      <div className="wn-job-inspector__footer">
        {job.status !== 'closed' && (
          <Button size="sm" variant="outline" disabled={busy} onClick={() => onStatusChange('closed')}>
            Close job
          </Button>
        )}
        {job.status === 'closed' && (
          <Button size="sm" disabled={busy} onClick={() => onStatusChange('open')}>
            Reopen
          </Button>
        )}
      </div>
    </aside>
  );
}
