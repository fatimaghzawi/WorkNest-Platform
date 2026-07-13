import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authApi } from '../../api/auth.api';
import { getDashboardPath } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { setAccessToken } from '../../utils/authToken';
import { useAuth } from '../../hooks/useAuth';

export default function OAuthCallback() {
  const navigate = useNavigate();
  const toast = useToast();
  const { refreshUser } = useAuth();

  useEffect(() => {
    let active = true;

    const finishSignIn = async () => {
      try {
        const { data } = await authApi.refresh();
        if (!active) return;

        if (data.accessToken) {
          setAccessToken(data.accessToken);
        }

        await refreshUser();
        toast.success(`Welcome back${data.user?.firstName ? `, ${data.user.firstName}` : ''}!`);
        navigate(getDashboardPath(data.user.role), { replace: true });
      } catch {
        if (!active) return;
        toast.error('Social sign-in failed. Please try again.');
        navigate('/login', { replace: true });
      }
    };

    finishSignIn();

    return () => {
      active = false;
    };
  }, [navigate, refreshUser, toast]);

  return (
    <div className="wn-auth-page" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
      <p>Completing sign-in...</p>
    </div>
  );
}
