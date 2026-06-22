import { create } from 'zustand';
import * as SecureStore from 'expo-secure-store';
import { authApi, userApi } from '../api';

export const useAuthStore = create((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,

  // Логин
  login: async (email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.login({ email, password });
      const { accessToken, refreshToken, user } = res.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Login failed';
      return { success: false, message };
    }
  },

  // Регистрация
  signup: async (name, email, password) => {
    set({ isLoading: true });
    try {
      const res = await authApi.signup({ name, email, password });
      const { accessToken, refreshToken, user } = res.data.data;

      await SecureStore.setItemAsync('accessToken', accessToken);
      await SecureStore.setItemAsync('refreshToken', refreshToken);

      set({ user, isAuthenticated: true, isLoading: false });
      return { success: true };
    } catch (error) {
      set({ isLoading: false });
      const message = error.response?.data?.message || 'Signup failed';
      return { success: false, message };
    }
  },

  // Выход
  logout: async () => {
    try { await authApi.logout(); } catch {}
    await SecureStore.deleteItemAsync('accessToken');
    await SecureStore.deleteItemAsync('refreshToken');
    set({ user: null, isAuthenticated: false });
  },

  // Проверка токена при запуске
  checkAuth: async () => {
    const token = await SecureStore.getItemAsync('accessToken');
    if (!token) return;
    try {
      const res = await userApi.getMe();
      set({ user: res.data.data, isAuthenticated: true });
    } catch {
      await SecureStore.deleteItemAsync('accessToken');
    }
  },
}));
