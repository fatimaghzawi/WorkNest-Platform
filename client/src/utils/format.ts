export const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(
    amount
  );

export const formatDate = (value: string) =>
  new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

export const formatDateTime = (value: string) =>
  new Date(value).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });

export const formatStatusLabel = (status: string) =>
  status
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');

export type DeadlineUrgency = 'overdue' | 'urgent' | 'soon' | 'normal';

export const getDeadlineUrgency = (value: string): { label: string; level: DeadlineUrgency } => {
  const diffMs = new Date(value).setHours(23, 59, 59, 999) - new Date().getTime();
  const days = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (days < 0) return { label: 'Deadline passed', level: 'overdue' };
  if (days === 0) return { label: 'Due today', level: 'urgent' };
  if (days === 1) return { label: '1 day left', level: 'urgent' };
  if (days <= 3) return { label: `${days} days left`, level: 'urgent' };
  if (days <= 7) return { label: `${days} days left`, level: 'soon' };
  return { label: `${days} days left`, level: 'normal' };
};

export const getInitials = (name: string) =>
  name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join('');
