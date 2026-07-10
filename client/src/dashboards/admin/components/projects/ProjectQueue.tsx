import type { Project } from '../../../../api/projects.api';
import { formatDate } from '../../../../utils/format';
import '../../../../css/ProjectsAdmin.css';

export default function ProjectQueue({
  projects,
  selectedId,
  onSelect,
}: {
  projects: Project[];
  selectedId?: string | null;
  onSelect: (project: Project) => void;
}) {
  return (
    <nav className="wn-project-queue" aria-label="Project queue">
      <p className="wn-project-queue__title">Engagement queue</p>
      <ol className="wn-project-queue__list">
        {projects.map((project, index) => {
          const isLast = index === projects.length - 1;

          return (
            <li key={project._id} className="wn-project-queue__item-wrap">
              <button
                type="button"
                className={[
                  'wn-project-queue__item',
                  `wn-project-queue__item--${project.status}`,
                  selectedId === project._id ? 'wn-project-queue__item--active' : '',
                ]
                  .filter(Boolean)
                  .join(' ')}
                onClick={() => onSelect(project)}
              >
                <span className="wn-project-queue__rail" aria-hidden>
                  <span className={`wn-project-queue__dot wn-project-queue__dot--${project.status}`} />
                  {!isLast && <span className="wn-project-queue__line" />}
                </span>

                <span className="wn-project-queue__content">
                  <span className="wn-project-queue__copy">
                    <span className="wn-project-queue__job">{project.jobTitle || project.title}</span>
                    <span className="wn-project-queue__meta">
                      {project.clientName} · {project.freelancerName}
                    </span>
                    <span className="wn-project-queue__progress">{project.progress}% complete</span>
                  </span>
                  {project.createdAt && (
                    <span className="wn-project-queue__date">{formatDate(project.createdAt)}</span>
                  )}
                </span>
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
