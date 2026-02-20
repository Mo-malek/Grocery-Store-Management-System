import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ApiService } from '../../core/services/api.service';
import { StorefrontBundle } from '../../core/models/models';
import { CartService } from '../../core/services/cart.service';
import { ToastService } from '../../core/services/toast.service';

@Component({
  selector: 'app-storefront-offers',
  standalone: true,
  imports: [CommonModule],
  template: `
    <section class="offers-page container fade-in">
      <header class="page-header slide-up">
        <div class="title-area">
          <p class="eyebrow">Save more with curated packs</p>
          <h1>Smart Bundle Offers</h1>
        </div>
        <div class="count-badge">{{ offers.length }} active offers</div>
      </header>

      <div class="loading-state" *ngIf="isLoading">
        <div class="spinner"></div>
        <p>Loading offers...</p>
      </div>

      <p class="error-state" *ngIf="!isLoading && loadError">{{ loadError }}</p>

      <div class="offer-grid staggered-group" *ngIf="!isLoading && !loadError && offers.length; else empty">
        <article class="offer-card glass-card slide-up" *ngFor="let o of offers; let i = index" [style.animation-delay]="i * 0.08 + 's'">
          <div class="card-glow"></div>
          <div class="offer-head">
            <h3>{{ o.name }}</h3>
            <div class="price-tag">
              <span class="num">{{ o.price | number:'1.2-2' }}</span>
              <span class="curr">EGP</span>
            </div>
          </div>

          <div class="items-list">
            <div class="bundle-item" *ngFor="let item of o.items">
              <span class="dot"></span>
              <span class="name">{{ item.productName }}</span>
              <span class="qty">{{ item.quantity }} x</span>
            </div>
          </div>

          <button class="btn-primary add-bundle" [disabled]="addingBundleId === o.id" (click)="addBundleToCart(o)">
            <span *ngIf="addingBundleId !== o.id">Add bundle to cart</span>
            <span *ngIf="addingBundleId === o.id">Adding...</span>
          </button>
        </article>
      </div>

      <ng-template #empty>
        <div class="empty-state glass-box zoom-in" *ngIf="!isLoading && !loadError">
          <h2>No offers right now</h2>
          <p>Check back soon for new bundle promotions.</p>
        </div>
      </ng-template>
    </section>
  `,
  styles: [`
    .offers-page { padding: 4rem 1rem; min-height: 80vh; }

    .page-header { display: flex; justify-content: space-between; align-items: flex-end; margin-bottom: 2rem; }
    .eyebrow { color: var(--primary-color); font-weight: 800; letter-spacing: 1px; margin-bottom: 0.5rem; font-size: 0.9rem; }
    .page-header h1 { font-size: 2.2rem; font-weight: 900; margin: 0; line-height: 1.1; }
    .count-badge { background: var(--surface-soft); border: 1px solid var(--glass-border); padding: 0.5rem 1.25rem; border-radius: 50px; color: var(--text-muted); font-weight: 600; font-size: 0.9rem; }

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
      margin-bottom: 1rem;
      text-align: center;
    }

    .offer-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(320px, 1fr)); gap: 1.25rem; }

    .offer-card { padding: 1.5rem; display: flex; flex-direction: column; gap: 1rem; position: relative; overflow: hidden; border: 1px solid var(--glass-border); transition: 0.3s cubic-bezier(0.4, 0, 0.2, 1); }
    .offer-card:hover { transform: translateY(-4px); border-color: var(--secondary-color); background: var(--surface-soft-hover); }
    .card-glow { position: absolute; top: 0; right: 0; width: 120px; height: 120px; background: rgba(var(--secondary-rgb), 0.08); border-radius: 0 0 0 120px; pointer-events: none; transition: 0.3s; }
    .offer-card:hover .card-glow { background: rgba(var(--secondary-rgb), 0.14); }

    .offer-head { display: flex; justify-content: space-between; align-items: flex-start; gap: 1rem; }
    .offer-head h3 { margin: 0; font-size: 1.25rem; font-weight: 800; line-height: 1.3; flex: 1; }

    .price-tag { display: flex; flex-direction: column; align-items: flex-end; color: var(--secondary-color); }
    .price-tag .num { font-size: 1.4rem; font-weight: 900; }
    .price-tag .curr { font-size: 0.75rem; font-weight: 700; opacity: 0.8; }

    .items-list { display: flex; flex-direction: column; gap: 0.6rem; padding: 1rem; background: var(--surface-soft); border-radius: 12px; }
    .bundle-item { display: flex; align-items: center; gap: 0.65rem; font-size: 0.9rem; }
    .bundle-item .dot { width: 6px; height: 6px; border-radius: 50%; background: var(--secondary-color); }
    .bundle-item .name { flex: 1; color: var(--text-secondary); }
    .bundle-item .qty { font-weight: 700; color: var(--text-main); font-size: 0.82rem; }

    .add-bundle { width: 100%; min-height: 44px; border-radius: 12px; border: none; font-weight: 800; cursor: pointer; background: var(--secondary-color); color: var(--secondary-text); }
    .add-bundle:hover:not(:disabled) { background: var(--secondary-hover); }
    .add-bundle:disabled { opacity: 0.65; cursor: not-allowed; }

    .empty-state { text-align: center; padding: 2.5rem 1rem; }

    @media (max-width: 768px) {
      .page-header { flex-direction: column; align-items: flex-start; gap: 1rem; }
      .page-header h1 { font-size: 1.9rem; }
      .offer-grid { grid-template-columns: 1fr; }
    }
  `]
})
export class StorefrontOffersComponent implements OnInit {
  offers: StorefrontBundle[] = [];
  isLoading = false;
  loadError = '';
  addingBundleId: number | null = null;

  constructor(private api: ApiService, private cart: CartService, private toast: ToastService) { }

  ngOnInit(): void {
    this.loadOffers();
  }

  loadOffers() {
    this.isLoading = true;
    this.loadError = '';
    this.api.getStorefrontOffers().subscribe({
      next: data => {
        this.offers = data || [];
        this.isLoading = false;
      },
      error: () => {
        this.offers = [];
        this.isLoading = false;
        this.loadError = 'Failed to load offers.';
      }
    });
  }

  addBundleToCart(bundle: StorefrontBundle) {
    if (!bundle.items?.length) {
      return;
    }
    this.addingBundleId = bundle.id;
    const requests = bundle.items.map(item => this.api.getStorefrontProduct(item.productId));
    let completed = 0;
    let failed = false;

    requests.forEach((request, index) => {
      request.subscribe({
        next: product => {
          const qty = bundle.items[index]?.quantity || 1;
          this.cart.addToCart(product, qty);
          completed += 1;
          if (completed === requests.length) {
            this.addingBundleId = null;
            this.toast.success(`${bundle.name} added to cart`);
          }
        },
        error: () => {
          if (!failed) {
            failed = true;
            this.addingBundleId = null;
            this.toast.error(`Failed to add ${bundle.name}`);
          }
        }
      });
    });
  }
}
