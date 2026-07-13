import { useCallback, useEffect, useState } from 'react';
import { Shield, Wallet } from 'lucide-react';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import EmptyState from '../../_shared/EmptyState';
import Button from '../../../components/common/Button';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
import EscrowMoneyCard from '../../_shared/payments/EscrowMoneyCard';
import { paymentsApi } from '../../../api/payments.api';
import type { Payment, WalletSummary } from '../../../types/payment';
import { formatCurrency, formatDateTime } from '../../../utils/format';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/DesignSystem.css';
import '../../../css/Payments.css';

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
  const [heldPayments, setHeldPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [walletRes, heldRes, historyRes] = await Promise.all([
        paymentsApi.wallet(),
        paymentsApi.list({ status: 'held', limit: 20 }),
        paymentsApi.list({ status: 'released', page, limit: PAYMENTS_PAGE_SIZE }),
      ]);
      setWallet(walletRes.data.data);
      setHeldPayments(heldRes.data.data);
      setPayments(historyRes.data.data);
      setTotalPages(historyRes.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load wallet.'));
    } finally {
      setLoading(false);
    }
  }, [page, toast]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  return (
    <div>
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

      <div className="wn-stat-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card flat className="wn-stat-card wn-stat-card--purple">
          <CardBody>
            <p className="wn-stat-card__label">Available balance</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.availableBalance || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--amber">
          <CardBody>
            <p className="wn-stat-card__label">Pending in escrow</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.pendingPayouts || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--mint">
          <CardBody>
            <p className="wn-stat-card__label">Total earned</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.totalEarned || 0)}</p>
          </CardBody>
        </Card>
      </div>

      {heldPayments.length > 0 && (
        <section style={{ marginBottom: 'var(--space-4)' }}>
          <h2 className="wn-dash-page__title" style={{ fontSize: '1.15rem', marginBottom: 12 }}>
            Funds in escrow
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
        <CardHeader title="Payout history" subtitle="Released payments from completed projects." />
        <CardBody>
          {loading ? (
            <p>Loading payouts...</p>
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
              {payments.map((payment) => (
              <div key={payment.id} className="wn-payment-tx">
                <div className="wn-payment-tx__copy">
                  <strong>{payment.projectTitle || 'Project payout'}</strong>
                  <span>
                    Released {payment.releasedAt ? formatDateTime(payment.releasedAt) : ''}
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Badge variant="success">released</Badge>
                  <span className="wn-payment-tx__amount">
                    {formatCurrency(payment.freelancerPayout ?? payment.amount)}
                  </span>
                </div>
              </div>
              ))}
              {totalPages > 1 && (
                <div style={{ marginTop: 16 }}>
                  <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
                </div>
              )}
            </>
          )}
        </CardBody>
      </Card>
    </div>
  );
}
