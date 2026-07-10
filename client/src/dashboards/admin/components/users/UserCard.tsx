import { MapPin } from 'lucide-react';
import type { AdminUser } from '../../../../types/user';
import UserAvatar from '../../../../components/users/UserAvatar';
import '../../../../css/UsersAdmin.css';

const ROLE_LABELS: Record<AdminUser['role'], string> = {
  client: 'Client',
  freelancer: 'Freelancer',
  admin: 'Admin',
};

const ROLE_MARKS: Record<AdminUser['role'], string> = {
  client: 'CL',
  freelancer: 'FL',
  admin: 'AD',
};

export default function UserCard({
  user,
  selected,
  onSelect,
}: {
  user: AdminUser;
  selected: boolean;
  onSelect: (user: AdminUser) => void;
}) {
  const fullName = `${user.firstName} ${user.lastName}`;

  return (
    <button
      type="button"
      className={[
        'wn-member-card',
        selected ? 'wn-member-card--selected' : '',
        !user.isActive ? 'wn-member-card--inactive' : '',
      ]
        .filter(Boolean)
        .join(' ')}
      onClick={() => onSelect(user)}
      aria-pressed={selected}
      aria-label={`View ${fullName}`}
    >
      <div className="wn-member-card__head">
        <UserAvatar
          firstName={user.firstName}
          lastName={user.lastName}
          role={user.role}
          image={user.profileImage}
          size="md"
        />
        <div className="wn-member-card__identity">
          <p className="wn-member-card__name">{fullName}</p>
          <p className="wn-member-card__id">ID #{user._id.slice(-8).toUpperCase()}</p>
        </div>
      </div>

      <div className="wn-member-card__footer">
        <span className="wn-member-card__location">
          <MapPin size={13} />
          {ROLE_LABELS[user.role]}
        </span>
        <span className={`wn-member-card__mark wn-member-card__mark--${user.role}`}>
          {ROLE_MARKS[user.role]}
        </span>
      </div>
    </button>
  );
}
