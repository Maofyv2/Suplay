import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { getProducts } from '../../services/productService';
import { getOrders } from '../../services/orderService';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../utils/constants';

function SupplierDashboard() {
  const { currentUser } = useAuth();
  const [products, setProducts] = useState([]);
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    const sId = currentUser?.supplierId || currentUser?.id;
    Promise.all([
      getProducts(),
      getOrders({ supplierId: sId }),
    ]).then(([prods, ords]) => {
      setProducts(
        prods.filter((p) => String(p.supplierId) === String(sId) || String(p.supplierId) === String(currentUser?.id))
      );
      setOrders(ords);
    });
  }, [currentUser]);

  const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
  const lowStockCount = products.filter((p) => (p.stock ?? 0) < 10).length;

  const statusColor = {
    pending: 'warning',
    processing: 'info',
    shipped: 'primary',
    delivered: 'success',
    cancelled: 'danger',
  };

  return (
    <main className="container-xl py-5" id="supplier-dashboard-page">
      <h1 className="fw-bold mb-1">Supplier Dashboard</h1>
      <p className="text-muted mb-4">Welcome back, {currentUser?.name?.split(' ')[0]}!</p>

      {/* Low stock warning banner */}
      {lowStockCount > 0 && (
        <div className="alert alert-warning d-flex align-items-center justify-content-between mb-4 shadow-sm">
          <div className="d-flex align-items-center gap-2">
            <i className="bi bi-exclamation-triangle-fill fs-5 text-warning" />
            <span>
              <strong>Inventory Alert:</strong> You have <strong>{lowStockCount}</strong> product(s) with low stock (fewer than 10 units).
            </span>
          </div>
          <Link to={ROUTES.SUPPLIER_MY_PRODUCTS} className="btn btn-warning btn-sm fw-medium">
            Manage Inventory
          </Link>
        </div>
      )}

      {/* Stats Cards */}
      <div className="row g-3 mb-5">
        {[
          {
            icon: 'bi-box-seam',
            label: 'My Products',
            value: products.length,
            link: ROUTES.SUPPLIER_MY_PRODUCTS,
            color: 'primary',
          },
          {
            icon: 'bi-receipt',
            label: 'Orders Received',
            value: orders.length,
            link: ROUTES.SUPPLIER_ORDERS,
            color: 'info',
          },
          {
            icon: 'bi-graph-up',
            label: 'Total Revenue',
            value: formatPrice(revenue),
            link: ROUTES.SUPPLIER_ORDERS,
            color: 'success',
          },
          {
            icon: 'bi-exclamation-triangle',
            label: 'Low Stock (< 10)',
            value: lowStockCount,
            link: ROUTES.SUPPLIER_MY_PRODUCTS,
            color: lowStockCount > 0 ? 'warning' : 'secondary',
          },
        ].map((s) => (
          <div className="col-sm-6 col-lg-3" key={s.label}>
            <Link to={s.link} className="text-decoration-none">
              <div
                className={`card border-0 shadow-sm h-100 border-start border-4 border-${s.color} hover-shadow transition`}
              >
                <div className="card-body d-flex align-items-center gap-3 p-3 p-md-4">
                  <i className={`bi ${s.icon} fs-2 text-${s.color}`} />
                  <div>
                    <p className="text-muted small mb-0">{s.label}</p>
                    <p className="fw-bold fs-5 mb-0 text-dark">{s.value}</p>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="mb-5">
        <h5 className="fw-semibold mb-3">Quick Actions</h5>
        <div className="d-flex flex-wrap gap-2">
          <Link to={ROUTES.SUPPLIER_ADD_PRODUCT} className="btn btn-primary btn-sm">
            <i className="bi bi-plus-circle me-2" />
            Add Product
          </Link>
          <Link to={ROUTES.SUPPLIER_MY_PRODUCTS} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-box-seam me-2" />
            My Products
          </Link>
          <Link to={ROUTES.SUPPLIER_ORDERS} className="btn btn-outline-primary btn-sm">
            <i className="bi bi-receipt me-2" />
            View Orders
          </Link>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="card border-0 shadow-sm p-4">
        <div className="d-flex align-items-center justify-content-between mb-3">
          <h5 className="fw-semibold mb-0">Recent Orders</h5>
          {orders.length > 5 && (
            <Link to={ROUTES.SUPPLIER_ORDERS} className="btn btn-link btn-sm p-0 text-decoration-none">
              View All Orders <i className="bi bi-arrow-right ms-1" />
            </Link>
          )}
        </div>

        {orders.length === 0 ? (
          <p className="text-muted mb-0 py-3 text-center">No orders received yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Order ID</th>
                  <th>Buyer</th>
                  <th>Total</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {orders.slice(0, 5).map((order) => (
                  <tr key={order.id}>
                    <td>
                      <span className="fw-medium text-primary">#{order.id}</span>
                    </td>
                    <td>{order.userName}</td>
                    <td className="fw-medium">{formatPrice(order.total)}</td>
                    <td>
                      <span
                        className={`badge bg-${statusColor[order.status] || 'secondary'}-subtle text-${
                          statusColor[order.status] || 'secondary'
                        } rounded-pill`}
                      >
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td className="text-muted small">{order.createdAt}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </main>
  );
}

export default SupplierDashboard;
