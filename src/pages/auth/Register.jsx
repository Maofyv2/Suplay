
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import Input from '../../components/common/Input';
import { ROLES, ROUTES } from '../../utils/constants';

const BUSINESS_TYPES = [
  'Retailer',
  'Wholesaler / Distributor',
  'Manufacturer',
  'Importer / Exporter',
  'Construction / Contractor',
  'Food & Beverage',
  'Healthcare / Pharma',
  'Technology / IT',
  'Other',
];

function Register() {
  const { register } = useAuth();
  const { darkMode, toggleDarkMode } = useApp();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    role: ROLES.USER,
    companyName: '',
    businessType: '',
    phone: '',
    address: '',
  });

  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (name === 'role' && value === ROLES.USER) {
      setStep(1);
    }
  };

  const handleStep1Submit = async (e) => {
    e.preventDefault();
    setError('');

    if (form.role === ROLES.USER && !form.name.trim()) {
      setError('Please enter your full name.');
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (form.password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }

    // If registering as a Buyer (user), create account directly without business fields
    if (form.role === ROLES.USER) {
      setLoading(true);
      try {
        const payload = {
          name: form.name.trim(),
          email: form.email,
          password: form.password,
          role: ROLES.USER,
        };

        await register(payload);
        navigate(ROUTES.USER_DASHBOARD, { replace: true });
      } catch (err) {
        setError(err.message || 'Registration failed. Please try again.');
      } finally {
        setLoading(false);
      }
      return;
    }

    // If Supplier, proceed to Step 2 for business information
    setStep(2);
  };

  const handleStep2Submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: form.companyName || form.name,
        email: form.email,
        password: form.password,
        role: ROLES.SUPPLIER,
        companyName: form.companyName,
        businessType: form.businessType,
        phone: form.phone,
        address: form.address,
      };

      await register(payload);
      navigate(ROUTES.SUPPLIER_DASHBOARD, { replace: true });
    } catch (err) {
      setError(err.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      className="min-vh-100 d-flex align-items-center justify-content-center position-relative py-5 px-3"
      style={{
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

      <div className="container">
        <div className="row justify-content-center">
          <div className="col-12 col-md-9 col-lg-6 col-xl-5">

            {/* Header */}
            <div className="text-center mb-4">
              <div
                className="d-inline-flex align-items-center justify-content-center mb-3 shadow-sm"
                style={{
                  width: '48px',
                  height: '48px',
                  backgroundColor: '#0d6efd',
                  borderRadius: '10px',
                }}
              >
                <i className="bi bi-building text-white fs-4"></i>
              </div>

              <h1 className="h3 fw-bold mb-1" style={{ color: 'var(--su-text-heading)' }}>
                Create an Account
              </h1>

              <p className="text-muted mb-0">
                {form.role === ROLES.USER
                  ? 'Create your buyer account on Suplay'
                  : "Join Suplay's B2B Marketplace as a Supplier"}
              </p>
            </div>

            {/* Progress - only shown for Supplier multi-step registration */}
            {form.role === ROLES.SUPPLIER && (
              <div className="mb-4">
                <div className="d-flex align-items-center">
                  {/* Step 1 */}
                  <div className="d-flex align-items-center">
                    <div
                      className="d-flex align-items-center justify-content-center fw-semibold"
                      style={{
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        backgroundColor: '#0d6efd',
                        color: '#fff',
                        fontSize: '14px',
                      }}
                    >
                      {step > 1 ? <i className="bi bi-check"></i> : '1'}
                    </div>
                  </div>

                  {/* Line */}
                  <div
                    className="flex-grow-1 mx-2"
                    style={{
                      height: '2px',
                      backgroundColor: step >= 2 ? '#0d6efd' : 'var(--su-border)',
                    }}
                  />

                  {/* Step 2 */}
                  <div
                    className="d-flex align-items-center justify-content-center fw-semibold"
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '50%',
                      backgroundColor: step >= 2 ? '#0d6efd' : 'var(--su-border)',
                      color: step >= 2 ? '#fff' : 'var(--su-text-muted)',
                      fontSize: '14px',
                    }}
                  >
                    2
                  </div>
                </div>

                <div className="d-flex justify-content-between mt-2">
                  <small className={step >= 1 ? 'text-primary fw-semibold' : 'text-muted'}>
                    Account
                  </small>
                  <small className={step >= 2 ? 'text-primary fw-semibold' : 'text-muted'}>
                    Business Information
                  </small>
                </div>
              </div>
            )}

            {/* Card */}
            <div
              className="border rounded-3 p-4 shadow-sm"
              style={{
                backgroundColor: 'var(--su-surface)',
                borderColor: 'var(--su-border)',
              }}
            >
              {/* Error */}
              {error && (
                <div
                  className="alert alert-danger py-2 px-3 small d-flex align-items-center gap-2"
                  role="alert"
                >
                  <i className="bi bi-exclamation-circle"></i>
                  <span>{error}</span>
                </div>
              )}

              {/* STEP 1 */}
              {step === 1 && (
                <form onSubmit={handleStep1Submit}>
                  {form.role === ROLES.USER && (
                    <div className="mb-3">
                      <Input
                        id="register-name"
                        label="Full Name *"
                        type="text"
                        name="name"
                        value={form.name}
                        onChange={handleChange}
                        required
                        placeholder="e.g. Juan dela Cruz"
                      />
                    </div>
                  )}

                  <div className="mb-3">
                    <Input
                      id="register-email"
                      label={form.role === ROLES.USER ? 'Email Address *' : 'Business Email Address *'}
                      type="email"
                      name="email"
                      value={form.email}
                      onChange={handleChange}
                      required
                      placeholder={form.role === ROLES.USER ? 'you@email.com' : 'you@company.com'}
                    />
                  </div>

                  <div className="mb-3">
                    <Input
                      id="register-password"
                      label="Password *"
                      type="password"
                      name="password"
                      value={form.password}
                      onChange={handleChange}
                      required
                      placeholder="Enter your password"
                      helper="At least 8 characters."
                    />
                  </div>

                  <div className="mb-3">
                    <Input
                      id="register-confirm-password"
                      label="Confirm Password *"
                      type="password"
                      name="confirmPassword"
                      value={form.confirmPassword}
                      onChange={handleChange}
                      required
                      placeholder="Re-enter your password"
                    />
                  </div>

                  {/* Account Type */}
                  <div className="mb-4">
                    <label
                      htmlFor="register-role"
                      className="form-label fw-semibold"
                    >
                      Account Type *
                    </label>

                    <select
                      id="register-role"
                      name="role"
                      className="form-select"
                      value={form.role}
                      onChange={handleChange}
                      required
                    >
                      <option value={ROLES.USER}>
                        Buyer — Purchasing / Customer
                      </option>

                      <option value={ROLES.SUPPLIER}>
                        Supplier — Manufacturer / Vendor
                      </option>
                    </select>

                    <small className="text-muted d-block mt-2">
                      {form.role === ROLES.USER
                        ? 'Purchase products from suppliers on the marketplace.'
                        : 'Sell your products and connect with business buyers.'}
                    </small>
                  </div>

                  <button
                    type="submit"
                    id={form.role === ROLES.USER ? 'register-submit' : 'register-next'}
                    className="btn btn-primary w-100 py-2 fw-semibold d-flex align-items-center justify-content-center gap-2"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm"></span>
                        Creating Account...
                      </>
                    ) : form.role === ROLES.USER ? (
                      <>
                        Create Account
                        <i className="bi bi-check-lg ms-1"></i>
                      </>
                    ) : (
                      <>
                        Continue to Business Info
                        <i className="bi bi-arrow-right ms-1"></i>
                      </>
                    )}
                  </button>
                </form>
              )}

              {/* STEP 2 - Only for Supplier */}
              {step === 2 && form.role === ROLES.SUPPLIER && (
                <form onSubmit={handleStep2Submit}>

                  <div className="mb-3">
                    <Input
                      id="register-company"
                      label="Company / Business Name *"
                      name="companyName"
                      value={form.companyName}
                      onChange={handleChange}
                      required
                      placeholder="e.g. Acme Supplies Corp."
                    />
                  </div>

                  <div className="mb-3">
                    <Input
                      id="register-contact-name"
                      label="Contact Person *"
                      name="name"
                      value={form.name}
                      onChange={handleChange}
                      required
                      placeholder="Full name"
                    />
                  </div>

                  <div className="mb-3">
                    <label
                      htmlFor="register-business-type"
                      className="form-label fw-semibold"
                    >
                      Business Type *
                    </label>

                    <select
                      id="register-business-type"
                      name="businessType"
                      className="form-select"
                      value={form.businessType}
                      onChange={handleChange}
                      required
                    >
                      <option value="" disabled>
                        Select your industry
                      </option>

                      {BUSINESS_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {type}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="mb-3">
                    <Input
                      id="register-phone"
                      label="Business Phone Number *"
                      type="tel"
                      name="phone"
                      value={form.phone}
                      onChange={handleChange}
                      required
                      placeholder="+63 9XX XXX XXXX"
                    />
                  </div>

                  <div className="mb-4">
                    <Input
                      id="register-address"
                      label="Business Address"
                      name="address"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="Street, City, Province"
                    />
                  </div>

                  <div className="d-flex gap-2">

                    <button
                      type="button"
                      id="register-back"
                      className="btn btn-outline-secondary py-2 px-4"
                      onClick={() => {
                        setStep(1);
                        setError('');
                      }}
                    >
                      <i className="bi bi-arrow-left me-1"></i>
                      Back
                    </button>

                    <button
                      type="submit"
                      id="register-submit"
                      className="btn btn-primary py-2 fw-semibold flex-grow-1"
                      disabled={loading}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2"></span>
                          Creating Account...
                        </>
                      ) : (
                        <>
                          Create Account
                          <i className="bi bi-check-lg ms-2"></i>
                        </>
                      )}
                    </button>

                  </div>
                </form>
              )}

              {/* Login */}
              <div className="text-center border-top mt-4 pt-3">
                <span className="small text-muted">
                  Already have an account?{' '}
                </span>

                <Link
                  to={ROUTES.LOGIN}
                  className="small fw-semibold text-decoration-none"
                >
                  Sign In
                </Link>
              </div>
            </div>

            {/* Terms */}
            <p
              className="text-center text-muted mt-3"
              style={{ fontSize: '12px' }}
            >
              By registering, you agree to Suplay's Terms of Service
              and Privacy Policy.
            </p>

          </div>
        </div>
      </div>
    </main>
  );
}

export default Register;

