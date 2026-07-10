import { useEffect, useRef } from 'react';
import { Outlet, useLocation, Link } from 'react-router-dom';
import Navbar from '../components/common/Navbar';
import logoImage from '../images/logo.png';
import { IconFeature, type FeatureIconType } from '../components/auth/AuthIcons';
import '../css/Auth.css';

type AuthPanelVariant = 'login' | 'register' | 'forgot' | 'reset';

type PanelConfig = {
  eyebrow: string;
  title: string;
  accent: string;
  text: string;
  features: { icon: FeatureIconType; title: string; desc: string }[];
  metric: { value: string; label: string };
};

const PANEL_CONFIG: Record<AuthPanelVariant, PanelConfig> = {
  login: {
    eyebrow: 'Welcome back',
    title: 'Your projects',
    accent: 'await',
    text: 'Check deadlines, review deliverables, and reply to messages — everything you need to keep work moving.',
    features: [
      { icon: 'match', title: 'Open projects', desc: 'Jump straight to active jobs and milestones' },
      { icon: 'bolt', title: 'Latest updates', desc: 'New proposals, files, and messages in one feed' },
      { icon: 'verified', title: 'Clear next steps', desc: 'See what is due today and what is already done' },
    ],
    metric: { value: '500+', label: 'Projects managed on WorkNest' },
  },
  register: {
    eyebrow: 'Get started',
    title: 'Launch your',
    accent: 'next project',
    text: 'Post a job, send a proposal, or team up with freelancers — then track progress from one dashboard.',
    features: [
      { icon: 'match', title: 'Find the right fit', desc: 'Match skills to the work you need done' },
      { icon: 'mail', title: 'Quick setup', desc: 'Verify your email and start in minutes' },
      { icon: 'free', title: 'Free to begin', desc: 'Create an account with no upfront cost' },
    ],
    metric: { value: '2 min', label: 'Average time to first post' },
  },
  forgot: {
    eyebrow: 'Account help',
    title: 'Get back to',
    accent: 'your work',
    text: 'We will email you a secure link so you can reset your password and return to your projects.',
    features: [
      { icon: 'clock', title: 'Link expires in 15 min', desc: 'For your security, reset links are short-lived' },
      { icon: 'privacy', title: 'Your privacy matters', desc: 'We never reveal whether an email is registered' },
      { icon: 'mail', title: 'Check your inbox', desc: 'Look in spam or promotions if it is missing' },
    ],
    metric: { value: '< 2 min', label: 'Typical email delivery' },
  },
  reset: {
    eyebrow: 'Almost done',
    title: 'Secure your',
    accent: 'account',
    text: 'Choose a new password to protect your projects and sign back in on all devices.',
    features: [
      { icon: 'key', title: 'Use 8+ characters', desc: 'Mix letters, numbers, and symbols' },
      { icon: 'refresh', title: 'Fresh sign-in', desc: 'Other sessions will be signed out' },
      { icon: 'shield', title: 'Stay protected', desc: 'Your work and messages stay private' },
    ],
    metric: { value: '1 step', label: 'Then you are back in' },
  },
};

const getVariant = (pathname: string): AuthPanelVariant => {
  if (pathname.includes('signup') || pathname.includes('register')) return 'register';
  if (pathname.includes('forgot-password')) return 'forgot';
  if (pathname.includes('reset-password')) return 'reset';
  return 'login';
};

const isAuthSwap = (from: AuthPanelVariant, to: AuthPanelVariant) =>
  (from === 'login' && to === 'register') || (from === 'register' && to === 'login');

export default function AuthLayout() {
  const { pathname } = useLocation();
  const variant = getVariant(pathname);
  const config = PANEL_CONFIG[variant];
  const isReversed = variant === 'register';
  const prevVariantRef = useRef<AuthPanelVariant>(variant);
  const swapDirection =
    isAuthSwap(prevVariantRef.current, variant) && variant === 'register'
      ? 'to-register'
      : isAuthSwap(prevVariantRef.current, variant) && variant === 'login'
        ? 'to-login'
        : null;

  useEffect(() => {
    prevVariantRef.current = variant;
  }, [variant]);

  return (
    <div className="wn-auth-page">
      <Navbar />

      <div
        className={`wn-auth-page__main${isReversed ? ' wn-auth-page__main--reversed' : ''}`}
        data-swap={swapDirection ?? undefined}
      >
        <aside className="wn-auth-panel" aria-hidden={false}>
          <div className="wn-auth-panel__mesh" aria-hidden="true">
            <span className="wn-auth-panel__ring wn-auth-panel__ring--1" />
            <span className="wn-auth-panel__ring wn-auth-panel__ring--2" />
            <span className="wn-auth-panel__ring wn-auth-panel__ring--3" />
            <span className="wn-auth-panel__gradient" />
          </div>

          <div className="wn-auth-panel__glass wn-auth-panel__content" key={`panel-${variant}`}>
            <Link to="/" className="wn-auth-panel__logo-link">
              <img src={logoImage} alt="WorkNest" className="wn-auth-panel__logo" />
            </Link>

            <span className="wn-auth-panel__eyebrow">{config.eyebrow}</span>
            <h1 className="wn-auth-panel__title">
              {config.title}{' '}
              <span className="wn-auth-panel__accent">{config.accent}</span>
            </h1>
            <p className="wn-auth-panel__text">{config.text}</p>

            <ul className="wn-auth-panel__features">
              {config.features.map((f, index) => (
                <li
                  key={f.title}
                  className="wn-auth-panel__feature"
                  style={{ animationDelay: `${0.12 + index * 0.07}s` }}
                >
                  <span className="wn-auth-panel__feature-icon">
                    <IconFeature type={f.icon} />
                  </span>
                  <div className="wn-auth-panel__feature-copy">
                    <strong>{f.title}</strong>
                    <span>{f.desc}</span>
                  </div>
                </li>
              ))}
            </ul>

            <div className="wn-auth-panel__metric">
              <span className="wn-auth-panel__metric-value">{config.metric.value}</span>
              <span className="wn-auth-panel__metric-label">{config.metric.label}</span>
            </div>
          </div>
        </aside>

        <div className="wn-auth-form-area">
          <div className="wn-auth-form-area__mesh" aria-hidden="true">
            <span className="wn-auth-form-area__blur wn-auth-form-area__blur--1" />
            <span className="wn-auth-form-area__blur wn-auth-form-area__blur--2" />
          </div>

          <div className="wn-auth-card wn-auth-card--enter" key={pathname}>
            <Outlet />
          </div>
        </div>
      </div>
    </div>
  );
}
