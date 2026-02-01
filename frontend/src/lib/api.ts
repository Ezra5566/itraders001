import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api';

// Create axios instance
const api: AxiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      // Handle unauthorized
      if (typeof window !== 'undefined') {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post('/auth/login', { email, password }),

  register: (data: { email: string; password: string; firstName: string; lastName: string; phone?: string }) =>
    api.post('/auth/register', data),

  getMe: () => api.get('/auth/me'),

  updateProfile: (data: Partial<{ firstName: string; lastName: string; phone: string }>) =>
    api.put('/auth/profile', data),

  changePassword: (currentPassword: string, newPassword: string) =>
    api.put('/auth/password', { currentPassword, newPassword }),

  logout: () => api.post('/auth/logout'),
};

// Products API
export const productApi = {
  getProducts: (params?: Record<string, string | number>) =>
    api.get('/products', { params }),

  getProduct: (slug: string) =>
    api.get(`/products/${slug}`),

  getFeatured: (limit = 8) =>
    api.get('/products/featured/list', { params: { limit } }),

  search: (query: string, params?: Record<string, string | number>) =>
    api.get('/products/search/query', { params: { q: query, ...params } }),

  addReview: (productId: string, data: { rating: number; title?: string; comment?: string }) =>
    api.post(`/products/${productId}/reviews`, data),

  // Admin
  create: (data: FormData | object) =>
    api.post('/products', data),

  update: (id: string, data: FormData | object) =>
    api.put(`/products/${id}`, data),

  delete: (id: string) =>
    api.delete(`/products/${id}`),
};

// Categories API
export const categoryApi = {
  getCategories: () => api.get('/categories'),
  getTree: () => api.get('/categories/tree'),
  getCategory: (slug: string, params?: Record<string, string | number>) =>
    api.get(`/categories/${slug}`, { params }),

  // Admin
  create: (data: object) => api.post('/categories', data),
  update: (id: string, data: object) => api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// Cart API
export const cartApi = {
  getCart: () => api.get('/cart'),
  addItem: (productId: string, quantity: number, variantId?: string) =>
    api.post('/cart/items', { productId, quantity, variantId }),
  updateQuantity: (itemId: string, quantity: number) =>
    api.put(`/cart/items/${itemId}`, { quantity }),
  removeItem: (itemId: string) => api.delete(`/cart/items/${itemId}`),
  clear: () => api.delete('/cart'),
  applyCoupon: (code: string) => api.post('/cart/coupon', { code }),
  removeCoupon: () => api.delete('/cart/coupon'),
};

// Orders API
export const orderApi = {
  create: (data: object) => api.post('/orders', data),
  getOrders: (params?: Record<string, string | number>) =>
    api.get('/orders', { params }),
  getOrder: (id: string) => api.get(`/orders/${id}`),
  cancel: (id: string, reason?: string) =>
    api.put(`/orders/${id}/cancel`, { reason }),
  createPaymentIntent: (amount: number) =>
    api.post('/orders/payment-intent', { amount }),

  // Admin
  getAllOrders: (params?: Record<string, string | number>) =>
    api.get('/orders/admin/all', { params }),
  updateStatus: (id: string, status: string, note?: string) =>
    api.put(`/orders/${id}/status`, { status, note }),
  addTracking: (id: string, data: object) =>
    api.put(`/orders/${id}/tracking`, data),
};

// User API
export const userApi = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: object) => api.put('/users/profile', data),
  addAddress: (address: object) => api.post('/users/addresses', address),
  updateAddress: (id: string, address: object) =>
    api.put(`/users/addresses/${id}`, address),
  deleteAddress: (id: string) => api.delete(`/users/addresses/${id}`),
  addToWishlist: (productId: string) => api.post('/users/wishlist', { productId }),
  removeFromWishlist: (productId: string) => api.delete(`/users/wishlist/${productId}`),

  // Admin
  getAllUsers: (params?: Record<string, string | number>) =>
    api.get('/users', { params }),
  getUser: (id: string) => api.get(`/users/${id}`),
  updateUser: (id: string, data: object) => api.put(`/users/${id}`, data),
  deleteUser: (id: string) => api.delete(`/users/${id}`),
};

// Admin API
export const adminApi = {
  getDashboard: () => api.get('/admin/dashboard'),
  getLogs: (params?: Record<string, string | number>) =>
    api.get('/admin/logs', { params }),
  getSettings: () => api.get('/admin/settings'),
  updateSettings: (data: object) => api.put('/admin/settings', data),
};

// Analytics API
export const analyticsApi = {
  getSales: (params?: Record<string, string | number>) =>
    api.get('/analytics/sales', { params }),
  getCustomers: () => api.get('/analytics/customers'),
  getProducts: () => api.get('/analytics/products'),
};

// Upload API
export const uploadApi = {
  uploadImage: (file: File) => {
    const formData = new FormData();
    formData.append('image', file);
    return api.post('/upload/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  uploadMultiple: (files: File[]) => {
    const formData = new FormData();
    files.forEach((file) => formData.append('images', file));
    return api.post('/upload/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export default api;
