import { FormEvent, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import AuthSuccessPanel from '../../components/auth/AuthSuccessPanel';
import { IconMail } from '../../components/auth/AuthIcons';
import { authApi } from '../../api/auth.api';
import { getApiErrorMessage } from '../../utils/apiError';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      const { data } = await authApi.forgotPassword(email.trim());
      setSuccess(data.message);
      setEmail('');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Could not send reset email. Please try again.'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <header className="wn-auth-card__header">
        <span className="wn-auth-card__eyebrow">Password</span>
        <h1 className="wn-auth-card__title">Forgot password?</h1>
        <p className="wn-auth-card__subtitle">
          Enter your email and we will send a secure reset link.
        </p>
      </header>

      {error && (
        <div className="wn-auth-alert wn-auth-alert--error" role="alert">
          {error}
        </div>
      )}

      {success ? (
        <AuthSuccessPanel
          title="Email on the way"
          actionTo="/login"
          actionLabel="Back to sign in"
        >
          {success} Check your inbox, junk folder, and Outlook/Hotmail spam tab. The link
          expires in <strong>15 minutes</strong>.
        </AuthSuccessPanel>
      ) : (
        <form className="wn-auth-form" onSubmit={handleSubmit} noValidate>
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
            helperText="We will email a reset link if an account exists"
          />

          <Button
            type="submit"
            variant="primary"
            fullWidth
            size="lg"
            loading={loading}
            loadingText="Sending..."
          >
            Send reset link
          </Button>
        </form>
      )}

      <p className="wn-auth-footer-text">
        Remember your password? <Link to="/login">Back to sign in</Link>
      </p>
    </>
  );
}
