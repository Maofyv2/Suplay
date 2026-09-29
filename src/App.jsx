import { BrowserRouter, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { AppProvider, useApp } from './context/AppContext';
import AppRoutes from './routes/AppRoutes';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import './index.css';
// Bootstrap CSS & Icons
import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap-icons/font/bootstrap-icons.css';
// Bootstrap JS (for dropdowns, collapses, etc.)
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

function ToastNotification() {
  const { toast, hideToast } = useApp();
  if (!toast) return null;

  const typeMap = {
    success: { bg: 'bg-success', icon: 'bi-check-circle-fill' },
    error: { bg: 'bg-danger', icon: 'bi-exclamation-triangle-fill' },
    info: { bg: 'bg-primary', icon: 'bi-info-circle-fill' },
  };

  const { bg, icon } = typeMap[toast.type] || typeMap.info;

  return (
    <div
      className="position-fixed bottom-0 end-0 p-3"
      style={{ zIndex: 11000 }}
    >
      <div
        className={`toast show align-items-center text-white ${bg} border-0 shadow-lg`}
        role="alert"
        aria-live="assertive"
      >
        <div className="d-flex">
          <div className="toast-body d-flex align-items-center gap-2">
            <i className={`bi ${icon} fs-5`} />
            {toast.message}
          </div>
          <button
            type="button"
            className="btn-close btn-close-white me-2 m-auto"
            onClick={hideToast}
            aria-label="Close"
          />
        </div>
      </div>
    </div>
  );
}

const AUTH_ROUTES = ['/login', '/register'];

function AppContent() {
  const { pathname } = useLocation();
  const isAuthPage = AUTH_ROUTES.includes(pathname);

  return (
    <div className="d-flex flex-column min-vh-100">
      {!isAuthPage && <Navbar />}
      <div className="flex-grow-1">
        <AppRoutes />
      </div>
      {!isAuthPage && <Footer />}
      <ToastNotification />
    </div>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <AppProvider>
            <AppContent />
          </AppProvider>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;

