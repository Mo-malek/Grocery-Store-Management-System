import { Component, OnInit } from '@angular/core';
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
        <button type="button" class="icon-btn menu-btn" (click)="toggleSidebar()">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M4 7H20M4 12H20M4 17H20" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </button>

        <div class="search-container">
          <span class="icon" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="currentColor" stroke-width="2"></circle>
              <path d="M20 20L16.65 16.65" stroke="currentColor" stroke-width="2" stroke-linecap="round"></path>
            </svg>
          </span>
          <input type="text" placeholder="بحث سريع... (Ctrl+K)" class="search-input">
        </div>
      </div>

      <div class="actions">
        <div class="quick-actions">
          <a class="btn-action" routerLink="/pos" title="بيع سريع">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M13 3L5 13H11L10 21L19 10.5H13L13 3Z" fill="currentColor"></path>
            </svg>
            <span>بيع سريع</span>
          </a>
        </div>

        <div class="divider"></div>

        <button type="button" class="icon-btn" title="الإشعارات">
          <svg class="icon-svg" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M15 17H9M17 17V11.5C17 8.46 14.99 5.86 12.2 5.11V4.5C12.2 3.67 11.53 3 10.7 3C9.87 3 9.2 3.67 9.2 4.5V5.11C6.41 5.86 4.4 8.46 4.4 11.5V17L3 18.4V19H18.4V18.4L17 17Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"></path>
          </svg>
          <span class="badge">3</span>
        </button>

        <button type="button" class="theme-toggle" (click)="nextTheme()" [title]="'المظهر: ' + currentTheme.label">
          <span class="theme-icon" aria-hidden="true">
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" *ngIf="currentTheme.key === 'theme-dark'">
              <path d="M20 14.5A8.5 8.5 0 1 1 9.5 4 7 7 0 0 0 20 14.5Z" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"></path>
            </svg>
            <svg class="icon-svg" viewBox="0 0 24 24" fill="none" *ngIf="currentTheme.key === 'theme-light'">
              <circle cx="12" cy="12" r="4.2" stroke="currentColor" stroke-width="1.8"></circle>
              <path d="M12 2V4.2M12 19.8V22M4.2 4.2L5.8 5.8M18.2 18.2L19.8 19.8M2 12H4.2M19.8 12H22M4.2 19.8L5.8 18.2M18.2 5.8L19.8 4.2" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"></path>
            </svg>
          </span>
          <span class="theme-label">{{ currentTheme.label }}</span>
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
      min-height: 74px;
      background: var(--bg-card);
      border-bottom: 1px solid var(--border-color);
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 var(--space-3);
      position: sticky;
      top: 0;
      z-index: 100;
      transition: all 0.3s ease;
      box-shadow: var(--shadow-xs);
      gap: var(--space-2);
    }

    .start-section {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      min-width: 0;
      flex: 1;
    }

    .menu-btn {
      display: none;
      width: 40px;
      height: 40px;
    }

    .search-container {
      position: relative;
      width: min(520px, 100%);
      min-width: 220px;
      flex: 1;
    }

    .search-input {
      width: 100%;
      min-height: 44px;
      padding: 0.62rem 2.5rem 0.62rem 0.9rem;
      border-radius: 999px;
      border: 1px solid var(--input-border-color);
      background: var(--bg-input);
      color: var(--text-main);
      transition: all 0.2s;
    }

    .search-input:focus {
      border-color: var(--primary-color);
      box-shadow: var(--focus-ring-shadow);
    }

    .search-container .icon {
      position: absolute;
      right: 12px;
      top: 50%;
      transform: translateY(-50%);
      color: var(--text-muted);
      display: inline-flex;
    }

    .actions {
      display: flex;
      align-items: center;
      gap: 0.65rem;
      flex-shrink: 0;
    }

    .icon-btn {
      background: none;
      border: 1px solid var(--border-color);
      color: var(--text-main);
      cursor: pointer;
      position: relative;
      width: 40px;
      height: 40px;
      padding: 0;
      border-radius: 10px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      transition: background 0.2s;
    }

    .icon-btn:hover {
      background: var(--surface-soft);
      border-color: var(--primary-color);
    }

    .theme-toggle {
      display: inline-flex;
      align-items: center;
      gap: 0.35rem;
      min-height: 40px;
      padding: 0.35rem 0.75rem;
      border-radius: 999px;
      border: 1px solid var(--border-color);
      background: var(--bg-card);
      color: var(--text-main);
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .theme-toggle:hover {
      border-color: var(--primary-color);
      box-shadow: var(--shadow-xs);
      background: var(--surface-soft);
    }

    .icon-svg { width: 18px; height: 18px; display: block; }
    .theme-icon { display: inline-flex; }
    .theme-label { font-size: 0.85rem; }

    .badge {
      position: absolute;
      top: -4px;
      right: -4px;
      background: var(--danger-color);
      color: white;
      font-size: 0.7rem;
      width: 17px;
      height: 17px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid var(--bg-card);
    }

    .profile {
      display: flex;
      align-items: center;
      gap: 0.55rem;
      cursor: pointer;
      padding: 0.25rem 0.45rem;
      border-radius: var(--radius-md);
      transition: background 0.2s;
      border: 1px solid transparent;
    }

    .profile:hover {
      background: var(--surface-soft);
      border-color: var(--border-color);
    }

    .avatar {
      width: 38px;
      height: 38px;
      border-radius: 50%;
      border: 2px solid var(--primary-color);
    }

    .info {
      display: flex;
      flex-direction: column;
      line-height: 1.2;
      display: none;
    }

    @media (min-width: 768px) {
      .info { display: flex; }
    }

    .name {
      font-weight: 700;
      font-size: 0.9rem;
    }

    .role {
      font-size: 0.75rem;
      color: var(--text-muted);
    }

    .btn-action {
      background: var(--secondary-color);
      color: var(--secondary-text);
      border: 1px solid transparent;
      min-height: 40px;
      padding: 0.45rem 0.9rem;
      display: inline-flex;
      align-items: center;
      gap: 0.4rem;
      border-radius: 999px;
      font-weight: 700;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s, background 0.2s;
      display: none;
      text-decoration: none;
    }

    @media (min-width: 768px) {
      .btn-action { display: inline-flex; }
    }

    .btn-action:hover {
      transform: translateY(-2px);
      background: var(--secondary-hover);
      box-shadow: var(--shadow-sm);
    }

    .divider {
      width: 1px;
      height: 24px;
      background: var(--border-color);
      margin: 0 0.35rem;
    }

    @media (max-width: 768px) {
      .menu-btn { display: block; }
      .search-container { display: none; }
      .topbar { padding: 0 var(--space-2); }
      .theme-label { display: none; }
      .profile .info { display: none; }
      .divider { display: none; }
    }
  `]
})
export class TopbarComponent implements OnInit {
  themes = [
    { key: 'theme-light', label: 'فاتح' },
    { key: 'theme-dark', label: 'داكن' },
  ];

  private readonly storageKey = 'app-theme';
  currentTheme = this.themes[1];

  constructor(private layout: LayoutService) { }

  ngOnInit() {
    const saved = localStorage.getItem(this.storageKey);
    const found = this.themes.find(t => t.key === saved);
    this.currentTheme = found ?? this.themes[1];
    this.applyTheme(this.currentTheme.key);
  }

  nextTheme() {
    const nextIndex = (this.themes.indexOf(this.currentTheme) + 1) % this.themes.length;
    this.currentTheme = this.themes[nextIndex];
    this.applyTheme(this.currentTheme.key);
  }

  private applyTheme(key: string) {
    const normalized = this.themes.some(t => t.key === key) ? key : 'theme-dark';
    Array.from(document.body.classList)
      .filter(cls => cls.startsWith('theme-'))
      .forEach(cls => document.body.classList.remove(cls));
    document.body.classList.add(normalized);
    localStorage.setItem(this.storageKey, normalized);
  }

  toggleSidebar() {
    this.layout.toggleSidebar();
  }
}
