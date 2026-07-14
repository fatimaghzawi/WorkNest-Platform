import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, LayoutGrid, Sparkles, Wallet } from 'lucide-react';
import { projectsApi, type Project } from '../../../api/projects.api';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { BlockLoader } from '../../../components/common/Loader';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import DashboardStudioShell from '../../_shared/studio/DashboardStudioShell';
import DashboardOverview from '../../_shared/studio/DashboardOverview';
import DashboardStudioPanel from '../../_shared/studio/DashboardStudioPanel';
import RequestReviewModal from '../../_shared/projects/RequestReviewModal';
import DepositEscrowModal from '../../_shared/payments/DepositEscrowModal';
import EscrowMoneyCard from '../../_shared/payments/EscrowMoneyCard';
import {
  projectStatusBadgeVariant,
  projectStatusLabel,
} from '../../_shared/projects/projectStatus';
import { useConfirm } from '../../../context/ConfirmContext';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useCheckoutReturn } from '../../../hooks/useCheckoutReturn';
import { formatDateTime, formatCurrency } from '../../../utils/format';
import '../../../css/DashboardFeatures.css';
import '../../../css/FreelancerStudio.css';
import '../../../css/Payments.css';

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

export default function ClientMyProjects() {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [counts, setCounts] = useState({ total: 0, active: 0, pendingReview: 0, completed: 0 });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actingId, setActingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Project | null>(null);
  const [depositTarget, setDepositTarget] = useState<Project | null>(null);

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

  useCheckoutReturn(loadProjects);

  const handleAccept = async (project: Project) => {
    const approved = await confirm({
      title: 'Accept delivery',
      message: `Mark "${project.jobTitle || project.title}" as completed? Funds in escrow will be released to the freelancer and the workspace will become read-only.`,
      confirmLabel: 'Accept delivery',
    });
    if (!approved) return;

    setActingId(project.id);
    try {
      await projectsApi.accept(project.id);
      toast.success('Project marked as completed.');
      await loadProjects();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to accept project.'));
    } finally {
      setActingId(null);
    }
  };

  const handleRequestReview = async (reviewNotes: string) => {
    if (!reviewTarget) return;

    setActingId(reviewTarget.id);
    try {
      await projectsApi.requestReview(reviewTarget.id, { reviewNotes });
      toast.success('Revision request sent to the freelancer.');
      setReviewTarget(null);
      await loadProjects();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to request revisions.'));
    } finally {
      setActingId(null);
    }
  };

  const handleCancelProject = async (project: Project) => {
    const approved = await confirm({
      title: 'Cancel project',
      message: `Cancel "${project.jobTitle || project.title}"? Escrow is settled by task progress: the freelancer is paid for completed work (minus platform fee), and the rest is refunded to you.`,
      confirmLabel: 'Cancel project',
    });
    if (!approved) return;

    setActingId(project.id);
    try {
      await projectsApi.cancel(project.id);
      toast.success('Project cancelled. Escrow settled by progress.');
      await loadProjects();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel project.'));
    } finally {
      setActingId(null);
    }
  };

  const pendingDepositCount = projects.filter((project) => project.escrowStatus === 'pending').length;
  const completionRate =
    counts.total > 0 ? Math.round((counts.completed / counts.total) * 100) : 0;

  return (
    <DashboardStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="My projects"
        subtitle="Review freelancer deliveries, accept completed work, or request revisions."
        actions={
          <Button to="/client/jobs" variant="outline">
            View jobs
          </Button>
        }
      />

      <DashboardOverview
        loading={loading && projects.length === 0}
        eyebrow="Delivery hub"
        total={counts.total}
        headline="Active engagements"
        caption={`${counts.active} in progress · ${counts.pendingReview} awaiting review · ${completionRate}% completed`}
        meterPct={completionRate}
        tiles={[
          {
            key: 'active',
            value: counts.active,
            label: 'Active',
            hint: 'Work in progress',
            icon: LayoutGrid,
            tone: 'upcoming',
          },
          {
            key: 'review',
            value: counts.pendingReview,
            label: 'In review',
            hint: 'Needs your decision',
            icon: Clock3,
            tone: 'pending',
          },
          {
            key: 'completed',
            value: counts.completed,
            label: 'Completed',
            hint: 'Accepted deliveries',
            icon: CheckCircle2,
            tone: 'confirmed',
          },
          {
            key: 'escrow',
            value: pendingDepositCount,
            label: 'Need deposit',
            hint: 'On this page',
            icon: Wallet,
            tone: 'done',
          },
        ]}
      />

      {pendingDepositCount > 0 && (
        <div className="wn-escrow-banner wn-glass-panel">
          <p>
            <strong>{pendingDepositCount}</strong> project{pendingDepositCount === 1 ? '' : 's'}{' '}
            need escrow funding before freelancers can start working.
          </p>
          <Button size="sm" to="/client/payments">
            Go to payments
          </Button>
        </div>
      )}

      {counts.pendingReview > 0 && (
        <div className="wn-project-review-banner wn-glass-panel">
          <strong>{counts.pendingReview}</strong> project
          {counts.pendingReview === 1 ? '' : 's'} awaiting your review
        </div>
      )}

      <DashboardStudioPanel
        title="Your projects"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <BlockLoader label="Loading projects..." />
        ) : projects.length === 0 ? (
          <EmptyState
            icon={LayoutGrid}
            title="No projects yet"
            description="When you accept a freelancer proposal, the shared project workspace will appear here."
            actionLabel="View my jobs"
            actionTo="/client/jobs"
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
                        Freelancer {project.freelancerName}
                        <span className="wn-dash-card-divider">•</span>
                        {project.progress}% complete
                        {project.contractAmount ? (
                          <>
                            <span className="wn-dash-card-divider">•</span>
                            {formatCurrency(project.contractAmount)}
                          </>
                        ) : null}
                      </p>
                      {project.status === 'pending_review' && project.submittedAt && (
                        <p className="wn-freelancer-project-card__hint">
                          Submitted {formatDateTime(project.submittedAt)}
                          {project.deliveryNotes ? ` — ${project.deliveryNotes}` : ''}
                        </p>
                      )}
                    </div>
                    <Badge variant={projectStatusBadgeVariant(project.status)}>
                      {projectStatusLabel(project.status)}
                    </Badge>
                  </header>

                  {project.escrowStatus && project.contractAmount && (
                    <div style={{ maxWidth: 360 }}>
                      <EscrowMoneyCard
                        amount={project.contractAmount}
                        status={project.escrowStatus}
                        cardBrand={project.payment?.cardBrand}
                        cardLast4={project.payment?.cardLast4}
                        cardholderName={project.payment?.cardholderName}
                        projectTitle={project.jobTitle || project.title}
                        compact
                      />
                    </div>
                  )}

                  <div className="wn-freelancer-project-card__actions">
                    {project.escrowStatus === 'pending' && project.contractAmount && (
                      <Button size="sm" onClick={() => setDepositTarget(project)}>
                        Deposit to escrow
                      </Button>
                    )}
                    {project.status === 'pending_review' && (
                      <>
                        <Button
                          size="sm"
                          leftIcon={<CheckCircle2 size={16} />}
                          loading={actingId === project.id}
                          onClick={() => handleAccept(project)}
                        >
                          Accept delivery
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          leftIcon={<Sparkles size={16} />}
                          disabled={actingId === project.id}
                          onClick={() => setReviewTarget(project)}
                        >
                          Request revisions
                        </Button>
                      </>
                    )}
                    {['active', 'pending_review'].includes(project.status) && (
                      <Button
                        size="sm"
                        variant="outline"
                        loading={actingId === project.id}
                        onClick={() => handleCancelProject(project)}
                      >
                        Cancel project
                      </Button>
                    )}
                    {project.status !== 'cancelled' && (
                      <Button
                        size="sm"
                        variant="primary"
                        leftIcon={<LayoutGrid size={16} />}
                        to={`/client/workspace?jobId=${project.jobId}`}
                      >
                        View workspace
                      </Button>
                    )}
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
      </DashboardStudioPanel>

      <RequestReviewModal
        open={Boolean(reviewTarget)}
        projectTitle={reviewTarget?.jobTitle || reviewTarget?.title || 'Project'}
        deliveryNotes={reviewTarget?.deliveryNotes}
        loading={actingId === reviewTarget?.id}
        onClose={() => setReviewTarget(null)}
        onSubmit={handleRequestReview}
      />

      {depositTarget && depositTarget.contractAmount && (
        <DepositEscrowModal
          open={Boolean(depositTarget)}
          projectId={depositTarget.id}
          projectTitle={depositTarget.jobTitle || depositTarget.title}
          amount={depositTarget.contractAmount}
          returnPath="/client/projects"
          onClose={() => setDepositTarget(null)}
        />
      )}
    </DashboardStudioShell>
  );
}
