import { Component } from '@angular/core';
import { RouterOutlet, Router, NavigationEnd } from '@angular/router';
import { CommonModule } from '@angular/common';
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LayoutService } from './core/services/layout.service';
import { filter } from 'rxjs/operators';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, TopbarComponent, ToastComponent],
  template: `
    <!-- Layout for Authenticated Pages -->
    <div class="app-layout" *ngIf="showLayout">
      <div class="mobile-overlay" 
           *ngIf="layout.isSidebarOpen()" 
           (click)="layout.closeSidebar()">
      </div>

      <app-navbar class="app-sidebar" [class.open]="layout.isSidebarOpen()"></app-navbar>

      <div class="main-wrapper">
        <app-topbar></app-topbar>
        <main class="content-body">
          <div class="content-inner">
            <router-outlet></router-outlet>
          </div>
        </main>
      </div>
    </div>

    <!-- Layout for Login/Public Pages (No Sidebar/Topbar) -->
    <div *ngIf="!showLayout" class="public-layout">
        <router-outlet></router-outlet>
    </div>

    <app-toast></app-toast>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
      position: relative;
    }

    .public-layout {
        min-height: 100vh;
        background-color: var(--bg-main);
    }

    .app-sidebar {
      width: 280px;
      flex-shrink: 0;
      z-index: 200;
      height: 100vh;
      transition: transform 0.3s ease-in-out;
      background: var(--sidebar-bg);
      border-inline-end: 1px solid var(--sidebar-border);
    }

    .main-wrapper {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
      height: 100vh;
      overflow: hidden;
    }

    .content-body {
      padding: var(--space-3);
      flex-grow: 1;
      overflow-y: auto;
      animation: fadeIn 0.3s ease-in-out;
      background:
        radial-gradient(circle at top left, rgba(var(--primary-rgb), 0.05), transparent 48%),
        var(--bg-main);
    }

    .content-inner {
      width: 100%;
      max-width: 1480px;
      margin: 0 auto;
    }

    .mobile-overlay {
      position: fixed;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: rgba(0, 0, 0, 0.5);
      z-index: 150;
      backdrop-filter: blur(2px);
    }

    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(10px); }
      to { opacity: 1; transform: translateY(0); }
    }

    @media (max-width: 768px) {
      .app-sidebar {
         position: fixed;
         top: 0;
         left: 0;
         bottom: 0;
         transform: translateX(-100%);
         box-shadow: 5px 0 15px rgba(0,0,0,0.35);
      }

      .app-sidebar.open {
        transform: translateX(0);
      }

      .content-body {
        padding: var(--space-2);
      }
    }
  `]
})
export class AppComponent {
  showLayout = true;

  constructor(public layout: LayoutService, private router: Router) {
    this.updateLayoutByUrl(this.router.url || '');

    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.updateLayoutByUrl(event.urlAfterRedirects || '');
    });
  }

  private updateLayoutByUrl(url: string) {
    const isPublicPage = url.includes('/login') || url.includes('/signup') || url.includes('/shop');
    this.showLayout = !isPublicPage;
    document.body.classList.toggle('admin-app', this.showLayout);
  }
}
