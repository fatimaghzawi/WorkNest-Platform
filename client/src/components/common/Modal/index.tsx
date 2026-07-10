import { useEffect, useId, type ReactNode } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import '../../../css/DesignSystem.css';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  footer?: ReactNode;
  size?: 'md' | 'lg' | 'xl';
  closeOnOverlay?: boolean;
  ariaLabel?: string;
  /** Render only overlay + children (for feature-rich dialogs like job detail). */
  bare?: boolean;
  ariaLabelledBy?: string;
}

export default function Modal({
  open,
  onClose,
  title,
  children,
  footer,
  size = 'md',
  closeOnOverlay = true,
  ariaLabel,
  bare = false,
  ariaLabelledBy,
}: ModalProps) {
  const titleId = useId();

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [open, onClose]);

  if (!open) return null;

  const sizeClass =
    size === 'xl' ? 'wn-modal--xl' : size === 'lg' ? 'wn-modal--lg' : '';

  if (bare) {
    return createPortal(
      <div
        className="wn-modal-overlay"
        role="presentation"
        onClick={closeOnOverlay ? onClose : undefined}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={ariaLabelledBy}
          aria-label={ariaLabel}
          onClick={(event) => event.stopPropagation()}
        >
          {children}
        </div>
      </div>,
      document.body
    );
  }

  return createPortal(
    <div
      className="wn-modal-overlay"
      role="presentation"
      onClick={closeOnOverlay ? onClose : undefined}
    >
      <div
        className={`wn-modal ${sizeClass}`.trim()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        onClick={(event) => event.stopPropagation()}
      >
        {(title || closeOnOverlay) && (
          <div className="wn-modal__header">
            {title ? (
              <h2 id={titleId} className="wn-modal__title">
                {title}
              </h2>
            ) : (
              <span />
            )}
            <button
              type="button"
              className="wn-modal__close"
              onClick={onClose}
              aria-label="Close dialog"
            >
              <X size={18} />
            </button>
          </div>
        )}

        <div className="wn-modal__body">{children}</div>

        {footer && <div className="wn-modal__footer">{footer}</div>}
      </div>
    </div>,
    document.body
  );
}
