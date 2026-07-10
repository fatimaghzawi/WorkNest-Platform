import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Button from '../../../components/common/Button';
import { BlockLoader } from '../../../components/common/Loader';
import JobDetailsView from '../../../components/jobs/JobDetailsView';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import Card, { CardBody } from '../../../components/common/Card';
import { useToast } from '../../../hooks/useToast';
import type { Job } from '../../../types/job';
import { getApiErrorMessage } from '../../../utils/apiError';
import { Briefcase } from 'lucide-react';
import '../../../css/DashboardFeatures.css';

export default function JobDetails() {
  const { jobId } = useParams<{ jobId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!jobId) return;
    jobsApi
      .getById(jobId)
      .then((res) => setJob(res.data.data))
      .catch((err) => toast.error(getApiErrorMessage(err, 'Failed to load job.')))
      .finally(() => setLoading(false));
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

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title={job.title}
        subtitle="Review the full project description before sending your proposal."
        actions={
          <Button variant="outline" onClick={() => navigate('/freelancer/jobs')}>
            Back to browse jobs
          </Button>
        }
      />

      <Card>
        <CardBody>
          <JobDetailsView job={job} />
        </CardBody>
      </Card>
    </div>
  );
}
