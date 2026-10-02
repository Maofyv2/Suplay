// Auth Service — calls Express/MongoDB API with mock data fallback
import { apiFetch } from './api';
import { mockUsers } from '../data/users';

const USERS_STORAGE_KEY = 'suplay_users';
const SUPPLIERS_STORAGE_KEY = 'suplay_suppliers';

function readStoredList(key, fallback = []) {
  try {
    const stored = localStorage.getItem(key);
    return stored ? JSON.parse(stored) : [...fallback];
  } catch {
    return [...fallback];
  }
}

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
      const normalizedEmail = data.email.trim().toLowerCase();
      const storedUsers = readStoredList(USERS_STORAGE_KEY, mockUsers);
      const exists = [...mockUsers, ...storedUsers].some(
        (u) => u.email?.toLowerCase() === normalizedEmail
      );
      if (exists) throw new Error('Email already registered.');
      const id = `u-${Date.now()}`;
      const supplierId = data.role === 'supplier' ? `s-${id}` : null;
      const newUser = {
        id,
        supplierId,
        name: data.name,
        email: normalizedEmail,
        role: data.role || 'user',
        companyName: data.companyName || '',
        businessType: data.businessType || '',
        phone: data.phone || '',
        address: data.address || '',
        avatar: null,
        createdAt: new Date().toISOString().slice(0, 10),
        status: 'active',
      };
      mockUsers.push(newUser);

      const nextUsers = [...storedUsers.filter((u) => u.email?.toLowerCase() !== normalizedEmail), newUser];
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(nextUsers));

      if (newUser.role === 'supplier') {
        const suppliers = readStoredList(SUPPLIERS_STORAGE_KEY);
        const newSupplier = {
          id: supplierId,
          supplierId,
          name: data.companyName?.trim() || data.name,
          email: normalizedEmail,
          phone: data.phone || '',
          address: data.address || '',
          category: data.businessType || 'Other',
          description: '',
          verified: false,
          rating: 4.5,
          totalProducts: 0,
          logo: null,
          joinedAt: newUser.createdAt,
        };
        localStorage.setItem(
          SUPPLIERS_STORAGE_KEY,
          JSON.stringify([...suppliers.filter((s) => s.id !== supplierId), newSupplier])
        );
      }
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
