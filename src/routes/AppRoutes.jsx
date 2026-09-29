import { Routes, Route, Navigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROUTES } from '../utils/constants';
import ProtectedRoute from './ProtectedRoute';
import RoleRoute from './RoleRoute';

// Auth pages
import Login from '../pages/auth/Login';
import Register from '../pages/auth/Register';

// Public pages
import Home from '../pages/public/Home';
import Products from '../pages/public/Products';
import Suppliers from '../pages/public/Suppliers';
import Contact from '../pages/public/Contact';

// User pages
import UserDashboard from '../pages/user/UserDashboard';
import Cart from '../pages/user/Cart';
import Checkout from '../pages/user/Checkout';
import Orders from '../pages/user/Orders';
import OrderDetails from '../pages/user/OrderDetails';
import Profile from '../pages/user/Profile';

// Admin pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import ManageUsers from '../pages/admin/ManageUsers';
import ManageProducts from '../pages/admin/ManageProducts';
import ManageSuppliers from '../pages/admin/ManageSuppliers';
import ManageOrders from '../pages/admin/ManageOrders';

// Supplier pages
import SupplierDashboard from '../pages/supplier/SupplierDashboard';
import MyProducts from '../pages/supplier/MyProducts';
import AddProduct from '../pages/supplier/AddProduct';
import EditProduct from '../pages/supplier/EditProduct';
import SupplierOrders from '../pages/supplier/SupplierOrders';
import SupplierProfile from '../pages/supplier/SupplierProfile';

function UnauthorizedPage() {
  const { role } = useAuth();

  const getDashboardTarget = () => {
    if (role === ROLES.ADMIN) return ROUTES.ADMIN_DASHBOARD;
    if (role === ROLES.SUPPLIER) return ROUTES.SUPPLIER_DASHBOARD;
    if (role === ROLES.USER) return ROUTES.USER_DASHBOARD;
    return ROUTES.HOME;
  };

  return (
    <div className="d-flex flex-column align-items-center justify-content-center text-center p-4" style={{ minHeight: '65vh' }}>
      <i className="bi bi-shield-x display-1 text-danger mb-3" />
      <h2 className="fw-bold text-dark mb-2">Access Restricted</h2>
      <p className="text-muted mb-4" style={{ maxWidth: 460 }}>
        You do not have permission to access this page with your current account role ({role || 'Guest'}).
      </p>
      <Link to={getDashboardTarget()} className="btn btn-primary px-4 py-2 fw-medium">
        Return to {role ? 'My Dashboard' : 'Home'}
      </Link>
    </div>
  );
}

function NotFoundPage() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center" style={{ minHeight: '60vh' }}>
      <i className="bi bi-emoji-dizzy fs-1 text-secondary mb-3" />
      <h2 className="fw-bold">404 — Page Not Found</h2>
      <p className="text-muted">The page you are looking for does not exist.</p>
    </div>
  );
}

function AppRoutes() {
  return (
    <Routes>
      {/* Public */}
      <Route path={ROUTES.HOME} element={<Home />} />
      <Route path={ROUTES.PRODUCTS} element={<Products />} />
      <Route path={ROUTES.SUPPLIERS} element={<Suppliers />} />
      <Route path={ROUTES.CONTACT} element={<Contact />} />

      {/* Auth */}
      <Route path={ROUTES.LOGIN} element={<Login />} />
      <Route path={ROUTES.REGISTER} element={<Register />} />
      <Route path={ROUTES.UNAUTHORIZED} element={<UnauthorizedPage />} />

      {/* User — requires authentication */}
      <Route
        path={ROUTES.USER_DASHBOARD}
        element={<ProtectedRoute><UserDashboard /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.USER_CART}
        element={<ProtectedRoute><Cart /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.USER_CHECKOUT}
        element={<ProtectedRoute><Checkout /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.USER_ORDERS}
        element={<ProtectedRoute><Orders /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.USER_ORDER_DETAILS}
        element={<ProtectedRoute><OrderDetails /></ProtectedRoute>}
      />
      <Route
        path={ROUTES.USER_PROFILE}
        element={<ProtectedRoute><Profile /></ProtectedRoute>}
      />

      {/* Admin — requires admin role */}
      <Route
        path={ROUTES.ADMIN_DASHBOARD}
        element={<RoleRoute allowedRoles={ROLES.ADMIN}><AdminDashboard /></RoleRoute>}
      />
      <Route
        path={ROUTES.ADMIN_USERS}
        element={<RoleRoute allowedRoles={ROLES.ADMIN}><ManageUsers /></RoleRoute>}
      />
      <Route
        path={ROUTES.ADMIN_PRODUCTS}
        element={<RoleRoute allowedRoles={ROLES.ADMIN}><ManageProducts /></RoleRoute>}
      />
      <Route
        path={ROUTES.ADMIN_SUPPLIERS}
        element={<RoleRoute allowedRoles={ROLES.ADMIN}><ManageSuppliers /></RoleRoute>}
      />
      <Route
        path={ROUTES.ADMIN_ORDERS}
        element={<RoleRoute allowedRoles={ROLES.ADMIN}><ManageOrders /></RoleRoute>}
      />

      {/* Supplier — requires supplier role */}
      <Route
        path={ROUTES.SUPPLIER_DASHBOARD}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><SupplierDashboard /></RoleRoute>}
      />
      <Route
        path={ROUTES.SUPPLIER_MY_PRODUCTS}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><MyProducts /></RoleRoute>}
      />
      <Route
        path={ROUTES.SUPPLIER_ADD_PRODUCT}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><AddProduct /></RoleRoute>}
      />
      <Route
        path={ROUTES.SUPPLIER_EDIT_PRODUCT}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><EditProduct /></RoleRoute>}
      />
      <Route
        path={ROUTES.SUPPLIER_ORDERS}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><SupplierOrders /></RoleRoute>}
      />
      <Route
        path={ROUTES.SUPPLIER_PROFILE}
        element={<RoleRoute allowedRoles={ROLES.SUPPLIER}><SupplierProfile /></RoleRoute>}
      />

      {/* Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
}

export default AppRoutes;
