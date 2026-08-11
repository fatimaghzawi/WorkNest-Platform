import type { Perspective } from '../data/presentationContent';

const styles: Record<Perspective, string> = {
  client: 'bg-wn-primary text-white',
  freelancer: 'bg-wn-orange text-white',
  both: 'bg-white/90 text-wn-ink border border-wn-line',
  system: 'bg-wn-teal text-white',
};

const labels: Record<Perspective, string> = {
  client: 'CLIENT VIEW',
  freelancer: 'FREELANCER VIEW',
  both: 'SHARED VIEW',
  system: 'WORKNEST',
};

export function PerspectiveBadge({
  perspective,
  className = '',
}: {
  perspective: Perspective;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] shadow-card ${styles[perspective]} ${className}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {labels[perspective]}
    </span>
  );
}
