import { useState, useEffect, useMemo } from 'react';
import { getSuppliers, deleteSupplier, toggleSupplierVerification } from '../../services/supplierService';
import { useApp } from '../../context/AppContext';
import SupplierModal from '../../modals/SupplierModal';
import ConfirmModal from '../../modals/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

function ManageSuppliers() {
  const { showToast } = useApp();
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewTarget, setViewTarget] = useState(null);
  const [confirm, setConfirm] = useState({ isOpen: false, supplierId: null });
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [verificationFilter, setVerificationFilter] = useState('');

  const loadSuppliers = () => {
    getSuppliers().then((data) => {
      setSuppliers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadSuppliers();
  }, []);

  const handleDelete = async () => {
    if (!confirm.supplierId) return;
    try {
      await deleteSupplier(confirm.supplierId);
      setSuppliers((prev) => prev.filter((s) => s.id !== confirm.supplierId));
      showToast('Supplier removed successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to remove supplier.', 'error');
    } finally {
      setConfirm({ isOpen: false, supplierId: null });
    }
  };

  const handleToggleVerification = async (supplier) => {
    try {
      const updated = await toggleSupplierVerification(supplier.id);
      setSuppliers((prev) => prev.map((s) => (s.id === supplier.id ? updated : s)));
      showToast(
        `Supplier ${supplier.name} is now ${updated.verified ? 'Verified' : 'Unverified'}.`,
        'success'
      );
    } catch (err) {
      showToast(err.message || 'Failed to update verification.', 'error');
    }
  };

  const categories = useMemo(() => {
    return Array.from(new Set(suppliers.map((s) => s.category).filter(Boolean)));
  }, [suppliers]);

  const filteredSuppliers = useMemo(() => {
    return suppliers.filter((s) => {
      const matchesSearch =
        !search ||
        s.name?.toLowerCase().includes(search.toLowerCase()) ||
        s.category?.toLowerCase().includes(search.toLowerCase()) ||
        s.address?.toLowerCase().includes(search.toLowerCase());
      const matchesCategory = !categoryFilter || s.category === categoryFilter;
      const matchesVerification =
        verificationFilter === '' ||
        (verificationFilter === 'verified' && s.verified) ||
        (verificationFilter === 'unverified' && !s.verified);
      return matchesSearch && matchesCategory && matchesVerification;
    });
  }, [suppliers, search, categoryFilter, verificationFilter]);

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="manage-suppliers-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manage Suppliers</h1>
          <p className="text-muted small mb-0">Total suppliers: {suppliers.length}</p>
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
                placeholder="Search by name, category, or location..."
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
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={verificationFilter}
              onChange={(e) => setVerificationFilter(e.target.value)}
            >
              <option value="">All Statuses</option>
              <option value="verified">Verified</option>
              <option value="unverified">Unverified</option>
            </select>
          </div>
          {(search || categoryFilter || verificationFilter) && (
            <div className="col-12 col-md-1 d-flex">
              <button
                className="btn btn-outline-secondary w-100"
                title="Reset filters"
                onClick={() => {
                  setSearch('');
                  setCategoryFilter('');
                  setVerificationFilter('');
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredSuppliers.length === 0 ? (
        <EmptyState
          icon="bi-building"
          title="No suppliers found"
          message={
            search || categoryFilter || verificationFilter
              ? 'Try adjusting your search or filters.'
              : 'There are no suppliers registered yet.'
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
                  <th>Products</th>
                  <th>Rating</th>
                  <th>Verification</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSuppliers.map((supplier) => (
                  <tr key={supplier.id}>
                    <td className="fw-medium">{supplier.name}</td>
                    <td>
                      <span className="badge bg-primary-subtle text-primary">
                        {supplier.category}
                      </span>
                    </td>
                    <td>{supplier.totalProducts || 0}</td>
                    <td>
                      <i className="bi bi-star-fill text-warning me-1" />
                      {supplier.rating || 'N/A'}
                    </td>
                    <td>
                      <button
                        className={`btn btn-sm px-2 py-1 border-0 ${
                          supplier.verified
                            ? 'badge bg-success-subtle text-success'
                            : 'badge bg-secondary-subtle text-secondary'
                        }`}
                        style={{ cursor: 'pointer' }}
                        title="Click to toggle verification status"
                        onClick={() => handleToggleVerification(supplier)}
                      >
                        {supplier.verified ? 'Verified' : 'Unverified'}
                      </button>
                    </td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex gap-1">
                        <button
                          className="btn btn-sm btn-outline-primary"
                          title="View Supplier Details"
                          onClick={() => setViewTarget(supplier)}
                        >
                          <i className="bi bi-eye" />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Remove Supplier"
                          onClick={() => setConfirm({ isOpen: true, supplierId: supplier.id })}
                        >
                          <i className="bi bi-trash3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <SupplierModal supplier={viewTarget} onClose={() => setViewTarget(null)} />

      <ConfirmModal
        isOpen={confirm.isOpen}
        title="Remove Supplier"
        message="This supplier and their products will be removed from the platform."
        confirmLabel="Remove"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ isOpen: false, supplierId: null })}
      />
    </main>
  );
}

export default ManageSuppliers;
