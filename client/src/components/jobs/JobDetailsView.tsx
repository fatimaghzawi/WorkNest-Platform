import { useMemo, useState } from 'react';
import type { Job } from '../../types/job';
import { formatCurrency, formatDate, getDeadlineUrgency, getInitials } from '../../utils/format';
import StatusBadge from './StatusBadge';
import '../../css/DashboardFeatures.css';

const DESCRIPTION_PREVIEW_CHARS = 280;

export default function JobDetailsView({ job }: { job: Job }) {
  const client = typeof job.clientId === 'object' ? job.clientId : null;
  const clientName = client ? `${client.firstName} ${client.lastName}` : 'Client';
  const urgency = getDeadlineUrgency(job.deadline);
  const [descriptionExpanded, setDescriptionExpanded] = useState(false);

  const postedDaysAgo = Math.max(
    1,
    Math.round((new Date().getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );
  const deadlineDays = Math.max(
    1,
    Math.round((new Date(job.deadline).getTime() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
  );
  const elapsedPct = Math.min(100, Math.max(0, Math.round((postedDaysAgo / deadlineDays) * 100)));

  const descriptionNeedsToggle = job.description.length > DESCRIPTION_PREVIEW_CHARS;
  const visibleDescription = useMemo(() => {
    if (!descriptionNeedsToggle || descriptionExpanded) return job.description;
    return `${job.description.slice(0, DESCRIPTION_PREVIEW_CHARS).trimEnd()}…`;
  }, [descriptionExpanded, descriptionNeedsToggle, job.description]);

  return (
    <div className="wn-job-detail-page">
      <div className="wn-job-detail__hero">
        <div className="wn-job-detail__hero-top">
          <div className="wn-job-detail__hero-copy">
            <div className="wn-job-detail__hero-eyebrow">{job.category}</div>
            <h2 className="wn-job-detail__hero-title">{job.title}</h2>
          </div>
          <StatusBadge status={job.status} />
        </div>

        <div className="wn-job-detail__hero-avatar-row">
          <span className="wn-avatar">{getInitials(clientName)}</span>
          <span>Posted by {clientName}</span>
        </div>

        <div className="wn-job-detail__hero-meta">
          <div className="wn-job-detail__hero-meta-item">
            <span className="wn-job-detail__hero-meta-label">Budget</span>
            <span className="wn-job-detail__hero-meta-value">{formatCurrency(job.budget)}</span>
          </div>
          <div className="wn-job-detail__hero-meta-item">
            <span className="wn-job-detail__hero-meta-label">Deadline</span>
            <span className="wn-job-detail__hero-meta-value">{formatDate(job.deadline)}</span>
          </div>
          <div className="wn-job-detail__hero-meta-item">
            <span className="wn-job-detail__hero-meta-label">Time left</span>
            <span className="wn-job-detail__hero-meta-value">{urgency.label}</span>
          </div>
        </div>
      </div>

      <div className="wn-job-detail">
        <div className="wn-job-detail__main">
          <div className="wn-job-detail__section">
            <div className="wn-job-detail__section-title">Description</div>
            <p className="wn-job-detail__description">{visibleDescription}</p>
            {descriptionNeedsToggle && (
              <button
                type="button"
                className="wn-job-detail__desc-toggle"
                onClick={() => setDescriptionExpanded((open) => !open)}
              >
                {descriptionExpanded ? 'Show less' : 'Show more'}
              </button>
            )}
          </div>

          <div className="wn-job-detail__section">
            <div className="wn-job-detail__section-title">Required skills</div>
            <div className="wn-dash-skills">
              {job.skills.map((skill) => (
                <span key={skill} className="wn-dash-skill">
                  {skill}
                </span>
              ))}
            </div>
          </div>
        </div>

        <aside className="wn-job-detail__sidebar">
          <div className="wn-job-detail__sidebar-card">
            <div className="wn-job-detail__section-title">Job overview</div>

            <div className="wn-job-detail__facts">
              <div className="wn-job-detail__fact">
                <span>Category</span>
                <strong>{job.category}</strong>
              </div>
              <div className="wn-job-detail__fact wn-job-detail__fact--desktop-only">
                <span>Budget</span>
                <strong>{formatCurrency(job.budget)}</strong>
              </div>
              <div className="wn-job-detail__fact wn-job-detail__fact--desktop-only">
                <span>Deadline</span>
                <strong>{formatDate(job.deadline)}</strong>
              </div>
              <div className="wn-job-detail__fact">
                <span>Status</span>
                <strong>
                  <StatusBadge status={job.status} />
                </strong>
              </div>
            </div>

            <div className="wn-job-detail__progress-block">
              <div className="wn-job-detail__sidebar-row wn-job-detail__sidebar-row--flush">
                <span>Time elapsed</span>
                <span className={`wn-urgency-chip wn-urgency-chip--${urgency.level}`}>{urgency.label}</span>
              </div>
              <div className="wn-job-detail__progress-track">
                <div className="wn-job-detail__progress-fill" style={{ width: `${elapsedPct}%` }} />
              </div>
            </div>
          </div>

          <div className="wn-job-detail__sidebar-card">
            <div className="wn-job-detail__section-title">Posted by</div>
            <div className="wn-job-card__client wn-job-detail__client">
              <span className="wn-avatar wn-avatar--lg">{getInitials(clientName)}</span>
              <span>
                <strong>{clientName}</strong>
                <br />
                Client
              </span>
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
