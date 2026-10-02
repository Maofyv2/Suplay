import { useState, useEffect, useMemo } from 'react';
import { getProducts, deleteProduct, updateProduct } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import { useApp } from '../../context/AppContext';
import { PRODUCT_CATEGORIES } from '../../utils/constants';
import ConfirmModal from '../../modals/ConfirmModal';
import EditProductModal from '../../modals/EditProductModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

function ManageProducts() {
  const { showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm, setConfirm] = useState({ isOpen: false, productId: null });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProducts = () => {
    getProducts().then((data) => {
      setProducts(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
  }, []);

  const handleDelete = async () => {
    if (!confirm.productId) return;
    try {
      await deleteProduct(confirm.productId);
      setProducts((prev) => prev.filter((p) => p.id !== confirm.productId));
      showToast('Product deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete product.', 'error');
    } finally {
      setConfirm({ isOpen: false, productId: null });
    }
  };

  const handleEditSave = async (updatedData) => {
    if (!editTarget) return;
    try {
      const updated = await updateProduct(editTarget.id, updatedData);
      setProducts((prev) => prev.map((p) => (p.id === editTarget.id ? updated : p)));
      showToast(`Product "${updated.name}" updated successfully.`, 'success');
      setEditTarget(null);
    } catch (err) {
      showToast(err.message || 'Failed to update product.', 'error');
    }
  };

  const handleToggleStatus = async (product) => {
    const currentStatus = product.status || 'active';
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    try {
      const updated = await updateProduct(product.id, { status: newStatus });
      setProducts((prev) => prev.map((p) => (p.id === product.id ? updated : p)));
      showToast(`Product "${product.name}" is now ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update status.', 'error');
    }
  };

  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase()) ||
        p.supplierName?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      const productStatus = p.status || 'active';
      const matchesStatus = !statusFilter || productStatus === statusFilter;
      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [products, search, categoryFilter, statusFilter]);

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="manage-products-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manage Products</h1>
          <p className="text-muted small mb-0">Total products: {products.length}</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="card border-0 shadow-sm p-3 mb-4">
        <div className="row g-2">
          <div className="col-12 col-md-5">
            <div className="input-group">
              <span className="input-group-text bg-light border-end-0">
                <i className="bi bi-search text-muted" />
              </span>
              <input
                type="text"
                className="form-control border-start-0 ps-0"
                placeholder="Search by product name, supplier, or category..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
            >
              <option value="">All Categories</option>
              {PRODUCT_CATEGORIES.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
          </div>
          {(search || categoryFilter || statusFilter) && (
            <div className="col-12 col-md-1 d-flex">
              <button
                className="btn btn-outline-secondary w-100"
                title="Reset filters"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setStatusFilter('');
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredProducts.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="No products found"
          message={
            search || categoryFilter || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'There are no products listed yet.'
          }
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Category</th>
                  <th>Supplier</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((product) => {
                  const isActive = (product.status || 'active') === 'active';
                  return (
                    <tr key={product.id}>
                      <td className="fw-medium">{product.name}</td>
                      <td>
                        <span className="badge bg-primary-subtle text-primary">
                          {product.category}
                        </span>
                      </td>
                      <td className="text-muted small">{product.supplierName}</td>
                      <td className="fw-medium">{formatPrice(product.price)}</td>
                      <td>
                        {product.stock}
                      </td>
                      <td>
                        <button
                          className={`btn btn-sm px-2 py-1 border-0 ${
                            isActive
                              ? 'badge bg-success-subtle text-success'
                              : 'badge bg-secondary-subtle text-secondary'
                          }`}
                          style={{ cursor: 'pointer' }}
                          title="Click to toggle active status"
                          onClick={() => handleToggleStatus(product)}
                        >
                          <i
                            className={`bi ${
                              isActive ? 'bi-check-circle-fill' : 'bi-dash-circle'
                            } me-1`}
                          />
                          {isActive ? 'Active' : 'Inactive'}
                        </button>
                      </td>
                      <td className="text-end pe-3">
                        <div className="d-inline-flex gap-1">
                          <button
                            className="btn btn-sm btn-outline-primary"
                            title="Edit Product"
                            onClick={() => setEditTarget(product)}
                          >
                            <i className="bi bi-pencil" />
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Delete Product"
                            onClick={() => setConfirm({ isOpen: true, productId: product.id })}
                          >
                            <i className="bi bi-trash3" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <EditProductModal
        isOpen={!!editTarget}
        product={editTarget}
        onClose={() => setEditTarget(null)}
        onSubmit={handleEditSave}
      />

      <ConfirmModal
        isOpen={confirm.isOpen}
        title="Delete Product"
        message="This product will be permanently removed from the platform."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ isOpen: false, productId: null })}
      />
    </main>
  );
}

export default ManageProducts;
