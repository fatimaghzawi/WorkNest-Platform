import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import { BlockLoader } from '../../components/common/Loader';
import Card, { CardBody } from '../../components/common/Card';
import JobDetailsView from '../../components/jobs/JobDetailsView';
import { jobsApi } from '../../api/jobs.api';
import type { Job } from '../../types/job';
import '../../css/StaticPage.css';
import '../../css/DashboardFeatures.css';

export default function JobDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    jobsApi
      .getById(id)
      .then((res) => setJob(res.data.data))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) return <BlockLoader label="Loading job..." />;

  if (error || !job) {
    return (
      <div className="wn-static-page">
        <div className="wn-static-page__inner">
          <div className="wn-empty">
            <p className="wn-empty__title">Job not found</p>
            <p className="wn-empty__desc">This listing may have been closed or removed.</p>
            <div className="wn-empty__actions">
              <Button to="/jobs">Browse jobs</Button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="wn-static-page">
      <div className="wn-static-page__inner wn-static-page__inner--wide">
        <div style={{ marginBottom: 'var(--space-4)' }}>
          <Button variant="outline" onClick={() => navigate('/jobs')}>
             Back to all jobs
          </Button>
        </div>

        <Card>
          <CardBody>
            <JobDetailsView job={job} />

            {job.status === 'open' && (
              <div
                className="wn-job-detail__sidebar-card"
                style={{ marginTop: 'var(--space-4)', textAlign: 'center' }}
              >
                <p style={{ marginBottom: 'var(--space-2)' }}>
                  Want to submit a proposal for this job?
                </p>
                <Button to="/signup">Sign up as a freelancer</Button>
                <p style={{ marginTop: 'var(--space-2)' }}>
                  Already have an account? <Link to="/login">Log in</Link>
                </p>
              </div>
            )}
          </CardBody>
        </Card>
      </div>
    </div>
  );
}
