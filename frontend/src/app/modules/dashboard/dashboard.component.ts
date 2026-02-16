import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';
import { BarChartComponent } from '../../shared/components/chart/bar-chart.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, BarChartComponent],
  template: `
    <div class="container">
      <h1>📊 لوحة التحكم</h1>
      
      <!-- Tabs -->
      <div class="dashboard-tabs">
        <button class="tab-btn" [class.active]="activeTab === 'overview'" (click)="activeTab = 'overview'">📊 نظرة عامة</button>
        <button class="tab-btn" [class.active]="activeTab === 'performance'" (click)="activeTab = 'performance'">🏆 أداء الموظفين</button>
      </div>

      <div *ngIf="activeTab === 'overview'">
        <!-- KPIs Row 1 -->
        <div class="stats-grid">
          <div class="stat-card health pt-0" style="padding-top: 0; padding-bottom: 0;">
            <div class="health-gauge" [style.--score]="stats?.storeHealthScore || 0">
              <div class="gauge-value">{{ stats?.storeHealthScore }}%</div>
              <div class="gauge-label">صحة المتجر</div>
            </div>
          </div>
          <div class="stat-card primary">
            <div class="stat-icon">💰</div>
            <div class="stat-info">
              <div class="stat-title">مبيعات اليوم</div>
              <div class="stat-value">{{ stats?.totalSalesToday | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
          <div class="stat-card success">
            <div class="stat-icon">📈</div>
            <div class="stat-info">
              <div class="stat-title">ربح اليوم (تقديري)</div>
              <div class="stat-value">{{ stats?.estimatedProfitToday | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
          <div class="stat-card info">
            <div class="stat-icon">🛒</div>
            <div class="stat-info">
              <div class="stat-title">متوسط السلة</div>
              <div class="stat-value">{{ stats?.averageBasketSize | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
        </div>

        <!-- KPIs Row 2 -->
        <div class="stats-grid">
          <div class="stat-card secondary">
            <div class="stat-icon">📊</div>
            <div class="stat-info">
              <div class="stat-title">مبيعات الشهر</div>
              <div class="stat-value">{{ stats?.totalSalesThisMonth | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
          <div class="stat-card warning">
            <div class="stat-icon">💸</div>
            <div class="stat-info">
              <div class="stat-title">مصاريف الشهر</div>
              <div class="stat-value">{{ stats?.totalExpensesThisMonth | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
          <div class="stat-card accent">
            <div class="stat-icon">💎</div>
            <div class="stat-info">
              <div class="stat-title">صافي ربح الشهر</div>
              <div class="stat-value">{{ stats?.netProfitThisMonth | number:'1.2-2' }} ج.م</div>
            </div>
          </div>
        </div>

        <!-- Inventory Alerts -->
        <div class="alert-box danger" *ngIf="stats?.lowStockProducts?.length">
          <div class="alert-header">
            <span class="icon">🚨</span>
            <h3>تنبيه: منتجات أوشكت على النفاذ</h3>
          </div>
          <div class="alert-items">
            <div class="alert-item" *ngFor="let p of stats?.lowStockProducts">
              <span class="p-name">{{ p.name }}</span>
              <span class="p-stock">المخزون الحالي: <strong>{{ p.currentStock }}</strong> {{ p.unit }}</span>
              <span class="p-min">(الحد الأدنى: {{ p.minStock }})</span>
            </div>
          </div>
        </div>

        <!-- Charts -->
        <div class="charts-grid">
          <div class="card chart-container">
            <app-bar-chart [title]="'المبيعات اليومية (آخر 7 أيام)'" [data]="dailySalesData"></app-bar-chart>
          </div>
          <div class="card chart-container">
            <app-bar-chart [title]="'أرباح التصنيفات (هذا الشهر)'" [data]="categoryProfitData"></app-bar-chart>
          </div>
        </div>

        <!-- Heat Map -->
        <div class="card heat-map-container" *ngIf="stats?.heatMap?.length" style="margin-bottom: 1.5rem;">
          <h3 style="margin-bottom: 1rem;">🔥 خريطة حرارة المبيعات (توزيع العمليات حسب اليوم والساعة)</h3>
          <div class="heat-map-grid">
             <div class="day-row" *ngFor="let day of [1,2,3,4,5,6,7]">
                <div class="day-label">{{ getDayName(day) }}</div>
                <div class="hour-cells">
                  <div *ngFor="let hour of hours" 
                       class="hour-cell" 
                       [style.opacity]="getHeatOpacity(day, hour)"
                       [title]="'الساعة ' + hour + ': ' + getHeatCount(day, hour) + ' عملية'">
                  </div>
                </div>
             </div>
          </div>
        </div>

        <!-- Recent Sales -->
        <div class="card recent-sales">
          <h3>أحدث العمليات</h3>
          <table>
            <thead>
              <tr>
                <th>رقم الفاتورة</th>
                <th>التاريخ</th>
                <th>العميل</th>
                <th>الإجمالي</th>
                <th>طريقة الدفع</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let sale of stats?.recentSales">
                <td>#{{ sale.id }}</td>
                <td>{{ sale.createdAt | date:'shortTime' }}</td>
                <td>{{ sale.customer ? sale.customer.name : 'عميل نقدي' }}</td>
                <td>{{ sale.total | number:'1.2-2' }} ج.م</td>
                <td>
                  <span class="badge" [class.cash]="sale.paymentMethod === 'CASH'">
                    {{ sale.paymentMethod === 'CASH' ? 'كاش' : 'فيزا' }}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <!-- Category Profitability -->
        <div class="card financials mt-4">
          <h3>📈 تحليلات الأرباح حسب التصنيف</h3>
          <table class="table-simple" style="width: 100%; margin-top: 1rem;">
            <thead>
              <tr style="border-bottom: 2px solid var(--border-color); text-align: right;">
                <th style="padding: 0.5rem;">التصنيف</th>
                <th style="padding: 0.5rem;">المبيعات</th>
                <th style="padding: 0.5rem;">الأرباح</th>
                <th style="padding: 0.5rem;">الهامش</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let cat of stats?.categoryAnalytics" style="border-bottom: 1px solid var(--border-color);">
                <td style="padding: 0.5rem;">{{ cat.category }}</td>
                <td style="padding: 0.5rem;">{{ cat.totalRevenue | number:'1.0-0' }}</td>
                <td style="padding: 0.5rem;" class="text-success">{{ cat.totalProfit | number:'1.0-0' }}</td>
                <td style="padding: 0.5rem;">{{ (cat.totalProfit / cat.totalRevenue * 100) | number:'1.0-0' }}%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Performance Tab -->
      <div *ngIf="activeTab === 'performance'">
        <div class="card performance-card">
          <div class="perf-header">
            <h3>🏆 قائمة المتصدرين (هذا الشهر)</h3>
            <p>يتم احتساب الترتيب بناءً على إجمالي المبيعات المحققة.</p>
          </div>
          <table class="table-fancy">
            <thead>
              <tr>
                <th>الترتيب</th>
                <th>الموظف</th>
                <th>عدد العمليات</th>
                <th>إجمالي المبيعات</th>
                <th>التقييم</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let emp of stats?.employeeLeaderboard; let i = index">
                <td><span class="rank-badge" [class.top]="i < 3">{{ i + 1 }}</span></td>
                <td><strong>{{ emp.fullName || 'كاشير' }}</strong></td>
                <td>{{ emp.transactionCount }}</td>
                <td>{{ emp.totalSales | number:'1.2-2' }} ج.م</td>
                <td>
                  <span class="stars">⭐⭐⭐⭐⭐</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1.5rem;
      margin-bottom: 2rem;
    }
    
    .stat-card {
      background: var(--bg-card);
      padding: 1.25rem;
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 1rem;
      box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
    }
    
    .stat-icon {
      font-size: 2rem;
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 12px;
      background: rgba(255,255,255,0.05);
    }

    .stat-card.primary .stat-icon { color: #3b82f6; background: rgba(59, 130, 246, 0.1); }
    .stat-card.success .stat-icon { color: #10b981; background: rgba(16, 185, 129, 0.1); }
    .stat-card.info .stat-icon { color: #8b5cf6; background: rgba(139, 92, 246, 0.1); }
    .stat-card.danger .stat-icon { color: #ef4444; background: rgba(239, 68, 68, 0.1); }
    .stat-card.warning .stat-icon { color: #f59e0b; background: rgba(245, 158, 11, 0.1); }
    .stat-card.secondary .stat-icon { color: #64748b; background: rgba(100, 116, 139, 0.1); }
    .stat-card.accent .stat-icon { color: #eab308; background: rgba(234, 179, 8, 0.1); }
    
    .stat-title {
      color: var(--text-secondary);
      font-size: 0.85rem;
      margin-bottom: 0.25rem;
    }
    
    .stat-value {
      font-size: 1.4rem;
      font-weight: 800;
      color: var(--text-main);
    }

    .alert-box {
      background: rgba(239, 68, 68, 0.05);
      border: 1px solid rgba(239, 68, 68, 0.2);
      border-radius: var(--radius-lg);
      padding: 1.5rem;
      margin-bottom: 2rem;
    }

    .alert-header {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }

    .alert-header h3 {
      font-size: 1.1rem;
      color: #f87171;
      margin: 0;
    }

    .alert-items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }

    .alert-item {
      display: flex;
      align-items: center;
      gap: 1rem;
      font-size: 0.95rem;
      color: #cbd5e1;
      padding: 0.5rem;
      background: rgba(0,0,0,0.2);
      border-radius: 8px;
    }

    .p-name { font-weight: bold; flex: 1; color: white; }
    .p-stock strong { color: #ef4444; }
    .p-min { color: var(--text-muted); font-size: 0.8rem; }
    
    .charts-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
      gap: 1.5rem;
      margin-bottom: 1.5rem;
    }

    .chart-container {
      padding: 1.5rem;
      transition: transform 0.3s ease;
    }
    
    .chart-container:hover {
      transform: translateY(-5px);
    }

    .recent-sales {
      margin-top: 1.5rem;
    }

    .recent-sales h3 {
      margin-bottom: 1rem;
      font-size: 1.1rem;
      color: var(--text-muted);
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
      background: var(--bg-input);
    }

    .badge.cash {
      color: var(--primary-color);
      background: rgba(16, 185, 129, 0.1);
    }

    .text-center {
      text-align: center;
      color: var(--text-muted);
      padding: 1rem;
    }

    /* Phase 11 Styles */
    .health-gauge {
      width: 100px;
      height: 100px;
      border-radius: 50%;
      background: conic-gradient(var(--primary-color) calc(var(--score) * 1%), var(--bg-input) 0);
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      position: relative;
    }
    .health-gauge::after {
      content: '';
      position: absolute;
      width: 85px;
      height: 85px;
      background: var(--bg-card);
      border-radius: 50%;
      z-index: 1;
    }
    .gauge-value { font-size: 1.5rem; font-weight: 800; color: var(--text-main); z-index: 2; }
    .gauge-label { font-size: 0.7rem; color: var(--text-muted); z-index: 2; }

    .heat-map-container { padding: 1.5rem; }
    .heat-map-grid { display: flex; flex-direction: column; gap: 4px; margin-top: 1rem; }
    .day-row { display: flex; align-items: center; gap: 10px; }
    .day-label { width: 60px; font-size: 0.8rem; color: var(--text-muted); }
    .hour-cells { display: flex; flex: 1; gap: 4px; }
    .hour-cell { 
       flex: 1; 
       height: 20px; 
       background: var(--success-color); 
       border-radius: 2px;
       min-width: 10px;
    }

    /* Tabs & Performance Styling */
    .dashboard-tabs { display: flex; gap: 1rem; margin-bottom: 1.5rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    .tab-btn { background: none; border: none; padding: 0.75rem 1.5rem; color: var(--text-muted); cursor: pointer; border-radius: var(--radius-md); font-weight: bold; transition: all 0.2s; }
    .tab-btn.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary-color); }
    .performance-card { padding: 2rem; }
    .perf-header { margin-bottom: 2rem; border-bottom: 1px solid var(--border-color); padding-bottom: 1rem; }
    .table-fancy { width: 100%; border-collapse: separate; border-spacing: 0 10px; }
    .table-fancy th { text-align: right; padding: 1rem; color: var(--text-muted); font-size: 0.85rem; }
    .table-fancy tr { background: rgba(255,255,255,0.02); }
    .table-fancy td { padding: 1.25rem 1rem; border-top: 1px solid var(--border-color); border-bottom: 1px solid var(--border-color); }
    .table-fancy td:first-child { border-left: 1px solid var(--border-color); border-top-right-radius: 12px; border-bottom-right-radius: 12px; }
    .table-fancy td:last-child { border-right: 1px solid var(--border-color); border-top-left-radius: 12px; border-bottom-left-radius: 12px; }
    .rank-badge { width: 30px; height: 30px; display: inline-flex; align-items: center; justify-content: center; background: var(--bg-input); border-radius: 50%; font-weight: bold; }
    .rank-badge.top { background: var(--primary-color); color: white; box-shadow: 0 0 10px rgba(var(--primary-rgb), 0.5); }
    .text-danger { color: #ef4444; font-weight: bold; }
    .text-success { color: #10b981; font-weight: bold; }
    .mt-4 { margin-top: 1.5rem; }
    .badge-info { background: rgba(59, 130, 246, 0.1); color: #3b82f6; }
    .stars { color: #f1c40f; letter-spacing: 2px; }
  `]
})
export class DashboardComponent implements OnInit {
  stats: DashboardStats | null = null;
  dailySalesData: { label: string, value: number }[] = [];
  topProductsData: { label: string, value: number }[] = [];
  categoryProfitData: { label: string, value: number }[] = [];
  hours = Array.from({ length: 24 }, (_, i) => i);
  activeTab: 'overview' | 'performance' = 'overview';

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getDashboardStats().subscribe(data => {
      this.stats = data;
      this.dailySalesData = data.dailySales.map(d => ({ label: d.date, value: d.totalSales }));
      this.topProductsData = data.topProducts.map(p => ({ label: p.productName, value: p.totalRevenue }));
      this.categoryProfitData = data.categoryAnalytics.map(c => ({ label: c.category, value: Number(c.totalProfit) }));
    });
  }

  getDayName(day: number): string {
    const days = ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'];
    return days[day - 1];
  }

  getHeatPoint(day: number, hour: number) {
    return this.stats?.heatMap?.find(p => p.dayOfWeek === day && p.hour === hour);
  }

  getHeatOpacity(day: number, hour: number): number {
    const point = this.getHeatPoint(day, hour);
    if (!point) return 0.05;
    const max = Math.max(...(this.stats?.heatMap?.map(p => Number(p.count)) || [1]));
    return Math.max(0.1, (Number(point.count) / max));
  }

  getHeatCount(day: number, hour: number): number {
    return Number(this.getHeatPoint(day, hour)?.count || 0);
  }
}
