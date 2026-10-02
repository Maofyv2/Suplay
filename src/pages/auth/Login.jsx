import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import { ROLES, ROUTES } from '../../utils/constants';

function Login() {
  const { login } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
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
      className="d-flex align-items-center justify-content-center position-relative py-5 px-3"
      style={{
        minHeight: '100vh',
        background: darkMode
          ? 'linear-gradient(135deg, #0b1120 0%, #0f172a 100%)'
          : 'linear-gradient(135deg, #f0f4ff 0%, #e8f0fe 100%)',
      }}
    >
      {/* Top Header Control: Dark Mode Toggle */}
      <div className="position-absolute top-0 end-0 p-3 p-md-4">
        <button
          type="button"
          className="btn btn-sm btn-outline-secondary d-flex align-items-center justify-content-center shadow-sm"
          style={{ width: 38, height: 38, borderRadius: '50%' }}
          onClick={toggleDarkMode}
          title={darkMode ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label="Toggle dark mode"
        >
          <i className={`bi ${darkMode ? 'bi-sun-fill text-warning' : 'bi-moon-fill'}`} />
        </button>
      </div>

      <div className="w-100" style={{ maxWidth: 440 }}>
        {/* Logo / Brand */}
        <div className="text-center mb-4">
          <div
            className="d-inline-flex align-items-center justify-content-center rounded-circle mb-3 shadow-sm"
            style={{ width: 64, height: 64, background: 'linear-gradient(135deg, #2563eb, #1d4ed8)' }}
          >
            <i className="bi bi-box-seam-fill text-white fs-2" />
          </div>
          <h1 className="fw-bold fs-3 mb-1" style={{ color: 'var(--su-text-heading)' }}>
            Suplay B2B
          </h1>
          <p className="text-muted small">Sign in to your account</p>
        </div>

        <div
          className="card border shadow-sm p-4 rounded-4"
          style={{
            backgroundColor: 'var(--su-surface)',
            borderColor: 'var(--su-border)',
          }}
        >
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

          {/* Demo Account Dropdown */}
          <div className="mt-4 pt-3 border-top">
            <label htmlFor="login-demo-account" className="form-label text-muted small fw-semibold mb-1">
              Demo Account
            </label>
            <select
              id="login-demo-account"
              className="form-select form-select-sm"
              value={
                email === 'supplier@test.com'
                  ? 'supplier'
                  : email === 'supplier2@test.com'
                  ? 'supplier2'
                  : email === 'customer@test.com'
                  ? 'customer'
                  : email === 'admin@test.com'
                  ? 'admin'
                  : ''
              }
              onChange={(e) => {
                const accounts = {
                  supplier: 'supplier@test.com',
                  supplier2: 'supplier2@test.com',
                  customer: 'customer@test.com',
                  admin: 'admin@test.com',
                };
                const selectedEmail = accounts[e.target.value];
                if (selectedEmail) {
                  setEmail(selectedEmail);
                  setPassword('password123');
                  setError('');
                }
              }}
            >
              <option value="" disabled>
                Select a demo account
              </option>
              <option value="supplier">Supplier 1 (TechParts Philippines)</option>
              <option value="supplier2">Supplier 2 (OfficeMax Distributors)</option>
              <option value="customer">Customer (Test Customer)</option>
              <option value="admin">Admin (Test Admin)</option>
            </select>
          </div>

          <div className="text-center mt-3 pt-2">
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
