import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';
import { BarChartComponent } from '../../shared/components/chart/bar-chart.component';
import { ToastService } from '../../core/services/toast.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterModule, BarChartComponent],
  template: `
    <section class="dashboard-page">
      <header class="page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Live operational and financial view of your internal system.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/pos" class="quick-btn">Open POS</a>
          <a routerLink="/inventory" class="quick-btn">Inventory</a>
          <a *ngIf="isManagerOrAdmin" routerLink="/delivery-orders" class="quick-btn">Delivery Orders</a>
        </div>
      </header>

      <div class="dashboard-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">Overview</button>
        <button class="tab-btn" [class.active]="activeTab === 'team'" (click)="activeTab = 'team'">Team Performance</button>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading dashboard data...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <ng-container *ngIf="activeTab === 'overview' && stats">
        <div class="stats-grid">
          <article class="kpi-card">
            <span>Store Health</span>
            <strong>{{ stats.storeHealthScore }}%</strong>
          </article>
          <article class="kpi-card">
            <span>Sales Today</span>
            <strong>{{ stats.totalSalesToday | number:'1.2-2' }} EGP</strong>
          </article>
          <article class="kpi-card">
            <span>Profit Today</span>
            <strong>{{ stats.estimatedProfitToday | number:'1.2-2' }} EGP</strong>
          </article>
          <article class="kpi-card">
            <span>Monthly Sales</span>
            <strong>{{ stats.totalSalesThisMonth | number:'1.2-2' }} EGP</strong>
          </article>
          <article class="kpi-card">
            <span>Monthly Expenses</span>
            <strong>{{ stats.totalExpensesThisMonth | number:'1.2-2' }} EGP</strong>
          </article>
          <article class="kpi-card accent">
            <span>Net Profit</span>
            <strong>{{ stats.netProfitThisMonth | number:'1.2-2' }} EGP</strong>
          </article>
        </div>

        <article class="panel danger" *ngIf="stats.lowStockProducts?.length">
          <header>
            <h2>Low Stock Alerts</h2>
            <a routerLink="/inventory">Open inventory</a>
          </header>
          <div class="alert-grid">
            <div class="alert-item" *ngFor="let product of stats.lowStockProducts">
              <strong>{{ product.name }}</strong>
              <span>Stock: {{ product.currentStock }} {{ product.unit }}</span>
            </div>
          </div>
        </article>

        <div class="charts-grid">
          <article class="panel chart">
            <app-bar-chart [title]="'Daily Sales (Last 7 days)'" [data]="dailySalesData"></app-bar-chart>
          </article>
          <article class="panel chart">
            <app-bar-chart [title]="'Category Profit (This month)'" [data]="categoryProfitData"></app-bar-chart>
          </article>
        </div>

        <div class="tables-grid">
          <article class="panel">
            <header>
              <h2>Recent Sales</h2>
            </header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>Time</th>
                    <th>Customer</th>
                    <th>Total</th>
                    <th>Payment</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of stats.recentSales">
                    <td>#{{ sale.id }}</td>
                    <td>{{ sale.createdAt | date:'shortTime' }}</td>
                    <td>{{ sale.customer ? sale.customer.name : 'Cash Customer' }}</td>
                    <td class="amount">{{ sale.total | number:'1.2-2' }} EGP</td>
                    <td>
                      <span class="status-pill" [attr.data-status]="sale.paymentMethod">{{ sale.paymentMethod }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <header>
              <h2>Category Analytics</h2>
            </header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Category</th>
                    <th>Revenue</th>
                    <th>Profit</th>
                    <th>Margin</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let category of stats.categoryAnalytics">
                    <td>{{ category.category }}</td>
                    <td>{{ category.totalRevenue | number:'1.0-0' }}</td>
                    <td class="success">{{ category.totalProfit | number:'1.0-0' }}</td>
                    <td>{{ getMargin(category.totalProfit, category.totalRevenue) }}%</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>
        </div>
      </ng-container>

      <ng-container *ngIf="activeTab === 'team' && stats">
        <article class="panel">
          <header>
            <h2>Employee Leaderboard</h2>
          </header>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>Rank</th>
                  <th>Employee</th>
                  <th>Transactions</th>
                  <th>Total Sales</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let emp of stats.employeeLeaderboard; let i = index">
                  <td><span class="rank" [class.top]="i < 3">{{ i + 1 }}</span></td>
                  <td>{{ emp.fullName || 'Cashier' }}</td>
                  <td>{{ emp.transactionCount }}</td>
                  <td class="amount">{{ emp.totalSales | number:'1.2-2' }} EGP</td>
                </tr>
              </tbody>
            </table>
          </div>
        </article>
      </ng-container>
    </section>
  `,
  styles: [`
    .dashboard-page {
      max-width: 1480px;
      margin: 0 auto;
      padding: 0;
      display: flex;
      flex-direction: column;
      gap: var(--space-2);
    }

    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: var(--space-2);
      flex-wrap: wrap;
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: var(--space-2);
      box-shadow: var(--shadow-xs);
    }

    .page-header h1 {
      margin: 0;
      font-size: clamp(1.4rem, 2.2vw, 1.9rem);
    }

    .page-header p {
      margin: 0.35rem 0 0;
      color: var(--text-secondary);
    }

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      flex-wrap: wrap;
    }

    .quick-btn {
      min-height: 40px;
      border-radius: 11px;
      border: 1px solid var(--primary-color);
      color: var(--primary-color);
      text-decoration: none;
      padding: 0.45rem 0.8rem;
      font-size: 0.82rem;
      font-weight: 700;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: 0.2s ease;
    }

    .quick-btn:hover {
      background: rgba(var(--primary-rgb), 0.08);
      transform: translateY(-1px);
    }

    .dashboard-tabs {
      display: inline-flex;
      gap: 0.5rem;
      padding: 0.4rem;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--bg-card);
      width: fit-content;
      box-shadow: var(--shadow-xs);
    }

    .loading-state {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      padding: 1.2rem;
      display: flex;
      align-items: center;
      justify-content: center;
      gap: 0.7rem;
      color: var(--text-muted);
    }

    .spinner {
      width: 28px;
      height: 28px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }

    .error-state {
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: var(--radius-md);
      background: var(--danger-soft);
      color: var(--danger-color);
      padding: 0.75rem 0.9rem;
      font-weight: 600;
      margin: 0;
    }

    .tab-btn {
      min-height: 38px;
      border: none;
      border-radius: 9px;
      background: transparent;
      color: var(--text-muted);
      padding: 0.42rem 0.95rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .tab-btn.active {
      background: var(--secondary-color);
      color: var(--secondary-text);
    }

    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(210px, 1fr));
      gap: var(--space-2);
    }

    .kpi-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      padding: 0.95rem;
      display: flex;
      flex-direction: column;
      gap: 0.32rem;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
    }

    .kpi-card span {
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 600;
    }

    .kpi-card strong {
      color: var(--text-main);
      font-size: 1.25rem;
    }

    .kpi-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-md);
    }

    .kpi-card.accent strong {
      color: var(--secondary-color);
    }

    .panel {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-sm);
      padding: 0.95rem;
    }

    .panel header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 0.75rem;
    }

    .panel header h2 {
      margin: 0;
      font-size: 1.05rem;
    }

    .panel header a {
      text-decoration: none;
      color: var(--primary-color);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .panel.danger {
      border-color: rgba(220, 38, 38, 0.35);
      background: var(--danger-soft);
    }

    .alert-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
      gap: 0.6rem;
    }

    .alert-item {
      border: 1px solid rgba(220, 38, 38, 0.25);
      border-radius: 10px;
      background: var(--bg-card);
      padding: 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .alert-item strong {
      font-size: 0.9rem;
      color: var(--text-main);
    }

    .alert-item span {
      color: var(--danger-color);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .charts-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
    }

    .panel.chart {
      min-height: 350px;
    }

    .tables-grid {
      display: grid;
      grid-template-columns: 1.2fr 1fr;
      gap: var(--space-2);
    }

    .table-wrap {
      width: 100%;
      overflow-x: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 0.7rem 0.55rem;
      border-bottom: 1px solid var(--border-color);
      text-align: right;
      white-space: nowrap;
      font-size: 0.84rem;
      color: var(--text-secondary);
    }

    th {
      color: var(--text-muted);
      font-size: 0.76rem;
      font-weight: 700;
      text-transform: uppercase;
    }

    td:first-child,
    td:nth-child(2),
    td:nth-child(3) {
      color: var(--text-main);
    }

    .amount {
      color: var(--secondary-color) !important;
      font-weight: 800;
    }

    .success {
      color: var(--success-color) !important;
      font-weight: 800;
    }

    .status-pill {
      padding: 0.16rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--surface-soft);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    .status-pill[data-status="CARD"] {
      color: var(--primary-color);
      background: var(--info-soft);
      border-color: rgba(var(--primary-rgb), 0.3);
    }

    .status-pill[data-status="CASH"] {
      color: var(--success-color);
      background: var(--success-soft);
      border-color: rgba(22, 163, 74, 0.3);
    }

    .rank {
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--surface-soft);
      color: var(--text-main);
      font-size: 0.8rem;
      font-weight: 800;
      border: 1px solid var(--border-color);
    }

    .rank.top {
      background: var(--secondary-color);
      color: var(--secondary-text);
      border-color: var(--secondary-color);
    }

    @media (max-width: 1080px) {
      .charts-grid,
      .tables-grid {
        grid-template-columns: 1fr;
      }
    }

    @media (max-width: 768px) {
      .dashboard-page {
        gap: var(--space-1);
      }

      .page-header,
      .panel {
        padding: var(--space-2);
      }

      .dashboard-tabs {
        width: 100%;
        justify-content: space-between;
      }

      .tab-btn {
        flex: 1;
      }
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  dailySalesData: { label: string, value: number }[] = [];
  categoryProfitData: { label: string, value: number }[] = [];
  activeTab: 'overview' | 'team' = 'overview';
  isLoading = false;
  loadError = '';
  get isManagerOrAdmin(): boolean {
    const role = this.auth.currentUserValue?.role;
    return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER';
  }

  constructor(private api: ApiService, private toast: ToastService, private auth: AuthService) { }

  ngOnInit() {
    this.isLoading = true;
    this.loadError = '';
    this.api.getDashboardStats().subscribe({
      next: data => {
        this.stats = data;
        this.dailySalesData = data.dailySales.map(d => ({ label: d.date, value: d.totalSales }));
        this.categoryProfitData = data.categoryAnalytics.map(c => ({ label: c.category, value: Number(c.totalProfit) }));
        this.isLoading = false;
      },
      error: () => {
        this.stats = null;
        this.isLoading = false;
        this.loadError = 'Failed to load dashboard statistics.';
        this.toast.error('Failed to load dashboard');
      }
    });
  }

  getMargin(profit: number, revenue: number): string {
    if (!revenue) return '0';
    return ((profit / revenue) * 100).toFixed(0);
  }
}
