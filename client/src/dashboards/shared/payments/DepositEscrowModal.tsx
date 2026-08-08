import { useEffect, useMemo, useState } from 'react';
import { loadStripe, type Stripe } from '@stripe/stripe-js';
import { EmbeddedCheckout, EmbeddedCheckoutProvider } from '@stripe/react-stripe-js';
import Modal from '@/components/Modal';
import Button from '@/components/Button';
import EscrowMoneyCard from '@/dashboards/shared/payments/EscrowMoneyCard';
import { paymentsApi } from '@/api/payments.api';
import { getApiErrorMessage } from '@/utils/apiError';
import '@/styles/Payments.css';

type Props = {
  open: boolean;
  projectId: string;
  projectTitle: string;
  amount: number;
  returnPath?: string;
  onClose: () => void;
  onDeposited?: () => void;
};

type CheckoutPhase = 'ready' | 'checkout' | 'confirming';

let stripePromiseCache: Promise<Stripe | null> | null = null;
let stripePromiseKey = '';

function getStripe(publishableKey: string) {
  if (!publishableKey) return null;
  if (!stripePromiseCache || stripePromiseKey !== publishableKey) {
    stripePromiseKey = publishableKey;
    stripePromiseCache = loadStripe(publishableKey);
  }
  return stripePromiseCache;
}

export default function DepositEscrowModal({
  open,
  projectId,
  projectTitle,
  amount,
  returnPath,
  onClose,
  onDeposited,
}: Props) {
  const [phase, setPhase] = useState<CheckoutPhase>('ready');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [sessionId, setSessionId] = useState('');
  const [publishableKey, setPublishableKey] = useState(
    () => import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || ''
  );

  useEffect(() => {
    if (!open) {
      setPhase('ready');
      setLoading(false);
      setError('');
      setClientSecret('');
      setSessionId('');
    }
  }, [open]);

  const stripePromise = useMemo(
    () => (publishableKey ? getStripe(publishableKey) : null),
    [publishableKey]
  );

  const handleStartCheckout = async () => {
    setError('');
    setLoading(true);
    try {
      const response = await paymentsApi.createCheckoutSession(projectId, returnPath);
      const data = response.data.data;
      const secret = data?.clientSecret;
      const key = data?.publishableKey || import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || '';

      if (!secret) {
        throw new Error('Stripe checkout session was not returned.');
      }
      if (!key) {
        throw new Error(
          'Stripe publishable key is missing. Set VITE_STRIPE_PUBLISHABLE_KEY or STRIPE_PUBLISHABLE_KEY.'
        );
      }

      setClientSecret(secret);
      setSessionId(data.sessionId || '');
      setPublishableKey(key);
      setPhase('checkout');
    } catch (err) {
      setError(getApiErrorMessage(err, 'Failed to start Stripe checkout.'));
    } finally {
      setLoading(false);
    }
  };

  const handleCheckoutComplete = async () => {
    setPhase('confirming');
    setError('');
    try {
      await paymentsApi.confirmCheckout(projectId, sessionId || undefined);
      await onDeposited?.();
      onClose();
    } catch (err) {
      setError(
        getApiErrorMessage(
          err,
          'Payment received. Escrow will update once Stripe confirms the payment.'
        )
      );
      setPhase('checkout');
    }
  };

  const amountLabel = amount.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

  return (
    <Modal
      open={open}
      onClose={phase === 'confirming' ? () => undefined : onClose}
      title={phase === 'checkout' || phase === 'confirming' ? 'Secure checkout' : 'Deposit to escrow'}
      size={phase === 'checkout' || phase === 'confirming' ? 'xl' : 'md'}
    >
      <div className="wn-deposit-modal">
        {phase === 'ready' && (
          <>
            <p className="wn-deposit-modal__intro">
              Fund <strong>{projectTitle}</strong> so the freelancer can start work. Funds stay in
              escrow until you accept the completed delivery.
            </p>

            <EscrowMoneyCard amount={amount} status="pending" projectTitle={projectTitle} />

            <div className="wn-deposit-modal__stripe">
              <p className="wn-deposit-modal__stripe-copy">
                Pay securely with Stripe without leaving WorkNest. Card details are never stored on
                our servers.
              </p>

              {error && <p className="wn-deposit-modal__error">{error}</p>}

              <div className="wn-deposit-modal__actions">
                <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
                  Cancel
                </Button>
                <Button type="button" loading={loading} onClick={handleStartCheckout}>
                  Pay {amountLabel} with Stripe
                </Button>
              </div>
            </div>
          </>
        )}

        {(phase === 'checkout' || phase === 'confirming') && clientSecret && stripePromise && (
          <div className="wn-deposit-modal__embedded">
            {phase === 'confirming' && (
              <p className="wn-deposit-modal__stripe-copy">Confirming your payment…</p>
            )}
            {error && <p className="wn-deposit-modal__error">{error}</p>}
            <EmbeddedCheckoutProvider
              stripe={stripePromise}
              options={{
                clientSecret,
                onComplete: () => {
                  void handleCheckoutComplete();
                },
              }}
            >
              <EmbeddedCheckout />
            </EmbeddedCheckoutProvider>
          </div>
        )}
      </div>
    </Modal>
  );
}
