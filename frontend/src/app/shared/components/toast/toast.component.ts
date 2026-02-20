import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-toast',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="toast-container">
      <div *ngFor="let toast of toastService.toasts()" 
           class="toast" 
           [ngClass]="toast.type"
           (click)="toastService.remove(toast.id)">
        <span class="icon">{{ getIcon(toast.type) }}</span>
        <span class="message">{{ toast.message }}</span>
      </div>
    </div>
  `,
  styles: [`
    .toast-container {
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
      align-items: flex-end;
    }
    
    .toast {
      padding: 0.85rem 1.25rem;
      border-radius: 999px;
      background: var(--bg-card);
      color: var(--text-main);
      box-shadow: var(--shadow-lg);
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-width: 0;
      max-width: 320px;
      cursor: pointer;
      animation: slideIn 0.25s ease-out;
      border: 1px solid transparent;
      backdrop-filter: blur(8px);
      font-size: 0.85rem;
    }

    .toast .icon {
      font-size: 1.1rem;
    }

    .toast .message {
      white-space: pre-line;
    }
    
    .toast.success { 
      background: var(--success-soft);
      border-color: var(--success-color);
    }
    .toast.error { 
      background: var(--danger-soft);
      border-color: var(--danger-color);
    }
    .toast.warning { 
      background: var(--warning-soft);
      border-color: var(--warning-color);
    }
    .toast.info { 
      background: var(--info-soft);
      border-color: var(--primary-color);
    }
    
    @keyframes slideIn {
      from { transform: translateX(100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
    }

    @media (max-width: 768px) {
      .toast-container {
        left: 50%;
        right: auto;
        transform: translateX(-50%);
        align-items: stretch;
      }

      .toast {
        width: calc(100vw - 2.5rem);
        border-radius: 12px;
      }
    }
  `]
})
export class ToastComponent {
  constructor(public toastService: ToastService) { }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return '✅';
      case 'error': return '❌';
      case 'warning': return '⚠️';
      default: return 'ℹ️';
    }
  }
}
