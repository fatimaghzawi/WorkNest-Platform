import { formatStatusLabel } from '../../utils/format';
import '../../css/DashboardFeatures.css';

type BadgeKind = 'job' | 'proposal' | 'category';

const STATUS_CLASS: Record<string, string> = {
  open: 'open',
  closed: 'closed',
  in_progress: 'in_progress',
  pending: 'pending',
  accepted: 'accepted',
  rejected: 'rejected',
  active: 'active',
  inactive: 'inactive',
};

function isTruthyActive(value: string | boolean) {
  return value === true || value === 'true';
}

export default function StatusBadge({
  status,
  kind = 'job',
}: {
  status: string | boolean;
  kind?: BadgeKind;
}) {
  const normalized =
    kind === 'category'
      ? isTruthyActive(status)
        ? 'active'
        : 'inactive'
      : String(status);
  const badgeClass = STATUS_CLASS[normalized] || 'inactive';
  const label =
    kind === 'category'
      ? isTruthyActive(status)
        ? 'Active'
        : 'Inactive'
      : formatStatusLabel(String(status));

  return <span className={`wn-dash-badge wn-dash-badge--${badgeClass}`}>{label}</span>;
}
