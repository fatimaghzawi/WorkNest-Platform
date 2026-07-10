import { Archive, CircleCheck, FolderTree, Tags } from 'lucide-react';

export interface CategoryPipelineStats {
  total: number;
  active: number;
  inactive: number;
}

function pct(part: number, total: number) {
  return total > 0 ? Math.round((part / total) * 100) : 0;
}

type ActiveFilter = 'all' | 'active' | 'inactive';

export default function CategoriesOverview({
  stats,
  activeFilter = 'all',
  onStageClick,
}: {
  stats: CategoryPipelineStats;
  activeFilter?: ActiveFilter;
  onStageClick?: (filter: 'active' | 'inactive') => void;
}) {
  const livePct = pct(stats.active, stats.total);
  const mix = [
    { key: 'active', value: stats.active, color: '#15803d' },
    { key: 'inactive', value: stats.inactive, color: '#6b7280' },
  ].filter((item) => item.value > 0);

  const tileClass = (filter: 'active' | 'inactive') =>
    [
      'wn-categories-overview__tile',
      `wn-categories-overview__tile--${filter}`,
      activeFilter === filter ? 'wn-categories-overview__tile--active' : '',
    ]
      .filter(Boolean)
      .join(' ');

  return (
    <section className="wn-categories-overview" aria-label="Category overview">
      <div className="wn-categories-overview__spotlight">
        <div className="wn-categories-overview__glow" aria-hidden />
        <div className="wn-categories-overview__rings" aria-hidden>
          <span />
          <span />
        </div>
        <p className="wn-categories-overview__eyebrow">Catalog snapshot</p>
        <p className="wn-categories-overview__total">{stats.total.toLocaleString()}</p>
        <p className="wn-categories-overview__headline">Job categories</p>
        <p className="wn-categories-overview__caption">
          {stats.active} live for clients · {livePct}% of catalog active
        </p>
        <div className="wn-categories-overview__meter" aria-hidden>
          <span style={{ width: `${Math.max(livePct, 8)}%` }} />
        </div>
        {stats.total > 0 && (
          <div className="wn-categories-overview__mix" aria-label="Active vs inactive">
            <div className="wn-categories-overview__mix-bar">
              {mix.map((item) => (
                <span
                  key={item.key}
                  style={{ flexGrow: item.value, background: item.color }}
                  title={`${item.key}: ${item.value}`}
                />
              ))}
            </div>
            <div className="wn-categories-overview__mix-legend">
              <span>Active {pct(stats.active, stats.total)}%</span>
              <span>Inactive {pct(stats.inactive, stats.total)}%</span>
            </div>
          </div>
        )}
      </div>

      <div className="wn-categories-overview__tiles">
        <button
          type="button"
          className={tileClass('active')}
          onClick={() => onStageClick?.('active')}
          aria-pressed={activeFilter === 'active'}
        >
          <span className="wn-categories-overview__tile-icon">
            <CircleCheck size={18} />
          </span>
          <div>
            <p className="wn-categories-overview__tile-value">{stats.active}</p>
            <p className="wn-categories-overview__tile-label">Active</p>
            <p className="wn-categories-overview__tile-hint">Visible to clients</p>
          </div>
          <span className="wn-categories-overview__tile-pct">{pct(stats.active, stats.total)}%</span>
        </button>

        <button
          type="button"
          className={tileClass('inactive')}
          onClick={() => onStageClick?.('inactive')}
          aria-pressed={activeFilter === 'inactive'}
        >
          <span className="wn-categories-overview__tile-icon">
            <Archive size={18} />
          </span>
          <div>
            <p className="wn-categories-overview__tile-value">{stats.inactive}</p>
            <p className="wn-categories-overview__tile-label">Inactive</p>
            <p className="wn-categories-overview__tile-hint">Hidden from listings</p>
          </div>
          <span className="wn-categories-overview__tile-pct">{pct(stats.inactive, stats.total)}%</span>
        </button>

        <article className="wn-categories-overview__tile wn-categories-overview__tile--catalog">
          <span className="wn-categories-overview__tile-icon">
            <Tags size={18} />
          </span>
          <div>
            <p className="wn-categories-overview__tile-value">{stats.total}</p>
            <p className="wn-categories-overview__tile-label">Total catalog</p>
            <p className="wn-categories-overview__tile-hint">All category records</p>
          </div>
          <span className="wn-categories-overview__tile-pct">100%</span>
        </article>

        <article className="wn-categories-overview__tile wn-categories-overview__tile--tree">
          <span className="wn-categories-overview__tile-icon">
            <FolderTree size={18} />
          </span>
          <div>
            <p className="wn-categories-overview__tile-value">{livePct}%</p>
            <p className="wn-categories-overview__tile-label">Live rate</p>
            <p className="wn-categories-overview__tile-hint">Share still published</p>
          </div>
          <span className="wn-categories-overview__tile-pct">{stats.active} live</span>
        </article>
      </div>
    </section>
  );
}
