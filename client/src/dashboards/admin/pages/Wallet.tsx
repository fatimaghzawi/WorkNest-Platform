import { useCallback, useEffect, useState } from 'react';
import { DollarSign, PiggyBank, TrendingUp, Wallet } from 'lucide-react';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import WalletTransactionRow from '../../_shared/payments/WalletTransactionRow';
import { paymentsApi } from '../../../api/payments.api';
import type { Payment, WalletSummary } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/DesignSystem.css';
import '../../../css/Payments.css';

const emptyWallet: WalletSummary = {
  role: 'admin',
  totalProfit: 0,
  profitThisMonth: 0,
  availableBalance: 0,
};

const PAYMENTS_PAGE_SIZE = 10;

const FEE_TIERS = [
  { range: '$0 – $500', label: 'Small projects', fee: '10% fee' },
  { range: '$501 – $2,000', label: 'Mid-size projects', fee: '8% fee' },
  { range: '$2,001 – $5,000', label: 'Large projects', fee: '6% fee' },
  { range: '$5,001+', label: 'Enterprise projects', fee: '5% fee' },
];

export default function AdminWallet() {
  const toast = useToast();
  const [wallet, setWallet] = useState<WalletSummary>(emptyWallet);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        paymentsApi.wallet(),
        paymentsApi.list({ page, limit: PAYMENTS_PAGE_SIZE }),
      ]);
      setWallet(walletRes.data.data);
      setPayments(historyRes.data.data);
      setTotalPages(historyRes.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load platform wallet.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div className="wn-wallet-studio">
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="Platform wallet"
        subtitle="Track commission earned when escrow is released — on full delivery or pro-rata when a project is cancelled mid-work."
      />

      <div className="wn-wallet-hero">
        <div className="wn-wallet-hero__spotlight wn-wallet-hero__spotlight--admin">
          <p className="wn-wallet-hero__eyebrow">Available balance</p>
          <p className="wn-wallet-hero__balance">{formatCurrency(wallet.availableBalance || 0)}</p>
          <p className="wn-wallet-hero__caption">
            Total platform profit {formatCurrency(wallet.totalProfit || 0)} · This month{' '}
            {formatCurrency(wallet.profitThisMonth || 0)}
          </p>
        </div>

        <div className="wn-wallet-metrics">
          <div className="wn-wallet-metric">
            <span className="wn-wallet-metric__icon">
              <PiggyBank size={18} />
            </span>
            <p className="wn-wallet-metric__label">Total profit</p>
            <p className="wn-wallet-metric__value">{formatCurrency(wallet.totalProfit || 0)}</p>
          </div>
          <div className="wn-wallet-metric">
            <span className="wn-wallet-metric__icon">
              <TrendingUp size={18} />
            </span>
            <p className="wn-wallet-metric__label">This month</p>
            <p className="wn-wallet-metric__value">{formatCurrency(wallet.profitThisMonth || 0)}</p>
          </div>
        </div>
      </div>

      <section className="wn-wallet-section">
        <div className="wn-wallet-section__head">
          <h2 className="wn-wallet-section__title">Commission schedule</h2>
        </div>
        <div className="wn-wallet-fee-grid">
          {FEE_TIERS.map((tier) => (
            <div key={tier.range} className="wn-wallet-fee-card">
              <div>
                <strong>{tier.range}</strong>
                <span>{tier.label}</span>
              </div>
              <Badge variant="info">{tier.fee}</Badge>
            </div>
          ))}
        </div>
      </section>

      <section className="wn-wallet-section">
        <div className="wn-wallet-section__head">
          <h2 className="wn-wallet-section__title">Profit history</h2>
          {totalPages > 1 && (
            <span className="wn-wallet-section__meta">
              Page {page} of {totalPages}
            </span>
          )}
        </div>

        {loading ? (
          <p className="wn-wallet-section__empty">Loading profit history...</p>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No platform profit yet"
            description="When clients accept completed projects, your commission is credited here automatically."
            actionLabel="View projects"
            actionTo="/admin/projects"
          >
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
              <TrendingUp size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              Fees apply on the released share after delivery acceptance or cancel settlement.
            </p>
          </EmptyState>
        ) : (
          <>
            <div className="wn-wallet-tx-list">
              {payments.map((payment) => (
                <WalletTransactionRow
                  key={payment.id}
                  icon={<DollarSign size={18} />}
                  title={payment.projectTitle || 'Project commission'}
                  subtitle={`${payment.budgetRangeLabel || 'Commission'} · ${
                    typeof payment.cancellationProgress === 'number' &&
                    payment.cancellationProgress > 0 &&
                    payment.cancellationProgress < 100
                      ? `cancel ${payment.cancellationProgress}% · released ${formatCurrency(
                          payment.amount - (payment.refundedAmount || 0)
                        )}`
                      : `escrow ${formatCurrency(payment.amount)}`
                  }${payment.releasedAt ? ` · ${formatDateTime(payment.releasedAt)}` : ''}`}
                  amount={payment.platformFee || 0}
                  badge="profit"
                  badgeVariant="success"
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="wn-wallet-section__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
