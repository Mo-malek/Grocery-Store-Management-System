import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-bar-chart',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="chart-container fade-in">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="bars-container" *ngIf="data?.length; else emptyState">
        <div class="bars">
          <div class="bar-group" *ngFor="let item of data">
            <div class="bar-wrapper">
              <div
                class="bar-fill"
                [style.height.%]="(item.value / maxValue) * 100"
                [attr.data-value]="item.value | number:'1.0-0'">
                <div class="glass-tooltip">
                  <span class="t-label">{{ item.label }}</span>
                  <span class="t-value">{{ item.value | number:'1.2-2' }}</span>
                </div>
              </div>
            </div>
            <div class="meta">
              <div class="label" [title]="item.label">{{ item.label }}</div>
            </div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-chart glass-card">
          <span class="icon">📈</span>
          <p>لا توجد بيانات كافية لعرض هذا الرسم البياني حالياً</p>
        </div>
      </ng-template>
    </div>
  `,
  styles: [`
    .chart-container { height: 100%; display: flex; flex-direction: column; min-height: 320px; }
    .chart-title { margin-bottom: 1.5rem; font-size: 1.1rem; font-weight: 800; color: var(--text-main); }
    
    .bars-container { flex: 1; display: flex; align-items: flex-end; position: relative; padding-bottom: 2.5rem; }
    .bars { flex: 1; display: flex; align-items: flex-end; gap: 12px; height: 100%; width: 100%; overflow-x: auto; scrollbar-width: none; }
    .bars::-webkit-scrollbar { display: none; }

    .bar-group { display: flex; flex-direction: column; align-items: center; min-width: 45px; flex: 1; height: 100%; justify-content: flex-end; }
    .bar-wrapper { width: 100%; display: flex; align-items: flex-end; justify-content: center; height: 100%; position: relative; }
    
    .bar-fill {
      width: 60%;
      background: var(--primary-color);
      border: 1px solid rgba(var(--primary-rgb), 0.45);
      transition: 0.6s cubic-bezier(0.34, 1.56, 0.64, 1);
      border-radius: 8px 8px 4px 4px;
      position: relative;
      cursor: pointer;
    }
    
    .bar-fill:hover {
      background: var(--primary-color);
      box-shadow: 0 0 20px rgba(var(--primary-rgb), 0.5);
      transform: scaleX(1.1);
    }

    .glass-tooltip {
      position: absolute;
      bottom: calc(100% + 10px);
      left: 50%;
      transform: translateX(-50%) translateY(10px);
      background: var(--glass-bg);
      backdrop-filter: blur(12px);
      border: 1px solid var(--glass-border);
      padding: 0.5rem 0.8rem;
      border-radius: 10px;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 2px;
      opacity: 0;
      visibility: hidden;
      transition: 0.3s;
      z-index: 10;
      pointer-events: none;
      box-shadow: var(--glass-shadow);
      min-width: 80px;
    }

    .bar-fill:hover .glass-tooltip { opacity: 1; visibility: visible; transform: translateX(-50%) translateY(0); }

    .t-label { font-size: 0.7rem; color: var(--text-muted); white-space: nowrap; }
    .t-value { font-size: 0.85rem; font-weight: 800; color: var(--text-main); white-space: nowrap; }

    .meta { position: absolute; bottom: 0; width: 100%; text-align: center; }
    .label { font-size: 0.75rem; color: var(--text-muted); white-space: nowrap; overflow: hidden; text-overflow: ellipsis; max-width: 100%; padding: 0 4px; }

    .empty-chart { flex: 1; display: flex; flex-direction: column; align-items: center; justify-content: center; gap: 1rem; color: var(--text-muted); border: 2px dashed var(--glass-border); }
    .empty-chart .icon { font-size: 2.5rem; opacity: 0.3; }

    @media (max-width: 768px) { .chart-container { min-height: 280px; } }
  `]
})
export class BarChartComponent {
  @Input() title: string = '';
  @Input() data: { label: string, value: number }[] = [];

  get maxValue() {
    return Math.max(...this.data.map(d => d.value), 1);
  }
}
