import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Customer } from '../../core/models/models';
import { ModalComponent } from '../../shared/components/modal/modal.component';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-customers',
  standalone: true,
  imports: [CommonModule, FormsModule, ModalComponent],
  template: `
    <div class="container">
      <div class="header">
        <h1>العملاء</h1>
        <button class="btn btn-primary" (click)="openModal()">إضافة عميل</button>
      </div>

      <div class="alert-bar" *ngIf="stagnantCustomers.length">
        <div class="alert-content">
          <strong>عملاء غير نشطين:</strong>
          هناك {{ stagnantCustomers.length }} عملاء لم يزوروا المتجر منذ أكثر من 30 يوماً.
          <button class="btn btn-sm btn-link" (click)="filterStagnant()">إظهار غير النشطين فقط</button>
        </div>
      </div>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" (input)="search()" class="form-control" placeholder="بحث بالاسم أو الهاتف...">
      </div>

      <app-modal *ngIf="isModalOpen" [title]="editingCustomer ? 'تعديل بيانات العميل' : 'إضافة عميل'" (onClose)="closeModal()">
        <form (ngSubmit)="saveCustomer()">
          <div class="form-group">
            <label>اسم العميل</label>
            <input [(ngModel)]="currentCustomer.name" name="name" class="form-control" required minlength="2">
          </div>

          <div class="form-group">
            <label>رقم الهاتف</label>
            <input [(ngModel)]="currentCustomer.phone" name="phone" class="form-control" required pattern="^[0-9+()\-\s]{7,20}$">
          </div>

          <div class="modal-actions">
            <button type="button" class="btn" (click)="closeModal()">إلغاء</button>
            <button type="submit" class="btn btn-primary" [disabled]="isSubmitting">{{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}</button>
          </div>
        </form>
      </app-modal>

      <div class="card" *ngIf="!isLoading; else loadingTpl">
        <div class="table-responsive">
          <table>
            <thead>
              <tr>
                <th>الاسم</th>
                <th>الهاتف</th>
                <th>إجمالي المشتريات</th>
                <th>نقاط الولاء</th>
                <th>آخر زيارة</th>
                <th>الإحصائيات</th>
                <th>إجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let customer of customers">
                <td>
                  <span class="truncate cell-name" [title]="customer.name">{{ customer.name }}</span>
                </td>
                <td>
                  <span class="truncate" [title]="customer.phone">{{ customer.phone }}</span>
                </td>
                <td>{{ customer.totalPurchases | number:'1.2-2' }} ج.م</td>
                <td><span class="badge points">{{ customer.loyaltyPoints || 0 }}</span></td>
                <td class="last-visit">
                  <span *ngIf="customer.lastVisitAt">{{ customer.lastVisitAt | date:'shortDate' }}</span>
                  <span *ngIf="!customer.lastVisitAt" class="text-muted">لا توجد زيارات بعد</span>
                </td>
                <td>
                  <div class="stat-pill">
                    <span class="stat-label">الزيارات:</span>
                    <span class="stat-value">{{ customer.visitCount || 0 }}</span>
                  </div>
                  <div class="stat-pill">
                    <span class="stat-label">المتوسط:</span>
                    <span class="stat-value">{{ customer.avgTicketSize || 0 | number:'1.1-1' }}</span>
                  </div>
                </td>
                <td>
                  <button class="btn-icon" (click)="editCustomer(customer)">تعديل</button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="empty-state" *ngIf="!customers.length">
            <p>لم يتم العثور على عملاء.</p>
        </div>
      </div>

      <ng-template #loadingTpl>
        <div class="card empty-state">
          <p>جاري تحميل العملاء...</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
      gap: 1rem;
      flex-wrap: wrap;
    }

    .points {
      background-color: var(--secondary-color);
      color: var(--secondary-text);
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-pill);
      font-size: 0.8rem;
      border: 1px solid var(--secondary-color);
    }

    .btn-icon {
      background: none;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      cursor: pointer;
      color: var(--text-main);
      min-height: 32px;
      padding: 0 0.6rem;
    }

    .empty-state {
      text-align: center;
      padding: 2rem;
      color: var(--text-muted);
    }

    .form-group {
      margin-bottom: 1rem;
    }

    label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-muted);
    }

    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 1.5rem;
    }

    .stat-pill {
      display: inline-flex;
      background: var(--bg-input);
      border-radius: 6px;
      padding: 0.1rem 0.4rem;
      font-size: 0.75rem;
      margin-inline-end: 0.4rem;
      border: 1px solid var(--border-color);
    }
    .stat-label { color: var(--text-muted); margin-inline-end: 0.2rem; }
    .stat-value { font-weight: bold; color: var(--primary-color); }

    .last-visit { font-size: 0.8rem; }

    .alert-bar {
      background: rgba(var(--secondary-rgb), 0.1);
      border: 1px solid rgba(var(--secondary-rgb), 0.32);
      padding: 1rem;
      border-radius: var(--radius-md);
      margin-bottom: 1.5rem;
      color: var(--text-main);
    }

    .btn-link {
      color: var(--secondary-color);
      text-decoration: underline;
      background: none;
      border: none;
      cursor: pointer;
    }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  stagnantCustomers: Customer[] = [];
  searchTerm = '';
  isModalOpen = false;
  editingCustomer = false;
  isLoading = false;
  isSubmitting = false;

  defaultCustomer: Customer = { name: '', phone: '' };
  currentCustomer: Customer = { ...this.defaultCustomer };

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadCustomers();
    this.loadStagnantCustomers();
  }

  loadCustomers() {
    this.isLoading = true;
    this.api.getCustomers(this.searchTerm).subscribe({
      next: (data) => {
        this.customers = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل العملاء');
        this.isLoading = false;
      }
    });
  }

  loadStagnantCustomers() {
    this.api.getStagnantCustomers().subscribe({
      next: data => this.stagnantCustomers = data || [],
      error: () => this.stagnantCustomers = []
    });
  }

  filterStagnant() {
    this.customers = [...this.stagnantCustomers];
  }

  search() {
    this.loadCustomers();
  }

  openModal() {
    this.isModalOpen = true;
    this.editingCustomer = false;
    this.currentCustomer = { ...this.defaultCustomer };
  }

  editCustomer(customer: Customer) {
    this.isModalOpen = true;
    this.editingCustomer = true;
    this.currentCustomer = { ...customer };
  }

  closeModal() {
    if (this.isSubmitting) {
      return;
    }
    this.isModalOpen = false;
  }

  saveCustomer() {
    if (!this.currentCustomer.name?.trim() || !this.currentCustomer.phone?.trim()) {
      this.toast.warning('الاسم والهاتف مطلوبان');
      return;
    }
    const payload: Customer = {
      ...this.currentCustomer,
      name: this.currentCustomer.name.trim(),
      phone: this.currentCustomer.phone.trim()
    };

    this.isSubmitting = true;

    if (payload.id) {
      this.api.updateCustomer(payload.id, payload).subscribe({
        next: () => {
          this.toast.success('تم تحديث بيانات العميل بنجاح');
          this.loadCustomers();
          this.loadStagnantCustomers();
          this.closeModal();
          this.isSubmitting = false;
        },
        error: () => {
          this.toast.error('فشل تحديث بيانات العميل');
          this.isSubmitting = false;
        }
      });
      return;
    }

    this.api.createCustomer(payload).subscribe({
      next: () => {
        this.toast.success('تم إضافة العميل بنجاح');
        this.loadCustomers();
        this.loadStagnantCustomers();
        this.closeModal();
        this.isSubmitting = false;
      },
      error: () => {
        this.toast.error('فشل إضافة العميل');
        this.isSubmitting = false;
      }
    });
  }
}
