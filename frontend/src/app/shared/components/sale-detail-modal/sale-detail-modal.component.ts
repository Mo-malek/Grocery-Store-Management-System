import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleView } from '../../../core/models/models';

@Component({
  selector: 'app-sale-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="sale" (click)="close()">
      <div class="modal-content receipt-modal" (click)="$event.stopPropagation()">
        <div class="receipt-header">
          <div class="store-name">🏪 بقالة السعادة</div>
          <div class="receipt-title">فاتورة بيع</div>
          <div class="receipt-id">رقم: #{{ sale.id }}</div>
          <div class="receipt-date">{{ sale.createdAt | date:'short' }}</div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-items">
          <div class="item-row header">
            <span class="col-name">الصنف</span>
            <span class="col-qty">الكمية</span>
            <span class="col-total">الإجمالي</span>
          </div>
          <div class="item-row" *ngFor="let item of sale.items">
            <span class="col-name">{{ item.productName }}</span>
            <span class="col-qty">{{ item.quantity }}</span>
            <span class="col-total">{{ item.total | number:'1.2-2' }}</span>
          </div>
        </div>

        <div class="receipt-divider"></div>

        <div class="receipt-summary">
          <div class="summary-row">
            <span>المجموع:</span>
            <span>{{ sale.subtotal | number:'1.2-2' }} ج.م</span>
          </div>
          <div class="summary-row" *ngIf="sale.discount > 0">
            <span>الخصم:</span>
            <span>-{{ sale.discount | number:'1.2-2' }} ج.م</span>
          </div>
          <div class="summary-row savings" *ngIf="sale.discount > 0">
            <span>إجمالي التوفير:</span>
            <span>{{ sale.discount | number:'1.2-2' }} ج.م 🎉</span>
          </div>
          <div class="summary-row total">
            <span>الإجمالي النهائي:</span>
            <span>{{ sale.total | number:'1.2-2' }} ج.م</span>
          </div>

          <div class="loyalty-card" *ngIf="sale.customer">
            <div class="receipt-divider"></div>
            <div class="summary-row">
              <span>نقاط الولاء:</span>
              <span>{{ sale.customer.loyaltyPoints }} نقطة</span>
            </div>
            <div class="loyalty-msg">تنمو مدخراتك مع كل عملية شراء!</div>
          </div>

          <div class="summary-row payment">
            <span>طريقة الدفع:</span>
            <span>{{ sale.paymentMethod === 'CASH' ? 'نقدي' : 'فيزا' }}</span>
          </div>
        </div>

        <div class="receipt-footer">
          <p>شكراً لزيارتكم!</p>
          <p>يرجى الاحتفاظ بالفاتورة</p>
        </div>

        <div class="modal-actions no-print">
          <button class="btn" style="background-color: #25D366; color: white; border: none;" (click)="shareWhatsApp()">📱 واتساب</button>
          <button class="btn btn-primary" (click)="print()">🖨️ طباعة</button>
          <button class="btn btn-secondary" (click)="close()">إغلاق</button>
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
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
    }

    .receipt-modal {
      background: white;
      color: #333;
      width: 95%; /* Responsive width */
      max-width: 380px; /* Slightly wider max, but responsive */
      padding: 15px; /* Slightly less padding */
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      font-family: 'Courier New', Courier, monospace;
      max-height: 90vh;
      overflow-y: auto;
    }

    .receipt-header {
      text-align: center;
      margin-bottom: 15px;
    }

    .store-name {
      font-size: 1.4rem;
      font-weight: bold;
      margin-bottom: 5px;
    }

    .receipt-title {
      font-size: 1rem;
      text-decoration: underline;
      margin-bottom: 5px;
    }

    .receipt-id, .receipt-date {
      font-size: 0.8rem;
      color: #666;
    }

    .receipt-divider {
      border-top: 1px dashed #ccc;
      margin: 10px 0;
    }

    .receipt-items {
      font-size: 0.9rem;
    }

    .item-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
    }

    .item-row.header {
      font-weight: bold;
      border-bottom: 1px solid #eee;
      margin-bottom: 8px;
      padding-bottom: 5px;
    }

    .col-name { flex: 2; }
    .col-qty { flex: 1; text-align: center; }
    .col-total { flex: 1; text-align: left; }

    .receipt-summary {
      margin-top: 15px;
    }

    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 5px;
      font-size: 0.9rem;
    }

    .summary-row.total {
      font-weight: bold;
      font-size: 1.1rem;
      margin-top: 10px;
      padding-top: 5px;
      border-top: 1px double #333;
    }

    .savings {
      color: #10b981;
      font-weight: bold;
      font-style: italic;
    }

    .loyalty-card {
      background: #f9fafb;
      padding: 8px;
      border-radius: 4px;
      margin-top: 10px;
    }

    .loyalty-msg {
      font-size: 0.7rem;
      text-align: center;
      color: #10b981;
      margin-top: 4px;
    }

    .receipt-footer {
      text-align: center;
      margin-top: 20px;
      font-size: 0.8rem;
      font-style: italic;
    }

    .modal-actions {
      display: flex;
      gap: 10px;
      margin-top: 20px;
    }
    
    .modal-actions button {
      flex: 1;
    }

    @media print {
      body * {
        visibility: hidden;
      }

      .modal-backdrop, .modal-backdrop * {
        visibility: visible;
      }

      .modal-backdrop {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: auto !important;
        background: white;
        display: block !important;
        padding: 0;
        margin: 0;
        overflow: visible !important;
      }

      .receipt-modal {
        width: 100%;
        max-width: 80mm; /* Standard Thermal Paper */
        margin: 0 auto;
        padding: 5px;
        box-shadow: none;
        border: none;
        max-height: none !important;
        overflow: visible !important;
      }

      .receipt-modal * {
        overflow: visible !important;
      }

      .no-print {
        display: none !important;
      }

      .item-row, .summary-row {
        display: flex !important;
        break-inside: avoid;
      }
      
      .receipt-divider {
        border-top: 1px dashed black !important;
      }
      
      .item-row.header {
        border-bottom: 1px solid black !important;
      }
      
      .summary-row.total {
        border-top: 1px double black !important;
      }
    }
  `]
})
export class SaleDetailModalComponent {
  @Input() sale: SaleView | null = null;
  @Output() onClosed = new EventEmitter<void>();

  close() {
    this.onClosed.emit();
  }

  print() {
    window.print();
  }

  shareWhatsApp() {
    const sale = this.sale;
    if (!sale) return;

    let text = `🧾 *فاتورة بيع* - بقالة السعادة\n`;
    text += `رقم: #${sale.id}\n`;
    text += `التاريخ: ${new Date(sale.createdAt).toLocaleString('ar-EG')}\n`;
    text += `----------------\n`;

    (sale.items || []).forEach(item => {
      text += `${item.productName} (${item.quantity}) - ${item.total} ج.م\n`;
    });

    text += `----------------\n`;
    text += `💰 الإجمالي: *${sale.total} ج.م*\n`;
    text += `شكراً لزيارتكم! 🙏`;

    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  }
}
