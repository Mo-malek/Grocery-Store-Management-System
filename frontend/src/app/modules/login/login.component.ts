import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <path d="M4 21V6C4 4.9 4.9 4 6 4H18C19.1 4 20 4.9 20 6V21" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
              <path d="M9 21V16H15V21M8 8H8.01M12 8H12.01M16 8H16.01M8 11.5H8.01M12 11.5H12.01M16 11.5H16.01" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </div>
          <h1>بقالة السعادة</h1>
          <p>نظام إدارة المبيعات والمخزون</p>
        </div>

        <form (ngSubmit)="onSubmit()" #loginForm="ngForm">
          <div class="form-group">
            <label>اسم المستخدم</label>
            <input 
              type="text" 
              name="username" 
              [(ngModel)]="username" 
              placeholder="Username" 
              required
              class="form-control"
            >
          </div>

          <div class="form-group">
            <label>كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              placeholder="Password" 
              required
              class="form-control"
            >
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="isLoading || !loginForm.form.valid"
          >
            {{ isLoading ? 'جاري تسجيل الدخول...' : 'تسجيل الدخول' }}
          </button>
        </form>

        <div class="login-footer">
          <p>ليس لديك حساب؟ <a routerLink="/signup">أنشئ حساباً جديداً هنا</a></p>
          <p>© 2026 نظام إدارة البقالة الذكي</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .login-page {
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: var(--bg-main);
      background-image: var(--bg-gradient);
      padding: 1rem;
    }

    .login-card {
      background: var(--glass-bg);
      backdrop-filter: var(--glass-blur);
      padding: 2.5rem;
      border-radius: 1rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid var(--glass-border);
      box-shadow: var(--shadow-lg);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      width: 66px;
      height: 66px;
      margin: 0 auto 0.5rem;
      border-radius: 18px;
      background: rgba(var(--primary-rgb), 0.14);
      border: 1px solid rgba(var(--primary-rgb), 0.28);
      color: var(--primary-color);
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .icon-svg {
      width: 34px;
      height: 34px;
    }

    .login-header h1 {
      font-size: 1.5rem;
      color: var(--text-main);
      margin-bottom: 0.25rem;
    }

    .login-header p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      border-radius: 0.5rem;
      color: var(--text-main);
      transition: all 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: var(--primary-color);
      box-shadow: 0 0 0 2px rgba(var(--primary-rgb), 0.2);
    }

    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-weight: 600;
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }

    .login-footer a {
      color: var(--primary-color);
      text-decoration: none;
      font-weight: bold;
    }

    .login-footer a:hover {
      text-decoration: underline;
    }
  `]
})
export class LoginComponent {
  username = '';
  password = '';
  isLoading = false;
  returnUrl = '/';

  constructor(
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService
  ) {
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/']);
    }
  }

  ngOnInit() {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/';
  }

  onSubmit() {
    this.isLoading = true;
    this.authService.login({ username: this.username, password: this.password })
      .subscribe({
        next: () => {
          this.router.navigate([this.returnUrl]);
          this.toast.success('مرحباً بك مجدداً!');
          this.isLoading = false;
        },
        error: () => {
          this.toast.error('خطأ في اسم المستخدم أو كلمة المرور');
          this.isLoading = false;
        }
      });
  }
}
