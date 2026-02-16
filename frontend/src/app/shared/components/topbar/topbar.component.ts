import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { LayoutService } from '../../../core/services/layout.service';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [CommonModule, RouterModule],
  template: `
    <header class="topbar">
      <div class="start-section">
        <button class="icon-btn menu-btn" (click)="toggleSidebar()">
          ☰
        </button>
        
        <div class="search-container">
          <span class="icon">🔍</span>
          <input type="text" placeholder="بحث عام (Ctrl+K)..." class="search-input">
        </div>
      </div>

      <div class="actions">
        <div class="quick-actions">
           <button class="btn-action" routerLink="/pos" title="بيع سريع">⚡ بيع سريع</button>
        </div>

        <div class="divider"></div>

        <button class="icon-btn" title="الإشعارات">
          🔔 <span class="badge">3</span>
        </button>
        
        <button class="icon-btn" (click)="toggleTheme()" title="تغيير المظهر">
          {{ isDarkMode ? '☀️' : '🌙' }}
        </button>

        <div class="profile">
          <img src="https://ui-avatars.com/api/?name=Admin+User&background=random" alt="User" class="avatar">
          <div class="info">
            <span class="name">المدير</span>
            <span class="role">مسؤول النظام</span>
          </div>
        </div>
      </div>
    </header>
  `,
  styles: [`
    .topbar {
      height: 70px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 2rem;
      position: sticky;
      top: 0;
      z-index: 100;
      transition: all 0.3s ease;
    }

    .start-section {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .menu-btn {
      display: none; /* Hidden on desktop */
      font-size: 1.5rem;
    }

    .search-container {
      position: relative;
      width: 300px;
    }

    .search-input {
      width: 100%;
      padding: 0.6rem 2.5rem 0.6rem 1rem;
      border-radius: 20px;
      border: 1px solid var(--border-color);
      background: var(--bg-main);
      color: var(--text-main);
      transition: all 0.3s;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
      width: 350px;
    }

    .search-container .icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      opacity: 0.5;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 1rem;
    }

    .icon-btn {
      background: none;
      border: none;
      font-size: 1.2rem;
      cursor: pointer;
      position: relative;
      padding: 0.5rem;
      border-radius: 50%;
      transition: background 0.2s;
    }

    .icon-btn:hover {
      background: var(--bg-input);
    }

    .badge {
      position: absolute;
      top: 0;
      right: 0;
      background: var(--danger-color);
      color: white;
      font-size: 0.7rem;
      width: 16px;
      height: 16px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      cursor: pointer;
      padding: 0.25rem 0.5rem;
      border-radius: var(--radius-md);
      transition: background 0.2s;
    }

    .profile:hover {
      background: var(--bg-input);
    }

    .avatar {
      width: 40px;
      height: 40px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
    }

    .info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      display: none; /* Hide info on smaller screens */
    }

    @media (min-width: 768px) {
      .info { display: flex; }
    }

    .name {
      font-weight: bold;
      font-size: 0.9rem;
    }

    .role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-action {
      background: linear-gradient(135deg, var(--primary-color), var(--secondary-color));
      color: white;
      border: none;
      padding: 0.5rem 1rem;
      border-radius: 20px;
      font-weight: bold;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
      display: none; /* Hide on mobile */
    }

    @media (min-width: 768px) {
      .btn-action { display: block; }
    }

    .btn-action:hover {
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(37, 99, 235, 0.3);
    }
    
    .divider {
      width: 1px;
      height: 24px;
      background: var(--border-color);
      margin: 0 0.5rem;
    }

    @media (max-width: 768px) {
      .menu-btn { display: block; }
      .search-container { display: none; } /* Hide search on mobile for space */
      .topbar { padding: 0 1rem; }
    }
  `]
})
export class TopbarComponent {
  isDarkMode = true;

  constructor(private layout: LayoutService) { }

  toggleTheme() {
    this.isDarkMode = !this.isDarkMode;
    document.body.classList.toggle('light-theme');
  }

  toggleSidebar() {
    this.layout.toggleSidebar();
  }
}
