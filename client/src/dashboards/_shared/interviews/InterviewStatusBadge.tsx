import Badge from '../../../components/common/Badge';
import type { InterviewStatus } from '../../../types/interview';

const VARIANT: Record<InterviewStatus, 'info' | 'success' | 'outline' | 'error' | 'warning' | 'default'> = {
  scheduled: 'warning',
  confirmed: 'info',
  completed: 'success',
  cancelled: 'outline',
  declined: 'error',
};

const LABEL: Record<InterviewStatus, string> = {
  scheduled: 'Awaiting confirm',
  confirmed: 'Confirmed',
  completed: 'Completed',
  cancelled: 'Cancelled',
  declined: 'Declined',
};

export default function InterviewStatusBadge({ status }: { status: InterviewStatus }) {
  return <Badge variant={VARIANT[status]}>{LABEL[status]}</Badge>;
}
