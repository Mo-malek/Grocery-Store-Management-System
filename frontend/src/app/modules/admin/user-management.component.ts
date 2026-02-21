import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="management-container fade-in">
      <div class="header">
        <div class="title-section">
          <h2>إدارة طاقم العمل</h2>
          <p class="subtitle">إدارة الحسابات والصلاحيات في النظام</p>
        </div>
        <button class="btn-premium" (click)="openCreateModal()">
          <span class="icon">➕</span> إضافة موظف جديد
        </button>
      </div>

      <div class="stats-row">
        <div class="stat-glass">
          <span class="s-label">إجمالي الموظفين</span>
          <span class="s-value">{{ users.length }}</span>
        </div>
        <div class="stat-glass">
          <span class="s-label">نشط حالياً</span>
          <span class="s-value">{{ activeCount }}</span>
        </div>
      </div>

      <div class="glass-card mt-2">
        <p class="table-loading" *ngIf="isTableLoading">جاري تحميل حسابات الموظفين...</p>
        <div class="table-container" *ngIf="!isTableLoading">
          <table>
            <thead>
              <tr>
                <th>الموظف</th>
                <th>اسم المستخدم</th>
                <th>الصلاحية</th>
                <th>الحالة</th>
                <th>تاريخ الانضمام</th>
                <th>الإجراءات</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users" [class.inactive]="!user.active">
                <td>
                  <div class="user-info">
                    <div class="avatar">{{ user.fullName?.charAt(0) || 'U' }}</div>
                    <span>{{ user.fullName || '---' }}</span>
                  </div>
                </td>
                <td><code class="username-pill">{{ user.username }}</code></td>
                <td>
                  <select class="glass-select" [value]="user.role" (change)="onRoleChange(user, $any($event.target).value)">
                    <option value="ROLE_MANAGER">مدير</option>
                    <option value="ROLE_CASHIER">كاشير</option>
                    <option value="ROLE_CUSTOMER">عميل</option>
                  </select>
                </td>
                <td>
                  <div class="toggle-wrapper" (click)="onToggleStatus(user)">
                    <div class="toggle-bg" [class.active]="user.active">
                      <div class="toggle-handle"></div>
                    </div>
                    <span class="toggle-label">{{ user.active ? 'نشط' : 'معطل' }}</span>
                  </div>
                </td>
                <td>{{ user.createdAt | date:'mediumDate' }}</td>
                <td>
                  <div class="actions">
                    <button class="btn-icon edit" (click)="openEditModal(user)" title="تعديل">📝</button>
                    <button *ngIf="user.username !== 'admin'" class="btn-icon delete" (click)="onDeleteUser(user.id)" title="حذف">🗑</button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- User Modal (Create/Edit) -->
      <div class="modal-overlay" *ngIf="showModal" (click)="closeModal()">
        <div class="modal-content glass-card" (click)="$event.stopPropagation()">
          <div class="modal-header">
            <h3>{{ isEditMode ? 'تعديل بيانات الحساب' : 'إضافة موظف جديد' }}</h3>
            <button class="close-btn" (click)="closeModal()">✖</button>
          </div>
          
          <form (ngSubmit)="onSubmit()" #userForm="ngForm">
            <div class="form-grid">
              <div class="form-group">
                <label>الاسم الكامل</label>
                <input type="text" name="fullName" [(ngModel)]="currentUser.fullName" required class="glass-input" placeholder="مثال: أحمد محمد">
              </div>
              <div class="form-group">
                <label>اسم المستخدم</label>
                <input type="text" name="username" [(ngModel)]="currentUser.username" required class="glass-input" placeholder="ahmed_123">
              </div>
              <div class="form-group" *ngIf="!isEditMode">
                <label>كلمة المرور</label>
                <input type="password" name="password" [(ngModel)]="currentUser.password" required minlength="6" class="glass-input" placeholder="******">
              </div>
              <div class="form-group">
                <label>الصلاحية</label>
                <select name="role" [(ngModel)]="currentUser.role" required class="glass-select-full">
                  <option value="ROLE_CASHIER">كاشير</option>
                  <option value="ROLE_MANAGER">مدير</option>
                </select>
              </div>
            </div>

            <div class="modal-footer">
              <button type="button" class="btn-secondary-glass" (click)="closeModal()">إلغاء</button>
              <button type="submit" class="btn-primary-glass" [disabled]="!userForm.form.valid || isLoading">
                {{ isLoading ? 'جاري الحفظ...' : (isEditMode ? 'تحديث البيانات' : 'إنشاء الحساب') }}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .management-container { padding: 2rem; max-width: 1200px; margin: 0 auto; }
    .header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2.5rem; }
    .title-section h2 { font-size: 2rem; font-weight: 800; margin-bottom: 0.25rem; color: var(--text-main); }
    .subtitle { color: var(--text-muted); font-size: 0.95rem; }

    .stats-row { display: flex; gap: 1.5rem; margin-bottom: 2rem; }
    .stat-glass { background: var(--glass-bg); backdrop-filter: blur(12px); border: 1px solid var(--glass-border); padding: 1.5rem; border-radius: 20px; flex: 1; display: flex; flex-direction: column; box-shadow: var(--glass-shadow); }
    .s-label { color: var(--text-muted); font-size: 0.85rem; font-weight: 600; margin-bottom: 0.5rem; }
    .s-value { font-size: 2rem; font-weight: 800; color: var(--text-main); }

    .glass-card { background: var(--glass-bg); backdrop-filter: blur(16px); border: 1px solid var(--glass-border); border-radius: 24px; padding: 1.5rem; box-shadow: var(--glass-shadow); }
    .table-container { width: 100%; overflow-x: auto; }
    .table-loading { margin: 0; color: var(--text-muted); font-weight: 600; }
    
    table { width: 100%; border-collapse: collapse; text-align: right; }
    th { padding: 1.2rem; color: var(--text-muted); font-weight: 700; font-size: 0.85rem; text-transform: uppercase; border-bottom: 1px solid var(--glass-border); }
    td { padding: 1.2rem; border-bottom: 1px solid var(--glass-border); color: var(--text-main); vertical-align: middle; }
    tr:last-child td { border-bottom: none; }
    tr.inactive { opacity: 0.6; }

    .user-info { display: flex; align-items: center; gap: 1rem; }
    .avatar { width: 40px; height: 40px; background: var(--primary-color); border-radius: 12px; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 1.1rem; color: #fff; }

    .username-pill { background: var(--surface-soft); padding: 4px 10px; border-radius: 8px; color: var(--primary-color); font-family: monospace; }

    .glass-select { background: var(--surface-soft); border: 1px solid var(--glass-border); border-radius: 8px; color: var(--text-main); padding: 4px 8px; font-size: 0.85rem; outline: none; cursor: pointer; }
    .glass-select option { background: var(--bg-card); color: var(--text-main); }

    .toggle-wrapper { display: flex; align-items: center; gap: 0.75rem; cursor: pointer; user-select: none; }
    .toggle-bg { width: 40px; height: 20px; background: var(--surface-soft-hover); border-radius: 20px; position: relative; transition: 0.3s; border: 1px solid var(--glass-border); }
    .toggle-bg.active { background: var(--primary-color); }
    .toggle-handle { width: 14px; height: 14px; background: #fff; border-radius: 50%; position: absolute; top: 2px; left: 2px; transition: 0.3s; }
    .toggle-bg.active .toggle-handle { left: 22px; }
    .toggle-label { font-size: 0.8rem; font-weight: 600; }

    .btn-premium { background: var(--secondary-color); color: var(--secondary-text); border: none; padding: 0.8rem 1.5rem; border-radius: 14px; font-weight: 700; cursor: pointer; transition: 0.3s; display: flex; align-items: center; gap: 0.5rem; box-shadow: var(--shadow-xs); }
    .btn-premium:hover { transform: translateY(-2px); background: var(--secondary-hover); box-shadow: var(--shadow-sm); }

    .btn-icon { background: var(--surface-soft); border: 1px solid var(--glass-border); padding: 0.5rem; border-radius: 10px; cursor: pointer; transition: 0.2s; font-size: 1.1rem; color: var(--text-main); }
    .btn-icon:hover { background: var(--surface-soft-hover); transform: scale(1.1); }
    .btn-icon.delete:hover { border-color: var(--danger-color); color: var(--danger-color); }

    /* Modal Styles */
    .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.4); backdrop-filter: blur(8px); display: flex; align-items: flex-start; justify-content: center; z-index: 1000; padding: 1rem; overflow-y: auto; }
    .modal-content { width: min(560px, 100%); max-height: calc(100dvh - 2rem); overflow-y: auto; padding: 2rem; margin: auto 0; }
    .modal-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 2rem; }
    .close-btn { background: none; border: none; font-size: 1.5rem; color: var(--text-muted); cursor: pointer; }

    .form-grid { display: grid; gap: 1.5rem; }
    .form-group label { display: block; margin-bottom: 0.5rem; font-size: 0.9rem; font-weight: 600; color: var(--text-muted); }
    .glass-input, .glass-select-full { width: 100%; background: var(--surface-soft); border: 1px solid var(--glass-border); border-radius: 12px; padding: 0.9rem; color: var(--text-main); outline: none; transition: 0.3s; }
    .glass-input:focus { border-color: var(--primary-color); background: var(--surface-soft-hover); }

    .modal-footer { display: flex; justify-content: flex-end; gap: 1rem; margin-top: 2.5rem; flex-wrap: wrap; }
    .btn-secondary-glass { background: var(--surface-soft); border: 1px solid var(--glass-border); color: var(--text-main); padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 600; }
    .btn-primary-glass { background: var(--secondary-color); border: none; color: var(--secondary-text); padding: 0.8rem 1.5rem; border-radius: 12px; cursor: pointer; font-weight: 700; box-shadow: 0 4px 15px rgba(var(--secondary-rgb), 0.2); transition: 0.3s; }
    .btn-primary-glass:disabled { opacity: 0.5; cursor: not-allowed; }

    @media (max-width: 640px) {
      .management-container { padding: 1rem; }
      .header { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
      .stats-row { flex-direction: column; gap: 0.8rem; }
      .modal-overlay { padding: 0.65rem; }
      .modal-content { padding: 1rem; max-height: calc(100dvh - 1.3rem); }
      .modal-header { margin-bottom: 1rem; }
      .form-grid { gap: 1rem; }
      .modal-footer { margin-top: 1.5rem; }
      .modal-footer button { width: 100%; }
    }
  `]
})
export class UserManagementComponent implements OnInit {
  users: any[] = [];
  showModal = false;
  isEditMode = false;
  isLoading = false;
  isTableLoading = false;
  currentUser: any = {};

  constructor(private api: ApiService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadUsers();
  }

  get activeCount(): number {
    return this.users?.filter(u => u.active).length || 0;
  }

  loadUsers() {
    this.isTableLoading = true;
    this.api.getAdminUsers().subscribe({
      next: (data) => {
        this.users = data || [];
        this.isTableLoading = false;
      },
      error: () => {
        this.isTableLoading = false;
        this.toast.error('فشل تحميل بيانات الموظفين');
      }
    });
  }

  openCreateModal() {
    this.isEditMode = false;
    this.currentUser = { fullName: '', username: '', password: '', role: 'ROLE_CASHIER' };
    this.showModal = true;
  }

  openEditModal(user: any) {
    this.isEditMode = true;
    this.currentUser = { ...user };
    this.showModal = true;
  }

  closeModal() {
    this.showModal = false;
  }

  onSubmit() {
    this.isLoading = true;
    if (this.isEditMode) {
      this.api.updateUser(this.currentUser.id, this.currentUser).subscribe({
        next: () => {
          this.toast.success('تم تحديث بيانات الموظف');
          this.loadUsers();
          this.closeModal();
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('حدث خطأ أثناء التحديث');
          this.isLoading = false;
        }
      });
    } else {
      this.api.createStaff(this.currentUser).subscribe({
        next: () => {
          this.toast.success('تم إضافة الموظف بنجاح');
          this.loadUsers();
          this.closeModal();
          this.isLoading = false;
        },
        error: (err) => {
          this.toast.error(err.error || 'خطأ في إنشاء الحساب');
          this.isLoading = false;
        }
      });
    }
  }

  onToggleStatus(user: any) {
    const newStatus = !user.active;
    this.api.updateUserStatus(user.id, newStatus).subscribe({
      next: () => {
        user.active = newStatus;
        this.toast.success(newStatus ? 'تم تفعيل الحساب' : 'تم تعطيل الحساب');
      },
      error: () => this.toast.error('فشل في تغيير الحالة')
    });
  }

  onRoleChange(user: any, newRole: string) {
    this.api.updateUserRole(user.id, newRole).subscribe({
      next: () => {
        user.role = newRole;
        this.toast.success('تم تغيير الصلاحية بنجاح');
      },
      error: () => this.toast.error('فشل في تغيير الصلاحية')
    });
  }

  onDeleteUser(id: number) {
    if (confirm('هل أنت متأكد من حذف هذا الحساب نهائياً؟')) {
      this.api.deleteUser(id).subscribe({
        next: () => {
          this.toast.success('تم حذف الحساب بنجاح');
          this.loadUsers();
        },
        error: () => {
          this.toast.error('فشل حذف الحساب');
        }
      });
    }
  }
}

