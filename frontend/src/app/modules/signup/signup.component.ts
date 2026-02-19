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
          <div class="logo">👤</div>
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
              placeholder="Username" 
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
              placeholder="Password" 
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
      margin-bottom: 1rem;
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

    .form-control.is-invalid {
      border-color: #ef4444;
    }

    .error-text {
      color: #ef4444;
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
      color: #cbd5e1;
      font-size: 0.9rem;
    }

    .login-footer a {
      color: #3b82f6;
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
