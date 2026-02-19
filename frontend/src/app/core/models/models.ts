export interface Product {
    id?: number;
    name: string;
    barcode: string;
    category: string;
    purchasePrice: number;
    sellingPrice: number;
    currentStock: number;
    minStock: number;
    unit: string;
    active?: boolean;
    profitMargin?: number;
    profitPercentage?: number;
    expiryDate?: string;
    manufacturer?: string;
}

export interface ReorderSuggestion {
    productId: number;
    productName: string;
    currentStock: number;
    dailyVelocity: number;
    daysUntilOut?: number;
    suggestedReorderQuantity: number;
    unit: string;
}

export interface Customer {
    id?: number;
    name: string;
    phone: string;
    totalPurchases?: number;
    loyaltyPoints?: number;
    lastVisitAt?: string;
    avgTicketSize?: number;
    favoriteCategory?: string;
    visitCount?: number;
    createdAt?: string;
}

export interface SaleItemRequest {
    productId: number;
    quantity: number;
}

export interface SaleRequest {
    customerId?: number;
    items: SaleItemRequest[];
    bundleIds?: number[];
    discount?: number;
    paymentMethod: 'CASH' | 'CARD';
}

export interface SaleView {
    id: number;
    subtotal: number;
    discount: number;
    total: number;
    paymentMethod: 'CASH' | 'CARD';
    createdAt: string;
    customer?: Customer;
    items?: SaleItemView[];
}

export interface SaleItemView {
    id: number;
    productId: number;
    productName: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface DashboardStats {
    totalSalesToday: number;
    totalSalesThisMonth: number;
    transactionCountToday: number;
    averageBasketSize: number;
    estimatedProfitToday: number;
    netProfitThisMonth: number;
    totalExpensesThisMonth: number;
    lowStockCount: number;
    lowStockProducts?: Product[];
    topProducts: TopProduct[];
    dailySales: DailySale[];
    peakHours: HourlySale[];
    recentSales: SaleView[];

    // Phase 11
    heatMap: HeatMapPoint[];
    categoryAnalytics: CategoryAnalytic[];
    storeHealthScore: number;

    // Phase 12
    employeeLeaderboard: EmployeePerformance[];
}

export interface CategoryAnalytic {
    category: string;
    totalQuantity: number;
    totalRevenue: number;
    totalProfit: number;
}

export interface HeatMapPoint {
    dayOfWeek: number;
    hour: number;
    count: number;
}

export interface TopProduct {
    productId: number;
    productName: string;
    totalQuantity: number;
    totalRevenue: number;
}

export interface DailySale {
    date: string;
    transactionCount: number;
    totalSales: number;
}

export interface HourlySale {
    hour: number;
    transactionCount: number;
    totalSales: number;
}

export interface RegisterRequest {
    fullName: string;
    username: string;
    password?: string;
}

export interface AuthRequest {
    username: string;
    password?: string;
}

export interface AuthResponse {
    token: string;
    username: string;
    role: string;
}

export interface Expense {
    id?: number;
    description: string;
    amount: number;
    category: string;
    createdAt?: string;
}

export interface StockLog {
    id: number;
    productId: number;
    productName?: string;
    quantityChange: number;
    type: string;
    reason?: string;
    createdAt: string;
}

export interface PriceOptimizationSuggestion {
    productId: number;
    productName: string;
    currentStock: number;
    currentPrice: number;
    suggestedPrice: number;
    reason: 'SLOW_MOVING' | 'EXPIRING_SOON';
    message: string;
}

export interface RecommendationSuggestion {
    productId: number;
    productName: string;
    frequency: number;
    category: string;
    price: number;
}

export interface Bundle {
    id?: number;
    name: string;
    price: number;
    active: boolean;
    items?: BundleItem[];
    createdAt?: string;
}

export interface BundleItem {
    id?: number;
    product: Product;
    quantity: number;
}

export interface EmployeePerformance {
    userId: number;
    fullName: string;
    transactionCount: number;
    totalSales: number;
}

export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
    first: boolean;
    last: boolean;
    empty: boolean;
}

