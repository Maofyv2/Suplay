import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { formatPrice } from '../utils/formatPrice';
import OrderTimeline from '../components/common/OrderTimeline';

/**
 * OrderDetailsModal — concise order summary dialog.
 * @param {object|null} order - The order to display.
 * @param {function} onClose
 */
function OrderDetailsModal({ order, onClose }) {
  // Lock body scroll while modal is open
  useEffect(() => {
    if (!order) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [order]);

  // Close on ESC key press
  useEffect(() => {
    if (!order) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose?.();
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [order, onClose]);

  if (!order) return null;

  const statusColor = {
    pending: 'bg-warning-subtle text-warning',
    processing: 'bg-info-subtle text-info',
    shipped: 'bg-primary-subtle text-primary',
    delivered: 'bg-success-subtle text-success',
    cancelled: 'bg-danger-subtle text-danger',
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
      onClick={onClose}
    >
      <div
        className="bg-white rounded-4 shadow-lg border-0 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '620px',
          maxHeight: '90vh',
          overflow: 'hidden',
          position: 'relative',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="order-modal-title"
      >
        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between p-4 pb-3 border-bottom bg-light bg-opacity-50">
          <div>
            <h5 className="modal-title fw-bold mb-1 text-dark" id="order-modal-title">
              Order #{order.id}
            </h5>
            <span className={`badge rounded-pill px-3 py-1 small ${statusColor[order.status] || ''}`}>
              {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
            </span>
          </div>
          <button
            type="button"
            className="btn-close p-2"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* BODY */}
        <div className="p-4 overflow-y-auto flex-grow-1">
          {/* Tracking Timeline */}
          <div className="mb-3 p-2 bg-light rounded-3 border">
            <h6 className="fw-semibold small text-muted text-uppercase mb-1 ps-2">Tracking Status</h6>
            <OrderTimeline status={order.status} />
          </div>

          {/* Meta */}
          <div className="d-flex justify-content-between text-muted small mb-3 p-2 bg-light rounded-3">
            <span><i className="bi bi-calendar3 me-1" />{order.createdAt}</span>
            <span><i className="bi bi-truck me-1" />{order.supplierName}</span>
          </div>

          {/* Items */}
          <div className="mb-4">
            <h6 className="fw-semibold mb-2 text-dark">Items</h6>
            {order.items.map((item) => (
              <div key={item.productId} className="d-flex justify-content-between align-items-start py-2 border-bottom">
                <div>
                  <p className="mb-0 small fw-medium text-dark">{item.name}</p>
                  <p className="mb-0 text-muted small">Qty: {item.qty} × {formatPrice(item.unitPrice)}</p>
                </div>
                <span className="fw-semibold small text-dark">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>

          {/* Totals */}
          <div className="p-3 bg-light rounded-3 mb-3">
            <div className="d-flex justify-content-between small mb-1">
              <span className="text-muted">Subtotal</span>
              <span className="text-dark fw-medium">{formatPrice(order.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between small mb-2">
              <span className="text-muted">Shipping</span>
              <span className="text-dark fw-medium">{formatPrice(order.shipping)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold pt-2 border-top">
              <span>Total</span>
              <span className="text-primary fs-6">{formatPrice(order.total)}</span>
            </div>
          </div>

          {/* Delivery */}
          <div className="pt-2">
            <p className="small text-muted mb-0">
              <i className="bi bi-geo-alt me-1 text-primary" />
              {order.address}
            </p>
          </div>
        </div>

        {/* FOOTER */}
        <div className="p-3 border-top bg-light bg-opacity-50 d-flex justify-content-end">
          <button className="btn btn-outline-secondary px-4 fw-medium" onClick={onClose}>Close</button>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default OrderDetailsModal;
