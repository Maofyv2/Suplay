// Supplier Service — calls Express/MongoDB API with localStorage fallback
import { apiFetch } from './api';
import { mockSuppliers } from '../data/suppliers';

const STORAGE_KEY = 'suplay_suppliers';

function getStoredSuppliers() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockSuppliers));
    return [...mockSuppliers];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse suppliers from localStorage:', e);
    return [...mockSuppliers];
  }
}

function saveSuppliers(suppliers) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(suppliers));
}

export async function getSuppliers(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.category) params.append('category', filters.category);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const suppliers = await apiFetch(`/suppliers${queryStr}`);
    saveSuppliers(suppliers);
    return suppliers;
  } catch (err) {
    let results = getStoredSuppliers();
    if (filters.category) {
      results = results.filter((s) => s.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (s) =>
          s.name?.toLowerCase().includes(q) ||
          s.email?.toLowerCase().includes(q) ||
          s.category?.toLowerCase().includes(q) ||
          (s.description && s.description.toLowerCase().includes(q)) ||
          (s.address && s.address.toLowerCase().includes(q))
      );
    }
    return results;
  }
}

export async function getSupplierById(id) {
  try {
    return await apiFetch(`/suppliers/${id}`);
  } catch (err) {
    const suppliers = getStoredSuppliers();
    const supplier = suppliers.find((s) => String(s.id) === String(id) || String(s._id) === String(id));
    if (!supplier) throw new Error('Supplier not found.');
    return supplier;
  }
}

export async function updateSupplier(id, data) {
  try {
    const updated = await apiFetch(`/suppliers/${id}`, {
      method: 'PUT',
      body: data,
    });
    const suppliers = getStoredSuppliers();
    const index = suppliers.findIndex((s) => String(s.id) === String(id) || String(s._id) === String(id));
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updated };
      saveSuppliers(suppliers);
    }
    return updated;
  } catch (err) {
    const suppliers = getStoredSuppliers();
    const index = suppliers.findIndex((s) => String(s.id) === String(id) || String(s._id) === String(id));
    if (index === -1) throw new Error('Supplier not found.');

    const updatedSupplier = { ...suppliers[index], ...data };
    suppliers[index] = updatedSupplier;
    saveSuppliers(suppliers);
    return updatedSupplier;
  }
}

export async function deleteSupplier(id) {
  try {
    await apiFetch(`/suppliers/${id}`, { method: 'DELETE' });
    const suppliers = getStoredSuppliers();
    const filtered = suppliers.filter((s) => String(s.id) !== String(id) && String(s._id) !== String(id));
    saveSuppliers(filtered);
    return { success: true, id };
  } catch (err) {
    const suppliers = getStoredSuppliers();
    const filtered = suppliers.filter((s) => String(s.id) !== String(id) && String(s._id) !== String(id));
    saveSuppliers(filtered);
    return { success: true, id };
  }
}

export async function toggleSupplierVerification(id) {
  try {
    const updated = await apiFetch(`/suppliers/${id}/verify`, {
      method: 'PATCH',
    });
    const suppliers = getStoredSuppliers();
    const index = suppliers.findIndex((s) => String(s.id) === String(id) || String(s._id) === String(id));
    if (index !== -1) {
      suppliers[index] = { ...suppliers[index], ...updated };
      saveSuppliers(suppliers);
    }
    return updated;
  } catch (err) {
    const supplier = await getSupplierById(id);
    return updateSupplier(id, { verified: !supplier.verified });
  }
}
