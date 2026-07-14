import { useNavigate } from 'react-router-dom';
import JobForm from '../../../components/jobs/JobForm';
import { jobsApi } from '../../../api/jobs.api';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import DashboardStudioShell from '../../_shared/studio/DashboardStudioShell';
import { useToast } from '../../../hooks/useToast';
import type { CreateJobPayload } from '../../../types/job';
import '../../../css/FreelancerStudio.css';

export default function CreateJob() {
  const navigate = useNavigate();
  const toast = useToast();

  return (
    <DashboardStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Client"
        title="Post a new job"
        subtitle="Describe your project so freelancers can review and submit proposals."
      />
      <JobForm
        submitLabel="Create job"
        onCancel={() => navigate('/client/jobs')}
        onSubmit={async (payload) => {
          await jobsApi.create(payload as CreateJobPayload);
          toast.success('Job posted successfully.');
          navigate('/client/jobs');
        }}
      />
    </DashboardStudioShell>
  );
}
