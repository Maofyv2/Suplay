import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useApp } from '../../context/AppContext';
import { updateUser } from '../../services/userService';

function Profile() {
  const { currentUser, logout, updateCurrentUser } = useAuth();
  const { showToast } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
  });

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (currentUser?.id) {
        await updateUser(currentUser.id, form);
      }
      updateCurrentUser(form);
      showToast('Profile updated successfully!', 'success');
      setEditing(false);
    } catch (err) {
      showToast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="container-xl py-5" id="profile-page">
      <div className="row justify-content-center">
        <div className="col-lg-6">
          <h1 className="fw-bold mb-4">My Profile</h1>

          <div className="card border-0 shadow-sm p-4">
            {/* Avatar */}
            <div className="text-center mb-4">
              <div className="suplay-avatar suplay-avatar-lg mx-auto mb-2">
                {currentUser?.name?.charAt(0).toUpperCase() || 'U'}
              </div>
              <p className="fw-bold mb-0">{currentUser?.name}</p>
              <span className="badge bg-primary-subtle text-primary small text-uppercase">
                {currentUser?.role}
              </span>
            </div>

            {editing ? (
              <form onSubmit={handleSave}>
                <div className="mb-3">
                  <label htmlFor="profile-name" className="form-label fw-medium">
                    Full Name
                  </label>
                  <input
                    id="profile-name"
                    name="name"
                    className="form-control"
                    value={form.name}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="mb-4">
                  <label htmlFor="profile-email" className="form-label fw-medium">
                    Email
                  </label>
                  <input
                    id="profile-email"
                    name="email"
                    type="email"
                    className="form-control"
                    value={form.email}
                    onChange={handleChange}
                    required
                  />
                </div>
                <div className="d-flex gap-2">
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
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Name</span>
                  <span className="fw-medium">{currentUser?.name}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom">
                  <span className="text-muted small">Email</span>
                  <span className="fw-medium">{currentUser?.email}</span>
                </div>
                <div className="d-flex justify-content-between py-2 border-bottom mb-4">
                  <span className="text-muted small">Member since</span>
                  <span className="fw-medium">{currentUser?.createdAt || '2025-01-01'}</span>
                </div>
                <button
                  className="btn btn-outline-primary w-100 mb-2"
                  onClick={() => {
                    setForm({
                      name: currentUser?.name || '',
                      email: currentUser?.email || '',
                    });
                    setEditing(true);
                  }}
                >
                  <i className="bi bi-pencil me-2" />
                  Edit Profile
                </button>
                <button className="btn btn-outline-danger w-100" onClick={logout}>
                  <i className="bi bi-box-arrow-right me-2" />
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default Profile;
