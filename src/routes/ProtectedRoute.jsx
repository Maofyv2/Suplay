import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Loading from '../components/common/Loading';
import { ROUTES } from '../utils/constants';

/**
 * ProtectedRoute — redirects to /login if the user is not authenticated.
 * Shows a loading spinner while auth state is being restored.
 */
function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) return <Loading fullScreen />;
  if (!isAuthenticated) return <Navigate to={ROUTES.LOGIN} replace />;

  return children;
}

export default ProtectedRoute;
