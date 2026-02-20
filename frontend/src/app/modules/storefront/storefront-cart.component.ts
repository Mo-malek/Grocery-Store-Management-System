import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { CartService } from '../../core/services/cart.service';
import { AuthService } from '../../core/services/auth.service';

@Component({
  selector: 'app-storefront-cart',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="cart-page">
      <div class="cart-container">
        <header class="cart-header">
          <h1>سلة التسوق</h1>
          <button class="clear-btn" (click)="cart.clearCart()" *ngIf="(cart.cart$ | async)?.length">إفراغ السلة</button>
        </header>

        <div class="cart-content" *ngIf="cart.cart$ | async as items; else loading">
          <div class="cart-items" *ngIf="items.length > 0; else emptyCart">
            <article class="cart-item" *ngFor="let item of items">
              <div class="item-info">
                <h3>{{ item.product.name }}</h3>
                <p class="meta">{{ item.product.category }} · {{ item.product.unit }}</p>
              </div>
              <div class="item-quantity">
                <button (click)="cart.updateQuantity(item.product.id, item.quantity - 1)">-</button>
                <span>{{ item.quantity }}</span>
                <button (click)="cart.updateQuantity(item.product.id, item.quantity + 1)">+</button>
              </div>
              <div class="item-price">
                <div class="unit-price">{{ item.product.price | number:'1.2-2' }} ج.م</div>
                <div class="total-price">{{ (item.product.price * item.quantity) | number:'1.2-2' }} ج.م</div>
              </div>
              <button class="remove-btn" (click)="cart.removeFromCart(item.product.id)">🗑</button>
            </article>
          </div>

          <aside class="cart-summary" *ngIf="items.length > 0">
            <div class="summary-card">
              <h3>ملخص الطلب</h3>
              <div class="summary-row">
                <span>الإجمالي الفرعي</span>
                <span>{{ cart.getTotal() | number:'1.2-2' }} ج.م</span>
              </div>
              <div class="summary-row">
                <span>رسوم التوصيل</span>
                <span class="free">مجاناً</span>
              </div>
              <hr>
              <div class="summary-row total">
                <span>الإجمالي</span>
                <span>{{ cart.getTotal() | number:'1.2-2' }} ج.م</span>
              </div>
              
              <button class="checkout-btn btn-primary" (click)="goCheckout()">
                {{ (auth.currentUser | async) ? 'إتمام الطلب' : 'سجل دخول لإتمام الطلب' }}
              </button>
            </div>
          </aside>

          <ng-template #emptyCart>
            <div class="empty-state">
              <div class="icon">🛒</div>
              <h2>سلتك فارغة</h2>
              <p>استعرض منتجاتنا وأضف ما تحتاجه للسلة.</p>
              <a routerLink="/shop/catalog" class="btn btn-primary">ابدأ التسوق</a>
            </div>
          </ng-template>
        </div>
      </div>
    </div>

    <ng-template #loading>
      <div class="loading-wrap">
        <div class="spinner"></div>
        <p>جاري مزامنة السلة...</p>
      </div>
    </ng-template>
  `,
  styles: [`
    .cart-page { padding: 2.5rem 1rem 4rem; min-height: 72vh; }
    .cart-container { max-width: 1180px; margin: 0 auto; }

    .cart-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 1.5rem; gap: 1rem; }
    .cart-header h1 { margin: 0; font-size: 2.1rem; font-weight: 900; }
    .clear-btn {
      border: 1px solid var(--danger-color);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 999px;
      padding: 0.5rem 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .clear-btn:hover { transform: translateY(-1px); box-shadow: 0 10px 20px rgba(220, 38, 38, 0.18); }

    .cart-content { display: grid; grid-template-columns: minmax(0, 1fr) 340px; gap: 1.5rem; align-items: start; }
    .cart-items { display: flex; flex-direction: column; gap: 0.9rem; }
    .cart-item {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 1rem 1.25rem;
      display: grid;
      grid-template-columns: minmax(0, 1.1fr) auto auto auto;
      gap: 1rem;
      align-items: center;
      backdrop-filter: var(--glass-blur);
    }

    .item-info h3 { margin: 0 0 0.25rem; font-size: 1.05rem; }
    .item-info .meta { margin: 0; color: var(--text-muted); font-size: 0.85rem; }

    .item-quantity {
      display: flex;
      align-items: center;
      gap: 0.35rem;
      background: var(--surface-soft);
      border: 1px solid var(--glass-border);
      border-radius: 999px;
      padding: 0.2rem;
    }
    .item-quantity button {
      width: 30px;
      height: 30px;
      border: none;
      border-radius: 50%;
      background: var(--surface-soft-hover);
      color: var(--text-main);
      font-size: 1rem;
      font-weight: 700;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .item-quantity button:hover { background: rgba(var(--primary-rgb), 0.2); color: var(--primary-color); }
    .item-quantity span { min-width: 30px; text-align: center; font-weight: 800; color: var(--text-main); }

    .item-price { text-align: left; min-width: 120px; }
    .unit-price { color: var(--text-muted); font-size: 0.82rem; }
    .total-price { color: var(--text-main); font-weight: 900; font-size: 1.1rem; margin-top: 0.15rem; }

    .remove-btn {
      border: 1px solid var(--border-color);
      background: transparent;
      color: var(--text-muted);
      border-radius: 10px;
      width: 36px;
      height: 36px;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .remove-btn:hover { border-color: var(--danger-color); color: var(--danger-color); background: var(--danger-soft); }

    .summary-card {
      background: var(--glass-bg);
      border: 1px solid var(--glass-border);
      border-radius: 16px;
      padding: 1.4rem;
      backdrop-filter: var(--glass-blur);
      position: sticky;
      top: 92px;
    }
    .summary-card h3 { margin: 0 0 1.15rem; font-size: 1.15rem; }
    .summary-row { display: flex; justify-content: space-between; color: var(--text-secondary); margin-bottom: 0.7rem; }
    .summary-row.total {
      color: var(--text-main);
      font-size: 1.25rem;
      font-weight: 900;
      margin-top: 0.7rem;
    }
    .summary-row.total span:last-child { color: var(--secondary-color); }
    .summary-card hr { border: none; border-top: 1px solid var(--glass-border); margin: 1rem 0; }
    .free { color: var(--success-color); font-weight: 700; }

    .checkout-btn { width: 100%; margin-top: 1.15rem; padding: 0.95rem 1rem; border-radius: 12px; font-size: 0.95rem; font-weight: 800; }

    .empty-state {
      text-align: center;
      background: var(--glass-bg);
      border: 1px dashed var(--glass-border);
      border-radius: 16px;
      padding: 4rem 2rem;
    }
    .empty-state .icon { font-size: 3.2rem; opacity: 0.45; margin-bottom: 0.8rem; }
    .empty-state p { color: var(--text-muted); max-width: 420px; margin: 0.8rem auto 1.5rem; }

    .loading-wrap {
      min-height: 48vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.85rem;
      color: var(--text-muted);
    }
    .spinner { width: 36px; height: 36px; border: 3px solid var(--glass-border); border-top-color: var(--primary-color); border-radius: 50%; animation: spin 1s linear infinite; }
    @keyframes spin { to { transform: rotate(360deg); } }

    @media (max-width: 980px) {
      .cart-content { grid-template-columns: 1fr; }
      .summary-card { position: static; }
    }

    @media (max-width: 760px) {
      .cart-header { flex-direction: column; align-items: flex-start; }
      .cart-item { grid-template-columns: 1fr auto; }
      .item-info { grid-column: 1 / -1; }
      .item-price { text-align: right; }
      .remove-btn { justify-self: end; }
    }
  `]
})
export class StorefrontCartComponent {
  constructor(
    public cart: CartService,
    public auth: AuthService,
    private router: Router
  ) { }

  goCheckout() {
    if (this.auth.isLoggedIn()) {
      this.router.navigate(['/shop/checkout']);
    } else {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/shop/cart' } });
    }
  }
}
