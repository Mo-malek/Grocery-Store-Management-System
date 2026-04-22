import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import apiClient from '../services/api';

interface AuthStore {
  user: any | null;
  token: string | null;
  isLoading: boolean;
  error: string | null;
  login: (username: string, password: string) => Promise<void>;
  register: (userData: any) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isLoading: false,
      error: null,

      login: async (username, password) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.login(username, password);
          set({
            user: {
              username: response.user.username,
              role: response.user.role,
            },
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.message || error.response?.data?.message || 'Login failed';
          console.log('[AuthStore] Login error:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      register: async (userData) => {
        set({ isLoading: true, error: null });
        try {
          const response = await apiClient.register(userData);
          set({
            user: {
              username: response.user.username,
              role: response.user.role,
            },
            token: response.token,
            isLoading: false,
            error: null,
          });
        } catch (error: any) {
          const errorMessage = error.message || error.response?.data?.message || 'Registration failed';
          console.log('[AuthStore] Register error:', errorMessage);
          set({
            error: errorMessage,
            isLoading: false,
            user: null,
            token: null,
          });
          throw error;
        }
      },

      logout: () => {
        console.log('[AuthStore] Logging out user');
        apiClient.clearToken();
        set({
          user: null,
          token: null,
          error: null,
          isLoading: false,
        });
      },

      clearError: () => {
        set({ error: null });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ user: state.user, token: state.token }),
      onRehydrateStorage: () => (state) => {
        if (state?.token) {
          apiClient.setToken(state.token);
        }
      },
    }
  )
);

interface CartStore {
  items: any[];
  total: number;
  addItem: (item: any) => void;
  removeItem: (productId: string) => void;
  clear: () => void;
}

export const useCartStore = create<CartStore>((set) => ({
  items: [],
  total: 0,

  addItem: (item) =>
    set((state) => {
      const newItems = [...state.items, item];
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: newItems, total };
    }),

  removeItem: (productId) =>
    set((state) => {
      const newItems = state.items.filter((i) => i.productId !== productId);
      const total = newItems.reduce((sum, i) => sum + i.price * i.quantity, 0);
      return { items: newItems, total };
    }),

  clear: () => set({ items: [], total: 0 }),
}));
