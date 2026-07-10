import type { ProjectStatus } from '../../../api/projects.api';

export function projectStatusLabel(status: ProjectStatus) {
  switch (status) {
    case 'active':
      return 'Active';
    case 'pending_review':
      return 'Awaiting review';
    case 'completed':
      return 'Completed';
    case 'cancelled':
      return 'Cancelled';
    default:
      return status;
  }
}

export function projectStatusBadgeVariant(
  status: ProjectStatus
): 'default' | 'success' | 'warning' | 'error' | 'info' | 'outline' {
  switch (status) {
    case 'active':
      return 'info';
    case 'pending_review':
      return 'warning';
    case 'completed':
      return 'success';
    case 'cancelled':
      return 'outline';
    default:
      return 'default';
  }
}
