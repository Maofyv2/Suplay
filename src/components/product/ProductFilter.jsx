import { useState, useEffect } from 'react';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import { getSuppliers } from '../../services/supplierService';

function ProductFilter({ filters, onChange }) {
  const [suppliers, setSuppliers] = useState([]);

  useEffect(() => {
    getSuppliers().then((data) => setSuppliers(data));
  }, []);

  const handleChange = (key, value) => {
    onChange?.({ ...filters, [key]: value });
  };

  return (
    <div className="suplay-filter-bar d-flex flex-wrap gap-3 align-items-end mb-4 p-3 rounded-3 border bg-light">
      {/* Search */}
      <div className="flex-grow-1" style={{ minWidth: 200 }}>
        <label htmlFor="filter-search" className="form-label small fw-medium mb-1">
          Search Products
        </label>
        <div className="input-group input-group-sm">
          <span className="input-group-text">
            <i className="bi bi-search" />
          </span>
          <input
            id="filter-search"
            type="text"
            className="form-control"
            placeholder="Search products or descriptions…"
            value={filters?.search || ''}
            onChange={(e) => handleChange('search', e.target.value)}
          />
        </div>
      </div>

      {/* Category Filter */}
      <div style={{ minWidth: 160 }}>
        <label htmlFor="filter-category" className="form-label small fw-medium mb-1">
          Category
        </label>
        <select
          id="filter-category"
          className="form-select form-select-sm"
          value={filters?.category || ''}
          onChange={(e) => handleChange('category', e.target.value)}
        >
          <option value="">All Categories</option>
          {PRODUCT_CATEGORIES.map((cat) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {/* Supplier Filter */}
      <div style={{ minWidth: 170 }}>
        <label htmlFor="filter-supplier" className="form-label small fw-medium mb-1">
          Supplier
        </label>
        <select
          id="filter-supplier"
          className="form-select form-select-sm"
          value={filters?.supplierId || ''}
          onChange={(e) => handleChange('supplierId', e.target.value)}
        >
          <option value="">All Suppliers</option>
          {suppliers.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>

      {/* Sort By */}
      <div style={{ minWidth: 150 }}>
        <label htmlFor="filter-sort" className="form-label small fw-medium mb-1">
          Sort By
        </label>
        <select
          id="filter-sort"
          className="form-select form-select-sm"
          value={filters?.sortBy || ''}
          onChange={(e) => handleChange('sortBy', e.target.value)}
        >
          <option value="">Default</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="rating-desc">Highest Rated</option>
        </select>
      </div>

      {/* Reset */}
      <button
        className="btn btn-outline-secondary btn-sm"
        onClick={() => onChange?.({ search: '', category: '', supplierId: '', sortBy: '' })}
        type="button"
      >
        <i className="bi bi-x-circle me-1" />
        Reset
      </button>
    </div>
  );
}

export default ProductFilter;

