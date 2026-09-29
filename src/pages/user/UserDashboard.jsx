import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { getOrders } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../utils/constants';

function UserDashboard() {
  const { currentUser } = useAuth();
  const { cartCount, cartTotal } = useCart();
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    getOrders({ userId: currentUser?.id }).then((data) => setOrders(data));
  }, [currentUser]);

  const recentOrders = orders.slice(0, 5);
  const statusColor = { pending: 'warning', processing: 'info', shipped: 'primary', delivered: 'success', cancelled: 'danger' };

  return (
    <main className="container-xl py-5" id="user-dashboard-page">
      <h1 className="fw-bold mb-1">Welcome back, {currentUser?.name?.split(' ')[0]}! 👋</h1>
      <p className="text-muted mb-5">Here's a snapshot of your account activity.</p>

      {/* Stats */}
      <div className="row g-4 mb-5">
        {[
          { icon: 'bi-receipt', label: 'Total Orders', value: orders.length, link: ROUTES.USER_ORDERS, color: 'primary' },
          { icon: 'bi-cart3', label: 'Items in Cart', value: cartCount, link: ROUTES.USER_CART, color: 'warning' },
          { icon: 'bi-currency-dollar', label: 'Cart Value', value: formatPrice(cartTotal), link: ROUTES.USER_CART, color: 'success' },
        ].map((stat) => (
          <div className="col-sm-4" key={stat.label}>
            <Link to={stat.link} className="text-decoration-none">
              <div className={`card border-0 shadow-sm h-100 border-start border-4 border-${stat.color}`}>
                <div className="card-body d-flex align-items-center gap-3 p-4">
                  <i className={`bi ${stat.icon} fs-2 text-${stat.color}`} />
                  <div>
                    <p className="text-muted small mb-0">{stat.label}</p>
                    <p className="fw-bold fs-5 mb-0">{stat.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div className="d-flex align-items-center justify-content-between mb-3">
        <h5 className="fw-bold mb-0">Recent Orders</h5>
        <Link to={ROUTES.USER_ORDERS} className="btn btn-outline-primary btn-sm">View All</Link>
      </div>
      {recentOrders.length === 0 ? (
        <p className="text-muted">No orders yet. <Link to={ROUTES.PRODUCTS}>Start shopping</Link>.</p>
      ) : (
        <div className="table-responsive">
          <table className="table table-hover align-middle">
            <thead className="table-light">
              <tr>
                <th>Order ID</th>
                <th>Supplier</th>
                <th>Total</th>
                <th>Status</th>
                <th>Date</th>
              </tr>
            </thead>
            <tbody>
              {recentOrders.map((order) => (
                <tr key={order.id}>
                  <td><span className="fw-medium">#{order.id}</span></td>
                  <td>{order.supplierName}</td>
                  <td className="fw-medium">{formatPrice(order.total)}</td>
                  <td><span className={`badge bg-${statusColor[order.status]}-subtle text-${statusColor[order.status]}`}>{order.status}</span></td>
                  <td className="text-muted small">{order.createdAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

export default UserDashboard;
