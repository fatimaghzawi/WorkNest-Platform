import { BadgeCheck, Briefcase, Building2, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../../../components/users/UserAvatar';
import type { PublicClientProfilePayload } from '../../../types/profile';
import ProfileNameBlock from './ProfileNameBlock';
import '../../../css/Profile.css';

type Props = {
  data: PublicClientProfilePayload;
  backTo?: string;
  backLabel?: string;
};

export default function ClientPublicProfileView({
  data,
  backTo,
  backLabel = 'Back',
}: Props) {
  const { profile, stats } = data;
  const memberSince = profile.createdAt
    ? new Date(profile.createdAt).toLocaleDateString(undefined, {
        month: 'long',
        year: 'numeric',
      })
    : null;

  return (
    <div className="wn-profile-page">
      {backTo && (
        <Link to={backTo} className="wn-public-profile__back">
          ← {backLabel}
        </Link>
      )}

      <section className="wn-profile-hero" aria-label="Client profile">
        <div className="wn-profile-banner">
          <div className="wn-profile-banner__mesh" aria-hidden />
        </div>

        <div className="wn-profile-header wn-public-profile__header">
          <div className="wn-profile-avatar-wrapper wn-public-profile__avatar-wrap">
            <UserAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              role="client"
              image={profile.profileImage}
              size="xl"
            />
          </div>

          <div className="wn-profile-user">
            <ProfileNameBlock
              eyebrow="Client profile"
              firstName={profile.firstName}
              lastName={profile.lastName}
              badges={
                <>
                  <span className="wn-profile-pill wn-profile-pill--role">
                    <Building2 size={14} />
                    Client
                  </span>
                  {profile.emailVerified && (
                    <span className="wn-profile-pill wn-profile-pill--verified">
                      <BadgeCheck size={14} />
                      Verified
                    </span>
                  )}
                  {memberSince && (
                    <span className="wn-profile-pill">
                      <Sparkles size={14} />
                      Member since {memberSince}
                    </span>
                  )}
                </>
              }
            />
          </div>
        </div>
      </section>

      <div className="wn-public-profile__grid">
        <section className="wn-profile-card">
          <h2 className="wn-profile-card__title">About</h2>
          <p className="wn-profile-card__body">
            {profile.bio?.trim() || 'This client has not added a bio yet.'}
          </p>
        </section>

        <section className="wn-profile-card">
          <h2 className="wn-profile-card__title">Platform activity</h2>
          <div className="wn-public-profile__stats">
            <div className="wn-public-profile__stat">
              <Briefcase size={18} />
              <div>
                <strong>{stats.jobsPosted}</strong>
                <span>Jobs posted</span>
              </div>
            </div>
            <div className="wn-public-profile__stat">
              <Sparkles size={18} />
              <div>
                <strong>{stats.projectsActive}</strong>
                <span>Active projects</span>
              </div>
            </div>
            <div className="wn-public-profile__stat">
              <BadgeCheck size={18} />
              <div>
                <strong>{stats.projectsCompleted}</strong>
                <span>Completed projects</span>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
