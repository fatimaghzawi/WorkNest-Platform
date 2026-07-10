import { ChangeEvent, FormEvent, useCallback, useEffect, useRef, useState } from 'react';
import DashboardPageHeader from '../DashboardPageHeader';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import UserAvatar from '../../../components/users/UserAvatar';
import { StatGridSkeleton } from '../../../components/common/Skeleton';
import { profileApi } from '../../../api/profile.api';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import type { UpdateProfilePayload, UserProfile } from '../../../types/profile';
import type { UserRole } from '../../../types/auth';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/AdminProfile.css';

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const AVATAR_ACCEPT = 'image/jpeg,image/png,image/webp';

interface ProfileFormValues {
  firstName: string;
  lastName: string;
  phone: string;
  bio: string;
  profileImage: string;
  portfolioLink: string;
  skills: string;
}

function toFormValues(profile: UserProfile): ProfileFormValues {
  return {
    firstName: profile.firstName,
    lastName: profile.lastName,
    phone: profile.phone || '',
    bio: profile.bio || '',
    profileImage: profile.profileImage || '',
    portfolioLink: profile.portfolioLink || '',
    skills: profile.skills?.join(', ') || '',
  };
}

function formatDate(value?: string) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

const ROLE_LABELS: Record<UserRole, string> = {
  admin: 'Admin',
  client: 'Client',
  freelancer: 'Freelancer',
};

export default function ProfileSettingsPage({
  role,
  eyebrow,
  subtitle,
  showAbout = true,
  showSkills = true,
  showPortfolio = true,
}: {
  role: UserRole;
  eyebrow: string;
  subtitle: string;
  showAbout?: boolean;
  showSkills?: boolean;
  showPortfolio?: boolean;
}) {
  const { refreshUser } = useAuth();
  const toast = useToast();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [values, setValues] = useState<ProfileFormValues | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const loadProfile = useCallback(async () => {
    setLoading(true);
    try {
      const { data } = await profileApi.getMe();
      setProfile(data.data);
      setValues(toFormValues(data.data));
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to load profile.'));
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!values || !profile) return;

    setSaving(true);
    const payload: UpdateProfilePayload = {
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim() || undefined,
    };

    if (showAbout) {
      payload.bio = values.bio.trim() || undefined;
    }

    if (showPortfolio) {
      payload.portfolioLink = values.portfolioLink.trim() || undefined;
    }

    if (showSkills) {
      const skills = values.skills
        .split(',')
        .map((skill) => skill.trim())
        .filter(Boolean);
      payload.skills = skills.length ? skills : undefined;
    }

    try {
      const { data } = await profileApi.updateMe(payload);
      setProfile(data.data);
      setValues(toFormValues(data.data));
      await refreshUser();
      toast.success('Profile updated successfully.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to update profile.'));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarSelect = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;

    if (!AVATAR_ACCEPT.split(',').includes(file.type)) {
      toast.warning('Please choose a JPEG, PNG, or WebP image.');
      return;
    }
    if (file.size > MAX_AVATAR_SIZE) {
      toast.warning('Image must be 5MB or smaller.');
      return;
    }

    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const nextPreview = URL.createObjectURL(file);
    setPreviewUrl(nextPreview);
    setUploadingAvatar(true);

    try {
      const { data } = await profileApi.uploadAvatar(file);
      setProfile(data.data);
      setValues(toFormValues(data.data));
      await refreshUser();
      toast.success('Profile photo updated.');
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to upload profile photo.'));
    } finally {
      setUploadingAvatar(false);
      URL.revokeObjectURL(nextPreview);
      setPreviewUrl(null);
    }
  };

  const displayImage = previewUrl || values?.profileImage || profile?.profileImage;

  return (
    <div>
      <DashboardPageHeader eyebrow={eyebrow} title="Your profile" subtitle={subtitle} hero />

      {loading && <StatGridSkeleton count={1} />}

      {!loading && profile && values && (
        <div className="wn-admin-profile">
          <section className="wn-admin-profile__hero" aria-label="Profile summary">
            <div className="wn-admin-profile__avatar-block">
              <UserAvatar
                firstName={values.firstName}
                lastName={values.lastName}
                role={role}
                image={displayImage}
                size="xl"
              />
              <div className="wn-admin-profile__avatar-actions">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept={AVATAR_ACCEPT}
                  className="wn-admin-profile__file-input"
                  onChange={handleAvatarSelect}
                  aria-label="Upload profile photo"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  loading={uploadingAvatar}
                  onClick={() => fileInputRef.current?.click()}
                >
                  {displayImage ? 'Change photo' : 'Upload photo'}
                </Button>
                <p className="wn-admin-profile__hint">JPEG, PNG or WebP · max 5MB</p>
              </div>
            </div>
            <div className="wn-admin-profile__hero-text">
              <h2 className="wn-admin-profile__name">
                {values.firstName} {values.lastName}
              </h2>
              <p className="wn-admin-profile__email">{profile.email}</p>
              <div className="wn-admin-profile__badges">
                <span className="wn-admin-profile__badge wn-admin-profile__badge--role">
                  {ROLE_LABELS[role]}
                </span>
                {profile.emailVerified && (
                  <span className="wn-admin-profile__badge wn-admin-profile__badge--verified">
                    Email verified
                  </span>
                )}
              </div>
            </div>
            <dl className="wn-admin-profile__meta">
              <div>
                <dt>Member since</dt>
                <dd>{formatDate(profile.createdAt)}</dd>
              </div>
              <div>
                <dt>Last updated</dt>
                <dd>{formatDate(profile.updatedAt)}</dd>
              </div>
            </dl>
          </section>

          <form className="wn-admin-profile__form" onSubmit={handleSubmit}>
            <fieldset className="wn-admin-profile__section">
              <legend>Personal details</legend>
              <div className="wn-admin-profile__grid">
                <Input
                  label="First name"
                  value={values.firstName}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, firstName: event.target.value } : current
                    )
                  }
                  required
                />
                <Input
                  label="Last name"
                  value={values.lastName}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, lastName: event.target.value } : current
                    )
                  }
                  required
                />
                <Input
                  label="Phone"
                  type="tel"
                  value={values.phone}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, phone: event.target.value } : current
                    )
                  }
                  placeholder="+1234567890"
                />
                <Input label="Email" value={profile.email} readOnly helperText="Contact support to change your email." />
              </div>
            </fieldset>

            {showAbout && (
              <fieldset className="wn-admin-profile__section">
                <legend>About</legend>
                <textarea
                  className="wn-admin-profile__textarea"
                  value={values.bio}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, bio: event.target.value } : current
                    )
                  }
                  rows={4}
                  maxLength={500}
                  placeholder="Tell others a bit about yourself."
                />
                <p className="wn-admin-profile__hint">{values.bio.length}/500 characters</p>
              </fieldset>
            )}

            {showPortfolio && (
              <fieldset className="wn-admin-profile__section">
                <legend>Links</legend>
                <Input
                  label="Portfolio link"
                  type="url"
                  value={values.portfolioLink}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, portfolioLink: event.target.value } : current
                    )
                  }
                  placeholder="https://example.com"
                />
              </fieldset>
            )}

            {showSkills && (
              <fieldset className="wn-admin-profile__section">
                <legend>Skills</legend>
                <Input
                  label="Skills"
                  value={values.skills}
                  onChange={(event) =>
                    setValues((current) =>
                      current ? { ...current, skills: event.target.value } : current
                    )
                  }
                  placeholder="e.g. React, Design, Project management"
                  helperText="Separate skills with commas."
                />
              </fieldset>
            )}

            <div className="wn-admin-profile__actions">
              <Button
                type="button"
                variant="outline"
                onClick={() => profile && setValues(toFormValues(profile))}
                disabled={saving}
              >
                Reset
              </Button>
              <Button type="submit" loading={saving}>
                Save changes
              </Button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
