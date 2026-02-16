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
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    
    .modal-content {
      background-color: var(--bg-card);
      border-radius: var(--radius-lg);
      width: 90%;
      max-width: 500px;
      box-shadow: var(--shadow-lg);
      border: 1px solid var(--border-color);
      animation: slideIn 0.2s ease-out;
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
    }
    
    .modal-body {
      padding: 1.5rem;
    }
    
    .close-btn {
      background: none;
      border: none;
      color: var(--text-muted);
      font-size: 1.5rem;
      cursor: pointer;
    }
    
    .close-btn:hover {
      color: var(--danger-color);
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
