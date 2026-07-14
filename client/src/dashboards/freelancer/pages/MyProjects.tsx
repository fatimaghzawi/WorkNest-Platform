import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, LayoutGrid, Sparkles } from 'lucide-react';
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
import FreelancerStudioShell from '../components/FreelancerStudioShell';
import FreelancerOverview from '../components/FreelancerOverview';
import FreelancerStudioPanel from '../components/FreelancerStudioPanel';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/FreelancerStudio.css';

const PROJECTS_PAGE_SIZE = 9;

async function fetchProjectCounts() {
  const [allRes, activeRes, reviewRes, completedRes] = await Promise.all([
    projectsApi.list({ page: 1, limit: 1 }),
    projectsApi.list({ page: 1, limit: 1, status: 'active' }),
    projectsApi.list({ page: 1, limit: 1, status: 'pending_review' }),
    projectsApi.list({ page: 1, limit: 1, status: 'completed' }),
  ]);

  return {
    total: allRes.data.meta?.total ?? 0,
    active: activeRes.data.meta?.total ?? 0,
    pendingReview: reviewRes.data.meta?.total ?? 0,
    completed: completedRes.data.meta?.total ?? 0,
  };
}

export default function MyProjects() {
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, pendingReview: 0, completed: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [completeTarget, setCompleteTarget] = useState<Project | null>(null);

  const loadProjects = useCallback(async () => {
    setLoading(true);
    try {
      const [response, nextCounts] = await Promise.all([
        projectsApi.list({ page, limit: PROJECTS_PAGE_SIZE }),
        fetchProjectCounts(),
      ]);
      setProjects(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
      setCounts(nextCounts);
    } catch (error) {
      setProjects([]);
      toast.error(getApiErrorMessage(error, 'Failed to load your projects.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    void loadProjects();
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

  const completionRate =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return (
    <FreelancerStudioShell>
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

      <FreelancerOverview
        loading={loading && projects.length === 0}
        eyebrow="Delivery hub"
        total={counts.total}
        headline="Active engagements"
        caption={`${counts.active} in progress · ${counts.pendingReview} in review · ${completionRate}% completed`}
        meterPct={completionRate}
        tiles={[
          {
            key: 'active',
            value: counts.active,
            label: 'Active',
            hint: 'Workspace unlocked',
            icon: LayoutGrid,
            tone: 'upcoming',
          },
          {
            key: 'review',
            value: counts.pendingReview,
            label: 'In review',
            hint: 'Awaiting client',
            icon: Clock3,
            tone: 'pending',
          },
          {
            key: 'completed',
            value: counts.completed,
            label: 'Completed',
            hint: 'Closed successfully',
            icon: CheckCircle2,
            tone: 'confirmed',
          },
          {
            key: 'page',
            value: projects.length,
            label: 'This page',
            hint: `Page ${page} of ${totalPages}`,
            icon: Sparkles,
            tone: 'done',
          },
        ]}
      />

      <FreelancerStudioPanel
        title="Your projects"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <BlockLoader label="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No projects yet"
            description="Once a client accepts your proposal, the project workspace will appear here."
            actionLabel="Find work"
            actionTo="/freelancer/jobs"
          />
        ) : (
          <>
            <div className="wn-freelancer-projects-grid">
              {projects.map((project) => (
                <article key={project.id} className="wn-freelancer-project-card wn-glass-card">
                  <header className="wn-freelancer-project-card__header">
                    <div>
                      <h3 className="wn-freelancer-project-card__title">
                        {project.jobTitle || project.title}
                      </h3>
                      <p className="wn-freelancer-project-card__meta">
                        Client {project.clientName}
                        <span className="wn-dash-card-divider">•</span>
                        {project.progress}% complete
                      </p>
                      {project.status === 'pending_review' && (
                        <p className="wn-freelancer-project-card__hint">
                          Submitted for review — waiting for the client to accept or request changes.
                        </p>
                      )}
                      {project.status === 'completed' && (
                        <p className="wn-freelancer-project-card__hint">
                          Project completed — workspace is read-only.
                        </p>
                      )}
                      {project.status === 'active' && project.reviewNotes && (
                        <p className="wn-freelancer-project-card__hint wn-freelancer-project-card__hint--revision">
                          Client requested revisions: {project.reviewNotes}
                        </p>
                      )}
                    </div>
                    <Badge variant={projectStatusBadgeVariant(project.status)}>
                      {projectStatusLabel(project.status)}
                    </Badge>
                  </header>

                  <div className="wn-freelancer-project-card__actions">
                    {project.status === 'active' && (
                      <Button
                        size="sm"
                        variant="secondary"
                        leftIcon={<CheckCircle2 size={16} />}
                        disabled={project.progress < 100}
                        onClick={() => setCompleteTarget(project)}
                      >
                        Complete project
                      </Button>
                    )}
                    {project.status === 'active' && project.progress < 100 && (
                      <p className="wn-freelancer-project-card__hint">
                        Approve all workspace tasks before submitting ({project.progress}% complete).
                      </p>
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
            {totalPages > 1 && (
              <div className="wn-freelancer-studio__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </FreelancerStudioPanel>

      <CompleteProjectModal
        open={Boolean(completeTarget)}
        projectTitle={completeTarget?.jobTitle || completeTarget?.title || 'Project'}
        loading={submittingId === completeTarget?.id}
        canSubmit={(completeTarget?.progress ?? 0) >= 100}
        taskProgressLabel={
          (completeTarget?.progress ?? 0) < 100
            ? `All tasks must be approved before you can submit the project (${completeTarget?.progress ?? 0}% complete).`
            : undefined
        }
        onClose={() => setCompleteTarget(null)}
        onSubmit={handleSubmitForReview}
      />
    </FreelancerStudioShell>
  );
}
