import type { Interview, InterviewJob } from '../types/interview';

type PopulatedJobRef = { title?: string };

function isPopulatedJobRef(value: unknown): value is PopulatedJobRef {
  return Boolean(value && typeof value === 'object' && 'title' in value);
}

/** Resolve job title from flattened or populated interview payloads. */
export function getInterviewJobTitle(interview: {
  jobTitle?: string;
  jobId?: string | InterviewJob;
}): string {
  const flat = interview.jobTitle?.trim();
  if (flat) return flat;

  const { jobId } = interview;
  if (isPopulatedJobRef(jobId) && jobId.title?.trim()) {
    return jobId.title.trim();
  }

  return 'Untitled job';
}

/** Normalize API interview records for UI consumption. */
export function normalizeInterview(raw: Interview): Interview {
  const id = raw.id || raw._id || '';
  const jobId =
    typeof raw.jobId === 'object' && raw.jobId !== null && '_id' in raw.jobId
      ? String((raw.jobId as { _id: string })._id)
      : String(raw.jobId ?? '');

  return {
    ...raw,
    id: String(id),
    _id: raw._id ? String(raw._id) : String(id),
    jobId,
    jobTitle: getInterviewJobTitle(raw),
    clientName: raw.clientName?.trim() || 'Client',
    freelancerName: raw.freelancerName?.trim() || 'Freelancer',
  };
}
