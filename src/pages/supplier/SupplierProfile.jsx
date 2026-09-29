import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { updateUser } from '../../services/userService';
import { updateSupplier } from '../../services/supplierService';

function SupplierProfile() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const { showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '+63 2 8123 4567',
    address: currentUser?.address || 'Caloocan City, Metro Manila',
    description:
      currentUser?.description ||
      'Leading supplier of precision industrial components and mechanical parts.',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser?.id) {
        await updateUser(currentUser.id, {
          name: form.name,
          email: form.email,
        });
      }
      const sId = currentUser?.supplierId || currentUser?.id;
      if (sId) {
        try {
          await updateSupplier(sId, {
            name: form.name,
            email: form.email,
            phone: form.phone,
            address: form.address,
            description: form.description,
          });
        } catch {
          // ignore if supplier entry not in mock suppliers table
        }
      }
      updateCurrentUser(form);
      showToast('Supplier profile updated successfully!', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update supplier profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container-xl py-5" id="supplier-profile-page">
      <div className="row justify-content-center">
        <div className="col-lg-7">
          <h1 className="fw-bold mb-4">Supplier Profile</h1>

          <div className="card border-0 shadow-sm p-4">
            {/* Avatar */}
            <div className="text-center mb-4">
              <div className="suplay-avatar suplay-avatar-lg mx-auto mb-2">
                {currentUser?.name?.charAt(0).toUpperCase() || 'S'}
              </div>
              <p className="fw-bold mb-0">{currentUser?.name}</p>
              <span className="badge bg-warning-subtle text-warning small text-uppercase">
                Supplier
              </span>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="row g-3">
                  <div className="col-md-6">
                    <label htmlFor="sp-name" className="form-label fw-medium">
                      Business Name
                    </label>
                    <input
                      id="sp-name"
                      name="name"
                      className="form-control"
                      value={form.name}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="sp-email" className="form-label fw-medium">
                      Email
                    </label>
                    <input
                      id="sp-email"
                      name="email"
                      type="email"
                      className="form-control"
                      value={form.email}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="sp-phone" className="form-label fw-medium">
                      Phone
                    </label>
                    <input
                      id="sp-phone"
                      name="phone"
                      className="form-control"
                      value={form.phone}
                      onChange={handleChange}
                      placeholder="+63 2 8123 4567"
                    />
                  </div>
                  <div className="col-md-6">
                    <label htmlFor="sp-address" className="form-label fw-medium">
                      Address
                    </label>
                    <input
                      id="sp-address"
                      name="address"
                      className="form-control"
                      value={form.address}
                      onChange={handleChange}
                      placeholder="City, Province"
                    />
                  </div>
                  <div className="col-12">
                    <label htmlFor="sp-desc" className="form-label fw-medium">
                      Business Description
                    </label>
                    <textarea
                      id="sp-desc"
                      name="description"
                      className="form-control"
                      rows={3}
                      value={form.description}
                      onChange={handleChange}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary flex-grow-1 d-inline-flex align-items-center justify-content-center gap-2"
                    disabled={saving}
                  >
                    {saving && <span className="spinner-border spinner-border-sm" />}
                    Save Changes
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setEditing(false)}
                    disabled={saving}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            ) : (
              <div>
                {[
                  { label: 'Business Name', value: currentUser?.name || form.name },
                  { label: 'Email', value: currentUser?.email || form.email },
                  { label: 'Phone', value: form.phone || '—' },
                  { label: 'Address', value: form.address || '—' },
                  { label: 'Member since', value: currentUser?.createdAt || '2025-01-01' },
                ].map((row) => (
                  <div key={row.label} className="d-flex justify-content-between py-2 border-bottom">
                    <span className="text-muted small">{row.label}</span>
                    <span className="fw-medium">{row.value}</span>
                  </div>
                ))}
                {form.description && (
                  <div className="py-2 border-bottom">
                    <span className="text-muted small d-block mb-1">About</span>
                    <p className="small mb-0 text-dark">{form.description}</p>
                  </div>
                )}
                <div className="d-flex gap-2 mt-4">
                  <button
                    className="btn btn-outline-primary flex-grow-1"
                    onClick={() => setEditing(true)}
                  >
                    <i className="bi bi-pencil me-2" />
                    Edit Profile
                  </button>
                  <button className="btn btn-outline-danger" onClick={logout}>
                    <i className="bi bi-box-arrow-right me-2" />
                    Sign Out
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default SupplierProfile;
