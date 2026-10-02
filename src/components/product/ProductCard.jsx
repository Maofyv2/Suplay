import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { formatPrice } from '../../utils/formatPrice';
import { ROLES } from '../../utils/constants';

function ProductCard({ product, onViewDetails }) {
  const { addToCart } = useCart();
  const { role } = useAuth();

  return (
    <div
      className="card h-100 suplay-product-card border-0 shadow-sm"
      style={{ cursor: 'pointer' }}
      onClick={() => onViewDetails?.(product)}
    >
      {/* Thumbnail */}
      <div className="suplay-product-thumb d-flex align-items-center justify-content-center">
        {product.image ? (
          <img src={product.image} alt={product.name} className="img-fluid" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : (
          <i className="bi bi-box-seam display-5 text-secondary" aria-hidden="true" />
        )}
        <span className="badge bg-primary position-absolute top-0 start-0 m-2">
          {product.category}
        </span>
      </div>

      <div className="card-body d-flex flex-column p-3">
        <h6 className="card-title fw-semibold mb-1 lh-sm">{product.name}</h6>
        <p className="text-muted small mb-2">
          <i className="bi bi-truck me-1" />
          {product.supplierName}
        </p>

        <div className="d-flex align-items-center gap-1 mb-2">
          <i className="bi bi-star-fill text-warning small" />
          <span className="small fw-medium">{product.rating}</span>
          <span className="text-muted small">({product.reviews})</span>
        </div>

        <div className="mt-auto">
          <div className="d-flex align-items-baseline gap-1 mb-1">
            <span className="fw-bold fs-5 text-primary">{formatPrice(product.price)}</span>
            <span className="text-muted small">/ {product.unit}</span>
          </div>
          <p className="text-muted small mb-3">MOQ: {product.moq} {product.unit}</p>

          <div className="d-flex gap-2">
            <button
              className="btn btn-outline-primary btn-sm flex-grow-1"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails?.(product);
              }}
            >
              View Details
            </button>
            {role === ROLES.USER && (
              <button
                className="btn btn-primary btn-sm"
                onClick={(e) => {
                  e.stopPropagation();
                  addToCart(product, product.moq);
                }}
                disabled={Number(product.stock) < Math.max(1, Number(product.moq) || 1)}
                title={Number(product.stock) < Math.max(1, Number(product.moq) || 1)
                  ? 'Not enough stock to meet the minimum order quantity'
                  : 'Add to cart'}
                aria-label={`Add ${product.name} to cart`}
              >
                <i className="bi bi-cart-plus" />
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default ProductCard;
