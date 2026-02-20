import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CategoryCount } from '../../core/models/models';

@Component({
  selector: 'app-storefront-categories',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="categories-page container fade-in">
      <header class="page-header slide-up">
        <div class="title-area">
          <p class="eyebrow">Explore all departments</p>
          <h1>Shop by Category</h1>
        </div>
        <div class="count-badge">{{ categories.length }} categories</div>
      </header>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading categories...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <div class="category-grid staggered-group" *ngIf="!isLoading && !loadError && categories.length; else empty">
        <article class="category-card glass-card slide-up" *ngFor="let c of categories; let i = index"
                 [style.animation-delay]="i * 0.04 + 's'" (click)="goToCategory(c.category)">
          <div class="card-icon" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <path d="M4 7H10L12 9H20V18.5H4V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
            </svg>
          </div>
          <div class="card-content">
            <h3>{{ c.category || 'General' }}</h3>
            <p class="count">{{ c.count }} products</p>
          </div>
          <span class="arrow" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <path d="M8 6L14 12L8 18" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
            </svg>
          </span>
        </article>
      </div>

      <ng-template #empty>
        <div class="empty-state" *ngIf="!isLoading && !loadError">
          <h2>No categories found</h2>
          <p>Categories will appear here after products are added.</p>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .categories-page { padding: 3rem 1rem; min-height: 80vh; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .eyebrow { color: var(--primary-color); font-weight: 800; letter-spacing: 1px; margin-bottom: 0.4rem; font-size: 0.85rem; }
    .page-header h1 { font-size: 2.2rem; font-weight: 900; margin: 0; }
    .count-badge { background: var(--surface-soft); border: 1px solid var(--glass-border); padding: 0.5rem 1.25rem; border-radius: 50px; color: var(--text-muted); font-weight: 600; }

    .loading-state {
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.7rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 34px;
      height: 34px;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      border-radius: 50%;
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state {
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      font-weight: 600;
      text-align: center;
      margin-bottom: 1rem;
    }

    .category-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1rem; }

    .category-card { padding: 1.1rem 1.2rem; display: flex; align-items: center; gap: 1rem; cursor: pointer; transition: 0.25s ease; border: 1px solid var(--glass-border); }
    .category-card:hover { transform: translateY(-2px); border-color: var(--primary-color); background: var(--surface-soft-hover); }

    .card-icon { width: 46px; height: 46px; background: rgba(var(--primary-rgb), 0.1); border-radius: 12px; display: flex; align-items: center; justify-content: center; color: var(--primary-color); flex-shrink: 0; }
    .icon-svg { width: 18px; height: 18px; display: block; }

    .card-content { flex: 1; min-width: 0; }
    .card-content h3 { margin: 0; font-size: 1.02rem; font-weight: 800; }
    .card-content .count { margin: 0.2rem 0 0; color: var(--text-muted); font-size: 0.84rem; font-weight: 600; }

    .arrow { color: var(--text-muted); display: inline-flex; }
    .category-card:hover .arrow { color: var(--primary-color); }

    .empty-state {
      border: 1px dashed var(--border-color);
      border-radius: 14px;
      background: var(--surface-soft);
      text-align: center;
      padding: 2rem 1rem;
      color: var(--text-secondary);
    }
    .empty-state h2 { margin: 0 0 0.45rem; color: var(--text-main); font-size: 1.3rem; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 0.8rem; }
      .page-header h1 { font-size: 1.9rem; }
      .category-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StorefrontCategoriesComponent implements OnInit {
  categories: CategoryCount[] = [];
  isLoading = false;
  loadError = '';

  constructor(private api: ApiService, private router: Router) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.api.getStorefrontCategoriesCount().subscribe({
      next: data => {
        this.categories = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.categories = [];
        this.isLoading = false;
        this.loadError = 'Failed to load categories.';
      }
    });
  }

  goToCategory(cat: string | null) {
    const c = cat || '';
    this.router.navigate(['/shop/catalog'], { queryParams: { category: c } });
  }
}
