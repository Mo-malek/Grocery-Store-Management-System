import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { CartService, CartItem } from '../../core/services/cart.service';
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
        <h1>إتمام الطلب</h1>
        <p>أكمل طلبك في خطوات سريعة.</p>
      </header>

      <div class="steps-bar">
        <div class="step" [class.done]="deliveryForm.form.valid" [class.active]="!deliveryForm.form.valid">
          <span>1</span>
          <label>العنوان</label>
        </div>
        <div class="line"></div>
        <div class="step" [class.done]="deliveryForm.form.valid">
          <span>2</span>
          <label>التوصيل</label>
        </div>
        <div class="line"></div>
        <div class="step" [class.done]="deliveryForm.form.valid">
          <span>3</span>
          <label>الدفع</label>
        </div>
        <div class="line"></div>
        <div class="step" [class.active]="deliveryForm.form.valid" [class.done]="isSubmitting">
          <span>4</span>
          <label>التأكيد</label>
        </div>
      </div>

      <div class="checkout-layout">
        <section class="checkout-main">
          <article class="checkout-card">
            <h2>1) عنوان الشحن</h2>
            
            <div class="saved-addresses" *ngIf="savedAddresses.length">
              <label>استخدم عنوانا محفوظا:</label>
              <div class="addr-chips">
                <button type="button" class="addr-chip" *ngFor="let addr of savedAddresses" (click)="order.address = addr">
                  {{ addr }}
                </button>
              </div>
            </div>

            <form #deliveryForm="ngForm" class="delivery-form" (ngSubmit)="placeOrder()" novalidate>
              <div class="row">
                <div class="field">
                  <label>الاسم الكامل</label>
                  <input type="text" name="fullName" [(ngModel)]="order.fullName" required minlength="2" placeholder="اكتب الاسم الكامل" />
                </div>
                <div class="field">
                  <label>الهاتف</label>
                  <input type="tel" name="phone" [(ngModel)]="order.phone" required pattern="^[0-9()+ -]{7,20}$" placeholder="01xxxxxxxxx" />
                </div>
              </div>
              <div class="field">
                <label>العنوان</label>
                <textarea name="address" [(ngModel)]="order.address" required minlength="8" rows="3" placeholder="المدينة، الحي، الشارع، رقم المبنى"></textarea>
              </div>
              
              <button type="submit" style="display: none;" [disabled]="!deliveryForm.form.valid || isSubmitting || !hasCartItems"></button>
            </form>
          </article>

          <article class="checkout-card">
            <h2>2) خيار التوصيل</h2>
            <label class="option-card">
              <input type="radio" checked name="delivery" />
              <div>
                <strong>توصيل عادي</strong>
                <p>يتم التوصيل في نفس اليوم عند الإمكان.</p>
              </div>
              <span class="price-tag">مجانا</span>
            </label>
          </article>

          <article class="checkout-card">
            <h2>3) طريقة الدفع</h2>
            <label class="option-card">
              <input type="radio" checked name="payment" />
              <div>
                <strong>الدفع عند الاستلام</strong>
                <p>ادفع عند وصول الطلب.</p>
              </div>
              <span class="price-tag">نقدًا</span>
            </label>
          </article>
        </section>

        <aside class="summary-col">
          <article class="summary-card" *ngIf="cart.cart$ | async as items">
            <h3>4) تأكيد الطلب</h3>

            <div class="items">
              <div class="item" *ngFor="let item of items">
                <div class="item-head">
                  <strong>{{ item.product.name }}</strong>
                  <small>x{{ item.quantity }} - {{ item.product.price | number:'1.2-2' }} ج.م</small>
                </div>
                <div class="item-pricing">
                  <span class="line-final">{{ getLineFinalTotal(item) | number:'1.2-2' }} ج.م</span>
                  <small class="line-discount" *ngIf="getLineDiscount(item) > 0">
                    وفر {{ getLineDiscount(item) | number:'1.2-2' }} ج.م
                  </small>
                  <small class="line-original" *ngIf="getLineDiscount(item) > 0">
                    قبل الخصم {{ getLineOriginalTotal(item) | number:'1.2-2' }} ج.م
                  </small>
                </div>
              </div>
            </div>

            <div class="totals">
              <div><span>إجمالي قبل الخصم</span><span>{{ getSubtotalBeforeDiscount(items) | number:'1.2-2' }} ج.م</span></div>
              <div><span>خصم المنتجات</span><span class="discount-val">- {{ getDiscountTotal(items) | number:'1.2-2' }} ج.م</span></div>
              <div><span>إجمالي بعد الخصم</span><span>{{ getSubtotalAfterDiscount(items) | number:'1.2-2' }} ج.م</span></div>
              <div><span>التوصيل</span><span class="free">مجانا</span></div>
              <div class="total"><span>الإجمالي</span><span>{{ getGrandTotal(items) | number:'1.2-2' }} ج.م</span></div>
            </div>

            <button type="button" class="confirm-btn" (click)="placeOrder()" [disabled]="!deliveryForm.form.valid || isSubmitting || !hasCartItems">
              <span *ngIf="!isSubmitting">تأكيد الطلب</span>
              <span *ngIf="isSubmitting">جاري الإرسال...</span>
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

    .saved-addresses {
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border-color);
    }
    .saved-addresses label {
      display: block;
      font-size: 0.8rem;
      font-weight: 700;
      color: var(--text-muted);
      margin-bottom: 0.5rem;
    }
    .addr-chips {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .addr-chip {
      background: var(--surface-soft);
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.8rem;
      border-radius: 8px;
      font-size: 0.78rem;
      cursor: pointer;
      color: var(--text-main);
      transition: all 0.2s ease;
      text-align: right;
    }
    .addr-chip:hover {
      border-color: var(--primary-color);
      background: rgba(var(--primary-rgb), 0.1);
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
      padding: 0.4rem 0;
      border-bottom: 1px dashed var(--border-color);
    }

    .item:last-child {
      border-bottom: none;
      padding-bottom: 0;
    }

    .item-head {
      display: flex;
      flex-direction: column;
      gap: 0.18rem;
      min-width: 0;
      flex: 1;
    }

    .item-head strong {
      display: block;
      color: var(--text-main);
      line-height: 1.35;
      word-break: break-word;
    }

    .item-head small {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .item-pricing {
      display: flex;
      flex-direction: column;
      align-items: flex-end;
      gap: 0.08rem;
      white-space: nowrap;
      flex-shrink: 0;
    }

    .line-final {
      color: var(--text-main);
      font-weight: 700;
    }

    .line-discount {
      color: var(--success-color);
      font-size: 0.74rem;
      font-weight: 700;
    }

    .line-original {
      color: var(--text-muted);
      font-size: 0.72rem;
      text-decoration: line-through;
    }

    .discount-val {
      color: var(--success-color);
      font-weight: 700;
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
  deliveryFee = 0;
  savedAddresses: string[] = [];
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

    const saved = localStorage.getItem('customer-addresses');
    if (saved) {
      try {
        this.savedAddresses = JSON.parse(saved);
      } catch {
        this.savedAddresses = [];
      }
    }

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
      this.toast.warning('السلة فارغة.');
      return;
    }
    if (!this.order.fullName?.trim() || !this.order.address?.trim() || !this.order.phone?.trim()) {
      this.toast.warning('يرجى استكمال بيانات الشحن.');
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
        this.toast.success('تم إرسال الطلب بنجاح.');
        this.cart.clearCart();
        this.isSubmitting = false;
        this.router.navigate(['/shop/orders']);
      },
      error: () => {
        this.toast.error('فشل إرسال الطلب. حاول مرة أخرى.');
        this.isSubmitting = false;
      }
    });
  }

  getDiscountPercent(item: CartItem): number {
    const discount = Number(item.product.discountPercentage ?? 0);
    if (!Number.isFinite(discount) || discount <= 0) {
      return 0;
    }
    return Math.min(discount, 99.99);
  }

  getUnitOriginalPrice(item: CartItem): number {
    const discount = this.getDiscountPercent(item);
    if (discount <= 0) {
      return this.roundMoney(item.product.price);
    }

    const divisor = 1 - (discount / 100);
    if (divisor <= 0) {
      return this.roundMoney(item.product.price);
    }

    return this.roundMoney(item.product.price / divisor);
  }

  getLineOriginalTotal(item: CartItem): number {
    return this.roundMoney(this.getUnitOriginalPrice(item) * item.quantity);
  }

  getLineFinalTotal(item: CartItem): number {
    return this.roundMoney(item.product.price * item.quantity);
  }

  getLineDiscount(item: CartItem): number {
    return this.roundMoney(Math.max(0, this.getLineOriginalTotal(item) - this.getLineFinalTotal(item)));
  }

  getSubtotalBeforeDiscount(items: CartItem[]): number {
    return this.roundMoney(items.reduce((sum, item) => sum + this.getLineOriginalTotal(item), 0));
  }

  getSubtotalAfterDiscount(items: CartItem[]): number {
    return this.roundMoney(items.reduce((sum, item) => sum + this.getLineFinalTotal(item), 0));
  }

  getDiscountTotal(items: CartItem[]): number {
    return this.roundMoney(items.reduce((sum, item) => sum + this.getLineDiscount(item), 0));
  }

  getGrandTotal(items: CartItem[]): number {
    return this.roundMoney(this.getSubtotalAfterDiscount(items) + this.deliveryFee);
  }

  private roundMoney(value: number): number {
    const numericValue = Number(value);
    if (!Number.isFinite(numericValue)) {
      return 0;
    }
    return Math.round((numericValue + Number.EPSILON) * 100) / 100;
  }
}
