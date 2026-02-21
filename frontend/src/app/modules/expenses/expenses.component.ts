import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Expense } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';

@Component({
  selector: 'app-expenses',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent],
  template: `
    <div class="container">
      <app-spinner *ngIf="isLoading"></app-spinner>
      <div class="header">
        <h1>إدارة المصاريف</h1>
        <button class="btn btn-primary" (click)="openModal()">إضافة مصروف</button>
      </div>

      <div class="modal" *ngIf="showAddModal">
        <div class="modal-content">
          <h3>إضافة مصروف جديد</h3>
          <div class="form-group">
            <label>الوصف</label>
            <input type="text" [(ngModel)]="newExpense.description" placeholder="إيجار، فاتورة كهرباء، صيانة...">
          </div>
          <div class="form-group">
            <label>المبلغ (ج.م)</label>
            <input type="number" min="0" step="0.01" [(ngModel)]="newExpense.amount">
          </div>
          <div class="form-group">
            <label>الفئة</label>
            <select [(ngModel)]="newExpense.category">
              <option value="RENT">إيجار</option>
              <option value="ELECTRICITY">كهرباء</option>
              <option value="SALARY">رواتب</option>
              <option value="MAINTENANCE">صيانة</option>
              <option value="OTHER">أخرى</option>
            </select>
          </div>
          <div class="modal-actions">
            <button class="btn btn-secondary" (click)="closeModal()" [disabled]="isSubmitting">إلغاء</button>
            <button class="btn btn-primary" (click)="addExpense()" [disabled]="isSubmitting || !canSubmit">{{ isSubmitting ? 'جاري الحفظ...' : 'حفظ' }}</button>
          </div>
        </div>
      </div>

      <div class="summary-row" *ngIf="expenses.length">
        <div class="summary-card">
          <span class="label">إجمالي المصاريف</span>
          <span class="value">{{ totalAmount | number:'1.2-2' }} ج.م</span>
        </div>
        <div class="summary-card" *ngFor="let cat of categoryKeys">
          <span class="label">{{ getCategoryLabel(cat) }}</span>
          <span class="value">{{ categoryTotals[cat] | number:'1.2-2' }} ج.م</span>
        </div>
      </div>

      <div class="card mt-4">
        <table>
          <thead>
            <tr>
              <th>التاريخ</th>
              <th>الوصف</th>
              <th>الفئة</th>
              <th>المبلغ</th>
              <th>إجراءات</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let ex of expenses">
              <td>{{ ex.createdAt | date:'shortDate' }}</td>
              <td>
                <span class="truncate cell-description" [title]="ex.description">{{ ex.description }}</span>
              </td>
              <td>
                <span class="category-badge">{{ getCategoryLabel(ex.category) }}</span>
              </td>
              <td class="amount">{{ ex.amount | number:'1.2-2' }} ج.م</td>
              <td>
                <button class="btn-icon danger" (click)="deleteExpense(ex.id!)">حذف</button>
              </td>
            </tr>
            <tr *ngIf="!expenses.length">
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد مصاريف.</td>
            </tr>
          </tbody>
        </table>
      </div>
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
    .summary-row {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
      margin-bottom: 1rem;
    }
    .summary-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 0.75rem 1rem;
      min-width: 160px;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }
    .summary-card .label {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    .summary-card .value {
      font-size: 0.95rem;
      font-weight: bold;
      color: var(--primary-color);
    }
    .amount {
      font-weight: bold;
      color: var(--danger-color);
    }
    .category-badge {
      background: var(--bg-input);
      padding: 0.25rem 0.75rem;
      border-radius: 20px;
      font-size: 0.85rem;
    }
    .modal {
      position: fixed;
      top: 0; left: 0; right: 0; bottom: 0;
      background: rgba(17, 24, 39, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      padding: 1rem;
      overflow-y: auto;
    }
    .modal-content {
      background: var(--bg-card);
      padding: 2rem;
      border-radius: var(--radius-lg);
      width: min(440px, 100%);
      max-height: calc(100dvh - 2rem);
      overflow-y: auto;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      margin: auto 0;
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }
    .form-group input,
    .form-group select {
      width: 100%;
      min-height: 42px;
      border: 1px solid var(--input-border-color);
      border-radius: 10px;
      padding: 0.5rem 0.65rem;
      background: var(--bg-card);
      color: var(--text-main);
    }
    .form-group input:focus,
    .form-group select:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring-shadow);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
      flex-wrap: wrap;
    }
    .btn-icon {
      background: transparent;
      border: 1px solid var(--border-color);
      cursor: pointer;
      padding: 5px 9px;
      border-radius: 8px;
      transition: all 0.2s;
      color: var(--text-main);
    }
    .btn-icon.danger:hover {
      background: var(--danger-soft);
      border-color: var(--danger-color);
      color: var(--danger-color);
    }

    @media (max-width: 640px) {
      .modal {
        padding: 0.65rem;
      }

      .modal-content {
        padding: 1rem;
        max-height: calc(100dvh - 1.3rem);
      }

      .modal-actions .btn {
        width: 100%;
      }
    }
  `]
})
export class ExpensesComponent implements OnInit {
  expenses: Expense[] = [];
  showAddModal = false;
  newExpense: Expense = { description: '', amount: 0, category: 'OTHER' };
  isLoading = false;
  isSubmitting = false;

  totalAmount = 0;
  categoryTotals: { [key: string]: number } = {};
  categoryKeys: string[] = [];

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit() {
    this.loadExpenses();
  }

  get canSubmit(): boolean {
    return !!this.newExpense.description?.trim() && !!this.newExpense.amount && this.newExpense.amount > 0;
  }

  openModal() {
    this.showAddModal = true;
    this.newExpense = { description: '', amount: 0, category: 'OTHER' };
  }

  closeModal() {
    if (this.isSubmitting) return;
    this.showAddModal = false;
  }

  loadExpenses() {
    this.isLoading = true;
    this.api.getExpenses().subscribe({
      next: (data) => {
        this.expenses = data || [];
        this.recalculateStats();
        this.isLoading = false;
      },
      error: () => {
        this.toast.error('فشل تحميل المصاريف');
        this.isLoading = false;
      }
    });
  }

  addExpense() {
    if (!this.canSubmit) {
      this.toast.warning('يرجى إدخال وصف ومبلغ صحيحين');
      return;
    }

    this.isSubmitting = true;
    const payload: Expense = {
      ...this.newExpense,
      description: this.newExpense.description.trim()
    };

    this.api.addExpense(payload).subscribe({
      next: () => {
        this.toast.success('تم إضافة المصروف بنجاح');
        this.showAddModal = false;
        this.newExpense = { description: '', amount: 0, category: 'OTHER' };
        this.isSubmitting = false;
        this.loadExpenses();
      },
      error: () => {
        this.toast.error('فشل إضافة المصروف');
        this.isSubmitting = false;
      }
    });
  }

  deleteExpense(id: number) {
    if (!confirm('حذف هذا المصروف؟')) {
      return;
    }

    this.api.deleteExpense(id).subscribe({
      next: () => {
        this.toast.success('تم حذف المصروف');
        this.expenses = this.expenses.filter(e => e.id !== id);
        this.recalculateStats();
      },
      error: () => {
        this.toast.error('فشل حذف المصروف');
      }
    });
  }

  recalculateStats() {
    this.totalAmount = this.expenses.reduce((sum, e) => sum + (e.amount || 0), 0);
    const map: { [key: string]: number } = {};
    this.expenses.forEach(e => {
      const key = e.category || 'OTHER';
      map[key] = (map[key] || 0) + (e.amount || 0);
    });
    this.categoryTotals = map;
    this.categoryKeys = Object.keys(map);
  }

  getCategoryLabel(cat: string): string {
    const labels: any = {
      'RENT': 'إيجار',
      'ELECTRICITY': 'كهرباء',
      'SALARY': 'رواتب',
      'MAINTENANCE': 'صيانة',
      'OTHER': 'أخرى'
    };
    return labels[cat] || cat;
  }
}
