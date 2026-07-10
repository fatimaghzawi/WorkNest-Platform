import { FileText, Pencil } from 'lucide-react';
import type { UserProfile } from '../../../types/profile';
import { PROFILE_COPY, type ModernProfileRole } from './profileConfig';

type Props = {
  user: UserProfile;
  role: ModernProfileRole;
  onEdit: () => void;
};

export default function ProfileAbout({ user, role, onEdit }: Props) {
  const copy = PROFILE_COPY[role];
  const hasBio = Boolean(user.bio?.trim());

  return (
    <section className="wn-profile-card">
      <div className="wn-profile-card-header">
        <div className="wn-profile-card-title">
          <span className="wn-profile-card-icon" aria-hidden>
            <FileText size={18} />
          </span>
          <div>
            <h3>About</h3>
            <p>{copy.aboutSubtitle}</p>
          </div>
        </div>
        <button type="button" className="wn-profile-card-action" onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {hasBio ? (
        <p className="wn-profile-bio">{user.bio}</p>
      ) : (
        <div className="wn-profile-empty">
          <p>{copy.aboutEmpty}</p>
          <button type="button" className="wn-profile-empty__cta" onClick={onEdit}>
            Write your bio
          </button>
        </div>
      )}
    </section>
  );
}
