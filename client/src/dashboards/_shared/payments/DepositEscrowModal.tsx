import { useState } from 'react';
import Modal from '../../../components/common/Modal';
import Button from '../../../components/common/Button';
import EscrowMoneyCard from './EscrowMoneyCard';
import { paymentsApi } from '../../../api/payments.api';
import { getApiErrorMessage } from '../../../utils/apiError';
import '../../../css/Payments.css';

type Props = {
  open: boolean;
  projectId: string;
  projectTitle: string;
  amount: number;
  returnPath?: string;
  onClose: () => void;
  onDeposited?: () => void;
};

export default function DepositEscrowModal({
  open,
  projectId,
  projectTitle,
  amount,
  returnPath,
  onClose,
}: Props) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handlePayWithStripe = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await paymentsApi.createCheckoutSession(projectId, returnPath);
      const checkoutUrl = response.data.data?.url;
      if (!checkoutUrl) {
        throw new Error('Stripe checkout URL was not returned.');
      }
      window.location.assign(checkoutUrl);
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start Stripe checkout.'));
      setLoading(false);
    }
  };

  return (
    <Modal open={open} onClose={onClose} title="Deposit to escrow" size="md">
      <div className="wn-deposit-modal">
        <p className="wn-deposit-modal__intro">
          Fund <strong>{projectTitle}</strong> so the freelancer can start work. Funds stay in
          escrow until you accept the completed delivery.
        </p>

        <EscrowMoneyCard
          amount={amount}
          status="pending"
          projectTitle={projectTitle}
        />

        <div className="wn-deposit-modal__stripe">
          <p className="wn-deposit-modal__stripe-copy">
            You will be redirected to Stripe Checkout to pay securely. Card details are never
            stored on WorkNest.
          </p>

          {error && <p className="wn-deposit-modal__error">{error}</p>}

          <div className="wn-deposit-modal__actions">
            <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button type="button" loading={loading} onClick={handlePayWithStripe}>
              Pay {amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' })} with Stripe
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
