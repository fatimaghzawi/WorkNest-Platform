import { CalendarDays, LayoutGrid, Users } from 'lucide-react';
import Button from '../../../../components/common/Button';
import Badge from '../../../../components/common/Badge';
import type { Project } from '../../../../api/projects.api';
import { formatDate } from '../../../../utils/format';
import '../../../../css/ProjectsAdmin.css';

function statusVariant(status: Project['status']) {
  if (status === 'active') return 'success' as const;
  if (status === 'completed') return 'info' as const;
  return 'outline' as const;
}

export default function ProjectDetailPanel({ project }: { project: Project }) {
  return (
    <section className="wn-analytics-card wn-project-detail" aria-label="Project detail">
      <div className={`wn-project-detail__hero wn-project-detail__hero--${project.status}`}>
        <div className="wn-project-detail__hero-top">
          <Badge variant={statusVariant(project.status)}>{project.status}</Badge>
          {project.createdAt && (
            <span className="wn-project-detail__time">
              <CalendarDays size={14} />
              Started {formatDate(project.createdAt)}
            </span>
          )}
        </div>
        <h2 className="wn-project-detail__title">{project.jobTitle || project.title}</h2>
        <p className="wn-project-detail__id">Project #{project._id.slice(-8).toUpperCase()}</p>
      </div>

      <div className="wn-project-detail__body">
        <div className="wn-project-detail__team">
          <article>
            <Users size={16} />
            <div>
              <p>Client</p>
              <strong>{project.clientName}</strong>
            </div>
          </article>
          <article>
            <Users size={16} />
            <div>
              <p>Freelancer</p>
              <strong>{project.freelancerName}</strong>
            </div>
          </article>
        </div>

        <div className="wn-project-detail__progress-wrap">
          <div className="wn-project-detail__progress-head">
            <span>Delivery progress</span>
            <strong>{project.progress}%</strong>
          </div>
          <div className="wn-project-detail__progress-bar" aria-hidden>
            <span style={{ width: `${Math.max(project.progress, 4)}%` }} />
          </div>
        </div>

        {project.githubLink && (
          <div className="wn-project-detail__link">
            <p>Repository</p>
            <a href={project.githubLink} target="_blank" rel="noreferrer">
              {project.githubLink}
            </a>
          </div>
        )}
      </div>

      <div className="wn-project-detail__footer">
        <Button to={`/admin/workspace?jobId=${project.jobId}`} leftIcon={<LayoutGrid size={16} />}>
          Open workspace
        </Button>
        <Button variant="outline" to="/admin/interviews">
          Interviews
        </Button>
        <Button variant="outline" to="/admin/proposals">
          Proposals
        </Button>
      </div>
    </section>
  );
}
