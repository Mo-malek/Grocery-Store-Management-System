import { Component, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';

import { AuthService } from '../../core/services/auth.service';
import { CartService } from '../../core/services/cart.service';
import { WishlistService } from '../../core/services/wishlist.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-storefront-layout',
  standalone: true,
  imports: [CommonModule, RouterModule, FormsModule],
  template: `
    <div class="sf-shell">
      <header class="sf-header">
        <div class="announcement-bar">
          <span>توصيل مجاني للطلبات فوق 300 ج.م</span>
        </div>

        <div class="nav-main">
          <a class="logo-group" routerLink="/shop/home" aria-label="الرئيسية">
            <span class="logo-icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H6L8.6 15.5H18.5L20.2 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                <circle cx="9.8" cy="18.2" r="1.3" fill="currentColor"></circle>
                <circle cx="17.2" cy="18.2" r="1.3" fill="currentColor"></circle>
              </svg>
            </span>
            <span class="logo">بقالتي</span>
          </a>

          <div class="search-wrap">
            <input
              type="search"
              placeholder="ابحث عن المنتجات والعروض"
              [(ngModel)]="searchTerm"
              (keyup.enter)="goSearch()" />
            <button type="button" (click)="goSearch()" aria-label="بحث">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <circle cx="11" cy="11" r="6.8" stroke="currentColor" stroke-width="2"></circle>
                <path d="M20 20L16.7 16.7" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
              </svg>
            </button>
          </div>

          <div class="nav-actions">
            <select class="theme-select" (change)="setTheme($any($event.target).value)" [value]="currentTheme">
              <option value="theme-light">فاتح</option>
              <option value="theme-dark">داكن</option>
            </select>

            <a class="action-pill" routerLink="/shop/profile">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"></circle>
                <path d="M5 19C5 15.8 7.7 14 11 14H13C16.3 14 19 15.8 19 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
              <span>الحساب</span>
            </a>

            <a class="action-pill" [routerLink]="['/shop/profile']" [queryParams]="{ tab: 'wishlist' }">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M12 20.2L4.6 12.8C2.8 11 2.8 8.1 4.6 6.3C6.4 4.5 9.3 4.5 11.1 6.3L12 7.2L12.9 6.3C14.7 4.5 17.6 4.5 19.4 6.3C21.2 8.1 21.2 11 19.4 12.8L12 20.2Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
              </svg>
              <span>المفضلة</span>
              <span class="count-badge" *ngIf="wishlistCount > 0">{{ wishlistCount }}</span>
            </a>

            <a class="action-pill cart-pill" routerLink="/shop/cart">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M6 9H18L17 20H7L6 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
                <path d="M9 9V7.5A3 3 0 0 1 12 4.5A3 3 0 0 1 15 7.5V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
              <span>السلة</span>
              <span class="count-badge">{{ cartCount }}</span>
            </a>

            <ng-container *ngIf="auth.currentUser | async as user; else guest">
              <a class="account-link" routerLink="/shop/profile">{{ user.username }}</a>
              <button class="logout-btn" (click)="logout()">تسجيل الخروج</button>
            </ng-container>
            <ng-template #guest>
              <a class="account-link" routerLink="/login">تسجيل الدخول</a>
            </ng-template>
          </div>
        </div>

        <nav class="desktop-nav">
          <a routerLink="/shop/home" routerLinkActive="active">الرئيسية</a>
          <a routerLink="/shop/categories" routerLinkActive="active">الأقسام</a>
          <a routerLink="/shop/offers" routerLinkActive="active">العروض</a>
          <a routerLink="/shop/catalog" routerLinkActive="active">المنتجات</a>
          <a routerLink="/shop/profile" routerLinkActive="active">حسابي</a>
        </nav>
      </header>

      <main class="fade-in">
        <router-outlet></router-outlet>
      </main>

      <nav class="mobile-bottom-nav">
        <a routerLink="/shop/home" routerLinkActive="active">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M4 10.5L12 4L20 10.5V20H14.8V14.5H9.2V20H4V10.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
          </svg>
          <span>الرئيسية</span>
        </a>
        <a routerLink="/shop/categories" routerLinkActive="active">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M4 7H10L12 9H20V18.5H4V7Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
          </svg>
          <span>الأقسام</span>
        </a>
        <a routerLink="/shop/cart" routerLinkActive="active">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M6 9H18L17 20H7L6 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
            <path d="M9 9V7.5A3 3 0 0 1 12 4.5A3 3 0 0 1 15 7.5V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          <span>السلة</span>
          <span class="badge" *ngIf="cartCount > 0">{{ cartCount }}</span>
        </a>
        <a routerLink="/shop/profile" routerLinkActive="active">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
            <circle cx="12" cy="8" r="3.2" stroke="currentColor" stroke-width="1.8"></circle>
            <path d="M5 19C5 15.8 7.7 14 11 14H13C16.3 14 19 15.8 19 19" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
          <span>حسابي</span>
        </a>
      </nav>

      <footer class="sf-footer">
        <div class="footer-content">
          <div>(c) 2026 بقالتي</div>
          <div class="foot-links">
            <a href="javascript:void(0)">الشروط</a>
            <a href="javascript:void(0)">الخصوصية</a>
            <a href="javascript:void(0)">الدعم</a>
          </div>
        </div>
      </footer>
    </div>
  `,
  styles: [`
    .sf-shell {
      min-height: 100vh;
      background: var(--bg-main);
      color: var(--text-main);
      display: flex;
      flex-direction: column;
      overflow-x: hidden;
    }

    .sf-header {
      position: sticky;
      top: 0;
      z-index: 110;
      border-bottom: 1px solid var(--border-color);
      background: var(--bg-card);
      box-shadow: var(--shadow-xs);
    }

    .announcement-bar {
      background: #1E3A8A;
      color: #fff;
      min-height: 38px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.82rem;
      font-weight: 600;
      padding: 0.3rem 1rem;
      text-align: center;
    }

    .nav-main {
      display: grid;
      grid-template-columns: 180px minmax(0, 1fr) auto;
      gap: 1rem;
      align-items: center;
      padding: 0.7rem 1.25rem;
      border-bottom: 1px solid var(--border-color);
    }

    .logo-group {
      display: inline-flex;
      align-items: center;
      gap: 0.55rem;
      text-decoration: none;
      color: var(--text-main);
    }

    .logo-icon {
      width: 38px;
      height: 38px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      background: rgba(var(--primary-rgb), 0.12);
      border: 1px solid rgba(var(--primary-rgb), 0.3);
      border-radius: 12px;
      flex-shrink: 0;
    }

    .logo {
      font-weight: 800;
      font-size: 1.2rem;
      line-height: 1;
      letter-spacing: -0.3px;
    }

    .search-wrap {
      display: flex;
      align-items: center;
      background: var(--bg-card);
      border: 1px solid var(--input-border-color);
      border-radius: 999px;
      min-height: 44px;
      overflow: hidden;
      width: 100%;
      max-width: 760px;
      justify-self: center;
    }

    .search-wrap:focus-within {
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring-shadow);
    }

    .search-wrap input {
      flex: 1;
      border: none;
      background: transparent;
      color: var(--text-main);
      padding: 0.65rem 1rem;
      outline: none;
      font-size: 0.95rem;
    }

    .search-wrap button {
      border: none;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      margin-left: 0.25rem;
      margin-right: 0.25rem;
      background: var(--secondary-color);
      color: var(--secondary-text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      cursor: pointer;
      transition: background 0.2s ease;
    }

    .search-wrap button:hover {
      background: var(--secondary-hover);
    }

    .nav-actions {
      display: flex;
      align-items: center;
      gap: 0.45rem;
      flex-wrap: wrap;
      justify-content: flex-end;
    }

    .theme-select {
      min-height: 36px;
      border: 1px solid var(--border-color);
      border-radius: 8px;
      background: var(--bg-card);
      color: var(--text-main);
      padding: 0 0.5rem;
      font-size: 0.78rem;
      outline: none;
      cursor: pointer;
    }

    .action-pill {
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-main);
      text-decoration: none;
      min-height: 38px;
      padding: 0.4rem 0.7rem;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      font-size: 0.82rem;
      font-weight: 600;
      transition: all 0.2s ease;
      position: relative;
    }

    .action-pill:hover {
      border-color: var(--primary-color);
      color: var(--primary-color);
    }

    .cart-pill {
      border-color: rgba(var(--secondary-rgb), 0.45);
    }

    .count-badge {
      min-width: 18px;
      height: 18px;
      border-radius: 999px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.68rem;
      font-weight: 800;
      padding: 0 0.25rem;
    }

    .account-link {
      text-decoration: none;
      color: var(--text-main);
      font-weight: 600;
      font-size: 0.82rem;
      padding: 0.4rem 0.6rem;
      border-radius: 8px;
    }

    .account-link:hover {
      background: var(--surface-soft);
    }

    .logout-btn {
      border: 1px solid var(--danger-color);
      background: var(--danger-soft);
      color: var(--danger-color);
      min-height: 36px;
      border-radius: 8px;
      padding: 0 0.65rem;
      font-weight: 700;
      font-size: 0.78rem;
      cursor: pointer;
    }

    .desktop-nav {
      display: flex;
      align-items: center;
      gap: 1.5rem;
      padding: 0.55rem 1.35rem;
      background: var(--bg-card);
      overflow-x: auto;
    }

    .desktop-nav a {
      text-decoration: none;
      color: var(--text-secondary);
      font-weight: 600;
      font-size: 0.88rem;
      position: relative;
      white-space: nowrap;
      padding-bottom: 0.2rem;
    }

    .desktop-nav a.active {
      color: var(--primary-color);
    }

    .desktop-nav a.active::after {
      content: '';
      position: absolute;
      bottom: -0.4rem;
      left: 0;
      width: 100%;
      height: 2px;
      border-radius: 2px;
      background: var(--primary-color);
    }

    .mobile-bottom-nav {
      display: none;
      position: fixed;
      bottom: 0;
      left: 0;
      width: 100%;
      min-height: 64px;
      background: var(--bg-card);
      border-top: 1px solid var(--border-color);
      box-shadow: 0 -6px 18px rgba(0, 0, 0, 0.08);
      z-index: 150;
      justify-content: space-around;
      align-items: center;
      padding: 0.35rem 0.4rem;
    }

    .mobile-bottom-nav a {
      min-width: 64px;
      min-height: 52px;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 0.18rem;
      text-decoration: none;
      color: var(--text-muted);
      font-size: 0.72rem;
      font-weight: 600;
      border-radius: 10px;
      position: relative;
    }

    .mobile-bottom-nav a.active {
      color: var(--primary-color);
      background: rgba(var(--primary-rgb), 0.08);
    }

    .mobile-bottom-nav .badge {
      position: absolute;
      top: 3px;
      left: 38px;
      min-width: 16px;
      height: 16px;
      border-radius: 999px;
      background: var(--secondary-color);
      color: var(--secondary-text);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      font-size: 0.62rem;
      font-weight: 800;
      border: 2px solid var(--bg-card);
    }

    .icon-svg {
      width: 18px;
      height: 18px;
      display: block;
      flex-shrink: 0;
    }

    .fade-in {
      animation: fadeIn 0.4s var(--motion-ease);
      flex: 1;
      padding-bottom: 2rem;
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(8px); }
      to { opacity: 1; transform: translateY(0); }
    }

    .sf-footer {
      border-top: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-muted);
      padding: 1.6rem 1rem;
      margin-top: 1.5rem;
    }

    .footer-content {
      max-width: 1200px;
      margin: 0 auto;
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      font-size: 0.84rem;
    }

    .foot-links {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .foot-links a {
      color: var(--text-muted);
      text-decoration: none;
    }

    @media (max-width: 1040px) {
      .nav-main {
        grid-template-columns: 1fr;
        gap: 0.65rem;
      }

      .logo-group {
        justify-self: flex-start;
      }

      .search-wrap {
        max-width: 100%;
      }

      .nav-actions {
        justify-content: flex-start;
      }
    }

    @media (max-width: 900px) {
      .desktop-nav {
        display: none;
      }

      .mobile-bottom-nav {
        display: flex;
      }

      .sf-footer {
        margin-bottom: 64px;
      }
    }

    @media (max-width: 640px) {
      .announcement-bar {
        font-size: 0.76rem;
      }

      .nav-main {
        padding: 0.55rem 0.75rem;
      }

      .action-pill span:not(.count-badge) {
        display: none;
      }

      .action-pill {
        min-width: 38px;
        justify-content: center;
        padding: 0.4rem;
      }

      .theme-select {
        font-size: 0.72rem;
      }

      .footer-content {
        flex-direction: column;
      }
    }
  `]
})
export class StorefrontLayoutComponent implements OnDestroy {
  searchTerm = '';
  cartCount = 0;
  wishlistCount = 0;
  currentTheme = 'theme-dark';
  private readonly storageKey = 'app-theme';
  private readonly subscriptions = new Subscription();

  constructor(
    public auth: AuthService,
    private cart: CartService,
    private wishlist: WishlistService,
    private router: Router
  ) {
    this.subscriptions.add(this.cart.cart$.subscribe(items => {
      this.cartCount = items.reduce((sum, i) => sum + i.quantity, 0);
    }));

    this.subscriptions.add(this.wishlist.items$.subscribe(items => {
      this.wishlistCount = items.length;
    }));

    const saved = localStorage.getItem(this.storageKey) || 'theme-dark';
    this.setTheme(saved);
  }

  setTheme(t: string) {
    const normalized = (t === 'theme-light' || t === 'theme-dark') ? t : 'theme-dark';
    this.currentTheme = normalized;
    localStorage.setItem(this.storageKey, normalized);
    Array.from(document.body.classList)
      .filter(cls => cls.startsWith('theme-'))
      .forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(normalized);
  }

  goSearch() {
    const q = this.searchTerm.trim();
    this.router.navigate(['/shop/search'], { queryParams: { q: q || null } });
  }

  logout() {
    this.auth.logout();
    this.router.navigate(['/shop/home']);
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }
}
