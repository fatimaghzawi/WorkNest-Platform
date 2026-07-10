import type { UserRole } from '../../types/auth';
import { resolveMediaUrl } from '../../utils/mediaUrl';
import '../../css/UsersAdmin.css';

const ROLE_CLASS: Record<UserRole, string> = {
  admin: 'admin',
  client: 'client',
  freelancer: 'freelancer',
};

export function getUserInitials(firstName: string, lastName: string) {
  return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
}

export default function UserAvatar({
  firstName,
  lastName,
  role,
  image,
  size = 'md',
}: {
  firstName: string;
  lastName: string;
  role: UserRole;
  image?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
}) {
  const initials = getUserInitials(firstName, lastName);
  const roleClass = ROLE_CLASS[role];

  if (image) {
    return (
      <img
        src={resolveMediaUrl(image)}
        alt={`${firstName} ${lastName}`}
        className={`wn-user-avatar wn-user-avatar--${size} wn-user-avatar--image`}
      />
    );
  }

  return (
    <div
      className={`wn-user-avatar wn-user-avatar--${size} wn-user-avatar--${roleClass}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
