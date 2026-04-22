import { create } from 'zustand';
import apiClient, { Product, Category } from '../services/api';

interface ProductState {
  products: Product[];
  categories: Category[];
  selectedProduct: Product | null;
  isLoading: boolean;
  error: string | null;

  // Actions
  fetchProducts: (filters?: any) => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchProductById: (id: string) => Promise<void>;
  searchProducts: (query: string) => Promise<void>;
  clearError: () => void;
}

export const useProductStore = create<ProductState>((set) => ({
  products: [],
  categories: [],
  selectedProduct: null,
  isLoading: false,
  error: null,

  fetchProducts: async (filters?: any) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getProducts(filters?.page, filters?.size, filters?.search);
      set({ products: response.data?.content || response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch products', isLoading: false });
    }
  },

  fetchCategories: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getCategories();
      set({ categories: response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch categories', isLoading: false });
    }
  },

  fetchProductById: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.getProductById(id);
      set({ selectedProduct: response.data, isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Failed to fetch product', isLoading: false });
    }
  },

  searchProducts: async (query: string) => {
    set({ isLoading: true, error: null });
    try {
      const response = await apiClient.searchProducts(query);
      set({ products: response.data?.content || response.data || [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message || 'Search failed', isLoading: false });
    }
  },

  clearError: () => set({ error: null }),
}));
