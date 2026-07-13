import { useEffect, useRef, useState } from 'react';
import { GoogleLogin, type CredentialResponse } from '@react-oauth/google';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types/auth';

type GoogleSignInButtonProps = {
  role?: 'client' | 'freelancer';
  onSuccess?: (user: User) => void;
  disabled?: boolean;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

export default function GoogleSignInButton({
  role,
  onSuccess,
  disabled = false,
}: GoogleSignInButtonProps) {
  const { googleLogin } = useAuth();
  const toast = useToast();
  const containerRef = useRef<HTMLDivElement>(null);
  const [buttonWidth, setButtonWidth] = useState(320);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const updateWidth = () => {
      setButtonWidth(Math.max(Math.floor(container.getBoundingClientRect().width), 200));
    };

    updateWidth();
    const observer = new ResizeObserver(updateWidth);
    observer.observe(container);
    return () => observer.disconnect();
  }, []);

  if (!googleClientId) {
    return null;
  }

  const handleSuccess = async (response: CredentialResponse) => {
    if (!response.credential) {
      toast.error('Google sign-in did not return a credential.');
      return;
    }

    try {
      const user = await googleLogin({ credential: response.credential, role });
      onSuccess?.(user);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Google sign-in failed.'));
    }
  };

  return (
    <div className="wn-auth-google" ref={containerRef}>
      <GoogleLogin
        onSuccess={handleSuccess}
        onError={() => toast.error('Google sign-in was cancelled or failed.')}
        theme="outline"
        size="large"
        width={buttonWidth}
        text="continue_with"
        shape="rectangular"
        useOneTap={false}
      />
    </div>
  );
}

export { googleClientId };
