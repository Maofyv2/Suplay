import { useCart } from '../../context/CartContext';
import { formatPrice } from '../../utils/formatPrice';

function CartItem({ item }) {
  const { updateQty, removeFromCart } = useCart();

  const handleInputChange = (e) => {
    const val = Number(e.target.value);
    if (e.target.value !== '' && Number.isInteger(val) && val > 0) {
      updateQty(item.productId, val);
    }
  };

  const handleDecrease = () => {
    if (item.qty > (item.moq || 1)) {
      updateQty(item.productId, item.qty - 1);
    }
  };

  const handleIncrease = () => {
    const stockLimit = item.stock !== undefined ? item.stock : 9999;
    if (item.qty < stockLimit) {
      updateQty(item.productId, item.qty + 1);
    }
  };

  return (
    <div className="d-flex align-items-center gap-3 py-3 border-bottom">
      {/* Thumbnail */}
      <div
        className="d-flex align-items-center justify-content-center rounded-2 bg-light flex-shrink-0"
        style={{ width: 64, height: 64 }}
      >
        {item.image ? (
          <img
            src={item.image}
            alt={item.name}
            style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '0.375rem' }}
          />
        ) : (
          <i className="bi bi-box-seam text-secondary fs-3" />
        )}
      </div>

      {/* Info */}
      <div className="flex-grow-1 min-w-0">
        <p className="fw-semibold mb-0 text-truncate text-dark">{item.name}</p>
        <p className="small text-muted mb-1">
          <i className="bi bi-truck me-1" />
          {item.supplierName}
        </p>
        <div className="d-flex align-items-center gap-2 small">
          <span className="text-primary fw-bold">{formatPrice(item.price)}</span>
          {item.moq && item.moq > 1 && (
            <span className="badge bg-light text-secondary border">MOQ: {item.moq}</span>
          )}
        </div>
      </div>

      {/* Qty Controls */}
      <div className="d-flex align-items-center gap-1 flex-shrink-0">
        <button
          className="btn btn-outline-secondary btn-sm px-2"
          onClick={handleDecrease}
          disabled={item.qty <= (item.moq || 1)}
          aria-label="Decrease quantity"
        >
          <i className="bi bi-dash" />
        </button>
        <input
          type="number"
          className="form-control form-control-sm text-center px-1"
          style={{ width: 52 }}
          value={item.qty}
          onChange={handleInputChange}
          min={item.moq || 1}
          max={item.stock ?? 9999}
        />
        <button
          className="btn btn-outline-secondary btn-sm px-2"
          onClick={handleIncrease}
          disabled={item.stock !== undefined && item.qty >= item.stock}
          aria-label="Increase quantity"
        >
          <i className="bi bi-plus" />
        </button>
      </div>

      {/* Line Subtotal */}
      <div className="text-end flex-shrink-0 ms-2" style={{ minWidth: 100 }}>
        <p className="fw-bold mb-1 text-dark">{formatPrice(item.price * item.qty)}</p>
        <button
          className="btn btn-link btn-sm text-danger p-0 text-decoration-none"
          onClick={() => removeFromCart(item.productId)}
          aria-label={`Remove ${item.name} from cart`}
        >
          <i className="bi bi-trash3 me-1" />
          <small>Remove</small>
        </button>
      </div>
    </div>
  );
}

export default CartItem;
