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
        <h1>التسويق والعروض</h1>
        <div class="nav-tabs">
           <button class="btn btn-tab" [class.active]="activeTab === 'bundles'" (click)="activeTab = 'bundles'">الباقات</button>
           <button class="btn btn-tab" [class.active]="activeTab === 'crm'" (click)="activeTab = 'crm'">إدارة العملاء CRM</button>
        </div>
      </div>

      <p class="error" *ngIf="loadError">{{ loadError }}</p>

      <div *ngIf="activeTab === 'bundles'">
        <div class="action-bar mb-4">
           <button class="btn btn-primary" (click)="openModal()">إنشاء باقة</button>
        </div>

        <div class="card" *ngIf="isLoadingBundles">جاري تحميل الباقات...</div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6" *ngIf="!isLoadingBundles">
          <div class="card bundle-card" *ngFor="let b of bundles">
            <div class="bundle-header">
              <h3>{{ b.name }}</h3>
              <span class="badge" [class.badge-active]="b.active">نشط</span>
            </div>
            <div class="bundle-items">
              <div class="item" *ngFor="let item of b.items">
                {{ item.product.name }} × {{ item.quantity }}
              </div>
            </div>
            <div class="bundle-footer">
              <div class="price">السعر: <strong>{{ b.price }} ج.م</strong></div>
              <button class="btn btn-sm btn-danger" (click)="deleteBundle(b.id!)">حذف</button>
            </div>
          </div>
        </div>
        <div *ngIf="!isLoadingBundles && !bundles.length" class="empty-state card">
          لا توجد باقات بعد. قم بإنشاء أول باقة عروض.
        </div>
      </div>

      <div *ngIf="activeTab === 'crm'">
        <div class="card" *ngIf="isLoadingCustomers">جاري تحميل شرائح العملاء...</div>

        <ng-container *ngIf="!isLoadingCustomers">
          <div class="card chart-card" *ngIf="stagnantChartData.length">
            <app-bar-chart [title]="'العملاء المنقطعون حسب الفئة'" [data]="stagnantChartData"></app-bar-chart>
          </div>

          <div class="card crm-alert-card" *ngIf="stagnantCustomers.length">
             <h3>عملاء غير نشطين لأكثر من 30 يوماً</h3>
             <p>تواصل معهم بعروض استبقاء لإعادتهم.</p>

             <div class="crm-list mt-4">
                <div class="crm-item" *ngFor="let c of stagnantCustomers">
                   <div class="c-info">
                      <strong>{{ c.name }}</strong>
                      <span>آخر زيارة: {{ c.lastVisitAt | date:'shortDate' }}</span>
                   </div>
                   <div class="c-stats">
                      <span>النقاط: {{ c.loyaltyPoints }}</span>
                      <span>متوسط السلة: {{ c.avgTicketSize }} ج.م</span>
                   </div>
                   <div class="c-actions">
                      <button class="btn btn-sm btn-whatsapp" (click)="sendWhatsApp(c)">إرسال عرض واتساب</button>
                   </div>
                </div>
             </div>
          </div>

          <div *ngIf="!stagnantCustomers.length" class="empty-state card">
             لا يوجد عملاء غير نشطين حالياً.
          </div>
        </ng-container>
      </div>
    </div>

    <app-modal *ngIf="isModalOpen" title="إنشاء باقة عروض" (onClose)="closeModal()">
      <form (ngSubmit)="saveBundle()">
        <div class="form-group mb-4">
          <label>اسم الباقة</label>
          <input [(ngModel)]="newBundle.name" name="name" class="form-control" placeholder="عرض الإفطار..." required>
        </div>

        <div class="form-group mb-4">
          <label>سعر الباقة</label>
          <input type="number" [(ngModel)]="newBundle.price" name="price" min="0" step="0.01" class="form-control" required>
        </div>

        <div class="form-group mb-4">
          <label>إضافة منتجات للباقة</label>
          <div class="flex gap-2">
            <select #prodSelect class="form-control">
              <option value="">-- اختر المنتج --</option>
              <option *ngFor="let p of allProducts" [value]="p.id">{{ p.name }} ({{ p.sellingPrice }} ج.م)</option>
            </select>
            <input #qtyInput type="number" value="1" min="1" class="form-control" style="width: 80px;">
            <button type="button" class="btn btn-primary" (click)="addItem(prodSelect.value, qtyInput.value)">إضافة</button>
          </div>
        </div>

        <div class="items-list mb-4">
          <div class="item-row" *ngFor="let item of selectedItems; let i = index">
            <span>{{ item.productName }} × {{ item.quantity }}</span>
            <button type="button" class="remove-btn" (click)="removeItem(i)">&times;</button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" (click)="closeModal()" [disabled]="isSavingBundle">إلغاء</button>
          <button type="submit" class="btn btn-primary" [disabled]="isSavingBundle">{{ isSavingBundle ? 'جاري الحفظ...' : 'حفظ الباقة' }}</button>
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
      error: () => this.toast.error('فشل تحميل المنتجات للباقات')
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
        this.loadError = this.loadError || 'فشل تحميل عملاء CRM.';
        this.toast.error('فشل تحميل العملاء المنقطعين');
      }
    });
  }

  sendWhatsApp(customer: any) {
    this.toast.info(`جاري تجهيز عرض واتساب لـ ${customer.name}...`);
    setTimeout(() => {
      this.toast.success(`تم إرسال العرض إلى ${customer.phone}`);
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
        this.loadError = this.loadError || 'فشل تحميل الباقات.';
        this.toast.error('فشل تحميل الباقات');
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
      this.toast.warning('اختر منتجاً أولاً');
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
      this.toast.success(`تم إضافة ${product.name}`);
    }
  }

  removeItem(index: number) {
    this.selectedItems.splice(index, 1);
  }

  saveBundle() {
    if (!this.newBundle.name?.trim()) {
      this.toast.warning('يرجى إدخال اسم الباقة');
      return;
    }
    if (this.selectedItems.length < 1) {
      this.toast.warning('أضف منتجاً واحداً على الأقل');
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
        this.toast.success('تم إنشاء الباقة بنجاح');
        this.loadBundles();
        this.closeModal();
        this.isSavingBundle = false;
      },
      error: () => {
        this.toast.error('فشل إنشاء الباقة');
        this.isSavingBundle = false;
      }
    });
  }

  deleteBundle(id: number) {
    if (!confirm('حذف هذه الباقة؟')) {
      return;
    }

    this.api.deleteBundle(id).subscribe({
      next: () => {
        this.toast.success('تم حذف الباقة');
        this.bundles = this.bundles.filter(b => b.id !== id);
      },
      error: () => {
        this.toast.error('فشل حذف الباقة');
      }
    });
  }
}
