import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'react-router-dom';
import { User } from 'lucide-react';
import { profileApi } from '../../../api/profile.api';
import type { PublicClientProfilePayload } from '../../../types/profile';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import ClientPublicProfileView from '../../_shared/profile/ClientPublicProfileView';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import { useToast } from '../../../hooks/useToast';
import { getApiErrorMessage } from '../../../utils/apiError';

export default function ClientProfile() {
  const { clientId } = useParams<{ clientId: string }>();
  const location = useLocation();
  const toast = useToast();
  const [data, setData] = useState<PublicClientProfilePayload | null>(null);
  const [loading, setLoading] = useState(true);

  const backState = location.state as { from?: string; fromLabel?: string } | null;
  const backTo = backState?.from;
  const backLabel = backState?.fromLabel ?? 'Back';

  useEffect(() => {
    if (!clientId) return;

    let active = true;
    const load = async () => {
      setLoading(true);
      try {
        const response = await profileApi.getClientPublic(clientId);
        if (active) setData(response.data.data);
      } catch (error) {
        if (active) {
          setData(null);
          toast.error(getApiErrorMessage(error, 'Failed to load client profile.'));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    load();
    return () => {
      active = false;
    };
  }, [clientId, toast]);

  if (loading) {
    return (
      <div>
        <DashboardPageHeader
          hero
          eyebrow="Freelancer"
          title="Client profile"
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
        description="This client may be unavailable or you do not have access."
        actionLabel={backTo ? backLabel : 'Back to dashboard'}
        actionTo={backTo || '/freelancer/dashboard'}
      />
    );
  }

  return (
    <ClientPublicProfileView data={data} backTo={backTo} backLabel={backLabel} />
  );
}
