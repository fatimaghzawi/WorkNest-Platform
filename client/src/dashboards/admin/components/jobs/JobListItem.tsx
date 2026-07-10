import type { Job, JobClient } from '../../../../types/job';
import { formatCurrency, formatDate } from '../../../../utils/format';
import '../../../../css/JobsAdmin.css';

function getClient(job: Job): JobClient | null {
  return typeof job.clientId === 'object' ? job.clientId : null;
}

function getDeadlineClass(deadline: string) {
  const due = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return 'wn-job-row__deadline--overdue';
  if (daysLeft <= 7) return 'wn-job-row__deadline--soon';
  return '';
}

function formatDeadlineLabel(deadline: string) {
  const due = new Date(deadline);
  const now = new Date();
  const daysLeft = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  if (daysLeft <= 7) return `${daysLeft}d left`;
  return formatDate(deadline);
}

export default function JobListItem({
  job,
  onSelect,
}: {
  job: Job;
  onSelect: (job: Job) => void;
}) {
  const client = getClient(job);
  const visibleSkills = job.skills?.slice(0, 4) ?? [];

  return (
    <button
      type="button"
      className={`wn-job-row wn-job-row--${job.status}`}
      onClick={() => onSelect(job)}
      aria-label={`Open job ${job.title}`}
    >
      <span className="wn-job-row__rail" aria-hidden />

      <div className="wn-job-row__main">
        <h3 className="wn-job-row__title">{job.title}</h3>
        <div className="wn-job-row__meta">
          {client && (
            <>
              <span>
                {client.firstName} {client.lastName}
              </span>
              <span className="wn-job-row__meta-sep">·</span>
            </>
          )}
          <span>{job.category}</span>
          <span className="wn-job-row__meta-sep">·</span>
          <span>Posted {formatDate(job.createdAt)}</span>
        </div>
        {visibleSkills.length > 0 && (
          <div className="wn-job-row__skills">
            {visibleSkills.map((skill) => (
              <span key={skill} className="wn-job-row__skill">
                {skill}
              </span>
            ))}
          </div>
        )}
      </div>

      <span className="wn-job-row__budget">{formatCurrency(job.budget)}</span>
      <span className={`wn-job-row__deadline ${getDeadlineClass(job.deadline)}`}>
        {formatDeadlineLabel(job.deadline)}
      </span>
    </button>
  );
}
