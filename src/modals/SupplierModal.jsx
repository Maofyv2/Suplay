import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * SupplierModal — displays supplier information and contact actions.
 * @param {object} supplier - The supplier to display (or null to hide).
 * @param {function} onClose - Callback to close the modal.
 */
function SupplierModal({ supplier, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!supplier) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [supplier]);

  // Close on ESC key press
  useEffect(() => {
    if (!supplier) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [supplier, onClose]);

  if (!supplier) return null;

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
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg border-0 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '560px',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="supplier-modal-title"
      >
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom bg-light bg-opacity-50">
          <h5 className="modal-title fw-bold mb-0 text-dark" id="supplier-modal-title">Supplier Details</h5>
          <button
            type="button"
            className="btn-close p-2"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          {/* Logo & Name */}
          <div className="d-flex align-items-center gap-3 mb-4">
            <div
              className="d-flex align-items-center justify-content-center rounded-3 bg-light flex-shrink-0"
              style={{ width: 64, height: 64 }}
            >
              {supplier.logo ? (
                <img src={supplier.logo} alt={supplier.name} className="img-fluid rounded-3" />
              ) : (
                <i className="bi bi-building text-primary fs-3" />
              )}
            </div>
            <div>
              <div className="d-flex align-items-center gap-2">
                <h5 className="fw-bold mb-0 text-dark">{supplier.name}</h5>
                {supplier.verified && (
                  <i className="bi bi-patch-check-fill text-success fs-6" title="Verified Supplier" />
                )}
              </div>
              <span className="badge bg-primary-subtle text-primary mt-1">{supplier.category}</span>
            </div>
          </div>

          <p className="text-muted mb-4 small lh-base">{supplier.description}</p>

          {/* Stats */}
          <div className="row g-2 mb-4">
            <div className="col-4 text-center">
              <div className="p-3 bg-light rounded-3">
                <p className="fw-bold text-dark mb-0 fs-6">{supplier.rating}</p>
                <p className="small text-muted mb-0">Rating</p>
              </div>
            </div>
            <div className="col-4 text-center">
              <div className="p-3 bg-light rounded-3">
                <p className="fw-bold text-dark mb-0 fs-6">{supplier.totalProducts}</p>
                <p className="small text-muted mb-0">Products</p>
              </div>
            </div>
            <div className="col-4 text-center">
              <div className="p-3 bg-light rounded-3">
                <p className="fw-bold text-dark mb-0 fs-6">{supplier.joinedAt}</p>
                <p className="small text-muted mb-0">Joined</p>
              </div>
            </div>
          </div>

          {/* Contact & Actions */}
          <div className="d-flex flex-column gap-2 pt-2">
            <a href={`mailto:${supplier.email}`} className="btn btn-primary py-2 fw-medium d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-envelope fs-6" />Send Email
            </a>
            <a href={`tel:${supplier.phone}`} className="btn btn-outline-primary py-2 fw-medium d-flex align-items-center justify-content-center gap-2">
              <i className="bi bi-telephone fs-6" />Call Supplier
            </a>
            <button type="button" className="btn btn-outline-secondary py-2 fw-medium mt-1" onClick={onClose}>
              Close
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default SupplierModal;
