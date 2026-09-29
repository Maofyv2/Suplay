// App-wide constants

export const ROLES = {
  ADMIN: 'admin',
  USER: 'user',
  SUPPLIER: 'supplier',
};

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

export const ROUTES = {
  // Public
  HOME: '/',
  PRODUCTS: '/products',
  SUPPLIERS: '/suppliers',
  CONTACT: '/contact',

  // Auth
  LOGIN: '/login',
  REGISTER: '/register',
  UNAUTHORIZED: '/unauthorized',

  // User
  USER_DASHBOARD: '/user/dashboard',
  USER_CART: '/user/cart',
  USER_CHECKOUT: '/user/checkout',
  USER_ORDERS: '/user/orders',
  USER_ORDER_DETAILS: '/user/orders/:id',
  USER_PROFILE: '/user/profile',

  // Admin
  ADMIN_DASHBOARD: '/admin/dashboard',
  ADMIN_USERS: '/admin/users',
  ADMIN_PRODUCTS: '/admin/products',
  ADMIN_SUPPLIERS: '/admin/suppliers',
  ADMIN_ORDERS: '/admin/orders',

  // Supplier
  SUPPLIER_DASHBOARD: '/supplier/dashboard',
  SUPPLIER_MY_PRODUCTS: '/supplier/products',
  SUPPLIER_ADD_PRODUCT: '/supplier/products/add',
  SUPPLIER_EDIT_PRODUCT: '/supplier/products/edit/:id',
  SUPPLIER_ORDERS: '/supplier/orders',
  SUPPLIER_PROFILE: '/supplier/profile',
};

export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
};

export const PRODUCT_CATEGORIES = [
  'Electronics',
  'Office Supplies',
  'Industrial',
  'Packaging',
  'Furniture',
  'Food & Beverage',
  'Chemicals',
  'Textiles',
];
