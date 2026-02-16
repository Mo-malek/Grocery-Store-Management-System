import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
    selector: 'app-login',
    standalone: true,
    imports: [CommonModule, FormsModule],
    template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo">🏨</div>
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
          <p>© 2026 نظام إدارة البقالة الذكي</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .login-page {
      height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
    }

    .login-card {
      background: rgba(255, 255, 255, 0.05);
      backdrop-filter: blur(10px);
      padding: 2.5rem;
      border-radius: 1rem;
      width: 100%;
      max-width: 400px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
    }

    .login-header {
      text-align: center;
      margin-bottom: 2rem;
    }

    .logo {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }

    .login-header h1 {
      font-size: 1.5rem;
      color: white;
      margin-bottom: 0.25rem;
    }

    .login-header p {
      color: #94a3b8;
      font-size: 0.9rem;
    }

    .form-group {
      margin-bottom: 1.5rem;
    }

    .form-group label {
      display: block;
      margin-bottom: 0.5rem;
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .form-control {
      width: 100%;
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.1);
      border-radius: 0.5rem;
      color: white;
      transition: all 0.3s;
    }

    .form-control:focus {
      outline: none;
      border-color: #3b82f6;
      box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.2);
    }

    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-weight: 600;
    }

    .login-footer {
      margin-top: 2rem;
      text-align: center;
      color: #64748b;
      font-size: 0.8rem;
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
                error: (err) => {
                    this.toast.error('خطأ في اسم المستخدم أو كلمة المرور');
                    this.isLoading = false;
                }
            });
    }
}
