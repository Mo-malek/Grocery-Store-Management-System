import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-spinner',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="spinner-overlay">
      <div class="spinner"></div>
    </div>
  `,
    styles: [`
    .spinner-overlay {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
      display: flex;
      justify-content: center;
      align-items: center;
      z-index: 10;
      border-radius: inherit;
    }

    .spinner {
      width: 40px;
      height: 40px;
      border: 4px solid rgba(255, 255, 255, 0.3);
      border-radius: 50%;
      border-top-color: var(--primary-color);
      animation: spin 1s ease-in-out infinite;
    }

    @keyframes spin {
      to { transform: rotate(360deg); }
    }
  `]
})
export class SpinnerComponent { }
