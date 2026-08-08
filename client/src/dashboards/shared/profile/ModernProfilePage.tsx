import { useCallback, useEffect, useState } from 'react';
import { User } from 'lucide-react';
import { profileApi } from '@/api/profile.api';
import type { UserProfile } from '@/types/profile';
import EmptyState from '@/dashboards/shared/EmptyState';
import { StatGridSkeleton } from '@/components/Skeleton';
import { getApiErrorMessage } from '@/utils/apiError';
import { useToast } from '@/hooks/useToast';
import ProfileHeader from '@/dashboards/shared/profile/ProfileHeader';
import ProfileAbout from '@/dashboards/shared/profile/ProfileAbout';
import ProfileMeta from '@/dashboards/shared/profile/ProfileMeta';
import ProfileSkills from '@/dashboards/shared/profile/ProfileSkills';
import EditProfileModal from '@/dashboards/shared/profile/EditProfileModal';
import type { ModernProfileConfig } from '@/dashboards/shared/profile/profileConfig';
import '@/styles/Profile.css';

export default function ModernProfilePage(config: ModernProfileConfig) {
  const toast = useToast();
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const showSkills = config.showSkills ?? config.role === 'freelancer';

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const res = await profileApi.getMe();
      setUser(res.data.data);
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load profile.'));
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  if (loading) {
    return (
      <div className="wn-profile-page">
        <StatGridSkeleton count={2} />
      </div>
    );
  }

  if (!user) {
    return (
      <EmptyState
        icon={User}
        title="Profile not found"
        description="We could not load your profile. Try refreshing the page."
        actionLabel="Retry"
        onAction={loadProfile}
      />
    );
  }

  const openEdit = () => setEditOpen(true);

  return (
    <div className="wn-profile-page">
      <ProfileHeader
        user={user}
        config={config}
        reloadProfile={loadProfile}
        onEdit={openEdit}
      />

      <div className="wn-profile-grid">
        <div className="wn-profile-main">
          <ProfileAbout user={user} role={config.role} onEdit={openEdit} />
          {showSkills && <ProfileSkills user={user} onEdit={openEdit} />}
        </div>
        <aside className="wn-profile-sidebar">
          <ProfileMeta user={user} config={config} onEdit={openEdit} />
        </aside>
      </div>

      <EditProfileModal
        open={editOpen}
        user={user}
        config={config}
        onClose={() => setEditOpen(false)}
        onUpdated={() => {
          setEditOpen(false);
          loadProfile();
        }}
      />
    </div>
  );
}
