import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import CartItem from '../../components/cart/CartItem';
import CartSummary from '../../components/cart/CartSummary';
import EmptyState from '../../components/common/EmptyState';
import ConfirmModal from '../../modals/ConfirmModal';
import { useCart } from '../../context/CartContext';
import { ROUTES } from '../../utils/constants';

function Cart() {
  const { items, clearCart } = useCart();
  const navigate = useNavigate();
  const [showClearModal, setShowClearModal] = useState(false);

  const handleConfirmClear = () => {
    clearCart();
    setShowClearModal(false);
  };

  return (
    <main className="container-xl py-5" id="cart-page">
      <h1 className="fw-bold mb-4">Your Cart</h1>

      {items.length === 0 ? (
        <EmptyState
          icon="bi-cart-x"
          title="Your cart is empty"
          description="Browse products and add items to get started."
          action={
            <button className="btn btn-primary" onClick={() => navigate(ROUTES.PRODUCTS)}>
              <i className="bi bi-search me-2" />Browse Products
            </button>
          }
        />
      ) : (
        <div className="row g-4 align-items-start">
          <div className="col-lg-8">
            <div className="card border-0 shadow-sm p-4">
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h5 className="fw-semibold mb-0">{items.length} {items.length === 1 ? 'item' : 'items'} in cart</h5>
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => setShowClearModal(true)}
                >
                  <i className="bi bi-trash3 me-1" />
                  Clear Cart
                </button>
              </div>
              <div>
                {items.map((item) => (
                  <CartItem key={item.productId} item={item} />
                ))}
              </div>
            </div>
          </div>
          <div className="col-lg-4">
            <CartSummary
              onCheckout={() => navigate(ROUTES.USER_CHECKOUT)}
              onClearCart={() => setShowClearModal(true)}
            />
          </div>
        </div>
      )}

      <ConfirmModal
        isOpen={showClearModal}
        title="Clear Cart"
        message="Are you sure you want to remove all items from your cart? This action cannot be undone."
        confirmLabel="Yes, Clear Cart"
        variant="danger"
        onConfirm={handleConfirmClear}
        onCancel={() => setShowClearModal(false)}
      />
    </main>
  );
}

export default Cart;

