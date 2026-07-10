import { FormEvent, useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthSuccessPanel from '../../components/auth/AuthSuccessPanel';
import PasswordStrength from '../../components/auth/PasswordStrength';
import {
  IconBriefcase,
  IconEye,
  IconEyeOff,
  IconLock,
  IconMail,
  IconPen,
  IconUser,
} from '../../components/auth/AuthIcons';
import { useAuth } from '../../hooks/useAuth';
import { getApiErrorMessage } from '../../utils/apiError';

type Role = 'client' | 'freelancer';

export default function Register() {
  const { register, isAuthenticated } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role>('client');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const message = await register({
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        password,
        role,
      });
      setSuccess(message);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Registration failed. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="wn-auth-card__header">
        <span className="wn-auth-card__eyebrow">Register</span>
        <h1 className="wn-auth-card__title">Create your account</h1>
        <p className="wn-auth-card__subtitle">
          Join WorkNest as a client or freelancer.
        </p>
      </header>

      {error && (
        <div className="wn-auth-alert wn-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      {success ? (
        <AuthSuccessPanel title="Check your inbox">
          {success} Open the verification link we sent, then{' '}
          <Link to="/login">sign in</Link> to get started.
        </AuthSuccessPanel>
      ) : (
        <form className="wn-auth-form" onSubmit={handleSubmit} noValidate>
          <div className="wn-auth-form__row">
            <Input
              label="First name"
              name="firstName"
              required
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
              placeholder="John"
              autoComplete="given-name"
              leftIcon={<IconUser />}
            />
            <Input
              label="Last name"
              name="lastName"
              required
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
              placeholder="Doe"
              autoComplete="family-name"
            />
          </div>

          <Input
            label="Email address"
            type="email"
            name="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            leftIcon={<IconMail />}
          />

          <div>
            <Input
              label="Password"
              type={showPassword ? 'text' : 'password'}
              name="password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              autoComplete="new-password"
              leftIcon={<IconLock />}
              rightIcon={showPassword ? <IconEyeOff /> : <IconEye />}
              onRightIconClick={() => setShowPassword((v) => !v)}
            />
            <PasswordStrength password={password} />
          </div>

          <div>
            <span className="wn-auth-role-picker__label">I want to</span>
            <div className="wn-auth-role-picker" role="radiogroup" aria-label="Account role">
              <button
                type="button"
                className={`wn-auth-role-option ${role === 'client' ? 'wn-auth-role-option--active' : ''}`}
                onClick={() => setRole('client')}
                aria-pressed={role === 'client'}
              >
                <span className="wn-auth-role-option__icon" aria-hidden="true">
                  <IconBriefcase />
                </span>
                <span className="wn-auth-role-option__title">Hire talent</span>
                <span className="wn-auth-role-option__desc">Post jobs and manage projects</span>
              </button>
              <button
                type="button"
                className={`wn-auth-role-option ${role === 'freelancer' ? 'wn-auth-role-option--active' : ''}`}
                onClick={() => setRole('freelancer')}
                aria-pressed={role === 'freelancer'}
              >
                <span className="wn-auth-role-option__icon" aria-hidden="true">
                  <IconPen />
                </span>
                <span className="wn-auth-role-option__title">Find work</span>
                <span className="wn-auth-role-option__desc">Browse jobs and send proposals</span>
              </button>
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            loadingText="Creating account..."
          >
            Create account
          </Button>
        </form>
      )}

      <p className="wn-auth-footer-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </>
  );
}
