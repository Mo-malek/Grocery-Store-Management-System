import { create } from 'zustand';
import { CartItem, Product } from '../services/api';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface CartState {
  items: (CartItem & { product: Product })[];
  total: number;
  itemCount: number;

  // Actions
  addToCart: (product: Product, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getCart: () => void;
  saveCart: () => Promise<void>;
}

export const useCartStore = create<CartState>((set, get) => ({
  items: [],
  total: 0,
  itemCount: 0,

  addToCart: (product: Product, quantity: number) => {
    set((state) => {
      const existingItem = state.items.find((item) => item.productId === product.id);
      let newItems;

      if (existingItem) {
        newItems = state.items.map((item) =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      } else {
        newItems = [
          ...state.items,
          {
            productId: product.id,
            quantity,
            price: product.price,
            product,
          },
        ];
      }

      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      get().saveCart();
      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  removeFromCart: (productId: string) => {
    set((state) => {
      const newItems = state.items.filter((item) => item.productId !== productId);
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      get().saveCart();
      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  updateQuantity: (productId: string, quantity: number) => {
    set((state) => {
      const newItems = state.items.map((item) =>
        item.productId === productId ? { ...item, quantity } : item
      );
      const newTotal = newItems.reduce((sum, item) => sum + item.price * item.quantity, 0);
      const newItemCount = newItems.reduce((sum, item) => sum + item.quantity, 0);

      get().saveCart();
      return { items: newItems, total: newTotal, itemCount: newItemCount };
    });
  },

  clearCart: () => {
    AsyncStorage.removeItem('cart');
    set({ items: [], total: 0, itemCount: 0 });
  },

  getCart: async () => {
    try {
      const savedCart = await AsyncStorage.getItem('cart');
      if (savedCart) {
        const cartData = JSON.parse(savedCart);
        const total = cartData.reduce((sum: number, item: any) => sum + item.price * item.quantity, 0);
        const itemCount = cartData.reduce((sum: number, item: any) => sum + item.quantity, 0);
        set({ items: cartData, total, itemCount });
      }
    } catch (error) {
      console.error('Failed to load cart:', error);
    }
  },

  saveCart: async () => {
    try {
      await AsyncStorage.setItem('cart', JSON.stringify(get().items));
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
  },
}));
