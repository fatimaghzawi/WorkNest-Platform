import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import ToastContainer from '../components/common/Toast/ToastContainer';
import type { ToastItem, ToastOptions, ToastVariant } from '../types/toast';

const DEFAULT_DURATION = 4500;
const MAX_TOASTS = 4;

interface ToastApi {
  show: (message: string, variant: ToastVariant, options?: ToastOptions) => void;
  success: (message: string, options?: ToastOptions) => void;
  error: (message: string, options?: ToastOptions) => void;
  info: (message: string, options?: ToastOptions) => void;
  warning: (message: string, options?: ToastOptions) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

let toastCounter = 0;

const createToastId = () => {
  toastCounter += 1;
  return `toast-${toastCounter}-${Date.now()}`;
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const show = useCallback((message: string, variant: ToastVariant, options?: ToastOptions) => {
    const nextToast: ToastItem = {
      id: createToastId(),
      message,
      variant,
      title: options?.title,
      duration: options?.duration ?? DEFAULT_DURATION,
    };

    setToasts((current) => [...current, nextToast].slice(-MAX_TOASTS));
  }, []);

  const value = useMemo<ToastApi>(
    () => ({
      show,
      success: (message, options) => show(message, 'success', options),
      error: (message, options) => show(message, 'error', options),
      info: (message, options) => show(message, 'info', options),
      warning: (message, options) => show(message, 'warning', options),
      dismiss,
    }),
    [dismiss, show]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within ToastProvider');
  }
  return context;
}
