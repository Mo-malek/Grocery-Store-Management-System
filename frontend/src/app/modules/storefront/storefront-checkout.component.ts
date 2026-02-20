import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService } from '../../core/services/cart.service';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { ToastService } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-storefront-checkout',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="checkout-page">
      <header class="checkout-header">
        <h1>Checkout</h1>
        <p>Complete your order in a few quick steps.</p>
      </header>

      <div class="steps-bar">
        <div class="step done">
          <span>1</span>
          <label>Address</label>
        </div>
        <div class="line"></div>
        <div class="step done">
          <span>2</span>
          <label>Delivery</label>
        </div>
        <div class="line"></div>
        <div class="step done">
          <span>3</span>
          <label>Payment</label>
        </div>
        <div class="line"></div>
        <div class="step active">
          <span>4</span>
          <label>Confirm</label>
        </div>
      </div>

      <div class="checkout-layout">
        <section class="checkout-main">
          <article class="checkout-card">
            <h2>1) Shipping Address</h2>
            <form #deliveryForm="ngForm" class="delivery-form" novalidate>
              <div class="row">
                <div class="field">
                  <label>Full name</label>
                  <input type="text" name="name" [(ngModel)]="order.fullName" required minlength="2" placeholder="John Doe" />
                </div>
                <div class="field">
                  <label>Phone</label>
                  <input type="tel" name="phone" [(ngModel)]="order.phone" required pattern="^[0-9+()\\-\\s]{7,20}$" placeholder="01xxxxxxxxx" />
                </div>
              </div>
              <div class="field">
                <label>Address</label>
                <textarea name="address" [(ngModel)]="order.address" required minlength="8" rows="3" placeholder="City, district, street, building"></textarea>
              </div>
            </form>
          </article>

          <article class="checkout-card">
            <h2>2) Delivery Option</h2>
            <label class="option-card">
              <input type="radio" checked name="delivery" />
              <div>
                <strong>Standard delivery</strong>
                <p>Delivered within the same day when possible.</p>
              </div>
              <span class="price-tag">Free</span>
            </label>
          </article>

          <article class="checkout-card">
            <h2>3) Payment Method</h2>
            <label class="option-card">
              <input type="radio" checked name="payment" />
              <div>
                <strong>Cash on delivery</strong>
                <p>Pay when your order arrives.</p>
              </div>
              <span class="price-tag">COD</span>
            </label>
          </article>
        </section>

        <aside class="summary-col">
          <article class="summary-card">
            <h3>4) Confirm Order</h3>

            <div class="items">
              <div class="item" *ngFor="let item of (cart.cart$ | async)">
                <div>
                  <strong>{{ item.product.name }}</strong>
                  <small>x{{ item.quantity }}</small>
                </div>
                <span>{{ (item.product.price * item.quantity) | number:'1.2-2' }} EGP</span>
              </div>
            </div>

            <div class="totals">
              <div><span>Subtotal</span><span>{{ cart.getTotal() | number:'1.2-2' }} EGP</span></div>
              <div><span>Delivery</span><span class="free">Free</span></div>
              <div><span>Discount</span><span>0.00 EGP</span></div>
              <div class="total"><span>Total</span><span>{{ cart.getTotal() | number:'1.2-2' }} EGP</span></div>
            </div>

            <button class="confirm-btn" [disabled]="!deliveryForm.form.valid || isSubmitting || !hasCartItems" (click)="placeOrder()">
              <span *ngIf="!isSubmitting">Confirm Order</span>
              <span *ngIf="isSubmitting">Submitting...</span>
            </button>
          </article>
        </aside>
      </div>
    </section>
  `,
  styles: [`
    .checkout-page {
      max-width: 1240px;
      margin: 0 auto;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .checkout-header h1 {
      margin: 0;
      font-size: 1.8rem;
    }

    .checkout-header p {
      margin: 0.35rem 0 0;
      color: var(--text-muted);
    }

    .steps-bar {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
      padding: 0.8rem;
      display: grid;
      grid-template-columns: auto 1fr auto 1fr auto 1fr auto;
      gap: 0.4rem;
      align-items: center;
    }

    .step {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 0.2rem;
    }

    .step span {
      width: 30px;
      height: 30px;
      border-radius: 50%;
      border: 1px solid var(--border-color);
      background: var(--surface-soft);
      color: var(--text-main);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.8rem;
      font-weight: 800;
    }

    .step.done span,
    .step.active span {
      background: var(--primary-color);
      color: #fff;
      border-color: var(--primary-color);
    }

    .step label {
      font-size: 0.74rem;
      color: var(--text-secondary);
      font-weight: 600;
    }

    .line {
      height: 1px;
      background: var(--border-color);
    }

    .checkout-layout {
      display: grid;
      grid-template-columns: 1fr 360px;
      gap: 1rem;
      align-items: start;
    }

    .checkout-main {
      display: flex;
      flex-direction: column;
      gap: 0.9rem;
    }

    .checkout-card {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }

    .checkout-card h2 {
      margin: 0;
      font-size: 1.1rem;
    }

    .row {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 0.75rem;
    }

    .field {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .field label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .field input,
    .field textarea {
      min-height: 42px;
      border: 1px solid var(--input-border-color);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
      background: var(--bg-card);
      color: var(--text-main);
      outline: none;
      font-family: inherit;
    }

    .field textarea {
      min-height: 96px;
      resize: vertical;
    }

    .field input:focus,
    .field textarea:focus {
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring-shadow);
    }

    .option-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      padding: 0.7rem;
      background: var(--surface-soft);
      display: flex;
      align-items: center;
      gap: 0.7rem;
      cursor: pointer;
    }

    .option-card input {
      margin: 0;
    }

    .option-card strong {
      display: block;
      color: var(--text-main);
      margin-bottom: 0.2rem;
    }

    .option-card p {
      margin: 0;
      color: var(--text-muted);
      font-size: 0.8rem;
    }

    .price-tag {
      margin-left: auto;
      background: var(--primary-color);
      color: #fff;
      border-radius: 999px;
      padding: 0.2rem 0.55rem;
      font-size: 0.74rem;
      font-weight: 700;
    }

    .summary-card {
      position: sticky;
      top: 124px;
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }

    .summary-card h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
      max-height: 220px;
      overflow-y: auto;
      padding-right: 0.2rem;
    }

    .item {
      display: flex;
      align-items: flex-start;
      justify-content: space-between;
      gap: 0.6rem;
      font-size: 0.82rem;
    }

    .item strong {
      display: block;
      color: var(--text-main);
      line-height: 1.35;
    }

    .item small {
      color: var(--text-muted);
    }

    .totals {
      border-top: 1px solid var(--border-color);
      padding-top: 0.6rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      font-size: 0.85rem;
      color: var(--text-secondary);
    }

    .totals > div {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.75rem;
    }

    .totals .total {
      color: var(--text-main);
      font-size: 1rem;
      font-weight: 800;
      margin-top: 0.2rem;
    }

    .totals .total span:last-child {
      color: var(--secondary-color);
    }

    .free {
      color: var(--success-color);
      font-weight: 700;
    }

    .confirm-btn {
      min-height: 46px;
      border: none;
      border-radius: 12px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      font-weight: 800;
      cursor: pointer;
    }

    .confirm-btn:hover {
      background: var(--secondary-hover);
    }

    .confirm-btn:disabled {
      opacity: 0.55;
      cursor: not-allowed;
    }

    @media (max-width: 980px) {
      .checkout-layout {
        grid-template-columns: 1fr;
      }

      .summary-card {
        position: static;
      }
    }

    @media (max-width: 700px) {
      .steps-bar {
        grid-template-columns: repeat(4, minmax(0, 1fr));
        gap: 0.5rem;
      }

      .steps-bar .line {
        display: none;
      }

      .row {
        grid-template-columns: 1fr;
      }
    }
  `]
})
export class StorefrontCheckoutComponent implements OnInit, OnDestroy {
  order: any = {
    fullName: '',
    phone: '',
    address: '',
    items: []
  };
  isSubmitting = false;
  hasCartItems = false;
  private readonly subscriptions = new Subscription();

  constructor(
    public cart: CartService,
    private api: ApiService,
    private auth: AuthService,
    private toast: ToastService,
    private router: Router
  ) { }

  ngOnInit(): void {
    if (!this.auth.isLoggedIn()) {
      this.router.navigate(['/login'], { queryParams: { returnUrl: '/shop/checkout' } });
      return;
    }

    this.subscriptions.add(this.auth.currentUser.subscribe(user => {
      if (user) this.order.fullName = user.username || '';
    }));

    this.subscriptions.add(this.cart.cart$.subscribe(items => {
      this.hasCartItems = items.length > 0;
      if (items.length === 0) {
        this.router.navigate(['/shop/home']);
      }
      this.order.items = items.map(i => ({
        productId: i.product.id,
        quantity: i.quantity
      }));
    }));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  placeOrder() {
    if (!this.order.items?.length) {
      this.toast.warning('Your cart is empty.');
      return;
    }
    if (!this.order.fullName?.trim() || !this.order.address?.trim() || !this.order.phone?.trim()) {
      this.toast.warning('Please complete shipping information.');
      return;
    }

    this.isSubmitting = true;
    const request = {
      fullName: this.order.fullName.trim(),
      phone: this.order.phone.trim(),
      address: this.order.address.trim(),
      items: this.order.items
    };

    this.api.placeOrder(request).subscribe({
      next: () => {
        this.toast.success('Order placed successfully.');
        this.cart.clearCart();
        this.isSubmitting = false;
        this.router.navigate(['/shop/orders']);
      },
      error: () => {
        this.toast.error('Failed to place order. Please try again.');
        this.isSubmitting = false;
      }
    });
  }
}
