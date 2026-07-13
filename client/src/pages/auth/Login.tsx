import { FormEvent, useState, useEffect } from 'react';
import { Link, Navigate, useLocation, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { IconEye, IconEyeOff, IconLock, IconMail } from '../../components/auth/AuthIcons';
import SocialAuthButtons, { hasSocialAuth } from '../../components/auth/SocialAuthButtons';
import { getDashboardPath, useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated, user, isLoading: authLoading } = useAuth();
  const toast = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const oauthError = params.get('oauthError');
    if (oauthError) {
      setError(decodeURIComponent(oauthError));
      window.history.replaceState({}, '', '/login');
    }
  }, []);

  if (!authLoading && isAuthenticated && user) {
    return <Navigate to={getDashboardPath(user.role)} replace />;
  }

  const completeSignIn = (loggedInUser: { firstName: string; role: Parameters<typeof getDashboardPath>[0] }) => {
    toast.success(`Welcome back, ${loggedInUser.firstName}!`);
    const redirectTo =
      (location.state as { from?: string } | null)?.from ||
      getDashboardPath(loggedInUser.role);
    navigate(redirectTo, { replace: true });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const loggedInUser = await login({ email: email.trim(), password });
      completeSignIn(loggedInUser);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Login failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="wn-auth-card__header">
        <span className="wn-auth-card__eyebrow">Sign in</span>
        <h1 className="wn-auth-card__title">Welcome back</h1>
        <p className="wn-auth-card__subtitle">
          Enter your credentials to access your workspace.
        </p>
      </header>

      {error && (
        <div className="wn-auth-alert wn-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      <form className="wn-auth-form" onSubmit={handleSubmit} noValidate>
        <Input
          label="Email address"
          type="email"
          name="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          leftIcon={<IconMail />}
        />

        <div>
          <div className="wn-auth-password-row">
            <span className="wn-field__label">Password</span>
            <Link to="/forgot-password" className="wn-auth-forgot">
              Forgot password?
            </Link>
          </div>
          <Input
            type={showPassword ? 'text' : 'password'}
            name="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Your password"
            leftIcon={<IconLock />}
            rightIcon={showPassword ? <IconEyeOff /> : <IconEye />}
            onRightIconClick={() => setShowPassword((v) => !v)}
          />
        </div>

        <Button type="submit" variant="primary" fullWidth size="lg" loading={loading} loadingText="Signing in...">
          Sign in
        </Button>
      </form>

      {hasSocialAuth && (
        <SocialAuthButtons
          onSuccess={completeSignIn}
          disabled={loading}
          dividerLabel="or continue with"
        />
      )}

      <p className="wn-auth-footer-text">
        New here? <Link to="/signup">Create an account</Link>
      </p>
    </>
  );
}
