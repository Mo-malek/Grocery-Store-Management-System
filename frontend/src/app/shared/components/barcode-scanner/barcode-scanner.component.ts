import {
  Component,
  ElementRef,
  EventEmitter,
  OnDestroy,
  OnInit,
  Output,
  ViewChild
} from '@angular/core';
import { BrowserMultiFormatReader, IScannerControls } from '@zxing/browser';
import { BarcodeFormat, DecodeHintType } from '@zxing/library';

@Component({
  selector: 'app-barcode-scanner',
  standalone: true,
  template: `
  <div class="overlay">
    <div class="card">

      <div class="header">
        <h3>📷 Scan Barcode</h3>
        <button (click)="close()">✖</button>
      </div>

      <div class="video-wrapper">
        <video #video></video>
        <div class="scan-frame"></div>
      </div>

    </div>
  </div>
  `,
  styles: [`
    .overlay {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,.9);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    }

    .card {
      width: 95%;
      max-width: 500px;
      background: #111827;
      border-radius: 12px;
      padding: 1rem;
      color: white;
    }

    .video-wrapper {
      position: relative;
    }

    video {
      width: 100%;
      border-radius: 8px;
      object-fit: cover;
    }

    .scan-frame {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70%;
      height: 120px;
      transform: translate(-50%, -50%);
      border: 3px solid #22c55e;
      border-radius: 12px;
      box-shadow: 0 0 15px #22c55e;
      pointer-events: none;
    }

    .header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }

    button {
      background: none;
      border: none;
      color: white;
      font-size: 18px;
      cursor: pointer;
    }
  `]
})
export class BarcodeScannerComponent implements OnInit, OnDestroy {

  @ViewChild('video', { static: true }) videoElement!: ElementRef<HTMLVideoElement>;
  @Output() scanSuccess = new EventEmitter<string>();
  @Output() closeScanner = new EventEmitter<void>();

  private hints = new Map();
  private codeReader: BrowserMultiFormatReader;
  private controls?: IScannerControls;

  private lastScanTime = 0;
  private scanCooldown = 1500; // 1.5 sec anti double scan

  constructor() {
    // 🏷️ Setup hints for better quality and performance
    this.hints.set(DecodeHintType.POSSIBLE_FORMATS, [
      BarcodeFormat.QR_CODE,
      BarcodeFormat.EAN_13,
      BarcodeFormat.EAN_8,
      BarcodeFormat.UPC_A,
      BarcodeFormat.CODE_128,
      BarcodeFormat.CODE_39,
      BarcodeFormat.DATA_MATRIX
    ]);
    this.hints.set(DecodeHintType.TRY_HARDER, true);

    this.codeReader = new BrowserMultiFormatReader(this.hints);
  }

  async ngOnInit() {
    await this.startCamera();
  }

  async startCamera() {
    try {
      this.controls = await this.codeReader.decodeFromConstraints(
        {
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
            advanced: [{ focusMode: 'continuous' }] as any
          }
        },
        this.videoElement.nativeElement,
        (result) => {
          if (!result) return;

          const now = Date.now();
          if (now - this.lastScanTime < this.scanCooldown) return;

          this.lastScanTime = now;

          this.successFeedback();
          this.scanSuccess.emit(result.getText());

          setTimeout(() => this.close(), 500);
        }
      );
    } catch (err) {
      console.error('Scanner init error:', err);
    }
  }

  successFeedback() {
    // 🔊 Sound
    const audio = new Audio('assets/beep.mp3');
    audio.play().catch(() => { });

    // 📳 Vibration
    if (navigator.vibrate) {
      navigator.vibrate(200);
    }
  }

  close() {
    this.controls?.stop();
    this.closeScanner.emit();
  }

  ngOnDestroy() {
    this.close();
  }
}
