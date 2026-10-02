// Product Service — calls Express/MongoDB API with localStorage fallback
import { apiFetch } from './api';
import { mockProducts } from '../data/products';
import { getCurrentUser } from './authService';

const STORAGE_KEY = 'suplay_products';

function getStoredProducts() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockProducts));
    return [...mockProducts];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse products from localStorage:', e);
    return [...mockProducts];
  }
}

function saveProducts(products) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
}

function canViewProduct(product) {
  const user = getCurrentUser();
  if (user?.role === 'admin') return true;
  if (user?.role === 'supplier') {
    const supplierIds = [user.supplierId, user.id, user._id].filter(Boolean).map(String);
    return supplierIds.includes(String(product.supplierId));
  }
  return product.status === 'active';
}

export async function getProducts(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.category) params.append('category', filters.category);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const products = await apiFetch(`/products${queryStr}`);
    // Sync local cache
    saveProducts(products);
    return products.filter(canViewProduct);
  } catch {
    // Offline fallback to localStorage
    let results = getStoredProducts();
    if (filters.supplierId) {
      results = results.filter((p) => String(p.supplierId) === String(filters.supplierId));
    }
    if (filters.category) {
      results = results.filter((p) => p.category === filters.category);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.description && p.description.toLowerCase().includes(q)) || 
          (p.supplierName && p.supplierName.toLowerCase().includes(q))
      );
    }
    if (filters.status) {
      results = results.filter((p) => p.status === filters.status);
    }
    return results.filter(canViewProduct);
  }
}

export async function getProductById(id) {
  try {
    const product = await apiFetch(`/products/${id}`);
    if (!canViewProduct(product)) throw new Error('Product not found.');
    return product;
  } catch (err) {
    if (err.status) throw err;
    const products = getStoredProducts();
    const product = products.find((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (!product || !canViewProduct(product)) throw new Error('Product not found.', { cause: err });
    return product;
  }
}

/**
 * Build FormData from a plain object. If the object has an `imageFile` key (File),
 * it is attached under the field name 'image' for multer. All other keys are appended as text fields.
 */
function buildFormData(data) {
  const fd = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (key === 'imageFile') {
      if (value instanceof File) fd.append('image', value);
    } else if (value !== undefined && value !== null) {
      fd.append(key, value);
    }
  });
  return fd;
}

export async function createProduct(data) {
  try {
    const hasFile = data.imageFile instanceof File;
    const body = hasFile ? buildFormData(data) : data;

    const created = await apiFetch('/products', {
      method: 'POST',
      body,
    });
    const products = getStoredProducts();
    products.unshift(created);
    saveProducts(products);
    return created;
  } catch (err) {
    if (err.status) throw err;
    const products = getStoredProducts();
    const newProduct = {
      id: `p_${Date.now()}`,
      rating: 5.0,
      reviews: 0,
      status: 'active',
      image: null,
      moq: 1,
      ...data,
    };
    delete newProduct.imageFile;
    products.unshift(newProduct);
    saveProducts(products);
    return newProduct;
  }
}

export async function updateProduct(id, data) {
  try {
    const hasFile = data.imageFile instanceof File;
    const body = hasFile ? buildFormData(data) : data;

    const updated = await apiFetch(`/products/${id}`, {
      method: 'PUT',
      body,
    });
    const products = getStoredProducts();
    const index = products.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (index !== -1) {
      products[index] = { ...products[index], ...updated };
      saveProducts(products);
    }
    return updated;
  } catch (err) {
    if (err.status) throw err;
    const products = getStoredProducts();
    const index = products.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (index === -1) throw new Error('Product not found.', { cause: err });

    const updatedProduct = { ...products[index], ...data };
    delete updatedProduct.imageFile;
    products[index] = updatedProduct;
    saveProducts(products);
    return updatedProduct;
  }
}

export async function deleteProduct(id) {
  try {
    await apiFetch(`/products/${id}`, { method: 'DELETE' });
    const products = getStoredProducts();
    const filtered = products.filter((p) => String(p.id) !== String(id) && String(p._id) !== String(id));
    saveProducts(filtered);
    return { success: true, id };
  } catch (err) {
    if (err.status) throw err;
    const products = getStoredProducts();
    const filtered = products.filter((p) => String(p.id) !== String(id) && String(p._id) !== String(id));
    saveProducts(filtered);
    return { success: true, id };
  }
}

export async function updateProductStock(id, qtyDeduction) {
  try {
    await apiFetch(`/products/${id}/stock`, {
      method: 'PATCH',
      body: { quantityDeducted: qtyDeduction },
    });
  } catch {
    const products = getStoredProducts();
    const index = products.findIndex((p) => String(p.id) === String(id) || String(p._id) === String(id));
    if (index !== -1) {
      products[index].stock = Math.max(0, products[index].stock - qtyDeduction);
      saveProducts(products);
    }
  }
}
