import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { profileApi } from '../../../api/profile.api';
import type { PublicFreelancerProfilePayload } from '../../../types/profile';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import FreelancerPublicProfileView from '../../_shared/profile/FreelancerPublicProfileView';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function FreelancerProfile() {
  const { freelancerId } = useParams<{ freelancerId: string }>();
  const location = useLocation();
  const toast = useToast();
  const [data, setData] = useState<PublicFreelancerProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const backState = location.state as { from?: string; fromLabel?: string } | null;
  const backTo = backState?.from;
  const backLabel = backState?.fromLabel ?? 'Back';

  useEffect(() => {
    if (!freelancerId) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await profileApi.getFreelancerPublic(freelancerId);
        if (active) setData(response.data.data);
      } catch (error) {
        if (active) {
          setData(null);
          toast.error(getApiErrorMessage(error, 'Failed to load freelancer profile.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [freelancerId, toast]);

  if (loading) {
    return (
      <div>
        <DashboardPageHeader
          hero
          eyebrow="Client"
          title="Freelancer profile"
          subtitle="Loading profile..."
        />
        <StatGridSkeleton count={2} />
      </div>
    );
  }

  if (!data) {
    return (
      <EmptyState
        icon={User}
        title="Profile not found"
        description="This freelancer may be unavailable or the link is invalid."
        actionLabel={backTo ? backLabel : 'Back to dashboard'}
        actionTo={backTo || '/client/dashboard'}
      />
    );
  }

  return (
    <FreelancerPublicProfileView data={data} backTo={backTo} backLabel={backLabel} />
  );
}
