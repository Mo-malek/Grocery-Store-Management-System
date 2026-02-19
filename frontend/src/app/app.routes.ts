import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
    {
        path: 'login',
        loadComponent: () => import('./modules/login/login.component').then(c => c.LoginComponent),
        title: 'تسجيل الدخول'
    },
    {
        path: 'signup',
        loadComponent: () => import('./modules/signup/signup.component').then(c => c.SignupComponent),
        title: 'إنشاء حساب جديد'
    },
    {
        path: '',
        canActivate: [authGuard],
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
                title: 'إدارة المخزون'
            },
            {
                path: 'customers',
                loadComponent: () => import('./modules/customers/customers.component').then(c => c.CustomersComponent),
                title: 'إدارة العملاء'
            },
            {
                path: 'expenses',
                loadComponent: () => import('./modules/expenses/expenses.component').then(c => c.ExpensesComponent),
                title: 'إدارة المصاريف'
            },
            {
                path: 'procurement',
                loadComponent: () => import('./modules/procurement/procurement.component').then(c => c.ProcurementComponent),
                title: 'التموين الذكي'
            },
            {
                path: 'history',
                loadComponent: () => import('./modules/history/history.component').then(c => c.HistoryComponent),
                title: 'سجل المبيعات'
            },
            {
                path: 'marketing',
                loadComponent: () => import('./modules/marketing/marketing.component').then(m => m.MarketingComponent),
                title: 'التسويق والعروض',
                canActivate: [authGuard]
            },
            {
                path: 'dashboard',
                loadComponent: () => import('./modules/dashboard/dashboard.component').then(c => c.DashboardComponent),
                title: 'لوحة التحكم'
            },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
