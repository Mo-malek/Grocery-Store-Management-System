import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-modal',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="modal-backdrop" (click)="close()">
      <div class="modal-content" (click)="$event.stopPropagation()">
        <div class="modal-header">
          <h3>{{ title }}</h3>
          <button class="close-btn" (click)="close()">&times;</button>
        </div>
        <div class="modal-body">
          <ng-content></ng-content>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      padding: 1rem;
      overflow-y: auto;
    }
    
    .modal-content {
      background-color: var(--bg-card);
      border-radius: var(--radius-lg);
      width: min(760px, 100%);
      max-height: calc(100dvh - 2rem);
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      animation: slideIn 0.2s ease-out;
      display: flex;
      flex-direction: column;
      overflow: hidden;
      margin: auto 0;
    }
    
    @keyframes slideIn {
      from { transform: translateY(-20px); opacity: 0; }
      to { transform: translateY(0); opacity: 1; }
    }
    
    .modal-header {
      padding: 1rem 1.5rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
      flex-shrink: 0;
      gap: 0.75rem;
    }
    
    .modal-body {
      padding: 1.5rem;
      overflow-y: auto;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
      min-width: 40px;
      min-height: 40px;
      border-radius: 8px;
    }
    
    .close-btn:hover {
      color: var(--danger-color);
      background: var(--surface-soft);
    }

    @media (max-width: 640px) {
      .modal-backdrop {
        padding: 0.65rem;
      }

      .modal-content {
        width: 100%;
        max-height: calc(100dvh - 1.3rem);
      }

      .modal-header {
        padding: 0.85rem 1rem;
      }

      .modal-body {
        padding: 1rem;
      }
    }
  `]
})
export class ModalComponent {
    @Input() title: string = '';
    @Output() onClose = new EventEmitter<void>();

    close() {
        this.onClose.emit();
    }
}
