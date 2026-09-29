import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { ROLES, ROUTES } from '../../utils/constants';

function Sidebar() {
  const { role } = useAuth();

  const adminLinks = [
    { to: ROUTES.ADMIN_DASHBOARD, icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: ROUTES.ADMIN_PRODUCTS, icon: 'bi-box-seam', label: 'Products' },
    { to: ROUTES.ADMIN_SUPPLIERS, icon: 'bi-truck', label: 'Suppliers' },
    { to: ROUTES.ADMIN_ORDERS, icon: 'bi-receipt', label: 'Orders' },
    { to: ROUTES.ADMIN_USERS, icon: 'bi-people', label: 'Users' },
  ];

  const supplierLinks = [
    { to: ROUTES.SUPPLIER_DASHBOARD, icon: 'bi-speedometer2', label: 'Dashboard' },
    { to: ROUTES.SUPPLIER_MY_PRODUCTS, icon: 'bi-box-seam', label: 'My Products' },
    { to: ROUTES.SUPPLIER_ADD_PRODUCT, icon: 'bi-plus-circle', label: 'Add Product' },
    { to: ROUTES.SUPPLIER_ORDERS, icon: 'bi-receipt', label: 'Orders' },
    { to: ROUTES.SUPPLIER_PROFILE, icon: 'bi-person-badge', label: 'Profile' },
  ];

  const links = role === ROLES.ADMIN ? adminLinks : role === ROLES.SUPPLIER ? supplierLinks : [];

  if (links.length === 0) return null;

  return (
    <aside className="suplay-sidebar" id="dashboard-sidebar">
      <div className="suplay-sidebar-brand">
        <i className="bi bi-box-seam-fill text-primary me-2" />
        <span className="fw-bold">
          {role === ROLES.ADMIN ? 'Admin Panel' : 'Supplier Panel'}
        </span>
      </div>
      <nav>
        <ul className="list-unstyled mb-0">
          {links.map((link) => (
            <li key={link.to}>
              <NavLink
                to={link.to}
                className={({ isActive }) =>
                  `suplay-sidebar-link${isActive ? ' active' : ''}`
                }
              >
                <i className={`bi ${link.icon}`} aria-hidden="true" />
                {link.label}
              </NavLink>
            </li>
          ))}
        </ul>
      </nav>
    </aside>
  );
}

export default Sidebar;
