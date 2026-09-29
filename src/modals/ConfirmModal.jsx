import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * ConfirmModal — generic yes/no confirmation dialog.
 * @param {boolean} isOpen
 * @param {string} title
 * @param {string} message
 * @param {string} [confirmLabel='Confirm']
 * @param {'danger'|'primary'|'warning'} [variant='danger']
 * @param {function} onConfirm
 * @param {function} onCancel
 * @param {boolean} [loading=false]
 */
function ConfirmModal({
  isOpen,
  title = 'Are you sure?',
  message,
  confirmLabel = 'Confirm',
  variant = 'danger',
  onConfirm,
  onCancel,
  loading = false,
}) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!isOpen) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  // Close on ESC key press
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !loading) onCancel?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, loading, onCancel]);

  if (!isOpen) return null;

  const iconMap = {
    danger: 'bi-exclamation-triangle-fill text-danger',
    primary: 'bi-question-circle-fill text-primary',
    warning: 'bi-exclamation-circle-fill text-warning',
  };

  return createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        position: 'fixed',
        inset: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: 'rgba(0, 0, 0, 0.55)',
        backdropFilter: 'blur(3px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
      onClick={!loading ? onCancel : undefined}
    >
      <div
        className="bg-white rounded-4 shadow-lg border-0 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '440px',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-modal-title"
      >
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-end p-3 pb-0">
          <button
            type="button"
            className="btn-close p-2"
            onClick={onCancel}
            disabled={loading}
            aria-label="Close"
          />
        </div>

        {/* BODY */}
        <div className="p-4 text-center">
          <i className={`bi ${iconMap[variant] || iconMap.danger} display-4 mb-3 d-inline-block`} />
          <h5 className="fw-bold mb-2 text-dark" id="confirm-modal-title">{title}</h5>
          {message && <p className="text-muted small mb-0">{message}</p>}
        </div>

        {/* FOOTER */}
        <div className="p-4 pt-2 border-0 d-flex justify-content-center gap-2">
          <button
            className="btn btn-outline-secondary px-4 py-2 fw-medium"
            onClick={onCancel}
            disabled={loading}
          >
            Cancel
          </button>
          <button
            className={`btn btn-${variant} px-4 py-2 fw-medium d-inline-flex align-items-center gap-2`}
            onClick={onConfirm}
            disabled={loading}
          >
            {loading && <span className="spinner-border spinner-border-sm" />}
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ConfirmModal;
