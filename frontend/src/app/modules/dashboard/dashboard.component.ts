import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats, SaleView } from '../../core/models/models';
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
          <h1>لوحة القيادة</h1>
          <p>عرض حي للعمليات والتحليل المالي للنظام الداخلي.</p>
        </div>
        <div class="header-actions">
          <a routerLink="/pos" class="quick-btn">فتح نقطة البيع</a>
          <a routerLink="/inventory" class="quick-btn">المخزون</a>
          <a *ngIf="isManagerOrAdmin" routerLink="/delivery-orders" class="quick-btn">طلبات التوصيل</a>
        </div>
      </header>

      <div class="dashboard-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">نظرة عامة</button>
        <button class="tab-btn" [class.active]="activeTab === 'team'" (click)="activeTab = 'team'">أداء الفريق</button>
      </div>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>جاري تحميل بيانات لوحة القيادة...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <ng-container *ngIf="activeTab === 'overview' && stats">
        <div class="stats-grid">
          <article class="kpi-card">
            <span>صحة المتجر</span>
            <strong>{{ stats.storeHealthScore }}%</strong>
          </article>
          <article class="kpi-card">
            <span>مبيعات اليوم</span>
            <strong>{{ stats.totalSalesToday | number:'1.2-2' }} ج.م</strong>
          </article>
          <article class="kpi-card">
            <span>ربح اليوم</span>
            <strong>{{ stats.estimatedProfitToday | number:'1.2-2' }} ج.م</strong>
          </article>
          <article class="kpi-card">
            <span>المبيعات الشهرية</span>
            <strong>{{ stats.totalSalesThisMonth | number:'1.2-2' }} ج.م</strong>
          </article>
          <article class="kpi-card">
            <span>المصاريف الشهرية</span>
            <strong>{{ stats.totalExpensesThisMonth | number:'1.2-2' }} ج.م</strong>
          </article>
          <article class="kpi-card accent">
            <span>صافي الربح</span>
            <strong>{{ stats.netProfitThisMonth | number:'1.2-2' }} ج.م</strong>
          </article>
        </div>

        <div class="split-grid">
          <article class="panel">
            <header>
              <h2>تحليل قنوات البيع</h2>
            </header>
            <div class="split-cards">
              <div class="split-card">
                <p class="split-title">مبيعات المتجر (POS)</p>
                <strong>{{ (stats.posSalesToday || 0) | number:'1.2-2' }} ج.م</strong>
                <small>اليوم: {{ stats.posTransactionCountToday || 0 }} عملية</small>
                <small>الشهر: {{ (stats.posSalesThisMonth || 0) | number:'1.2-2' }} ج.م</small>
              </div>
              <div class="split-card online">
                <p class="split-title">المبيعات أونلاين</p>
                <strong>{{ (stats.onlineSalesToday || 0) | number:'1.2-2' }} ج.م</strong>
                <small>اليوم: {{ stats.onlineTransactionCountToday || 0 }} عملية</small>
                <small>الشهر: {{ (stats.onlineSalesThisMonth || 0) | number:'1.2-2' }} ج.م</small>
              </div>
            </div>
            <div class="split-meta">
              <span>نسبة الأونلاين اليوم: {{ getChannelShare(stats.onlineSalesToday || 0, stats.totalSalesToday || 0) }}%</span>
              <span>نسبة الأونلاين هذا الشهر: {{ getChannelShare(stats.onlineSalesThisMonth || 0, stats.totalSalesThisMonth || 0) }}%</span>
            </div>
          </article>

          <article class="panel">
            <header>
              <h2>صحة المخزون والتنبيهات</h2>
            </header>
            <div class="inventory-snapshot">
              <div class="inventory-chip">
                <span>إجمالي التنبيهات</span>
                <strong>{{ getCriticalAlertsCount(stats) }}</strong>
              </div>
              <div class="inventory-chip warning">
                <span>مخزون منخفض</span>
                <strong>{{ stats.lowStockCount || 0 }}</strong>
              </div>
              <div class="inventory-chip danger">
                <span>نفاد مخزون</span>
                <strong>{{ stats.outOfStockCount || 0 }}</strong>
              </div>
              <div class="inventory-chip danger">
                <span>قرب الانتهاء (7 أيام)</span>
                <strong>{{ stats.expiringSoonCount || 0 }}</strong>
              </div>
            </div>
          </article>
        </div>

        <article class="panel danger" *ngIf="stats.lowStockProducts?.length">
          <header>
            <h2>تنبيهات انخفاض المخزون</h2>
            <a routerLink="/inventory">فتح المخزون</a>
          </header>
          <div class="alert-grid">
            <div class="alert-item" *ngFor="let product of stats.lowStockProducts">
              <strong>{{ product.name }}</strong>
              <span>المخزون: {{ product.currentStock }} {{ product.unit }}</span>
            </div>
          </div>
        </article>

        <div class="charts-grid">
          <article class="panel chart">
            <app-bar-chart [title]="'المبيعات اليومية (آخر 7 أيام)'" [data]="dailySalesData"></app-bar-chart>
          </article>
          <article class="panel chart">
            <app-bar-chart [title]="'أرباح الفئات (هذا الشهر)'" [data]="categoryProfitData"></app-bar-chart>
          </article>
        </div>

        <div class="tables-grid">
          <article class="panel">
            <header>
              <h2>أحدث المبيعات</h2>
            </header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>#</th>
                    <th>الوقت</th>
                    <th>النوع</th>
                    <th>العميل</th>
                    <th>الإجمالي</th>
                    <th>الدفع</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let sale of stats.recentSales">
                    <td>#{{ sale.id }}</td>
                    <td>{{ sale.createdAt | date:'shortTime' }}</td>
                    <td>
                      <span class="channel-pill" [attr.data-channel]="sale.saleChannel || 'POS'">
                        {{ getSaleChannelLabel(sale.saleChannel) }}
                      </span>
                    </td>
                    <td>{{ getSaleCustomerName(sale) }}</td>
                    <td class="amount">{{ sale.total | number:'1.2-2' }} ج.م</td>
                    <td>
                      <span class="status-pill" [attr.data-status]="sale.paymentMethod">{{ getPaymentLabel(sale.paymentMethod) }}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </article>

          <article class="panel">
            <header>
              <h2>تحليلات الفئات</h2>
            </header>
            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>الفئة</th>
                    <th>الإيرادات</th>
                    <th>الربح</th>
                    <th>الهامش</th>
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
            <h2>ترتيب الموظفين</h2>
          </header>
          <div class="table-wrap">
            <table>
              <thead>
                <tr>
                  <th>الترتيب</th>
                  <th>الموظف</th>
                  <th>العمليات</th>
                  <th>إجمالي المبيعات</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let emp of stats.employeeLeaderboard; let i = index">
                  <td><span class="rank" [class.top]="i < 3">{{ i + 1 }}</span></td>
                  <td>{{ emp.fullName || 'كاشير' }}</td>
                  <td>{{ emp.transactionCount }}</td>
                  <td class="amount">{{ emp.totalSales | number:'1.2-2' }} ج.م</td>
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

    .split-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: var(--space-2);
    }

    .split-cards {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.7rem;
      margin-bottom: 0.75rem;
    }

    .split-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.72rem;
      background: var(--surface-soft);
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
    }

    .split-card.online {
      border-color: rgba(var(--secondary-rgb), 0.35);
      background: rgba(var(--secondary-rgb), 0.08);
    }

    .split-title {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .split-card strong {
      color: var(--text-main);
      font-size: 1.05rem;
    }

    .split-card small {
      color: var(--text-secondary);
      font-size: 0.77rem;
      font-weight: 600;
    }

    .split-meta {
      display: flex;
      flex-wrap: wrap;
      gap: 0.45rem;
      color: var(--text-secondary);
      font-size: 0.78rem;
    }

    .split-meta span {
      border: 1px solid var(--border-color);
      border-radius: 999px;
      padding: 0.2rem 0.5rem;
      background: var(--surface-soft);
    }

    .inventory-snapshot {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.65rem;
    }

    .inventory-chip {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      background: var(--surface-soft);
      padding: 0.72rem;
      display: flex;
      flex-direction: column;
      gap: 0.2rem;
    }

    .inventory-chip span {
      color: var(--text-muted);
      font-size: 0.78rem;
      font-weight: 700;
    }

    .inventory-chip strong {
      color: var(--text-main);
      font-size: 1.2rem;
      line-height: 1.1;
    }

    .inventory-chip.warning {
      border-color: rgba(217, 119, 6, 0.35);
      background: rgba(217, 119, 6, 0.08);
    }

    .inventory-chip.warning strong {
      color: var(--warning-color);
    }

    .inventory-chip.danger {
      border-color: rgba(220, 38, 38, 0.35);
      background: rgba(220, 38, 38, 0.08);
    }

    .inventory-chip.danger strong {
      color: var(--danger-color);
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

    .channel-pill {
      padding: 0.16rem 0.55rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      background: var(--surface-soft);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    .channel-pill[data-channel="ONLINE"] {
      color: var(--secondary-color);
      border-color: rgba(var(--secondary-rgb), 0.35);
      background: rgba(var(--secondary-rgb), 0.12);
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
      .split-grid,
      .split-cards,
      .inventory-snapshot,
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
        this.loadError = 'فشل تحميل إحصائيات لوحة القيادة.';
        this.toast.error('فشل تحميل لوحة القيادة');
      }
    });
  }

  getPaymentLabel(method: string): string {
    return method === 'CASH' ? 'نقدي' : 'فيزا';
  }

  getSaleChannelLabel(channel?: string): string {
    return channel === 'ONLINE' ? 'أونلاين' : 'المتجر';
  }

  getSaleCustomerName(sale: SaleView): string {
    if (sale.customer?.name?.trim()) {
      return sale.customer.name;
    }
    if (sale.externalCustomerName?.trim()) {
      return sale.externalCustomerName;
    }
    return 'عميل نقدي';
  }

  getChannelShare(channelSales: number, totalSales: number): number {
    const total = Number(totalSales) || 0;
    if (total <= 0) {
      return 0;
    }
    const part = Number(channelSales) || 0;
    return Math.round((part / total) * 100);
  }

  getCriticalAlertsCount(stats: DashboardStats): number {
    return (Number(stats.lowStockCount) || 0)
      + (Number(stats.outOfStockCount) || 0)
      + (Number(stats.expiringSoonCount) || 0);
  }

  getMargin(profit: number, revenue: number): string {
    if (!revenue) return '0';
    return ((profit / revenue) * 100).toFixed(0);
  }
}
