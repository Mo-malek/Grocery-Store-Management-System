import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ZXingScannerModule } from '@zxing/ngx-scanner';
import { BarcodeFormat } from '@zxing/library';

@Component({
    selector: 'app-barcode-scanner',
    standalone: true,
    imports: [CommonModule, ZXingScannerModule],
    template: `
    <div class="scanner-overlay">
      <div class="scanner-container">
        <div class="scanner-header">
          <h3>📷 Scan Barcode</h3>
          <button class="close-btn" (click)="close()">✖</button>
        </div>
        
        <div class="scanner-viewport">
          <zxing-scanner 
            [formats]="allowedFormats"
            (scanSuccess)="onCodeResult($event)"
            (permissionResponse)="onPermissionResponse($event)"
            [autofocusEnabled]="true">
          </zxing-scanner>
          <div class="scan-line"></div>
        </div>

        <div class="scanner-footer">
          <p *ngIf="hasPermission === null">Requesting camera permission...</p>
          <p *ngIf="hasPermission === false" class="error">Camera permission denied</p>
          <p *ngIf="hasPermission === true">Point camera at a barcode</p>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .scanner-overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.8);
      z-index: 2000;
      display: flex;
      align-items: center;
      justify-content: center;
      backdrop-filter: blur(5px);
    }

    .scanner-container {
      background: #1f2937;
      border-radius: 12px;
      overflow: hidden;
      width: 90%;
      max-width: 500px;
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.25);
      border: 1px solid #374151;
    }

    .scanner-header {
      padding: 1rem;
      display: flex;
      justify-content: space-between;
      align-items: center;
      background: #111827;
      border-bottom: 1px solid #374151;
      color: white;
    }

    .scanner-header h3 {
      margin: 0;
      font-size: 1.1rem;
    }

    .close-btn {
      background: none;
      border: none;
      color: #9ca3af;
      font-size: 1.2rem;
      cursor: pointer;
      padding: 0.5rem;
    }
    
    .close-btn:hover { color: white; }

    .scanner-viewport {
      position: relative;
      background: black;
      min-height: 300px;
      display: flex;
      align-items: center;
      justify-content: center;
      overflow: hidden;
    }
    
    /* Ensure video fits decently */
    ::ng-deep zxing-scanner video {
      max-width: 100%;
      max-height: 60vh;
      object-fit: cover;
    }

    .scan-line {
      position: absolute;
      width: 100%;
      height: 2px;
      background: #ef4444;
      box-shadow: 0 0 4px #ef4444;
      top: 50%;
      animation: scan 2s infinite linear;
      opacity: 0.7;
    }

    @keyframes scan {
      0% { transform: translateY(-100px); opacity: 0; }
      50% { opacity: 1; }
      100% { transform: translateY(100px); opacity: 0; }
    }

    .scanner-footer {
      padding: 1rem;
      text-align: center;
      color: #d1d5db;
      background: #111827;
      border-top: 1px solid #374151;
    }

    .error { color: #ef4444; }
  `]
})
export class BarcodeScannerComponent {
    @Output() scanSuccess = new EventEmitter<string>();
    @Output() closeScanner = new EventEmitter<void>();

    hasPermission: boolean | null = null;
    allowedFormats = [
        BarcodeFormat.QR_CODE,
        BarcodeFormat.EAN_13,
        BarcodeFormat.CODE_128,
        BarcodeFormat.DATA_MATRIX,
        BarcodeFormat.EAN_8,
        BarcodeFormat.CODE_39,
        BarcodeFormat.UPC_A
    ];

    onCodeResult(resultString: string) {
        this.scanSuccess.emit(resultString);
    }

    onPermissionResponse(permission: boolean) {
        this.hasPermission = permission;
    }

    close() {
        this.closeScanner.emit();
    }
}
