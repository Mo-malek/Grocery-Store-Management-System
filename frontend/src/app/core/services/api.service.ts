import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Customer, SaleRequest, SaleView, DashboardStats, Expense, ReorderSuggestion, PriceOptimizationSuggestion, RecommendationSuggestion, Bundle, Page, StorefrontProduct, StorefrontBundle, CategoryCount, DeliveryOrder, DeliveryStatus } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Products
    getProducts(search?: string, page: number = 0, size: number = 20): Observable<Page<Product>> {
        let params = new HttpParams()
            .set('page', page.toString())
            .set('size', size.toString());
        if (search) params = params.set('search', search);
        return this.http.get<Page<Product>>(`${this.apiUrl}/products`, { params });
    }

    getInventoryAuditReport(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/products/inventory-audit`);
    }

    getProduct(id: number): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/products/${id}`);
    }

    getProductByBarcode(barcode: string): Observable<Product> {
        return this.http.get<Product>(`${this.apiUrl}/products/barcode/${barcode}`);
    }

    createProduct(product: Product): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products`, product);
    }

    updateProduct(id: number, product: Product): Observable<Product> {
        return this.http.put<Product>(`${this.apiUrl}/products/${id}`, product);
    }

    deleteProduct(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/products/${id}`);
    }

    adjustStock(id: number, quantity: number, reason: string): Observable<Product> {
        return this.http.post<Product>(`${this.apiUrl}/products/${id}/adjust-stock`, { quantity, reason });
    }

    getLowStockProducts(): Observable<Product[]> {
        return this.http.get<Product[]>(`${this.apiUrl}/products/low-stock`);
    }

    // Customers
    getCustomers(search?: string): Observable<Customer[]> {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        return this.http.get<Customer[]>(`${this.apiUrl}/customers`, { params });
    }

    createCustomer(customer: Customer): Observable<Customer> {
        return this.http.post<Customer>(`${this.apiUrl}/customers`, customer);
    }

    updateCustomer(id: number, customer: Customer): Observable<Customer> {
        return this.http.put<Customer>(`${this.apiUrl}/customers/${id}`, customer);
    }

    getTopCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers/top`);
    }

    getStagnantCustomers(): Observable<Customer[]> {
        return this.http.get<Customer[]>(`${this.apiUrl}/customers/stagnant`);
    }

    // Sales
    createSale(request: SaleRequest): Observable<SaleView> {
        return this.http.post<SaleView>(`${this.apiUrl}/sales`, request);
    }

    getTodaySales(): Observable<SaleView[]> {
        return this.http.get<SaleView[]>(`${this.apiUrl}/sales/today`);
    }

    getSales(from: string, to: string, page: number = 0, size: number = 20): Observable<Page<SaleView>> {
        let params = new HttpParams()
            .set('from', from)
            .set('to', to)
            .set('page', page.toString())
            .set('size', size.toString());
        return this.http.get<Page<SaleView>>(`${this.apiUrl}/sales`, { params });
    }

    // Expenses
    getExpenses(): Observable<Expense[]> {
        return this.http.get<Expense[]>(`${this.apiUrl}/expenses`);
    }

    addExpense(expense: Expense): Observable<Expense> {
        return this.http.post<Expense>(`${this.apiUrl}/expenses`, expense);
    }

    deleteExpense(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/expenses/${id}`);
    }

    // Dashboard
    getDashboardStats(): Observable<DashboardStats> {
        return this.http.get<DashboardStats>(`${this.apiUrl}/dashboard/stats`);
    }

    // Procurement
    getReorderSuggestions(): Observable<ReorderSuggestion[]> {
        return this.http.get<ReorderSuggestion[]>(`${this.apiUrl}/procurement/suggestions`);
    }

    getPriceOptimizationSuggestions(): Observable<PriceOptimizationSuggestion[]> {
        return this.http.get<PriceOptimizationSuggestion[]>(`${this.apiUrl}/procurement/optimizations`);
    }

    getBasketSuggestions(productIds: number[]): Observable<RecommendationSuggestion[]> {
        let params = new HttpParams();
        productIds.forEach(id => {
            params = params.append('productIds', id.toString());
        });
        return this.http.get<RecommendationSuggestion[]>(`${this.apiUrl}/recommendations/basket`, { params });
    }

    // Bundles
    getBundles(): Observable<Bundle[]> {
        return this.http.get<Bundle[]>(`${this.apiUrl}/bundles`);
    }

    getActiveBundles(): Observable<Bundle[]> {
        return this.http.get<Bundle[]>(`${this.apiUrl}/bundles/active`);
    }

    createBundle(bundle: Bundle): Observable<Bundle> {
        return this.http.post<Bundle>(`${this.apiUrl}/bundles`, bundle);
    }

    deleteBundle(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/bundles/${id}`);
    }

    // Storefront (public)
    getStorefrontProducts(opts: { search?: string; category?: string; page?: number; size?: number; inStockOnly?: boolean; minPrice?: number; maxPrice?: number; sort?: 'priceAsc' | 'priceDesc' | 'newest' } = {}): Observable<Page<StorefrontProduct>> {
        let params = new HttpParams()
            .set('page', (opts.page ?? 0).toString())
            .set('size', (opts.size ?? 20).toString())
            .set('inStockOnly', (opts.inStockOnly ?? true).toString());
        if (opts.search) params = params.set('search', opts.search);
        if (opts.category) params = params.set('category', opts.category);
        if (opts.minPrice != null) params = params.set('minPrice', opts.minPrice);
        if (opts.maxPrice != null) params = params.set('maxPrice', opts.maxPrice);
        if (opts.sort) params = params.set('sort', opts.sort);
        return this.http.get<Page<StorefrontProduct>>(`${this.apiUrl}/storefront/products`, { params });
    }

    getStorefrontCategories(): Observable<string[]> {
        return this.http.get<string[]>(`${this.apiUrl}/storefront/categories`);
    }

    getStorefrontCategoriesCount(): Observable<CategoryCount[]> {
        return this.http.get<CategoryCount[]>(`${this.apiUrl}/storefront/categories/counts`);
    }

    getStorefrontProduct(id: number): Observable<StorefrontProduct> {
        return this.http.get<StorefrontProduct>(`${this.apiUrl}/storefront/products/${id}`);
    }

    getStorefrontOffers(): Observable<StorefrontBundle[]> {
        return this.http.get<StorefrontBundle[]>(`${this.apiUrl}/storefront/offers`);
    }

    // Admin User Management
    getAdminUsers(): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/admin/users`);
    }

    createStaff(staff: any): Observable<string> {
        return this.http.post(`${this.apiUrl}/admin/users/create-staff`, staff, { responseType: 'text' });
    }

    updateUser(id: number, user: any): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/admin/users/${id}`, user);
    }

    updateUserStatus(id: number, active: boolean): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/admin/users/${id}/status?active=${active}`, {});
    }

    updateUserRole(id: number, role: string): Observable<any> {
        return this.http.put<any>(`${this.apiUrl}/admin/users/${id}/role?role=${role}`, {});
    }

    deleteUser(id: number): Observable<void> {
        return this.http.delete<void>(`${this.apiUrl}/admin/users/${id}`);
    }

    // Orders
    placeOrder(order: any): Observable<any> {
        return this.http.post<any>(`${this.apiUrl}/orders`, order);
    }

    getMyOrders(): Observable<DeliveryOrder[]> {
        return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/orders/my`);
    }

    getCustomerOrders(username: string): Observable<DeliveryOrder[]> {
        return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/orders/customer/${username}`);
    }

    getProductReviews(productId: number): Observable<any[]> {
        return this.http.get<any[]>(`${this.apiUrl}/storefront/products/${productId}/reviews`);
    }

    getProductRecommendations(productId: number): Observable<StorefrontProduct[]> {
        return this.http.get<StorefrontProduct[]>(`${this.apiUrl}/storefront/products/${productId}/recommendations`);
    }

    getAllDeliveryOrders(): Observable<DeliveryOrder[]> {
        return this.http.get<DeliveryOrder[]>(`${this.apiUrl}/orders/all`);
    }

    updateDeliveryOrderStatus(id: number, status: DeliveryStatus): Observable<DeliveryOrder> {
        return this.http.put<DeliveryOrder>(`${this.apiUrl}/orders/${id}/status?status=${status}`, {});
    }
}
