import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getProducts } from '../../services/productService';
import { getSuppliers } from '../../services/supplierService';
import ProductGrid from '../../components/product/ProductGrid';
import ProductModal from '../../modals/ProductModal';
import { ROUTES } from '../../utils/constants';

function Home() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedProduct, setSelectedProduct] = useState(null);

  useEffect(() => {
    Promise.all([getProducts(), getSuppliers()]).then(([prods, sups]) => {
      setFeaturedProducts(prods.slice(0, 4));
      setSuppliers(sups);
      setLoading(false);
    });
  }, []);

  return (
    <main id="home-page">
      {/* Hero */}
      <section className="suplay-hero py-5">
        <div className="container-xl py-4">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <span className="badge bg-primary-subtle text-primary mb-3 px-3 py-2 rounded-pill">
                🇵🇭 Philippines #1 B2B Marketplace
              </span>
              <h1 className="display-5 fw-bold lh-sm mb-3">
                Source Smarter.<br />
                <span className="text-primary">Buy Better.</span>
              </h1>
              <p className="lead text-muted mb-4">
                Connect with verified suppliers across the Philippines. Browse thousands of products, compare prices, and manage your procurement all in one place.
              </p>
              <div className="d-flex gap-3 flex-wrap">
                <Link to={ROUTES.PRODUCTS} className="btn btn-primary btn-lg">
                  <i className="bi bi-search me-2" />Browse Products
                </Link>
                <Link to={ROUTES.SUPPLIERS} className="btn btn-outline-primary btn-lg">
                  Find Suppliers
                </Link>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="row g-3">
                {[
                  { icon: 'bi-building', label: 'Verified Suppliers', value: '200+' },
                  { icon: 'bi-box-seam', label: 'Products Listed', value: '5,000+' },
                  { icon: 'bi-receipt', label: 'Orders Processed', value: '12,000+' },
                  { icon: 'bi-shield-check', label: 'Trusted Buyers', value: '3,500+' },
                ].map((stat) => (
                  <div className="col-6" key={stat.label}>
                    <div className="card border-0 shadow-sm p-4 text-center h-100">
                      <i className={`bi ${stat.icon} fs-2 text-primary mb-2`} />
                      <p className="fw-bold fs-4 mb-0">{stat.value}</p>
                      <p className="text-muted small mb-0">{stat.label}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-5 bg-light">
        <div className="container-xl">
          <div className="d-flex align-items-center justify-content-between mb-4">
            <h2 className="fw-bold mb-0">Featured Products</h2>
            <Link to={ROUTES.PRODUCTS} className="btn btn-outline-primary btn-sm">View All</Link>
          </div>
          <ProductGrid products={featuredProducts} loading={loading} onViewDetails={setSelectedProduct} />
        </div>
      </section>

      {/* Why Suplay */}
      <section className="py-5">
        <div className="container-xl">
          <h2 className="fw-bold text-center mb-5">Why Choose Suplay?</h2>
          <div className="row g-4">
            {[
              { icon: 'bi-patch-check', title: 'Verified Suppliers', desc: 'Every supplier is vetted and verified before listing products on our platform.' },
              { icon: 'bi-currency-exchange', title: 'Competitive Pricing', desc: 'Access wholesale prices directly from manufacturers and distributors.' },
              { icon: 'bi-headset', title: 'Dedicated Support', desc: 'Our procurement specialists are available to assist with your sourcing needs.' },
              { icon: 'bi-lock-fill', title: 'Secure Transactions', desc: 'Protected payments and order tracking from purchase to delivery.' },
            ].map((item) => (
              <div className="col-sm-6 col-lg-3" key={item.title}>
                <div className="text-center p-4">
                  <div className="suplay-feature-icon mx-auto mb-3">
                    <i className={`bi ${item.icon} fs-3 text-primary`} />
                  </div>
                  <h5 className="fw-semibold mb-2">{item.title}</h5>
                  <p className="text-muted small mb-0">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
      <ProductModal product={selectedProduct} onClose={() => setSelectedProduct(null)} />
    </main>
  );
}

export default Home;
