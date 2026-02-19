import { Component, Input } from '@angular/core';
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
      background: linear-gradient(135deg, rgba(34,197,94,0.15), rgba(15,118,110,0.3));
      border-color: var(--primary-color);
    }
    .toast.error { 
      background: linear-gradient(135deg, rgba(239,68,68,0.2), rgba(127,29,29,0.5));
      border-color: var(--danger-color);
    }
    .toast.warning { 
      background: linear-gradient(135deg, rgba(234,179,8,0.2), rgba(161,98,7,0.4));
      border-color: var(--secondary-color);
    }
    .toast.info { 
      background: linear-gradient(135deg, rgba(59,130,246,0.2), rgba(30,64,175,0.4));
      border-color: #3b82f6;
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
