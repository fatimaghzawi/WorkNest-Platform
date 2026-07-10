import { useCallback, useEffect, useState } from 'react';
import { Shield, Wallet } from 'lucide-react';
import DashboardPageHeader from '../DashboardPageHeader';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import EmptyState from '../EmptyState';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import EscrowMoneyCard from './EscrowMoneyCard';
import DepositEscrowModal from './DepositEscrowModal';
import { paymentsApi } from '../../../api/payments.api';
import type { Payment, WalletSummary } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import { useCheckoutReturn } from '../../../hooks/useCheckoutReturn';
import '../../../css/DesignSystem.css';
import '../../../css/Payments.css';

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
  const [pendingPayments, setPendingPayments] = useState<Payment[]>([]);
  const [heldPayments, setHeldPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [depositTarget, setDepositTarget] = useState<Payment | null>(null);
  const [syncingId, setSyncingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, pendingRes, heldRes, historyRes] = await Promise.all([
        paymentsApi.wallet(),
        paymentsApi.list({ status: 'pending', limit: 20 }),
        paymentsApi.list({ status: 'held', limit: 20 }),
        paymentsApi.list({ page, limit: PAYMENTS_PAGE_SIZE }),
      ]);
      setWallet(walletRes.data.data);
      setPendingPayments(pendingRes.data.data);
      setHeldPayments(heldRes.data.data);
      setPayments(historyRes.data.data);
      setTotalPages(historyRes.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load payments.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  useCheckoutReturn(loadData);

  const handleSyncPayment = async (payment: Payment) => {
    setSyncingId(payment.id);
    try {
      await paymentsApi.confirmCheckout(payment.projectId);
      toast.success('Payment synced. Escrow is now funded.');
      await loadData();
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Could not sync payment status yet.'));
    } finally {
      setSyncingId(null);
    }
  };

  return (
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Payments"
        title="Billing & escrow"
        subtitle="Deposit funds when you accept a proposal. Money stays in escrow until you approve the completed project."
        actions={
          <Button to="/client/projects" variant="outline">
            View projects
          </Button>
        }
      />

      <div className="wn-stat-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card flat className="wn-stat-card wn-stat-card--amber">
          <CardBody>
            <p className="wn-stat-card__label">Awaiting deposit</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.pendingDeposit || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--purple">
          <CardBody>
            <p className="wn-stat-card__label">In escrow</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.inEscrow || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--mint">
          <CardBody>
            <p className="wn-stat-card__label">Released to freelancers</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.completedPayouts || 0)}</p>
          </CardBody>
        </Card>
      </div>

      {pendingPayments.length > 0 && (
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="wn-dash-page__title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
            Deposit required
          </h2>
          <div className="wn-payments-grid">
            {pendingPayments.map((payment) => (
              <div key={payment.id}>
                <EscrowMoneyCard
                  amount={payment.amount}
                  status="pending"
                  projectTitle={payment.projectTitle}
                />
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
              </div>
            ))}
          </div>
        </section>
      )}

      {heldPayments.length > 0 && (
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="wn-dash-page__title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
            Active escrow
          </h2>
          <div className="wn-payments-grid">
            {heldPayments.map((payment) => (
              <EscrowMoneyCard
                key={payment.id}
                amount={payment.amount}
                status="held"
                cardBrand={payment.cardBrand}
                cardLast4={payment.cardLast4}
                cardholderName={payment.cardholderName}
                projectTitle={payment.projectTitle}
              />
            ))}
          </div>
        </section>
      )}

      <Card>
        <CardHeader title="Transaction history" subtitle="Deposits, escrow holds, and releases." />
        <CardBody>
          {loading ? (
            <p>Loading transactions...</p>
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
                Funds are released only after you accept project delivery.
              </p>
            </EmptyState>
          ) : (
            payments.map((payment) => (
              <div key={payment.id} className="wn-payment-tx">
                <div className="wn-payment-tx__copy">
                  <strong>{payment.projectTitle || 'Project payment'}</strong>
                  <span>
                    {payment.status === 'pending' && 'Awaiting deposit'}
                    {payment.status === 'held' && 'Held in escrow'}
                    {payment.status === 'released' && 'Released to freelancer'}
                    {payment.status === 'refunded' && 'Refunded to client'}
                    {payment.depositedAt ? ` · ${formatDateTime(payment.depositedAt)}` : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge
                    variant={
                      payment.status === 'released'
                        ? 'success'
                        : payment.status === 'refunded'
                          ? 'outline'
                        : payment.status === 'held'
                          ? 'info'
                          : 'warning'
                    }
                  >
                    {payment.status}
                  </Badge>
                  <span className="wn-payment-tx__amount">{formatCurrency(payment.amount)}</span>
                </div>
              </div>
            ))
          )}
          {totalPages > 1 && (
            <div style={{ marginTop: 16 }}>
              <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
            </div>
          )}
        </CardBody>
      </Card>

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
    </div>
  );
}
