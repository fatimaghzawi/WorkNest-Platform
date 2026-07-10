import { AlertTriangle, Info, ScrollText, XCircle } from 'lucide-react';
import type { LogStats } from '../../../../types/log';

export default function LogsOverview({ stats }: { stats: LogStats }) {
  return (
    <section className="wn-logs-overview" aria-label="Log summary">
      <div className="wn-logs-overview__spotlight">
        <span className="wn-logs-overview__glow" aria-hidden />
        <p className="wn-logs-overview__eyebrow">
          <ScrollText size={14} /> System logs
        </p>
        <p className="wn-logs-overview__total">{stats.total}</p>
        <p className="wn-logs-overview__headline">Events captured across the platform</p>
        <p className="wn-logs-overview__meta">
          {stats.last24h.total} in the last 24 hours
        </p>
      </div>

      <div className="wn-logs-overview__tiles">
        <article className="wn-logs-overview__tile wn-logs-overview__tile--info">
          <span className="wn-logs-overview__tile-icon" aria-hidden>
            <Info size={18} />
          </span>
          <p className="wn-logs-overview__tile-label">Info</p>
          <p className="wn-logs-overview__tile-value">{stats.info}</p>
          <p className="wn-logs-overview__tile-hint">Routine events and sign-ins</p>
        </article>

        <article className="wn-logs-overview__tile wn-logs-overview__tile--warning">
          <span className="wn-logs-overview__tile-icon" aria-hidden>
            <AlertTriangle size={18} />
          </span>
          <p className="wn-logs-overview__tile-label">Warnings</p>
          <p className="wn-logs-overview__tile-value">{stats.warning}</p>
          <p className="wn-logs-overview__tile-hint">{stats.last24h.warning} in last 24h</p>
        </article>

        <article className="wn-logs-overview__tile wn-logs-overview__tile--error">
          <span className="wn-logs-overview__tile-icon" aria-hidden>
            <XCircle size={18} />
          </span>
          <p className="wn-logs-overview__tile-label">Errors</p>
          <p className="wn-logs-overview__tile-value">{stats.error}</p>
          <p className="wn-logs-overview__tile-hint">{stats.last24h.error} in last 24h</p>
        </article>
      </div>
    </section>
  );
}
