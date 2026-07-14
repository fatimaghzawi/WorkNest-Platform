import type { LucideIcon } from 'lucide-react';

export type DashboardOverviewTile = {
  key: string;
  value: number | string;
  label: string;
  hint?: string;
  icon: LucideIcon;
  tone?: 'upcoming' | 'pending' | 'confirmed' | 'done';
};

export default function DashboardOverview({
  eyebrow,
  total,
  headline,
  caption,
  meterPct = 0,
  tiles,
  loading = false,
}: {
  eyebrow: string;
  total: number | string;
  headline: string;
  caption: string;
  meterPct?: number;
  tiles: DashboardOverviewTile[];
  loading?: boolean;
}) {
  if (loading) {
    return (
      <section className="wn-interviews-overview wn-interviews-overview--loading" aria-hidden>
        <div className="wn-interviews-overview__spotlight wn-glass-panel" />
        <div className="wn-interviews-overview__tiles">
          <div className="wn-glass-card" />
          <div className="wn-glass-card" />
          <div className="wn-glass-card" />
          <div className="wn-glass-card" />
        </div>
      </section>
    );
  }

  return (
    <section className="wn-interviews-overview" aria-label={headline}>
      <div className="wn-interviews-overview__spotlight wn-glass-panel">
        <div className="wn-interviews-overview__orb wn-interviews-overview__orb--a" aria-hidden />
        <div className="wn-interviews-overview__orb wn-interviews-overview__orb--b" aria-hidden />
        <p className="wn-interviews-overview__eyebrow">{eyebrow}</p>
        <p className="wn-interviews-overview__total">{total}</p>
        <p className="wn-interviews-overview__headline">{headline}</p>
        <p className="wn-interviews-overview__caption">{caption}</p>
        <div className="wn-interviews-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(meterPct, 8)}%` }} />
        </div>
      </div>

      <div className="wn-interviews-overview__tiles">
        {tiles.map((tile) => {
          const Icon = tile.icon;
          const tone = tile.tone || 'upcoming';
          return (
            <article
              key={tile.key}
              className={`wn-interviews-overview__tile wn-glass-card wn-interviews-overview__tile--${tone}`}
            >
              <span className="wn-interviews-overview__tile-icon">
                <Icon size={18} />
              </span>
              <div>
                <p className="wn-interviews-overview__tile-value">{tile.value}</p>
                <p className="wn-interviews-overview__tile-label">{tile.label}</p>
                {tile.hint && <p className="wn-interviews-overview__tile-hint">{tile.hint}</p>}
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
}
