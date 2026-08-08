import { Mail } from 'lucide-react';
import type { ReactNode } from 'react';

type Props = {
  eyebrow: string;
  firstName: string;
  lastName: string;
  email?: string;
  badges?: ReactNode;
};

export default function ProfileNameBlock({
  eyebrow,
  firstName,
  lastName,
  email,
  badges,
}: Props) {
  return (
    <div className="wn-profile-identity">
      <p className="wn-profile-user__eyebrow">{eyebrow}</p>
      <h1 className="wn-profile-user__name">
        <span className="wn-profile-user__name-first">{firstName}</span>
        <span className="wn-profile-user__name-last">{lastName}</span>
      </h1>
      {email && (
        <p className="wn-profile-user__email">
          <Mail size={15} aria-hidden />
          <span>{email}</span>
        </p>
      )}
      {badges ? <div className="wn-profile-user__badges">{badges}</div> : null}
    </div>
  );
}
