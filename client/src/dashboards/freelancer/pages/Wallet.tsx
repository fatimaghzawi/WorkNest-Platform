import { useCallback, useEffect, useState } from 'react';
import { Shield, TrendingUp, Wallet, WalletCards } from 'lucide-react';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import EmptyState from '../../_shared/EmptyState';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import PaginatedEscrowSection from '../../_shared/payments/PaginatedEscrowSection';
import WalletTransactionRow from '../../_shared/payments/WalletTransactionRow';
import FreelancerStudioShell from '../components/FreelancerStudioShell';
import FreelancerOverview from '../components/FreelancerOverview';
import FreelancerStudioPanel from '../components/FreelancerStudioPanel';
import { paymentsApi } from '../../../api/payments.api';
import type { Payment, WalletSummary } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/DesignSystem.css';
import '../../../css/Payments.css';
import '../../../css/FreelancerStudio.css';

const emptyWallet: WalletSummary = {
  role: 'freelancer',
  pendingPayouts: 0,
  totalEarned: 0,
  availableBalance: 0,
  inEscrow: 0,
};

const PAYMENTS_PAGE_SIZE = 10;

export default function FreelancerWallet() {
  const toast = useToast();
  const [wallet, setWallet] = useState<WalletSummary>(emptyWallet);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [payoutTotal, setPayoutTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, historyRes] = await Promise.all([
        paymentsApi.wallet(),
        paymentsApi.list({ status: 'released', page, limit: PAYMENTS_PAGE_SIZE }),
      ]);
      setWallet(walletRes.data.data);
      setPayments(historyRes.data.data);
      setTotalPages(historyRes.data.meta?.totalPages || 1);
      setPayoutTotal(historyRes.data.meta?.total ?? historyRes.data.data.length);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load wallet.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  const earnedPct =
    wallet.totalEarned && wallet.availableBalance
      ? Math.min(100, Math.round((wallet.availableBalance / wallet.totalEarned) * 100))
      : wallet.totalEarned
        ? 100
        : 0;

  return (
    <FreelancerStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Freelancer"
        title="My wallet"
        subtitle="Track escrowed project funds and payouts released after client approval."
        actions={
          <Button to="/freelancer/projects" variant="outline">
            View projects
          </Button>
        }
      />

      <FreelancerOverview
        loading={loading}
        eyebrow="Wallet pulse"
        total={formatCurrency(wallet.availableBalance || 0)}
        headline="Available balance"
        caption={`${formatCurrency(wallet.pendingPayouts || 0)} in escrow · ${formatCurrency(wallet.totalEarned || 0)} lifetime earnings`}
        meterPct={earnedPct}
        tiles={[
          {
            key: 'escrow',
            value: formatCurrency(wallet.pendingPayouts || 0),
            label: 'In escrow',
            hint: 'Awaiting client approval',
            icon: WalletCards,
            tone: 'pending',
          },
          {
            key: 'earned',
            value: formatCurrency(wallet.totalEarned || 0),
            label: 'Total earned',
            hint: 'All released payouts',
            icon: TrendingUp,
            tone: 'confirmed',
          },
          {
            key: 'payouts',
            value: payoutTotal,
            label: 'Payouts',
            hint: 'Released transactions',
            icon: Wallet,
            tone: 'upcoming',
          },
          {
            key: 'balance',
            value: formatCurrency(wallet.availableBalance || 0),
            label: 'Available',
            hint: 'Ready to withdraw',
            icon: Shield,
            tone: 'done',
          },
        ]}
      />

      <PaginatedEscrowSection title="Funds in escrow" status="held" />

      <FreelancerStudioPanel
        title="Payout history"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <p className="wn-wallet-section__empty">Loading payouts...</p>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No payouts yet"
            description="Once a client accepts your delivery, escrow funds are released here."
            actionLabel="Back to dashboard"
            actionTo="/freelancer/dashboard"
          >
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
              <Shield size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              Clients must fund escrow before you can work in the workspace.
            </p>
          </EmptyState>
        ) : (
          <>
            <div className="wn-wallet-tx-list">
              {payments.map((payment) => (
                <WalletTransactionRow
                  key={payment.id}
                  icon={<Wallet size={18} />}
                  title={payment.projectTitle || 'Project payout'}
                  subtitle={
                    typeof payment.cancellationProgress === 'number' &&
                    payment.cancellationProgress > 0 &&
                    payment.cancellationProgress < 100
                      ? `Cancel settlement · ${payment.cancellationProgress}% complete · ${
                          payment.releasedAt ? formatDateTime(payment.releasedAt) : 'released'
                        }`
                      : payment.releasedAt
                        ? `Released ${formatDateTime(payment.releasedAt)}`
                        : 'Released to your balance'
                  }
                  amount={payment.freelancerPayout ?? payment.amount}
                  badge="released"
                  badgeVariant="success"
                />
              ))}
            </div>
            {totalPages > 1 && (
              <div className="wn-freelancer-studio__pagination">
                <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
              </div>
            )}
          </>
        )}
      </FreelancerStudioPanel>
    </FreelancerStudioShell>
  );
}
