import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { NotificationService } from '../../core/services/notification.service';
import { ApiService } from '../../core/services/api.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-broadcast-notification',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="notification-container fade-in">
      <div class="header">
        <div class="title-section">
          <h2>مركز التنبيهات الذكي</h2>
          <p class="subtitle">أرسل تنبيهات فورية لجميع المستخدمين أو لعميل محدد</p>
        </div>
      </div>

      <div class="main-grid">
        <!-- Composer Card -->
        <div class="glass-card composer">
          <div class="card-header">
            <span class="step-badge">1</span>
            <h3>تجهيز الإشعار</h3>
          </div>

          <div class="form-body">
            <div class="target-toggle">
              <button 
                [class.active]="targetType === 'all'" 
                (click)="targetType = 'all'"
                type="button"
              >
                <span>🌐</span> الجميع
              </button>
              <button 
                [class.active]="targetType === 'specific'" 
                (click)="targetType = 'specific'"
                type="button"
              >
                <span>👤</span> مستخدم محدد
              </button>
            </div>

            <div class="form-group slide-in" *ngIf="targetType === 'specific'">
              <label>اختر المستخدم</label>
              <div class="searchable-select">
                <input 
                  type="text" 
                  [(ngModel)]="userSearch" 
                  placeholder="ابحث عن اسم المستخدم..."
                  class="glass-input"
                >
                <div class="user-dropdown shadow-xl" *ngIf="userSearch && !selectedUser">
                  <div 
                    *ngFor="let user of filteredUsers" 
                    (click)="selectUser(user)"
                    class="user-item"
                  >
                    <div class="avatar">{{ user.fullName?.charAt(0) || 'U' }}</div>
                    <div class="u-info">
                      <span class="u-name">{{ user.fullName }}</span>
                      <span class="u-handle">{{ '@' }}{{ user.username }}</span>
                    </div>
                  </div>
                  <div *ngIf="filteredUsers.length === 0" class="no-results">لا يوجد نتائج</div>
                </div>
                <div class="selected-user-pill fade-in" *ngIf="selectedUser">
                  <div class="avatar-sm">{{ selectedUser.fullName?.charAt(0) }}</div>
                  <span>{{ selectedUser.fullName }}</span>
                  <button (click)="selectedUser = null" class="remove-btn">✕</button>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label>عنوان التنبيه</label>
              <input 
                type="text" 
                [(ngModel)]="title" 
                placeholder="مثال: خصم خاص 20% لفترة محدودة"
                class="glass-input big-input"
              >
            </div>

            <div class="form-group">
              <label>نص الرسالة</label>
              <textarea 
                [(ngModel)]="body" 
                placeholder="اكتب تفاصيل التنبيه هنا..."
                rows="4"
                class="glass-input resize-none"
              ></textarea>
            </div>

            <button 
              (click)="send()" 
              [disabled]="loading || !title || !body || (targetType === 'specific' && !selectedUser)"
              class="btn-send-premium"
            >
              <div class="btn-content" *ngIf="!loading">
                <span>أرسل الآن</span>
                <svg viewBox="0 0 24 24" fill="none" class="send-icon">
                  <path d="M22 2L11 13M22 2L15 22L11 13M11 13L2 9L22 2" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                </svg>
              </div>
              <span *ngIf="loading" class="spinner"></span>
            </button>
          </div>
        </div>

        <!-- Preview Column -->
        <div class="preview-column">
          <div class="card-header mb-4">
            <span class="step-badge secondary">2</span>
            <h3>معاينة حية</h3>
          </div>
          
          <div class="preview-stack">
            <!-- Mobile Preview -->
            <div class="device-preview mobile shadow-2xl">
              <div class="screen">
                <div class="status-bar">
                  <span>9:41</span>
                  <div class="icons">📶 🔋</div>
                </div>
                <div class="notification-bubble fade-in">
                  <div class="n-header">
                    <div class="n-icon">🍎</div>
                    <span class="n-app">بقالتي</span>
                    <span class="n-time">الآن</span>
                  </div>
                  <div class="n-content" *ngIf="title || body; else placeholder">
                    <div class="n-title">{{ title }}</div>
                    <div class="n-body">{{ body }}</div>
                  </div>
                  <ng-template #placeholder>
                    <div class="n-placeholder">أدخل بيانات الإشعار لرؤية المعاينة...</div>
                  </ng-template>
                </div>
              </div>
            </div>

            <!-- Desktop View -->
            <div class="device-preview desktop shadow-xl" *ngIf="title || body">
              <div class="d-bubble">
                <div class="d-icon">🔔</div>
                <div class="d-text">
                  <span class="d-title">{{ title }}</span>
                  <p class="d-body">{{ body }}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .notification-container { padding: 2rem; max-width: 1400px; margin: 0 auto; direction: rtl; }
    .header { margin-bottom: 3rem; text-align: right; }
    .title-section h2 { font-size: 2.5rem; font-weight: 900; background: linear-gradient(135deg, var(--primary-color), var(--secondary-color)); -webkit-background-clip: text; -webkit-text-fill-color: transparent; margin-bottom: 0.5rem; }
    .subtitle { color: var(--text-muted); font-size: 1.1rem; }

    .main-grid { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 3rem; align-items: start; }

    .glass-card { background: var(--glass-bg); backdrop-filter: blur(20px); border: 1px solid var(--glass-border); border-radius: 32px; padding: 2.5rem; box-shadow: var(--glass-shadow); position: relative; overflow: visible; }
    
    .card-header { display: flex; align-items: center; gap: 1rem; margin-bottom: 2rem; }
    .step-badge { width: 32px; height: 32px; border-radius: 50%; background: var(--primary-color); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 800; font-size: 0.9rem; }
    .step-badge.secondary { background: var(--secondary-color); }
    .card-header h3 { font-size: 1.4rem; font-weight: 800; color: var(--text-main); margin: 0; }

    .target-toggle { display: grid; grid-template-columns: 1fr 1fr; gap: 1rem; background: var(--surface-soft); padding: 0.5rem; border-radius: 18px; margin-bottom: 2rem; }
    .target-toggle button { border: none; padding: 0.8rem; border-radius: 14px; font-weight: 700; color: var(--text-muted); background: transparent; cursor: pointer; transition: 0.3s; display: flex; align-items: center; justify-content: center; gap: 0.5rem; }
    .target-toggle button.active { background: #fff; color: var(--primary-color); box-shadow: 0 4px 12px rgba(0,0,0,0.05); }

    .form-group { margin-bottom: 1.8rem; }
    .form-group label { display: block; margin-bottom: 0.8rem; font-weight: 700; color: var(--text-secondary); font-size: 0.95rem; }
    
    .glass-input { width: 100%; background: var(--surface-soft); border: 2px solid transparent; border-radius: 16px; padding: 1.1rem; color: var(--text-main); font-size: 1rem; transition: 0.3s; box-shadow: inset 0 2px 4px rgba(0,0,0,0.02); }
    .glass-input:focus { border-color: var(--primary-color); background: #fff; box-shadow: 0 0 0 4px rgba(var(--primary-rgb), 0.1); outline: none; }
    .big-input { font-size: 1.2rem; font-weight: 700; }

    .searchable-select { position: relative; }
    .user-dropdown { position: absolute; top: calc(100% + 10px); left: 0; right: 0; background: #fff; border-radius: 20px; border: 1px solid var(--glass-border); max-height: 250px; overflow-y: auto; z-index: 100; box-shadow: 0 20px 50px rgba(0,0,0,0.1); padding: 0.5rem; }
    .user-item { display: flex; align-items: center; gap: 1rem; padding: 0.8rem 1rem; border-radius: 12px; cursor: pointer; transition: 0.2s; }
    .user-item:hover { background: var(--surface-soft); }
    .user-item .avatar { width: 36px; height: 36px; background: var(--surface-soft-hover); color: var(--primary-color); }
    .u-info { display: flex; flex-direction: column; }
    .u-name { font-weight: 700; font-size: 0.9rem; }
    .u-handle { font-size: 0.75rem; color: var(--text-muted); }
    .no-results { padding: 1.5rem; text-align: center; color: var(--text-muted); }

    .selected-user-pill { display: flex; align-items: center; gap: 0.8rem; background: var(--primary-color); color: #fff; padding: 0.4rem 1rem; border-radius: 40px; width: fit-content; margin-top: 0.8rem; box-shadow: 0 8px 20px rgba(var(--primary-rgb), 0.2); }
    .avatar-sm { width: 24px; height: 24px; background: rgba(255,255,255,0.2); border-radius: 50%; font-size: 0.7rem; display: flex; align-items: center; justify-content: center; font-weight: 800; }
    .remove-btn { background: none; border: none; color: #fff; cursor: pointer; font-size: 0.9rem; padding: 0 0.2rem; }

    .btn-send-premium { width: 100%; background: linear-gradient(135deg, var(--primary-color), var(--primary-color-dark)); color: #fff; border: none; padding: 1.25rem; border-radius: 20px; cursor: pointer; position: relative; overflow: hidden; box-shadow: 0 12px 24px rgba(var(--primary-rgb), 0.2); transition: 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
    .btn-send-premium:hover:not(:disabled) { transform: translateY(-4px); box-shadow: 0 20px 35px rgba(var(--primary-rgb), 0.3); }
    .btn-send-premium:disabled { opacity: 0.5; cursor: not-allowed; }
    .btn-content { display: flex; align-items: center; justify-content: center; gap: 1rem; font-size: 1.15rem; font-weight: 800; }
    .send-icon { width: 22px; height: 22px; }

    .preview-stack { position: sticky; top: 2rem; display: flex; flex-direction: column; gap: 2rem; align-items: center; }
    .device-preview.mobile { width: 300px; height: 600px; background: #000; border: 8px solid #1a1a1a; border-radius: 48px; position: relative; overflow: hidden; }
    .screen { height: 100%; background: linear-gradient(180deg, #2c3e50, #000); padding: 1rem; }
    .status-bar { display: flex; justify-content: space-between; color: #fff; font-size: 0.7rem; font-weight: bold; margin-bottom: 2rem; }
    
    .notification-bubble { background: rgba(255, 255, 255, 0.85); backdrop-filter: blur(15px); border-radius: 22px; padding: 1.2rem; margin-top: 1rem; box-shadow: 0 4px 30px rgba(0,0,0,0.1); }
    .n-header { display: flex; align-items: center; gap: 0.6rem; margin-bottom: 0.5rem; }
    .n-icon { width: 20px; height: 20px; border-radius: 6px; background: #fff; display: flex; align-items: center; justify-content: center; font-size: 0.8rem; box-shadow: 0 2px 4px rgba(0,0,0,0.05); }
    .n-app { font-size: 0.75rem; font-weight: 700; color: #333; }
    .n-time { font-size: 0.65rem; color: #666; margin-right: auto; }
    .n-title { font-weight: 800; font-size: 0.95rem; color: #000; margin-bottom: 0.2rem; }
    .n-body { font-size: 0.85rem; color: #333; line-height: 1.3; }
    .n-placeholder { font-size: 0.8rem; color: #888; text-align: center; font-style: italic; padding: 1rem 0; }

    .device-preview.desktop { width: 340px; background: rgba(0,0,0,0.75); backdrop-filter: blur(10px); border-radius: 14px; padding: 1rem; border: 1px solid rgba(255,255,255,0.1); }
    .d-bubble { display: flex; gap: 1rem; align-items: center; }
    .d-icon { font-size: 1.5rem; }
    .d-text { display: flex; flex-direction: column; gap: 0.1rem; }
    .d-title { color: #fff; font-weight: 700; font-size: 0.9rem; }
    .d-body { color: rgba(255,255,255,0.8); font-size: 0.85rem; margin: 0; }

    .spinner { border: 3px solid rgba(255,255,255,0.3); border-radius: 50%; border-top: 3px solid #fff; width: 24px; height: 24px; animation: spin 1s linear infinite; }
    @keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }

    @media (max-width: 1024px) {
      .main-grid { grid-template-columns: 1fr; gap: 4rem; }
      .notification-container { padding: 1rem; }
      .preview-stack { position: static; }
    }
  `]
})
export class BroadcastNotificationComponent implements OnInit {
  title: string = '';
  body: string = '';
  loading: boolean = false;

  targetType: 'all' | 'specific' = 'all';
  userSearch: string = '';
  allUsers: any[] = [];
  selectedUser: any = null;

  constructor(
    private notificationService: NotificationService,
    private api: ApiService,
    private toast: ToastService
  ) { }

  ngOnInit() {
    this.loadUsers();
  }

  loadUsers() {
    this.api.getAdminUsers().subscribe({
      next: (data) => this.allUsers = data || [],
      error: () => this.toast.error('فشل تحميل قائمة المستخدمين')
    });
  }

  get filteredUsers() {
    if (!this.userSearch || this.selectedUser) return [];
    const search = this.userSearch.toLowerCase();
    return this.allUsers.filter(u =>
      u.fullName?.toLowerCase().includes(search) ||
      u.username?.toLowerCase().includes(search)
    ).slice(0, 5);
  }

  selectUser(user: any) {
    this.selectedUser = user;
    this.userSearch = '';
  }

  send() {
    this.loading = true;

    const stream = this.targetType === 'all'
      ? this.notificationService.broadcastNotification(this.title, this.body)
      : this.notificationService.sendToSpecificUser(this.selectedUser.id, this.title, this.body);

    stream.subscribe({
      next: () => {
        this.loading = false;
        this.toast.success('🚀 تم إرسال التنبيه بنجاح');
        this.title = '';
        this.body = '';
        this.selectedUser = null;
      },
      error: (err) => {
        this.loading = false;
        this.toast.error(err.message || 'فشل إرسال التنبيه');
      }
    });
  }
}
