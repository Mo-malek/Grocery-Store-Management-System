import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { managerGuard } from './core/guards/manager.guard';
import { adminManagerGuard } from './core/guards/admin-manager.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/login/login.component').then(c => c.LoginComponent),
        title: 'تسجيل الدخول'
    },
    {
        path: 'shop',
        loadComponent: () => import('./modules/storefront/storefront-layout.component').then(c => c.StorefrontLayoutComponent),
        title: 'المتجر',
        children: [
            { path: '', redirectTo: 'home', pathMatch: 'full' },
            { path: 'home', loadComponent: () => import('./modules/storefront/storefront-home.component').then(c => c.StorefrontHomeComponent) },
            { path: 'categories', loadComponent: () => import('./modules/storefront/storefront-categories.component').then(c => c.StorefrontCategoriesComponent) },
            { path: 'catalog', loadComponent: () => import('./modules/storefront/storefront-catalog.component').then(c => c.StorefrontCatalogComponent) },
            { path: 'product/:id', loadComponent: () => import('./modules/storefront/storefront-product.component').then(c => c.StorefrontProductComponent) },
            { path: 'offers', loadComponent: () => import('./modules/storefront/storefront-offers.component').then(c => c.StorefrontOffersComponent) },
            { path: 'search', loadComponent: () => import('./modules/storefront/storefront-search.component').then(c => c.StorefrontSearchComponent) },
            { path: 'cart', loadComponent: () => import('./modules/storefront/storefront-cart.component').then(c => c.StorefrontCartComponent) },
            { path: 'checkout', loadComponent: () => import('./modules/storefront/storefront-checkout.component').then(c => c.StorefrontCheckoutComponent) },
            { path: 'profile', loadComponent: () => import('./modules/storefront/storefront-profile.component').then(c => c.StorefrontProfileComponent) },
            { path: 'orders', loadComponent: () => import('./modules/storefront/storefront-orders.component').then(c => c.StorefrontOrdersComponent) },
        ]
    },
    {
        path: 'signup',
        loadComponent: () => import('./modules/signup/signup.component').then(c => c.SignupComponent),
        title: 'إنشاء حساب'
    },
    { path: '', redirectTo: 'shop/home', pathMatch: 'full' },
    {
        path: '',
        canActivate: [authGuard, managerGuard],
        children: [
            {
                path: 'home',
                loadComponent: () => import('./modules/home/home.component').then(c => c.HomeComponent),
                title: 'الرئيسية | بقالتي'
            },
            {
                path: 'pos',
                loadComponent: () => import('./modules/pos/pos.component').then(c => c.PosComponent),
                title: 'نقطة البيع'
            },
            {
                path: 'inventory',
                loadComponent: () => import('./modules/inventory/inventory.component').then(c => c.InventoryComponent),
                title: 'المخزون'
            },
            {
                path: 'customers',
                loadComponent: () => import('./modules/customers/customers.component').then(c => c.CustomersComponent),
                title: 'العملاء'
            },
            {
                path: 'expenses',
                loadComponent: () => import('./modules/expenses/expenses.component').then(c => c.ExpensesComponent),
                title: 'المصاريف',
                canActivate: [adminManagerGuard]
            },
            {
                path: 'procurement',
                loadComponent: () => import('./modules/procurement/procurement.component').then(c => c.ProcurementComponent),
                title: 'التموين',
                canActivate: [adminManagerGuard]
            },
            {
                path: 'history',
                loadComponent: () => import('./modules/history/history.component').then(c => c.HistoryComponent),
                title: 'سجل المبيعات'
            },
            {
                path: 'marketing',
                loadComponent: () => import('./modules/marketing/marketing.component').then(m => m.MarketingComponent),
                title: 'التسويق',
                canActivate: [adminManagerGuard]
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent),
                title: 'لوحة التحكم'
            },
            {
                path: 'staff',
                loadComponent: () => import('./modules/admin/user-management.component').then(c => c.UserManagementComponent),
                title: 'إدارة الموظفين',
                canActivate: [adminManagerGuard]
            },
            {
                path: 'delivery-orders',
                loadComponent: () => import('./modules/admin/delivery-order-management.component').then(c => c.DeliveryOrderManagementComponent),
                title: 'طلبات التوصيل',
                canActivate: [adminManagerGuard]
            }
        ]
    },
    { path: '**', redirectTo: 'shop/home' }
];
