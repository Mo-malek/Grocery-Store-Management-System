import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { SaleView } from '../../core/models/models';
import { SaleDetailModalComponent } from '../../shared/components/sale-detail-modal/sale-detail-modal.component';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { BarChartComponent } from '../../shared/components/chart/bar-chart.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-history',
  standalone: true,
  imports: [CommonModule, SaleDetailModalComponent, SpinnerComponent, FormsModule, BarChartComponent],
  template: `
    <div class="history-container">
      <div class="filters card">
        <div class="filter-group">
          <label>من تاريخ:</label>
          <input type="date" [(ngModel)]="dateFrom" class="form-control">
        </div>
        <div class="filter-group">
          <label>إلى تاريخ:</label>
          <input type="date" [(ngModel)]="dateTo" class="form-control">
        </div>
        <button class="btn btn-primary search-btn" (click)="search()">🔍 بحث</button>
      </div>

      <div class="stats-cards">
        <div class="stat-card">
          <span class="icon">💰</span>
          <div class="info">
            <span class="label">إجمالي الفترة</span>
            <span class="value">{{ todayTotal | number:'1.2-2' }} ج.م</span>
          </div>
        </div>
        <div class="stat-card">
          <span class="icon">🧾</span>
          <div class="info">
            <span class="label">عدد العمليات</span>
            <span class="value">{{ totalElements }}</span>
          </div>
        </div>
      </div>

      <div class="charts-row" *ngIf="paymentMethodData.length">
        <div class="card chart-card">
          <app-bar-chart [title]="'توزيع طرق الدفع في الفترة'" [data]="paymentMethodData"></app-bar-chart>
        </div>
      </div>

      <div class="table-card">
        <app-spinner *ngIf="isLoading"></app-spinner>
        <div class="table-responsive">
        <table class="table" *ngIf="!isLoading">
          <thead>
            <tr>
              <th>رقم الفاتورة</th>
              <th>الوقت</th>
              <th>المستلم</th>
              <th>الهاتف</th>
              <th>المباع</th>
              <th>النوع</th>
              <th>طريقة الدفع</th>
              <th>الإجمالي</th>
              <th>الأجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let sale of sales">
              <td>#{{ sale.id }}</td>
              <td>{{ sale.createdAt | date:'shortTime' }}</td>
              <td class="recipient-cell">{{ getRecipientName(sale) }}</td>
              <td class="recipient-phone">{{ getRecipientPhone(sale) }}</td>
              <td class="items-cell">
                <div class="item-line" *ngFor="let item of (sale.items || [])">
                  {{ item.productName }} ×{{ item.quantity }} ({{ item.total | number:'1.2-2' }} ج.م)
                </div>
                <span *ngIf="!(sale.items || []).length">-</span>
              </td>
              <td>
                <span class="badge" [class.badge-online]="sale.saleChannel === 'ONLINE'" [class.badge-pos]="sale.saleChannel !== 'ONLINE'">
                  {{ getSaleChannelLabel(sale) }}
                </span>
              </td>
              <td>
                <span class="badge" [class.badge-primary]="sale.paymentMethod === 'CASH'">
                  {{ getPaymentLabel(sale.paymentMethod) }}
                </span>
              </td>
              <td class="total">{{ sale.total | number:'1.2-2' }} ج.م</td>
              <td>
                <button class="btn btn-sm btn-outline" (click)="viewSale(sale)">🔍 التفاصيل</button>
              </td>
            </tr>
            <tr *ngIf="sales.length === 0">
              <td colspan="9" class="empty-msg">لا توجد مبيعات في هذه الفترة</td>
            </tr>
          </tbody>
        </table>
        </div>

        <!-- Pagination Controls -->
        <div class="pagination" *ngIf="totalPages > 1">
          <button class="btn btn-sm btn-outline" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">السابق</button>
          <span class="page-info">صفحة {{ currentPage + 1 }} من {{ totalPages }}</span>
          <button class="btn btn-sm btn-outline" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">التالي</button>
        </div>
      </div>
    </div>

    <app-sale-detail-modal 
      [sale]="selectedSale" 
      (onClosed)="selectedSale = null">
    </app-sale-detail-modal>
  `,
  styles: [`
    .history-container {
      display: flex;
      flex-direction: column;
      gap: 1.5rem;
    }

    .filters {
      display: flex;
      gap: 1rem;
      align-items: flex-end;
      padding: 1rem;
      flex-wrap: wrap;
    }
    .filter-group {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .filter-group label {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    .search-btn {
      height: 42px;
    }

    .stats-cards {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
    }

    .stat-card {
      background: var(--bg-card);
      padding: 1rem;
      border-radius: var(--radius-md);
      border: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .stat-card .icon {
      font-size: 2rem;
      background: var(--info-soft);
      width: 50px;
      height: 50px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 50%;
    }

    .info .label {
      display: block;
      font-size: 0.8rem;
      color: var(--text-muted);
    }

    .info .value {
      font-size: 1.1rem;
      font-weight: bold;
      color: var(--primary-color);
    }

    .table-card {
      background: var(--bg-card);
      border-radius: var(--radius-lg);
      border: 1px solid var(--border-color);
      overflow: hidden;
      min-height: 200px;
      position: relative;
      box-shadow: var(--shadow-sm);
    }

    .table {
      width: 100%;
      border-collapse: collapse;
      text-align: right;
    }

    .table th, .table td {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
    }

    .table th {
      background: var(--surface-soft);
      color: var(--text-secondary);
      font-weight: 700;
      font-size: 0.9rem;
    }

    .total {
      font-weight: bold;
      color: var(--primary-color);
    }

    .recipient-cell {
      font-weight: 600;
    }

    .recipient-phone {
      color: var(--text-muted);
      font-size: 0.85rem;
      direction: ltr;
      text-align: right;
    }

    .items-cell {
      max-width: 280px;
      font-size: 0.85rem;
      color: var(--text-main);
    }

    .item-line {
      white-space: normal;
      line-height: 1.35;
      margin-bottom: 0.2rem;
    }

    .badge {
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-size: 0.8rem;
    }

    .badge-primary {
      background: var(--info-soft);
      color: var(--primary-color);
    }

    .badge-online {
      background: var(--secondary-color);
      color: var(--secondary-text);
    }

    .badge-pos {
      background: var(--surface-soft);
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    .btn-outline {
      background: transparent;
      border: 1px solid var(--border-color);
      color: var(--text-main);
    }

    .btn-outline:hover {
      background: var(--bg-input);
      border-color: var(--primary-color);
    }

    .empty-msg {
      text-align: center;
      padding: 3rem !important;
      color: var(--text-muted);
    }

    .charts-row {
      margin-bottom: 1.5rem;
    }

    .chart-card {
      padding: 1.25rem;
    }

    .pagination {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      border-top: 1px solid var(--border-color);
    }
    .page-info {
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    @media (max-width: 768px) {
      .filters {
        flex-direction: column;
        align-items: stretch;
      }

      .search-btn {
        width: 100%;
      }
    }
  `]
})
export class HistoryComponent implements OnInit {
  sales: SaleView[] = [];
  isLoading: boolean = false;
  todayTotal: number = 0;
  selectedSale: SaleView | null = null;

  // Filter & Pagination
  dateFrom: string = new Date().toISOString().split('T')[0];
  dateTo: string = new Date().toISOString().split('T')[0];
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 20;
  totalElements: number = 0;

  paymentMethodData: { label: string; value: number }[] = [];

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.loadSales();
  }

  search() {
    if (this.dateFrom > this.dateTo) {
      this.toast.warning('تاريخ البداية يجب أن يكون قبل تاريخ النهاية');
      return;
    }
    this.currentPage = 0;
    this.loadSales();
  }

  loadSales() {
    this.isLoading = true;
    this.api.getSales(this.dateFrom, this.dateTo, this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.sales = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.calculateTotal();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل سجل المبيعات');
        this.isLoading = false;
      }
    });
  }

  calculateTotal() {
    this.todayTotal = this.sales.reduce((sum, s) => sum + s.total, 0);

    let cashTotal = 0;
    let cardTotal = 0;
    this.sales.forEach(s => {
      if (s.paymentMethod === 'CASH') {
        cashTotal += s.total;
      } else if (s.paymentMethod === 'CARD') {
        cardTotal += s.total;
      }
    });

    this.paymentMethodData = [
      { label: 'نقدي', value: cashTotal },
      { label: 'فيزا', value: cardTotal }
    ].filter(d => d.value > 0);
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadSales();
    }
  }

  viewSale(sale: SaleView) {
    this.selectedSale = sale;
  }

  getSaleChannelLabel(sale: SaleView): string {
    return sale.saleChannel === 'ONLINE' ? 'أونلاين' : 'داخل المحل';
  }

  getCustomerName(sale: SaleView): string {
    return sale.customer?.name || sale.externalCustomerName || 'عميل نقدي';
  }

  getRecipientName(sale: SaleView): string {
    return sale.customer?.name || sale.externalCustomerName || 'عميل نقدي';
  }

  getRecipientPhone(sale: SaleView): string {
    return sale.customer?.phone || sale.externalCustomerPhone || '-';
  }

  getPaymentLabel(paymentMethod: SaleView['paymentMethod']): string {
    switch (paymentMethod) {
      case 'CASH':
        return 'نقدي';
      case 'CARD':
        return 'فيزا';
      default:
        return paymentMethod;
    }
  }
}
