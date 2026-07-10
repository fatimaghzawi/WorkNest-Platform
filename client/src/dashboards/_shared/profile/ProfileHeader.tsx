import { ChangeEvent, useRef, useState } from 'react';
import { BadgeCheck, Briefcase, Camera, Pencil, Sparkles } from 'lucide-react';
import { profileApi } from '../../../api/profile.api';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import type { UserProfile } from '../../../types/profile';
import { getApiErrorMessage } from '../../../utils/apiError';
import { resolveMediaUrl } from '../../../utils/mediaUrl';
import { getUserInitials } from '../../../components/users/UserAvatar';
import { PROFILE_COPY, type ModernProfileConfig } from './profileConfig';
import ProfileNameBlock from './ProfileNameBlock';

type Props = {
  user: UserProfile;
  config: ModernProfileConfig;
  reloadProfile: () => void;
  onEdit: () => void;
};

export default function ProfileHeader({ user, config, reloadProfile, onEdit }: Props) {
  const toast = useToast();
  const { refreshUser } = useAuth();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const copy = PROFILE_COPY[config.role];
  const RoleIcon = config.role === 'client' ? Briefcase : Sparkles;

  const uploadAvatar = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      toast.warning('Image must be 5MB or smaller.');
      return;
    }

    setUploading(true);
    try {
      await profileApi.uploadAvatar(file);
      await refreshUser();
      toast.success('Profile photo updated.');
      reloadProfile();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Avatar upload failed.'));
    } finally {
      setUploading(false);
    }
  };

  const memberSince = user.createdAt
    ? new Date(user.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  const initials = getUserInitials(user.firstName, user.lastName);
  const skillCount = user.skills?.length ?? 0;
  const hasBio = Boolean(user.bio?.trim());
  const hasPhone = Boolean(user.phone?.trim());

  const stats =
    config.role === 'freelancer'
      ? [
          { value: String(skillCount), label: 'Skills listed' },
          { value: user.portfolioLink ? 'Yes' : '—', label: 'Portfolio linked' },
          {
            value: user.isActive ? 'Active' : 'Inactive',
            label: 'Account status',
            tone: user.isActive ? 'success' : 'danger',
          },
        ]
      : [
          { value: hasBio ? 'Yes' : '—', label: 'Bio added' },
          { value: hasPhone ? 'Yes' : '—', label: 'Phone added' },
          {
            value: user.isActive ? 'Active' : 'Inactive',
            label: 'Account status',
            tone: user.isActive ? 'success' : 'danger',
          },
        ];

  return (
    <section className="wn-profile-hero" aria-label="Profile overview">
      <div className="wn-profile-banner">
        <div className="wn-profile-banner__mesh" aria-hidden />
      </div>

      <div className="wn-profile-header">
        <div className="wn-profile-avatar-wrapper">
          {user.profileImage ? (
            <img
              src={resolveMediaUrl(user.profileImage)}
              alt={`${user.firstName} ${user.lastName}`}
              className="wn-profile-avatar"
            />
          ) : (
            <div className="wn-profile-avatar-placeholder" aria-hidden>
              {initials}
            </div>
          )}

          <button
            type="button"
            className="wn-profile-avatar-overlay"
            onClick={() => fileInputRef.current?.click()}
            disabled={uploading}
            aria-label="Change profile photo"
          >
            <Camera size={22} />
          </button>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            hidden
            onChange={uploadAvatar}
          />
        </div>

        <div className="wn-profile-user">
          <div className="wn-profile-user__top">
            <ProfileNameBlock
              eyebrow={copy.eyebrow}
              firstName={user.firstName}
              lastName={user.lastName}
              email={user.email}
              badges={
                <>
                  <span className="wn-profile-pill wn-profile-pill--role">
                    <RoleIcon size={14} />
                    {copy.roleLabel}
                  </span>
                  {user.emailVerified && (
                    <span className="wn-profile-pill wn-profile-pill--verified">
                      <BadgeCheck size={14} />
                      Verified
                    </span>
                  )}
                  {memberSince && (
                    <span className="wn-profile-pill">
                      Member since {memberSince}
                    </span>
                  )}
                </>
              }
            />

            <div className="wn-profile-actions">
              <Button variant="outline" onClick={onEdit} leftIcon={<Pencil size={16} />}>
                Edit profile
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="wn-profile-stats">
        {stats.map((stat) => (
          <div key={stat.label} className="wn-profile-stat">
            <span
              className={`wn-profile-stat__value${
                stat.tone === 'success'
                  ? ' wn-profile-success'
                  : stat.tone === 'danger'
                    ? ' wn-profile-danger'
                    : ''
              }`}
            >
              {stat.value}
            </span>
            <span className="wn-profile-stat__label">{stat.label}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
