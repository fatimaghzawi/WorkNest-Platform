import { useEffect } from 'react';
import { paymentsApi } from '../api/payments.api';
import { getApiErrorMessage } from '../utils/apiError';
import { useToast } from './useToast';

export function useCheckoutReturn(onSuccess?: () => void | Promise<void>) {
  const toast = useToast();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const checkout = params.get('checkout');
    if (!checkout) return;

    const projectId = params.get('projectId');
    const sessionId = params.get('session_id');
    let cancelled = false;

    const finish = async () => {
      if (checkout === 'success') {
        if (projectId) {
          try {
            await paymentsApi.confirmCheckout(projectId, sessionId || undefined);
            if (!cancelled) {
              toast.success('Payment confirmed. Escrow is now funded.');
            }
          } catch (error) {
            if (!cancelled) {
              toast.info(
                getApiErrorMessage(
                  error,
                  'Payment received. Escrow will update once Stripe confirms the payment.'
                )
              );
            }
          }
        } else if (!cancelled) {
          toast.success('Payment received.');
        }

        if (!cancelled) {
          await onSuccess?.();
        }
      } else if (checkout === 'cancelled' && !cancelled) {
        toast.info('Payment cancelled. You can try again when ready.');
      }

      if (cancelled) return;

      params.delete('checkout');
      params.delete('projectId');
      params.delete('session_id');
      const query = params.toString();
      const next = query ? `${window.location.pathname}?${query}` : window.location.pathname;
      window.history.replaceState({}, '', next);
    };

    void finish();

    return () => {
      cancelled = true;
    };
  }, [onSuccess, toast]);
}
