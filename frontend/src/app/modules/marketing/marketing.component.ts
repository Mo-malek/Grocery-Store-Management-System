import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, Bundle } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { BarChartComponent } from '../../shared/components/chart/bar-chart.component';

@Component({
  selector: 'app-marketing',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, BarChartComponent],
  template: `
    <div class="container">
      <div class="header">
        <h1>Marketing & Promotions</h1>
        <div class="nav-tabs">
           <button class="btn btn-tab" [class.active]="activeTab === 'bundles'" (click)="activeTab = 'bundles'">Bundles</button>
           <button class="btn btn-tab" [class.active]="activeTab === 'crm'" (click)="activeTab = 'crm'">Customer CRM</button>
        </div>
      </div>

      <p class="error" *ngIf="loadError">{{ loadError }}</p>

      <div *ngIf="activeTab === 'bundles'">
        <div class="action-bar mb-4">
           <button class="btn btn-primary" (click)="openModal()">Create Bundle</button>
        </div>

        <div class="card" *ngIf="isLoadingBundles">Loading bundles...</div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!isLoadingBundles">
          <div class="card bundle-card" *ngFor="let b of bundles">
            <div class="bundle-header">
              <h3>{{ b.name }}</h3>
              <span class="badge" [class.badge-active]="b.active">Active</span>
            </div>
            <div class="bundle-items">
              <div class="item" *ngFor="let item of b.items">
                {{ item.product.name }} x {{ item.quantity }}
              </div>
            </div>
            <div class="bundle-footer">
              <div class="price">Price: <strong>{{ b.price }} EGP</strong></div>
              <button class="btn btn-sm btn-danger" (click)="deleteBundle(b.id!)">Delete</button>
            </div>
          </div>
        </div>
        <div *ngIf="!isLoadingBundles && !bundles.length" class="empty-state card">
          No bundles yet. Create your first promotion bundle.
        </div>
      </div>

      <div *ngIf="activeTab === 'crm'">
        <div class="card" *ngIf="isLoadingCustomers">Loading customer segments...</div>

        <ng-container *ngIf="!isLoadingCustomers">
          <div class="card chart-card" *ngIf="stagnantChartData.length">
            <app-bar-chart [title]="'Stagnant Customers by Category'" [data]="stagnantChartData"></app-bar-chart>
          </div>

          <div class="card crm-alert-card" *ngIf="stagnantCustomers.length">
             <h3>Customers inactive for 30+ days</h3>
             <p>Reach out with retention offers to bring them back.</p>

             <div class="crm-list mt-4">
                <div class="crm-item" *ngFor="let c of stagnantCustomers">
                   <div class="c-info">
                      <strong>{{ c.name }}</strong>
                      <span>Last visit: {{ c.lastVisitAt | date:'shortDate' }}</span>
                   </div>
                   <div class="c-stats">
                      <span>Points: {{ c.loyaltyPoints }}</span>
                      <span>Avg basket: {{ c.avgTicketSize }} EGP</span>
                   </div>
                   <div class="c-actions">
                      <button class="btn btn-sm btn-whatsapp" (click)="sendWhatsApp(c)">Send WhatsApp Offer</button>
                   </div>
                </div>
             </div>
          </div>

          <div *ngIf="!stagnantCustomers.length" class="empty-state card">
             No inactive customers currently.
          </div>
        </ng-container>
      </div>
    </div>

    <app-modal *ngIf="isModalOpen" title="Create Promotion Bundle" (onClose)="closeModal()">
      <form (ngSubmit)="saveBundle()">
        <div class="form-group mb-4">
          <label>Bundle Name</label>
          <input [(ngModel)]="newBundle.name" name="name" class="form-control" placeholder="Breakfast Combo" required>
        </div>

        <div class="form-group mb-4">
          <label>Bundle Price</label>
          <input type="number" [(ngModel)]="newBundle.price" name="price" min="0" step="0.01" class="form-control" required>
        </div>

        <div class="form-group mb-4">
          <label>Add products to bundle</label>
          <div class="flex gap-2">
            <select #prodSelect class="form-control">
              <option value="">-- Select product --</option>
              <option *ngFor="let p of allProducts" [value]="p.id">{{ p.name }} ({{ p.sellingPrice }} EGP)</option>
            </select>
            <input #qtyInput type="number" value="1" min="1" class="form-control" style="width: 80px;">
            <button type="button" class="btn btn-primary" (click)="addItem(prodSelect.value, qtyInput.value)">Add</button>
          </div>
        </div>

        <div class="items-list mb-4">
          <div class="item-row" *ngFor="let item of selectedItems; let i = index">
            <span>{{ item.productName }} x {{ item.quantity }}</span>
            <button type="button" class="remove-btn" (click)="removeItem(i)">&times;</button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" (click)="closeModal()" [disabled]="isSavingBundle">Cancel</button>
          <button type="submit" class="btn btn-primary" [disabled]="isSavingBundle">{{ isSavingBundle ? 'Saving...' : 'Save Bundle' }}</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; gap: 1rem; margin-bottom: 2rem; flex-wrap: wrap; }
    .error {
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      margin-bottom: 1rem;
      font-weight: 600;
    }
    .bundle-card { display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s; }
    .bundle-card:hover { transform: translateY(-5px); }
    .bundle-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .bundle-items { font-size: 0.9rem; color: var(--text-muted); min-height: 3rem; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; background: var(--bg-input); }
    .badge-active { background: var(--info-soft); color: var(--primary-color); border: 1px solid rgba(var(--primary-rgb), 0.24); }
    .bundle-footer { display: flex; justify-content: space-between; align-items: center; border-top: 1px solid var(--border-color); padding-top: 1rem; }

    .item-row { display: flex; justify-content: space-between; background: var(--bg-input); padding: 0.5rem; border-radius: 4px; margin-bottom: 0.5rem; }
    .remove-btn { background: none; border: none; color: var(--danger-color); cursor: pointer; font-weight: bold; }

    .form-group label { display: block; margin-bottom: 0.5rem; color: var(--text-muted); font-size: 0.9rem; }
    .item-row { font-size: 0.9rem; }
    .flex { display: flex; }
    .gap-2 { gap: 0.5rem; }
    .mb-4 { margin-bottom: 1rem; }
    .mt-4 { margin-top: 1rem; }
    .nav-tabs { display: flex; gap: 1rem; border-bottom: 1px solid var(--border-color); padding-bottom: 0.5rem; }
    .btn-tab { background: none; border: none; color: var(--text-muted); cursor: pointer; padding: 0.5rem 1rem; border-radius: 8px; font-weight: bold; }
    .btn-tab.active { background: rgba(var(--primary-rgb), 0.1); color: var(--primary-color); }
    .crm-item { display: flex; justify-content: space-between; align-items: center; background: var(--surface-soft); padding: 1rem; border-radius: 12px; margin-bottom: 0.75rem; }
    .c-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .c-info span { font-size: 0.8rem; color: var(--text-muted); }
    .c-stats { display: flex; gap: 1.5rem; font-size: 0.85rem; }
    .btn-whatsapp { background: var(--secondary-color); color: var(--secondary-text); border: 1px solid var(--secondary-color); font-weight: 700; padding: 0.5rem 0.75rem; border-radius: var(--radius-md); }
    .btn-whatsapp:hover { background: var(--secondary-hover); border-color: var(--secondary-hover); transform: translateY(-1px); }
    .chart-card { margin-bottom: 1.5rem; padding: 1.25rem; }
  `]
})
export class MarketingComponent implements OnInit {
  activeTab: 'bundles' | 'crm' = 'bundles';
  bundles: Bundle[] = [];
  allProducts: Product[] = [];
  stagnantCustomers: any[] = [];
  isModalOpen = false;

  newBundle: any = { name: '', price: 0, active: true };
  selectedItems: any[] = [];
  stagnantChartData: { label: string; value: number }[] = [];

  isLoadingBundles = false;
  isLoadingCustomers = false;
  isSavingBundle = false;
  loadError = '';

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.loadBundles();
    this.loadStagnantCustomers();
    this.api.getProducts('', 0, 1000).subscribe({
      next: page => this.allProducts = page.content || [],
      error: () => this.toast.error('Failed to load products for bundles')
    });
  }

  loadStagnantCustomers() {
    this.isLoadingCustomers = true;
    this.api.getStagnantCustomers().subscribe({
      next: data => {
        this.stagnantCustomers = data || [];
        const byCategory = new Map<string, number>();
        this.stagnantCustomers.forEach(c => {
          const key = c.favoriteCategory || 'Unspecified';
          byCategory.set(key, (byCategory.get(key) || 0) + 1);
        });
        this.stagnantChartData = Array.from(byCategory.entries()).map(([label, value]) => ({ label, value }));
        this.isLoadingCustomers = false;
      },
      error: () => {
        this.stagnantCustomers = [];
        this.stagnantChartData = [];
        this.isLoadingCustomers = false;
        this.loadError = this.loadError || 'Failed to load CRM customers.';
        this.toast.error('Failed to load stagnant customers');
      }
    });
  }

  sendWhatsApp(customer: any) {
    this.toast.info(`Preparing WhatsApp offer for ${customer.name}...`);
    setTimeout(() => {
      this.toast.success(`Offer sent to ${customer.phone}`);
    }, 900);
  }

  loadBundles() {
    this.isLoadingBundles = true;
    this.api.getBundles().subscribe({
      next: data => {
        this.bundles = data || [];
        this.isLoadingBundles = false;
      },
      error: () => {
        this.bundles = [];
        this.isLoadingBundles = false;
        this.loadError = this.loadError || 'Failed to load bundles.';
        this.toast.error('Failed to load bundles');
      }
    });
  }

  openModal() {
    this.isModalOpen = true;
    this.newBundle = { name: '', price: 0, active: true };
    this.selectedItems = [];
  }

  closeModal() {
    if (this.isSavingBundle) {
      return;
    }
    this.isModalOpen = false;
  }

  addItem(prodId: string, qty: string) {
    if (!prodId) {
      this.toast.warning('Select a product first');
      return;
    }

    const id = parseInt(prodId, 10);
    const product = this.allProducts.find(p => p.id === id);
    const quantity = Math.max(1, parseInt(qty, 10) || 1);

    if (product) {
      this.selectedItems.push({
        productId: id,
        productName: product.name,
        quantity,
        product
      });
      this.toast.success(`${product.name} added`);
    }
  }

  removeItem(index: number) {
    this.selectedItems.splice(index, 1);
  }

  saveBundle() {
    if (!this.newBundle.name?.trim()) {
      this.toast.warning('Please enter bundle name');
      return;
    }
    if (this.selectedItems.length < 1) {
      this.toast.warning('Add at least one product');
      return;
    }

    const bundle: Bundle = {
      name: this.newBundle.name.trim(),
      price: Number(this.newBundle.price || 0),
      active: true,
      items: this.selectedItems.map(si => ({
        product: si.product,
        quantity: si.quantity
      }))
    };

    this.isSavingBundle = true;
    this.api.createBundle(bundle).subscribe({
      next: () => {
        this.toast.success('Bundle created successfully');
        this.loadBundles();
        this.closeModal();
        this.isSavingBundle = false;
      },
      error: () => {
        this.toast.error('Failed to create bundle');
        this.isSavingBundle = false;
      }
    });
  }

  deleteBundle(id: number) {
    if (!confirm('Delete this bundle?')) {
      return;
    }

    this.api.deleteBundle(id).subscribe({
      next: () => {
        this.toast.success('Bundle deleted');
        this.bundles = this.bundles.filter(b => b.id !== id);
      },
      error: () => {
        this.toast.error('Failed to delete bundle');
      }
    });
  }
}
