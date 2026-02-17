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
        <video #video autoplay playsinline muted></video>
        <div class="scan-frame"></div>
      </div>

      <p class="quality-note">HD mode enabled for clearer barcode detection.</p>

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
      width: min(96vw, 900px);
      background: #111827;
      border-radius: 12px;
      padding: 1rem;
      color: white;
    }

    .video-wrapper {
      position: relative;
      aspect-ratio: 16 / 9;
      background: #000;
      border-radius: 8px;
      overflow: hidden;
    }

    video {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }

    .scan-frame {
      position: absolute;
      top: 50%;
      left: 50%;
      width: 70%;
      height: min(35%, 140px);
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

    .quality-note {
      margin: 10px 0 0;
      color: #9ca3af;
      font-size: 0.85rem;
      text-align: center;
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

  private codeReader = new BrowserMultiFormatReader();
  private controls?: IScannerControls;

  private lastScanTime = 0;
  private readonly scanCooldown = 1500;

  async ngOnInit() {
    await this.startCamera();
    this.boostCameraQuality();
  }

  async startCamera() {
    this.controls = await this.codeReader.decodeFromConstraints(
      {
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 3840 },
          height: { ideal: 2160 },
          frameRate: { ideal: 30 }
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
  }

  private boostCameraQuality() {
    window.setTimeout(async () => {
      const stream = this.videoElement.nativeElement.srcObject as MediaStream | null;
      const track = stream?.getVideoTracks()?.[0];

      if (!track || !track.getCapabilities || !track.applyConstraints) {
        return;
      }

      const capabilities = track.getCapabilities() as MediaTrackCapabilities;

      const width = typeof capabilities.width?.max === 'number' ? capabilities.width.max : 3840;
      const height = typeof capabilities.height?.max === 'number' ? capabilities.height.max : 2160;
      const frameRate = typeof capabilities.frameRate?.max === 'number'
        ? Math.min(capabilities.frameRate.max, 60)
        : 30;

      const advanced: MediaTrackConstraintSet = {};
      const focusModes = (capabilities as MediaTrackCapabilities & { focusMode?: string[] }).focusMode;
      if (Array.isArray(focusModes) && focusModes.includes('continuous')) {
        (advanced as MediaTrackConstraintSet & { focusMode?: string }).focusMode = 'continuous';
      }

      const constraints: MediaTrackConstraints = {
        width: { ideal: width },
        height: { ideal: height },
        frameRate: { ideal: frameRate }
      };

      if (Object.keys(advanced).length > 0) {
        constraints.advanced = [advanced];
      }

      await track.applyConstraints(constraints);
    }, 300);
  }

  successFeedback() {
    const audio = new Audio('assets/beep.mp3');
    audio.play().catch(() => { });

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
