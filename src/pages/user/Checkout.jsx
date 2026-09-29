import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { createOrder } from '../../services/orderService';
import { updateProductStock } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import { ROUTES } from '../../utils/constants';
import Input from '../../components/common/Input';

function Checkout() {
  const { items, cartTotal, clearCart } = useCart();
  const { currentUser } = useAuth();
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    address: '',
    notes: '',
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successOrder, setSuccessOrder] = useState(null);

  const shipping = 0;
  const grandTotal = cartTotal + shipping;

  const handleChange = (e) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (items.length === 0) {
      setError('Your cart is empty.');
      return;
    }

    if (!form.name.trim() || !form.phone.trim() || !form.address.trim()) {
      setError('Please fill in all required customer details.');
      return;
    }

    setLoading(true);

    try {
      // Group items by supplier or create order per purchase
      const primarySupplier = items[0]?.supplierName || 'Multiple Suppliers';
      const primarySupplierId = items[0]?.supplierId || 's1';

      const orderData = {
        userId: currentUser?.id || 'u-cust',
        userName: form.name,
        userEmail: form.email,
        phone: form.phone,
        supplierId: primarySupplierId,
        supplierName: primarySupplier,
        items: items.map((item) => ({
          productId: item.productId,
          name: item.name,
          qty: item.qty,
          unitPrice: item.price,
          total: item.price * item.qty,
          supplierId: item.supplierId,
          supplierName: item.supplierName,
        })),
        subtotal: cartTotal,
        shipping,
        total: grandTotal,
        address: form.address,
        notes: form.notes,
      };

      const newOrder = await createOrder(orderData);

      // Deduct stock for purchased items
      for (const item of items) {
        await updateProductStock(item.productId, item.qty);
      }

      // Clear cart
      clearCart();

      setSuccessOrder(newOrder);
    } catch (err) {
      setError(err.message || 'Failed to place order. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  if (successOrder) {
    return (
      <main className="container-xl py-5" id="checkout-success-page">
        <div className="row justify-content-center">
          <div className="col-md-7 col-lg-6 text-center">
            <div className="card border-0 shadow-sm p-5 rounded-4">
              <div
                className="rounded-circle bg-success bg-opacity-10 text-success d-inline-flex align-items-center justify-content-center mb-3 mx-auto"
                style={{ width: 80, height: 80 }}
              >
                <i className="bi bi-check-lg display-4" />
              </div>
              <h2 className="fw-bold text-dark mb-2">Order Confirmed!</h2>
              <p className="text-muted mb-4">
                Thank you for your order. Reference ID: <strong className="text-primary">#{successOrder.id}</strong>
              </p>

              <div className="p-3 bg-light rounded-3 text-start mb-4">
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Total Amount:</span>
                  <span className="fw-bold text-primary">{formatPrice(successOrder.total)}</span>
                </div>
                <div className="d-flex justify-content-between mb-2">
                  <span className="text-muted small">Items Purchased:</span>
                  <span className="fw-medium">{successOrder.items.length} item(s)</span>
                </div>
                <div className="d-flex justify-content-between">
                  <span className="text-muted small">Delivery Address:</span>
                  <span className="small text-truncate" style={{ maxWidth: 200 }}>
                    {successOrder.address}
                  </span>
                </div>
              </div>

              <div className="d-flex gap-2 justify-content-center">
                <Link to={ROUTES.USER_ORDERS} className="btn btn-primary px-4 py-2 fw-medium">
                  <i className="bi bi-receipt me-2" />
                  View My Orders
                </Link>
                <Link to={ROUTES.PRODUCTS} className="btn btn-outline-secondary px-4 py-2 fw-medium">
                  Continue Shopping
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (items.length === 0) {
    return (
      <main className="container-xl py-5 text-center" id="checkout-empty-page">
        <i className="bi bi-cart-x display-3 text-secondary mb-3 d-block" />
        <h3 className="fw-bold mb-2">Your Cart is Empty</h3>
        <p className="text-muted mb-4">Add items to your cart before proceeding to checkout.</p>
        <Link to={ROUTES.PRODUCTS} className="btn btn-primary px-4 py-2">
          Browse Products
        </Link>
      </main>
    );
  }

  return (
    <main className="container-xl py-5" id="checkout-page">
      <div className="d-flex align-items-center gap-2 mb-4">
        <Link to={ROUTES.USER_CART} className="btn btn-outline-secondary btn-sm">
          <i className="bi bi-arrow-left me-1" />
          Back to Cart
        </Link>
        <h1 className="fw-bold mb-0">Checkout</h1>
      </div>

      {error && (
        <div className="alert alert-danger mb-4">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="row g-4">
          {/* BUYER INFORMATION FORM */}
          <div className="col-lg-7">
            <div className="card border-0 shadow-sm p-4 mb-4">
              <h5 className="fw-bold mb-4">Delivery & Contact Details</h5>

              <div className="row g-3">
                <div className="col-md-6">
                  <Input
                    id="co-name"
                    label="Full Name *"
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    required
                    placeholder="e.g. Ana Reyes"
                  />
                </div>
                <div className="col-md-6">
                  <Input
                    id="co-email"
                    label="Email Address *"
                    name="email"
                    type="email"
                    value={form.email}
                    onChange={handleChange}
                    required
                    placeholder="name@example.com"
                  />
                </div>
                <div className="col-12">
                  <Input
                    id="co-phone"
                    label="Contact Phone Number *"
                    name="phone"
                    value={form.phone}
                    onChange={handleChange}
                    required
                    placeholder="e.g. +63 917 123 4567"
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="co-address" className="form-label fw-medium">
                    Delivery Address *
                  </label>
                  <textarea
                    id="co-address"
                    name="address"
                    className="form-control"
                    rows={3}
                    value={form.address}
                    onChange={handleChange}
                    required
                    placeholder="Street, Barangay, City, Province, Postal Code"
                  />
                </div>
                <div className="col-12">
                  <label htmlFor="co-notes" className="form-label fw-medium">
                    Optional Delivery Notes
                  </label>
                  <textarea
                    id="co-notes"
                    name="notes"
                    className="form-control"
                    rows={2}
                    value={form.notes}
                    onChange={handleChange}
                    placeholder="Gate instructions, preferred delivery time, etc."
                  />
                </div>
              </div>
            </div>
          </div>

          {/* ORDER SUMMARY */}
          <div className="col-lg-5">
            <div className="card border-0 shadow-sm p-4 sticky-top" style={{ top: '2rem' }}>
              <h5 className="fw-bold mb-4">Order Summary</h5>

              <div className="mb-3 overflow-y-auto" style={{ maxHeight: 240 }}>
                {items.map((item) => (
                  <div key={item.productId} className="d-flex justify-content-between align-items-center py-2 border-bottom">
                    <div>
                      <p className="fw-medium mb-0 small text-truncate" style={{ maxWidth: 220 }}>
                        {item.name}
                      </p>
                      <p className="text-muted small mb-0">
                        {item.qty} × {formatPrice(item.price)}
                      </p>
                    </div>
                    <span className="fw-semibold small">{formatPrice(item.price * item.qty)}</span>
                  </div>
                ))}
              </div>

              <div className="d-flex justify-content-between mb-2 small">
                <span className="text-muted">Subtotal</span>
                <span className="fw-medium">{formatPrice(cartTotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-3 small">
                <span className="text-muted">Shipping Fee</span>
                <span className="text-success fw-medium">{formatPrice(shipping)}</span>
              </div>

              <hr />

              <div className="d-flex justify-content-between mb-4">
                <span className="fw-bold fs-6">Grand Total</span>
                <span className="fw-bold fs-5 text-primary">{formatPrice(grandTotal)}</span>
              </div>

              <button
                type="submit"
                className="btn btn-primary w-100 py-3 fw-bold fs-6 shadow-sm"
                disabled={loading}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" />
                ) : (
                  <i className="bi bi-bag-check-fill me-2" />
                )}
                Place Order ({formatPrice(grandTotal)})
              </button>
            </div>
          </div>
        </div>
      </form>
    </main>
  );
}

export default Checkout;
