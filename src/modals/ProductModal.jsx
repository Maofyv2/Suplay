
import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useApp } from '../context/AppContext';
import { formatPrice } from '../utils/formatPrice';
import { ROLES, ROUTES } from '../utils/constants';

function ProductModal({ product, onClose }) {
  const { addToCart } = useCart();
  const { role } = useAuth();
  const { showToast } = useApp();
  const navigate = useNavigate();

  const initialQty = product ? Math.max(1, product.moq || 1) : 1;

  const [quantity, setQuantity] = useState(initialQty);
  const [quantityError, setQuantityError] = useState('');
  const [showContact, setShowContact] = useState(false);

  // Sync quantity when product changes
  useEffect(() => {
    if (product) {
      const minVal = Math.max(1, product.moq || 1);
      setQuantity(minVal);
      setQuantityError('');
      setShowContact(false);
    }
  }, [product]);

  // Lock page scroll
  useEffect(() => {
    if (!product) return;

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [product]);

  // Close with ESC
  useEffect(() => {
    if (!product) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [product, onClose]);

  if (!product) return null;

  const validateAndSetQty = (val) => {
    const num = parseInt(val, 10);

    if (isNaN(num)) {
      setQuantity('');
      setQuantityError('Please enter a valid quantity.');
      return;
    }

    if (num < (product.moq || 1)) {
      setQuantity(num);
      setQuantityError(
        `Minimum order quantity (MOQ) is ${product.moq} ${product.unit}.`
      );
    } else if (
      product.stock !== undefined &&
      num > product.stock
    ) {
      setQuantity(num);
      setQuantityError(
        `Quantity cannot exceed available stock (${product.stock} ${product.unit}).`
      );
    } else {
      setQuantity(num);
      setQuantityError('');
    }
  };

  const handleDecrease = () => {
    const minQty = Math.max(1, product.moq || 1);

    if (quantity > minQty) {
      validateAndSetQty(quantity - 1);
    }
  };

  const handleIncrease = () => {
    if (
      product.stock === undefined ||
      quantity < product.stock
    ) {
      validateAndSetQty(quantity + 1);
    }
  };

  const isQtyValid = () => {
    const num = Number(quantity);

    if (isNaN(num) || num <= 0) return false;
    if (product.moq && num < product.moq) return false;

    if (
      product.stock !== undefined &&
      num > product.stock
    ) {
      return false;
    }

    return true;
  };

  const handleAddToCart = () => {
    if (!isQtyValid()) return;

    addToCart(product, Number(quantity));

    showToast(
      `Added ${quantity} ${product.unit}(s) of "${product.name}" to cart!`,
      'success'
    );

    onClose();
  };

  const handleBuyNow = () => {
    if (!isQtyValid()) return;

    addToCart(product, Number(quantity));
    onClose();
    navigate(ROUTES.USER_CHECKOUT);
  };

  return createPortal(
    <div
      className="position-fixed top-0 start-0 w-100 h-100 d-flex align-items-center justify-content-center p-3"
      style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
      }}
      onClick={onClose}
    >
      {/* MODAL */}
      <div
        className="bg-white border rounded-3 d-flex flex-column"
        style={{
          width: '100%',
          maxWidth: '820px',
          maxHeight: '90vh',
          overflow: 'hidden',
          boxShadow: '0 8px 30px rgba(0,0,0,0.15)',
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="product-modal-title"
      >

        {/* HEADER */}
        <div className="d-flex align-items-center justify-content-between px-4 py-3 border-bottom">
          <div>
            <span className="badge bg-light text-primary border fw-medium">
              {product.category}
            </span>
          </div>

          <button
            type="button"
            className="btn-close"
            onClick={onClose}
            aria-label="Close"
          />
        </div>

        {/* BODY */}
        <div className="p-4 overflow-auto">

          <div className="row g-4">

            {/* PRODUCT IMAGE */}
            <div className="col-md-5">

              <div
                className="bg-light border rounded-3 d-flex align-items-center justify-content-center"
                style={{
                  height: '300px',
                  width: '100%',
                }}
              >
                {product.image ? (
                  <img
                    src={product.image}
                    alt={product.name}
                    className="img-fluid"
                    style={{
                      maxHeight: '260px',
                      maxWidth: '90%',
                      objectFit: 'contain',
                    }}
                  />
                ) : (
                  <i className="bi bi-box-seam display-3 text-secondary" />
                )}
              </div>

            </div>

            {/* PRODUCT DETAILS */}
            <div className="col-md-7">

              {/* TITLE */}
              <h4
                id="product-modal-title"
                className="fw-bold text-dark mb-2"
              >
                {product.name}
              </h4>

              {/* RATING */}
              <div className="d-flex align-items-center gap-2 mb-3">

                <span className="text-warning">
                  <i className="bi bi-star-fill"></i>
                </span>

                <span className="fw-semibold">
                  {product.rating || 5.0}
                </span>

                <span className="text-muted small">
                  ({product.reviews || 0} reviews)
                </span>

              </div>

              {/* PRICE */}
              <div className="mb-3">
                <div className="small text-muted mb-1">
                  Price
                </div>

                <div className="fs-3 fw-bold text-primary">
                  {formatPrice(product.price)}
                </div>

                <small className="text-muted">
                  per {product.unit}
                </small>
              </div>

              {/* DESCRIPTION */}
              <div className="mb-4">
                <div className="small fw-semibold text-dark mb-1">
                  Description
                </div>

                <p className="text-muted small mb-0 lh-base">
                  {product.description || 'No description available.'}
                </p>
              </div>

              {/* PRODUCT INFORMATION */}
              <div className="border-top border-bottom py-2 mb-3">

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted small">
                    Minimum Order
                  </span>

                  <span className="fw-semibold small">
                    {product.moq} {product.unit}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted small">
                    Available Stock
                  </span>

                  <span className="fw-semibold small">
                    {product.stock} {product.unit}
                  </span>
                </div>

                <div className="d-flex justify-content-between py-2">
                  <span className="text-muted small">
                    Supplier
                  </span>

                  <span
                    className="fw-semibold small text-truncate ms-3"
                    style={{ maxWidth: '200px' }}
                  >
                    {product.supplierName}
                  </span>
                </div>

              </div>

              {/* QUANTITY */}
              {role === ROLES.USER && (
                <div className="mb-3">

                  <div className="d-flex justify-content-between align-items-center mb-2">

                    <label
                      htmlFor="modal-qty-input"
                      className="small fw-semibold mb-0"
                    >
                      Quantity
                    </label>

                    <span className="small text-muted">
                      Total:{' '}
                      <strong className="text-dark">
                        {formatPrice(
                          (Number(quantity) || 0) *
                            product.price
                        )}
                      </strong>
                    </span>

                  </div>

                  <div className="d-flex align-items-center">

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      style={{
                        width: '40px',
                        height: '38px',
                      }}
                      onClick={handleDecrease}
                      disabled={
                        quantity <= (product.moq || 1)
                      }
                    >
                      <i className="bi bi-dash"></i>
                    </button>

                    <input
                      id="modal-qty-input"
                      type="number"
                      className="form-control text-center fw-semibold mx-2"
                      style={{
                        maxWidth: '90px',
                        height: '38px',
                      }}
                      value={quantity}
                      onChange={(e) =>
                        validateAndSetQty(e.target.value)
                      }
                      min={product.moq || 1}
                      max={product.stock || 9999}
                    />

                    <button
                      type="button"
                      className="btn btn-outline-secondary"
                      style={{
                        width: '40px',
                        height: '38px',
                      }}
                      onClick={handleIncrease}
                      disabled={
                        product.stock !== undefined &&
                        quantity >= product.stock
                      }
                    >
                      <i className="bi bi-plus"></i>
                    </button>

                  </div>

                  {quantityError && (
                    <div className="text-danger small mt-2">
                      <i className="bi bi-exclamation-circle me-1"></i>
                      {quantityError}
                    </div>
                  )}

                </div>
              )}

              {/* CONTACT INFO */}
              {showContact && (
                <div className="border rounded-2 p-3 mb-3 bg-light">

                  <div className="small fw-semibold mb-2">
                    Contact Supplier
                  </div>

                  <div className="small text-muted mb-1">
                    <i className="bi bi-building me-2"></i>
                    {product.supplierName}
                  </div>

                  <div className="small text-muted mb-1">
                    <i className="bi bi-envelope me-2"></i>
                    sales@
                    {product.supplierName
                      ?.toLowerCase()
                      .replace(/\s+/g, '')}
                    .com
                  </div>

                  <div className="small text-muted">
                    <i className="bi bi-telephone me-2"></i>
                    +63 2 8123 4567
                  </div>

                </div>
              )}

              {/* ACTIONS */}
              <div className="d-flex gap-2 pt-1">

                {role === ROLES.USER ? (
                  <>
                    <button
                      type="button"
                      className="btn btn-primary flex-grow-1 py-2 fw-semibold"
                      onClick={handleAddToCart}
                      disabled={!isQtyValid()}
                    >
                      <i className="bi bi-cart-plus me-2"></i>
                      Add to Cart
                    </button>

                    <button
                      type="button"
                      className="btn btn-success flex-grow-1 py-2 fw-semibold"
                      onClick={handleBuyNow}
                      disabled={!isQtyValid()}
                    >
                      Buy Now
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary px-3"
                      onClick={() =>
                        setShowContact(!showContact)
                      }
                      title="Contact Supplier"
                    >
                      <i className="bi bi-telephone"></i>
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      type="button"
                      className="btn btn-outline-primary flex-grow-1 py-2 fw-semibold"
                      onClick={() =>
                        setShowContact(!showContact)
                      }
                    >
                      <i className="bi bi-telephone me-2"></i>
                      Contact Supplier
                    </button>

                    <button
                      type="button"
                      className="btn btn-outline-secondary px-4"
                      onClick={onClose}
                    >
                      Close
                    </button>
                  </>
                )}

              </div>

            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

export default ProductModal;

