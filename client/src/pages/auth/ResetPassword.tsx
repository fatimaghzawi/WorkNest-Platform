import { FormEvent, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthSuccessPanel from '../../components/auth/AuthSuccessPanel';
import PasswordStrength from '../../components/auth/PasswordStrength';
import { IconEye, IconEyeOff, IconLock } from '../../components/auth/AuthIcons';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';

export default function ResetPassword() {
  const { token = '' } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');
    setSuccess('');

    if (!token) {
      setError('Invalid reset link. Please request a new one.');
      return;
    }

    if (password !== confirmPassword) {
      setFieldError('Passwords do not match.');
      return;
    }

    if (password.length < 8) {
      setFieldError('Password must be at least 8 characters.');
      return;
    }

    setLoading(true);

    try {
      const { data } = await authApi.resetPassword(token, password);
      setSuccess(data.message);
      setTimeout(() => navigate('/login', { replace: true }), 2500);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not reset password. The link may have expired.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="wn-auth-card__header">
        <span className="wn-auth-card__eyebrow">Security</span>
        <h1 className="wn-auth-card__title">New password</h1>
        <p className="wn-auth-card__subtitle">
          Choose a strong password to protect your account.
        </p>
      </header>

      {error && (
        <div className="wn-auth-alert wn-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      {success ? (
        <AuthSuccessPanel
          title="Password updated"
          actionTo="/login"
          actionLabel="Sign in now"
        >
          {success} You can sign in with your new password.
        </AuthSuccessPanel>
      ) : (
        <form className="wn-auth-form" onSubmit={handleSubmit} noValidate>
          <div>
            <Input
              label="New password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              error={fieldError}
              leftIcon={<IconLock />}
              rightIcon={showPassword ? <IconEyeOff /> : <IconEye />}
              onRightIconClick={() => setShowPassword((v) => !v)}
            />
            <PasswordStrength password={password} />
          </div>

          <Input
            label="Confirm password"
            type={showPassword ? 'text' : 'password'}
            name="confirmPassword"
            required
            minLength={8}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            placeholder="Repeat your password"
            autoComplete="new-password"
            leftIcon={<IconLock />}
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            loadingText="Updating..."
          >
            Update password
          </Button>
        </form>
      )}

      <p className="wn-auth-footer-text">
        <Link to="/login">Back to sign in</Link>
        {' · '}
        <Link to="/forgot-password">Request new link</Link>
      </p>
    </>
  );
}
