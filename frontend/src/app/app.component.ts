import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common'; // Important for *ngIf
import { NavbarComponent } from './shared/components/navbar/navbar.component';
import { TopbarComponent } from './shared/components/topbar/topbar.component';
import { ToastComponent } from './shared/components/toast/toast.component';
import { LayoutService } from './core/services/layout.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, NavbarComponent, TopbarComponent, ToastComponent],
  template: `
    <div class="app-layout">
      <!-- Mobile Overlay -->
      <div class="mobile-overlay" 
           *ngIf="layout.isSidebarOpen()" 
           (click)="layout.closeSidebar()">
      </div>

      <!-- Sidebar -->
      <app-navbar class="app-sidebar" [class.open]="layout.isSidebarOpen()"></app-navbar>

      <!-- Main Content Area -->
      <div class="main-wrapper">
        <app-topbar></app-topbar>
        
        <main class="content-body">
          <router-outlet></router-outlet>
        </main>
      </div>

      <app-toast></app-toast>
    </div>
  `,
  styles: [`
    .app-layout {
      display: flex;
      min-height: 100vh;
      background-color: var(--bg-main);
      position: relative;
    }

    .app-sidebar {
      width: 260px;
      flex-shrink: 0;
      z-index: 200;
      height: 100vh;
      transition: transform 0.3s ease-in-out;
    }

    .main-wrapper {
      flex-grow: 1;
      display: flex;
      flex-direction: column;
      min-width: 0; /* Prevent overflow issues */
      height: 100vh;
      overflow: hidden;
    }

    .content-body {
      padding: 2rem;
      flex-grow: 1;
      overflow-y: auto;
      animation: fadeIn 0.3s ease-in-out;
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
         right: 0; /* RTL: Show from right */
         bottom: 0;
         transform: translateX(100%); /* RTL: Hide off-screen right */
         box-shadow: -5px 0 15px rgba(0,0,0,0.1);
      }

      .app-sidebar.open {
        transform: translateX(0);
      }

      .content-body {
        padding: 1rem;
      }
    }
  `]
})
export class AppComponent {
  constructor(public layout: LayoutService) { }
}
