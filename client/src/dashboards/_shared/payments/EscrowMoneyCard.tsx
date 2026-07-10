import { formatCurrency } from '../../../utils/format';
import '../../../css/Payments.css';

type Props = {
  amount: number;
  currency?: string;
  status: 'pending' | 'held' | 'released' | 'refunded';
  cardBrand?: string;
  cardLast4?: string;
  cardholderName?: string;
  projectTitle?: string;
  compact?: boolean;
};

const STATUS_LABELS = {
  pending: 'Awaiting deposit',
  held: 'In escrow',
  released: 'Released',
  refunded: 'Refunded',
};

export default function EscrowMoneyCard({
  amount,
  currency = 'USD',
  status,
  cardBrand,
  cardLast4,
  cardholderName,
  projectTitle,
  compact = false,
}: Props) {
  const displayAmount = formatCurrency(amount);
  const maskedName = cardholderName?.toUpperCase() || 'WORKNEST CLIENT';
  const brand = cardBrand || 'WorkNest';
  const last4 = cardLast4 || '••••';

  return (
    <div className={`wn-money-card ${compact ? 'wn-money-card--compact' : ''}`}>
      <div className="wn-money-card__chip" aria-hidden />
      <div className="wn-money-card__top">
        <span className="wn-money-card__brand">{brand}</span>
        <span className={`wn-money-card__status wn-money-card__status--${status}`}>
          {STATUS_LABELS[status]}
        </span>
      </div>
      <p className="wn-money-card__amount">{displayAmount}</p>
      <p className="wn-money-card__currency">{currency} · Secured escrow</p>
      {projectTitle && !compact && (
        <p className="wn-money-card__project">{projectTitle}</p>
      )}
      <div className="wn-money-card__footer">
        <div>
          <span className="wn-money-card__label">Cardholder</span>
          <strong>{maskedName}</strong>
        </div>
        <div>
          <span className="wn-money-card__label">Card</span>
          <strong>•••• {last4}</strong>
        </div>
      </div>
    </div>
  );
}
