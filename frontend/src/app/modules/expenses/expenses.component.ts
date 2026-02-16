import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Expense } from '../../core/models/models';

@Component({
    selector: 'app-expenses',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="container">
      <div class="header">
        <h1>💸 إدارة المصاريف</h1>
        <button class="btn-primary" (click)="showAddModal = true">➕ إضافة مصروف جديد</button>
      </div>

      <!-- Add Expense Modal -->
      <div class="modal" *ngIf="showAddModal">
        <div class="modal-content">
          <h3>إضافة مصروف جديد</h3>
          <div class="form-group">
            <label>الوصف</label>
            <input type="text" [(ngModel)]="newExpense.description" placeholder="مثلاً: إيجار المحل، فاتورة كهرباء...">
          </div>
          <div class="form-group">
            <label>المبلغ (ج.م)</label>
            <input type="number" [(ngModel)]="newExpense.amount">
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
            <button class="btn-secondary" (click)="showAddModal = false">إلغاء</button>
            <button class="btn-primary" (click)="addExpense()" [disabled]="!newExpense.description || !newExpense.amount">حفظ</button>
          </div>
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
              <td>{{ ex.description }}</td>
              <td>
                <span class="category-badge">{{ getCategoryLabel(ex.category) }}</span>
              </td>
              <td class="amount">{{ ex.amount | number:'1.2-2' }} ج.م</td>
              <td>
                <button class="btn-icon danger" (click)="deleteExpense(ex.id!)">🗑️</button>
              </td>
            </tr>
            <tr *ngIf="!expenses.length">
              <td colspan="5" style="text-align: center; color: var(--text-muted); padding: 2rem;">لا توجد مصاريف مسجلة</td>
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
    }
    .amount {
      font-weight: bold;
      color: #f87171;
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
      background: rgba(0,0,0,0.73);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }
    .modal-content {
      background: var(--bg-card);
      padding: 2rem;
      border-radius: var(--radius-lg);
      width: 400px;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.3);
      border: 1px solid var(--border-color);
    }
    .form-group {
      margin-bottom: 1.25rem;
    }
    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
    }
    .modal-actions {
      display: flex;
      justify-content: flex-end;
      gap: 1rem;
      margin-top: 2rem;
    }
    .btn-icon {
        background: none;
        border: none;
        cursor: pointer;
        padding: 5px;
        border-radius: 5px;
        transition: background 0.2s;
    }
    .btn-icon.danger:hover {
        background: rgba(239, 68, 68, 0.1);
    }
  `]
})
export class ExpensesComponent implements OnInit {
    expenses: Expense[] = [];
    showAddModal = false;
    newExpense: Expense = { description: '', amount: 0, category: 'OTHER' };

    constructor(private api: ApiService) { }

    ngOnInit() {
        this.loadExpenses();
    }

    loadExpenses() {
        this.api.getExpenses().subscribe(data => this.expenses = data);
    }

    addExpense() {
        this.api.addExpense(this.newExpense).subscribe(() => {
            this.loadExpenses();
            this.showAddModal = false;
            this.newExpense = { description: '', amount: 0, category: 'OTHER' };
        });
    }

    deleteExpense(id: number) {
        if (confirm('هل أنت متأكد من حذف هذا المصروف؟')) {
            this.api.deleteExpense(id).subscribe(() => this.loadExpenses());
        }
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
