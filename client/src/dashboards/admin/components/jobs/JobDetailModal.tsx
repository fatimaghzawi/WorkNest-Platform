import Button from '../../../../components/common/Button';
import Modal from '../../../../components/common/Modal';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Job, JobClient, JobStatus } from '../../../../types/job';
import { formatCurrency, formatDate, formatDateTime } from '../../../../utils/format';
import '../../../../css/DashboardFeatures.css';
import '../../../../css/JobsAdmin.css';

const STATUS_OPTIONS: JobStatus[] = ['open', 'closed', 'in_progress'];

function getClient(job: Job): JobClient | null {
  return typeof job.clientId === 'object' ? job.clientId : null;
}

export default function JobDetailModal({
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
    <Modal open bare onClose={onClose} closeOnOverlay ariaLabelledBy="job-modal-title">
      <div className="wn-job-modal" role="document">
        <div className={`wn-job-modal__banner wn-job-modal__banner--${job.status}`}>
          <div className="wn-job-modal__top">
            <div>
              <StatusBadge status={job.status} />
              <h2 id="job-modal-title" className="wn-job-modal__title">
                {job.title}
              </h2>
              <p className="wn-job-modal__budget">{formatCurrency(job.budget)}</p>
            </div>
            <button
              type="button"
              className="wn-job-modal__close"
              onClick={onClose}
              aria-label="Close"
            >
              ×
            </button>
          </div>
        </div>

        <div className="wn-job-modal__body">
          <div className="wn-job-modal__facts">
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Client</p>
              <p className="wn-job-modal__fact-value">
                {client ? `${client.firstName} ${client.lastName}` : '—'}
              </p>
            </div>
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Category</p>
              <p className="wn-job-modal__fact-value">{job.category}</p>
            </div>
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Deadline</p>
              <p className="wn-job-modal__fact-value">{formatDate(job.deadline)}</p>
            </div>
            <div className="wn-job-modal__fact">
              <p className="wn-job-modal__fact-label">Status</p>
              <select
                className="wn-dash-select"
                style={{ width: '100%', minHeight: 36 }}
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
            <p className="wn-job-modal__section-label">Description</p>
            <p className="wn-job-modal__description">{job.description}</p>
          </div>

          {job.skills.length > 0 && (
            <div>
              <p className="wn-job-modal__section-label">Required skills</p>
              <div className="wn-dash-skills">
                {job.skills.map((skill) => (
                  <span key={skill} className="wn-dash-skill">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}

          <p className="wn-job-modal__description" style={{ margin: 0, fontSize: 13 }}>
            Listed {formatDateTime(job.createdAt)}
            {client?.email ? ` · ${client.email}` : ''}
          </p>
        </div>

        <div className="wn-job-modal__footer">
          {job.status !== 'closed' && (
            <Button
              size="sm"
              variant="outline"
              disabled={busy}
              onClick={() => onStatusChange('closed')}
            >
              Close job
            </Button>
          )}
          {job.status === 'closed' && (
            <Button size="sm" disabled={busy} onClick={() => onStatusChange('open')}>
              Reopen
            </Button>
          )}
        </div>
      </div>
    </Modal>
  );
}
