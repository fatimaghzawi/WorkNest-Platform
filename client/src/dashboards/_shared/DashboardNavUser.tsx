import { Link } from 'react-router-dom';
import UserAvatar from '../../components/users/UserAvatar';
import type { User } from '../../types/auth';

const PROFILE_PATHS: Record<User['role'], string> = {
  client: '/client/profile',
  freelancer: '/freelancer/profile',
  admin: '/admin/profile',
};

type Props = {
  user: User;
  profilePath?: string;
  className?: string;
  linkClassName?: string;
  onNavigate?: () => void;
};

export default function DashboardNavUser({
  user,
  profilePath,
  className = '',
  linkClassName = 'wn-dash-nav__user',
  onNavigate,
}: Props) {
  const name = `${user.firstName} ${user.lastName}`;
  const to = profilePath ?? PROFILE_PATHS[user.role];

  return (
    <Link
      to={to}
      className={`${linkClassName} ${className}`.trim()}
      title="View profile"
      aria-label={`${name} — view profile`}
      onClick={onNavigate}
    >
      <UserAvatar
        firstName={user.firstName}
        lastName={user.lastName}
        role={user.role}
        image={user.profileImage}
        size="sm"
      />
      <span className="wn-dash-nav__user-name">{name}</span>
    </Link>
  );
}
