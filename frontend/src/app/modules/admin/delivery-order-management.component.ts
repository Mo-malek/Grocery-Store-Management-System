import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { DeliveryOrder, DeliveryStatus } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-delivery-order-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="orders-admin-page fade-in">
      <header class="page-header">
        <div class="header-content">
          <h1>Delivery Orders</h1>
          <p>Track and update customer order status from one place.</p>
        </div>

        <div class="filters glass-box">
          <label>Filter by status:</label>
          <div class="filter-pills">
            <button *ngFor="let status of statuses"
                    [class.active]="activeFilter === status"
                    (click)="setFilter(status)">
              {{ getStatusLabel(status) }}
            </button>
          </div>
        </div>
      </header>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading delivery orders...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <div class="orders-grid" *ngIf="!isLoading && !loadError && filteredOrders.length > 0; else empty">
        <div class="order-card glass-card slide-up"
             *ngFor="let order of filteredOrders; let i = index"
             [style.animation-delay]="i * 0.08 + 's'">

          <div class="order-head">
            <div class="order-id">
              <span class="label">Order</span>
              <span class="val">#{{ order.id }}</span>
            </div>
            <div class="order-status" [attr.data-status]="order.status">
              {{ getStatusLabel(order.status) }}
            </div>
          </div>

          <div class="customer-info">
            <div class="info-row">
              <span class="icon">👤</span>
              <div class="text">
                <div class="name">{{ order.customer?.fullName || order.customer?.username || 'Customer' }}</div>
                <div class="phone">{{ order.phone }}</div>
              </div>
            </div>
            <div class="info-row">
              <span class="icon">📍</span>
              <div class="text address">{{ order.address }}</div>
            </div>
          </div>

          <div class="order-details">
            <div class="items-summary" (click)="toggleItems(order.id)">
              <span>{{ order.items.length }} item(s)</span>
              <span class="toggle-icon">{{ expandedOrders.has(order.id) ? '▲' : '▼' }}</span>
            </div>

            <div class="items-list" *ngIf="expandedOrders.has(order.id)">
              <div class="item" *ngFor="let item of order.items">
                <span class="name">{{ item.productName || 'Product' }}</span>
                <span class="qty">x {{ item.quantity }}</span>
                <span class="price">{{ item.unitPrice * item.quantity | number:'1.2-2' }} EGP</span>
              </div>
            </div>

            <div class="totals">
              <div class="total-row">
                <span>Total:</span>
                <span class="grand-total">{{ order.totalAmount | number:'1.2-2' }} EGP</span>
              </div>
            </div>
          </div>

          <div class="order-actions">
            <div class="status-manager">
              <label>Change status:</label>
              <select [ngModel]="order.status" (ngModelChange)="updateStatus(order, $event)">
                <option *ngFor="let status of statuses.slice(1)" [value]="status">
                  {{ getStatusLabel(status) }}
                </option>
              </select>
            </div>
          </div>
        </div>
      </div>

      <ng-template #empty>
        <div class="empty-state glass-box zoom-in" *ngIf="!isLoading && !loadError">
          <div class="icon">📦</div>
          <h2>No orders found</h2>
          <p>No delivery orders match the selected filter.</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .orders-admin-page { padding: 1rem; max-width: 1400px; margin: 0 auto; }

    .page-header { margin-bottom: 1.5rem; }
    .header-content h1 { font-size: 2rem; font-weight: 900; margin-bottom: 0.4rem; }
    .header-content p { color: var(--text-muted); margin: 0; }

    .filters {
      margin-top: 1rem;
      padding: 1rem;
      display: flex;
      align-items: center;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .filter-pills { display: flex; gap: 0.6rem; flex-wrap: wrap; }
    .filter-pills button {
      background: var(--surface-soft);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      min-height: 36px;
      padding: 0.4rem 0.85rem;
      border-radius: 999px;
      cursor: pointer;
      font-weight: 600;
    }
    .filter-pills button.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
      color: #fff;
    }

    .orders-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(340px, 1fr));
      gap: 1rem;
    }

    .order-card {
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
      border: 1px solid var(--glass-border);
    }

    .order-head { display: flex; justify-content: space-between; align-items: center; }
    .order-id { display: flex; flex-direction: column; }
    .order-id .label { font-size: 0.74rem; color: var(--text-muted); }
    .order-id .val { font-size: 1rem; font-weight: 800; }

    .order-status {
      padding: 0.3rem 0.65rem;
      border-radius: 999px;
      font-size: 0.78rem;
      font-weight: 700;
      background: var(--surface-soft);
      color: var(--text-muted);
    }
    .order-status[data-status="PENDING"] { background: var(--warning-soft); color: var(--warning-color); }
    .order-status[data-status="PREPARING"] { background: var(--info-soft); color: var(--primary-color); }
    .order-status[data-status="OUT_FOR_DELIVERY"] { background: rgba(124, 58, 237, 0.14); color: #7c3aed; }
    .order-status[data-status="DELIVERED"] { background: var(--success-soft); color: var(--success-color); }
    .order-status[data-status="CANCELLED"] { background: var(--danger-soft); color: var(--danger-color); }

    .customer-info {
      background: var(--surface-soft);
      border-radius: 10px;
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.55rem;
    }
    .info-row { display: flex; gap: 0.55rem; align-items: flex-start; }
    .info-row .text .name { font-weight: 700; }
    .info-row .text .phone { font-size: 0.78rem; color: var(--text-muted); }
    .info-row .text.address { font-size: 0.84rem; color: var(--text-secondary); }

    .items-summary {
      display: flex;
      justify-content: space-between;
      cursor: pointer;
      color: var(--primary-color);
      font-size: 0.85rem;
      font-weight: 700;
    }

    .items-list {
      background: var(--surface-soft);
      border-radius: 8px;
      padding: 0.45rem;
      max-height: 180px;
      overflow-y: auto;
    }
    .items-list .item {
      display: grid;
      grid-template-columns: 2fr 1fr 1fr;
      gap: 0.4rem;
      font-size: 0.8rem;
      padding: 0.45rem;
      border-bottom: 1px solid var(--glass-border);
    }
    .items-list .item:last-child { border-bottom: none; }

    .totals { border-top: 1px solid var(--glass-border); padding-top: 0.65rem; }
    .total-row { display: flex; justify-content: space-between; align-items: center; }
    .grand-total { font-size: 1.1rem; font-weight: 900; color: var(--text-main); }

    .status-manager { display: flex; flex-direction: column; gap: 0.4rem; }
    .status-manager label { font-size: 0.74rem; color: var(--text-muted); }
    .status-manager select {
      background: var(--surface-soft);
      border: 1px solid var(--glass-border);
      color: var(--text-main);
      min-height: 40px;
      border-radius: 10px;
      padding: 0.45rem 0.6rem;
      outline: none;
      cursor: pointer;
    }
    .status-manager select:focus { border-color: var(--primary-color); }

    .loading-state {
      min-height: 240px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.7rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 34px;
      height: 34px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    .error-state {
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      font-weight: 600;
      margin-bottom: 1rem;
    }
    .empty-state { text-align: center; padding: 3.4rem 1rem; }
    .empty-state .icon { font-size: 3.2rem; margin-bottom: 0.6rem; }

    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 768px) {
      .orders-grid { grid-template-columns: 1fr; }
      .filters { flex-direction: column; align-items: stretch; }
    }
  `]
})
export class DeliveryOrderManagementComponent implements OnInit {
  orders: DeliveryOrder[] = [];
  filteredOrders: DeliveryOrder[] = [];
  expandedOrders: Set<number> = new Set();
  isLoading = false;
  loadError = '';

  statuses = ['ALL', ...Object.values(DeliveryStatus)];
  activeFilter = 'ALL';

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadOrders();
  }

  loadOrders(): void {
    this.isLoading = true;
    this.loadError = '';
    this.api.getAllDeliveryOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.applyFilter();
        this.isLoading = false;
      },
      error: () => {
        this.toast.show('Failed to load delivery orders', 'error');
        this.loadError = 'Failed to load delivery orders.';
        this.isLoading = false;
      }
    });
  }

  setFilter(status: string): void {
    this.activeFilter = status;
    this.applyFilter();
  }

  applyFilter(): void {
    if (this.activeFilter === 'ALL') {
      this.filteredOrders = [...this.orders];
      return;
    }
    this.filteredOrders = this.orders.filter(order => order.status === this.activeFilter);
  }

  toggleItems(orderId: number): void {
    if (this.expandedOrders.has(orderId)) {
      this.expandedOrders.delete(orderId);
      return;
    }
    this.expandedOrders.add(orderId);
  }

  updateStatus(order: DeliveryOrder, newStatus: DeliveryStatus): void {
    if (!newStatus || order.status === newStatus) return;

    const previous = order.status;
    order.status = newStatus;
    this.applyFilter();

    this.api.updateDeliveryOrderStatus(order.id, newStatus).subscribe({
      next: (updated) => {
        order.status = updated.status;
        this.applyFilter();
        this.toast.show(`Order #${order.id} updated`, 'success');
      },
      error: () => {
        order.status = previous;
        this.applyFilter();
        this.toast.show('Failed to update order status', 'error');
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'ALL': return 'All';
      case DeliveryStatus.PENDING: return 'Pending';
      case DeliveryStatus.PREPARING: return 'Preparing';
      case DeliveryStatus.OUT_FOR_DELIVERY: return 'Out for delivery';
      case DeliveryStatus.DELIVERED: return 'Delivered';
      case DeliveryStatus.CANCELLED: return 'Cancelled';
      default: return status;
    }
  }
}
