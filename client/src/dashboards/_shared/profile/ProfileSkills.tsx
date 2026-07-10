import { Pencil, Wrench } from 'lucide-react';
import type { UserProfile } from '../../../types/profile';

type Props = {
  user: UserProfile;
  onEdit: () => void;
};

export default function ProfileSkills({ user, onEdit }: Props) {
  const skills = user.skills ?? [];

  return (
    <section className="wn-profile-card">
      <div className="wn-profile-card-header">
        <div className="wn-profile-card-title">
          <span className="wn-profile-card-icon" aria-hidden>
            <Wrench size={18} />
          </span>
          <div>
            <h3>Skills</h3>
            <p>
              {skills.length} skill{skills.length === 1 ? '' : 's'} on your profile
            </p>
          </div>
        </div>
        <button type="button" className="wn-profile-card-action" onClick={onEdit}>
          <Pencil size={14} />
          Edit
        </button>
      </div>

      {skills.length > 0 ? (
        <div className="wn-profile-skills">
          {skills.map((skill) => (
            <span key={skill} className="wn-profile-skill">
              {skill}
            </span>
          ))}
        </div>
      ) : (
        <div className="wn-profile-empty">
          <p>Add skills to improve job matching and help clients find you faster.</p>
          <button type="button" className="wn-profile-empty__cta" onClick={onEdit}>
            Add skills
          </button>
        </div>
      )}
    </section>
  );
}
