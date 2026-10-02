import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useApp } from '../../context/AppContext';
import { ROLES, ROUTES } from '../../utils/constants';

function Navbar() {
  const { isAuthenticated, role, currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const { darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate(ROUTES.HOME);
  };

  // Define Navigation configurations based on Role
  const getNavLinks = () => {
    if (!isAuthenticated) {
      return [
        { label: 'Home', path: ROUTES.HOME, end: true },
        { label: 'Products', path: ROUTES.PRODUCTS },
      ];
    }

    if (role === ROLES.ADMIN) {
      return [
        { label: 'Dashboard', path: ROUTES.ADMIN_DASHBOARD },
        { label: 'Users', path: ROUTES.ADMIN_USERS },
        { label: 'Products', path: ROUTES.ADMIN_PRODUCTS },
        { label: 'Suppliers', path: ROUTES.ADMIN_SUPPLIERS },
        { label: 'Orders', path: ROUTES.ADMIN_ORDERS },
      ];
    }

    if (role === ROLES.SUPPLIER) {
      return [
        { label: 'Dashboard', path: ROUTES.SUPPLIER_DASHBOARD },
        { label: 'My Products', path: ROUTES.SUPPLIER_MY_PRODUCTS },
        { label: 'Add Product', path: ROUTES.SUPPLIER_ADD_PRODUCT },
        { label: 'Orders', path: ROUTES.SUPPLIER_ORDERS },
        { label: 'Profile', path: ROUTES.SUPPLIER_PROFILE },
      ];
    }

    // Customer / User Navigation
    return [
      { label: 'Home', path: ROUTES.HOME, end: true },
      { label: 'Products', path: ROUTES.PRODUCTS },
      { label: 'Suppliers', path: ROUTES.SUPPLIERS },
      { label: 'My Orders', path: ROUTES.USER_ORDERS },
      { label: 'Profile', path: ROUTES.USER_PROFILE },
    ];
  };

  const navLinks = getNavLinks();

  return (
    <nav className="navbar navbar-expand-lg sticky-top suplay-navbar" id="main-navbar">
      <div className="container-xl">
        {/* Brand */}
        <Link className="navbar-brand fw-bold" to={ROUTES.HOME}>
          <i className="bi bi-box-seam-fill me-2 text-primary" />
          Suplay
        </Link>

        {/* Mobile toggle */}
        <button
          className="navbar-toggler border-0"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#mainNav"
          aria-controls="mainNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon" />
        </button>

        <div className="collapse navbar-collapse" id="mainNav">
          {/* Dynamic Left Nav Links according to Role */}
          <ul className="navbar-nav me-auto gap-1">
            {navLinks.map((item) => (
              <li className="nav-item" key={item.path}>
                <NavLink className="nav-link" to={item.path} end={item.end}>
                  {item.label}
                </NavLink>
              </li>
            ))}
          </ul>

          {/* Right Actions */}
          <div className="d-flex align-items-center gap-2">
            {/* Dark Mode Toggle */}
            <button
              id="dark-mode-toggle"
              className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center"
              style={{ width: 36, height: 36, borderRadius: '50%', padding: 0 }}
              onClick={toggleDarkMode}
              aria-label={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              <i className={`bi ${darkMode ? 'bi-sun-fill' : 'bi-moon-fill'}`} style={{ fontSize: '0.85rem' }} />
            </button>
            {isAuthenticated ? (
              <>
                {/* Cart (ONLY for Customers / Buyers) */}
                {role === ROLES.USER && (
                  <Link
                    to={ROUTES.USER_CART}
                    className="btn btn-outline-secondary btn-sm position-relative me-2"
                    aria-label="Shopping cart"
                  >
                    <i className="bi bi-cart3 me-1" />
                    Cart
                    {cartCount > 0 && (
                      <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary">
                        {cartCount > 99 ? '99+' : cartCount}
                        <span className="visually-hidden">items in cart</span>
                      </span>
                    )}
                  </Link>
                )}

                {/* User Info & Dropdown */}
                <div className="dropdown">
                  <button
                    className="btn btn-sm d-flex align-items-center gap-2 border-0 bg-light rounded-pill px-3 py-1"
                    type="button"
                    data-bs-toggle="dropdown"
                    aria-expanded="false"
                    id="userDropdown"
                  >
                    <div className="suplay-avatar">
                      {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
                    </div>
                    <div className="text-start d-none d-lg-block">
                      <span className="d-block text-dark small fw-bold lh-1">
                        {currentUser?.name}
                      </span>
                      <span className="badge bg-primary-subtle text-primary text-uppercase" style={{ fontSize: '0.65rem' }}>
                        {role}
                      </span>
                    </div>
                    <i className="bi bi-chevron-down small text-muted ms-1" />
                  </button>

                  <ul className="dropdown-menu dropdown-menu-end shadow-sm border-0 mt-2" aria-labelledby="userDropdown">
                    <li>
                      <div className="px-3 py-2">
                        <p className="small fw-bold mb-0 text-dark">{currentUser?.name}</p>
                        <p className="small text-muted mb-0">{currentUser?.email}</p>
                        <span className="badge bg-primary-subtle text-primary text-uppercase mt-1" style={{ fontSize: '0.65rem' }}>
                          {role}
                        </span>
                      </div>
                    </li>
                    <li><hr className="dropdown-divider" /></li>
                    <li>
                      <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                        <i className="bi bi-box-arrow-right" />Sign Out
                      </button>
                    </li>
                  </ul>
                </div>
              </>
            ) : (
              <>
                <Link to={ROUTES.LOGIN} className="btn btn-outline-primary btn-sm px-3">Sign In</Link>
                <Link to={ROUTES.REGISTER} className="btn btn-primary btn-sm px-3">Get Started</Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
