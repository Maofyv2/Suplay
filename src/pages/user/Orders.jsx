import { useState, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getOrders, cancelOrder } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import OrderDetailsModal from '../../modals/OrderDetailsModal';
import ConfirmModal from '../../modals/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

function Orders() {
  const { currentUser } = useAuth();
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [cancelTarget, setCancelTarget] = useState(null);
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = () => {
    getOrders({ userId: currentUser?.id }).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleCancelOrder = async () => {
    if (!cancelTarget) return;
    try {
      const updated = await cancelOrder(cancelTarget.id);
      setOrders((prev) => prev.map((o) => (o.id === cancelTarget.id ? updated : o)));
      showToast(`Order #${cancelTarget.id} has been cancelled.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to cancel order.', 'error');
    }
    setCancelTarget(null);
  };

  const statusColor = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };

  const filtered = statusFilter ? orders.filter((o) => o.status === statusFilter) : orders;

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="orders-page">
      <h1 className="fw-bold mb-4">My Orders</h1>

      {/* Status Filter Pills */}
      <div className="d-flex flex-wrap gap-2 mb-4">
        {['', 'pending', 'processing', 'shipped', 'delivered', 'cancelled'].map((status) => (
          <button
            key={status}
            className={`btn btn-sm ${statusFilter === status ? 'btn-primary' : 'btn-outline-secondary'} rounded-pill`}
            onClick={() => setStatusFilter(status)}
          >
            {status === '' ? 'All' : status.charAt(0).toUpperCase() + status.slice(1)}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon="bi-receipt" title="No orders found" description={statusFilter ? `No ${statusFilter} orders.` : 'Your placed orders will appear here.'} />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Supplier</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((order) => (
                  <tr key={order.id}>
                    <td><span className="fw-medium text-primary">#{order.id}</span></td>
                    <td>{order.supplierName}</td>
                    <td>{order.items?.length || 0}</td>
                    <td className="fw-medium">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`badge bg-${statusColor[order.status]}-subtle text-${statusColor[order.status]} rounded-pill`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted small">{order.createdAt}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => setSelectedOrder(order)}
                        >
                          View
                        </button>
                        {order.status === 'pending' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => setCancelTarget(order)}
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => { setSelectedOrder(null); loadOrders(); }}
      />

      <ConfirmModal
        isOpen={!!cancelTarget}
        title="Cancel Order"
        message={`Are you sure you want to cancel order #${cancelTarget?.id}? This action cannot be undone.`}
        confirmLabel="Yes, Cancel Order"
        variant="danger"
        onConfirm={handleCancelOrder}
        onCancel={() => setCancelTarget(null)}
      />
    </main>
  );
}

export default Orders;

