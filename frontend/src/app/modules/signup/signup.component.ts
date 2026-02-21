import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, RouterModule } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { RegisterRequest } from '../../core/models/models';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <div class="login-page">
      <div class="login-card">
        <div class="login-header">
          <div class="logo" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <circle cx="12" cy="8.2" r="3.2" stroke="currentColor" stroke-width="1.8"></circle>
              <path d="M5.5 19.2C5.5 15.9 8.2 14 11.5 14H12.5C15.8 14 18.5 15.9 18.5 19.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </div>
          <h1>إنشاء حساب جديد</h1>
          <p>سجل حسابك ككاشير للبدء</p>
        </div>

        <form (ngSubmit)="onSubmit()" #signupForm="ngForm">
          <div class="form-group">
            <label>الاسم الكامل</label>
            <input 
              type="text" 
              name="fullName" 
              [(ngModel)]="fullName" 
              #fullNameModel="ngModel"
              placeholder="الاسم الثلاثي" 
              required
              class="form-control"
              [class.is-invalid]="fullNameModel.invalid && fullNameModel.touched"
            >
            <div *ngIf="fullNameModel.invalid && fullNameModel.touched" class="error-text">يجب إدخال الاسم الكامل</div>
          </div>

          <div class="form-group">
            <label>اسم المستخدم</label>
            <input 
              type="text" 
              name="username" 
              [(ngModel)]="username" 
              #usernameModel="ngModel"
              placeholder="اسم المستخدم" 
              required
              minlength="3"
              class="form-control"
              [class.is-invalid]="usernameModel.invalid && usernameModel.touched"
            >
            <div *ngIf="usernameModel.invalid && usernameModel.touched" class="error-text">
               {{ usernameModel.errors?.['required'] ? 'اسم المستخدم مطلوب' : 'الاسم يجب أن يكون 3 أحرف على الأقل' }}
            </div>
          </div>

          <div class="form-group">
            <label>كلمة المرور</label>
            <input 
              type="password" 
              name="password" 
              [(ngModel)]="password" 
              #passwordModel="ngModel"
              placeholder="كلمة المرور" 
              required
              minlength="6"
              class="form-control"
              [class.is-invalid]="passwordModel.invalid && passwordModel.touched"
            >
            <div *ngIf="passwordModel.invalid && passwordModel.touched" class="error-text">
               {{ passwordModel.errors?.['required'] ? 'كلمة المرور مطلوبة' : 'كلمة المرور يجب أن لا تقل عن 6 أحرف' }}
            </div>
          </div>

          <button 
            type="submit" 
            class="btn btn-primary btn-block" 
            [disabled]="isLoading || signupForm.invalid"
          >
            {{ isLoading ? 'جاري إنشاء الحساب...' : 'إنشاء الحساب' }}
          </button>
        </form>

        <div class="login-footer">
          <p>هل لديك حساب بالفعل؟ <a routerLink="/login">سجل دخولك هنا</a></p>
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
      margin-bottom: 1rem;
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

    .form-control.is-invalid {
      border-color: var(--danger-color);
    }

    .error-text {
      color: var(--danger-color);
      font-size: 0.75rem;
      margin-top: 0.25rem;
    }

    .btn-block {
      width: 100%;
      padding: 0.75rem;
      font-weight: 600;
      margin-top: 1rem;
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
export class SignupComponent {
  fullName = '';
  username = '';
  password = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private router: Router,
    private toast: ToastService
  ) { }

  onSubmit() {
    this.isLoading = true;
    const request: RegisterRequest = {
      fullName: this.fullName,
      username: this.username,
      password: this.password
    };

    this.authService.register(request).subscribe({
      next: () => {
        this.toast.success('تم إنشاء الحساب بنجاح. يمكنك الآن تسجيل الدخول.');
        this.router.navigate(['/login']);
        this.isLoading = false;
      },
      error: (err) => {
        const message = err.error || 'حدث خطأ أثناء إنشاء الحساب';
        this.toast.error(message);
        this.isLoading = false;
      }
    });
  }
}
