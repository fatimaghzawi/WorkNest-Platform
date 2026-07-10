import type { UserRole } from '../types/auth';
import type { Notification } from '../types/notification';

export function getNotificationHref(notification: Notification, role: UserRole): string {
  const prefix =
    role === 'client' ? '/client' : role === 'freelancer' ? '/freelancer' : '/admin';

  if (notification.type.startsWith('proposal.')) {
    if (role === 'client' && notification.relatedJobId) {
      return `${prefix}/jobs/${notification.relatedJobId}/proposals`;
    }
    return `${prefix}/proposals`;
  }

  if (
    notification.type.startsWith('project.') ||
    notification.type.startsWith('workspace.')
  ) {
    if (notification.relatedJobId) {
      return `${prefix}/workspace?jobId=${notification.relatedJobId}`;
    }
    return `${prefix}/workspace`;
  }

  if (notification.type.startsWith('interview.')) {
    return `${prefix}/interviews`;
  }

  if (notification.type.startsWith('payment.')) {
    if (notification.relatedJobId) {
      return role === 'client' ? `${prefix}/payments` : `${prefix}/wallet`;
    }
    return role === 'client' ? `${prefix}/payments` : `${prefix}/wallet`;
  }

  return `${prefix}/dashboard`;
}

export function formatNotificationTime(iso?: string) {
  if (!iso) return '';
  const date = new Date(iso);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;

  const diffHours = Math.floor(diffMins / 60);
  if (diffHours < 24) return `${diffHours}h ago`;

  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
