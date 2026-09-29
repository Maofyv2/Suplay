import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { getProducts, deleteProduct, updateProduct } from '../../services/productService';
import { formatPrice } from '../../utils/formatPrice';
import EditProductModal from '../../modals/EditProductModal';
import ConfirmModal from '../../modals/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';
import { ROUTES } from '../../utils/constants';

function MyProducts() {
  const { currentUser } = useAuth();
  const { showToast } = useApp();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editTarget, setEditTarget] = useState(null);
  const [confirm, setConfirm] = useState({ isOpen: false, productId: null });
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadProducts = () => {
    getProducts().then((data) => {
      const myId = currentUser?.id;
      const mySupId = currentUser?.supplierId;
      const filtered = data.filter(
        (p) => String(p.supplierId) === String(myId) || String(p.supplierId) === String(mySupId)
      );
      setProducts(filtered);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]);

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

  const displayedProducts = useMemo(() => {
    return products.filter((p) => {
      const matchesSearch =
        !search ||
        p.name?.toLowerCase().includes(search.toLowerCase()) ||
        p.category?.toLowerCase().includes(search.toLowerCase());
      const pStatus = p.status || 'active';
      const matchesStatus = !statusFilter || pStatus === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [products, search, statusFilter]);

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="my-products-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">My Products</h1>
          <p className="text-muted small mb-0">Total products: {products.length}</p>
        </div>
        <Link to={ROUTES.SUPPLIER_ADD_PRODUCT} className="btn btn-primary btn-sm">
          <i className="bi bi-plus-circle me-2" />
          Add Product
        </Link>
      </div>

      {products.length === 0 ? (
        <EmptyState
          icon="bi-box-seam"
          title="No products yet"
          description="Start by adding your first product."
          action={
            <Link to={ROUTES.SUPPLIER_ADD_PRODUCT} className="btn btn-primary btn-sm">
              Add Product
            </Link>
          }
        />
      ) : (
        <>
          {/* Search & Status Filter */}
          <div className="card border-0 shadow-sm p-3 mb-4">
            <div className="row g-2">
              <div className="col-12 col-md-8">
                <div className="input-group">
                  <span className="input-group-text bg-light border-end-0">
                    <i className="bi bi-search text-muted" />
                  </span>
                  <input
                    type="text"
                    className="form-control border-start-0 ps-0"
                    placeholder="Search by product name or category..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </div>
              </div>
              <div className="col-10 col-md-3">
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
              {(search || statusFilter) && (
                <div className="col-2 col-md-1 d-flex">
                  <button
                    className="btn btn-outline-secondary w-100"
                    title="Reset filters"
                    onClick={() => {
                      setSearch('');
                      setStatusFilter('');
                    }}
                  >
                    <i className="bi bi-x-lg" />
                  </button>
                </div>
              )}
            </div>
          </div>

          {displayedProducts.length === 0 ? (
            <EmptyState
              icon="bi-funnel"
              title="No matching products"
              description="Try adjusting your search or status filter."
            />
          ) : (
            <div className="card border-0 shadow-sm">
              <div className="table-responsive">
                <table className="table table-hover align-middle mb-0">
                  <thead className="table-light">
                    <tr>
                      <th>Name</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>MOQ</th>
                      <th>Status</th>
                      <th className="text-end pe-4">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {displayedProducts.map((product) => {
                      const isActive = (product.status || 'active') === 'active';
                      return (
                        <tr key={product.id}>
                          <td className="fw-medium">
                            <div className="d-flex align-items-center gap-2">
                              {product.image ? (
                                <img
                                  src={product.image}
                                  alt={product.name}
                                  className="rounded border"
                                  style={{ width: '38px', height: '38px', objectFit: 'cover', flexShrink: 0 }}
                                />
                              ) : (
                                <div
                                  className="rounded bg-light d-flex align-items-center justify-content-center text-muted border"
                                  style={{ width: '38px', height: '38px', flexShrink: 0 }}
                                >
                                  <i className="bi bi-box-seam" />
                                </div>
                              )}
                              <span>{product.name}</span>
                            </div>
                          </td>
                          <td>
                            <span className="badge bg-primary-subtle text-primary">
                              {product.category}
                            </span>
                          </td>
                          <td className="fw-medium">{formatPrice(product.price)}</td>
                          <td>
                            <span className={product.stock < 10 ? 'text-danger fw-bold' : ''}>
                              {product.stock} {product.unit}
                              {product.stock < 10 && (
                                <i
                                  className="bi bi-exclamation-triangle ms-1"
                                  title="Low Stock"
                                />
                              )}
                            </span>
                          </td>
                          <td>{product.moq}</td>
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
        </>
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
        message="This product will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ isOpen: false, productId: null })}
      />
    </main>
  );
}

export default MyProducts;
