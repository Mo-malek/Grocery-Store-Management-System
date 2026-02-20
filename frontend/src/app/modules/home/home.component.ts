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
    <section class="home-shell">
      <article class="hero">
        <div class="hero-content">
          <span class="eyebrow">Internal Operations</span>
          <h1>مرحبًا بك في مركز تشغيل المتجر</h1>
          <p>
            واجهة موحدة لإدارة المبيعات والمخزون والطلبات بسرعة عالية
            وبنمط واضح في الوضعين النهاري والليلي.
          </p>
          <div class="action-buttons">
            <a class="btn btn-primary" routerLink="/pos">فتح نقطة البيع</a>
            <a class="btn btn-secondary" routerLink="/dashboard">عرض لوحة الأداء</a>
          </div>
        </div>

        <div class="hero-stats">
          <article class="stat-card">
            <span class="stat-label">مبيعات اليوم</span>
            <strong class="stat-value" *ngIf="!isLoading">{{ stats?.totalSalesToday | number:'1.2-2' }} ج.م</strong>
            <strong class="stat-value muted" *ngIf="isLoading">جاري التحميل...</strong>
            <small class="stat-meta">عدد العمليات: {{ stats?.transactionCountToday || 0 }}</small>
          </article>

          <article class="stat-card">
            <span class="stat-label">متوسط سلة الشراء</span>
            <strong class="stat-value">{{ stats?.averageBasketSize || 0 | number:'1.2-2' }} ج.م</strong>
            <small class="stat-meta">الربح اليومي: {{ stats?.estimatedProfitToday || 0 | number:'1.0-0' }} ج.م</small>
          </article>

          <article class="stat-card warning">
            <span class="stat-label">تنبيهات المخزون</span>
            <strong class="stat-value">{{ stats?.lowStockCount || 0 }}</strong>
            <small class="stat-meta">منتجات أقل من الحد الأدنى</small>
          </article>
        </div>
      </article>

      <section class="quick-grid">
        <a class="quick-card" routerLink="/pos">
          <span class="card-title">نقطة البيع</span>
          <p>تنفيذ البيع بسرعة، مسح المنتجات، وطباعة الفاتورة.</p>
        </a>

        <a class="quick-card" routerLink="/inventory">
          <span class="card-title">إدارة المخزون</span>
          <p>متابعة الكميات، المنتجات منخفضة المخزون، وتواريخ الانتهاء.</p>
        </a>

        <a class="quick-card" routerLink="/customers">
          <span class="card-title">إدارة العملاء</span>
          <p>ملفات العملاء، سجل الزيارات، ونقاط الولاء.</p>
        </a>

        <a class="quick-card" routerLink="/history">
          <span class="card-title">سجل المبيعات</span>
          <p>تتبع العمليات اليومية ومراجعة الأداء حسب الفترة.</p>
        </a>
      </section>
    </section>
  `,
  styles: [`
    .home-shell {
      max-width: 1480px;
      margin: 0 auto;
      display: flex;
      flex-direction: column;
      gap: var(--space-3);
    }

    .hero {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: clamp(1.2rem, 2vw, 1.8rem);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: var(--space-3);
      box-shadow: var(--shadow-sm);
      position: relative;
      overflow: hidden;
    }

    .hero::before {
      content: '';
      position: absolute;
      top: -80px;
      left: -80px;
      width: 260px;
      height: 260px;
      background: rgba(var(--primary-rgb), 0.07);
      border-radius: 50%;
      pointer-events: none;
    }

    .hero-content {
      flex: 1;
      min-width: 0;
      position: relative;
      z-index: 1;
    }

    .eyebrow {
      display: inline-flex;
      align-items: center;
      min-height: 28px;
      padding: 0 0.75rem;
      border-radius: 999px;
      border: 1px solid rgba(var(--primary-rgb), 0.26);
      background: rgba(var(--primary-rgb), 0.08);
      color: var(--primary-color);
      font-size: 0.78rem;
      font-weight: 700;
      margin-bottom: 0.65rem;
    }

    .hero-content h1 {
      font-size: clamp(1.5rem, 2.4vw, 2.1rem);
      margin: 0;
      font-weight: 800;
      color: var(--text-main);
    }

    .hero-content p {
      font-size: 0.98rem;
      line-height: 1.7;
      margin: 0.75rem 0 1.35rem;
      color: var(--text-secondary);
      max-width: 640px;
    }

    .action-buttons {
      display: flex;
      gap: 0.65rem;
      flex-wrap: wrap;
    }

    .hero-stats {
      width: min(380px, 100%);
      display: grid;
      gap: 0.75rem;
      position: relative;
      z-index: 1;
    }

    .stat-card {
      background: var(--surface-soft);
      padding: 0.85rem 0.9rem;
      border-radius: var(--radius-md);
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
      border: 1px solid var(--border-color);
    }

    .stat-card.warning {
      border-color: rgba(217, 119, 6, 0.35);
      background: var(--warning-soft);
    }

    .stat-label {
      color: var(--text-muted);
      font-size: 0.76rem;
      font-weight: 700;
    }

    .stat-value {
      font-size: 1.2rem;
      color: var(--text-main);
      line-height: 1.15;
    }

    .stat-value.muted {
      font-size: 1rem;
      color: var(--text-muted);
    }

    .stat-meta {
      color: var(--text-secondary);
      font-size: 0.8rem;
      margin-top: 0.12rem;
    }

    .quick-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
      gap: var(--space-2);
    }

    .quick-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: var(--space-2);
      border-radius: var(--radius-lg);
      text-decoration: none;
      transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
      box-shadow: var(--shadow-xs);
      min-height: 150px;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .quick-card:hover {
      transform: translateY(-2px);
      border-color: var(--primary-color);
      box-shadow: var(--shadow-sm);
    }

    .card-title {
      color: var(--text-main);
      font-size: 1rem;
      font-weight: 800;
      line-height: 1.3;
    }

    .quick-card p {
      margin: 0;
      color: var(--text-secondary);
      font-size: 0.88rem;
      line-height: 1.6;
    }

    @media (max-width: 1080px) {
      .hero {
        flex-direction: column;
      }

      .hero-stats {
        width: 100%;
      }
    }

    @media (max-width: 768px) {
      .home-shell {
        gap: var(--space-2);
      }

      .hero {
        padding: var(--space-2);
      }

      .action-buttons .btn {
        width: 100%;
      }

      .quick-grid {
        grid-template-columns: 1fr;
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
      error: () => {
        this.isLoading = false;
      }
    });
  }
}
