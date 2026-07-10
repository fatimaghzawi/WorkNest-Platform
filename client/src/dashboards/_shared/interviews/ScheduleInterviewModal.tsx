import { useEffect, useState } from 'react';
import { jobsApi } from '../../../api/jobs.api';
import { proposalsApi } from '../../../api/proposals.api';
import Button from '../../../components/common/Button';
import Input from '../../../components/common/Input';
import Modal from '../../../components/common/Modal';
import type { Job } from '../../../types/job';
import type { Proposal } from '../../../types/proposal';
import type { CreateInterviewPayload } from '../../../types/interview';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';

type ProposalOption = {
  proposal: Proposal;
  jobTitle: string;
  freelancerName: string;
};

export type PrefillProposal = {
  proposalId: string;
  jobId: string;
  jobTitle: string;
  freelancerId: string;
  freelancerName: string;
};

export default function ScheduleInterviewModal({
  open,
  onClose,
  onScheduled,
  defaultDate,
  prefill,
  mode = 'client',
}: {
  open: boolean;
  onClose: () => void;
  onScheduled: (payload: CreateInterviewPayload) => Promise<void>;
  defaultDate?: Date;
  prefill?: PrefillProposal | null;
  /** Admin loads platform-wide open/in-progress jobs + proposals. */
  mode?: 'client' | 'admin';
}) {
  const toast = useToast();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [options, setOptions] = useState<ProposalOption[]>([]);
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [proposalId, setProposalId] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('10:00');
  const [duration, setDuration] = useState('30');
  const [meetingLink, setMeetingLink] = useState('');
  const [meetingPassword, setMeetingPassword] = useState('');
  const [notes, setNotes] = useState('');

  useEffect(() => {
    if (!open) return;
    const base = defaultDate ?? new Date();
    setDate(base.toISOString().slice(0, 10));
    setTime('10:00');
    setProposalId(prefill?.proposalId || '');
    setMeetingLink('');
    setMeetingPassword('');
    setNotes('');
  }, [open, defaultDate, prefill]);

  useEffect(() => {
    if (!open) return;

    const load = async () => {
      setLoadingOptions(true);
      try {
        if (prefill) {
          setOptions([
            {
              proposal: {
                _id: prefill.proposalId,
                jobId: prefill.jobId,
                freelancerId: prefill.freelancerId,
                coverLetter: '',
                price: 0,
                timeline: '',
                status: 'pending',
                createdAt: new Date().toISOString(),
              } as Proposal,
              jobTitle: prefill.jobTitle,
              freelancerName: prefill.freelancerName,
            },
          ]);
          setProposalId(prefill.proposalId);
          return;
        }

        if (mode === 'admin') {
          const [pendingRes, acceptedRes, openJobsRes, inProgressJobsRes] = await Promise.all([
            proposalsApi.list({ status: 'pending', limit: 50 }),
            proposalsApi.list({ status: 'accepted', limit: 50 }),
            jobsApi.list({ status: 'open', limit: 50, sort: 'newest' }),
            jobsApi.list({ status: 'in_progress', limit: 50, sort: 'newest' }),
          ]);

          const jobMap = new Map<string, Job>();
          [...openJobsRes.data.data, ...inProgressJobsRes.data.data].forEach((job) => {
            jobMap.set(job._id, job);
          });
          setJobs(Array.from(jobMap.values()));

          const merged = [...pendingRes.data.data, ...acceptedRes.data.data];
          setOptions(
            merged.map((proposal) => {
              const job =
                typeof proposal.jobId === 'object'
                  ? proposal.jobId
                  : jobMap.get(String(proposal.jobId));
              const jobTitle =
                typeof proposal.jobId === 'object'
                  ? proposal.jobId.title
                  : job?.title || 'Job';
              return {
                proposal,
                jobTitle,
                freelancerName:
                  typeof proposal.freelancerId === 'object'
                    ? `${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}`
                    : 'Freelancer',
              };
            })
          );
          return;
        }

        const jobsRes = await jobsApi.getMyJobs({ limit: 50, sort: 'newest' });
        const myJobs = jobsRes.data.data;
        setJobs(myJobs);

        const pairs = await Promise.all(
          myJobs.map(async (job) => {
            try {
              const [pendingRes, acceptedRes] = await Promise.all([
                proposalsApi.getByJob(job._id, { status: 'pending', limit: 50 }),
                proposalsApi.getByJob(job._id, { status: 'accepted', limit: 50 }),
              ]);
              return [...pendingRes.data.data, ...acceptedRes.data.data].map((proposal) => ({
                proposal,
                jobTitle: job.title,
                freelancerName:
                  typeof proposal.freelancerId === 'object'
                    ? `${proposal.freelancerId.firstName} ${proposal.freelancerId.lastName}`
                    : 'Freelancer',
              }));
            } catch {
              return [];
            }
          })
        );

        setOptions(pairs.flat());
      } catch (err) {
        toast.error(getApiErrorMessage(err, 'Failed to load proposals.'));
      } finally {
        setLoadingOptions(false);
      }
    };

    load();
  }, [open, toast, prefill, mode]);

  const selected = options.find((opt) => opt.proposal._id === proposalId);

  const handleSubmit = async () => {
    if (!selected && !prefill) {
      toast.warning('Select a freelancer proposal to schedule with.');
      return;
    }
    if (!date || !time || !meetingLink.trim()) {
      toast.warning('Date, time, and meeting link are required.');
      return;
    }

    const scheduled = new Date(`${date}T${time}`);
    if (Number.isNaN(scheduled.getTime()) || scheduled < new Date()) {
      toast.warning('Pick a future date and time.');
      return;
    }

    const freelancerId = prefill
      ? prefill.freelancerId
      : typeof selected!.proposal.freelancerId === 'object'
        ? selected!.proposal.freelancerId._id
        : String(selected!.proposal.freelancerId);

    const jobId = prefill
      ? prefill.jobId
      : jobs.find(
          (j) =>
            j._id ===
            (typeof selected!.proposal.jobId === 'object'
              ? selected!.proposal.jobId._id
              : selected!.proposal.jobId)
        )?._id ||
        (typeof selected!.proposal.jobId === 'object'
          ? selected!.proposal.jobId._id
          : String(selected!.proposal.jobId));

    setSubmitting(true);
    try {
      await onScheduled({
        jobId,
        proposalId: prefill?.proposalId || selected!.proposal._id,
        freelancerId,
        scheduledDate: scheduled.toISOString(),
        duration: Number(duration),
        meetingLink: meetingLink.trim(),
        meetingPassword: meetingPassword.trim() || undefined,
        notes: notes.trim() || undefined,
      });
      onClose();
    } catch (err) {
      toast.error(getApiErrorMessage(err, 'Failed to schedule interview.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Schedule interview"
      size="lg"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancel
          </Button>
          <Button loading={submitting} onClick={handleSubmit}>
            Schedule meeting
          </Button>
        </>
      }
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <label className="wn-field">
          <span className="wn-field__label">
            Freelancer & job <span className="wn-field__required">*</span>
          </span>
          <select
            className="wn-dash-select"
            style={{ width: '100%' }}
            value={proposalId}
            onChange={(e) => setProposalId(e.target.value)}
            disabled={loadingOptions || Boolean(prefill)}
          >
            <option value="">
              {loadingOptions ? 'Loading proposals...' : 'Select a pending or accepted proposal'}
            </option>
            {options.map((opt) => (
              <option key={opt.proposal._id} value={opt.proposal._id}>
                {opt.freelancerName} — {opt.jobTitle}
                {opt.proposal.status ? ` (${opt.proposal.status})` : ''}
              </option>
            ))}
          </select>
          {!loadingOptions && options.length === 0 && (
            <span className="wn-field__message wn-field__message--helper">
              No pending or accepted proposals found.
            </span>
          )}
        </label>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
          <Input label="Date" type="date" required value={date} onChange={(e) => setDate(e.target.value)} />
          <Input label="Time" type="time" required value={time} onChange={(e) => setTime(e.target.value)} />
          <label className="wn-field">
            <span className="wn-field__label">Duration</span>
            <select className="wn-dash-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
              <option value="30">30 min</option>
              <option value="45">45 min</option>
              <option value="60">60 min</option>
              <option value="90">90 min</option>
            </select>
          </label>
        </div>

        <Input
          label="Meeting link"
          required
          type="url"
          placeholder="https://zoom.us/j/..."
          value={meetingLink}
          onChange={(e) => setMeetingLink(e.target.value)}
        />

        <Input
          label="Meeting password"
          value={meetingPassword}
          onChange={(e) => setMeetingPassword(e.target.value)}
          placeholder="Optional"
        />

        <Input
          as="textarea"
          label="Notes"
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Agenda, preparation, or talking points..."
        />
      </div>
    </Modal>
  );
}
