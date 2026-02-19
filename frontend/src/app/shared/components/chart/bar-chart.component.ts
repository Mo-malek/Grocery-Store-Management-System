import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="chart-container">
      <h3 class="chart-title">{{ title }}</h3>
      <div class="bars" *ngIf="data?.length; else emptyState">
        <div class="bar-group" *ngFor="let item of data">
          <div class="bar-wrapper">
            <div
              class="bar"
              [style.height.%]="(item.value / maxValue) * 100"
              [title]="item.label + ' - ' + (item.value | number:'1.0-0')">
            </div>
          </div>
          <div class="meta">
            <div class="value">{{ item.value | number:'1.0-0' }}</div>
            <div class="label">{{ item.label }}</div>
          </div>
        </div>
      </div>
      <ng-template #emptyState>
        <div class="empty-chart">لا توجد بيانات لعرضها في هذه الفترة.</div>
      </ng-template>
    </div>
  `,
    styles: [`
    .chart-container {
      height: 280px;
      display: flex;
      flex-direction: column;
    }
    
    .chart-title {
      margin-bottom: 0.75rem;
      font-size: 0.95rem;
      color: var(--text-muted);
    }
    
    .bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      gap: 10px;
      border-bottom: 2px solid var(--border-color);
      padding: 0.5rem 0.25rem 0.75rem;
      overflow-x: auto;
    }

    .bar-group {
      display: flex;
      flex-direction: column;
      align-items: center;
      min-width: 40px;
      flex: 0 0 auto;
    }

    .bar-wrapper {
      width: 100%;
      max-width: 48px;
      display: flex;
      align-items: flex-end;
      justify-content: center;
      height: 100%;
    }
    
    .bar {
      width: 70%;
      background: linear-gradient(180deg, var(--primary-color), var(--primary-hover));
      transition: height 0.4s ease, transform 0.2s ease;
      min-height: 3px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.3);
    }
    
    .bar:hover {
      transform: translateY(-3px);
    }

    .meta {
      margin-top: 4px;
      text-align: center;
      max-width: 64px;
    }

    .value {
      font-size: 0.7rem;
      color: var(--text-secondary);
      font-weight: 600;
    }
    
    .label {
      font-size: 0.75rem;
      color: var(--text-muted);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .empty-chart {
      flex: 1;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.85rem;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .chart-container {
        height: 240px;
      }
    }
  `]
})
export class BarChartComponent {
    @Input() title: string = '';
    @Input() data: { label: string, value: number }[] = [];

    get maxValue() {
        return Math.max(...this.data.map(d => d.value), 1);
    }
}
