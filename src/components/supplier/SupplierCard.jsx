function SupplierCard({ supplier, onViewDetails }) {
  return (
    <div
      className="card h-100 border-0 shadow-sm suplay-supplier-card"
      style={{ cursor: 'pointer' }}
      onClick={() => onViewDetails?.(supplier)}
    >
      <div className="card-body p-4">
        {/* Header */}
        <div className="d-flex align-items-start gap-3 mb-3">
          <div className="suplay-supplier-logo d-flex align-items-center justify-content-center flex-shrink-0">
            {supplier.logo ? (
              <img src={supplier.logo} alt={supplier.name} className="img-fluid rounded" />
            ) : (
              <i className="bi bi-building text-primary fs-4" />
            )}
          </div>
          <div className="flex-grow-1 min-w-0">
            <h6 className="fw-bold mb-0 text-truncate">{supplier.name}</h6>
            <span className="badge bg-primary-subtle text-primary small">{supplier.category}</span>
          </div>
          {supplier.verified && (
            <span title="Verified Supplier">
              <i className="bi bi-patch-check-fill text-success fs-5" />
            </span>
          )}
        </div>

        {/* Description */}
        <p className="small text-muted mb-3 lh-base" style={{ WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
          {supplier.description}
        </p>

        {/* Meta */}
        <div className="d-flex gap-3 mb-3 small text-muted">
          <span><i className="bi bi-star-fill text-warning me-1" />{supplier.rating}</span>
          <span><i className="bi bi-box-seam me-1" />{supplier.totalProducts} products</span>
        </div>

        <div className="d-flex gap-2">
          <button
            className="btn btn-outline-primary btn-sm flex-grow-1"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails?.(supplier);
            }}
          >
            View Supplier
          </button>
        </div>
      </div>
    </div>
  );
}

export default SupplierCard;
