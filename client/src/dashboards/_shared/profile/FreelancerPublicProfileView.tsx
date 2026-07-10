import {
  BadgeCheck,
  Briefcase,
  ExternalLink,
  Globe,
  Sparkles,
  Trophy,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import UserAvatar from '../../../components/users/UserAvatar';
import type { PublicFreelancerProfilePayload } from '../../../types/profile';
import { formatDate } from '../../../utils/format';
import ProfileNameBlock from './ProfileNameBlock';
import '../../../css/Profile.css';

type Props = {
  data: PublicFreelancerProfilePayload;
  backTo?: string;
  backLabel?: string;
};

function formatPortfolioHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function FreelancerPublicProfileView({
  data,
  backTo,
  backLabel = 'Back',
}: Props) {
  const { profile, stats, recentProjects } = data;
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

      <section className="wn-profile-hero" aria-label="Freelancer profile">
        <div className="wn-profile-banner">
          <div className="wn-profile-banner__mesh" aria-hidden />
        </div>

        <div className="wn-profile-header wn-public-profile__header">
          <div className="wn-profile-avatar-wrapper wn-public-profile__avatar-wrap">
            <UserAvatar
              firstName={profile.firstName}
              lastName={profile.lastName}
              role="freelancer"
              image={profile.profileImage}
              size="xl"
            />
          </div>

          <div className="wn-profile-user">
            <ProfileNameBlock
              eyebrow="Freelancer profile"
              firstName={profile.firstName}
              lastName={profile.lastName}
              badges={
                <>
                  <span className="wn-profile-pill wn-profile-pill--role">
                    <Sparkles size={14} />
                    Freelancer
                  </span>
                  {profile.emailVerified && (
                    <span className="wn-profile-pill wn-profile-pill--verified">
                      <BadgeCheck size={14} />
                      Verified
                    </span>
                  )}
                  {memberSince && (
                    <span className="wn-profile-pill">Member since {memberSince}</span>
                  )}
                </>
              }
            />
          </div>
        </div>

        <div className="wn-profile-stats">
          <div className="wn-profile-stat">
            <span className="wn-profile-stat__value">{stats.winRate}%</span>
            <span className="wn-profile-stat__label">Win rate</span>
          </div>
          <div className="wn-profile-stat">
            <span className="wn-profile-stat__value">{stats.projectsCompleted}</span>
            <span className="wn-profile-stat__label">Projects completed</span>
          </div>
          <div className="wn-profile-stat">
            <span className="wn-profile-stat__value">{profile.skills?.length ?? 0}</span>
            <span className="wn-profile-stat__label">Skills listed</span>
          </div>
        </div>
      </section>

      <div className="wn-profile-grid">
        <div className="wn-profile-main">
          <section className="wn-profile-card">
            <div className="wn-profile-card-header">
              <div className="wn-profile-card-title">
                <span className="wn-profile-card-icon" aria-hidden>
                  <Briefcase size={18} />
                </span>
                <div>
                  <h3>About</h3>
                  <p>Background and expertise</p>
                </div>
              </div>
            </div>
            {profile.bio?.trim() ? (
              <p className="wn-profile-bio">{profile.bio}</p>
            ) : (
              <p className="wn-profile-bio wn-public-profile__muted">
                This freelancer has not added a bio yet.
              </p>
            )}
          </section>

          <section className="wn-profile-card">
            <div className="wn-profile-card-header">
              <div className="wn-profile-card-title">
                <span className="wn-profile-card-icon" aria-hidden>
                  <Trophy size={18} />
                </span>
                <div>
                  <h3>Track record</h3>
                  <p>Platform activity on WorkNest</p>
                </div>
              </div>
            </div>

            <div className="wn-public-profile__track-grid">
              <div className="wn-public-profile__track-item">
                <strong>{stats.proposalsTotal}</strong>
                <span>Proposals sent</span>
              </div>
              <div className="wn-public-profile__track-item">
                <strong>{stats.proposalsAccepted}</strong>
                <span>Proposals won</span>
              </div>
              <div className="wn-public-profile__track-item">
                <strong>{stats.proposalsPending}</strong>
                <span>Pending review</span>
              </div>
              <div className="wn-public-profile__track-item">
                <strong>{stats.projectsActive}</strong>
                <span>Active projects</span>
              </div>
            </div>

            {recentProjects.length > 0 ? (
              <ul className="wn-public-profile__projects">
                {recentProjects.map((project) => (
                  <li key={project.id}>
                    <div>
                      <strong>{project.title}</strong>
                      {project.category && <span>{project.category}</span>}
                    </div>
                    {project.completedAt && (
                      <time dateTime={project.completedAt}>
                        Completed {formatDate(project.completedAt)}
                      </time>
                    )}
                  </li>
                ))}
              </ul>
            ) : (
              <p className="wn-public-profile__muted">No completed projects to show yet.</p>
            )}
          </section>

          {(profile.skills?.length ?? 0) > 0 && (
            <section className="wn-profile-card">
              <div className="wn-profile-card-header">
                <div className="wn-profile-card-title">
                  <div>
                    <h3>Skills</h3>
                    <p>{profile.skills!.length} skills on profile</p>
                  </div>
                </div>
              </div>
              <div className="wn-profile-skills">
                {profile.skills!.map((skill) => (
                  <span key={skill} className="wn-profile-skill">
                    {skill}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        <aside className="wn-profile-sidebar">
          <div className="wn-profile-sidebar-stack">
            <section className="wn-profile-card wn-profile-card--portfolio">
              <div className="wn-profile-card-header">
                <div className="wn-profile-card-title">
                  <span className="wn-profile-card-icon wn-profile-card-icon--accent" aria-hidden>
                    <Globe size={18} />
                  </span>
                  <div>
                    <h3>Portfolio</h3>
                    <p>External work showcase</p>
                  </div>
                </div>
              </div>

              {profile.portfolioLink ? (
                <a
                  href={profile.portfolioLink}
                  target="_blank"
                  rel="noreferrer"
                  className="wn-profile-portfolio-link"
                >
                  <span className="wn-profile-portfolio-link__host">
                    {formatPortfolioHost(profile.portfolioLink)}
                  </span>
                  <span className="wn-profile-portfolio-link__action">
                    Visit site
                    <ExternalLink size={14} />
                  </span>
                </a>
              ) : (
                <p className="wn-public-profile__muted">No portfolio link provided.</p>
              )}
            </section>
          </div>
        </aside>
      </div>
    </div>
  );
}
