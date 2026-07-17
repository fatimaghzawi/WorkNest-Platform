import { FormEvent, useState } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthSuccessPanel from '../../components/auth/AuthSuccessPanel';
import SocialAuthButtons, { hasSocialAuth } from '../../components/auth/SocialAuthButtons';
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
import { getDashboardPath, useAuth } from '../../hooks/useAuth';
import { useToast } from '../../hooks/useToast';
import { getApiErrorMessage } from '../../utils/apiError';

type Role = 'client' | 'freelancer';

const ROLE_COPY: Record<Role, { title: string; desc: string }> = {
  client: {
    title: 'Hire talent',
    desc: 'Post jobs and manage projects',
  },
  freelancer: {
    title: 'Find work',
    desc: 'Browse jobs and send proposals',
  },
};

export default function Register() {
  const navigate = useNavigate();
  const { register, isAuthenticated } = useAuth();
  const toast = useToast();
  const [step, setStep] = useState<'role' | 'details'>('role');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<Role | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) {
    return <Navigate to="/" replace />;
  }

  const selectRole = (next: Role) => {
    setRole(next);
    setError('');
    setStep('details');
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    if (!role) {
      setError('Choose whether you want to hire talent or find work.');
      setStep('role');
      return;
    }

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
    <div className="wn-auth-register">
      <header className="wn-auth-card__header">
        <span className="wn-auth-card__eyebrow">Register</span>
        <h1 className="wn-auth-card__title">
          {step === 'role' ? 'How will you use WorkNest?' : 'Create your account'}
        </h1>
        <p className="wn-auth-card__subtitle">
          {step === 'role'
            ? 'Pick one path. You can finish signup with Google or email next.'
            : 'Continue with Google or fill in a few details.'}
        </p>
      </header>

      {error && (
        <div className="wn-auth-alert wn-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      {success ? (
        <AuthSuccessPanel
          title="Check your inbox"
          actionTo="/login"
          actionLabel="Go to sign in"
        >
          {success} Open the verification link we emailed you, then sign in to get started.
        </AuthSuccessPanel>
      ) : step === 'role' ? (
        <div className="wn-auth-role-step">
          <div className="wn-auth-role-picker" role="radiogroup" aria-label="Account role">
            <button
              type="button"
              className="wn-auth-role-option"
              onClick={() => selectRole('client')}
            >
              <span className="wn-auth-role-option__icon" aria-hidden="true">
                <IconBriefcase />
              </span>
              <span className="wn-auth-role-option__title">{ROLE_COPY.client.title}</span>
              <span className="wn-auth-role-option__desc">{ROLE_COPY.client.desc}</span>
            </button>
            <button
              type="button"
              className="wn-auth-role-option"
              onClick={() => selectRole('freelancer')}
            >
              <span className="wn-auth-role-option__icon" aria-hidden="true">
                <IconPen />
              </span>
              <span className="wn-auth-role-option__title">{ROLE_COPY.freelancer.title}</span>
              <span className="wn-auth-role-option__desc">{ROLE_COPY.freelancer.desc}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="wn-auth-details-step">
          {role && (
            <div className="wn-auth-role-chip">
              <span className="wn-auth-role-chip__icon" aria-hidden="true">
                {role === 'client' ? <IconBriefcase /> : <IconPen />}
              </span>
              <div className="wn-auth-role-chip__copy">
                <strong>{ROLE_COPY[role].title}</strong>
                <span>{ROLE_COPY[role].desc}</span>
              </div>
              <button
                type="button"
                className="wn-auth-role-chip__change"
                onClick={() => {
                  setStep('role');
                  setError('');
                }}
              >
                Change
              </button>
            </div>
          )}

          {hasSocialAuth && role && (
            <SocialAuthButtons
              role={role}
              disabled={loading}
              dividerLabel="Continue with"
              onSuccess={(user) => {
                toast.success(`Welcome to WorkNest, ${user.firstName}!`);
                navigate(getDashboardPath(user.role), { replace: true });
              }}
            />
          )}

          <form className="wn-auth-form wn-auth-form--compact" onSubmit={handleSubmit} noValidate>
            {hasSocialAuth && (
              <div className="wn-auth-divider">
                <span>or use email</span>
              </div>
            )}

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
              label="Email"
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
        </div>
      )}

      <p className="wn-auth-footer-text">
        Already have an account? <Link to="/login">Sign in</Link>
      </p>
    </div>
  );
}
