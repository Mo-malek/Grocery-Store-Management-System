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
        <h1>👥 إدارة العملاء</h1>
        <button class="btn btn-primary" (click)="openModal()">+ عميل جديد</button>
      </div>

      <div class="alert-bar" *ngIf="stagnantCustomers.length">
        <div class="alert-icon">⚠️</div>
        <div class="alert-content">
          <strong>تنبيه العملاء الغائبين:</strong> 
          يوجد {{ stagnantCustomers.length }} عملاء دائمين لم يزوروا المتجر منذ 30 يوم. 
          <button class="btn btn-sm btn-link" (click)="filterStagnant()">عرض الكل</button>
        </div>
      </div>

      <div class="search-bar">
        <input type="text" [(ngModel)]="searchTerm" (input)="search()" class="form-control" placeholder="بحث بالاسم أو رقم الهاتف...">
      </div>

      <div class="card">
        <table>
          <thead>
            <tr>
              <th>الاسم</th>
              <th>رقم الهاتف</th>
              <th>إجمالي المشتريات</th>
              <th>نقاط الولاء</th>
              <th>تاريخ التسجيل</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let customer of customers">
              <td>{{ customer.name }}</td>
              <td>{{ customer.phone }}</td>
              <td>{{ customer.totalPurchases | number:'1.2-2' }} ج.م</td>
              <td>
                <div class="stat-pill">
                  <span class="stat-label">زيارة:</span>
                  <span class="stat-value">{{ customer.visitCount || 0 }}</span>
                </div>
                <div class="stat-pill">
                  <span class="stat-label">متوسط:</span>
                  <span class="stat-value">{{ customer.avgTicketSize || 0 | number:'1.1-1' }}</span>
                </div>
              </td>
              <td>
                <span class="badge points">{{ customer.loyaltyPoints }} نقطة</span>
              </td>
              <td class="last-visit">
                <span *ngIf="customer.lastVisitAt">{{ customer.lastVisitAt | date:'shortDate' }}</span>
                <span *ngIf="!customer.lastVisitAt" class="text-muted">لم يزر بعد</span>
              </td>
              <td>
                <button class="btn-icon" (click)="editCustomer(customer)">✏️</button>
              </td>
            </tr>
          </tbody>
        </table>
        
        <div class="empty-state" *ngIf="!customers.length">
            <p>لا يوجد عملاء.</p>
        </div>
      </div>
    </div>

    <app-modal *ngIf="isModalOpen" [title]="editingCustomer ? 'تعديل بيانات عميل' : 'إضافة عميل جديد'" (onClose)="closeModal()">
      <form (ngSubmit)="saveCustomer()">
        <div class="form-group">
          <label>اسم العميل</label>
          <input [(ngModel)]="currentCustomer.name" name="name" class="form-control" required>
        </div>
        
        <div class="form-group">
          <label>رقم الهاتف</label>
          <input [(ngModel)]="currentCustomer.phone" name="phone" class="form-control" required>
        </div>

        <div class="modal-actions">
          <button type="button" class="btn" (click)="closeModal()">إلغاء</button>
          <button type="submit" class="btn btn-primary">حفظ</button>
        </div>
      </form>
    </app-modal>
  `,
  styles: [`
    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 2rem;
    }
    
    .points {
      background-color: var(--secondary-color);
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-sm);
      font-size: 0.8rem;
    }
    
    .btn-icon {
      background: none;
      border: none;
      cursor: pointer;
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
      border-radius: 4px;
      padding: 0.1rem 0.4rem;
      font-size: 0.75rem;
      margin-left: 0.4rem;
      border: 1px solid var(--border-color);
    }
    .stat-label { color: var(--text-muted); margin-left: 0.2rem; }
    .stat-value { font-weight: bold; color: var(--primary-color); }
    
    .last-visit { font-size: 0.8rem; }
    
    .alert-bar {
      background: rgba(var(--secondary-rgb), 0.1);
      border: 1px solid var(--secondary-color);
      padding: 1rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 1rem;
      margin-bottom: 1.5rem;
      color: var(--secondary-color);
    }
    .alert-icon { font-size: 1.5rem; }
    .btn-link { color: var(--secondary-color); text-decoration: underline; background: none; border: none; cursor: pointer; }
  `]
})
export class CustomersComponent implements OnInit {
  customers: Customer[] = [];
  stagnantCustomers: Customer[] = [];
  searchTerm: string = '';
  isModalOpen = false;
  editingCustomer = false;

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
    this.api.getCustomers(this.searchTerm).subscribe({
      next: (data) => {
        this.customers = data;
      },
      error: () => {
        this.toast.error('فشل تحميل العملاء');
      }
    });
  }

  loadStagnantCustomers() {
    this.api.getStagnantCustomers().subscribe(data => this.stagnantCustomers = data);
  }

  filterStagnant() {
    this.customers = this.stagnantCustomers;
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
    this.isModalOpen = false;
  }

  saveCustomer() {
    if (!this.currentCustomer.name || !this.currentCustomer.phone) {
      this.toast.warning('يرجى إدخال الاسم ورقم الهاتف');
      return;
    }

    if (this.currentCustomer.id) {
      this.toast.info('تعديل العملاء غير متاح حالياً');
      this.closeModal();
    } else {
      this.api.createCustomer(this.currentCustomer).subscribe({
        next: () => {
          this.toast.success('تم إضافة العميل بنجاح');
          this.loadCustomers();
          this.closeModal();
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء إضافة العميل');
        }
      });
    }
  }
}
