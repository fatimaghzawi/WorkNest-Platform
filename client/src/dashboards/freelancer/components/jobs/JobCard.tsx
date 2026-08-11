import { type CSSProperties } from 'react';
import { ArrowUpRight, CalendarDays, Send } from 'lucide-react';
import Button from '@/components/Button';
import type { Job } from '@/types/job';
import {
  formatCurrency,
  formatDate,
  formatRelativeTime,
  getDeadlineUrgency,
} from '@/utils/format';

interface JobCardProps {
  job: Job;
  index?: number;
  hasSubmittedProposal?: boolean;
  onSubmitProposal?: (job: Job) => void;
}

function clientLabel(clientId: Job['clientId']) {
  if (!clientId || typeof clientId === 'string') return null;
  const name = `${clientId.firstName ?? ''} ${clientId.lastName ?? ''}`.trim();
  return name || null;
}

function categoryMark(category: string) {
  const words = category.trim().split(/\s+/).filter(Boolean);
  if (words.length >= 2) return `${words[0][0]}${words[1][0]}`.toUpperCase();
  return category.slice(0, 2).toUpperCase() || 'JB';
}

export default function JobCard({
  job,
  index = 0,
  hasSubmittedProposal = false,
  onSubmitProposal,
}: JobCardProps) {
  const description =
    job.description.length > 120
      ? `${job.description.slice(0, 120).trimEnd()}…`
      : job.description;
  const urgency = getDeadlineUrgency(job.deadline);
  const client = clientLabel(job.clientId);
  const mark = categoryMark(job.category || 'Job');
  const visibleSkills = job.skills.slice(0, 4);
  const extraSkills = Math.max(0, job.skills.length - visibleSkills.length);
  const briefId = job._id.slice(-4).toUpperCase();

  return (
    <article
      className={['wn-job-ticket', hasSubmittedProposal ? 'wn-job-ticket--applied' : '']
        .filter(Boolean)
        .join(' ')}
      style={{ '--ticket-i': index } as CSSProperties}
    >
      <aside className="wn-job-ticket__stub">
        <span className="wn-job-ticket__mark">{mark}</span>
        <div className="wn-job-ticket__pay">
          <span className="wn-job-ticket__pay-label">Budget</span>
          <strong className="wn-job-ticket__pay-value">{formatCurrency(job.budget)}</strong>
        </div>
        <span className="wn-job-ticket__serial">WN-{briefId}</span>
        <span className={`wn-job-ticket__urgency wn-job-ticket__urgency--${urgency.level}`}>
          {urgency.label}
        </span>
      </aside>

      <div className="wn-job-ticket__perforation" aria-hidden />

      <div className="wn-job-ticket__body">
        <div className="wn-job-ticket__topline">
          <span className="wn-job-ticket__stamp">{job.category}</span>
          {hasSubmittedProposal ? (
            <span className="wn-job-ticket__bid-state">Bid sent</span>
          ) : (
            <span className="wn-job-ticket__posted">{formatRelativeTime(job.createdAt)}</span>
          )}
        </div>

        <h3 className="wn-job-ticket__title">{job.title}</h3>
        <p className="wn-job-ticket__brief">{description}</p>

        {visibleSkills.length > 0 && (
          <ul className="wn-job-ticket__skills">
            {visibleSkills.map((skill) => (
              <li key={skill}>{skill}</li>
            ))}
            {extraSkills > 0 && <li className="wn-job-ticket__skills-more">+{extraSkills}</li>}
          </ul>
        )}

        <div className="wn-job-ticket__rail">
          <span>
            <CalendarDays size={13} strokeWidth={2.2} />
            Due {formatDate(job.deadline)}
          </span>
          {client && <span className="wn-job-ticket__client">Client · {client}</span>}
        </div>

        <div className="wn-job-ticket__cta">
          <Button
            size="sm"
            variant="ghost"
            className="wn-job-ticket__link"
            to={`/freelancer/jobs/${job._id}`}
            rightIcon={<ArrowUpRight size={14} />}
          >
            Open brief
          </Button>
          {job.status === 'open' && onSubmitProposal && (
            <Button
              size="sm"
              className="wn-job-ticket__bid"
              variant={hasSubmittedProposal ? 'secondary' : 'primary'}
              onClick={() => onSubmitProposal(job)}
              disabled={hasSubmittedProposal}
              leftIcon={!hasSubmittedProposal ? <Send size={13} /> : undefined}
            >
              {hasSubmittedProposal ? 'Already applied' : 'Send proposal'}
            </Button>
          )}
        </div>
      </div>
    </article>
  );
}
