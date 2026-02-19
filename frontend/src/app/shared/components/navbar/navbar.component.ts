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
        <span class="logo-icon">🛒</span>
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
            <span class="icon">📊</span>
            <span>لوحة التحكم</span>
          </a>
        </li>

        <li class="nav-category">العمليات</li>
        <li>
          <a routerLink="/pos" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">💻</span>
            <span>نقطة البيع</span>
          </a>
        </li>
        <li>
          <a routerLink="/inventory" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">📦</span>
            <span>المخزون</span>
          </a>
        </li>
        <li>
          <a routerLink="/history" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">💰</span>
            <span>سجل المبيعات</span>
          </a>
        </li>

        <li class="nav-category" *ngIf="user.role === 'ROLE_MANAGER'">الإدارة والمالية</li>
        <li *ngIf="user.role === 'ROLE_MANAGER'">
          <a routerLink="/expenses" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">💸</span>
            <span>المصاريف</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_MANAGER'">
          <a routerLink="/procurement" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">🛒</span>
            <span>التموين الذكي</span>
          </a>
        </li>
        <li *ngIf="user.role === 'ROLE_MANAGER'">
          <a routerLink="/marketing" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">🎯</span>
            <span>التسويق</span>
          </a>
        </li>
        <li>
          <a routerLink="/customers" routerLinkActive="active" (click)="closeSidebar()">
            <span class="icon">👥</span>
            <span>العملاء</span>
          </a>
        </li>
        
        <li class="nav-category">الحساب</li>
        <li>
          <a href="javascript:void(0)" (click)="logout()">
            <span class="icon">🚪</span>
            <span>تسجيل الخروج</span>
          </a>
        </li>
      </ul>

      <div class="sidebar-footer">
        <p>© 2026 بقالتي</p>
        <p class="version">v1.1.0 (Secure)</p>
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
    }

    .sidebar-content {
      height: 100%;
      display: flex;
      flex-direction: column;
      padding: 1.5rem 1rem;
    }
    
    .logo {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1.5rem;
      padding: 0 0.5rem;
      color: var(--text-main);
    }

    .logo-info {
      display: flex;
      flex-direction: column;
    }
    
    .logo-text {
      font-size: 1.6rem;
      font-weight: 800;
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      -webkit-background-clip: text;
      color: transparent;
    }

    .user-badge {
      font-size: 0.75rem;
      color: var(--text-muted);
      background: rgba(255,255,255,0.05);
      padding: 2px 8px;
      border-radius: 10px;
      margin-top: -4px;
    }
    
    .nav-visual-separator {
      height: 1px;
      background: linear-gradient(to left, transparent, var(--sidebar-border), transparent);
      margin-bottom: 1.5rem;
    }

    .nav-category {
      font-size: 0.75rem;
      text-transform: uppercase;
      color: var(--text-muted);
      margin: 1.2rem 0.5rem 0.5rem;
      font-weight: bold;
      letter-spacing: 0.5px;
    }
    
    .nav-links {
      list-style: none;
      padding: 0;
      margin: 0;
      flex-grow: 1;
    }
    
    .nav-links li {
      margin-bottom: 0.25rem;
    }
    
    .nav-links a {
      display: flex;
      align-items: center;
      padding: 0.75rem 1rem;
      color: var(--text-muted);
      text-decoration: none;
      border-radius: var(--radius-md);
      transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
      font-weight: 500;
      position: relative;
    }
    
    .nav-links a:hover {
      background-color: var(--sidebar-hover);
      color: var(--text-main);
      transform: translateX(-3px);
    }
    
    .nav-links a.active {
      background: var(--sidebar-active);
      color: var(--primary-color);
      border-right: 3px solid var(--primary-color);
      box-shadow: inset 4px 0 0 0 rgba(var(--primary-rgb), 0.45);
    }
    
    .icon {
      margin-left: 1rem;
      font-size: 1.25rem;
      width: 24px;
      text-align: center;
    }

    .sidebar-footer {
      margin-top: auto;
      text-align: center;
      font-size: 0.75rem;
      color: var(--text-muted);
      padding-top: 1rem;
      border-top: 1px solid var(--border-color);
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

