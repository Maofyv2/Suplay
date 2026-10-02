import { useState, useEffect, useMemo } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getOrders, updateOrderStatus } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import OrderDetailsModal from '../../modals/OrderDetailsModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { ORDER_STATUS } from '../../utils/constants';

function SupplierOrders() {
  const { currentUser } = useAuth();
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = () => {
    const sId = currentUser?.supplierId || currentUser?.id;
    getOrders({ supplierId: sId }).then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

  const handleStatusChange = async (orderId, newStatus) => {
    try {
      const updated = await updateOrderStatus(orderId, newStatus);
      setOrders((prev) => prev.map((o) => (o.id === orderId ? updated : o)));
      if (selectedOrder?.id === orderId) {
        setSelectedOrder(updated);
      }
      showToast(`Order #${orderId} status changed to ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update order status.', 'error');
    }
  };

  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        String(o.id).toLowerCase().includes(search.toLowerCase()) ||
        o.userName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="supplier-orders-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">My Orders</h1>
          <p className="text-muted small mb-0">Total orders: {orders.length}</p>
        </div>
      </div>

      {orders.length === 0 ? (
        <EmptyState
          icon="bi-receipt"
          title="No orders yet"
          description="Orders from buyers will appear here."
        />
      ) : (
        <>
          {/* Search & Filter */}
          <div className="card border-0 shadow-sm p-3 mb-4">
            <div className="row g-2">
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by Order ID or Buyer name..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-10 col-md-3">
                <select
                  className="form-select"
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                >
                  <option value="">All Statuses</option>
                  {Object.values(ORDER_STATUS).map((s) => (
                    <option key={s} value={s}>
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              {(search || statusFilter) && (
                <div className="col-2 col-md-1 d-flex">
                  <button
                    className="btn btn-outline-secondary w-100"
                    title="Reset filters"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                    }}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {filteredOrders.length === 0 ? (
            <EmptyState
              icon="bi-funnel"
              title="No matching orders"
              description="Try adjusting your search or filter."
            />
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Order ID</th>
                      <th>Buyer</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredOrders.map((order) => (
                      <tr key={order.id}>
                        <td>
                          <span className="fw-medium text-primary">#{order.id}</span>
                        </td>
                        <td className="fw-medium">{order.userName}</td>
                        <td className="fw-semibold">{formatPrice(order.total)}</td>
                        <td>
                          {order.status === 'pending' ? (
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 130 }}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="pending" disabled>Pending</option>
                              <option value="processing">Processing</option>
                              <option value="cancelled">Cancelled</option>
                            </select>
                          ) : order.status === 'processing' ? (
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 130 }}
                              value={order.status}
                              onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            >
                              <option value="processing" disabled>Processing</option>
                              <option value="delivered">Delivered</option>
                            </select>
                          ) : (
                            <select
                              className="form-select form-select-sm"
                              style={{ minWidth: 130 }}
                              value={order.status}
                              disabled
                            >
                              <option value={order.status}>
                                {order.status ? order.status.charAt(0).toUpperCase() + order.status.slice(1) : ''}
                              </option>
                            </select>
                          )}
                        </td>
                        <td className="text-muted small">{order.createdAt}</td>
                        <td className="text-end pe-3">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="View Details"
                            onClick={() => setSelectedOrder(order)}
                          >
                            <i className="bi bi-eye" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => {
          setSelectedOrder(null);
          loadOrders();
        }}
      />
    </main>
  );
}

export default SupplierOrders;
