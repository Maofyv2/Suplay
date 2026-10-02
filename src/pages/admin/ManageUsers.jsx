import { useState, useEffect, useMemo } from 'react';
import { getUsers, deleteUser, changeUserStatus } from '../../services/userService';
import { useApp } from '../../context/AppContext';
import ConfirmModal from '../../modals/ConfirmModal';
import EmptyState from '../../components/common/EmptyState';
import Loading from '../../components/common/Loading';

function ManageUsers() {
  const { showToast } = useApp();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirm, setConfirm] = useState({ isOpen: false, userId: null });
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const loadUsers = () => {
    getUsers().then((data) => {
      setUsers(data);
      setLoading(false);
    });
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleDelete = async () => {
    if (!confirm.userId) return;
    try {
      await deleteUser(confirm.userId);
      setUsers((prev) => prev.filter((u) => u.id !== confirm.userId));
      showToast('User deleted successfully.', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to delete user.', 'error');
    } finally {
      setConfirm({ isOpen: false, userId: null });
    }
  };

  const handleToggleStatus = async (user) => {
    const newStatus = user.status === 'active' ? 'suspended' : 'active';
    try {
      const updated = await changeUserStatus(user.id, newStatus);
      setUsers((prev) => prev.map((u) => (u.id === user.id ? updated : u)));
      showToast(`User ${user.name} is now ${newStatus}.`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update user status.', 'error');
    }
  };

  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      // Exclude admin-role users — admins should not manage other admins
      if (u.role === 'admin') return false;
      const matchesSearch =
        !search ||
        u.name?.toLowerCase().includes(search.toLowerCase()) ||
        u.email?.toLowerCase().includes(search.toLowerCase());
      const matchesRole = !roleFilter || u.role === roleFilter;
      const matchesStatus = !statusFilter || u.status === statusFilter;
      return matchesSearch && matchesRole && matchesStatus;
    });
  }, [users, search, roleFilter, statusFilter]);

  const roleBadge = { admin: 'danger', supplier: 'warning', user: 'primary' };

  if (loading) return <Loading />;

  return (
    <main className="container-xl py-5" id="manage-users-page">
      <div className="d-flex flex-wrap align-items-center justify-content-between gap-3 mb-4">
        <div>
          <h1 className="fw-bold mb-1">Manage Users</h1>
          <p className="text-muted small mb-0">Total users: {users.length}</p>
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
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-6 col-md-3">
            <select
              className="form-select"
              value={roleFilter}
              onChange={(e) => setRoleFilter(e.target.value)}
            >
              <option value="">All Roles</option>
              <option value="supplier">Supplier</option>
              <option value="user">Customer</option>
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
              <option value="suspended">Suspended</option>
            </select>
          </div>
          {(search || roleFilter || statusFilter) && (
            <div className="col-12 col-md-1 d-flex">
              <button
                className="btn btn-outline-secondary w-100"
                title="Reset filters"
                onClick={() => {
                  setSearch('');
                  setRoleFilter('');
                  setStatusFilter('');
                }}
              >
                <i className="bi bi-x-lg" />
              </button>
            </div>
          )}
        </div>
      </div>

      {filteredUsers.length === 0 ? (
        <EmptyState
          icon="bi-people"
          title="No users found"
          message={
            search || roleFilter || statusFilter
              ? 'Try adjusting your search or filters.'
              : 'There are no users registered yet.'
          }
        />
      ) : (
        <div className="card border-0 shadow-sm">
          <div className="table-responsive">
            <table className="table table-hover align-middle mb-0">
              <thead className="table-light">
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th className="text-end pe-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id}>
                    <td className="fw-medium">{user.name}</td>
                    <td className="text-muted small">{user.email}</td>
                    <td>
                      <span
                        className={`badge bg-${roleBadge[user.role] || 'secondary'}-subtle text-${
                          roleBadge[user.role] || 'secondary'
                        }`}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td>
                      <span
                        className={`badge rounded-pill ${
                          user.status === 'active'
                            ? 'bg-success-subtle text-success'
                            : 'bg-danger-subtle text-danger'
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="text-muted small">{user.createdAt}</td>
                    <td className="text-end pe-3">
                      <div className="d-inline-flex gap-1">
                        <button
                          className={`btn btn-sm ${
                            user.status === 'active' ? 'btn-outline-warning' : 'btn-outline-success'
                          }`}
                          title={user.status === 'active' ? 'Suspend User' : 'Activate User'}
                          onClick={() => handleToggleStatus(user)}
                        >
                          <i className={`bi ${user.status === 'active' ? 'bi-ban' : 'bi-check-circle'}`} />
                        </button>
                        <button
                          className="btn btn-sm btn-outline-danger"
                          title="Delete User"
                          onClick={() => setConfirm({ isOpen: true, userId: user.id })}
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

      <ConfirmModal
        isOpen={confirm.isOpen}
        title="Delete User"
        message="This action cannot be undone. The user's data will be permanently removed."
        confirmLabel="Delete"
        variant="danger"
        onConfirm={handleDelete}
        onCancel={() => setConfirm({ isOpen: false, userId: null })}
      />
    </main>
  );
}

export default ManageUsers;
