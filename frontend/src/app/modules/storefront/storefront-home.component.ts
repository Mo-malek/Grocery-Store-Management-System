import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule } from '@angular/router';
import { ApiService } from '../../core/services/api.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { ToastService } from '../../core/services/toast.service';
import { StorefrontProduct, StorefrontBundle, CategoryCount } from '../../core/models/models';
import { resolveImageUrl } from '../../core/utils/image-url.util';

interface HeroSlide {
  title: string;
  subtitle: string;
  image: string;
  ctaText: string;
  ctaLink: string;
}

@Component({
  selector: 'app-storefront-home',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <section class="home-page">
      <section class="hero-slider">
        <article class="hero-card" *ngFor="let slide of slides; let i = index" [class.active]="i === activeSlideIndex">
          <div class="hero-content">
            <p class="hero-eyebrow">احتياجاتك اليومية من البقالة</p>
            <h1>{{ slide.title }}</h1>
            <p>{{ slide.subtitle }}</p>
            <a [routerLink]="slide.ctaLink" class="hero-cta">{{ slide.ctaText }}</a>
          </div>
          <div class="hero-image-wrap">
            <img [src]="slide.image" alt="" />
          </div>
        </article>
        <div class="hero-dots">
          <button *ngFor="let slide of slides; let i = index" [class.active]="i === activeSlideIndex" (click)="setSlide(i)"></button>
        </div>
      </section>

      <div class="loading-banner" *ngIf="isLoading">جاري تحميل بيانات المتجر...</div>
      <p class="error-banner" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <section class="section-block">
        <div class="section-head">
          <h2>تسوق حسب الأقسام</h2>
          <a routerLink="/shop/categories">عرض الكل</a>
        </div>
        <div class="categories-grid">
          <button class="category-card" *ngFor="let c of categories" (click)="goCategory(c.category)">
            <span class="category-icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 7H10L12 9H20V18.5H4V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
              </svg>
            </span>
            <span class="name">{{ c.category || 'عام' }}</span>
            <span class="count">{{ c.count }} منتج</span>
          </button>
        </div>
      </section>

      <section class="section-block flash-offers">
        <div class="section-head">
          <h2>عروض سريعة</h2>
          <a routerLink="/shop/offers">عرض كل العروض</a>
        </div>
        <div class="products-grid">
          <article class="product-card" *ngFor="let p of flashOffers">
            <span class="discount-badge" *ngIf="(p.discountPercentage ?? 0) > 0">{{ p.discountPercentage | number:'1.0-2' }}% خصم</span>
            <a [routerLink]="['/shop/product', p.id]" class="img-link">
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" />
            </a>
            <h3>{{ p.name }}</h3>
            <div class="price-row">
              <span class="current">{{ p.price | number:'1.2-2' }} ج.م</span>
              <span class="old" *ngIf="(p.discountPercentage ?? 0) > 0 && (p.discountPercentage ?? 0) < 100">
                {{ (p.price / (1 - ((p.discountPercentage ?? 0) / 100))) | number:'1.2-2' }} ج.م
              </span>
            </div>
            <div class="card-actions">
              <button class="add-btn" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
              <button class="wish-btn" [class.active]="wishlist.has(p.id)" (click)="toggleWishlist(p)">&#9825;</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block">
        <div class="section-head">
          <h2>الأكثر مبيعا</h2>
          <a routerLink="/shop/catalog">تصفح المنتجات</a>
        </div>
        <div class="products-grid">
          <article class="product-card" *ngFor="let p of bestSellers">
            <a [routerLink]="['/shop/product', p.id]" class="img-link">
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" />
            </a>
            <h3>{{ p.name }}</h3>
            <div class="rating">{{ getStars(p.ratingAverage) }} <span>({{ p.ratingCount || 0 }})</span></div>
            <div class="price-row">
              <span class="current">{{ p.price | number:'1.2-2' }} ج.م</span>
            </div>
            <div class="card-actions">
              <button class="add-btn" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
              <button class="wish-btn" [class.active]="wishlist.has(p.id)" (click)="toggleWishlist(p)">&#9825;</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block" *ngIf="featuredProducts.length">
        <div class="section-head">
          <h2>منتجات مميزة</h2>
          <a routerLink="/shop/catalog">المزيد</a>
        </div>
        <div class="products-grid">
          <article class="product-card" *ngFor="let p of featuredProducts">
            <a [routerLink]="['/shop/product', p.id]" class="img-link">
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" />
            </a>
            <h3>{{ p.name }}</h3>
            <div class="rating">{{ getStars(p.ratingAverage) }} <span>({{ p.ratingCount || 0 }})</span></div>
            <div class="price-row">
              <span class="current">{{ p.price | number:'1.2-2' }} ج.م</span>
            </div>
            <div class="card-actions">
              <button class="add-btn" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
              <button class="wish-btn" [class.active]="wishlist.has(p.id)" (click)="toggleWishlist(p)">&#9825;</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block" *ngIf="recommended.length">
        <div class="section-head">
          <h2>مقترح لك</h2>
          <a routerLink="/shop/catalog">المزيد</a>
        </div>
        <div class="products-grid">
          <article class="product-card" *ngFor="let p of recommended">
            <a [routerLink]="['/shop/product', p.id]" class="img-link">
              <img [src]="getImageUrl(p.imageUrl)" [alt]="p.name" />
            </a>
            <h3>{{ p.name }}</h3>
            <div class="rating">{{ getStars(p.ratingAverage) }} <span>({{ p.ratingCount || 0 }})</span></div>
            <div class="price-row">
              <span class="current">{{ p.price | number:'1.2-2' }} ج.م</span>
            </div>
            <div class="card-actions">
              <button class="add-btn" [disabled]="p.stock === 0" (click)="addToCart(p)">أضف للسلة</button>
              <button class="wish-btn" [class.active]="wishlist.has(p.id)" (click)="toggleWishlist(p)">&#9825;</button>
            </div>
          </article>
        </div>
      </section>

      <section class="section-block bundles-block" *ngIf="offers.length">
        <div class="section-head">
          <h2>باقات التوفير</h2>
          <a routerLink="/shop/offers">المزيد من الباقات</a>
        </div>
        <div class="bundle-grid">
          <article class="bundle-card" *ngFor="let o of offers">
            <h3>{{ o.name }}</h3>
            <p>{{ o.items.length }} منتجات ضمن الباقة</p>
            <div class="bundle-price">{{ o.price | number:'1.2-2' }} ج.م</div>
            <button class="add-btn" (click)="addOffer(o)">أضف الباقة</button>
          </article>
        </div>
      </section>
    </section>
  `,
  styles: [`
    .home-page {
      max-width: 1280px;
      margin: 0 auto;
      padding: 1rem 1rem 2.5rem;
      display: flex;
      flex-direction: column;
      gap: 1.25rem;
    }

    .hero-slider {
      position: relative;
      border-radius: var(--radius-lg);
      overflow: hidden;
      box-shadow: var(--shadow-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-card);
    }

    .hero-card {
      display: none;
      grid-template-columns: 1.2fr 1fr;
      gap: 1rem;
      padding: 1.5rem;
      align-items: center;
      min-height: 360px;
    }

    .hero-card.active {
      display: grid;
      animation: fadeIn 0.5s var(--motion-ease);
    }

    .hero-eyebrow {
      margin: 0 0 0.5rem;
      color: var(--primary-color);
      font-weight: 700;
      font-size: 0.82rem;
      letter-spacing: 0.4px;
    }

    .hero-content h1 {
      margin: 0 0 0.7rem;
      font-size: clamp(1.7rem, 3.2vw, 2.45rem);
      line-height: 1.2;
    }

    .hero-content p {
      margin: 0;
      color: var(--text-secondary);
      max-width: 55ch;
    }

    .hero-cta {
      margin-top: 1rem;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      min-height: 44px;
      padding: 0.65rem 1.25rem;
      border-radius: 12px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      text-decoration: none;
      font-weight: 700;
      box-shadow: var(--shadow-xs);
    }

    .hero-cta:hover {
      background: var(--secondary-hover);
    }

    .hero-image-wrap {
      height: 100%;
      min-height: 280px;
      border-radius: 16px;
      overflow: hidden;
      background: var(--surface-soft);
      border: 1px solid var(--border-color);
    }

    .hero-image-wrap img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      display: block;
    }

    .hero-dots {
      position: absolute;
      bottom: 0.8rem;
      left: 0.8rem;
      display: flex;
      gap: 0.35rem;
    }

    .hero-dots button {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      cursor: pointer;
    }

    .hero-dots button.active {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }

    .loading-banner {
      border: 1px solid var(--border-color);
      background: var(--surface-soft);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      color: var(--text-secondary);
      font-weight: 600;
      text-align: center;
    }

    .error-banner {
      border: 1px solid rgba(220, 38, 38, 0.3);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 12px;
      padding: 0.65rem 0.9rem;
      font-weight: 600;
      text-align: center;
      margin: 0;
    }

    .section-block {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      padding: 1rem;
      box-shadow: var(--shadow-xs);
    }

    .section-head {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 0.85rem;
      gap: 0.75rem;
      flex-wrap: wrap;
    }

    .section-head h2 {
      margin: 0;
      font-size: 1.2rem;
    }

    .section-head a {
      text-decoration: none;
      font-weight: 600;
      font-size: 0.85rem;
      color: var(--primary-color);
    }

    .categories-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .category-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      min-height: 110px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.35rem;
      cursor: pointer;
      transition: transform 0.2s ease, box-shadow 0.2s ease;
      padding: 0.6rem;
    }

    .category-card:hover {
      transform: scale(1.02);
      box-shadow: var(--shadow-sm);
    }

    .category-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(var(--primary-rgb), 0.12);
      color: var(--primary-color);
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }

    .category-card .name {
      font-weight: 700;
      font-size: 0.9rem;
      color: var(--text-main);
    }

    .category-card .count {
      font-size: 0.76rem;
      color: var(--text-muted);
    }

    .flash-offers {
      background: var(--surface-soft);
    }

    .products-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .product-card {
      position: relative;
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      border-radius: 14px;
      background: var(--bg-card);
      padding: 0.65rem;
      transition: box-shadow 0.2s ease, transform 0.2s ease;
      min-height: 320px;
    }

    .product-card:hover {
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }

    .discount-badge {
      position: absolute;
      top: 0.5rem;
      right: 0.5rem;
      z-index: 1;
      background: var(--danger-color);
      color: #fff;
      border-radius: var(--radius-pill);
      padding: 0.15rem 0.45rem;
      font-size: 0.68rem;
      font-weight: 700;
    }

    .img-link {
      display: block;
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 12px;
      overflow: hidden;
      background: var(--image-surface);
      border: 1px solid var(--border-color);
      margin-bottom: 0.65rem;
    }

    .img-link img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.5rem;
      display: block;
    }

    .product-card h3 {
      margin: 0 0 0.4rem;
      font-size: 0.94rem;
      line-height: 1.35;
      min-height: 2.52rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .rating {
      margin-bottom: 0.4rem;
      color: var(--warning-color);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .rating span {
      color: var(--text-muted);
      font-weight: 500;
    }

    .price-row {
      display: flex;
      align-items: baseline;
      gap: 0.45rem;
      margin-top: auto;
      margin-bottom: 0.6rem;
    }

    .current {
      color: var(--text-main);
      font-weight: 800;
      font-size: 0.96rem;
    }

    .old {
      color: var(--text-muted);
      text-decoration: line-through;
      font-size: 0.78rem;
    }

    .card-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
    }

    .add-btn {
      flex: 1;
      min-height: 40px;
      border: none;
      border-radius: 10px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      font-weight: 700;
      cursor: pointer;
      transition: background 0.2s ease, transform 0.2s ease;
    }

    .add-btn:hover {
      background: var(--secondary-hover);
      transform: translateY(-1px);
    }

    .add-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
      transform: none;
    }

    .wish-btn {
      width: 40px;
      height: 40px;
      border: 1px solid var(--border-color);
      border-radius: 10px;
      background: var(--bg-card);
      color: var(--text-secondary);
      cursor: pointer;
      font-size: 1rem;
      font-weight: 700;
    }

    .wish-btn.active {
      color: var(--danger-color);
      border-color: var(--danger-color);
      background: var(--danger-soft);
    }

    .bundles-block .bundle-grid {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }

    .bundle-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      padding: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.4rem;
    }

    .bundle-card h3 {
      margin: 0;
      font-size: 1rem;
    }

    .bundle-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.82rem;
    }

    .bundle-price {
      margin-top: auto;
      margin-bottom: 0.55rem;
      color: var(--secondary-color);
      font-size: 1rem;
      font-weight: 800;
    }

    .icon-svg {
      width: 18px;
      height: 18px;
      display: block;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (min-width: 768px) {
      .products-grid {
        grid-template-columns: repeat(3, minmax(0, 1fr));
      }

      .categories-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @media (min-width: 1100px) {
      .products-grid {
        grid-template-columns: repeat(4, minmax(0, 1fr));
      }
    }

    @media (max-width: 900px) {
      .hero-card,
      .hero-card.active {
        grid-template-columns: 1fr;
      }

      .hero-image-wrap {
        min-height: 230px;
      }
    }

    @media (max-width: 640px) {
      .home-page {
        padding: 0.75rem 0.65rem 1.5rem;
      }

      .hero-card {
        min-height: 0;
        padding: 1rem;
      }

      .hero-content h1 {
        font-size: 1.45rem;
      }
    }
  `]
})
export class StorefrontHomeComponent implements OnInit, OnDestroy {
  slides: HeroSlide[] = [
    {
      title: 'جهّز بيتك في دقائق',
      subtitle: 'منتجات يومية طازجة وتوصيل سريع داخل منطقتك.',
      image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'تسوق الآن',
      ctaLink: '/shop/catalog'
    },
    {
      title: 'عروض قوية لا تفوّتها',
      subtitle: 'وفّر أكثر مع الباقات والعروض على المنتجات المطلوبة.',
      image: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'شاهد العروض',
      ctaLink: '/shop/offers'
    },
    {
      title: 'توصيل سريع طوال الأسبوع',
      subtitle: 'اختر منتجاتك وأكمل الطلب بسرعة وتتبع حالته بسهولة.',
      image: 'https://images.unsplash.com/photo-1601598851547-4302969d0614?auto=format&fit=crop&w=1200&q=80',
      ctaText: 'ابدأ التسوق',
      ctaLink: '/shop/categories'
    }
  ];

  activeSlideIndex = 0;
  slideTimer?: ReturnType<typeof setInterval>;

  categories: CategoryCount[] = [];
  offers: StorefrontBundle[] = [];
  flashOffers: StorefrontProduct[] = [];
  bestSellers: StorefrontProduct[] = [];
  recommended: StorefrontProduct[] = [];
  featuredProducts: StorefrontProduct[] = [];
  isLoading = false;
  loadError = '';
  private pendingLoads = 0;

  constructor(
    private api: ApiService,
    private router: Router,
    public cart: CartService,
    public wishlist: WishlistService,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    this.isLoading = true;
    this.loadError = '';
    this.pendingLoads = 3;

    this.loadProducts();
    this.loadOffers();
    this.loadCategories();
    this.slideTimer = setInterval(() => this.nextSlide(), 6000);
  }

  ngOnDestroy(): void {
    if (this.slideTimer) {
      clearInterval(this.slideTimer);
    }
  }

  setSlide(i: number) {
    this.activeSlideIndex = i;
  }

  nextSlide() {
    this.activeSlideIndex = (this.activeSlideIndex + 1) % this.slides.length;
  }

  addToCart(product: StorefrontProduct) {
    this.cart.addToCart(product);
    this.toast.success(`تمت إضافة ${product.name} إلى السلة`);
  }

  toggleWishlist(product: StorefrontProduct) {
    const added = this.wishlist.toggle(product);
    this.toast.info(added ? 'تمت الإضافة إلى المفضلة' : 'تمت الإزالة من المفضلة');
  }

  addOffer(bundle: StorefrontBundle) {
    if (!bundle.items?.length) {
      return;
    }

    let done = 0;
    let failed = false;

    bundle.items.forEach(item => {
      this.api.getStorefrontProduct(item.productId).subscribe({
        next: product => {
          this.cart.addToCart(product, item.quantity);
          done += 1;
          if (done === bundle.items.length) {
            this.toast.success(`تمت إضافة ${bundle.name} إلى السلة`);
          }
        },
        error: () => {
          if (!failed) {
            failed = true;
            this.toast.error(`فشل إضافة ${bundle.name}`);
          }
        }
      });
    });
  }

  goCategory(cat: string | null) {
    const category = cat || '';
    this.router.navigate(['/shop/catalog'], { queryParams: { category } });
  }

  loadProducts() {
    this.api.getStorefrontProducts({ size: 48, inStockOnly: true }).subscribe({
      next: res => {
        const items = res.content || [];
        this.flashOffers = items.filter(p => (p.discountPercentage ?? 0) > 0).slice(0, 8);
        if (this.flashOffers.length === 0) {
          this.flashOffers = items.slice(0, 8);
        }

        this.bestSellers = [...items]
          .sort((a, b) => (b.ratingCount || 0) - (a.ratingCount || 0))
          .slice(0, 8);
        if (this.bestSellers.length === 0) {
          this.bestSellers = items.slice(0, 8);
        }

        this.recommended = [...items]
          .sort((a, b) => (b.ratingAverage || 0) - (a.ratingAverage || 0))
          .slice(8, 16);
        if (this.recommended.length === 0) {
          this.recommended = items.slice(8, 16);
        }

        this.featuredProducts = [...items].slice(16, 24);

        this.markLoadDone();
      },
      error: () => {
        this.flashOffers = [];
        this.bestSellers = [];
        this.recommended = [];
        this.featuredProducts = [];
        this.loadError = this.loadError || 'فشل تحميل منتجات المتجر.';
        this.markLoadDone();
      }
    });
  }

  loadOffers() {
    this.api.getStorefrontOffers().subscribe({
      next: offers => {
        this.offers = offers || [];
        this.markLoadDone();
      },
      error: () => {
        this.offers = [];
        this.loadError = this.loadError || 'فشل تحميل العروض.';
        this.markLoadDone();
      }
    });
  }

  loadCategories() {
    this.api.getStorefrontCategoriesCount().subscribe({
      next: categories => {
        this.categories = categories || [];
        this.markLoadDone();
      },
      error: () => {
        this.categories = [];
        this.loadError = this.loadError || 'فشل تحميل الأقسام.';
        this.markLoadDone();
      }
    });
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }

  getStars(rating?: number): string {
    const rounded = Math.max(0, Math.min(5, Math.round(rating || 0)));
    return '\u2605'.repeat(rounded) + '\u2606'.repeat(5 - rounded);
  }

  private markLoadDone() {
    this.pendingLoads = Math.max(0, this.pendingLoads - 1);
    if (this.pendingLoads === 0) {
      this.isLoading = false;
    }
  }
}
