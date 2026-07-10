import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';
import { interviewsApi } from '../../../api/interviews.api';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import type { Interview } from '../../../types/interview';
import { getApiErrorMessage } from '../../../utils/apiError';
import InterviewStatusBadge from '../interviews/InterviewStatusBadge';
import {
  WEEKDAYS,
  buildMonthGrid,
  formatAgendaDate,
  formatInterviewTime,
  formatMonthYear,
  isSameDay,
  toDateKey,
} from '../interviews/calendarUtils';
import '../../../css/Interviews.css';

const STATUS_DOT: Record<Interview['status'], string> = {
  scheduled: '#f59e0b',
  confirmed: '#3b82f6',
  completed: '#22c55e',
  cancelled: '#9ca3af',
  declined: '#ef4444',
};

export default function DashboardInterviewMiniCalendar({
  interviewsPath,
}: {
  interviewsPath: string;
}) {
  const { user } = useAuth();
  const toast = useToast();
  const today = new Date();

  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);

  const loadInterviews = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await interviewsApi.list({
        year: viewYear,
        month: viewMonth,
      });
      setInterviews(res.data.data);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load interviews.'));
      setInterviews([]);
    } finally {
      setLoading(false);
    }
  }, [user?._id, viewYear, viewMonth, toast]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const byDay = useMemo(
    () =>
      interviews.reduce<Record<string, Interview[]>>((acc, interview) => {
        const key = toDateKey(new Date(interview.scheduledDate));
        acc[key] = acc[key] ? [...acc[key], interview] : [interview];
        return acc;
      }, {}),
    [interviews]
  );

  const grid = buildMonthGrid(viewYear, viewMonth);
  const selectedKey = toDateKey(selectedDate);
  const selectedDayInterviews = byDay[selectedKey] ?? [];

  const upcoming = useMemo(() => {
    const now = Date.now();
    return interviews
      .filter(
        (interview) =>
          (interview.status === 'scheduled' || interview.status === 'confirmed') &&
          new Date(interview.scheduledDate).getTime() >= now
      )
      .sort(
        (a, b) =>
          new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
      )
      .slice(0, 3);
  }, [interviews]);

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewYear((year) => year - 1);
      setViewMonth(11);
      return;
    }
    setViewMonth((month) => month - 1);
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewYear((year) => year + 1);
      setViewMonth(0);
      return;
    }
    setViewMonth((month) => month + 1);
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(now);
  };

  return (
    <section className="wn-dashboard-mini-cal" aria-label="Interview mini calendar">
      <div className="wn-dashboard-mini-cal__header">
        <div>
          <p className="wn-dashboard-mini-cal__kicker">Interviews</p>
          <h3 className="wn-dashboard-mini-cal__month">{formatMonthYear(viewYear, viewMonth)}</h3>
        </div>
        <div className="wn-dashboard-mini-cal__nav">
          <button type="button" className="wn-dashboard-mini-cal__today" onClick={goToday}>
            Today
          </button>
          <button
            type="button"
            className="wn-dashboard-mini-cal__nav-btn"
            onClick={goPrevMonth}
            aria-label="Previous month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            className="wn-dashboard-mini-cal__nav-btn"
            onClick={goNextMonth}
            aria-label="Next month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      <div className="wn-dashboard-mini-cal__weekdays" aria-hidden>
        {WEEKDAYS.map((day) => (
          <span key={day}>{day.slice(0, 1)}</span>
        ))}
      </div>

      <div
        className={`wn-dashboard-mini-cal__grid${loading ? ' wn-dashboard-mini-cal__grid--loading' : ''}`}
        role="grid"
      >
        {grid.map((cell) => {
          const dayEvents = byDay[cell.iso] ?? [];
          const isToday = isSameDay(cell.date, today);
          const isSelected = isSameDay(cell.date, selectedDate);
          const primaryStatus = dayEvents[0]?.status;

          return (
            <button
              key={cell.iso}
              type="button"
              role="gridcell"
              className={[
                'wn-dashboard-mini-cal__cell',
                !cell.inMonth ? 'wn-dashboard-mini-cal__cell--outside' : '',
                isToday ? 'wn-dashboard-mini-cal__cell--today' : '',
                isSelected ? 'wn-dashboard-mini-cal__cell--selected' : '',
                dayEvents.length > 0 ? 'wn-dashboard-mini-cal__cell--has-events' : '',
              ]
                .filter(Boolean)
                .join(' ')}
              onClick={() => setSelectedDate(cell.date)}
              aria-label={`${cell.date.toLocaleDateString()}, ${dayEvents.length} interviews`}
            >
              <span className="wn-dashboard-mini-cal__day">{cell.date.getDate()}</span>
              {dayEvents.length > 0 && (
                <span className="wn-dashboard-mini-cal__markers" aria-hidden>
                  {dayEvents.length > 1 ? (
                    <>
                      <span
                        className="wn-dashboard-mini-cal__dot"
                        style={{ background: STATUS_DOT[primaryStatus] }}
                      />
                      <span className="wn-dashboard-mini-cal__count">{dayEvents.length}</span>
                    </>
                  ) : (
                    <span
                      className="wn-dashboard-mini-cal__dot"
                      style={{ background: STATUS_DOT[primaryStatus] }}
                    />
                  )}
                </span>
              )}
            </button>
          );
        })}
      </div>

      <div className="wn-dashboard-mini-cal__agenda">
        <p className="wn-dashboard-mini-cal__agenda-title">{formatAgendaDate(selectedDate)}</p>

        {selectedDayInterviews.length > 0 ? (
          <ul className="wn-dashboard-mini-cal__list">
            {selectedDayInterviews.slice(0, 3).map((interview) => (
              <li key={interview.id} className="wn-dashboard-mini-cal__item">
                <div className="wn-dashboard-mini-cal__item-top">
                  <strong>{formatInterviewTime(interview.scheduledDate)}</strong>
                  <InterviewStatusBadge status={interview.status} />
                </div>
                <p className="wn-dashboard-mini-cal__item-title">{interview.jobTitle}</p>
                <p className="wn-dashboard-mini-cal__item-meta">
                  {interview.clientName} · {interview.freelancerName}
                </p>
              </li>
            ))}
          </ul>
        ) : upcoming.length > 0 ? (
          <>
            <p className="wn-dashboard-mini-cal__agenda-sub">Next upcoming</p>
            <ul className="wn-dashboard-mini-cal__list">
              {upcoming.map((interview) => (
                <li key={interview.id} className="wn-dashboard-mini-cal__item">
                  <div className="wn-dashboard-mini-cal__item-top">
                    <strong>
                      {new Date(interview.scheduledDate).toLocaleDateString(undefined, {
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      · {formatInterviewTime(interview.scheduledDate)}
                    </strong>
                    <InterviewStatusBadge status={interview.status} />
                  </div>
                  <p className="wn-dashboard-mini-cal__item-title">{interview.jobTitle}</p>
                </li>
              ))}
            </ul>
          </>
        ) : (
          <p className="wn-dashboard-mini-cal__empty">No interviews scheduled this month.</p>
        )}
      </div>

      <Link to={interviewsPath} className="wn-dashboard-mini-cal__link">
        View all interviews
        <ExternalLink size={14} />
      </Link>
    </section>
  );
}
