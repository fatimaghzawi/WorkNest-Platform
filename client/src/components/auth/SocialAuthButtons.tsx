import GoogleSignInButton, { googleClientId } from './GoogleSignInButton';
import GitHubSignInButton, { githubClientId } from './GitHubSignInButton';
import type { User } from '../../types/auth';

type SocialAuthButtonsProps = {
  role?: 'client' | 'freelancer';
  onSuccess?: (user: User) => void;
  disabled?: boolean;
  dividerLabel: string;
};

export const hasSocialAuth = Boolean(googleClientId || githubClientId);

export default function SocialAuthButtons({
  role,
  onSuccess,
  disabled = false,
  dividerLabel,
}: SocialAuthButtonsProps) {
  if (!hasSocialAuth) {
    return null;
  }

  return (
    <>
      <div className="wn-auth-divider">
        <span>{dividerLabel}</span>
      </div>
      <div className="wn-auth-social">
        {googleClientId ? (
          <GoogleSignInButton role={role} onSuccess={onSuccess} disabled={disabled} />
        ) : null}
        {githubClientId ? <GitHubSignInButton role={role} disabled={disabled} /> : null}
      </div>
    </>
  );
}
