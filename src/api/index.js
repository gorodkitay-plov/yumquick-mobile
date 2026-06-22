import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const BASE_URL = 'https://yumquick-production.up.railway.app/api';

export const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
});

// Подставляем токен в каждый запрос
api.interceptors.request.use(async (config) => {
  const token = await SecureStore.getItemAsync('accessToken');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Если 401 — чистим токены
api.interceptors.response.use(
  (res) => res,
  async (error) => {
    if (error.response?.status === 401) {
      await SecureStore.deleteItemAsync('accessToken');
      await SecureStore.deleteItemAsync('refreshToken');
    }
    return Promise.reject(error);
  }
);

// ── Auth ──────────────────────────────────────────────
export const authApi = {
  signup: (data) => api.post('/auth/signup', data),
  login: (data) => api.post('/auth/login', data),
  logout: () => api.post('/auth/logout'),
};

// ── Restaurants ───────────────────────────────────────
export const restaurantApi = {
  getAll: (params) => api.get('/restaurants', { params }),
  getById: (id) => api.get(`/restaurants/${id}`),
  getNearby: (params) => api.get('/restaurants/nearby', { params }),
  getPopular: () => api.get('/restaurants/popular'),
  search: (query) => api.get('/restaurants/search', { params: { query } }),
  getMenu: (id) => api.get(`/restaurants/${id}/menu`),
};

// ── Cart ──────────────────────────────────────────────
export const cartApi = {
  get: () => api.get('/cart'),
  addItem: (data) => api.post('/cart/items', data),
  updateItem: (data) => api.patch('/cart/items', data),
  clear: () => api.delete('/cart'),
};

// ── Orders ────────────────────────────────────────────
export const orderApi = {
  checkout: (data) => api.post('/orders/checkout', data),
  getAll: () => api.get('/orders'),
  getById: (id) => api.get(`/orders/${id}`),
  cancel: (id) => api.patch(`/orders/${id}/cancel`),
};

// ── User ──────────────────────────────────────────────
export const userApi = {
  getMe: () => api.get('/users/me'),
  updateMe: (data) => api.patch('/users/me', data),
  getAddresses: () => api.get('/users/me/addresses'),
  addAddress: (data) => api.post('/users/me/addresses', data),
  deleteAddress: (id) => api.delete(`/users/me/addresses/${id}`),
  setDefaultAddress: (id) => api.patch(`/users/me/addresses/${id}/default`),
};
