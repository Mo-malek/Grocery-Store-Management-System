import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { StorefrontProduct, Page } from '../../core/models/models';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';
import { resolveImageUrl } from '../../core/utils/image-url.util';

@Component({
  selector: 'app-storefront-search',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="search-page container fade-in">
      <header class="page-header slide-up">
        <div class="search-box glass-box">
          <span class="search-icon" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
              <path d="M20 20L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </span>
          <input [(ngModel)]="q" (input)="reloadDebounced()" placeholder="ابحث عن المنتجات والأقسام والعلامات التجارية..." />
        </div>
        <div class="results-meta fade-in" *ngIf="q">
          نتائج البحث عن "<strong>{{ q }}</strong>": {{ page?.totalElements || 0 }} منتج
        </div>
      </header>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>جاري البحث عن المنتجات...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <div class="search-results staggered-group" *ngIf="!isLoading && !loadError">
        <article class="search-card glass-card slide-up" *ngFor="let p of products; let i = index"
                 [style.animation-delay]="i * 0.05 + 's'">
          <div class="card-visual">
            <img [src]="getImageUrl(p.imageUrl)" alt="">
            <span class="offer-badge" *ngIf="(p.discountPercentage ?? 0) > 0">{{ p.discountPercentage | number:'1.0-2' }}% خصم</span>
            <span class="stock-badge" *ngIf="p.lowStock">كمية منخفضة</span>
          </div>

          <div class="card-info">
            <div class="category-chip">{{ p.category || 'عام' }}</div>
            <h3>{{ p.name }}</h3>
            <div class="price-row">
              <span class="price">{{ p.price | number:'1.2-2' }} <small>ج.م</small></span>
              <span class="old-price" *ngIf="(p.discountPercentage ?? 0) > 0 && (p.discountPercentage ?? 0) < 100">{{ (p.price / (1 - ((p.discountPercentage ?? 0) / 100))) | number:'1.2-2' }} ج.م</span>
              <span class="unit">/ {{ p.unit || 'وحدة' }}</span>
            </div>
          </div>

          <div class="card-actions">
            <a class="btn-secondary" [routerLink]="['/shop/product', p.id]">التفاصيل</a>
            <button class="btn-primary" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
          </div>
        </article>
      </div>

      <div class="empty-results fade-in" *ngIf="!isLoading && !loadError && products.length === 0 && q">
        <div class="empty-icon" aria-hidden="true">
          <svg class="icon-svg big" viewBox="0 0 24 24" fill="none">
            <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
            <path d="M20 20L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
          </svg>
        </div>
        <h2>لا توجد منتجات</h2>
        <p>جرّب كلمة بحث أخرى أو تصفح الأقسام.</p>
        <a routerLink="/shop/catalog" class="btn-primary">تصفح المنتجات</a>
      </div>
    </section>
  `,
  styles: [`
    .search-page { padding: 4rem 1rem; min-height: 80vh; }

    .page-header { margin-bottom: 2rem; max-width: 800px; margin-left: auto; margin-right: auto; text-align: center; }
    .search-box { display: flex; align-items: center; gap: 1rem; padding: 0.5rem 1.25rem; border-radius: 50px; border: 2px solid var(--glass-border); transition: 0.3s; }
    .search-box:focus-within { border-color: var(--primary-color); box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.2); }
    .search-icon { color: var(--text-muted); display: inline-flex; }
    .icon-svg { width: 18px; height: 18px; display: block; }
    .icon-svg.big { width: 56px; height: 56px; }
    .search-box input { flex: 1; background: transparent; border: none; padding: 1rem 0; color: var(--text-main); font-size: 1.1rem; font-weight: 600; outline: none; }
    .search-box input::placeholder { color: var(--text-muted); }

    .results-meta { margin-top: 1rem; color: var(--text-muted); font-size: 1rem; }
    .results-meta strong { color: var(--primary-color); }

    .loading-state {
      min-height: 180px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.6rem;
      color: var(--text-muted);
    }
    .spinner {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      animation: spin 1s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    .error-state {
      max-width: 760px;
      margin: 0 auto 1rem;
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 10px;
      padding: 0.75rem 0.9rem;
      font-weight: 600;
      text-align: center;
    }

    .search-results { display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 1.5rem; }

    .search-card { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }
    .card-visual { height: 180px; position: relative; background: var(--image-surface); border-radius: 15px; display: flex; align-items: center; justify-content: center; overflow: hidden; }
    .card-visual img { max-width: 85%; max-height: 85%; object-fit: contain; }
    .stock-badge { position: absolute; top: 10px; right: 10px; background: var(--danger-color); color: #fff; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }
    .offer-badge { position: absolute; top: 10px; left: 10px; background: var(--danger-color); color: #fff; padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; font-weight: 800; }

    .category-chip { align-self: flex-start; background: var(--surface-soft); padding: 0.25rem 0.75rem; border-radius: 50px; font-size: 0.75rem; color: var(--text-muted); border: 1px solid var(--glass-border); }
    .card-info h3 { margin: 0.5rem 0; font-size: 1.05rem; font-weight: 800; line-height: 1.4; }

    .price-row { display: flex; align-items: baseline; gap: 0.5rem; }
    .price-row .price { font-size: 1.2rem; font-weight: 900; color: var(--text-main); }
    .price-row .price small { font-size: 0.78rem; font-weight: 700; opacity: 0.8; }
    .price-row .old-price { color: var(--text-muted); font-size: 0.82rem; text-decoration: line-through; }
    .price-row .unit { font-size: 0.85rem; color: var(--text-muted); }

    .card-actions { display: flex; gap: 0.75rem; margin-top: auto; }
    .card-actions button, .card-actions a { flex: 1; padding: 0.75rem; border-radius: 12px; font-weight: 800; font-size: 0.9rem; text-align: center; text-decoration: none; border: none; }
    .card-actions .btn-secondary { border: 1px solid var(--primary-color); background: transparent; color: var(--primary-color); }
    .card-actions .btn-secondary:hover { background: rgba(var(--primary-rgb), 0.08); border-color: var(--primary-color); }
    .card-actions .btn-primary { background: var(--secondary-color); color: var(--secondary-text); cursor: pointer; }
    .card-actions .btn-primary:hover:not(:disabled) { background: var(--secondary-hover); }
    .card-actions .btn-primary:disabled { opacity: 0.55; cursor: not-allowed; }

    .empty-results { text-align: center; padding: 4rem 1rem; }
    .empty-icon { display: inline-flex; margin-bottom: 1rem; color: var(--text-muted); }
    .empty-results h2 { font-size: 1.6rem; margin-bottom: 0.6rem; }
    .empty-results p { color: var(--text-muted); margin-bottom: 1.5rem; }

    @media (max-width: 600px) {
      .search-results { grid-template-columns: 1fr; }
      .search-box { padding: 0.25rem 1rem; }
      .search-box input { font-size: 1rem; }
    }
  `]
})
export class StorefrontSearchComponent implements OnInit, OnDestroy {
  q = '';
  products: StorefrontProduct[] = [];
  page?: Page<StorefrontProduct>;
  isLoading = false;
  loadError = '';

  private timer?: ReturnType<typeof setTimeout>;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    private cart: CartService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.q = params.get('q') || '';
      this.reload();
    });
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearTimeout(this.timer);
    }
  }

  reload(page: number = 0) {
    this.isLoading = true;
    this.loadError = '';
    const searchValue = this.q.trim();
    this.api.getStorefrontProducts({ search: searchValue || undefined, page, size: 30, inStockOnly: true })
      .subscribe({
        next: res => {
          this.page = res;
          this.products = res.content || [];
          this.isLoading = false;
        },
        error: () => {
          this.products = [];
          this.isLoading = false;
          this.loadError = 'فشل البحث. حاول مرة أخرى.';
        }
      });
  }

  reloadDebounced() {
    if (this.timer) {
      clearTimeout(this.timer);
    }
    this.timer = setTimeout(() => {
      this.syncQuery();
      this.reload();
    }, 250);
  }

  addToCart(product: StorefrontProduct) {
    this.cart.addToCart(product, 1);
    this.toast.success(`تمت إضافة ${product.name} إلى السلة`);
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }

  private syncQuery() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { q: this.q || null },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
