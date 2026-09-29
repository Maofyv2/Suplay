import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

function CartSummary({ onCheckout, onClearCart }) {
  const { cartTotal, cartCount } = useCart();

  const shipping = 0; // Standard shipping fee ₱0.00 as per specification
  const grandTotal = cartTotal + shipping;

  return (
    <div className="card border-0 shadow-sm p-4">
      <h5 className="fw-bold mb-4">Order Summary</h5>

      <div className="d-flex justify-content-between mb-2">
        <span className="text-muted">Subtotal ({cartCount} {cartCount === 1 ? 'item' : 'items'})</span>
        <span className="fw-medium">{formatPrice(cartTotal)}</span>
      </div>

      <div className="d-flex justify-content-between mb-3">
        <span className="text-muted">Shipping Fee</span>
        <span className="text-success fw-medium">{formatPrice(shipping)}</span>
      </div>

      <hr />

      <div className="d-flex justify-content-between mb-4">
        <span className="fw-bold">Grand Total</span>
        <span className="fw-bold fs-5 text-primary">{formatPrice(grandTotal)}</span>
      </div>

      <button
        className="btn btn-primary w-100 mb-2 py-2 fw-medium"
        onClick={onCheckout}
        disabled={cartCount === 0}
      >
        <i className="bi bi-shield-check me-2" />
        Proceed to Checkout
      </button>

      <button
        className="btn btn-outline-danger btn-sm w-100 py-2"
        onClick={onClearCart}
        disabled={cartCount === 0}
      >
        <i className="bi bi-trash3 me-1" />
        Clear Cart
      </button>
    </div>
  );
}

export default CartSummary;

