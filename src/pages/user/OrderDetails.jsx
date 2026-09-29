import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getOrderById, cancelOrder } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import { useApp } from '../../context/AppContext';
import Loading from '../../components/common/Loading';
import OrderTimeline from '../../components/common/OrderTimeline';
import ConfirmModal from '../../modals/ConfirmModal';
import { ROUTES } from '../../utils/constants';

function OrderDetails() {
  const { id } = useParams();
  const { showToast } = useApp();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    getOrderById(id)
      .then((data) => {
        setOrder(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [id]);

  const handleCancelOrder = async () => {
    if (!order) return;
    setCancelling(true);
    try {
      const updated = await cancelOrder(order.id);
      setOrder(updated);
      showToast(`Order #${order.id} has been cancelled.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    } finally {
      setCancelling(false);
      setShowCancelModal(false);
    }
  };

  if (loading) return <Loading />;
  if (!order)
    return (
      <div className="container-xl py-5 text-center">
        <p className="text-muted">Order not found.</p>
        <Link to={ROUTES.USER_ORDERS} className="btn btn-outline-primary">
          Back to Orders
        </Link>
      </div>
    );

  const statusColor = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  };

  return (
    <main className="container-xl py-5" id="order-details-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div className="d-flex align-items-center gap-3">
          <Link to={ROUTES.USER_ORDERS} className="btn btn-outline-secondary btn-sm">
            <i className="bi bi-arrow-left me-1" />
            Back
          </Link>
          <h1 className="fw-bold mb-0 fs-4">Order #{order.id}</h1>
          <span
            className={`badge bg-${statusColor[order.status] || 'secondary'}-subtle text-${
              statusColor[order.status] || 'secondary'
            } rounded-pill`}
          >
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>

        {order.status === 'pending' && (
          <button
            className="btn btn-outline-danger btn-sm"
            onClick={() => setShowCancelModal(true)}
            disabled={cancelling}
          >
            <i className="bi bi-x-circle me-1" />
            Cancel Order
          </button>
        )}
      </div>

      {/* Progress Stepper Card */}
      <div className="card border-0 shadow-sm p-4 mb-4">
        <h5 className="fw-semibold mb-3">Order Progress</h5>
        <OrderTimeline status={order.status} />
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm p-4 mb-4">
            <h5 className="fw-semibold mb-3">Items</h5>
            {order.items.map((item) => (
              <div key={item.productId} className="d-flex justify-content-between py-2 border-bottom">
                <div>
                  <p className="fw-medium mb-0">{item.name}</p>
                  <p className="text-muted small mb-0">
                    Qty: {item.qty} × {formatPrice(item.unitPrice)}
                  </p>
                </div>
                <span className="fw-bold">{formatPrice(item.total)}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm p-4">
            <h5 className="fw-semibold mb-3">Summary</h5>
            <div className="d-flex justify-content-between mb-2 small">
              <span className="text-muted">Subtotal</span>
              <span>{formatPrice(order.subtotal)}</span>
            </div>
            <div className="d-flex justify-content-between mb-3 small">
              <span className="text-muted">Shipping</span>
              <span>{formatPrice(order.shipping)}</span>
            </div>
            <div className="d-flex justify-content-between fw-bold">
              <span>Total</span>
              <span className="text-primary fs-5">{formatPrice(order.total)}</span>
            </div>
            <hr />
            <p className="small text-muted mb-1">
              <i className="bi bi-truck me-1" />
              {order.supplierName}
            </p>
            <p className="small text-muted mb-1">
              <i className="bi bi-geo-alt me-1" />
              {order.address}
            </p>
            <p className="small text-muted mb-0">
              <i className="bi bi-calendar3 me-1" />
              {order.createdAt}
            </p>
          </div>
        </div>
      </div>

      <ConfirmModal
        isOpen={showCancelModal}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${order.id}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Order"
        variant="danger"
        loading={cancelling}
        onConfirm={handleCancelOrder}
        onCancel={() => setShowCancelModal(false)}
      />
    </main>
  );
}

export default OrderDetails;
