import axios, { AxiosInstance, AxiosError } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.38:8080/api';
const TIMEOUT = 30000;

// ==================== TYPES ====================
export interface User {
  id: string;
  username: string;
  email: string;
  phone: string;
  fullName?: string;
  firstName: string;
  lastName: string;
  role: 'ADMIN' | 'MANAGER' | 'CASHIER' | 'CUSTOMER';
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface Product {
  id: string;
  name: string;
  barcode: string;
  categoryId: string;
  category: string;
  price?: number;
  cost?: number;
  quantity?: number;
  purchasePrice?: number;
  sellingPrice?: number;
  currentStock?: number;
  minStock?: number;
  image?: string;
  imageUrl?: string;
  description: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  description?: string;
  image?: string;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  quantity: number;
  price: number;
}

export interface Order {
  id: string;
  customerId: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface DeliveryOrder extends Order {
  deliveryFee: number;
  deliveryAddress: string;
  deliverySlot?: string;
}

export interface Customer {
  id: string;
  username: string;
  email: string;
  phone: string;
  firstName: string;
  lastName: string;
  address?: string;
  loyaltyPoints: number;
  totalPurchases: number;
  createdAt: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  tax: number;
  total: number;
  paymentMethod: string;
  status: string;
  createdAt: string;
}

export interface Dashboard {
  totalSales: number;
  totalOrders: number;
  totalCustomers: number;
  lowStockProducts: Product[];
  recentOrders: Order[];
  salesTrend: { date: string; amount: number }[];
}

// ==================== API CLIENT ====================
class APIClient {
  private client: AxiosInstance;
  private token: string | null = null;

  constructor() {
    this.client = axios.create({
      baseURL: API_BASE_URL,
      timeout: TIMEOUT,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor
    this.client.interceptors.request.use((config) => {
      if (this.token) {
        config.headers.Authorization = `Bearer ${this.token}`;
      }
      console.log(`[API] ${config.method?.toUpperCase()} ${config.url}`);
      return config;
    });

    // Response interceptor
    this.client.interceptors.response.use(
      (response) => {
        console.log(`[API] ✅ ${response.status}`);
        return response;
      },
      (error: any) => {
        console.error('[API] ❌ Error:', error.message);
        return Promise.reject({
          message: error.response?.data?.message || error.message,
          status: error.response?.status,
          data: error.response?.data,
        });
      }
    );

    this.loadToken();
  }

  private async loadToken() {
    this.token = await AsyncStorage.getItem('authToken');
  }

  async setToken(token: string) {
    this.token = token;
    await AsyncStorage.setItem('authToken', token);
  }

  async clearToken() {
    this.token = null;
    await AsyncStorage.removeItem('authToken');
  }

  // ==================== AUTHENTICATION ====================
  async login(username: string, password: string) {
    const { data } = await this.client.post('/auth/login', { username, password });
    await this.setToken(data.token);
    const currentUser = await this.getCurrentUser();
    const user = currentUser.data || {
      username: data.username,
      role: data.role?.replace(/^ROLE_/, '') || 'CUSTOMER',
    };
    return { token: data.token, user };
  }

  async register(userData: any) {
    await this.client.post('/auth/register', userData);
    const loginResult = await this.login(userData.username, userData.password);
    return loginResult;
  }

  async logout() {
    await this.clearToken();
  }

  async getCurrentUser() {
    return this.client.get('/auth/me');
  }


  // PRODUCTS
  async getProducts(page = 0, size = 20, search?: string) {
    return this.client.get('/products', {
      params: { page, size, search },
    });
  }

  async searchProducts(search?: string, page = 0, size = 20) {
    return this.getProducts(page, size, search);
  }

  async getProductById(id: string) {
    return this.client.get(`/products/${id}`);
  }

  async getProductByBarcode(barcode: string) {
    return this.client.get(`/products/barcode/${barcode}`);
  }

  async createProduct(product: any) {
    return this.client.post('/products', product);
  }

  async updateProduct(id: string, product: any) {
    return this.client.put(`/products/${id}`, product);
  }

  async deleteProduct(id: string) {
    return this.client.delete(`/products/${id}`);
  }

  async getLowStockProducts() {
    return this.client.get('/products/low-stock');
  }

  async getProductCategories() {
    return this.client.get('/products/categories');
  }

  async getCategories() {
    return this.getProductCategories();
  }

  // SALES
  async createSale(sale: any) {
    return this.client.post('/sales', sale);
  }

  async getSaleById(id: string) {
    return this.client.get(`/sales/${id}`);
  }

  async getSales(dateFrom?: string, dateTo?: string, page = 0, size = 20) {
    const today = new Date();
    const fallbackTo = today.toISOString().slice(0, 10);
    const fallbackFrom = new Date(today.getFullYear(), 0, 1).toISOString().slice(0, 10);
    return this.client.get('/sales', {
      params: { from: dateFrom || fallbackFrom, to: dateTo || fallbackTo, page, size },
    });
  }

  async getTodaySales() {
    return this.client.get('/sales/today');
  }

  // EXPENSES
  async getExpenses() {
    const { data } = await this.client.get('/expenses');
    return data;
  }

  async addExpense(expense: any) {
    return this.client.post('/expenses', expense);
  }

  async deleteExpense(id: number) {
    return this.client.delete(`/expenses/${id}`);
  }

  // PROCUREMENT (Intelligence)
  async getReorderSuggestions() {
    const { data } = await this.client.get('/procurement/suggestions');
    return data;
  }

  async getPriceOptimizationSuggestions() {
    const { data } = await this.client.get('/procurement/optimizations');
    return data;
  }

  // MARKETING & CRM
  async getBundles() {
    const { data } = await this.client.get('/bundles');
    return data;
  }

  async createBundle(bundle: any) {
    return this.client.post('/bundles', bundle);
  }

  async deleteBundle(id: number) {
    return this.client.delete(`/bundles/${id}`);
  }

  async getStagnantCustomers() {
    const { data } = await this.client.get('/customers/stagnant');
    return data;
  }

  // CUSTOMERS
  async getCustomers(page = 0, size = 20, search?: string) {
    return this.client.get('/customers', {
      params: { page, size, search },
    });
  }

  async getCustomerById(id: string) {
    return this.client.get(`/customers/${id}`);
  }

  async createCustomer(customer: any) {
    return this.client.post('/customers', customer);
  }

  async updateCustomer(id: string, customer: any) {
    return this.client.put(`/customers/${id}`, customer);
  }

  async getCustomerHistory(id: string) {
    return this.client.get(`/customers/${id}/history`);
  }

  // ORDERS
  async getPendingOrders() {
    return this.client.get('/orders/pending');
  }

  async getAllOrders() {
    return this.client.get('/orders/all');
  }

  async getOrderById(id: string) {
    return this.client.get(`/orders/${id}`);
  }

  async getMyOrders() {
    return this.client.get('/orders/my');
  }

  async createOrder(order: any) {
    return this.client.post('/orders', order);
  }

  async updateOrderStatus(id: string, status: string) {
    return this.client.put(`/orders/${id}/status`, null, {
      params: { status },
    });
  }

  // STOREFRONT
  async getStorefrontProducts(page = 0, size = 20, category?: string) {
    return this.client.get('/storefront/products', {
      params: { page, size, category, inStockOnly: true, sort: 'newest' },
    });
  }

  async getStorefrontCategories() {
    return this.client.get('/storefront/categories');
  }

  async getStorefrontOffers() {
    return this.client.get('/storefront/offers');
  }

  // DASHBOARD
  async getDashboardStats() {
    return this.client.get('/dashboard/stats');
  }
}

export const apiClient = new APIClient();
export const api = apiClient;
export default apiClient;
