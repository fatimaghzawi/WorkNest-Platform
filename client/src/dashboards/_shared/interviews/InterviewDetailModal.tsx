import { useState } from 'react';
import { Copy, ExternalLink, Link2, Video } from 'lucide-react';
import Button from '../../../components/common/Button';
import Modal from '../../../components/common/Modal';
import InterviewStatusBadge from './InterviewStatusBadge';
import type { Interview } from '../../../types/interview';
import { formatAgendaDate, formatInterviewTime } from './calendarUtils';
import { useToast } from '../../../hooks/useToast';

export default function InterviewDetailModal({
  open,
  interview,
  role,
  onClose,
  onComplete,
  onCancel,
  onDecline,
  onConfirm,
  busy,
}: {
  open: boolean;
  interview: Interview | null;
  role: 'client' | 'freelancer' | 'admin';
  onClose: () => void;
  onComplete?: () => void;
  onCancel?: () => void;
  onDecline?: () => void;
  onConfirm?: () => void;
  busy?: boolean;
}) {
  const toast = useToast();
  const [copying, setCopying] = useState(false);

  if (!interview) return null;

  const endTime = new Date(
    new Date(interview.scheduledDate).getTime() + interview.duration * 60_000
  );
  const isActive = interview.status === 'scheduled' || interview.status === 'confirmed';
  const meetingLink = interview.meetingLink?.trim() || '';

  const copyLink = async () => {
    if (!meetingLink) return;
    setCopying(true);
    try {
      await navigator.clipboard.writeText(meetingLink);
      toast.success('Meeting link copied.');
    } catch {
      toast.error('Could not copy link.');
    } finally {
      setCopying(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Interview details"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Close
          </Button>
          {interview.status === 'scheduled' && role === 'freelancer' && onConfirm && (
            <Button onClick={onConfirm} disabled={busy}>
              Confirm
            </Button>
          )}
          {interview.status === 'scheduled' && role === 'freelancer' && onDecline && (
            <Button variant="danger" onClick={onDecline} disabled={busy}>
              Decline
            </Button>
          )}
          {isActive && (role === 'client' || role === 'admin') && onCancel && (
            <Button variant="outline" onClick={onCancel} disabled={busy}>
              Cancel meeting
            </Button>
          )}
          {isActive && onComplete && (
            <Button onClick={onComplete} disabled={busy}>
              Mark completed
            </Button>
          )}
          {meetingLink && isActive && (
            <Button
              variant="primary"
              href={meetingLink}
              target="_blank"
              rel="noreferrer"
              rightIcon={<ExternalLink size={16} />}
            >
              Join meeting
            </Button>
          )}
        </>
      }
    >
      <div className="wn-interview-detail">
        <div className="wn-interview-detail__meta-row">
          <InterviewStatusBadge status={interview.status} />
          <span className="wn-interview-detail__duration">
            <Video size={14} />
            {interview.duration} minutes
          </span>
        </div>

        <div>
          <h3 className="wn-interview-detail__job">{interview.jobTitle}</h3>
          <p className="wn-interview-detail__date">
            {formatAgendaDate(new Date(interview.scheduledDate))}
          </p>
          <p className="wn-interview-detail__time">
            {formatInterviewTime(interview.scheduledDate)} – {formatInterviewTime(endTime.toISOString())}
          </p>
        </div>

        <dl className="wn-interview-detail__people">
          <div>
            <dt>Client</dt>
            <dd>{interview.clientName}</dd>
          </div>
          <div>
            <dt>Freelancer</dt>
            <dd>
              {role === 'client' ? (
                <Button
                  variant="ghost"
                  size="sm"
                  to={`/client/freelancers/${interview.freelancerId}`}
                  state={{
                    from: '/client/interviews',
                    fromLabel: 'Back to interviews',
                  }}
                  style={{ padding: 0, minHeight: 0, fontWeight: 600 }}
                >
                  {interview.freelancerName}
                </Button>
              ) : (
                interview.freelancerName
              )}
            </dd>
          </div>
        </dl>

        <section className="wn-interview-detail__link-panel wn-glass-card">
          <div className="wn-interview-detail__link-head">
            <span className="wn-interview-detail__link-title">
              <Link2 size={16} />
              Meeting link
            </span>
            {meetingLink && (
              <button
                type="button"
                className="wn-interview-detail__copy"
                onClick={() => void copyLink()}
                disabled={copying}
              >
                <Copy size={14} />
                Copy
              </button>
            )}
          </div>

          {meetingLink ? (
            <>
              <a
                className="wn-interview-detail__link"
                href={meetingLink}
                target="_blank"
                rel="noreferrer"
              >
                {meetingLink}
              </a>
              {interview.meetingPassword && (
                <p className="wn-interview-detail__password">
                  Password: <strong>{interview.meetingPassword}</strong>
                </p>
              )}
            </>
          ) : (
            <p className="wn-interview-detail__link-missing">No meeting link was saved for this interview.</p>
          )}
        </section>

        {interview.notes && (
          <div className="wn-interview-detail__notes">
            <p className="wn-interview-detail__notes-label">Notes</p>
            <p className="wn-interview-detail__notes-body">{interview.notes}</p>
          </div>
        )}
      </div>
    </Modal>
  );
}
