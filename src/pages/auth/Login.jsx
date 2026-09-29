import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Input from '../../components/common/Input';
import { ROLES, ROUTES } from '../../utils/constants';

function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const user = await login(email, password);
      if (user.role === ROLES.ADMIN) {
        navigate(ROUTES.ADMIN_DASHBOARD, { replace: true });
      } else if (user.role === ROLES.SUPPLIER) {
        navigate(ROUTES.SUPPLIER_DASHBOARD, { replace: true });
      } else {
        navigate(ROUTES.USER_DASHBOARD, { replace: true });
      }
    } catch (err) {
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="d-flex align-items-center justify-content-center"
      style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)' }}
    >
      <div className="w-100 px-3" style={{ maxWidth: 440 }}>
        {/* Logo / Brand */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <i className="bi bi-box-seam-fill text-white fs-2" />
          </div>
          <h1 className="fw-bold fs-3 mb-1" style={{ color: '#1e293b' }}>Suplay B2B</h1>
          <p className="text-muted small">Sign in to your account</p>
        </div>

        <div className="card border-0 shadow-sm p-4 rounded-4">
          {error && (
            <div className="alert alert-danger py-2 px-3 small mb-3 d-flex align-items-center gap-2" role="alert">
              <i className="bi bi-exclamation-circle-fill" />
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="d-flex flex-column gap-3">
            <Input
              id="login-email"
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              placeholder="name@company.com"
            />

            <Input
              id="login-password"
              label="Password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              placeholder="••••••••"
            />

            <button
              type="submit"
              id="login-submit"
              className="btn py-2 fw-semibold d-flex align-items-center justify-content-center gap-2 mt-1 text-white"
              style={{ background: 'linear-gradient(135deg, #2563eb, #1d4ed8)', border: 'none' }}
              disabled={loading}
            >
              {loading && <span className="spinner-border spinner-border-sm" />}
              {loading ? 'Signing in…' : 'Sign In'}
            </button>
          </form>

          <div className="text-center mt-4 pt-3 border-top">
            <span className="small text-muted">Don't have an account? </span>
            <Link to={ROUTES.REGISTER} className="small fw-semibold text-primary text-decoration-none">
              Create Business Account
            </Link>
          </div>
        </div>

        <p className="text-center text-muted mt-3" style={{ fontSize: '0.72rem' }}>
          By signing in you agree to Suplay's Terms of Service and Privacy Policy.
        </p>
      </div>
    </main>
  );
}

export default Login;
