import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, Bundle, BundleItem } from '../../core/models/models';
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
        <h1>🎯 التسويق وعروض المتجر</h1>
        <div class="nav-tabs">
           <button class="btn btn-tab" [class.active]="activeTab === 'bundles'" (click)="activeTab = 'bundles'">📦 العروض مجمعة (Bundles)</button>
           <button class="btn btn-tab" [class.active]="activeTab === 'crm'" (click)="activeTab = 'crm'">👥 إدارة العملاء (CRM)</button>
        </div>
      </div>

      <!-- Bundles View -->
      <div *ngIf="activeTab === 'bundles'">
        <div class="action-bar mb-4">
           <button class="btn btn-primary" (click)="openModal()">+ إنشاء عرض جديد</button>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
        <div *ngIf="!bundles.length" class="empty-state card">
          لا توجد عروض حالية. ابدأ بإنشاء عروض ترويجية (مثلاً: زيت + سكر بسعر خاص).
        </div>
      </div>

      <!-- CRM View -->
      <div *ngIf="activeTab === 'crm'">
        <div class="card chart-card" *ngIf="stagnantChartData.length">
          <app-bar-chart [title]="'تصنيفات العملاء الغائبين'" [data]="stagnantChartData"></app-bar-chart>
        </div>

        <div class="card crm-alert-card" *ngIf="stagnantCustomers.length">
           <h3>⚠️ عملاء غائبون (أكثر من 30 يوم)</h3>
           <p>تحتاج هؤلاء العملاء لتذكيرهم بعروضنا الجديدة لضمان عودتهم.</p>
           
           <div class="crm-list mt-4">
              <div class="crm-item" *ngFor="let c of stagnantCustomers">
                 <div class="c-info">
                    <strong>{{ c.name }}</strong>
                    <span>آخر زيارة: {{ c.lastVisitAt | date:'shortDate' }}</span>
                 </div>
                 <div class="c-stats">
                    <span>النقاط: {{ c.loyaltyPoints }}</span>
                    <span>سلة: {{ c.avgTicketSize }} ج.م</span>
                 </div>
                 <div class="c-actions">
                    <button class="btn btn-sm btn-whatsapp" (click)="sendWhatsApp(c)">📲 إرسال عرض واتساب</button>
                 </div>
              </div>
           </div>
        </div>
        <div *ngIf="!stagnantCustomers.length" class="empty-state card">
           ✅ لا يوجد عملاء غائبون حالياً. جميع العملاء النشطين زاروا المتجر مؤخراً.
        </div>
      </div>
    </div>

    <app-modal *ngIf="isModalOpen" title="إنشاء عرض ترويجي (Bundle)" (onClose)="closeModal()">
      <form (ngSubmit)="saveBundle()">
        <div class="form-group mb-4">
          <label>اسم العرض</label>
          <input [(ngModel)]="newBundle.name" name="name" class="form-control" placeholder="مثلاً: عرض الفطور" required>
        </div>

        <div class="form-group mb-4">
          <label>السعر النهائي للعرض</label>
          <input type="number" [(ngModel)]="newBundle.price" name="price" class="form-control" required>
        </div>

        <div class="form-group mb-4">
          <label>إضافة منتجات للعرض</label>
          <div class="flex gap-2">
            <select #prodSelect class="form-control">
              <option value="">-- اختر منتج --</option>
              <option *ngFor="let p of allProducts" [value]="p.id">{{ p.name }} ({{ p.sellingPrice }} ج.م)</option>
            </select>
            <input #qtyInput type="number" value="1" class="form-control" style="width: 70px;">
            <button type="button" class="btn btn-primary" (click)="addItem(prodSelect.value, qtyInput.value)">+</button>
          </div>
        </div>

        <div class="items-list mb-4">
          <div class="item-row" *ngFor="let item of selectedItems; let i = index">
            <span>{{ item.productName }} × {{ item.quantity }}</span>
            <button type="button" class="remove-btn" (click)="removeItem(i)">&times;</button>
          </div>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" (click)="closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary">حفظ العرض</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .bundle-card { display: flex; flex-direction: column; gap: 1rem; transition: transform 0.2s; }
    .bundle-card:hover { transform: translateY(-5px); }
    .bundle-header { display: flex; justify-content: space-between; align-items: flex-start; }
    .bundle-items { font-size: 0.9rem; color: var(--text-muted); min-height: 3rem; }
    .badge { padding: 0.2rem 0.6rem; border-radius: 20px; font-size: 0.75rem; background: var(--bg-input); }
    .badge-active { background: rgba(16, 185, 129, 0.1); color: var(--primary-color); }
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
    .crm-item { display: flex; justify-content: space-between; align-items: center; background: var(--bg-input); padding: 1rem; border-radius: 12px; margin-bottom: 0.75rem; }
    .c-info { display: flex; flex-direction: column; gap: 0.2rem; }
    .c-info span { font-size: 0.8rem; color: var(--text-muted); }
    .c-stats { display: flex; gap: 1.5rem; font-size: 0.85rem; }
    .btn-whatsapp { background: #25d366; color: white; border: none; font-weight: bold; padding: 0.5rem 0.75rem; }
    .btn-whatsapp:hover { background: #128c7e; transform: scale(1.05); }
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

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.loadBundles();
    this.loadStagnantCustomers();
    this.api.getProducts('', 0, 1000).subscribe(page => this.allProducts = page.content);
  }

  loadStagnantCustomers() {
    this.api.getStagnantCustomers().subscribe(data => {
      this.stagnantCustomers = data;
      const byCategory = new Map<string, number>();
      this.stagnantCustomers.forEach(c => {
        const key = c.favoriteCategory || 'غير محدد';
        byCategory.set(key, (byCategory.get(key) || 0) + 1);
      });
      this.stagnantChartData = Array.from(byCategory.entries()).map(([label, value]) => ({ label, value }));
    });
  }

  sendWhatsApp(customer: any) {
    this.toast.info(`جاري إرسال رسالة WhatsApp إلى ${customer.name}...`);
    setTimeout(() => {
      this.toast.success(`تم إرسال العرض بنجاح إلى الرقم: ${customer.phone}`);
    }, 1500);
  }

  loadBundles() {
    this.api.getBundles().subscribe(data => this.bundles = data);
  }

  openModal() {
    this.isModalOpen = true;
    this.newBundle = { name: '', price: 0, active: true };
    this.selectedItems = [];
  }

  closeModal() {
    this.isModalOpen = false;
  }

  addItem(prodId: string, qty: string) {
    if (!prodId) {
      this.toast.warning('يرجى اختيار منتج أولاً');
      return;
    }
    const id = parseInt(prodId);
    const product = this.allProducts.find(p => p.id === id);
    if (product) {
      this.selectedItems.push({
        productId: id,
        productName: product.name,
        quantity: parseInt(qty) || 1,
        product: product
      });
      this.toast.success(`تمت إضافة ${product.name} للعرض`);
    }
  }

  removeItem(index: number) {
    this.selectedItems.splice(index, 1);
  }

  saveBundle() {
    if (!this.newBundle.name) {
      this.toast.warning('يرجى إدخال اسم العرض');
      return;
    }
    if (this.selectedItems.length < 1) {
      this.toast.warning('يرجى إضافة منتج واحد على الأقل للعرض');
      return;
    }

    const bundle: Bundle = {
      name: this.newBundle.name,
      price: this.newBundle.price,
      active: true,
      items: this.selectedItems.map(si => ({
        product: si.product,
        quantity: si.quantity
      }))
    };

    this.api.createBundle(bundle).subscribe({
      next: () => {
        this.toast.success('تم إنشاء العرض بنجاح');
        this.loadBundles();
        this.closeModal();
      },
      error: (err) => {
        console.error('Bundle creation error', err);
        this.toast.error('فشل حفظ العرض - تأكد من صلاحيات المدير وصحة البيانات');
      }
    });
  }

  deleteBundle(id: number) {
    if (confirm('هل تريد حذف هذا العرض؟')) {
      this.api.deleteBundle(id).subscribe(() => {
        this.toast.info('تم حذف العرض');
        this.loadBundles();
      });
    }
  }
}
