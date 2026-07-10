export type ToastVariant = 'success' | 'error' | 'info' | 'warning';

export interface ToastItem {
  id: string;
  message: string;
  variant: ToastVariant;
  title?: string;
  duration: number;
}

export interface ToastOptions {
  title?: string;
  duration?: number;
}
