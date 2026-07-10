import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { BlockLoader } from '../../../components/common/Loader';
import JobForm from '../../../components/jobs/JobForm';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import { useToast } from '../../../hooks/useToast';
import type { Job, UpdateJobPayload } from '../../../types/job';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/DashboardFeatures.css';

export default function EditJob() {
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
        title="Job not found"
        description="This job may have been removed or you do not have access."
        actionLabel="Back to my jobs"
        actionTo="/client/jobs"
      />
    );
  }

  const isLocked = job.status === 'closed' || job.status === 'in_progress';

  if (isLocked) {
    return (
      <div>
        <DashboardPageHeader
          hero
          eyebrow="Client"
          title="Job locked"
          subtitle={`"${job.title}" can no longer be edited because the project is ${job.status === 'closed' ? 'completed' : 'in progress'}.`}
        />
        <EmptyState
          title="This job is read-only"
          description={
            job.status === 'closed'
              ? 'The project was completed and this listing is closed.'
              : 'Work has started on this job. Manage delivery from My projects or the workspace.'
          }
          actionLabel="Back to my jobs"
          actionTo="/client/jobs"
        />
      </div>
    );
  }

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="Edit job"
        subtitle={`Update details for "${job.title}".`}
      />
      <JobForm
        initialJob={job}
        submitLabel="Save changes"
        onCancel={() => navigate('/client/jobs')}
        onSubmit={async (payload) => {
          await jobsApi.update(job._id, payload as UpdateJobPayload);
          toast.success('Job updated successfully.');
          navigate('/client/jobs');
        }}
      />
    </div>
  );
}
