import { create } from 'zustand';
import { cartApi } from '../api';

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,

  fetchCart: async () => {
    try {
      const res = await cartApi.get();
      set({ cart: res.data.data });
    } catch {}
  },

  addItem: async (menuItemId, quantity, options = []) => {
    set({ isLoading: true });
    try {
      await cartApi.addItem({ menuItemId, quantity, options });
      await get().fetchCart();
    } finally {
      set({ isLoading: false });
    }
  },

  updateItem: async (menuItemId, quantity) => {
    try {
      await cartApi.updateItem({ menuItemId, quantity });
      await get().fetchCart();
    } catch {}
  },

  clearCart: async () => {
    try {
      await cartApi.clear();
      set({ cart: null });
    } catch {}
  },

  get itemCount() {
    return get().cart?.items?.reduce((sum, item) => sum + item.quantity, 0) ?? 0;
  },
}));
