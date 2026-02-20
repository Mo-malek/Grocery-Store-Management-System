import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <nav class="sidebar-content" [class.open]="layout.isSidebarOpen()" *ngIf="auth.currentUser | async as user">
      <div class="logo">
        <span class="logo-icon" aria-hidden="true">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
            <path d="M6 9H18L17 20H7L6 9Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
            <path d="M9 9V7.5A3 3 0 0 1 12 4.5A3 3 0 0 1 15 7.5V9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
          </svg>
        </span>
        <div class="logo-info">
          <span class="logo-text">بقالتي</span>
          <span class="user-badge" *ngIf="user">{{ user.username }}</span>
        </div>
      </div>

      <div class="nav-visual-separator"></div>

      <ul class="nav-links">
        <li class="nav-category">الرئيسية</li>
        <li>
          <a routerLink="/dashboard" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M5 19V11M12 19V6M19 19V14" stroke="currentColor" stroke-width="1.9" stroke-linecap="round"></path>
              </svg>
            </span>
            <span>لوحة التحكم</span>
          </a>
        </li>

        <li class="nav-category">العمليات</li>
        <li>
          <a routerLink="/pos" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <rect x="4" y="5" width="16" height="11" rx="2" stroke="currentColor" stroke-width="1.8"></rect>
                <path d="M9 19H15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </span>
            <span>نقطة البيع</span>
          </a>
        </li>
        <li>
          <a routerLink="/inventory" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 8L12 4L20 8L12 12L4 8Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
                <path d="M4 8V16L12 20L20 16V8" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
              </svg>
            </span>
            <span>المخزون</span>
          </a>
        </li>
        <li>
          <a routerLink="/history" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <rect x="5" y="4" width="14" height="16" rx="2" stroke="currentColor" stroke-width="1.8"></rect>
                <path d="M8 9H16M8 13H16M8 17H13" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </span>
            <span>سجل المبيعات</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">
          <a routerLink="/delivery-orders" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M3 8H14V15H3V8Z" stroke="currentColor" stroke-width="1.8"></path>
                <path d="M14 10H18L21 13V15H14V10Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
                <circle cx="7" cy="17" r="2" stroke="currentColor" stroke-width="1.8"></circle>
                <circle cx="17" cy="17" r="2" stroke="currentColor" stroke-width="1.8"></circle>
              </svg>
            </span>
            <span>طلبات التوصيل</span>
          </a>
        </li>

        <li class="nav-category" *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">الإدارة</li>
        <li *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">
          <a routerLink="/expenses" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <rect x="3.5" y="7" width="17" height="10" rx="2" stroke="currentColor" stroke-width="1.8"></rect>
                <circle cx="12" cy="12" r="2" stroke="currentColor" stroke-width="1.8"></circle>
              </svg>
            </span>
            <span>المصاريف</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">
          <a routerLink="/procurement" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 6H6L8.6 15.5H18.5L20.2 9H8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                <circle cx="9.8" cy="18.2" r="1.3" fill="currentColor"></circle>
                <circle cx="17.2" cy="18.2" r="1.3" fill="currentColor"></circle>
              </svg>
            </span>
            <span>التموين</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">
          <a routerLink="/marketing" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M4 12L16 7V17L4 12Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
                <path d="M16 10L19 8V16L16 14" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </span>
            <span>التسويق</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER'">
          <a routerLink="/staff" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="8" r="3" stroke="currentColor" stroke-width="1.8"></circle>
                <path d="M4 20C4 17 6.5 15 9 15" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                <path d="M15 12L17 14L21 10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
              </svg>
            </span>
            <span>الموظفون</span>
          </a>
        </li>
        <li>
          <a routerLink="/customers" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <circle cx="9" cy="9" r="2.5" stroke="currentColor" stroke-width="1.8"></circle>
                <circle cx="16" cy="10" r="2" stroke="currentColor" stroke-width="1.8"></circle>
                <path d="M4.5 18.5C4.5 15.8 6.8 14 9.5 14H10.4C13.1 14 15.4 15.8 15.4 18.5" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </span>
            <span>العملاء</span>
          </a>
        </li>

        <li class="nav-category">الحساب</li>
        <li>
          <a href="javascript:void(0)" (click)="logout()">
            <span class="icon" aria-hidden="true">
              <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
                <path d="M10 4H6C4.9 4 4 4.9 4 6V18C4 19.1 4.9 20 6 20H10" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
                <path d="M14 16L18 12L14 8" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
                <path d="M18 12H9" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
              </svg>
            </span>
            <span>تسجيل الخروج</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <p>(c) 2026 بقالتي</p>
        <p class="version">v1.1.0</p>
      </div>
    </nav>
  `,
  styles: [`
    :host {
      display: block;
      height: 100%;
      background: var(--sidebar-bg);
      border-inline-end: 1px solid var(--sidebar-border);
      transition: transform 0.3s ease;
      box-shadow: 8px 0 24px rgba(15, 23, 42, 0.06);
    }

    .sidebar-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.25rem 0.85rem 1rem;
      gap: 0.35rem;
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      margin-bottom: 0.8rem;
      padding: 0.8rem;
      color: var(--text-main);
      border: 1px solid var(--sidebar-border);
      border-radius: var(--radius-lg);
      background: var(--surface-soft);
    }

    .logo-icon {
      width: 36px;
      height: 36px;
      border-radius: 10px;
      background: rgba(var(--primary-rgb), 0.15);
      border: 1px solid rgba(var(--primary-rgb), 0.3);
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: var(--primary-color);
      flex-shrink: 0;
    }

    .logo-info {
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .logo-text {
      font-size: 1.35rem;
      font-weight: 800;
      color: var(--text-main);
      line-height: 1.1;
    }

    .user-badge {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: var(--surface-soft);
      border: 1px solid var(--glass-border);
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: 0.15rem;
      width: fit-content;
    }

    .nav-visual-separator {
      height: 1px;
      background: var(--sidebar-border);
      margin-bottom: 0.8rem;
      opacity: 0.7;
    }

    .nav-category {
      font-size: 0.75rem;
      color: var(--text-muted);
      margin: 0.8rem 0.5rem 0.35rem;
      font-weight: bold;
    }

    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
      flex-grow: 1;
      overflow-y: auto;
      scrollbar-width: thin;
    }

    .nav-links li {
      margin-bottom: 0.25rem;
    }

    .nav-links a {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      min-height: 44px;
      padding: 0.58rem 0.8rem;
      color: var(--text-secondary);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 600;
      position: relative;
    }

    .nav-links a:hover {
      background-color: var(--sidebar-hover);
      color: var(--text-main);
      transform: translateX(-2px);
    }

    .nav-links a:focus-visible {
      box-shadow: var(--focus-ring-shadow);
    }

    .nav-links a.active {
      background: var(--sidebar-active);
      color: var(--primary-color);
      border-inline-end: 3px solid var(--primary-color);
      box-shadow: inset 3px 0 0 0 rgba(var(--primary-rgb), 0.42);
    }

    .icon {
      width: 22px;
      height: 22px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      flex-shrink: 0;
    }

    .icon-svg { width: 18px; height: 18px; display: block; }

    .sidebar-footer {
      margin-top: auto;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      padding-top: 0.9rem;
      border-top: 1px solid var(--sidebar-border);
    }

    .version {
      opacity: 0.85;
      margin-top: 0.15rem;
    }

    @media (max-width: 768px) {
      :host {
        box-shadow: 12px 0 28px rgba(15, 23, 42, 0.25);
      }
    }
  `]
})
export class NavbarComponent {
  constructor(
    public layout: LayoutService,
    public auth: AuthService
  ) { }

  closeSidebar() {
    this.layout.closeSidebar();
  }

  logout() {
    this.auth.logout();
    this.closeSidebar();
  }
}
