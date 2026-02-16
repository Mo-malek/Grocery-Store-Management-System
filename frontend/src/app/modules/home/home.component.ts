import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { DashboardStats } from '../../core/models/models';
import { OnInit } from '@angular/core';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <div class="home-container">
      <div class="hero-section">
        <div class="hero-content">
          <h1>مرحباً بك في نظام بقالتي 👋</h1>
          <p>نظام إدارة ذكي ومتكامل لمتجرك</p>
          
          <div class="action-buttons">
            <button class="btn-primary" routerLink="/pos">
              <span class="icon">💻</span>
              ابدأ البيع
            </button>
            <button class="btn-secondary" routerLink="/dashboard">
              <span class="icon">📊</span>
              تقارير اليوم
            </button>
          </div>
        </div>
        <div class="hero-stats">
          <div class="stat-card">
            <div class="icon-circle sale">💰</div>
            <div class="stat-info">
              <span class="label">مبيعات اليوم</span>
              <span class="value" *ngIf="!isLoading">{{ stats?.totalSalesToday | number:'1.2-2' }} ج.م</span>
              <span class="value" *ngIf="isLoading">جاري التحميل...</span>
            </div>
          </div>
          <div class="stat-card">
            <div class="icon-circle stock">📦</div>
            <div class="stat-info">
              <span class="label">إدارة المخزون</span>
              <span class="link" routerLink="/inventory">عرض المنتجات ➜</span>
            </div>
          </div>
        </div>
      </div>

      <div class="features-grid">
        <div class="feature-card" routerLink="/pos">
          <div class="feature-icon">🛒</div>
          <h3>نقطة البيع</h3>
          <p>واجهة بيع سريعة وسهلة الاستخدام</p>
        </div>
        
        <div class="feature-card" routerLink="/inventory">
          <div class="feature-icon">📋</div>
          <h3>المخزون</h3>
          <p>تتبع الكميات والتنبيهات</p>
        </div>
        
        <div class="feature-card" routerLink="/customers">
          <div class="feature-icon">👥</div>
          <h3>العملاء</h3>
          <p>إدارة بيانات العملاء والولاء</p>
        </div>

        <div class="feature-card disabled">
          <div class="feature-icon">⚙️</div>
          <h3>الإعدادات</h3>
          <p>قريباً</p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .home-container {
      max-width: 1200px;
      margin: 0 auto;
      animation: fadeIn 0.5s ease-out;
    }

    .hero-section {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      border-radius: var(--radius-lg);
      padding: 3rem;
      color: white;
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 3rem;
      box-shadow: 0 10px 30px rgba(37, 99, 235, 0.2);
      position: relative;
      overflow: hidden;
    }

    .hero-section::before {
      content: '';
      position: absolute;
      top: -50%;
      right: -20%;
      width: 500px;
      height: 500px;
      background: rgba(255, 255, 255, 0.1);
      border-radius: 50%;
    }

    .hero-content h1 {
      font-size: 2.5rem;
      margin-bottom: 1rem;
      font-weight: 800;
    }

    .hero-content p {
      font-size: 1.2rem;
      margin-bottom: 2rem;
      opacity: 0.9;
    }

    .action-buttons {
      display: flex;
      gap: 1rem;
    }

    .btn-primary, .btn-secondary {
      padding: 0.75rem 1.5rem;
      border-radius: 50px;
      font-weight: bold;
      border: none;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: transform 0.2s, box-shadow 0.2s;
    }

    .btn-primary {
      background: white;
      color: var(--primary-color);
      box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    }

    .btn-secondary {
      background: rgba(255, 255, 255, 0.2);
      color: white;
      backdrop-filter: blur(5px);
    }

    .btn-primary:hover, .btn-secondary:hover {
      transform: translateY(-2px);
      box-shadow: 0 6px 20px rgba(0,0,0,0.15);
    }

    .hero-stats {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      z-index: 1;
    }

    .stat-card {
      background: rgba(255, 255, 255, 0.15);
      backdrop-filter: blur(10px);
      padding: 1rem;
      border-radius: var(--radius-md);
      display: flex;
      align-items: center;
      gap: 1rem;
      min-width: 250px;
      border: 1px solid rgba(255,255,255,0.2);
    }

    .icon-circle {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.2rem;
    }

    .icon-circle.sale { background: rgba(16, 185, 129, 0.2); color: #D1FAE5; }
    .icon-circle.stock { background: rgba(59, 130, 246, 0.2); color: #DBEAFE; }

    .stat-info {
      display: flex;
      flex-direction: column;
    }

    .stat-info .label { font-size: 0.8rem; opacity: 0.8; }
    .stat-info .value { font-weight: bold; font-size: 1.1rem; }
    .stat-info .link { font-size: 0.8rem; color: white; cursor: pointer; text-decoration: underline; }

    .features-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
      gap: 2rem;
    }

    .feature-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 2rem;
      border-radius: var(--radius-lg);
      text-align: center;
      transition: all 0.3s;
      cursor: pointer;
    }

    .feature-card:hover:not(.disabled) {
      transform: translateY(-5px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-md);
    }

    .feature-card.disabled {
      opacity: 0.6;
      cursor: not-allowed;
    }

    .feature-icon {
      font-size: 3rem;
      margin-bottom: 1rem;
      background: var(--bg-input);
      width: 80px;
      height: 80px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: auto;
      margin-right: auto;
    }

    .feature-card h3 {
      margin-bottom: 0.5rem;
      color: var(--text-main);
    }

    .feature-card p {
      color: var(--text-muted);
      font-size: 0.9rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(20px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .hero-section {
        flex-direction: column;
        text-align: center;
        padding: 2rem;
      }

      .hero-content {
        margin-bottom: 2rem;
      }

      .action-buttons {
        justify-content: center;
      }
    }
  `]
})
export class HomeComponent implements OnInit {
  stats: DashboardStats | null = null;
  isLoading = true;

  constructor(private api: ApiService) { }

  ngOnInit() {
    this.api.getDashboardStats().subscribe({
      next: (data) => {
        this.stats = data;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Failed to load stats', err);
        this.isLoading = false;
      }
    });
  }
}
