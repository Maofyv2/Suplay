import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getUsers } from '../../services/userService';
import { getProducts } from '../../services/productService';
import { getOrders } from '../../services/orderService';
import { getSuppliers } from '../../services/supplierService';
import { formatPrice } from '../../utils/formatPrice';
import { useApp } from '../../context/AppContext';
import ConfirmModal from '../../modals/ConfirmModal';
import { ROUTES } from '../../utils/constants';

function AdminDashboard() {
  const { showToast } = useApp();
  const [stats, setStats] = useState({ users: 0, products: 0, orders: 0, suppliers: 0, revenue: 0 });
  const [showResetModal, setShowResetModal] = useState(false);

  useEffect(() => {
    Promise.all([getUsers(), getProducts(), getOrders(), getSuppliers()]).then(
      ([users, products, orders, suppliers]) => {
        const revenue = orders.reduce((s, o) => s + (o.total || 0), 0);
        setStats({ users: users.length, products: products.length, orders: orders.length, suppliers: suppliers.length, revenue });
      }
    );
  }, []);

  const handleResetData = () => {
    localStorage.removeItem('suplay_products');
    localStorage.removeItem('suplay_orders');
    localStorage.removeItem('suplay_suppliers');
    localStorage.removeItem('suplay_users');
    localStorage.removeItem('suplay_cart');
    showToast('Demo data reset to initial mock data!', 'success');
    setShowResetModal(false);
    setTimeout(() => {
      window.location.reload();
    }, 700);
  };

  const cards = [
    { icon: 'bi-people', label: 'Total Users', value: stats.users, link: ROUTES.ADMIN_USERS, color: 'primary' },
    { icon: 'bi-box-seam', label: 'Products', value: stats.products, link: ROUTES.ADMIN_PRODUCTS, color: 'info' },
    { icon: 'bi-receipt', label: 'Orders', value: stats.orders, link: ROUTES.ADMIN_ORDERS, color: 'warning' },
    { icon: 'bi-building', label: 'Suppliers', value: stats.suppliers, link: ROUTES.ADMIN_SUPPLIERS, color: 'success' },
  ];

  return (
    <main className="container-xl py-5" id="admin-dashboard-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Admin Dashboard</h1>
          <p className="text-muted mb-0">Platform overview and management hub.</p>
        </div>
        <button
          className="btn btn-outline-danger btn-sm d-inline-flex align-items-center gap-2"
          onClick={() => setShowResetModal(true)}
          title="Reset all localStorage records back to mock data"
        >
          <i className="bi bi-arrow-counterclockwise" />
          Reset Demo Data
        </button>
      </div>

      {/* Stats */}
      <div className="row g-4 mb-5">
        {cards.map((c) => (
          <div className="col-sm-6 col-lg-3" key={c.label}>
            <Link to={c.link} className="text-decoration-none">
              <div className={`card border-0 shadow-sm h-100 border-top border-4 border-${c.color}`}>
                <div className="card-body p-4">
                  <div className="d-flex align-items-center justify-content-between mb-2">
                    <p className="text-muted small mb-0">{c.label}</p>
                    <i className={`bi ${c.icon} fs-4 text-${c.color}`} />
                  </div>
                  <p className="fw-bold fs-3 mb-0 text-dark">{c.value}</p>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Revenue highlight */}
      <div className="card border-0 shadow-sm p-4 mb-4 bg-primary text-white">
        <div className="d-flex align-items-center justify-content-between">
          <div>
            <p className="mb-0 opacity-75">Total Platform Revenue</p>
            <h2 className="fw-bold mb-0">{formatPrice(stats.revenue)}</h2>
          </div>
          <i className="bi bi-graph-up-arrow display-4 opacity-50" />
        </div>
      </div>

      {/* Quick links */}
      <h5 className="fw-semibold mb-3">Quick Actions</h5>
      <div className="d-flex flex-wrap gap-2">
        <Link to={ROUTES.ADMIN_PRODUCTS} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-box-seam me-2" />
          Manage Products
        </Link>
        <Link to={ROUTES.ADMIN_USERS} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-people me-2" />
          Manage Users
        </Link>
        <Link to={ROUTES.ADMIN_ORDERS} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-receipt me-2" />
          View Orders
        </Link>
        <Link to={ROUTES.ADMIN_SUPPLIERS} className="btn btn-outline-primary btn-sm">
          <i className="bi bi-building me-2" />
          Manage Suppliers
        </Link>
      </div>

      <ConfirmModal
        isOpen={showResetModal}
        title="Reset Demo Data"
        message="This will restore all products, users, orders, and suppliers to their original initial demo data. Any custom edits or test orders will be cleared."
        confirmLabel="Yes, Reset Data"
        variant="danger"
        onConfirm={handleResetData}
        onCancel={() => setShowResetModal(false)}
      />
    </main>
  );
}

export default AdminDashboard;
