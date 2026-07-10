import {
  BadgeCheck,
  ExternalLink,
  Globe,
  Mail,
  Phone,
  Pencil,
  Shield,
} from 'lucide-react';
import type { UserProfile } from '../../../types/profile';
import { PROFILE_COPY, type ModernProfileConfig } from './profileConfig';

type Props = {
  user: UserProfile;
  config: ModernProfileConfig;
  onEdit: () => void;
};

function formatPortfolioHost(url: string) {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}

export default function ProfileMeta({ user, config, onEdit }: Props) {
  const copy = PROFILE_COPY[config.role];
  const showPortfolio = config.showPortfolio ?? config.role === 'freelancer';

  return (
    <div className="wn-profile-sidebar-stack">
      {showPortfolio && (
        <section className="wn-profile-card wn-profile-card--portfolio">
          <div className="wn-profile-card-header">
            <div className="wn-profile-card-title">
              <span className="wn-profile-card-icon wn-profile-card-icon--accent" aria-hidden>
                <Globe size={18} />
              </span>
              <div>
                <h3>Portfolio</h3>
                <p>Your public work showcase</p>
              </div>
            </div>
          </div>

          {user.portfolioLink ? (
            <a
              href={user.portfolioLink}
              target="_blank"
              rel="noreferrer"
              className="wn-profile-portfolio-link"
            >
              <span className="wn-profile-portfolio-link__host">
                {formatPortfolioHost(user.portfolioLink)}
              </span>
              <span className="wn-profile-portfolio-link__action">
                Visit site
                <ExternalLink size={14} />
              </span>
            </a>
          ) : (
            <div className="wn-profile-empty wn-profile-empty--compact">
              <p>Add a portfolio link so others can explore your work.</p>
              <button type="button" className="wn-profile-empty__cta" onClick={onEdit}>
                Add portfolio link
              </button>
            </div>
          )}
        </section>
      )}

      <section className="wn-profile-card">
        <div className="wn-profile-card-header">
          <div className="wn-profile-card-title">
            <span className="wn-profile-card-icon" aria-hidden>
              <Mail size={18} />
            </span>
            <div>
              <h3>Contact</h3>
              <p>{copy.contactSubtitle}</p>
            </div>
          </div>
          <button type="button" className="wn-profile-card-action" onClick={onEdit}>
            <Pencil size={14} />
            Edit
          </button>
        </div>

        <ul className="wn-profile-contact-list">
          <li>
            <span className="wn-profile-contact-list__icon" aria-hidden>
              <Mail size={16} />
            </span>
            <div>
              <span className="wn-profile-contact-list__label">Email</span>
              <strong>{user.email}</strong>
            </div>
          </li>
          <li>
            <span className="wn-profile-contact-list__icon" aria-hidden>
              <Phone size={16} />
            </span>
            <div>
              <span className="wn-profile-contact-list__label">Phone</span>
              <strong>{user.phone?.trim() || 'Not provided'}</strong>
            </div>
          </li>
        </ul>
      </section>

      <section className="wn-profile-card">
        <div className="wn-profile-card-header">
          <div className="wn-profile-card-title">
            <span className="wn-profile-card-icon" aria-hidden>
              <Shield size={18} />
            </span>
            <div>
              <h3>Account</h3>
              <p>Trust and visibility signals</p>
            </div>
          </div>
        </div>

        <ul className="wn-profile-status-list">
          <li>
            <span>Email verification</span>
            <strong className={user.emailVerified ? 'wn-profile-success' : 'wn-profile-warning'}>
              {user.emailVerified ? (
                <>
                  <BadgeCheck size={14} />
                  Verified
                </>
              ) : (
                'Pending'
              )}
            </strong>
          </li>
          <li>
            <span>Profile status</span>
            <strong className={user.isActive ? 'wn-profile-success' : 'wn-profile-danger'}>
              {user.isActive ? 'Active' : 'Inactive'}
            </strong>
          </li>
        </ul>
      </section>
    </div>
  );
}
