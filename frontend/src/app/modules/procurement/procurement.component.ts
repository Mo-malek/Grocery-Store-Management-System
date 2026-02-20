import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { PriceOptimizationSuggestion, ReorderSuggestion } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-procurement',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="container">
      <div class="header">
        <h1>Procurement Intelligence</h1>
        <p class="subtitle">Smart suggestions for restocking and pricing.</p>
      </div>

      <div class="tabs mb-4">
        <button class="tab-btn" [class.active]="activeTab === 'reorder'" (click)="activeTab = 'reorder'">Reorder Suggestions</button>
        <button class="tab-btn" [class.active]="activeTab === 'price'" (click)="activeTab = 'price'">Price Optimization</button>
      </div>

      <p class="error" *ngIf="loadError">{{ loadError }}</p>

      <div *ngIf="activeTab === 'reorder'">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
          <div class="card stat-card">
            <span class="stat-label">Critical items</span>
            <span class="stat-value text-danger">{{ criticalCount }}</span>
          </div>
          <div class="card stat-card">
            <span class="stat-label">Warning items</span>
            <span class="stat-value text-warning">{{ warningCount }}</span>
          </div>
        </div>

        <div class="card" *ngIf="isLoadingReorder">Loading reorder suggestions...</div>

        <div class="card" *ngIf="!isLoadingReorder">
          <div class="table-responsive">
            <table>
              <thead>
                <tr>
                  <th>Product</th>
                  <th>Current Stock</th>
                  <th>Daily Velocity</th>
                  <th>Days Left</th>
                  <th>Suggested Qty</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <tr *ngFor="let s of suggestions">
                  <td>{{ s.productName }}</td>
                  <td>{{ s.currentStock }} {{ s.unit }}</td>
                  <td>{{ s.dailyVelocity }} / day</td>
                  <td>
                    <span [class.text-danger]="(s.daysUntilOut || 0) < 3" [class.text-warning]="(s.daysUntilOut || 0) < 7">
                      {{ s.daysUntilOut !== null ? s.daysUntilOut + ' days' : 'Stable' }}
                    </span>
                  </td>
                  <td class="suggested-qty">
                    {{ s.suggestedReorderQuantity > 0 ? '+ ' + s.suggestedReorderQuantity + ' ' + s.unit : '-' }}
                  </td>
                  <td>
                    <span class="badge" [ngClass]="getStatusClass(s)">{{ getStatusLabel(s) }}</span>
                  </td>
                </tr>
                <tr *ngIf="!suggestions.length">
                  <td colspan="6" class="text-center p-8 text-muted">No reorder suggestions at this time.</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div *ngIf="activeTab === 'price'">
        <div class="card" *ngIf="isLoadingPrice">Loading price suggestions...</div>

        <div class="grid grid-cols-1 gap-4 mb-4" *ngIf="!isLoadingPrice">
          <div class="card p-4 flex items-center justify-between" *ngFor="let p of priceSuggestions">
            <div class="flex-1">
              <div class="flex items-center gap-2 mb-1">
                <span class="badge" [class.badge-danger]="p.reason === 'EXPIRING_SOON'" [class.badge-warning]="p.reason === 'SLOW_MOVING'">
                  {{ p.reason === 'EXPIRING_SOON' ? 'Expiring Soon' : 'Slow Moving' }}
                </span>
                <h3 class="font-bold">{{ p.productName }}</h3>
              </div>
              <p class="text-sm text-muted">{{ p.message }}</p>
              <div class="mt-2 text-xs flex gap-4">
                <span>Stock: <strong>{{ p.currentStock }}</strong></span>
                <span>Current: <strong>{{ p.currentPrice }} EGP</strong></span>
              </div>
            </div>
            <div class="text-left">
              <div class="text-xs text-muted mb-1">Suggested Price</div>
              <div class="text-xl font-bold text-success">{{ p.suggestedPrice }} EGP</div>
              <button class="btn btn-sm btn-outline mt-2" (click)="applyPrice(p)">Apply Price</button>
            </div>
          </div>
          <div class="empty-state card" *ngIf="!priceSuggestions.length">
            No pricing suggestions currently.
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .header { margin-bottom: 2rem; }
    .subtitle { color: var(--text-muted); font-size: 0.9rem; }
    .error {
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .stat-card { display: flex; flex-direction: column; gap: 0.5rem; padding: 1.5rem; }
    .stat-label { font-size: 0.85rem; color: var(--text-muted); }
    .stat-value { font-size: 2rem; font-weight: bold; }

    .suggested-qty { font-weight: bold; color: var(--success-color); }

    .badge { padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.8rem; }
    .badge-danger { background: var(--danger-soft); color: var(--danger-color); }
    .badge-warning { background: var(--warning-soft); color: var(--warning-color); }
    .badge-success { background: var(--success-soft); color: var(--success-color); }

    .text-danger { color: var(--danger-color) !important; }
    .text-warning { color: var(--warning-color) !important; }
    .text-success { color: var(--success-color); }

    .tabs { display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); }
    .tab-btn { background: none; border: none; padding: 1rem; cursor: pointer; color: var(--text-muted); border-bottom: 2px solid transparent; transition: all 0.3s; }
    .tab-btn.active { color: var(--primary-color); border-bottom-color: var(--primary-color); font-weight: bold; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .btn-outline { background: none; border: 1px solid var(--primary-color); color: var(--primary-color); }
    .btn-outline:hover { background: rgba(var(--primary-rgb), 0.12); color: var(--primary-color); }

    .flex { display: flex; }
    .items-center { align-items: center; }
    .justify-between { justify-content: space-between; }
    .flex-1 { flex: 1; }
    .gap-2 { gap: 0.5rem; }
    .gap-4 { gap: 1rem; }
    .mb-1 { margin-bottom: 0.25rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-2 { margin-top: 0.5rem; }
    .text-sm { font-size: 0.875rem; }
    .text-xs { font-size: 0.75rem; }
    .font-bold { font-weight: bold; }
    .text-left { text-align: left; }
  `]
})
export class ProcurementComponent implements OnInit {
  suggestions: ReorderSuggestion[] = [];
  priceSuggestions: PriceOptimizationSuggestion[] = [];
  criticalCount = 0;
  warningCount = 0;
  activeTab: 'reorder' | 'price' = 'reorder';
  isLoadingReorder = false;
  isLoadingPrice = false;
  loadError = '';

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.isLoadingReorder = true;
    this.isLoadingPrice = true;
    this.loadError = '';

    this.api.getReorderSuggestions().subscribe({
      next: data => {
        this.suggestions = data || [];
        this.calculateStats();
        this.isLoadingReorder = false;
      },
      error: () => {
        this.suggestions = [];
        this.calculateStats();
        this.isLoadingReorder = false;
        this.loadError = 'Failed to load reorder suggestions.';
        this.toast.error('Failed to load reorder suggestions');
      }
    });

    this.api.getPriceOptimizationSuggestions().subscribe({
      next: data => {
        this.priceSuggestions = data || [];
        this.isLoadingPrice = false;
      },
      error: () => {
        this.priceSuggestions = [];
        this.isLoadingPrice = false;
        this.loadError = this.loadError || 'Failed to load pricing suggestions.';
        this.toast.error('Failed to load pricing suggestions');
      }
    });
  }

  calculateStats() {
    this.criticalCount = this.suggestions.filter(s => (s.daysUntilOut || 0) < 3).length;
    this.warningCount = this.suggestions.filter(s => (s.daysUntilOut || 0) >= 3 && (s.daysUntilOut || 0) < 7).length;
  }

  getStatusClass(s: ReorderSuggestion) {
    if ((s.daysUntilOut || 0) < 3) return 'badge-danger';
    if ((s.daysUntilOut || 0) < 7) return 'badge-warning';
    return 'badge-success';
  }

  getStatusLabel(s: ReorderSuggestion) {
    if ((s.daysUntilOut || 0) < 1) return 'Out';
    if ((s.daysUntilOut || 0) < 3) return 'Critical';
    if ((s.daysUntilOut || 0) < 7) return 'Warning';
    return 'Stable';
  }

  applyPrice(suggestion: PriceOptimizationSuggestion) {
    this.api.getProduct(suggestion.productId).subscribe({
      next: product => {
        product.sellingPrice = suggestion.suggestedPrice;
        this.api.updateProduct(product.id!, product).subscribe({
          next: () => {
            this.priceSuggestions = this.priceSuggestions.filter(p => p.productId !== suggestion.productId);
            this.toast.success('Price updated successfully');
          },
          error: () => {
            this.toast.error('Failed to update price');
          }
        });
      },
      error: () => {
        this.toast.error('Failed to load product for price update');
      }
    });
  }
}
