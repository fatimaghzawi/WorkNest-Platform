import { createPortal } from 'react-dom';
import type { ToastItem as ToastRecord } from '../../../types/toast';
import ToastItem from './ToastItem';
import '../../../css/Toast.css';

export default function ToastContainer({
  toasts,
  onDismiss,
}: {
  toasts: ToastRecord[];
  onDismiss: (id: string) => void;
}) {
  if (!toasts.length) return null;

  return createPortal(
    <div className="wn-toast-viewport" aria-label="Notifications">
      {toasts.map((toast) => (
        <ToastItem key={toast.id} toast={toast} onDismiss={onDismiss} />
      ))}
    </div>,
    document.body
  );
}
