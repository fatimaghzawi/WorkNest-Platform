import { useCallback, useEffect, useMemo, useState } from 'react';
import { CalendarPlus, Copy, ExternalLink, Link2, Video } from 'lucide-react';
import { interviewsApi } from '../../../api/interviews.api';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../hooks/useAuth';
import { useToast } from '../../../hooks/useToast';
import { useConfirm } from '../../../context/ConfirmContext';
import type { CreateInterviewPayload, Interview } from '../../../types/interview';
import { getApiErrorMessage } from '../../../utils/apiError';
import DashboardPageHeader from '../DashboardPageHeader';
import InterviewCalendar from './InterviewCalendar';
import InterviewDetailModal from './InterviewDetailModal';
import ScheduleInterviewModal from './ScheduleInterviewModal';
import InterviewStatusBadge from './InterviewStatusBadge';
import InterviewsOverview from './InterviewsOverview';
import {
  formatAgendaDate,
  formatInterviewTime,
  isSameDay,
} from './calendarUtils';
import { getInterviewJobTitle, normalizeInterview } from '../../../utils/interview';
import '../../../css/Interviews.css';
import '../../../css/AdminAnalytics.css';
import '../../../css/DesignSystem.css';

export default function InterviewsPage({
  role,
}: {
  role: 'client' | 'freelancer' | 'admin';
}) {
  const { user } = useAuth();
  const toast = useToast();
  const confirm = useConfirm();

  const today = new Date();
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [selectedDate, setSelectedDate] = useState(today);
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [scheduleOpen, setScheduleOpen] = useState(false);
  const [detailInterview, setDetailInterview] = useState<Interview | null>(null);
  const [actionBusy, setActionBusy] = useState(false);
  const canSchedule = role === 'client' || role === 'admin';

  const loadInterviews = useCallback(async () => {
    if (!user?._id) return;
    setLoading(true);
    try {
      const res = await interviewsApi.list({
        year: viewYear,
        month: viewMonth,
      });
      setInterviews(res.data.data.map(normalizeInterview));
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load interviews.'));
    } finally {
      setLoading(false);
    }
  }, [user?._id, viewYear, viewMonth, toast]);

  useEffect(() => {
    loadInterviews();
  }, [loadInterviews]);

  const stats = useMemo(() => {
    const now = Date.now();
    return {
      upcoming: interviews.filter(
        (i) =>
          (i.status === 'scheduled' || i.status === 'confirmed') &&
          new Date(i.scheduledDate).getTime() >= now
      ).length,
      pending: interviews.filter((i) => i.status === 'scheduled').length,
      confirmed: interviews.filter((i) => i.status === 'confirmed').length,
      completed: interviews.filter((i) => i.status === 'completed').length,
    };
  }, [interviews]);

  const selectedDayInterviews = useMemo(
    () =>
      interviews
        .filter((interview) =>
          isSameDay(new Date(interview.scheduledDate), selectedDate)
        )
        .sort(
          (a, b) =>
            new Date(a.scheduledDate).getTime() - new Date(b.scheduledDate).getTime()
        ),
    [interviews, selectedDate]
  );

  const handleSchedule = async (payload: CreateInterviewPayload) => {
    try {
      await interviewsApi.create(payload);
      toast.success('Interview scheduled.');
      await loadInterviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to schedule interview.'));
      throw error;
    }
  };

  const runAction = async (action: () => Promise<unknown>, message: string) => {
    if (!detailInterview) return;
    setActionBusy(true);
    try {
      await action();
      toast.success(message);
      setDetailInterview(null);
      await loadInterviews();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Action failed.'));
    } finally {
      setActionBusy(false);
    }
  };

  const goPrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const goNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  const goToday = () => {
    const now = new Date();
    setViewYear(now.getFullYear());
    setViewMonth(now.getMonth());
    setSelectedDate(now);
  };

  const openInterviewDetail = async (interview: Interview) => {
    const normalized = normalizeInterview(interview);
    setDetailInterview(normalized);
    const interviewId = normalized.id || normalized._id;
    if (!interviewId) return;

    try {
      const res = await interviewsApi.getById(interviewId);
      setDetailInterview(normalizeInterview(res.data.data));
    } catch (error) {
      toast.warning(getApiErrorMessage(error, 'Could not load full interview details.'));
    }
  };

  const copyMeetingLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      toast.success('Meeting link copied.');
    } catch {
      toast.error('Could not copy link.');
    }
  };

  const participantLabel = (interview: Interview) => {
    if (role === 'freelancer') return `With ${interview.clientName}`;
    if (role === 'admin') return `${interview.clientName} · ${interview.freelancerName}`;
    return `With ${interview.freelancerName}`;
  };

  return (
    <div className="wn-interviews-page">
      <div className="wn-interviews-page__backdrop" aria-hidden>
        <span className="wn-interviews-page__blob wn-interviews-page__blob--1" />
        <span className="wn-interviews-page__blob wn-interviews-page__blob--2" />
        <span className="wn-interviews-page__blob wn-interviews-page__blob--3" />
      </div>

      <div className="wn-interviews-page__content wn-analytics">
        <DashboardPageHeader
          hero
          eyebrow="Interviews"
          title="Meeting calendar"
          subtitle={
            role === 'client'
              ? 'Schedule video calls with freelancers and see your month at a glance.'
              : role === 'admin'
                ? 'Oversee all platform interviews, schedule meetings, and keep hiring on track.'
                : 'Track invites, join meetings, and manage your interview schedule.'
          }
          actions={
            canSchedule ? (
              <Button
                variant="primary"
                leftIcon={<CalendarPlus size={18} />}
                onClick={() => setScheduleOpen(true)}
              >
                Schedule interview
              </Button>
            ) : role === 'freelancer' ? (
              <Button to="/freelancer/proposals" variant="outline">
                My proposals
              </Button>
            ) : undefined
          }
        />

        {loading ? (
          <div className="wn-interviews-overview wn-interviews-overview--loading" aria-hidden>
            <div className="wn-interviews-overview__spotlight wn-glass-panel" />
            <div className="wn-interviews-overview__tiles">
              <div className="wn-glass-card" />
              <div className="wn-glass-card" />
              <div className="wn-glass-card" />
              <div className="wn-glass-card" />
            </div>
          </div>
        ) : (
          <InterviewsOverview stats={stats} />
        )}

        <div className="wn-interviews-layout">
          <InterviewCalendar
            year={viewYear}
            month={viewMonth}
            interviews={interviews}
            selectedDate={selectedDate}
            onSelectDate={setSelectedDate}
            onPrevMonth={goPrevMonth}
            onNextMonth={goNextMonth}
            onToday={goToday}
          />

          <aside className="wn-interview-agenda wn-glass-panel">
            <div className="wn-interview-agenda__header">
              <p className="wn-interview-agenda__kicker">Day agenda</p>
              <h3 className="wn-interview-agenda__date">{formatAgendaDate(selectedDate)}</h3>
              <p className="wn-interview-agenda__count">
                {selectedDayInterviews.length === 0
                  ? 'No meetings this day'
                  : `${selectedDayInterviews.length} meeting${selectedDayInterviews.length === 1 ? '' : 's'}`}
              </p>
              {canSchedule && (
                <Button
                  size="sm"
                  variant="outline"
                  className="wn-interview-agenda__add"
                  onClick={() => setScheduleOpen(true)}
                >
                  + Add on this day
                </Button>
              )}
            </div>

            {selectedDayInterviews.length === 0 ? (
              <div className="wn-interview-agenda__empty wn-glass-card">
                <Video size={28} strokeWidth={1.5} />
                <p>Click a highlighted day or schedule a new interview.</p>
              </div>
            ) : (
              <ol className="wn-interview-agenda__timeline">
                {selectedDayInterviews.map((interview, index) => {
                  const isLast = index === selectedDayInterviews.length - 1;
                  const isActive =
                    interview.status === 'scheduled' || interview.status === 'confirmed';
                  const hasLink = Boolean(interview.meetingLink?.trim());

                  return (
                    <li key={interview.id} className="wn-interview-agenda__item">
                      <div className="wn-interview-agenda__rail" aria-hidden>
                        <span
                          className={`wn-interview-agenda__dot wn-interview-agenda__dot--${interview.status}`}
                        />
                        {!isLast && <span className="wn-interview-agenda__line" />}
                      </div>

                      <button
                        type="button"
                        className={[
                          'wn-interview-card wn-glass-card',
                          `wn-interview-card--${interview.status}`,
                          detailInterview?.id === interview.id ? 'wn-interview-card--active' : '',
                        ]
                          .filter(Boolean)
                          .join(' ')}
                        onClick={() => openInterviewDetail(interview)}
                      >
                        <div className="wn-interview-card__top">
                          <span className="wn-interview-card__time">
                            {formatInterviewTime(interview.scheduledDate)}
                          </span>
                          <span className="wn-interview-card__duration">{interview.duration}m</span>
                        </div>
                        <p className="wn-interview-card__title">{getInterviewJobTitle(interview)}</p>
                        <p className="wn-interview-card__meta">{participantLabel(interview)}</p>

                        {hasLink && (
                          <div className="wn-interview-card__link-box">
                            <Link2 size={14} aria-hidden />
                            <a
                              className="wn-interview-card__link"
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              {interview.meetingLink}
                            </a>
                            <button
                              type="button"
                              className="wn-interview-card__copy"
                              aria-label="Copy meeting link"
                              onClick={(e) => {
                                e.stopPropagation();
                                void copyMeetingLink(interview.meetingLink);
                              }}
                            >
                              <Copy size={13} />
                            </button>
                          </div>
                        )}

                        {interview.meetingPassword && (
                          <p className="wn-interview-card__password">
                            Password: <strong>{interview.meetingPassword}</strong>
                          </p>
                        )}

                        <div className="wn-interview-card__footer">
                          <InterviewStatusBadge status={interview.status} />
                          {hasLink && isActive && (
                            <a
                              className="wn-interview-card__join"
                              href={interview.meetingLink}
                              target="_blank"
                              rel="noreferrer"
                              onClick={(e) => e.stopPropagation()}
                            >
                              <ExternalLink size={13} />
                              Join
                            </a>
                          )}
                        </div>
                      </button>
                    </li>
                  );
                })}
              </ol>
            )}
          </aside>
        </div>
      </div>

      {canSchedule && (
        <ScheduleInterviewModal
          open={scheduleOpen}
          onClose={() => setScheduleOpen(false)}
          onScheduled={handleSchedule}
          defaultDate={selectedDate}
          mode={role === 'admin' ? 'admin' : 'client'}
        />
      )}

      <InterviewDetailModal
        open={Boolean(detailInterview)}
        interview={detailInterview}
        role={role}
        onClose={() => setDetailInterview(null)}
        busy={actionBusy}
        onComplete={
          detailInterview &&
          (detailInterview.status === 'scheduled' || detailInterview.status === 'confirmed')
            ? () => runAction(() => interviewsApi.complete(detailInterview!.id), 'Marked as completed.')
            : undefined
        }
        onCancel={
          detailInterview &&
          (detailInterview.status === 'scheduled' || detailInterview.status === 'confirmed') &&
          (role === 'client' || role === 'admin')
            ? async () => {
                const ok = await confirm({
                  title: 'Cancel interview',
                  message: 'Cancel this meeting? The freelancer will no longer see it as active.',
                  confirmLabel: 'Cancel meeting',
                  variant: 'danger',
                });
                if (!ok) return;
                await runAction(
                  () => interviewsApi.cancel(detailInterview!.id),
                  'Interview cancelled.'
                );
              }
            : undefined
        }
        onConfirm={
          detailInterview?.status === 'scheduled' && role === 'freelancer'
            ? () =>
                runAction(() => interviewsApi.confirm(detailInterview!.id), 'Interview confirmed.')
            : undefined
        }
        onDecline={
          detailInterview?.status === 'scheduled' && role === 'freelancer'
            ? async () => {
                const ok = await confirm({
                  title: 'Decline interview',
                  message: 'Decline this meeting invite?',
                  confirmLabel: 'Decline',
                  variant: 'danger',
                });
                if (!ok) return;
                await runAction(
                  () => interviewsApi.decline(detailInterview!.id),
                  'Interview declined.'
                );
              }
            : undefined
        }
      />
    </div>
  );
}
