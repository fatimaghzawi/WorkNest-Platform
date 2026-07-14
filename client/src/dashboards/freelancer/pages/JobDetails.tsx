import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { BlockLoader } from '../../../components/common/Loader';
import JobDetailsView from '../../../components/jobs/JobDetailsView';
import SubmitProposalModal from '../components/proposals/SubmitProposalModal';
import { jobsApi } from '../../../api/jobs.api';
import { proposalsApi } from '../../../api/proposals.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import Card, { CardBody } from '../../../components/common/Card';
import { useToast } from '../../../hooks/useToast';
import type { Job } from '../../../types/job';
import type { Proposal } from '../../../types/proposal';
import { getApiErrorMessage } from '../../../utils/apiError';
import { Briefcase, Send } from 'lucide-react';
import '../../../css/DashboardFeatures.css';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [proposalOpen, setProposalOpen] = useState(false);
  const [hasSubmittedProposal, setHasSubmittedProposal] = useState(false);

  useEffect(() => {
    if (!jobId) return;

    let cancelled = false;

    const load = async () => {
      setLoading(true);
      try {
        const [jobResponse, proposalsResponse] = await Promise.all([
          jobsApi.getById(jobId),
          proposalsApi.getMy({ page: 1, limit: 100 }),
        ]);

        if (cancelled) return;

        setJob(jobResponse.data.data);

        const submitted = proposalsResponse.data.data.some((proposal: Proposal) => {
          const id = typeof proposal.jobId === 'string' ? proposal.jobId : proposal.jobId._id;
          return id === jobId;
        });
        setHasSubmittedProposal(submitted);
      } catch (err) {
        if (!cancelled) toast.error(getApiErrorMessage(err, 'Failed to load job.'));
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [jobId, toast]);

  if (loading) return <BlockLoader label="Loading job..." />;

  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="This listing may have been closed or removed."
        actionLabel="Browse jobs"
        actionTo="/freelancer/jobs"
      />
    );
  }

  const canSubmitProposal = job.status === 'open' && !hasSubmittedProposal;

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title={job.title}
        subtitle="Review the full project description before sending your proposal."
        actions={
          <>
            {canSubmitProposal && (
              <Button leftIcon={<Send size={16} />} onClick={() => setProposalOpen(true)}>
                Submit proposal
              </Button>
            )}
            {hasSubmittedProposal && (
              <Button variant="outline" disabled>
                Proposal submitted
              </Button>
            )}
            <Button variant="outline" onClick={() => navigate('/freelancer/jobs')}>
              Back to browse jobs
            </Button>
          </>
        }
      />

      <Card>
        <CardBody>
          <JobDetailsView job={job} />
        </CardBody>
      </Card>

      <SubmitProposalModal
        job={job}
        open={proposalOpen}
        onClose={() => setProposalOpen(false)}
        onSubmitted={() => {
          setHasSubmittedProposal(true);
          setProposalOpen(false);
        }}
      />
    </div>
  );
}
