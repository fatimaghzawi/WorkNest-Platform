import { useCallback, useEffect, useState, type ReactNode } from 'react';
import Pagination from '../../../components/common/Pagination';
import EscrowMoneyCard from './EscrowMoneyCard';
import type { Payment } from '../../../types/payment';
import { paymentsApi } from '../../../api/payments.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import { useToast } from '../../../hooks/useToast';
import '../../../css/Payments.css';

const ESCROW_PAGE_SIZE = 6;

export default function PaginatedEscrowSection({
  title,
  status,
  refreshKey = 0,
  renderActions,
}: {
  title: string;
  status: 'pending' | 'held';
  refreshKey?: number;
  renderActions?: (payment: Payment) => ReactNode;
}) {
  const toast = useToast();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  const loadPayments = useCallback(async () => {
    setLoading(true);
    try {
      const response = await paymentsApi.list({
        status,
        page,
        limit: ESCROW_PAGE_SIZE,
      });
      setPayments(response.data.data);
      setTotalPages(response.data.meta?.totalPages || 1);
    } catch (error) {
      toast.error(getApiErrorMessage(error, 'Failed to load escrow items.'));
      setPayments([]);
    } finally {
      setLoading(false);
    }
  }, [page, status, toast]);

  useEffect(() => {
    setPage(1);
  }, [status, refreshKey]);

  useEffect(() => {
    void loadPayments();
  }, [loadPayments, refreshKey]);

  if (loading && payments.length === 0) {
    return (
      <section className="wn-wallet-section">
        <h2 className="wn-wallet-section__title">{title}</h2>
        <p className="wn-wallet-section__empty">Loading...</p>
      </section>
    );
  }

  if (payments.length === 0) return null;

  return (
    <section className="wn-wallet-section">
      <div className="wn-wallet-section__head">
        <h2 className="wn-wallet-section__title">{title}</h2>
        {totalPages > 1 && (
          <span className="wn-wallet-section__meta">
            Page {page} of {totalPages}
          </span>
        )}
      </div>
      <div className="wn-payments-grid">
        {payments.map((payment) => (
          <div key={payment.id}>
            <EscrowMoneyCard
              amount={payment.amount}
              status={status}
              cardBrand={payment.cardBrand}
              cardLast4={payment.cardLast4}
              cardholderName={payment.cardholderName}
              projectTitle={payment.projectTitle}
            />
            {renderActions?.(payment)}
          </div>
        ))}
      </div>
      {totalPages > 1 && (
        <div className="wn-wallet-section__pagination">
          <Pagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      )}
    </section>
  );
}
