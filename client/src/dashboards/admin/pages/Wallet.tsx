import { useCallback, useEffect, useState } from 'react';
import { DollarSign, TrendingUp, Wallet } from 'lucide-react';
import DashboardPageHeader from '../../_shared/DashboardPageHeader';
import Card, { CardBody, CardHeader } from '../../../components/common/Card';
import EmptyState from '../../_shared/EmptyState';
import Badge from '../../../components/common/Badge';
import Pagination from '../../../components/common/Pagination';
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
    <div>
      <DashboardPageHeader
        hero
        eyebrow="Admin"
        title="Platform wallet"
        subtitle="Track commission earned when clients complete projects. Fees are based on each job's budget range."
      />

      <div className="wn-stat-grid" style={{ marginBottom: 'var(--space-4)' }}>
        <Card flat className="wn-stat-card wn-stat-card--purple">
          <CardBody>
            <p className="wn-stat-card__label">Total platform profit</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.totalProfit || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--amber">
          <CardBody>
            <p className="wn-stat-card__label">Profit this month</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.profitThisMonth || 0)}</p>
          </CardBody>
        </Card>
        <Card flat className="wn-stat-card wn-stat-card--mint">
          <CardBody>
            <p className="wn-stat-card__label">Available balance</p>
            <p className="wn-stat-card__value">{formatCurrency(wallet.availableBalance || 0)}</p>
          </CardBody>
        </Card>
      </div>

      <Card style={{ marginBottom: 'var(--space-4)' }}>
        <CardHeader
          title="Commission schedule"
          subtitle="Platform fee is calculated from the job budget range when a project is completed."
        />
        <CardBody>
          <div className="wn-payment-tx">
            <div className="wn-payment-tx__copy">
              <strong>$0 – $500</strong>
              <span>Small projects</span>
            </div>
            <Badge variant="info">10% fee</Badge>
          </div>
          <div className="wn-payment-tx">
            <div className="wn-payment-tx__copy">
              <strong>$501 – $2,000</strong>
              <span>Mid-size projects</span>
            </div>
            <Badge variant="info">8% fee</Badge>
          </div>
          <div className="wn-payment-tx">
            <div className="wn-payment-tx__copy">
              <strong>$2,001 – $5,000</strong>
              <span>Large projects</span>
            </div>
            <Badge variant="info">6% fee</Badge>
          </div>
          <div className="wn-payment-tx">
            <div className="wn-payment-tx__copy">
              <strong>$5,001+</strong>
              <span>Enterprise projects</span>
            </div>
            <Badge variant="info">5% fee</Badge>
          </div>
        </CardBody>
      </Card>

      <Card>
        <CardHeader title="Profit history" subtitle="Commission collected from completed projects." />
        <CardBody>
          {loading ? (
            <p>Loading profit history...</p>
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
                Fees apply only after escrow is released on project completion.
              </p>
            </EmptyState>
          ) : (
            <>
              {payments.map((payment) => (
                <div key={payment.id} className="wn-payment-tx">
                  <div className="wn-payment-tx__copy">
                    <strong>{payment.projectTitle || 'Project commission'}</strong>
                    <span>
                      {payment.budgetRangeLabel || 'Commission'} · escrow{' '}
                      {formatCurrency(payment.amount)}
                      {payment.releasedAt ? ` · ${formatDateTime(payment.releasedAt)}` : ''}
                    </span>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <Badge variant="success">profit</Badge>
                    <span className="wn-payment-tx__amount">
                      <DollarSign size={14} style={{ verticalAlign: -2 }} />
                      {formatCurrency(payment.platformFee || 0)}
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
