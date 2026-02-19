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
        <div class="header-actions">
          <button *ngIf="torchSupported" class="icon-btn" (click)="toggleTorch()" [title]="torchOn ? 'إطفاء الفلاش' : 'تشغيل الفلاش'">
            {{ torchOn ? '🔦 ON' : '🔦 OFF' }}
          </button>
          <button class="icon-btn" (click)="close()">✖</button>
        </div>
      </div>

      <div class="video-wrapper">
        <video #video></video>
        <div class="scan-frame"></div>
      </div>

      <div class="hint">
        <span>حرك الباركود داخل الإطار، وقرّب الكاميرا لمسافة 10-15 سم.</span>
        <span *ngIf="torchSupported">إذا كانت الإضاءة ضعيفة، فعّل الفلاش.</span>
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

    .header-actions {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }

    .icon-btn {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      color: white;
      font-size: 14px;
      cursor: pointer;
      border-radius: 8px;
      padding: 0.3rem 0.6rem;
      transition: all 0.2s;
    }

    .icon-btn:hover {
      background: rgba(255,255,255,0.12);
      border-color: rgba(255,255,255,0.2);
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

    .hint {
      margin-top: 0.75rem;
      color: rgba(255,255,255,0.8);
      font-size: 0.9rem;
      line-height: 1.4;
      display: flex;
      flex-direction: column;
      gap: 4px;
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
  torchSupported = false;
  torchOn = false;

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
      // Give the stream a moment to attach, then detect torch capability
      setTimeout(() => this.detectTorchSupport(), 300);
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
    // Turn off torch if it was on
    if (this.torchOn) {
      this.setTorch(false);
    }
    this.controls?.stop();
    this.closeScanner.emit();
  }

  ngOnDestroy() {
    this.close();
  }

  private getVideoTrack(): MediaStreamTrack | null {
    const video = this.videoElement?.nativeElement;
    const stream = video?.srcObject as MediaStream | null;
    return stream?.getVideoTracks()?.[0] ?? null;
  }

  private detectTorchSupport() {
    const track = this.getVideoTrack();
    if (!track || typeof track.getCapabilities !== 'function') return;
    const caps = track.getCapabilities() as any;
    this.torchSupported = !!caps?.torch;
  }

  toggleTorch() {
    this.setTorch(!this.torchOn);
  }

  private setTorch(on: boolean) {
    const track = this.getVideoTrack();
    if (!track || typeof track.applyConstraints !== 'function') return;
    this.torchOn = on;
    track.applyConstraints({ advanced: [{ torch: on }] as any }).catch((err: any) => {
      console.warn('Torch toggle failed', err);
      this.torchOn = false;
    });
  }
}
