import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { DeliveryOrder, DeliveryStatus } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-storefront-orders',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="orders-page container fade-in">
      <div class="orders-wrapper">
        <header class="orders-header slide-up">
          <h1>My Orders</h1>
          <p>Track current order status and your order history.</p>
          <button class="refresh-btn" (click)="loadOrders()" [disabled]="isLoading">
            {{ isLoading ? 'Updating...' : 'Refresh' }}
          </button>
        </header>

        <div class="loading-state" *ngIf="isLoading">
          <div class="spinner"></div>
          <p>Loading orders...</p>
        </div>

        <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

        <div class="orders-content" *ngIf="!isLoading && !loadError && orders.length > 0; else noOrders">
          <div class="orders-list staggered-group">
            <article class="order-card glass-card slide-up" *ngFor="let order of orders; let i = index" [style.animation-delay]="i * 0.1 + 's'">
              <div class="order-head">
                <div class="id-date">
                  <span class="order-id">Order #{{ order.id }}</span>
                  <span class="order-date">{{ order.createdAt | date:'mediumDate' }}</span>
                </div>
                <div class="status-pill" [attr.data-status]="order.status">
                  <span class="dot"></span>
                  {{ getStatusLabel(order.status) }}
                </div>
              </div>

              <div class="order-items-preview">
                <div class="preview-row" *ngFor="let item of order.items">
                  <span class="item-name">{{ item.productName || 'Product' }} <small>x {{ item.quantity }}</small></span>
                  <span class="item-total">{{ (item.unitPrice * item.quantity) | number:'1.2-2' }} EGP</span>
                </div>
              </div>

              <div class="order-foot">
                <div class="total-info">
                  <span class="label">Total paid</span>
                  <span class="val">{{ order.totalAmount | number:'1.2-2' }} EGP</span>
                </div>
                <button class="btn-text" (click)="loadOrders(true)">Refresh status</button>
              </div>
            </article>
          </div>
        </div>

        <ng-template #noOrders>
          <div class="empty-orders glass-box fade-in" *ngIf="!isLoading && !loadError">
            <div class="empty-icon">📦</div>
            <h2>No orders yet</h2>
            <p>Start shopping and your orders will appear here.</p>
            <a routerLink="/shop/catalog" class="btn-primary">Browse store</a>
          </div>
        </ng-template>
      </div>
    </div>
  `,
  styles: [`
    .orders-page { padding: 3rem 1rem; min-height: 70vh; }
    .orders-wrapper { max-width: 900px; margin: 0 auto; }

    .orders-header {
      margin-bottom: 1.8rem;
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      gap: 0.7rem;
    }
    .orders-header h1 { font-size: 2rem; font-weight: 900; margin: 0; }
    .orders-header p { color: var(--text-muted); margin: 0; }
    .refresh-btn {
      min-height: 38px;
      border-radius: 10px;
      border: 1px solid var(--primary-color);
      background: transparent;
      color: var(--primary-color);
      font-weight: 700;
      padding: 0.4rem 0.8rem;
      cursor: pointer;
    }

    .orders-list { display: flex; flex-direction: column; gap: 1.2rem; }
    .order-card { padding: 1.4rem; }

    .order-head { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem; padding-bottom: 0.8rem; border-bottom: 1px solid var(--glass-border); }
    .id-date { display: flex; flex-direction: column; gap: 0.2rem; }
    .order-id { font-weight: 800; font-size: 1rem; color: var(--text-main); }
    .order-date { font-size: 0.8rem; color: var(--text-muted); }

    .status-pill { display: flex; align-items: center; gap: 0.45rem; padding: 0.35rem 0.8rem; border-radius: 999px; font-size: 0.82rem; font-weight: 700; background: var(--surface-soft); }
    .status-pill .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--text-muted); }
    .status-pill[data-status="PENDING"] { color: var(--warning-color); }
    .status-pill[data-status="PENDING"] .dot { background: var(--warning-color); }
    .status-pill[data-status="PREPARING"] { color: var(--primary-color); }
    .status-pill[data-status="PREPARING"] .dot { background: var(--primary-color); }
    .status-pill[data-status="OUT_FOR_DELIVERY"] { color: #7c3aed; }
    .status-pill[data-status="OUT_FOR_DELIVERY"] .dot { background: #7c3aed; }
    .status-pill[data-status="DELIVERED"] { color: var(--success-color); }
    .status-pill[data-status="DELIVERED"] .dot { background: var(--success-color); }
    .status-pill[data-status="CANCELLED"] { color: var(--danger-color); }
    .status-pill[data-status="CANCELLED"] .dot { background: var(--danger-color); }

    .order-items-preview { display: flex; flex-direction: column; gap: 0.6rem; margin-bottom: 1rem; }
    .preview-row { display: flex; justify-content: space-between; font-size: 0.9rem; color: var(--text-secondary); gap: 0.6rem; }
    .preview-row small { color: var(--text-muted); margin-left: 0.3rem; }

    .order-foot { display: flex; justify-content: space-between; align-items: center; }
    .total-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .total-info .label { font-size: 0.78rem; color: var(--text-muted); }
    .total-info .val { font-size: 1.1rem; font-weight: 900; color: var(--secondary-color); }
    .btn-text { background: transparent; border: none; color: var(--text-main); text-decoration: underline; cursor: pointer; font-weight: 600; font-size: 0.84rem; }

    .loading-state {
      min-height: 220px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.55rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 30px;
      height: 30px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state {
      color: var(--danger-color);
      background: var(--danger-soft);
      border: 1px solid rgba(220, 38, 38, 0.3);
      border-radius: 10px;
      padding: 0.7rem 0.9rem;
      font-weight: 600;
    }

    .empty-orders { text-align: center; padding: 4rem 1rem; }
    .empty-icon { font-size: 3.8rem; margin-bottom: 1rem; }
    .empty-orders h2 { font-size: 1.6rem; margin-bottom: 0.7rem; }
    .empty-orders p { color: var(--text-muted); margin-bottom: 1.3rem; }

    @media (max-width: 640px) {
      .order-head { flex-direction: column; align-items: flex-start; gap: 0.7rem; }
      .order-foot { flex-direction: column; align-items: flex-start; gap: 0.9rem; }
    }
  `]
})
export class StorefrontOrdersComponent implements OnInit, OnDestroy {
  orders: DeliveryOrder[] = [];
  isLoading = false;
  loadError = '';
  private refreshTimer?: ReturnType<typeof setInterval>;

  constructor(private api: ApiService, private auth: AuthService, private toast: ToastService) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) return;
    this.loadOrders();
    this.refreshTimer = setInterval(() => this.loadOrders(true), 20000);
  }

  ngOnDestroy(): void {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  loadOrders(silent: boolean = false) {
    if (!silent) {
      this.isLoading = true;
    }
    this.loadError = '';

    this.api.getMyOrders().subscribe({
      next: (data) => {
        this.orders = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.loadError = 'Failed to load orders. Please try again.';
        if (!silent) {
          this.toast.error('Failed to load orders');
        }
      }
    });
  }

  getStatusLabel(status: string): string {
    switch (status as DeliveryStatus) {
      case DeliveryStatus.PENDING: return 'Pending';
      case DeliveryStatus.PREPARING: return 'Preparing';
      case DeliveryStatus.OUT_FOR_DELIVERY: return 'Out for delivery';
      case DeliveryStatus.DELIVERED: return 'Delivered';
      case DeliveryStatus.CANCELLED: return 'Cancelled';
      default: return status;
    }
  }
}
