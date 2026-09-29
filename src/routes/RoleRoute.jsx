import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { ROUTES } from '../utils/constants';

/**
 * RoleRoute — wraps ProtectedRoute and adds role-based access control.
 * @param {string|string[]} allowedRoles - The role(s) permitted to access this route.
 */
function RoleRoute({ children, allowedRoles }) {
  const { isAuthenticated, role, loading } = useAuth();

  if (loading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  const allowed = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles];
  if (!allowed.includes(role)) return <Navigate to={ROUTES.UNAUTHORIZED} replace />;

  return children;
}

export default RoleRoute;
