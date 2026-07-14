import { useCallback, useEffect, useState } from 'react';
import { Clock, Shield, Wallet, WalletCards } from 'lucide-react';
import DashboardPageHeader from '../DashboardPageHeader';
import EmptyState from '../EmptyState';
import Button from '../../../components/common/Button';
import Pagination from '../../../components/common/Pagination';
import PaginatedEscrowSection from './PaginatedEscrowSection';
import WalletTransactionRow from './WalletTransactionRow';
import DepositEscrowModal from './DepositEscrowModal';
import DashboardStudioShell from '../studio/DashboardStudioShell';
import DashboardOverview from '../studio/DashboardOverview';
import DashboardStudioPanel from '../studio/DashboardStudioPanel';
import { paymentsApi } from '../../../api/payments.api';
import type { Payment, WalletSummary } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useCheckoutReturn } from '../../../hooks/useCheckoutReturn';
import '../../../css/DesignSystem.css';
import '../../../css/Payments.css';
import '../../../css/FreelancerStudio.css';

const emptyWallet: WalletSummary = {
  role: 'client',
  pendingDeposit: 0,
  inEscrow: 0,
  completedPayouts: 0,
  availableBalance: 0,
};

const PAYMENTS_PAGE_SIZE = 10;

export default function PaymentsPage() {
  const toast = useToast();
  const [wallet, setWallet] = useState<WalletSummary>(emptyWallet);
  const [payments, setPayments] = useState<Payment[]>([]);
  const [txTotal, setTxTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [depositTarget, setDepositTarget] = useState<Payment | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);

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
      setTxTotal(historyRes.data.meta?.total ?? historyRes.data.data.length);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load payments.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const refreshAll = useCallback(async () => {
    setRefreshKey((current) => current + 1);
    await loadData();
  }, [loadData]);

  useCheckoutReturn(refreshAll);

  const handleSyncPayment = async (payment: Payment) => {
    setSyncingId(payment.id);
    try {
      await paymentsApi.confirmCheckout(payment.projectId);
      toast.success('Payment synced. Escrow is now funded.');
      await refreshAll();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not sync payment status yet.'));
    } finally {
      setSyncingId(null);
    }
  };

  const statusLabel = (payment: Payment) => {
    if (payment.status === 'pending') return 'Awaiting deposit';
    if (payment.status === 'held') return 'Held in escrow';
    if (
      payment.status === 'released' &&
      typeof payment.cancellationProgress === 'number' &&
      payment.cancellationProgress > 0 &&
      (payment.refundedAmount ?? 0) > 0
    ) {
      return `Partial release (${payment.cancellationProgress}% paid · refund ${formatCurrency(payment.refundedAmount || 0)})`;
    }
    if (payment.status === 'released') return 'Released to freelancer';
    return 'Refunded to client';
  };

  const statusBadge = (status: Payment['status']) => {
    if (status === 'released') return 'success' as const;
    if (status === 'refunded') return 'outline' as const;
    if (status === 'held') return 'info' as const;
    return 'warning' as const;
  };

  const escrowFocus =
    (wallet.inEscrow || 0) + (wallet.pendingDeposit || 0) > 0
      ? Math.min(
          100,
          Math.round(
            ((wallet.inEscrow || 0) /
              Math.max((wallet.inEscrow || 0) + (wallet.pendingDeposit || 0), 1)) *
              100
          )
        )
      : 0;

  return (
    <DashboardStudioShell>
      <DashboardPageHeader
        hero
        eyebrow="Payments"
        title="Billing & escrow"
        subtitle="Deposit funds when you accept a proposal. Money stays in escrow until you approve delivery — or is settled by task progress if you cancel."
        actions={
          <Button to="/client/projects" variant="outline">
            View projects
          </Button>
        }
      />

      <DashboardOverview
        loading={loading && payments.length === 0}
        eyebrow="Escrow pulse"
        total={formatCurrency(wallet.inEscrow || 0)}
        headline="Currently in escrow"
        caption={`${formatCurrency(wallet.pendingDeposit || 0)} awaiting deposit · ${formatCurrency(wallet.completedPayouts || 0)} released`}
        meterPct={escrowFocus}
        tiles={[
          {
            key: 'pending',
            value: formatCurrency(wallet.pendingDeposit || 0),
            label: 'Awaiting deposit',
            hint: 'Fund before work starts',
            icon: Clock,
            tone: 'pending',
          },
          {
            key: 'held',
            value: formatCurrency(wallet.inEscrow || 0),
            label: 'In escrow',
            hint: 'Protected until approval',
            icon: WalletCards,
            tone: 'upcoming',
          },
          {
            key: 'released',
            value: formatCurrency(wallet.completedPayouts || 0),
            label: 'Released',
            hint: 'Paid to freelancers',
            icon: Wallet,
            tone: 'confirmed',
          },
          {
            key: 'tx',
            value: txTotal,
            label: 'Transactions',
            hint: 'All payment records',
            icon: Shield,
            tone: 'done',
          },
        ]}
      />

      <PaginatedEscrowSection
        title="Deposit required"
        status="pending"
        refreshKey={refreshKey}
        renderActions={(payment) => (
          <div style={{ marginTop: 12, display: 'grid', gap: 8 }}>
            <Button fullWidth onClick={() => setDepositTarget(payment)}>
              Deposit to escrow
            </Button>
            <Button
              fullWidth
              variant="outline"
              loading={syncingId === payment.id}
              onClick={() => handleSyncPayment(payment)}
            >
              Already paid? Sync status
            </Button>
          </div>
        )}
      />

      <PaginatedEscrowSection title="Active escrow" status="held" refreshKey={refreshKey} />

      <DashboardStudioPanel
        title="Transaction history"
        meta={totalPages > 1 ? `Page ${page} of ${totalPages}` : undefined}
      >
        {loading ? (
          <p className="wn-wallet-section__empty">Loading transactions...</p>
        ) : payments.length === 0 ? (
          <EmptyState
            icon={Wallet}
            title="No transactions yet"
            description="When you accept a proposal, deposit the contract amount here to fund escrow."
            actionLabel="Back to dashboard"
            actionTo="/client/dashboard"
          >
            <p style={{ fontSize: 13, color: 'var(--color-text-muted)', marginTop: 8 }}>
              <Shield size={14} style={{ verticalAlign: -2, marginRight: 4 }} />
              Funds are released after you accept delivery, or pro-rata by progress if you cancel.
            </p>
          </EmptyState>
        ) : (
          <>
            <div className="wn-wallet-tx-list">
              {payments.map((payment) => (
                <WalletTransactionRow
                  key={payment.id}
                  icon={<Wallet size={18} />}
                  title={payment.projectTitle || 'Project payment'}
                  subtitle={`${statusLabel(payment)}${
                    payment.depositedAt ? ` · ${formatDateTime(payment.depositedAt)}` : ''
                  }`}
                  amount={
                    payment.status === 'released' && (payment.refundedAmount ?? 0) > 0
                      ? payment.amount - (payment.refundedAmount || 0)
                      : payment.amount
                  }
                  badge={payment.status}
                  badgeVariant={statusBadge(payment.status)}
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
      </DashboardStudioPanel>

      {depositTarget && (
        <DepositEscrowModal
          open={Boolean(depositTarget)}
          projectId={depositTarget.projectId}
          projectTitle={depositTarget.projectTitle || 'Project'}
          amount={depositTarget.amount}
          returnPath="/client/payments"
          onClose={() => setDepositTarget(null)}
        />
      )}
    </DashboardStudioShell>
  );
}
