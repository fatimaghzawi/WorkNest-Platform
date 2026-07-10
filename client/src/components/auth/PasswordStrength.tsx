interface PasswordStrengthProps {
  password: string;
}

const getStrength = (password: string) => {
  if (!password) return { score: 0, label: '' };
  let score = 0;
  if (password.length >= 8) score += 1;
  if (password.length >= 12) score += 1;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score += 1;
  if (/\d/.test(password)) score += 1;

  const labels = ['', 'Weak', 'Fair', 'Good', 'Strong'];
  return { score, label: labels[score] };
};

export default function PasswordStrength({ password }: PasswordStrengthProps) {
  const { score, label } = getStrength(password);
  if (!password) return null;

  return (
    <div className="wn-auth-strength" aria-live="polite">
      <div className="wn-auth-strength__bars">
        {[1, 2, 3, 4].map((level) => (
          <span
            key={level}
            className={`wn-auth-strength__bar ${score >= level ? `wn-auth-strength__bar--${score}` : ''}`}
          />
        ))}
      </div>
      <span className="wn-auth-strength__label">{label}</span>
    </div>
  );
}
