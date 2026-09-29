// Order Service — calls Express/MongoDB API with localStorage fallback
import { apiFetch } from './api';
import { mockOrders } from '../data/orders';

const STORAGE_KEY = 'suplay_orders';

function getStoredOrders() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (!data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(mockOrders));
    return [...mockOrders];
  }
  try {
    return JSON.parse(data);
  } catch (e) {
    console.error('Failed to parse orders from localStorage:', e);
    return [...mockOrders];
  }
}

function saveOrders(orders) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(orders));
}

export async function getOrders(filters = {}) {
  try {
    const params = new URLSearchParams();
    if (filters.userId) params.append('userId', filters.userId);
    if (filters.supplierId) params.append('supplierId', filters.supplierId);
    if (filters.status) params.append('status', filters.status);
    if (filters.search) params.append('search', filters.search);

    const queryStr = params.toString() ? `?${params.toString()}` : '';
    const orders = await apiFetch(`/orders${queryStr}`);
    saveOrders(orders);
    return orders;
  } catch (err) {
    let results = getStoredOrders();
    if (filters.userId) {
      results = results.filter((o) => String(o.userId) === String(filters.userId));
    }
    if (filters.supplierId) {
      results = results.filter(
        (o) =>
          String(o.supplierId) === String(filters.supplierId) ||
          (o.items && o.items.some((item) => String(item.supplierId) === String(filters.supplierId)))
      );
    }
    if (filters.status) {
      results = results.filter((o) => o.status === filters.status);
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      results = results.filter(
        (o) =>
          String(o.id).toLowerCase().includes(q) ||
          (o.userName && o.userName.toLowerCase().includes(q)) ||
          (o.supplierName && o.supplierName.toLowerCase().includes(q))
      );
    }
    return results;
  }
}

export async function getOrderById(id) {
  try {
    return await apiFetch(`/orders/${id}`);
  } catch (err) {
    const orders = getStoredOrders();
    const order = orders.find((o) => String(o.id) === String(id) || String(o._id) === String(id));
    if (!order) throw new Error('Order not found.');
    return order;
  }
}

export async function createOrder(data) {
  try {
    const created = await apiFetch('/orders', {
      method: 'POST',
      body: data,
    });
    const orders = getStoredOrders();
    orders.unshift(created);
    saveOrders(orders);
    return created;
  } catch (err) {
    const orders = getStoredOrders();
    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10);
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder = {
      id: `ord-${randomNum}`,
      createdAt: dateStr,
      updatedAt: dateStr,
      status: 'pending',
      shipping: 0,
      address: 'Default Delivery Address',
      ...data,
    };
    orders.unshift(newOrder);
    saveOrders(orders);
    return newOrder;
  }
}

export async function updateOrderStatus(id, status) {
  try {
    const updated = await apiFetch(`/orders/${id}/status`, {
      method: 'PATCH',
      body: { status },
    });
    const orders = getStoredOrders();
    const index = orders.findIndex((o) => String(o.id) === String(id) || String(o._id) === String(id));
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updated };
      saveOrders(orders);
    }
    return updated;
  } catch (err) {
    const orders = getStoredOrders();
    const index = orders.findIndex((o) => String(o.id) === String(id) || String(o._id) === String(id));
    if (index === -1) throw new Error('Order not found.');

    const updatedOrder = {
      ...orders[index],
      status,
      updatedAt: new Date().toISOString().slice(0, 10),
    };
    orders[index] = updatedOrder;
    saveOrders(orders);
    return updatedOrder;
  }
}

export async function cancelOrder(id) {
  try {
    const updated = await apiFetch(`/orders/${id}/cancel`, {
      method: 'PATCH',
    });
    const orders = getStoredOrders();
    const index = orders.findIndex((o) => String(o.id) === String(id) || String(o._id) === String(id));
    if (index !== -1) {
      orders[index] = { ...orders[index], ...updated };
      saveOrders(orders);
    }
    return updated;
  } catch (err) {
    return updateOrderStatus(id, 'cancelled');
  }
}
