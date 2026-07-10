import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, LayoutGrid } from 'lucide-react';
import { projectsApi, type Project } from '../../../api/projects.api';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { BlockLoader } from '../../../components/common/Loader';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import CompleteProjectModal from '../../_shared/projects/CompleteProjectModal';
import {
  projectStatusBadgeVariant,
  projectStatusLabel,
} from '../../_shared/projects/projectStatus';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/DashboardFeatures.css';

const PROJECTS_PAGE_SIZE = 10;

export default function MyProjects() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const response = await projectsApi.list({ page, limit: PROJECTS_PAGE_SIZE });
      setProjects(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      setProjects([]);
      toast.error(getApiErrorMessage(error, 'Failed to load your projects.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadProjects();
  }, [loadProjects]);

  const handleSubmitForReview = async (deliveryNotes: string) => {
    if (!completeTarget) return;

    setSubmittingId(completeTarget.id);
    try {
      await projectsApi.submitForReview(completeTarget.id, {
        deliveryNotes: deliveryNotes || undefined,
      });
      toast.success('Project submitted for client review.');
      setCompleteTarget(null);
      await loadProjects();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to submit project.'));
    } finally {
      setSubmittingId(null);
    }
  };

  if (loading) return <BlockLoader label="Loading projects..." />;

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title="My projects"
        subtitle="Track delivery progress, submit completed work, and respond to client feedback."
        actions={
          <Button to="/freelancer/jobs" variant="outline">
            Browse jobs
          </Button>
        }
      />

      {projects.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No projects yet"
          description="Once a client accepts your proposal, the project workspace will appear here."
          actionLabel="Find work"
          actionTo="/freelancer/jobs"
        />
      ) : (
        <div className="wn-dash-card-list">
          {projects.map((project) => (
            <article key={project.id} className="wn-dash-card-item">
              <header className="wn-dash-card-item__header">
                <div className="wn-dash-card-item__content">
                  <h3 className="wn-dash-card-item__title">{project.jobTitle || project.title}</h3>
                  <p className="wn-dash-card-item__meta">
                    Client {project.clientName}
                    <span className="wn-dash-card-divider">•</span>
                    {project.progress}% complete
                  </p>
                  {project.status === 'pending_review' && (
                    <p className="wn-project-status-hint">
                      Submitted for review — waiting for the client to accept or request changes.
                    </p>
                  )}
                  {project.status === 'completed' && (
                    <p className="wn-project-status-hint">
                      Project completed — workspace is read-only.
                    </p>
                  )}
                  {project.status === 'active' && project.reviewNotes && (
                    <p className="wn-project-status-hint wn-project-status-hint--revision">
                      Client requested revisions: {project.reviewNotes}
                    </p>
                  )}
                  {project.deliveryNotes && project.status === 'pending_review' && (
                    <p className="wn-project-status-hint">Your notes: {project.deliveryNotes}</p>
                  )}
                </div>
                <Badge variant={projectStatusBadgeVariant(project.status)}>
                  {projectStatusLabel(project.status)}
                </Badge>
              </header>

              <div className="wn-dash-card-item__actions">
                {project.status === 'active' && (
                  <Button
                    size="sm"
                    variant="secondary"
                    leftIcon={<CheckCircle2 size={16} />}
                    onClick={() => setCompleteTarget(project)}
                  >
                    Complete project
                  </Button>
                )}
                <Button
                  size="sm"
                  variant="primary"
                  leftIcon={<LayoutGrid size={16} />}
                  to={`/freelancer/workspace?jobId=${project.jobId}`}
                >
                  {project.status === 'active' ? 'Open workspace' : 'View workspace'}
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div style={{ marginTop: 16 }}>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}

      <CompleteProjectModal
        open={Boolean(completeTarget)}
        projectTitle={completeTarget?.jobTitle || completeTarget?.title || 'Project'}
        loading={submittingId === completeTarget?.id}
        onClose={() => setCompleteTarget(null)}
        onSubmit={handleSubmitForReview}
      />
    </div>
  );
}
