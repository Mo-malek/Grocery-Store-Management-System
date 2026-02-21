import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { AuthService } from '../../core/services/auth.service';
import { BarcodeScannerComponent } from '../../shared/components/barcode-scanner/barcode-scanner.component';

@Component({
  selector: 'app-inventory',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent, SpinnerComponent, BarcodeScannerComponent],
  template: `
    <div class="container relative">
      <app-spinner *ngIf="isLoading"></app-spinner>
      
      <div class="header">
        <h1>إدارة المخزون</h1>
        <div class="header-actions">
           <button class="btn btn-secondary" (click)="loadAuditReport()">تحليل الفاقد</button>
           <button class="btn btn-primary" (click)="openModal()">+ منتج جديد</button>
        </div>
      </div>

      <!-- Audit Report Section -->
      <div class="card audit-card" *ngIf="auditReport.length">
        <div class="audit-header">
           <h3>⚠️ تنبيهات فقد المخزون (Shrinkage)</h3>
           <button class="btn-close" (click)="auditReport = []">&times;</button>
        </div>
        <p class="audit-desc">المنتجات التالية تعاني من نسبة فقد عالية مقارنة بالمبيعات:</p>
        <div class="audit-grid">
           <div class="audit-item-box" *ngFor="let item of auditReport">
              <div class="audit-name">{{ item.productName }}</div>
              <div class="audit-stats">
                 <span>المبيعات: {{ item.totalSold }}</span>
                 <span class="loss">الفقد: {{ item.totalManualLoss }}</span>
                 <span class="rate">النسبة: {{ item.lossRate | number:'1.1-1' }}%</span>
              </div>
              <div class="audit-action">
                 <button class="btn btn-sm btn-outline-danger" (click)="editProductById(item.productId)">تحقيق</button>
              </div>
           </div>
        </div>
      </div>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" (input)="search()" class="form-control" placeholder="بحث باسم المنتج أو الباركود...">
      </div>

      <div class="card">
        <div class="table-responsive">
          <table *ngIf="products.length">
            <thead>
              <tr>
                <th>المنتج</th>
                <th>الباركود</th>
                <th>التصنيف</th>
                <th>سعر الشراء</th>
                <th>سعر البيع</th>
                <th>العرض</th>
                <th>الكمية</th>
                <th>تاريخ الانتهاء</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let product of products">
                <td>
                  <span class="truncate cell-name" [title]="product.name">{{ product.name }}</span>
                </td>
                <td>
                  <span class="truncate" [title]="product.barcode || '-'">
                    {{ product.barcode || '-' }}
                  </span>
                </td>
                <td><span class="badge">{{ product.category }}</span></td>
                <td>{{ product.purchasePrice }} ج.م</td>
                <td>{{ product.sellingPrice }} ج.م</td>
                <td>
                  <span class="offer-badge" *ngIf="(product.discountPercentage ?? 0) > 0">
                    {{ product.discountPercentage | number:'1.0-2' }}%
                  </span>
                  <span class="no-offer" *ngIf="(product.discountPercentage ?? 0) <= 0">-</span>
                </td>
                <td>
                  <span [class.low-stock]="product.currentStock <= product.minStock">
                    {{ product.currentStock }} {{ product.unit }}
                  </span>
                  <span *ngIf="product.currentStock <= product.minStock" class="warning-icon" title="مخزون منخفض">
                    <span class="icon" aria-hidden="true">&#9888;</span>
                    <span>تنبيه</span>
                  </span>
                </td>
                <td>
                  <span [class.text-danger]="isExpiringSoon(product.expiryDate)">
                    {{ product.expiryDate | date:'shortDate' || '-' }}
                  </span>
                </td>
                <td>
                  <button class="btn-icon" (click)="editProduct(product)" title="تعديل">
                    <span class="icon" aria-hidden="true">&#9998;</span>
                    <span>تعديل</span>
                  </button>
                  <button class="btn-icon" *ngIf="isManagerOrAdmin" (click)="openAdjustModal(product)" title="تعديل الكمية">
                    <span class="icon" aria-hidden="true">&#9881;</span>
                    <span>كمية</span>
                  </button>
                  <button class="btn-icon delete" *ngIf="isManagerOrAdmin" (click)="deleteProduct(product.id!)" title="حذف">
                    <span class="icon" aria-hidden="true">&#128465;</span>
                    <span>حذف</span>
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
          
          <div class="empty-state" *ngIf="!isLoading && !products.length">
            <p>لا توجد منتجات. قم بإضافة منتج جديد.</p>
          </div>

          <!-- Pagination Controls -->
          <div class="pagination" *ngIf="totalPages > 1">
            <button class="btn btn-sm" [disabled]="currentPage === 0" (click)="goToPage(currentPage - 1)">السابق</button>
            <span class="page-info">صفحة {{ currentPage + 1 }} من {{ totalPages }}</span>
            <button class="btn btn-sm" [disabled]="currentPage >= totalPages - 1" (click)="goToPage(currentPage + 1)">التالي</button>
          </div>
        </div>
      </div>
    </div>

    <app-modal *ngIf="isModalOpen" [title]="editingProduct ? 'تعديل منتج' : 'إضافة منتج جديد'" (onClose)="closeModal()">
      <form (ngSubmit)="saveProduct()">
        <div class="grid">
          <div class="form-group">
            <label>اسم المنتج <span class="required">*</span></label>
            <input [(ngModel)]="currentProduct.name" name="name" class="form-control" required>
          </div>
          
          <div class="form-group">
            <label>الباركود</label>
            <div class="barcode-row">
              <input [(ngModel)]="currentProduct.barcode" name="barcode" class="form-control" placeholder="اكتب الباركود أو امسحه بالكاميرا">
              <button type="button" class="btn btn-secondary scan-btn" (click)="openScanner()">📷 مسح</button>
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label>القسم</label>
              <input [(ngModel)]="currentProduct.category" name="category" class="form-control" list="categories">
              <datalist id="categories">
                <option value="مواد غذائية">
                <option value="مشروبات">
                <option value="منظفات">
                <option value="ألبان">
                <option value="حلويات">
              </datalist>
            </div>
            <div class="form-group">
              <label>الوحدة</label>
              <select [(ngModel)]="currentProduct.unit" name="unit" class="form-control">
                <option value="قطعة">قطعة</option>
                <option value="كيلو">كيلو</option>
                <option value="علبة">علبة</option>
                <option value="زجاجة">زجاجة</option>
                <option value="كيس">كيس</option>
                <option value="كرتونة">كرتونة</option>
              </select>
            </div>
          </div>

          <div class="grid grid-cols-3">
            <div class="form-group">
              <label>سعر الشراء <span class="required">*</span></label>
              <input type="number" [(ngModel)]="currentProduct.purchasePrice" name="purchasePrice" class="form-control" required min="0">
            </div>
            <div class="form-group">
              <label>سعر البيع <span class="required">*</span></label>
              <input type="number" [(ngModel)]="currentProduct.sellingPrice" name="sellingPrice" class="form-control" required min="0">
            </div>
            <div class="form-group">
              <label>نسبة العرض (%)</label>
              <input type="number" [(ngModel)]="currentProduct.discountPercentage" name="discountPercentage" class="form-control" min="0" max="100" step="0.01">
              <small class="hint">0 = بدون عرض</small>
            </div>
          </div>

          <p class="offer-preview" *ngIf="(currentProduct.discountPercentage ?? 0) > 0 && currentProduct.sellingPrice > 0">
            سعر العرض للعميل: <strong>{{ getDiscountedPrice(currentProduct) | number:'1.2-2' }} ج.م</strong>
          </p>

          <div class="grid grid-cols-2">
            <div class="form-group" *ngIf="!editingProduct">
              <label>الكمية الحالية <span class="required">*</span></label>
              <input type="number" [(ngModel)]="currentProduct.currentStock" name="currentStock" class="form-control" required>
            </div>
            <div class="form-group">
              <label>الحد الأدنى <span class="required">*</span></label>
              <input type="number" [(ngModel)]="currentProduct.minStock" name="minStock" class="form-control" required min="0">
            </div>
          </div>

          <div class="grid grid-cols-2">
            <div class="form-group">
              <label>تاريخ الانتهاء</label>
              <input type="date" [(ngModel)]="currentProduct.expiryDate" name="expiryDate" class="form-control">
            </div>
            <div class="form-group">
              <label>المورد / الشركة</label>
              <input type="text" [(ngModel)]="currentProduct.manufacturer" name="manufacturer" class="form-control" placeholder="اسم الشركة المنتج">
            </div>
          </div>

          <div class="modal-actions">
            <button type="button" class="btn" (click)="closeModal()">إلغاء</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSaving || !currentProduct.name || !currentProduct.purchasePrice || !currentProduct.sellingPrice || (currentProduct.discountPercentage ?? 0) < 0 || (currentProduct.discountPercentage ?? 0) > 100">
              {{ isSaving ? 'جاري الحفظ...' : 'حفظ' }}
            </button>
          </div>
        </div>
      </form>
    </app-modal>

    <app-barcode-scanner
      *ngIf="isScannerOpen"
      (scanSuccess)="onBarcodeScanned($event)"
      (closeScanner)="closeScanner()">
    </app-barcode-scanner>

    <!-- Stock Adjustment Modal -->
    <app-modal *ngIf="isAdjustModalOpen" [title]="'تعديل كمية المستودع: ' + currentProduct.name" (onClose)="isAdjustModalOpen = false">
      <div class="form-group">
        <label>الكمية المضافة/المخصومة</label>
        <input type="number" [(ngModel)]="adjustQuantity" class="form-control" placeholder="مثلاً 10 للزيادة أو -5 للنقص">
      </div>
      <div class="form-group">
        <label>سبب التعديل (إلزامي للرقابة)</label>
        <input type="text" [(ngModel)]="adjustReason" class="form-control" placeholder="مثلاً: توريد جديد، تالف، جرد دوري...">
      </div>
      <div class="modal-actions">
        <button class="btn" (click)="isAdjustModalOpen = false">إلغاء</button>
        <button class="btn btn-primary" (click)="saveAdjustment()">تأكيد التعديل</button>
      </div>
    </app-modal>
  `,
  styles: [`
    .container.relative {
      position: relative;
      min-height: 500px;
    }
  
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .search-bar {
      margin-bottom: 1.5rem;
    }
    
    .badge {
      background-color: var(--bg-input);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }

    .offer-badge {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-width: 52px;
      padding: 0.2rem 0.45rem;
      border-radius: 999px;
      background: var(--danger-soft);
      color: var(--danger-color);
      font-weight: 700;
      font-size: 0.78rem;
      border: 1px solid rgba(220, 38, 38, 0.3);
    }

    .no-offer {
      color: var(--text-muted);
      font-size: 0.85rem;
    }
    
    .low-stock {
      color: var(--danger-color);
      font-weight: bold;
    }
    
    .warning-icon {
      display: inline-flex;
      align-items: center;
      gap: 0.25rem;
      margin-right: 0.45rem;
      padding: 0.08rem 0.45rem;
      border-radius: 999px;
      font-size: 0.72rem;
      font-weight: 700;
      color: var(--warning-color);
      background: var(--warning-soft);
      border: 1px solid rgba(217, 119, 6, 0.35);
    }
    
    .btn-icon {
      background: var(--surface-soft);
      border: 1px solid var(--border-color);
      border-radius: 999px;
      cursor: pointer;
      font-size: 0.78rem;
      font-weight: 700;
      color: var(--text-main);
      padding: 0.24rem 0.5rem;
      display: inline-flex;
      align-items: center;
      gap: 0.3rem;
      transition: transform 0.15s ease, border-color 0.15s ease, background 0.15s ease;
    }
    
    .btn-icon:hover {
      transform: translateY(-1px);
      border-color: var(--primary-color);
      background: rgba(var(--primary-rgb), 0.08);
    }
    
    .btn-icon.delete {
      color: var(--danger-color);
      border-color: rgba(220, 38, 38, 0.35);
      background: rgba(220, 38, 38, 0.06);
    }

    .btn-icon.delete:hover {
      background: rgba(220, 38, 38, 0.12);
      border-color: rgba(220, 38, 38, 0.6);
    }

    .icon {
      line-height: 1;
      font-size: 0.84rem;
    }
    
    .form-group {
      margin-bottom: 1rem;
    }
    
    label {
      display: block;
      margin-bottom: 0.5rem;
      font-size: 0.9rem;
      color: var(--text-muted);
    }
    
    .required {
      color: var(--danger-color);
    }

    .hint {
      display: inline-block;
      margin-top: 0.25rem;
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .offer-preview {
      margin: -0.35rem 0 0.2rem;
      padding: 0.55rem 0.7rem;
      border-radius: 10px;
      border: 1px dashed rgba(var(--secondary-rgb), 0.4);
      background: rgba(var(--secondary-rgb), 0.08);
      color: var(--text-main);
      font-size: 0.9rem;
    }

    .offer-preview strong {
      color: var(--secondary-color);
    }
    
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }

    .barcode-row {
      display: flex;
      gap: 0.5rem;
      align-items: center;
    }

    .scan-btn {
      white-space: nowrap;
      padding-inline: 0.9rem;
    }
    
    .empty-state {
      text-align: center;
      padding: 3rem;
      color: var(--text-muted);
    }
    .text-danger { color: var(--danger-color); font-weight: bold; }

    /* Audit Section Styles */
    .header-actions { display: flex; gap: 0.5rem; }
    .audit-card { background: var(--danger-soft); border: 1px solid rgba(220, 38, 38, 0.3); margin-bottom: 2rem; padding: 1.5rem; }
    .audit-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 0.5rem; }
    .audit-header h3 { margin: 0; color: var(--danger-color); font-size: 1.1rem; }
    .audit-desc { font-size: 0.9rem; color: var(--text-muted); margin-bottom: 1rem; }
    .audit-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(280px, 1fr)); gap: 1rem; }
    .audit-item-box { background: var(--bg-card); padding: 1rem; border-radius: 8px; border: 1px solid var(--border-color); display: flex; flex-direction: column; gap: 0.5rem; position: relative; }
    .audit-name { font-weight: bold; }
    .audit-stats { display: flex; gap: 1rem; font-size: 0.85rem; color: var(--text-muted); }
    .audit-stats .loss { color: var(--danger-color); }
    .audit-stats .rate { font-weight: bold; color: var(--danger-color); }
    .btn-close { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; line-height: 1; }
    .btn-sm { padding: 0.25rem 0.5rem; font-size: 0.8rem; }
    .btn-outline-danger { background: none; border: 1px solid var(--danger-color); color: var(--danger-color); }
    .btn-outline-danger:hover { background: var(--danger-color); color: white; }

    input.ng-invalid.ng-touched { border-color: var(--danger-color); }
    .error-msg { color: var(--danger-color); font-size: 0.75rem; margin-top: 0.25rem; }

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

    @media (max-width: 920px) {
      .grid.grid-cols-3 {
        grid-template-columns: repeat(2, minmax(0, 1fr));
      }
    }

    @media (max-width: 640px) {
      .grid.grid-cols-3 {
        grid-template-columns: 1fr;
      }

      .modal-actions {
        justify-content: stretch;
      }

      .modal-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class InventoryComponent implements OnInit {
  products: Product[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  isAdjustModalOpen = false;
  isScannerOpen = false;
  editingProduct: boolean = false;
  isLoading = false;
  isSaving = false;
  auditReport: any[] = [];

  // Pagination 
  currentPage: number = 0;
  totalPages: number = 0;
  pageSize: number = 20;
  totalElements: number = 0;

  adjustQuantity: number = 0;
  adjustReason: string = '';

  defaultProduct: Product = {
    name: '',
    barcode: '',
    category: '',
    purchasePrice: 0,
    sellingPrice: 0,
    discountPercentage: 0,
    currentStock: 0,
    minStock: 5,
    unit: 'قطعة'
  };

  currentProduct: Product = { ...this.defaultProduct };

  constructor(
    private api: ApiService,
    private toast: ToastService,
    public authService: AuthService
  ) { }

  ngOnInit() {
    this.loadProducts();
  }

  openAdjustModal(product: Product) {
    this.currentProduct = {
      ...product,
      discountPercentage: this.normalizeDiscount(product.discountPercentage)
    };
    this.adjustQuantity = 0;
    this.adjustReason = '';
    this.isAdjustModalOpen = true;
  }

  saveAdjustment() {
    if (!this.currentProduct.id || this.adjustQuantity === 0 || !this.adjustReason) {
      this.toast.warning('يرجى إدخال كمية غير صفرية وذكر السبب');
      return;
    }

    this.isLoading = true;
    this.api.adjustStock(this.currentProduct.id, this.adjustQuantity, this.adjustReason).subscribe({
      next: () => {
        this.toast.success('تم تعديل الكمية بنجاح');
        this.loadProducts();
        this.isAdjustModalOpen = false;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تعديل الكمية - تأكد من صلاحيات المدير');
        this.isLoading = false;
      }
    });
  }

  loadProducts() {
    this.isLoading = true;
    this.api.getProducts(this.searchTerm, this.currentPage, this.pageSize).subscribe({
      next: (page) => {
        this.products = page.content;
        this.totalPages = page.totalPages;
        this.totalElements = page.totalElements;
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل المنتجات');
        this.isLoading = false;
      }
    });
  }

  goToPage(page: number) {
    if (page >= 0 && page < this.totalPages) {
      this.currentPage = page;
      this.loadProducts();
    }
  }

  search() {
    this.currentPage = 0;
    this.loadProducts();
  }

  openModal() {
    this.isModalOpen = true;
    this.isScannerOpen = false;
    this.editingProduct = false;
    this.currentProduct = { ...this.defaultProduct };
  }

  editProduct(product: Product) {
    this.isModalOpen = true;
    this.isScannerOpen = false;
    this.editingProduct = true;
    this.currentProduct = {
      ...product,
      discountPercentage: this.normalizeDiscount(product.discountPercentage)
    };
  }

  closeModal() {
    this.isModalOpen = false;
    this.isScannerOpen = false;
  }

  openScanner() {
    this.isScannerOpen = true;
  }

  closeScanner() {
    this.isScannerOpen = false;
  }

  onBarcodeScanned(barcode: string) {
    this.currentProduct.barcode = barcode;
    this.toast.success(`تم قراءة الباركود: ${barcode}`);
    this.closeScanner();
  }

  saveProduct() {
    this.currentProduct.discountPercentage = this.normalizeDiscount(this.currentProduct.discountPercentage);

    if (!this.currentProduct.name || this.currentProduct.sellingPrice < 0) {
      this.toast.warning('يرجى ملء البيانات الأساسية بشكل صحيح');
      return;
    }

    if ((this.currentProduct.discountPercentage ?? 0) < 0 || (this.currentProduct.discountPercentage ?? 0) > 100) {
      this.toast.warning('نسبة العرض يجب أن تكون بين 0 و 100');
      return;
    }

    this.isSaving = true;

    if (this.editingProduct && this.currentProduct.id) {
      this.api.updateProduct(this.currentProduct.id, this.currentProduct).subscribe({
        next: () => {
          this.toast.success('تم تعديل المنتج بنجاح');
          this.loadProducts();
          this.closeModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('فشل تعديل المنتج');
          this.isSaving = false;
        }
      });
    } else {
      this.api.createProduct(this.currentProduct).subscribe({
        next: () => {
          this.toast.success('تم إضافة المنتج بنجاح');
          this.loadProducts();
          this.closeModal();
          this.isSaving = false;
        },
        error: () => {
          this.toast.error('فشل إضافة المنتج');
          this.isSaving = false;
        }
      });
    }
  }

  deleteProduct(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا المنتج؟')) {
      this.api.deleteProduct(id).subscribe({
        next: () => {
          this.toast.success('تم حذف المنتج');
          this.loadProducts();
        },
        error: () => {
          this.toast.error('فشل حذف المنتج');
        }
      });
    }
  }

  isExpiringSoon(date?: string): boolean {
    if (!date) return false;
    const expiry = new Date(date);
    const today = new Date();
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays < 30; // Alert if less than 30 days
  }

  editProductById(id: number) {
    const product = this.products.find(p => p.id === id);
    if (product) {
      this.editProduct(product);
    }
  }

  loadAuditReport() {
    this.isLoading = true;
    this.api.getInventoryAuditReport().subscribe({
      next: (data) => {
        this.auditReport = data;
        this.isLoading = false;
        if (data.length === 0) {
          this.toast.info('لا توجد تنبيهات فقد حالياً (أقل من 2%)');
        }
      },
      error: () => {
        this.toast.error('حدث خطأ أثناء تحميل التقرير');
        this.isLoading = false;
      }
    });
  }

  getDiscountedPrice(product: Product): number {
    const price = Number(product.sellingPrice || 0);
    const discount = this.normalizeDiscount(product.discountPercentage);
    if (discount <= 0 || price <= 0) {
      return price;
    }
    return Number((price * (1 - discount / 100)).toFixed(2));
  }

  private normalizeDiscount(value?: number): number {
    if (value == null || Number.isNaN(Number(value))) {
      return 0;
    }
    return Number(value);
  }
  get isManagerOrAdmin(): boolean {
    const role = this.authService.currentUserValue?.role;
    return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER';
  }
}
