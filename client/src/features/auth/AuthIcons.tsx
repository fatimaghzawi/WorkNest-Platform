import type { ReactElement } from 'react';

interface IconProps {
  className?: string;
}

const base = {
  width: 20,
  height: 20,
  viewBox: '0 0 24 24',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.75,
  strokeLinecap: 'round' as const,
  strokeLinejoin: 'round' as const,
};

export function IconMail({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M4 6h16v12H4z" />
      <path d="m4 7 8 6 8-6" />
    </svg>
  );
}

export function IconLock({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="5" y="11" width="14" height="10" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}

export function IconEye({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  );
}

export function IconEyeOff({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M3 3l18 18" />
      <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
      <path d="M6.7 6.7C4.1 8.5 2.5 12 2.5 12s3.5 7 10 7c1.8 0 3.4-.5 4.7-1.3" />
      <path d="M17.3 17.3C19.9 15.5 21.5 12 21.5 12s-3.5-7-10-7c-1.1 0-2.1.2-3 .6" />
    </svg>
  );
}

export function IconUser({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <circle cx="12" cy="8" r="4" />
      <path d="M5 20c1.5-4 12.5-4 14 0" />
    </svg>
  );
}

export function IconShield({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 3 20 7v6c0 5-3.5 8-8 8s-8-3-8-8V7l8-4z" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

export function IconBriefcase({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <rect x="3" y="8" width="18" height="12" rx="2" />
      <path d="M8 8V6a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
      <path d="M3 13h18" />
    </svg>
  );
}

export function IconPen({ className }: IconProps) {
  return (
    <svg {...base} className={className} aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 4.5a2.1 2.1 0 0 1 3 3L8 19l-4 1 1-4 11.5-11.5z" />
    </svg>
  );
}

export function IconCheckCircle({ className }: IconProps) {
  return (
    <svg width={48} height={48} viewBox="0 0 24 24" fill="none" className={className} aria-hidden="true">
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="m8 12.5 2.5 2.5L16 9"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export type FeatureIconType = 'shield' | 'bolt' | 'verified' | 'match' | 'mail' | 'free' | 'clock' | 'privacy' | 'key' | 'refresh';

export function IconFeature({ type, className }: { type: FeatureIconType; className?: string }) {
  const icons: Record<FeatureIconType, ReactElement> = {
    shield: <IconShield className={className} />,
    bolt: (
      <svg {...base} className={className} aria-hidden="true">
        <path d="M13 2 4 14h7l-1 8 10-14h-7l1-6z" />
      </svg>
    ),
    verified: (
      <svg {...base} className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="m8 12 2.5 2.5L16 9" />
      </svg>
    ),
    match: (
      <svg {...base} className={className} aria-hidden="true">
        <circle cx="9" cy="9" r="5" />
        <circle cx="15" cy="15" r="5" />
      </svg>
    ),
    mail: <IconMail className={className} />,
    free: (
      <svg {...base} className={className} aria-hidden="true">
        <path d="M12 3v18" />
        <path d="M5 8h14" />
        <path d="M7 3h10" />
      </svg>
    ),
    clock: (
      <svg {...base} className={className} aria-hidden="true">
        <circle cx="12" cy="12" r="9" />
        <path d="M12 7v5l3 2" />
      </svg>
    ),
    privacy: <IconShield className={className} />,
    key: (
      <svg {...base} className={className} aria-hidden="true">
        <circle cx="8" cy="15" r="4" />
        <path d="m11.5 11.5 8-8" />
        <path d="M17 5l2 2" />
      </svg>
    ),
    refresh: (
      <svg {...base} className={className} aria-hidden="true">
        <path d="M4 12a8 8 0 0 1 13.5-5.7" />
        <path d="M20 4v6h-6" />
        <path d="M20 12a8 8 0 0 1-13.5 5.7" />
        <path d="M4 20v-6h6" />
      </svg>
    ),
  };

  return icons[type];
}
