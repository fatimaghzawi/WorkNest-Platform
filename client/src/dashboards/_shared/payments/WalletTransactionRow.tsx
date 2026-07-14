import type { ReactNode } from 'react';
import Badge from '../../../components/common/Badge';
import { formatCurrency } from '../../../utils/format';
import '../../../css/Payments.css';

export default function WalletTransactionRow({
  title,
  subtitle,
  amount,
  badge,
  badgeVariant = 'info',
  icon,
}: {
  title: string;
  subtitle?: string;
  amount: number;
  badge?: string;
  badgeVariant?: 'success' | 'info' | 'warning' | 'outline' | 'neutral';
  icon?: ReactNode;
}) {
  return (
    <article className="wn-wallet-tx-row">
      {icon && <div className="wn-wallet-tx-row__icon">{icon}</div>}
      <div className="wn-wallet-tx-row__copy">
        <strong>{title}</strong>
        {subtitle && <span>{subtitle}</span>}
      </div>
      <div className="wn-wallet-tx-row__aside">
        {badge && <Badge variant={badgeVariant}>{badge}</Badge>}
        <span className="wn-wallet-tx-row__amount">{formatCurrency(amount)}</span>
      </div>
    </article>
  );
}
