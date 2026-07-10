import { useEffect, useState } from 'react';
import type { ToastItem as ToastItemType } from '../../../types/toast';

const VARIANT_TITLES = {
  success: 'Success',
  error: 'Something went wrong',
  info: 'Notice',
  warning: 'Warning',
} as const;

function ToastIcon({ variant }: { variant: ToastItemType['variant'] }) {
  if (variant === 'success') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M16.25 5.75 8.5 13.5 4.75 9.75"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  if (variant === 'error') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 6.25v4.25M10 13.75h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.75" />
      </svg>
    );
  }

  if (variant === 'warning') {
    return (
      <svg viewBox="0 0 20 20" fill="none" aria-hidden>
        <path
          d="M10 7.25v3.5M10 13.75h.01"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
        />
        <path
          d="m9.1 3.9 7.35 12.7c.45.78-.12 1.75-1.02 1.75H4.57c-.9 0-1.47-.97-1.02-1.75L10.9 3.9c.45-.78 1.55-.78 2 0Z"
          stroke="currentColor"
          strokeWidth="1.5"
          strokeLinejoin="round"
        />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 20 20" fill="none" aria-hidden>
      <circle cx="10" cy="10" r="7.25" stroke="currentColor" strokeWidth="1.75" />
      <path d="M10 9v5" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
      <path d="M10 6.5h.01" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
    </svg>
  );
}

export default function ToastItem({
  toast,
  onDismiss,
}: {
  toast: ToastItemType;
  onDismiss: (id: string) => void;
}) {
  const [leaving, setLeaving] = useState(false);
  const title = toast.title || VARIANT_TITLES[toast.variant];

  const dismiss = () => {
    setLeaving(true);
    window.setTimeout(() => onDismiss(toast.id), 220);
  };

  useEffect(() => {
    const timer = window.setTimeout(dismiss, toast.duration);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [toast.duration, toast.id]);

  return (
    <div
      className={`wn-toast wn-toast--${toast.variant} ${leaving ? 'wn-toast--leaving' : ''}`}
      role={toast.variant === 'error' ? 'alert' : 'status'}
      aria-live={toast.variant === 'error' ? 'assertive' : 'polite'}
    >
      <span className="wn-toast__icon">
        <ToastIcon variant={toast.variant} />
      </span>

      <div className="wn-toast__content">
        <p className="wn-toast__title">{title}</p>
        <p className="wn-toast__message">{toast.message}</p>
      </div>

      <button
        type="button"
        className="wn-toast__close"
        onClick={dismiss}
        aria-label="Dismiss notification"
      >
        <svg viewBox="0 0 20 20" fill="none" width="16" height="16" aria-hidden>
          <path
            d="m5 5 10 10M15 5 5 15"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
          />
        </svg>
      </button>

      <div className="wn-toast__progress" aria-hidden>
        <span
          className="wn-toast__progress-bar"
          style={{ animationDuration: `${toast.duration}ms` }}
        />
      </div>
    </div>
  );
}
