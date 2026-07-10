import { CalendarDays, UserRound } from 'lucide-react';
import StatusBadge from '../../../../components/jobs/StatusBadge';
import type { Job, JobClient } from '../../../../types/job';
import { formatCurrency, formatDate } from '../../../../utils/format';
import '../../../../css/JobsAdmin.css';

function getClient(job: Job): JobClient | null {
  return typeof job.clientId === 'object' ? job.clientId : null;
}

function getDeadlineTone(deadline: string) {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return 'overdue';
  if (daysLeft <= 7) return 'soon';
  return 'normal';
}

function formatDeadlineLabel(deadline: string) {
  const daysLeft = Math.ceil(
    (new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );
  if (daysLeft < 0) return `${Math.abs(daysLeft)}d overdue`;
  if (daysLeft === 0) return 'Due today';
  if (daysLeft === 1) return 'Due tomorrow';
  if (daysLeft <= 7) return `${daysLeft}d left`;
  return formatDate(deadline);
}

export default function JobCard({
  job,
  onSelect,
}: {
  job: Job;
  onSelect: (job: Job) => void;
}) {
  const client = getClient(job);
  const skills = job.skills?.slice(0, 3) ?? [];
  const deadlineTone = getDeadlineTone(job.deadline);

  return (
    <button
      type="button"
      className={`wn-job-card wn-job-card--${job.status}`}
      onClick={() => onSelect(job)}
      aria-label={`Open job ${job.title}`}
    >
      <div className="wn-job-card__top">
        <StatusBadge status={job.status} />
        <span className="wn-job-card__category">{job.category}</span>
      </div>

      <h3 className="wn-job-card__title">{job.title}</h3>

      {client && (
        <p className="wn-job-card__client">
          <UserRound size={14} />
          {client.firstName} {client.lastName}
        </p>
      )}

      {skills.length > 0 && (
        <div className="wn-job-card__skills">
          {skills.map((skill) => (
            <span key={skill} className="wn-job-card__skill">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="wn-job-card__footer">
        <div>
          <p className="wn-job-card__budget">{formatCurrency(job.budget)}</p>
          <p className="wn-job-card__posted">Posted {formatDate(job.createdAt)}</p>
        </div>
        <span className={`wn-job-card__deadline wn-job-card__deadline--${deadlineTone}`}>
          <CalendarDays size={14} />
          {formatDeadlineLabel(job.deadline)}
        </span>
      </div>
    </button>
  );
}
