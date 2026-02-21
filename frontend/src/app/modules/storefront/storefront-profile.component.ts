import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { DeliveryOrder, StorefrontProduct } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { Subscription } from 'rxjs';
import { resolveImageUrl } from '../../core/utils/image-url.util';

type ProfileTab = 'dashboard' | 'orders' | 'wishlist' | 'addresses' | 'settings';

@Component({
  selector: 'app-storefront-profile',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterModule],
  template: `
    <section class="profile-page">
      <div class="profile-layout">
        <aside class="sidebar">
          <div class="profile-head">
            <div class="avatar">{{ (auth.currentUserValue?.username || 'U').charAt(0).toUpperCase() }}</div>
            <div>
              <strong>{{ auth.currentUserValue?.username || 'زائر' }}</strong>
              <p>حساب العميل</p>
            </div>
          </div>

          <button [class.active]="activeTab === 'dashboard'" (click)="setTab('dashboard')">لوحة الحساب</button>
          <button [class.active]="activeTab === 'orders'" (click)="setTab('orders')">طلباتي</button>
          <button [class.active]="activeTab === 'wishlist'" (click)="setTab('wishlist')">المفضلة</button>
          <button [class.active]="activeTab === 'addresses'" (click)="setTab('addresses')">العناوين</button>
          <button [class.active]="activeTab === 'settings'" (click)="setTab('settings')">الإعدادات</button>
          <button class="logout" (click)="logout()">تسجيل الخروج</button>
        </aside>

        <section class="content">
          <article class="panel" *ngIf="activeTab === 'dashboard'">
            <h1>مرحبا بعودتك، {{ auth.currentUserValue?.username || 'عميل' }}</h1>
            <p class="sub">تابع طلباتك، واحفظ المفضلة، وأدر حسابك بسهولة.</p>

            <div class="stats-grid">
              <div class="stat-card">
                <span>إجمالي الطلبات</span>
                <strong>{{ orders.length }}</strong>
              </div>
              <div class="stat-card">
                <span>عناصر المفضلة</span>
                <strong>{{ wishlistItems.length }}</strong>
              </div>
              <div class="stat-card">
                <span>تم التسليم</span>
                <strong>{{ deliveredCount }}</strong>
              </div>
            </div>

            <div class="panel-section" *ngIf="lastOrder">
              <h2>آخر طلب</h2>
              <div class="order-card compact">
                <div>
                  <strong>#{{ lastOrder.id }}</strong>
                  <span>{{ lastOrder.createdAt | date:'mediumDate' }}</span>
                </div>
                <span class="status" [attr.data-status]="lastOrder.status">{{ getStatusLabel(lastOrder.status) }}</span>
              </div>
            </div>
          </article>

          <article class="panel" *ngIf="activeTab === 'orders'">
            <h1>طلباتي</h1>
            <p class="sub" *ngIf="isOrdersLoading">جاري تحميل طلباتك...</p>
            <p class="sub error" *ngIf="!isOrdersLoading && ordersError">{{ ordersError }}</p>
            <div class="orders-list" *ngIf="orders.length; else noOrders">
              <article class="order-card" *ngFor="let order of orders">
                <header>
                  <div>
                    <strong>طلب رقم #{{ order.id }}</strong>
                    <span>{{ order.createdAt | date:'medium' }}</span>
                  </div>
                  <span class="status" [attr.data-status]="order.status">{{ getStatusLabel(order.status) }}</span>
                </header>
                <div class="items">
                  <div class="item" *ngFor="let item of order.items">
                    <span>{{ item.productName }} x{{ item.quantity }}</span>
                    <span>{{ (item.unitPrice * item.quantity) | number:'1.2-2' }} ج.م</span>
                  </div>
                </div>
                <footer>
                  <span>الإجمالي</span>
                  <strong>{{ order.totalAmount | number:'1.2-2' }} ج.م</strong>
                </footer>
              </article>
            </div>
            <ng-template #noOrders>
              <p class="empty">لا توجد طلبات بعد.</p>
            </ng-template>
          </article>

          <article class="panel" *ngIf="activeTab === 'wishlist'">
            <h1>المفضلة</h1>
            <div class="wishlist-grid" *ngIf="wishlistItems.length; else emptyWishlist">
              <article class="wish-card" *ngFor="let item of wishlistItems">
                <img [src]="getImageUrl(item.imageUrl)" [alt]="item.name" />
                <h3>{{ item.name }}</h3>
                <span>{{ item.price | number:'1.2-2' }} ج.م</span>
                <div class="actions">
                  <button (click)="addWishToCart(item)">أضف للسلة</button>
                  <button class="ghost" (click)="wishlist.remove(item.id)">إزالة</button>
                </div>
              </article>
            </div>
            <ng-template #emptyWishlist>
              <p class="empty">لا توجد عناصر في المفضلة بعد.</p>
            </ng-template>
          </article>

          <article class="panel" *ngIf="activeTab === 'addresses'">
            <h1>العناوين</h1>
            <div class="address-form">
              <input type="text" [(ngModel)]="newAddress" placeholder="أضف عنوانا جديدا" />
              <button (click)="addAddress()">حفظ</button>
            </div>
            <div class="address-list" *ngIf="addresses.length; else noAddresses">
              <div class="address-item" *ngFor="let addr of addresses; let i = index">
                <span>{{ addr }}</span>
                <button (click)="removeAddress(i)">حذف</button>
              </div>
            </div>
            <ng-template #noAddresses>
              <p class="empty">لا توجد عناوين محفوظة.</p>
            </ng-template>
          </article>

          <article class="panel" *ngIf="activeTab === 'settings'">
            <h1>الإعدادات</h1>
            <p class="sub">يمكنك تحديث بيانات الحساب وكلمة المرور لاحقا من إعدادات الهوية.</p>
            <div class="setting-card">
              <label>اسم المستخدم</label>
              <input [value]="auth.currentUserValue?.username" disabled />
            </div>
            <div class="setting-card">
              <label>الدور</label>
              <input [value]="auth.currentUserValue?.role" disabled />
            </div>
          </article>
        </section>
      </div>
    </section>
  `,
  styles: [`
    .profile-page {
      max-width: 1260px;
      margin: 0 auto;
      padding: 1rem;
    }

    .profile-layout {
      display: grid;
      grid-template-columns: 260px 1fr;
      gap: 1rem;
      align-items: start;
    }

    .sidebar,
    .panel {
      border: 1px solid var(--border-color);
      border-radius: var(--radius-lg);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
    }

    .sidebar {
      padding: 0.9rem;
      position: sticky;
      top: 124px;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .profile-head {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      padding: 0.55rem 0.4rem 0.8rem;
      border-bottom: 1px solid var(--border-color);
      margin-bottom: 0.25rem;
    }

    .avatar {
      width: 42px;
      height: 42px;
      border-radius: 12px;
      background: var(--primary-color);
      color: #fff;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-weight: 800;
    }

    .profile-head strong {
      display: block;
      font-size: 0.9rem;
    }

    .profile-head p {
      margin: 0.1rem 0 0;
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .sidebar button {
      min-height: 40px;
      border: 1px solid transparent;
      border-radius: 10px;
      background: transparent;
      color: var(--text-main);
      text-align: left;
      padding: 0.55rem 0.75rem;
      font-weight: 600;
      cursor: pointer;
    }

    .sidebar button:hover {
      background: var(--surface-soft);
    }

    .sidebar button.active {
      background: rgba(var(--primary-rgb), 0.12);
      color: var(--primary-color);
      border-color: rgba(var(--primary-rgb), 0.35);
    }

    .sidebar .logout {
      margin-top: 0.4rem;
      border-color: var(--danger-color);
      color: var(--danger-color);
      background: var(--danger-soft);
    }

    .content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }

    .panel {
      padding: 1rem;
    }

    .panel h1 {
      margin: 0;
      font-size: 1.4rem;
    }

    .sub {
      color: var(--text-muted);
      margin: 0.4rem 0 0;
      font-size: 0.88rem;
    }

    .sub.error {
      color: var(--danger-color);
    }

    .stats-grid {
      margin-top: 0.9rem;
      display: grid;
      grid-template-columns: repeat(3, minmax(0, 1fr));
      gap: 0.7rem;
    }

    .stat-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--surface-soft);
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
    }

    .stat-card span {
      color: var(--text-muted);
      font-size: 0.75rem;
    }

    .stat-card strong {
      color: var(--text-main);
      font-size: 1.2rem;
    }

    .panel-section {
      margin-top: 1rem;
    }

    .panel-section h2 {
      margin: 0 0 0.6rem;
      font-size: 1rem;
    }

    .orders-list {
      margin-top: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.7rem;
    }

    .order-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      padding: 0.8rem;
      display: flex;
      flex-direction: column;
      gap: 0.6rem;
    }

    .order-card.compact {
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
    }

    .order-card header {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 0.7rem;
    }

    .order-card header strong {
      display: block;
      font-size: 0.9rem;
    }

    .order-card header span {
      color: var(--text-muted);
      font-size: 0.78rem;
    }

    .status {
      border-radius: 999px;
      padding: 0.2rem 0.65rem;
      font-size: 0.75rem;
      font-weight: 700;
      border: 1px solid transparent;
      white-space: nowrap;
      align-self: flex-start;
      background: var(--surface-soft);
      color: var(--text-secondary);
    }

    .status[data-status="PENDING"] {
      background: var(--warning-soft);
      color: var(--warning-color);
      border-color: rgba(217, 119, 6, 0.35);
    }

    .status[data-status="PREPARING"] {
      background: var(--info-soft);
      color: var(--primary-color);
      border-color: rgba(var(--primary-rgb), 0.35);
    }

    .status[data-status="OUT_FOR_DELIVERY"] {
      background: rgba(124, 58, 237, 0.14);
      color: #7C3AED;
      border-color: rgba(124, 58, 237, 0.32);
    }

    .status[data-status="DELIVERED"] {
      background: var(--success-soft);
      color: var(--success-color);
      border-color: rgba(22, 163, 74, 0.32);
    }

    .status[data-status="CANCELLED"] {
      background: var(--danger-soft);
      color: var(--danger-color);
      border-color: rgba(220, 38, 38, 0.32);
    }

    .items {
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .item {
      display: flex;
      justify-content: space-between;
      gap: 0.65rem;
      font-size: 0.82rem;
      color: var(--text-secondary);
    }

    .order-card footer {
      border-top: 1px solid var(--border-color);
      padding-top: 0.55rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      color: var(--text-secondary);
      font-size: 0.85rem;
    }

    .order-card footer strong {
      color: var(--secondary-color);
      font-size: 1rem;
    }

    .wishlist-grid {
      margin-top: 0.8rem;
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.7rem;
    }

    .wish-card {
      border: 1px solid var(--border-color);
      border-radius: 12px;
      background: var(--bg-card);
      padding: 0.7rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
      min-height: 245px;
    }

    .wish-card img {
      width: 100%;
      aspect-ratio: 1 / 1;
      border-radius: 10px;
      border: 1px solid var(--border-color);
      background: var(--image-surface);
      object-fit: contain;
      padding: 0.45rem;
    }

    .wish-card h3 {
      margin: 0;
      font-size: 0.9rem;
      line-height: 1.35;
      min-height: 2.42rem;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }

    .wish-card span {
      margin-top: auto;
      color: var(--secondary-color);
      font-weight: 800;
      font-size: 0.9rem;
    }

    .wish-card .actions {
      display: flex;
      gap: 0.45rem;
    }

    .wish-card button {
      flex: 1;
      min-height: 38px;
      border: none;
      border-radius: 10px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      font-weight: 700;
      cursor: pointer;
    }

    .wish-card button.ghost {
      background: transparent;
      color: var(--text-main);
      border: 1px solid var(--border-color);
    }

    .address-form {
      margin-top: 0.8rem;
      display: flex;
      gap: 0.5rem;
    }

    .address-form input {
      flex: 1;
      min-height: 42px;
      border: 1px solid var(--input-border-color);
      border-radius: 10px;
      padding: 0.55rem 0.7rem;
      background: var(--bg-card);
      color: var(--text-main);
      outline: none;
    }

    .address-form button {
      min-height: 42px;
      border: none;
      border-radius: 10px;
      padding: 0 0.85rem;
      background: var(--secondary-color);
      color: var(--secondary-text);
      font-weight: 700;
      cursor: pointer;
    }

    .address-list {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.45rem;
    }

    .address-item {
      border: 1px solid var(--border-color);
      border-radius: 10px;
      padding: 0.6rem 0.75rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 0.5rem;
      color: var(--text-main);
      font-size: 0.86rem;
    }

    .address-item button {
      border: 1px solid var(--danger-color);
      background: var(--danger-soft);
      color: var(--danger-color);
      border-radius: 8px;
      min-height: 32px;
      padding: 0 0.5rem;
      cursor: pointer;
      font-size: 0.76rem;
      font-weight: 700;
    }

    .setting-card {
      margin-top: 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
    }

    .setting-card label {
      color: var(--text-secondary);
      font-size: 0.8rem;
      font-weight: 700;
    }

    .setting-card input {
      min-height: 42px;
      border: 1px solid var(--input-border-color);
      border-radius: 10px;
      padding: 0.55rem 0.7rem;
      background: var(--surface-soft);
      color: var(--text-main);
      outline: none;
    }

    .empty {
      color: var(--text-muted);
      margin-top: 0.8rem;
      font-size: 0.9rem;
    }

    @media (max-width: 980px) {
      .profile-layout {
        grid-template-columns: 1fr;
      }

      .sidebar {
        position: static;
      }
    }

    @media (max-width: 680px) {
      .stats-grid,
      .wishlist-grid {
        grid-template-columns: 1fr;
      }

      .address-form {
        flex-direction: column;
      }
    }
  `]
})
export class StorefrontProfileComponent implements OnInit, OnDestroy {
  activeTab: ProfileTab = 'dashboard';
  orders: DeliveryOrder[] = [];
  wishlistItems: StorefrontProduct[] = [];

  addresses: string[] = [];
  newAddress = '';
  isOrdersLoading = false;
  ordersError = '';
  private refreshTimer?: ReturnType<typeof setInterval>;
  private readonly subscriptions = new Subscription();

  constructor(
    private api: ApiService,
    public auth: AuthService,
    private cart: CartService,
    public wishlist: WishlistService,
    private route: ActivatedRoute,
    private router: Router,
    private toast: ToastService
  ) { }

  ngOnInit(): void {
    const savedAddresses = localStorage.getItem('customer-addresses');
    if (savedAddresses) {
      try {
        this.addresses = JSON.parse(savedAddresses);
      } catch {
        this.addresses = [];
      }
    }

    this.subscriptions.add(this.route.queryParamMap.subscribe(params => {
      const tab = params.get('tab') as ProfileTab | null;
      if (tab && ['dashboard', 'orders', 'wishlist', 'addresses', 'settings'].includes(tab)) {
        this.activeTab = tab;
      }
    }));

    if (this.auth.isLoggedIn()) {
      this.loadOrders();
      this.refreshTimer = setInterval(() => this.loadOrders(true), 20000);
    }

    this.subscriptions.add(this.wishlist.items$.subscribe(items => this.wishlistItems = items));
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
    }
  }

  get deliveredCount() {
    return this.orders.filter(o => o.status === 'DELIVERED').length;
  }

  get lastOrder() {
    return this.orders.length ? this.orders[0] : null;
  }

  setTab(tab: ProfileTab) {
    this.activeTab = tab;
    this.router.navigate([], {
      relativeTo: this.route,
      queryParams: { tab },
      replaceUrl: true,
      queryParamsHandling: 'merge'
    });
  }

  getStatusLabel(status: string): string {
    switch (status) {
      case 'PENDING': return 'قيد الانتظار';
      case 'PREPARING': return 'جاري التجهيز';
      case 'OUT_FOR_DELIVERY': return 'خرج للتوصيل';
      case 'DELIVERED': return 'تم التسليم';
      case 'CANCELLED': return 'ملغي';
      default: return status;
    }
  }

  addWishToCart(item: StorefrontProduct) {
    this.cart.addToCart(item, 1);
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }

  addAddress() {
    const value = this.newAddress.trim();
    if (!value) return;
    this.addresses = [value, ...this.addresses];
    this.newAddress = '';
    this.saveAddresses();
  }

  removeAddress(index: number) {
    this.addresses.splice(index, 1);
    this.addresses = [...this.addresses];
    this.saveAddresses();
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/shop/home']);
  }

  private loadOrders(silent: boolean = false) {
    if (!silent) {
      this.isOrdersLoading = true;
    }
    this.ordersError = '';
    this.api.getMyOrders().subscribe({
      next: o => {
        this.orders = o || [];
        this.isOrdersLoading = false;
      },
      error: () => {
        this.orders = [];
        this.isOrdersLoading = false;
        this.ordersError = 'فشل تحميل الطلبات.';
        if (!silent) {
          this.toast.error('فشل تحميل الطلبات');
        }
      }
    });
  }

  private saveAddresses() {
    localStorage.setItem('customer-addresses', JSON.stringify(this.addresses));
  }
}
