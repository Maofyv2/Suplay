import ProductCard from './ProductCard';
import Loading from '../common/Loading';
import EmptyState from '../common/EmptyState';

function ProductGrid({ products = [], loading = false, onViewDetails }) {
  if (loading) return <Loading message="Loading products…" />;

  if (products.length === 0) {
    return (
      <EmptyState
        icon="bi-box-seam"
        title="No products yet"
        description="Try adjusting your filters or search query."
      />
    );
  }

  return (
    <div className="row row-cols-1 row-cols-sm-2 row-cols-md-3 row-cols-xl-4 g-4">
      {products.map((product) => (
        <div className="col" key={product.id}>
          <ProductCard product={product} onViewDetails={onViewDetails} />
        </div>
      ))}
    </div>
  );
}

export default ProductGrid;
