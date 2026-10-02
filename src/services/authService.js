// Auth Service — calls Express/MongoDB API with mock data fallback
import { apiFetch } from './api';
import { mockUsers } from '../data/users';

export async function login(email, password) {
  try {
    const result = await apiFetch('/auth/login', {
      method: 'POST',
      body: { email, password },
    });
    return result;
  } catch (apiErr) {
    // If backend is unreachable or proxy returns 502/503/504, fall back to local mock data
    const isUnreachable =
      apiErr.status === 502 ||
      apiErr.status === 503 ||
      apiErr.status === 504 ||
      apiErr.message?.includes('502') ||
      apiErr.message?.includes('Failed to fetch') ||
      apiErr.message?.includes('NetworkError');

    if (isUnreachable) {
      console.warn('[AuthService] Backend server is not running (502 / offline). Falling back to mock accounts.');
      const user = mockUsers.find((u) => u.email.toLowerCase() === email.toLowerCase());
      if (!user) throw new Error('Invalid credentials. (Note: Using local test accounts because backend is offline)');
      const token = btoa(`mock-token:${user.id}:${Date.now()}`);
      return { user, token };
    }
    throw apiErr;
  }
}

export async function register(data) {
  try {
    const result = await apiFetch('/auth/register', {
      method: 'POST',
      body: data,
    });
    return result;
  } catch (apiErr) {
    const isUnreachable =
      apiErr.status === 502 ||
      apiErr.status === 503 ||
      apiErr.status === 504 ||
      apiErr.message?.includes('502') ||
      apiErr.message?.includes('Failed to fetch') ||
      apiErr.message?.includes('NetworkError');

    if (isUnreachable) {
      console.warn('[AuthService] Backend server is not running (502 / offline). Falling back to local mock data');
      const exists = mockUsers.find((u) => u.email === data.email);
      if (exists) throw new Error('Email already registered.');
      const newUser = {
        id: `u${Date.now()}`,
        supplierId: data.role === 'supplier' ? `s_${Date.now()}` : null,
        name: data.name,
        email: data.email,
        role: data.role || 'user',
        avatar: null,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'active',
      };
      mockUsers.push(newUser);
      return { user: newUser, token: btoa(`mock-token:${newUser.id}:${Date.now()}`) };
    }
    throw apiErr;
  }
}

export function getCurrentUser() {
  try {
    const raw = localStorage.getItem('suplay_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function logout() {
  localStorage.removeItem('suplay_user');
  localStorage.removeItem('suplay_token');
}
