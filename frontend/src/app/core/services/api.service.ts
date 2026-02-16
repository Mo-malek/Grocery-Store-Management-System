import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Product, Customer, SaleRequest, SaleView, DashboardStats, Expense, ReorderSuggestion, PriceOptimizationSuggestion, RecommendationSuggestion, Bundle } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class ApiService {
    private apiUrl = environment.apiUrl;

    constructor(private http: HttpClient) { }

    // Products
    getProducts(search?: string): Observable<Product[]> {
        let params = new HttpParams();
        if (search) params = params.set('search', search);
        return this.http.get<Product[]>(`${this.apiUrl}/products`, { params });
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
}
