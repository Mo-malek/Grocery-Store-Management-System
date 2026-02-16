import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
    selector: 'app-bar-chart',
    standalone: true,
    imports: [CommonModule],
    template: `
    <div class="chart-container">
      <h3>{{ title }}</h3>
      <div class="bars">
        <div class="bar-group" *ngFor="let item of data">
          <div class="bar" [style.height.%]="(item.value / maxValue) * 100" [title]="item.value"></div>
          <div class="label">{{ item.label }}</div>
        </div>
      </div>
    </div>
  `,
    styles: [`
    .chart-container {
      height: 300px;
      display: flex;
      flex-direction: column;
    }
    
    .bars {
      flex: 1;
      display: flex;
      align-items: flex-end;
      justify-content: space-around;
      gap: 10px;
      border-bottom: 2px solid var(--border-color);
      padding-bottom: 5px;
    }
    
    .bar {
      width: 40px;
      background-color: var(--primary-color);
      transition: height 0.5s ease;
      min-height: 2px;
      border-radius: var(--radius-sm) var(--radius-sm) 0 0;
    }
    
    .bar:hover {
      background-color: var(--primary-hover);
    }
    
    .label {
      font-size: 0.8rem;
      color: var(--text-muted);
      text-align: center;
      margin-top: 5px;
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      max-width: 60px;
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
