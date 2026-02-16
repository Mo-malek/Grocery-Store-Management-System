import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { LoginComponent } from './modules/login/login.component';
import { PosComponent } from './modules/pos/pos.component';
import { InventoryComponent } from './modules/inventory/inventory.component';
import { CustomersComponent } from './modules/customers/customers.component';
import { DashboardComponent } from './modules/dashboard/dashboard.component';
import { HomeComponent } from './modules/home/home.component';
import { HistoryComponent } from './modules/history/history.component';

export const routes: Routes = [
    { path: 'login', component: LoginComponent, title: 'تسجيل الدخول' },
    {
        path: '',
        canActivate: [authGuard],
        children: [
            { path: 'home', component: HomeComponent, title: 'الرئيسية | بقالتي' },
            { path: 'pos', component: PosComponent, title: 'نقطة البيع' },
            { path: 'inventory', component: InventoryComponent, title: 'إدارة المخزون' },
            { path: 'customers', component: CustomersComponent, title: 'إدارة العملاء' },
            { path: 'expenses', loadComponent: () => import('./modules/expenses/expenses.component').then(c => c.ExpensesComponent), title: 'إدارة المصاريف' },
            { path: 'procurement', loadComponent: () => import('./modules/procurement/procurement.component').then(c => c.ProcurementComponent), title: 'التموين الذكي' },
            { path: 'history', component: HistoryComponent, title: 'سجل المبيعات' },
            { path: 'marketing', loadComponent: () => import('./modules/marketing/marketing.component').then(m => m.MarketingComponent), title: 'التسويق والعروض', canActivate: [authGuard] },
            { path: 'dashboard', component: DashboardComponent, title: 'لوحة التحكم' },
            { path: '', redirectTo: '/dashboard', pathMatch: 'full' }
        ]
    },
    { path: '**', redirectTo: 'home' }
];
