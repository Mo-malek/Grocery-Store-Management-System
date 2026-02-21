import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { StorefrontProduct } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { resolveImageUrl } from '../../core/utils/image-url.util';

@Component({
  selector: 'app-storefront-product',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <section class="product-page" *ngIf="product; else loading">
      <nav class="breadcrumb">
        <a routerLink="/shop/home">الرئيسية</a>
        <span>/</span>
        <a routerLink="/shop/catalog">المنتجات</a>
        <span>/</span>
        <span>{{ product.name }}</span>
      </nav>

      <div class="product-layout">
        <section class="gallery">
          <div class="main-image">
            <img [src]="getImageUrl(selectedImage)" [alt]="product.name" />
          </div>
          <div class="thumbs">
            <button *ngFor="let img of galleryImages; let i = index" [class.active]="img === selectedImage" (click)="selectedImage = img">
              <img [src]="getImageUrl(img)" alt="" />
            </button>
          </div>
        </section>

        <section class="info-panel">
          <h1>{{ product.name }}</h1>
          <div class="rating-row">
            <span class="stars">{{ getStars(product.ratingAverage) }}</span>
            <span>{{ ratingAverage | number:'1.1-1' }} ({{ reviews.length || product.ratingCount || 0 }} تقييم)</span>
          </div>

          <div class="price-row">
            <span class="price">{{ product.price | number:'1.2-2' }} ج.م</span>
            <span class="old-price" *ngIf="(product.discountPercentage ?? 0) > 0 && (product.discountPercentage ?? 0) < 100">
              {{ (product.price / (1 - ((product.discountPercentage ?? 0) / 100))) | number:'1.2-2' }} ج.م
            </span>
          </div>
          <span class="discount-pill" *ngIf="(product.discountPercentage ?? 0) > 0">
            {{ product.discountPercentage | number:'1.0-2' }}% خصم
          </span>

          <div class="stock" [class.in-stock]="product.stock > 0" [class.out-stock]="product.stock === 0">
            {{ product.stock > 0 ? 'متوفر' : 'غير متوفر' }}
          </div>

          <div class="qty-control" *ngIf="product.stock > 0">
            <label>الكمية</label>
            <div class="qty-box">
              <button (click)="qty = qty > 1 ? qty - 1 : 1">-</button>
              <input type="number" [(ngModel)]="qty" min="1" [max]="product.stock">
              <button (click)="qty = qty < product.stock ? qty + 1 : qty">+</button>
            </div>
          </div>

          <div class="cta-row">
            <button class="add-btn" [disabled]="product.stock === 0" (click)="addToCart()">أضف للسلة</button>
            <button class="buy-btn" [disabled]="product.stock === 0" (click)="buyNow()">اشتر الآن</button>
            <button class="wish-btn" [class.active]="wishlist.has(product.id)" (click)="toggleWishlist()">&#9825;</button>
          </div>

          <div class="meta-grid">
            <div><span>القسم</span><strong>{{ product.category || 'عام' }}</strong></div>
            <div><span>الوحدة</span><strong>{{ product.unit || '-' }}</strong></div>
            <div><span>العلامة</span><strong>{{ product.manufacturer || '-' }}</strong></div>
          </div>
        </section>
      </div>

      <section class="content-section">
        <h2>الوصف</h2>
        <p>{{ product.description || 'لا يوجد وصف متاح لهذا المنتج حاليا.' }}</p>
      </section>

      <section class="content-section">
        <h2>التقييمات</h2>
        <div class="reviews-summary">
          <div class="avg-score">
            <strong>{{ ratingAverage | number:'1.1-1' }}</strong>
            <span>{{ getStars(ratingAverage) }}</span>
            <small>{{ reviews.length }} تقييم</small>
          </div>
          <div class="rating-bars">
            <div class="bar-row" *ngFor="let row of ratingRows">
              <span>{{ row.star }}★</span>
              <div class="bar"><div class="fill" [style.width.%]="row.percent"></div></div>
              <span>{{ row.count }}</span>
            </div>
          </div>
        </div>

        <div class="reviews-list" *ngIf="reviews.length; else noReviews">
          <article class="review-card" *ngFor="let r of reviews">
            <header>
              <strong>{{ r.username }}</strong>
              <span>{{ r.createdAt | date:'mediumDate' }}</span>
            </header>
            <div class="stars">{{ getStars(r.rating) }}</div>
            <p>{{ r.comment }}</p>
          </article>
        </div>
        <ng-template #noReviews>
          <p class="empty">لا توجد تقييمات بعد.</p>
        </ng-template>
      </section>

      <section class="content-section" *ngIf="recommendations.length">
        <h2>منتجات مشابهة</h2>
        <div class="recommend-grid">
          <a class="recommend-card" *ngFor="let p of recommendations" [routerLink]="['/shop/product', p.id]">
            <img [src]="getImageUrl(p.imageUrl)" alt="" />
            <h3>{{ p.name }}</h3>
            <span>{{ p.price | number:'1.2-2' }} ج.م</span>
          </a>
        </div>
      </section>

      <div class="mobile-sticky-cta">
        <div class="left">
          <span>الإجمالي</span>
          <strong>{{ (product.price * qty) | number:'1.2-2' }} ج.م</strong>
        </div>
        <button [disabled]="product.stock === 0" (click)="addToCart()">أضف للسلة</button>
      </div>
    </section>

    <ng-template #loading>
      <div class="loading-state" *ngIf="!loadError; else loadFailed">
        <div class="spinner"></div>
        <span>جاري تحميل المنتج...</span>
      </div>
    </ng-template>

    <ng-template #loadFailed>
      <div class="loading-state">
        <span>{{ loadError }}</span>
      </div>
    </ng-template>
  `,
  styles: [`
    .product-page {
      max-width: 1260px;
      margin: 0 auto;
      padding: 1rem 1rem 5.5rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .breadcrumb {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.84rem;
      color: var(--text-muted);
    }

    .breadcrumb a {
      text-decoration: none;
      color: var(--primary-color);
      font-weight: 600;
    }

    .product-layout {
      display: grid;
      grid-template-columns: minmax(0, 1fr) 420px;
      gap: 1rem;
      align-items: start;
    }

    .gallery,
    .info-panel,
    .content-section {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
    }

    .gallery {
      padding: 1rem;
    }

    .main-image {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 14px;
      border: 1px solid var(--border-color);
      background: var(--image-surface);
      overflow: hidden;
    }

    .main-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.9rem;
      display: block;
    }

    .thumbs {
      display: flex;
      gap: 0.45rem;
      margin-top: 0.75rem;
      overflow-x: auto;
    }

    .thumbs button {
      width: 68px;
      height: 68px;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      padding: 0.3rem;
      cursor: pointer;
      flex-shrink: 0;
    }

    .thumbs button.active {
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring-shadow);
    }

    .thumbs img {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .info-panel {
      padding: 1rem;
      position: sticky;
      top: 124px;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .info-panel h1 {
      margin: 0;
      font-size: 1.45rem;
      line-height: 1.25;
    }

    .rating-row {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      color: var(--text-secondary);
      font-size: 0.86rem;
    }

    .stars {
      color: var(--warning-color);
      font-weight: 700;
      letter-spacing: 0.8px;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.55rem;
    }

    .price {
      font-size: 1.6rem;
      font-weight: 900;
    }

    .old-price {
      color: var(--text-muted);
      text-decoration: line-through;
      font-size: 0.9rem;
    }

    .discount-pill {
      display: inline-flex;
      align-items: center;
      width: fit-content;
      margin-top: 0.45rem;
      background: var(--danger-color);
      color: #fff;
      border-radius: 999px;
      padding: 0.22rem 0.6rem;
      font-size: 0.78rem;
      font-weight: 800;
    }

    .stock {
      min-height: 34px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      align-self: flex-start;
      border-radius: 999px;
      padding: 0 0.8rem;
      font-size: 0.82rem;
      font-weight: 700;
      border: 1px solid transparent;
    }

    .stock.in-stock {
      background: var(--success-soft);
      color: var(--success-color);
      border-color: rgba(22, 163, 74, 0.3);
    }

    .stock.out-stock {
      background: var(--danger-soft);
      color: var(--danger-color);
      border-color: rgba(220, 38, 38, 0.3);
    }

    .qty-control {
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .qty-control label {
      font-size: 0.82rem;
      color: var(--text-secondary);
      font-weight: 700;
    }

    .qty-box {
      display: inline-flex;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      overflow: hidden;
      width: fit-content;
    }

    .qty-box button {
      width: 38px;
      height: 38px;
      border: none;
      background: var(--surface-soft);
      color: var(--text-main);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
    }

    .qty-box input {
      width: 52px;
      height: 38px;
      border: none;
      outline: none;
      text-align: center;
      background: var(--bg-card);
      color: var(--text-main);
      font-weight: 700;
    }

    .cta-row {
      display: grid;
      grid-template-columns: 1fr 1fr auto;
      gap: 0.45rem;
    }

    .add-btn,
    .buy-btn {
      min-height: 44px;
      border: none;
      border-radius: 12px;
      font-weight: 700;
      cursor: pointer;
    }

    .add-btn {
      background: var(--secondary-color);
      color: var(--secondary-text);
    }

    .add-btn:hover {
      background: var(--secondary-hover);
    }

    .buy-btn {
      background: var(--primary-color);
      color: #fff;
    }

    .buy-btn:hover {
      background: var(--primary-hover);
    }

    .wish-btn {
      width: 44px;
      height: 44px;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1.05rem;
      font-weight: 700;
    }

    .wish-btn.active {
      color: var(--danger-color);
      border-color: var(--danger-color);
      background: var(--danger-soft);
    }

    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.45rem;
      border-top: 1px solid var(--border-color);
      padding-top: 0.75rem;
    }

    .meta-grid div {
      background: var(--surface-soft);
      border-radius: 10px;
      padding: 0.5rem;
      display: flex;
      flex-direction: column;
      gap: 0.15rem;
    }

    .meta-grid span {
      font-size: 0.74rem;
      color: var(--text-muted);
    }

    .meta-grid strong {
      font-size: 0.82rem;
      color: var(--text-main);
      word-break: break-word;
    }

    .content-section {
      padding: 1rem;
    }

    .content-section h2 {
      margin: 0 0 0.75rem;
      font-size: 1.2rem;
    }

    .content-section p {
      margin: 0;
      color: var(--text-secondary);
      line-height: 1.7;
    }

    .reviews-summary {
      display: grid;
      grid-template-columns: 200px 1fr;
      gap: 1rem;
      align-items: center;
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.75rem;
      margin-bottom: 0.8rem;
    }

    .avg-score {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .avg-score strong {
      font-size: 2rem;
      line-height: 1;
    }

    .avg-score small {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .rating-bars {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .bar-row {
      display: grid;
      grid-template-columns: 36px 1fr 32px;
      gap: 0.45rem;
      align-items: center;
      font-size: 0.78rem;
      color: var(--text-secondary);
    }

    .bar {
      width: 100%;
      height: 8px;
      border-radius: 999px;
      background: var(--surface-soft);
      overflow: hidden;
    }

    .fill {
      height: 100%;
      background: var(--warning-color);
    }

    .reviews-list {
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .review-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      padding: 0.75rem;
    }

    .review-card header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.25rem;
      gap: 0.6rem;
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .review-card strong {
      color: var(--text-main);
      font-size: 0.82rem;
    }

    .review-card p {
      margin-top: 0.25rem;
    }

    .empty {
      color: var(--text-muted);
    }

    .recommend-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .recommend-card {
      text-decoration: none;
      color: var(--text-main);
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      padding: 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
      min-height: 210px;
    }

    .recommend-card:hover {
      box-shadow: var(--shadow-sm);
      border-color: var(--primary-color);
    }

    .recommend-card img {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--image-surface);
      object-fit: contain;
      padding: 0.5rem;
    }

    .recommend-card h3 {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.35;
      min-height: 2.45rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .recommend-card span {
      color: var(--secondary-color);
      font-size: 0.9rem;
      font-weight: 800;
      margin-top: auto;
    }

    .loading-state {
      min-height: 55vh;
      display: flex;
      align-items: center;
      justify-content: center;
      flex-direction: column;
      gap: 0.7rem;
      color: var(--text-muted);
    }

    .spinner {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 3px solid var(--border-color);
      border-top-color: var(--primary-color);
      animation: spin 1s linear infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    .mobile-sticky-cta {
      position: fixed;
      bottom: 64px;
      left: 0;
      width: 100%;
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      box-shadow: 0 -6px 20px rgba(0, 0, 0, 0.1);
      padding: 0.6rem 0.8rem;
      display: none;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      z-index: 120;
    }

    .mobile-sticky-cta .left {
      display: flex;
      flex-direction: column;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .mobile-sticky-cta .left strong {
      color: var(--text-main);
      font-size: 0.95rem;
    }

    .mobile-sticky-cta button {
      min-width: 160px;
      min-height: 42px;
      border: none;
      border-radius: 10px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      font-weight: 700;
    }

    @media (max-width: 1020px) {
      .product-layout {
        grid-template-columns: 1fr;
      }

      .info-panel {
        position: static;
      }
    }

    @media (max-width: 760px) {
      .meta-grid {
        grid-template-columns: 1fr 1fr;
      }

      .reviews-summary {
        grid-template-columns: 1fr;
      }

      .recommend-grid {
        grid-template-columns: 1fr 1fr;
      }
    }

    @media (max-width: 640px) {
      .product-page {
        padding: 0.8rem 0.65rem 7.2rem;
      }

      .cta-row {
        grid-template-columns: 1fr;
      }

      .wish-btn {
        width: 100%;
      }

      .mobile-sticky-cta {
        display: flex;
      }
    }
  `]
})
export class StorefrontProductComponent implements OnInit {
  product?: StorefrontProduct;
  reviews: any[] = [];
  recommendations: StorefrontProduct[] = [];
  galleryImages: string[] = [];
  selectedImage = '';
  qty = 1;
  loadError = '';

  ratingAverage = 0;
  ratingRows: { star: number; count: number; percent: number }[] = [];

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: ApiService,
    private cart: CartService,
    public wishlist: WishlistService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      const id = Number(params['id']);
      if (!id) {
        this.loadError = 'معرف المنتج غير صالح.';
        return;
      }
      this.product = undefined;
      this.loadError = '';
      this.loadProduct(id);
      this.loadReviews(id);
      this.loadRecommendations(id);
    });
  }

  loadProduct(id: number) {
    this.api.getStorefrontProduct(id).subscribe({
      next: product => {
        this.product = product;
        this.qty = 1;
        const mainImage = resolveImageUrl(product.imageUrl);
        this.galleryImages = [mainImage, mainImage, mainImage];
        this.selectedImage = this.galleryImages[0];
        this.ratingAverage = product.ratingAverage || 0;
        this.buildRatingRows();
      },
      error: () => {
        this.product = undefined;
        this.loadError = 'فشل تحميل تفاصيل المنتج.';
      }
    });
  }

  loadReviews(id: number) {
    this.api.getProductReviews(id).subscribe({
      next: reviews => {
        this.reviews = reviews || [];
        this.buildRatingRows();
      },
      error: () => {
        this.reviews = [];
        this.buildRatingRows();
      }
    });
  }

  loadRecommendations(id: number) {
    this.api.getProductRecommendations(id).subscribe({
      next: recommendations => {
        this.recommendations = recommendations || [];
      },
      error: () => {
        this.recommendations = [];
      }
    });
  }

  addToCart() {
    if (!this.product) return;
    const quantity = this.sanitizeQty();
    this.cart.addToCart(this.product, quantity);
    this.toast.success(`تمت إضافة ${this.product.name} إلى السلة`);
  }

  buyNow() {
    if (!this.product) return;
    const quantity = this.sanitizeQty();
    this.cart.addToCart(this.product, quantity);
    this.router.navigate(['/shop/checkout']);
  }

  toggleWishlist() {
    if (!this.product) return;
    const added = this.wishlist.toggle(this.product);
    this.toast.info(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }

  getStars(rating?: number): string {
    const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return '\u2605'.repeat(rounded) + '\u2606'.repeat(5 - rounded);
  }

  private buildRatingRows() {
    const counts = [0, 0, 0, 0, 0];
    this.reviews.forEach(review => {
      const idx = Math.min(5, Math.max(1, Number(review.rating || 0))) - 1;
      counts[idx] += 1;
    });

    const total = this.reviews.length || 1;
    if (this.reviews.length) {
      const sum = this.reviews.reduce((acc, review) => acc + Number(review.rating || 0), 0);
      this.ratingAverage = sum / this.reviews.length;
    }

    this.ratingRows = [5, 4, 3, 2, 1].map(star => {
      const count = counts[star - 1];
      return {
        star,
        count,
        percent: (count / total) * 100
      };
    });
  }

  private sanitizeQty(): number {
    if (!this.product) {
      return 1;
    }
    const max = Math.max(1, this.product.stock || 1);
    const parsed = Number(this.qty);
    const normalized = Number.isFinite(parsed) ? Math.floor(parsed) : 1;
    this.qty = Math.min(max, Math.max(1, normalized));
    return this.qty;
  }
}

