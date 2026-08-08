import { CalendarCheck, CalendarClock, CalendarDays, Video } from 'lucide-react';

export interface InterviewStats {
  upcoming: number;
  pending: number;
  confirmed: number;
  completed: number;
}

export default function InterviewsOverview({ stats }: { stats: InterviewStats }) {
  const confirmRate =
    stats.pending + stats.confirmed > 0
      ? Math.round((stats.confirmed / (stats.pending + stats.confirmed)) * 100)
      : 0;

  return (
    <section className="wn-interviews-overview" aria-label="Interview overview">
      <div className="wn-interviews-overview__spotlight wn-glass-panel">
        <div className="wn-interviews-overview__orb wn-interviews-overview__orb--a" aria-hidden />
        <div className="wn-interviews-overview__orb wn-interviews-overview__orb--b" aria-hidden />
        <p className="wn-interviews-overview__eyebrow">Meeting pulse</p>
        <p className="wn-interviews-overview__total">{stats.upcoming}</p>
        <p className="wn-interviews-overview__headline">Upcoming interviews</p>
        <p className="wn-interviews-overview__caption">
          {stats.confirmed} confirmed · {stats.pending} awaiting reply
        </p>
        <div className="wn-interviews-overview__meter" aria-hidden>
          <span
            style={{
              width: `${Math.max(
                stats.upcoming > 0 ? Math.round((stats.confirmed / stats.upcoming) * 100) : 0,
                8
              )}%`,
            }}
          />
        </div>
      </div>

      <div className="wn-interviews-overview__tiles">
        <article className="wn-interviews-overview__tile wn-glass-card wn-interviews-overview__tile--upcoming">
          <span className="wn-interviews-overview__tile-icon">
            <CalendarDays size={18} />
          </span>
          <div>
            <p className="wn-interviews-overview__tile-value">{stats.upcoming}</p>
            <p className="wn-interviews-overview__tile-label">Upcoming</p>
            <p className="wn-interviews-overview__tile-hint">Scheduled ahead</p>
          </div>
        </article>

        <article className="wn-interviews-overview__tile wn-glass-card wn-interviews-overview__tile--pending">
          <span className="wn-interviews-overview__tile-icon">
            <CalendarClock size={18} />
          </span>
          <div>
            <p className="wn-interviews-overview__tile-value">{stats.pending}</p>
            <p className="wn-interviews-overview__tile-label">Awaiting</p>
            <p className="wn-interviews-overview__tile-hint">Need confirmation</p>
          </div>
        </article>

        <article className="wn-interviews-overview__tile wn-glass-card wn-interviews-overview__tile--confirmed">
          <span className="wn-interviews-overview__tile-icon">
            <Video size={18} />
          </span>
          <div>
            <p className="wn-interviews-overview__tile-value">{stats.confirmed}</p>
            <p className="wn-interviews-overview__tile-label">Confirmed</p>
            <p className="wn-interviews-overview__tile-hint">Ready to join</p>
          </div>
        </article>

        <article className="wn-interviews-overview__tile wn-glass-card wn-interviews-overview__tile--done">
          <span className="wn-interviews-overview__tile-icon">
            <CalendarCheck size={18} />
          </span>
          <div>
            <p className="wn-interviews-overview__tile-value">{stats.completed}</p>
            <p className="wn-interviews-overview__tile-label">Completed</p>
            <p className="wn-interviews-overview__tile-hint">{confirmRate}% confirm rate</p>
          </div>
        </article>
      </div>
    </section>
  );
}
