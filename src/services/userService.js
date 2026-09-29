// User Service — calls Express/MongoDB API with localStorage fallback
import { apiFetch } from './api';
import { mockUsers } from '../data/users';

const STORAGE_KEY = 'suplay_users';

function getStoredUsers() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockUsers));
    return [...mockUsers];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse users from localStorage:', e);
    return [...mockUsers];
  }
}

function saveUsers(users) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
}

export async function getUsers(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.role) params.append('role', filters.role);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const users = await apiFetch(`/users${queryStr}`);
    saveUsers(users);
    return users;
  } catch (err) {
    let results = getStoredUsers();
    if (filters.role) {
      results = results.filter((u) => u.role === filters.role);
    }
    if (filters.status) {
      results = results.filter((u) => u.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (u) => u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
      );
    }
    return results;
  }
}

export async function getUserById(id) {
  try {
    return await apiFetch(`/users/${id}`);
  } catch (err) {
    const users = getStoredUsers();
    const user = users.find((u) => String(u.id) === String(id) || String(u._id) === String(id));
    if (!user) throw new Error('User not found.');
    return user;
  }
}

export async function updateUser(id, data) {
  try {
    const updated = await apiFetch(`/users/${id}`, {
      method: 'PUT',
      body: data,
    });
    const users = getStoredUsers();
    const index = users.findIndex((u) => String(u.id) === String(id) || String(u._id) === String(id));
    if (index !== -1) {
      users[index] = { ...users[index], ...updated };
      saveUsers(users);
    }
    return updated;
  } catch (err) {
    const users = getStoredUsers();
    const index = users.findIndex((u) => String(u.id) === String(id) || String(u._id) === String(id));
    if (index === -1) throw new Error('User not found.');

    const updatedUser = { ...users[index], ...data };
    users[index] = updatedUser;
    saveUsers(users);
    return updatedUser;
  }
}

export async function changeUserStatus(id, status) {
  try {
    const updated = await apiFetch(`/users/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    const users = getStoredUsers();
    const index = users.findIndex((u) => String(u.id) === String(id) || String(u._id) === String(id));
    if (index !== -1) {
      users[index] = { ...users[index], ...updated };
      saveUsers(users);
    }
    return updated;
  } catch (err) {
    return updateUser(id, { status });
  }
}

export async function deleteUser(id) {
  try {
    await apiFetch(`/users/${id}`, { method: 'DELETE' });
    const users = getStoredUsers();
    const filtered = users.filter((u) => String(u.id) !== String(id) && String(u._id) !== String(id));
    saveUsers(filtered);
    return { success: true, id };
  } catch (err) {
    const users = getStoredUsers();
    const filtered = users.filter((u) => String(u.id) !== String(id) && String(u._id) !== String(id));
    saveUsers(filtered);
    return { success: true, id };
  }
}
