import { useState, useEffect, useMemo } from 'react';
import { getOrders } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import { useApp } from '../../context/AppContext';
import OrderDetailsModal from '../../modals/OrderDetailsModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { ORDER_STATUS } from '../../utils/constants';

function ManageOrders() {
  const { showToast } = useApp();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadOrders = () => {
    getOrders().then((data) => {
      setOrders(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadOrders();
  }, []);



  const filteredOrders = useMemo(() => {
    return orders.filter((o) => {
      const matchesSearch =
        !search ||
        String(o.id).toLowerCase().includes(search.toLowerCase()) ||
        o.userName?.toLowerCase().includes(search.toLowerCase()) ||
        o.supplierName?.toLowerCase().includes(search.toLowerCase());
      const matchesStatus = !statusFilter || o.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [orders, search, statusFilter]);

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="manage-orders-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manage Orders</h1>
          <p className="text-muted small mb-0">Total orders: {orders.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
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
                placeholder="Search by Order ID, Buyer, or Supplier..."
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
          icon="bi-receipt"
          title="No orders found"
          message={
            search || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'There are no orders placed yet.'
          }
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Supplier</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th className="text-end pe-4">Details</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="fw-medium text-primary">#{order.id}</span>
                    </td>
                    <td className="fw-medium">{order.userName}</td>
                    <td className="text-muted small">{order.supplierName}</td>
                    <td className="fw-semibold">{formatPrice(order.total)}</td>
                    <td>
                      <span className={`badge rounded-pill px-2 py-1 ${
                        order.status === 'delivered' ? 'bg-success-subtle text-success' :
                        order.status === 'cancelled' ? 'bg-danger-subtle text-danger' :
                        order.status === 'shipped' ? 'bg-primary-subtle text-primary' :
                        order.status === 'processing' ? 'bg-info-subtle text-info' :
                        'bg-warning-subtle text-warning'
                      }`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted small">{order.createdAt}</td>
                    <td className="text-end pe-3">
                      <button
                        className="btn btn-sm btn-outline-primary"
                        title="View Order Details"
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

      <OrderDetailsModal
        order={selectedOrder}
        onClose={() => setSelectedOrder(null)}
      />
    </main>
  );
}

export default ManageOrders;
