import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, LayoutGrid, RotateCcw } from 'lucide-react';
import { projectsApi, type Project } from '../../../api/projects.api';
import Badge from '../../../components/common/Badge';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import { BlockLoader } from '../../../components/common/Loader';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
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

const PROJECTS_PAGE_SIZE = 10;

export default function ClientMyProjects() {
  const toast = useToast();
  const confirm = useConfirm();
  const [loading, setLoading] = useState(true);
  const [projects, setProjects] = useState<Project[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actingId, setActingId] = useState<string | null>(null);
  const [reviewTarget, setReviewTarget] = useState<Project | null>(null);
  const [depositTarget, setDepositTarget] = useState<Project | null>(null);

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
      message: `Cancel "${project.jobTitle || project.title}"? Held escrow will be refunded when applicable and the workspace will close.`,
      confirmLabel: 'Cancel project',
    });
    if (!approved) return;

    setActingId(project.id);
    try {
      await projectsApi.cancel(project.id);
      toast.success('Project cancelled.');
      await loadProjects();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to cancel project.'));
    } finally {
      setActingId(null);
    }
  };

  const pendingCount = projects.filter((project) => project.status === 'pending_review').length;

  const pendingDepositCount = projects.filter((project) => project.escrowStatus === 'pending').length;

  if (loading) return <BlockLoader label="Loading projects..." />;

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="My projects"
        subtitle="Review freelancer deliveries, accept completed work, or request revisions."
        actions={
          <Button to="/client/workspace" variant="outline">
            View workspace
          </Button>
        }
      />

      {pendingDepositCount > 0 && (
        <div className="wn-escrow-banner">
          <p>
            <strong>{pendingDepositCount}</strong> project{pendingDepositCount === 1 ? '' : 's'}{' '}
            need escrow funding before freelancers can start working.
          </p>
          <Button size="sm" to="/client/payments">
            Go to payments
          </Button>
        </div>
      )}

      {pendingCount > 0 && (
        <div className="wn-project-review-banner">
          <strong>{pendingCount}</strong> project{pendingCount === 1 ? '' : 's'} awaiting your review
        </div>
      )}

      {projects.length === 0 ? (
        <EmptyState
          icon={LayoutGrid}
          title="No projects yet"
          description="When you accept a freelancer proposal, the shared project workspace will appear here."
          actionLabel="View my jobs"
          actionTo="/client/jobs"
        />
      ) : (
        <div className="wn-dash-card-list">
          {projects.map((project) => (
            <article key={project.id} className="wn-dash-card-item">
              <header className="wn-dash-card-item__header">
                <div className="wn-dash-card-item__content">
                  <h3 className="wn-dash-card-item__title">{project.jobTitle || project.title}</h3>
                  <p className="wn-dash-card-item__meta">
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
                    <p className="wn-project-status-hint">
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
                <div style={{ marginBottom: 14, maxWidth: 360 }}>
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

              <div className="wn-dash-card-item__actions">
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
                      leftIcon={<RotateCcw size={16} />}
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
      )}

      {totalPages > 1 && (
        <div style={{ marginTop: 16 }}>
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}

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
    </div>
  );
}
