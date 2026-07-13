import Button from '../../components/common/Button';
import StatusBadge from './StatusBadge';
import type { Job } from '../../types/job';
import { formatCurrency, formatDate } from '../../utils/format';
import '../../css/DashboardFeatures.css';

interface PublicJobCardProps {
  job: Job;
}

export default function PublicJobCard({ job }: PublicJobCardProps) {
  const description =
    job.description.length > 180 ? `${job.description.slice(0, 180)}...` : job.description;

  return (
    <article className="wn-dash-card-item">
      <header className="wn-dash-card-item__header">
        <div className="wn-dash-card-item__content">
          <h3 className="wn-dash-card-item__title">{job.title}</h3>

          <p className="wn-dash-card-item__meta">
            {formatCurrency(job.budget)}
            <span className="wn-dash-card-divider">•</span>
            {job.category}
            <span className="wn-dash-card-divider">•</span>
            Due {formatDate(job.deadline)}
          </p>
        </div>

        <StatusBadge status={job.status} />
      </header>

      <p className="wn-dash-card-item__description">{description}</p>

      {job.skills.length > 0 && (
        <div className="wn-dash-skills">
          {job.skills.map((skill) => (
            <span key={skill} className="wn-dash-skill">
              {skill}
            </span>
          ))}
        </div>
      )}

      <div className="wn-dash-card-item__actions">
        <Button size="sm" to={`/jobs/${job._id}`} variant="outline">
          View Details
        </Button>
        {job.status === 'open' && (
          <Button size="sm" to="/signup" variant="primary">
            Sign up to apply
          </Button>
        )}
      </div>
    </article>
  );
}
