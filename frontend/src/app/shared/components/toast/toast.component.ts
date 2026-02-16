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
      left: 20px;
      z-index: 9999;
      display: flex;
      flex-direction: column;
      gap: 10px;
    }
    
    .toast {
      padding: 1rem 1.5rem;
      border-radius: var(--radius-md);
      background: var(--bg-card);
      color: white;
      box-shadow: var(--shadow-lg);
      display: flex;
      align-items: center;
      gap: 10px;
      min-width: 300px;
      cursor: pointer;
      animation: slideIn 0.3s ease-out;
      border-left: 5px solid transparent;
    }
    
    .toast.success { border-left-color: var(--primary-color); }
    .toast.error { border-left-color: var(--danger-color); }
    .toast.warning { border-left-color: var(--secondary-color); }
    .toast.info { border-left-color: #3b82f6; }
    
    @keyframes slideIn {
      from { transform: translateX(-100%); opacity: 0; }
      to { transform: translateX(0); opacity: 1; }
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
