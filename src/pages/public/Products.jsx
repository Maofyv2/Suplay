import { useState, useEffect } from 'react';
import ProductGrid from '../../components/product/ProductGrid';
import ProductFilter from '../../components/product/ProductFilter';
import ProductModal from '../../modals/ProductModal';
import { getProducts } from '../../services/productService';

function Products() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search: '', category: '', supplierId: '', sortBy: '' });
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    setLoading(true);
    getProducts(filters).then((data) => {
      let sorted = [...data];
      if (filters.sortBy === 'price-asc') {
        sorted.sort((a, b) => a.price - b.price);
      } else if (filters.sortBy === 'price-desc') {
        sorted.sort((a, b) => b.price - a.price);
      } else if (filters.sortBy === 'rating-desc') {
        sorted.sort((a, b) => (b.rating || 0) - (a.rating || 0));
      }
      setProducts(sorted);
      setLoading(false);
    });
  }, [filters]);

  return (
    <main className="container-xl py-5" id="products-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Products</h1>
        <p className="text-muted">Browse our catalogue of B2B products from verified Philippine suppliers.</p>
      </div>

      <ProductFilter filters={filters} onChange={setFilters} />
      <ProductGrid products={products} loading={loading} onViewDetails={setSelectedProduct} />

      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}

export default Products;

