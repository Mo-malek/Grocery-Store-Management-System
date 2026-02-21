import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Page, StorefrontProduct } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { resolveImageUrl } from '../../core/utils/image-url.util';

type SortMode = 'bestSelling' | 'priceAsc' | 'priceDesc' | 'newest';

@Component({
  selector: 'app-storefront-catalog',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="catalog-page">
      <nav class="breadcrumb">
        <a routerLink="/shop/home">الرئيسية</a>
        <span>/</span>
        <span>المنتجات</span>
      </nav>

      <div class="layout-grid">
        <aside class="filters-sidebar">
          <div class="filters-header">
            <h2>الفلاتر</h2>
            <button type="button" class="clear-link" (click)="clearFilters()">إعادة ضبط</button>
          </div>

          <div class="filter-block">
            <label>بحث</label>
            <input [(ngModel)]="search" (keyup.enter)="reload(0)" type="search" class="filter-input" placeholder="ابحث عن المنتجات..." />
          </div>

          <div class="filter-block">
            <label>نطاق السعر</label>
            <div class="price-values">
              <span>{{ minPrice }} ج.م</span>
              <span>{{ maxPrice }} ج.م</span>
            </div>
            <input type="range" [min]="rangeMin" [max]="rangeMax" [step]="5" [(ngModel)]="minPrice" (input)="onMinRangeChange()" />
            <input type="range" [min]="rangeMin" [max]="rangeMax" [step]="5" [(ngModel)]="maxPrice" (input)="onMaxRangeChange()" />
          </div>

          <div class="filter-block">
            <label>الأقسام</label>
            <div class="category-options">
              <label class="check-item">
                <input type="radio" name="category" [checked]="selectedCategory === ''" (change)="setCategory('')" />
                <span>كل الأقسام</span>
              </label>
              <label class="check-item" *ngFor="let c of categories">
                <input type="radio" name="category" [checked]="selectedCategory === c" (change)="setCategory(c)" />
                <span>{{ c }}</span>
              </label>
            </div>
          </div>

          <div class="filter-block">
            <label>ترتيب حسب</label>
            <select [(ngModel)]="sortBy" (change)="reload(0)" class="filter-select">
              <option value="bestSelling">الأكثر مبيعا</option>
              <option value="priceAsc">السعر: من الأقل للأعلى</option>
              <option value="priceDesc">السعر: من الأعلى للأقل</option>
              <option value="newest">الأحدث</option>
            </select>
          </div>

          <button class="apply-btn" (click)="reload(0)">تطبيق</button>
        </aside>

        <section class="products-area">
          <div class="top-meta">
            <h1>المنتجات</h1>
            <p>{{ page?.totalElements || 0 }} منتج متاح</p>
          </div>

          <div class="loading-state" *ngIf="isLoading">
            <div class="spinner"></div>
            <p>جاري تحميل المنتجات...</p>
          </div>

          <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

          <div class="products-grid" *ngIf="!isLoading && !loadError && products.length; else empty">
            <article class="product-card" *ngFor="let p of products">
              <a [routerLink]="['/shop/product', p.id]" class="img-wrap">
                <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" />
                <span class="discount-badge" *ngIf="(p.discountPercentage ?? 0) > 0">
                  {{ p.discountPercentage | number:'1.0-2' }}% خصم
                </span>
              </a>
              <h3>{{ p.name }}</h3>
              <div class="rating">{{ getStars(p.ratingAverage) }} <span>({{ p.ratingCount || 0 }})</span></div>
              <div class="price-row">
                <div class="price">{{ p.price | number:'1.2-2' }} ج.م</div>
                <div class="old-price" *ngIf="(p.discountPercentage ?? 0) > 0 && (p.discountPercentage ?? 0) < 100">
                  {{ (p.price / (1 - ((p.discountPercentage ?? 0) / 100))) | number:'1.2-2' }} ج.م
                </div>
              </div>
              <div class="actions">
                <button class="wish-btn" [class.active]="wishlist.has(p.id)" (click)="toggleWishlist(p)">&#9825;</button>
                <button class="cart-btn" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
              </div>
            </article>
          </div>

          <ng-template #empty>
            <div class="empty-state" *ngIf="!isLoading && !loadError">
              <h3>لا توجد منتجات مطابقة</h3>
              <p>جرّب تغيير الفلاتر أو كلمة البحث.</p>
              <button class="apply-btn" (click)="clearFilters()">مسح الفلاتر</button>
            </div>
          </ng-template>

          <div class="pagination" *ngIf="page && page.totalPages > 1">
            <button class="page-btn" (click)="changePage(page.number - 1)" [disabled]="page.first">السابق</button>
            <span>صفحة {{ page.number + 1 }} من {{ page.totalPages }}</span>
            <button class="page-btn" (click)="changePage(page.number + 1)" [disabled]="page.last">التالي</button>
          </div>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .catalog-page { max-width: 1320px; margin: 0 auto; padding: 1rem; }
    .breadcrumb { display: flex; gap: 0.4rem; align-items: center; margin-bottom: 0.85rem; font-size: 0.84rem; color: var(--text-muted); }
    .breadcrumb a { text-decoration: none; color: var(--primary-color); font-weight: 600; }
    .layout-grid { display: grid; grid-template-columns: 290px 1fr; gap: 1rem; align-items: start; }
    .filters-sidebar { position: sticky; top: 122px; border: 1px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-xs); padding: 1rem; display: flex; flex-direction: column; gap: 0.9rem; }
    .filters-header { display: flex; justify-content: space-between; align-items: center; }
    .filters-header h2 { margin: 0; font-size: 1.05rem; }
    .clear-link { border: none; background: transparent; color: var(--primary-color); font-weight: 600; cursor: pointer; font-size: 0.8rem; }
    .filter-block { border-top: 1px solid var(--border-color); padding-top: 0.75rem; display: flex; flex-direction: column; gap: 0.5rem; }
    .filter-block label { color: var(--text-secondary); font-size: 0.82rem; font-weight: 700; }
    .filter-input, .filter-select { min-height: 42px; border: 1px solid var(--input-border-color); border-radius: 10px; padding: 0.55rem 0.7rem; background: var(--bg-card); color: var(--text-main); outline: none; }
    .filter-input:focus, .filter-select:focus { border-color: var(--primary-color); box-shadow: var(--focus-ring-shadow); }
    .price-values { display: flex; justify-content: space-between; font-size: 0.75rem; color: var(--text-muted); }
    .category-options { max-height: 220px; overflow-y: auto; display: flex; flex-direction: column; gap: 0.45rem; padding-right: 0.2rem; }
    .check-item { display: flex; align-items: center; gap: 0.5rem; font-size: 0.84rem; color: var(--text-main); cursor: pointer; }
    .apply-btn { min-height: 44px; border: none; border-radius: 12px; background: var(--secondary-color); color: var(--secondary-text); font-weight: 700; cursor: pointer; }
    .apply-btn:hover { background: var(--secondary-hover); }
    .products-area { border: 1px solid var(--border-color); border-radius: var(--radius-lg); background: var(--bg-card); box-shadow: var(--shadow-xs); padding: 1rem; }
    .top-meta { display: flex; align-items: baseline; justify-content: space-between; gap: 1rem; flex-wrap: wrap; margin-bottom: 0.9rem; }
    .top-meta h1 { margin: 0; font-size: 1.4rem; }
    .top-meta p { margin: 0; color: var(--text-muted); font-size: 0.86rem; }
    .loading-state { min-height: 180px; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 0.6rem; color: var(--text-muted); }
    .spinner { width: 32px; height: 32px; border: 3px solid var(--border-color); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
    .error-state { border: 1px solid rgba(220, 38, 38, 0.3); background: var(--danger-soft); color: var(--danger-color); border-radius: 10px; padding: 0.75rem 0.9rem; font-weight: 600; text-align: center; margin-bottom: 1rem; }
    .products-grid { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 0.75rem; }
    .product-card { border: 1px solid var(--border-color); border-radius: 14px; background: var(--bg-card); padding: 0.65rem; display: flex; flex-direction: column; min-height: 320px; transition: transform 0.2s ease, box-shadow 0.2s ease; }
    .product-card:hover { transform: translateY(-2px); box-shadow: var(--shadow-sm); }
    .img-wrap { display: block; width: 100%; aspect-ratio: 1 / 1; border-radius: 12px; overflow: hidden; border: 1px solid var(--border-color); background: var(--image-surface); margin-bottom: 0.6rem; position: relative; }
    .img-wrap img { width: 100%; height: 100%; object-fit: contain; padding: 0.45rem; display: block; }
    .discount-badge { position: absolute; top: 8px; right: 8px; background: var(--danger-color); color: #fff; font-size: 0.72rem; font-weight: 800; border-radius: 999px; padding: 0.2rem 0.55rem; }
    .product-card h3 { margin: 0 0 0.35rem; font-size: 0.95rem; line-height: 1.35; min-height: 2.52rem; display: -webkit-box; -webkit-line-clamp: 2; -webkit-box-orient: vertical; overflow: hidden; }
    .rating { font-size: 0.8rem; color: var(--warning-color); margin-bottom: 0.45rem; font-weight: 700; }
    .rating span { color: var(--text-muted); font-weight: 500; }
    .price-row { margin-top: auto; margin-bottom: 0.65rem; display: flex; flex-direction: column; gap: 0.2rem; }
    .price { font-size: 1rem; font-weight: 800; color: var(--text-main); }
    .old-price { color: var(--text-muted); font-size: 0.82rem; text-decoration: line-through; }
    .actions { display: flex; align-items: center; gap: 0.45rem; }
    .wish-btn { width: 40px; height: 40px; border: 1px solid var(--border-color); border-radius: 10px; background: var(--bg-card); color: var(--text-secondary); cursor: pointer; font-size: 1rem; font-weight: 700; transition: transform 0.2s ease; }
    .wish-btn:hover { transform: scale(1.04); }
    .wish-btn.active { color: var(--danger-color); border-color: var(--danger-color); background: var(--danger-soft); }
    .cart-btn { flex: 1; min-height: 40px; border: none; border-radius: 10px; background: var(--secondary-color); color: var(--secondary-text); font-weight: 700; cursor: pointer; transition: transform 0.2s ease, opacity 0.2s ease; }
    .cart-btn:hover { transform: translateY(-1px); background: var(--secondary-hover); }
    .cart-btn:disabled { opacity: 0.55; cursor: not-allowed; transform: none; }
    .empty-state { border: 1px dashed var(--border-color); border-radius: 14px; padding: 2.2rem 1rem; text-align: center; color: var(--text-secondary); display: flex; flex-direction: column; align-items: center; gap: 0.55rem; }
    .empty-state h3 { margin: 0; color: var(--text-main); }
    .pagination { margin-top: 1rem; display: flex; justify-content: center; align-items: center; gap: 0.75rem; color: var(--text-secondary); font-size: 0.86rem; }
    .page-btn { min-height: 36px; border: 1px solid var(--border-color); border-radius: 999px; background: var(--bg-card); color: var(--text-main); padding: 0 0.8rem; cursor: pointer; }
    .page-btn:disabled { opacity: 0.45; cursor: not-allowed; }
    .page-btn:hover:not(:disabled) { border-color: var(--primary-color); color: var(--primary-color); }
    @keyframes spin { to { transform: rotate(360deg); } }
    @media (min-width: 820px) { .products-grid { grid-template-columns: repeat(3, minmax(0, 1fr)); } }
    @media (min-width: 1120px) { .products-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); } }
    @media (max-width: 980px) { .layout-grid { grid-template-columns: 1fr; } .filters-sidebar { position: static; } }
    @media (max-width: 640px) { .catalog-page { padding: 0.75rem; } }
  `]
})
export class StorefrontCatalogComponent implements OnInit {
  products: StorefrontProduct[] = [];
  page?: Page<StorefrontProduct>;
  categories: string[] = [];
  isLoading = false;
  loadError = '';

  search = '';
  selectedCategory = '';
  sortBy: SortMode = 'bestSelling';

  rangeMin = 0;
  rangeMax = 2000;
  minPrice = 0;
  maxPrice = 2000;

  constructor(
    private api: ApiService,
    private route: ActivatedRoute,
    private router: Router,
    public cart: CartService,
    public wishlist: WishlistService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.search = params.get('search') ?? params.get('q') ?? '';
      this.selectedCategory = params.get('category') ?? '';
      this.reload(0);
    });
    this.loadCategories();
  }

  reload(page: number = 0) {
    this.onMinRangeChange();
    this.onMaxRangeChange();

    this.isLoading = true;
    this.loadError = '';
    const sortApi = this.sortBy === 'bestSelling' ? undefined : this.sortBy;
    this.api.getStorefrontProducts({
      search: this.search.trim() || undefined,
      category: this.selectedCategory || undefined,
      minPrice: this.minPrice,
      maxPrice: this.maxPrice,
      page,
      size: 24,
      sort: sortApi
    }).subscribe({
      next: res => {
        this.page = res;
        this.products = this.sortBy === 'bestSelling'
          ? [...res.content].sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
          : res.content;
        this.syncQueryParams();
        this.isLoading = false;
      },
      error: () => {
        this.page = undefined;
        this.products = [];
        this.isLoading = false;
        this.loadError = 'فشل تحميل المنتجات.';
      }
    });
  }

  changePage(p: number) {
    if (!this.page) return;
    if (p < 0 || p >= this.page.totalPages) return;
    this.reload(p);
  }

  loadCategories() {
    this.api.getStorefrontCategories().subscribe({
      next: c => this.categories = c || [],
      error: () => this.categories = []
    });
  }

  addToCart(p: StorefrontProduct) {
    this.cart.addToCart(p);
    this.toast.success(`تمت إضافة ${p.name} إلى السلة`);
  }

  toggleWishlist(p: StorefrontProduct) {
    this.wishlist.toggle(p);
  }

  setCategory(category: string) {
    this.selectedCategory = category;
    this.reload(0);
  }

  onMinRangeChange() {
    if (this.minPrice > this.maxPrice) this.maxPrice = this.minPrice;
  }

  onMaxRangeChange() {
    if (this.maxPrice < this.minPrice) this.minPrice = this.maxPrice;
  }

  clearFilters() {
    this.search = '';
    this.selectedCategory = '';
    this.sortBy = 'bestSelling';
    this.minPrice = this.rangeMin;
    this.maxPrice = this.rangeMax;
    this.reload(0);
  }

  getStars(rating?: number): string {
    const r = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return '\u2605'.repeat(r) + '\u2606'.repeat(5 - r);
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }

  private syncQueryParams() {
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: {
        search: this.search || null,
        category: this.selectedCategory || null
      },
      queryParamsHandling: 'merge',
      replaceUrl: true
    });
  }
}
