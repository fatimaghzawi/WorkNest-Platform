import type { Perspective } from '../data/journey';

const styles: Record<Perspective, string> = {
  client: 'bg-wn-primary text-white',
  freelancer: 'bg-wn-orange text-white',
  both: 'bg-wn-soft text-wn-primary ring-1 ring-wn-line',
  system: 'bg-wn-teal text-white',
};

const labels: Record<Perspective, string> = {
  client: 'CLIENT VIEW',
  freelancer: 'FREELANCER VIEW',
  both: 'SHARED',
  system: 'WORKNEST',
};

export function UserPerspective({ perspective }: { perspective: Perspective }) {
  return (
    <span
      className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-[11px] font-bold tracking-[0.16em] shadow-card ${styles[perspective]}`}
    >
      <span className="h-1.5 w-1.5 rounded-full bg-white/90" />
      {labels[perspective]}
    </span>
  );
}
