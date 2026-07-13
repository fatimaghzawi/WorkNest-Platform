import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Interview } from '../../../types/interview';
import {
  WEEKDAYS,
  buildMonthGrid,
  formatMonthYear,
  isSameDay,
  toDateKey,
} from './calendarUtils';
import { getInterviewJobTitle } from '../../../utils/interview';
import '../../../css/Interviews.css';

const MAX_CHIPS = 2;

export default function InterviewCalendar({
  year,
  month,
  interviews,
  selectedDate,
  onSelectDate,
  onPrevMonth,
  onNextMonth,
  onToday,
}: {
  year: number;
  month: number;
  interviews: Interview[];
  selectedDate: Date;
  onSelectDate: (date: Date) => void;
  onPrevMonth: () => void;
  onNextMonth: () => void;
  onToday: () => void;
}) {
  const today = new Date();
  const grid = buildMonthGrid(year, month);

  const byDay = interviews.reduce<Record<string, Interview[]>>((acc, interview) => {
    const key = toDateKey(new Date(interview.scheduledDate));
    acc[key] = acc[key] ? [...acc[key], interview] : [interview];
    return acc;
  }, {});

  return (
    <section className="wn-interview-calendar wn-glass-panel" aria-label="Interview calendar">
      <div className="wn-interview-calendar__header wn-glass-header">
        <div>
          <p className="wn-interview-calendar__kicker">Interview calendar</p>
          <h2 className="wn-interview-calendar__month">{formatMonthYear(year, month)}</h2>
        </div>
        <div className="wn-interview-calendar__nav">
          <button
            type="button"
            className="wn-interview-calendar__today-btn"
            onClick={onToday}
          >
            Today
          </button>
          <button
            type="button"
            className="wn-interview-calendar__nav-btn"
            onClick={onPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={18} />
          </button>
          <button
            type="button"
            className="wn-interview-calendar__nav-btn"
            onClick={onNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      </div>

      <div className="wn-interview-calendar__weekdays">
        {WEEKDAYS.map((day) => (
          <div key={day} className="wn-interview-calendar__weekday">
            {day}
          </div>
        ))}
      </div>

      <div className="wn-interview-calendar__grid" role="grid">
        {grid.map((cell) => {
          const dayEvents = byDay[cell.iso] ?? [];
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selectedDate);

          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              className={[
                'wn-interview-calendar__cell',
                'wn-glass-cell',
                !cell.inMonth ? 'wn-interview-calendar__cell--outside' : '',
                isToday ? 'wn-interview-calendar__cell--today' : '',
                isSelected ? 'wn-interview-calendar__cell--selected' : '',
                dayEvents.length > 0 ? 'wn-interview-calendar__cell--has-events' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => onSelectDate(cell.date)}
              aria-label={`${cell.date.toLocaleDateString()}, ${dayEvents.length} interviews`}
            >
              <span className="wn-interview-calendar__day-num">{cell.date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="wn-interview-calendar__badge">{dayEvents.length}</span>
              )}
              <div
                className={`wn-interview-calendar__dots ${
                  dayEvents.length > 0 ? 'wn-interview-calendar__dots--has-events' : ''
                }`.trim()}
              >
                {dayEvents.slice(0, MAX_CHIPS).map((event) => {
                  const time = new Date(event.scheduledDate).toLocaleTimeString(undefined, {
                    hour: 'numeric',
                    minute: '2-digit',
                  });
                  const jobTitle = getInterviewJobTitle(event);

                  return (
                    <span
                      key={event.id}
                      className={`wn-interview-calendar__event-chip wn-interview-calendar__event-chip--${event.status}`}
                      title={`${time} · ${jobTitle}`}
                    >
                      <span className="wn-interview-calendar__event-time">{time}</span>
                      <span className="wn-interview-calendar__event-title">{jobTitle}</span>
                    </span>
                  );
                })}
                {dayEvents.length > MAX_CHIPS && (
                  <span className="wn-interview-calendar__more">
                    +{dayEvents.length - MAX_CHIPS} more
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      <div className="wn-interview-legend">
        {(['scheduled', 'confirmed', 'completed', 'cancelled', 'declined'] as const).map((status) => (
          <span key={status} className="wn-interview-legend__item">
            <span
              className="wn-interview-legend__dot"
              style={{
                background:
                  status === 'scheduled'
                    ? '#f59e0b'
                    : status === 'confirmed'
                      ? '#3b82f6'
                      : status === 'completed'
                        ? '#22c55e'
                        : status === 'declined'
                          ? '#ef4444'
                          : '#9ca3af',
              }}
            />
            {status.charAt(0).toUpperCase() + status.slice(1)}
          </span>
        ))}
      </div>
    </section>
  );
}
