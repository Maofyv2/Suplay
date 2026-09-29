import { useState, useEffect } from 'react';
import SupplierCard from '../../components/supplier/SupplierCard';
import SupplierModal from '../../modals/SupplierModal';
import Loading from '../../components/common/Loading';
import EmptyState from '../../components/common/EmptyState';
import { getSuppliers } from '../../services/supplierService';

function Suppliers() {
  const [suppliers, setSuppliers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedSupplier, setSelectedSupplier] = useState(null);

  useEffect(() => {
    getSuppliers().then((data) => { setSuppliers(data); setLoading(false); });
  }, []);

  const filtered = suppliers.filter((s) =>
    s.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <main className="container-xl py-5" id="suppliers-page">
      <div className="mb-4">
        <h1 className="fw-bold mb-1">Suppliers</h1>
        <p className="text-muted">Discover verified B2B suppliers across the Philippines.</p>
      </div>

      {/* Search */}
      <div className="input-group mb-4" style={{ maxWidth: 400 }}>
        <span className="input-group-text"><i className="bi bi-search" /></span>
        <input
          type="text"
          className="form-control"
          placeholder="Search suppliers…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          id="supplier-search"
        />
      </div>

      {loading ? (
        <Loading message="Loading suppliers…" />
      ) : filtered.length === 0 ? (
        <EmptyState icon="bi-building" title="No suppliers found" description="Try a different search term." />
      ) : (
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {filtered.map((supplier) => (
            <div className="col" key={supplier.id}>
              <SupplierCard supplier={supplier} onViewDetails={setSelectedSupplier} />
            </div>
          ))}
        </div>
      )}

      <SupplierModal supplier={selectedSupplier} onClose={() => setSelectedSupplier(null)} />
    </main>
  );
}

export default Suppliers;
