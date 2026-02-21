import { Component, Input, Output, EventEmitter, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SaleView } from '../../../core/models/models';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { ToastService } from '../../../core/services/toast.service';

@Component({
  selector: 'app-sale-detail-modal',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="modal-backdrop" *ngIf="sale" (click)="close()">
      <div class="modal-content receipt-modal" (click)="$event.stopPropagation()">
        
        <div #receiptContainer class="receipt-print-area">
          <div class="receipt-header">
            <div class="store-name">🏪 بقالة السعادة</div>
            <div class="receipt-title">{{ sale.saleChannel === 'ONLINE' ? 'فاتورة بيع أونلاين' : 'فاتورة بيع' }}</div>
            <div class="receipt-id">رقم: #{{ sale.id }}</div>
            <div class="receipt-id" *ngIf="sale.sourceOrderId">طلب: #{{ sale.sourceOrderId }}</div>
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
                <span>العميل:</span>
                <span>{{ sale.customer.name }}</span>
              </div>
              <div class="summary-row">
                <span>نقاط الولاء:</span>
                <span>{{ sale.customer.loyaltyPoints }} نقطة</span>
              </div>
            </div>

            <div class="summary-row payment">
              <span>طريقة الدفع:</span>
              <span>{{ getPaymentLabel(sale.paymentMethod) }}</span>
            </div>

            <div class="summary-row payment">
              <span>القناة:</span>
              <span>{{ sale.saleChannel === 'ONLINE' ? 'أونلاين' : 'داخل المحل' }}</span>
            </div>

            <div class="loyalty-card" *ngIf="sale.saleChannel === 'ONLINE' && (sale.externalCustomerName || sale.externalCustomerPhone || sale.externalCustomerAddress)">
              <div class="receipt-divider"></div>
              <div class="summary-row" *ngIf="sale.externalCustomerName">
                <span>اسم المستلم:</span>
                <span>{{ sale.externalCustomerName }}</span>
              </div>
              <div class="summary-row" *ngIf="sale.externalCustomerPhone">
                <span>الهاتف:</span>
                <span>{{ sale.externalCustomerPhone }}</span>
              </div>
              <div class="summary-row" *ngIf="sale.externalCustomerAddress">
                <span>العنوان:</span>
                <span>{{ sale.externalCustomerAddress }}</span>
              </div>
            </div>
          </div>

          <div class="receipt-footer">
            <p>شكراً لزيارتكم!</p>
            <p>يرجى الاحتفاظ بالفاتورة</p>
          </div>
        </div>

        <div class="modal-actions no-print">
          <div class="share-options" *ngIf="showShareOptions">
            <button class="btn btn-sm share-opt" (click)="shareAsFile('image')">🖼️ صورة</button>
            <button class="btn btn-sm share-opt" (click)="shareAsFile('pdf')">📄 PDF</button>
            <button class="btn btn-sm share-opt" (click)="shareAsText()">💬 نص</button>
            <button class="btn btn-sm" (click)="showShareOptions = false">✖️</button>
          </div>
          
          <ng-container *ngIf="!showShareOptions">
            <button class="btn" style="background-color: #25D366; color: white; border: none;" (click)="showShareOptions = true">📱 مشاركة واتساب</button>
            <button class="btn btn-primary" (click)="print()">🖨️ طباعة</button>
            <button class="btn btn-secondary" (click)="close()">إغلاق</button>
          </ng-container>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .modal-backdrop {
      position: fixed;
      inset: 0;
      background: rgba(0,0,0,0.7);
      display: flex;
      align-items: flex-start;
      justify-content: center;
      z-index: 1000;
      backdrop-filter: blur(4px);
      padding: 1rem;
      overflow-y: auto;
    }

    .receipt-modal {
      background: white;
      color: #111827;
      width: min(380px, 100%);
      padding: 15px;
      border-radius: 8px;
      box-shadow: 0 10px 25px rgba(0,0,0,0.2);
      font-family: 'Courier New', Courier, monospace;
      max-height: calc(100dvh - 2rem);
      overflow-y: auto;
      direction: rtl;
      text-align: right;
      margin: auto 0;
    }

    .receipt-print-area {
      padding: 10px;
      background: white;
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

    .col-name { flex: 2; word-break: break-word; }
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
      flex-direction: column;
      gap: 10px;
      margin-top: 20px;
      position: sticky;
      bottom: 0;
      background: #fff;
      padding-top: 8px;
    }
    
    .modal-actions button {
      width: 100%;
    }

    .share-options {
      display: flex;
      gap: 5px;
      background: #f3f4f6;
      padding: 10px;
      border-radius: 8px;
      margin-bottom: 5px;
    }

    .share-opt {
      background: white;
      border: 1px solid #ddd;
      flex: 1;
    }

    @media (max-width: 480px) {
      .modal-backdrop {
        padding: 0.5rem;
      }

      .receipt-modal {
        max-height: calc(100dvh - 1rem);
        padding: 12px;
      }
    }

    @media print {
      body, html {
        height: 100%;
        overflow: hidden;
        margin: 0;
        padding: 0;
        background: white !important;
        color: #000 !important;
      }

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
        min-height: 100%;
        background: white;
        display: flex !important;
        align-items: flex-start;
        justify-content: center;
        padding: 0;
        margin: 0;
        z-index: 9999;
      }

      .receipt-modal {
        width: 80mm !important;
        max-width: 80mm !important;
        box-shadow: none;
        border: none;
        padding: 0;
        margin: 0;
        overflow: visible !important;
      }
      
      ::-webkit-scrollbar {
        display: none;
      }
      
      .no-print {
        display: none !important;
      }

      .receipt-divider {
        border-top: 2px dashed #000 !important;
      }
      .item-row.header {
        border-bottom: 2px solid #000 !important;
      }
      .summary-row.total {
        border-top: 2px double #000 !important;
      }
    }
  `]
})
export class SaleDetailModalComponent {
  @Input() sale: SaleView | null = null;
  @Output() onClosed = new EventEmitter<void>();
  @ViewChild('receiptContainer') receiptContainer!: ElementRef;

  showShareOptions = false;

  constructor(private toast: ToastService) { }

  close() {
    this.onClosed.emit();
  }

  print() {
    window.print();
  }

  getPaymentLabel(method?: string): string {
    if (method === 'CASH') return 'نقدي';
    if (method === 'CARD') return 'فيزا';
    return method || '-';
  }

  async shareAsFile(type: 'image' | 'pdf') {
    if (!this.sale) return;
    this.toast.info('جاري معالجة الملف...');

    try {
      const canvas = await html2canvas(this.receiptContainer.nativeElement, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false
      });

      let blob: Blob;
      let filename: string;
      let fileType: string;

      if (type === 'image') {
        const dataUrl = canvas.toDataURL('image/png');
        blob = await (await fetch(dataUrl)).blob();
        filename = `receipt-${this.sale.id}.png`;
        fileType = 'image/png';
      } else {
        const imgWidth = 208;
        const imgHeight = (canvas.height * imgWidth) / canvas.width;
        const pdf = new jsPDF('p', 'mm', 'a4');
        const contentDataURL = canvas.toDataURL('image/png');
        pdf.addImage(contentDataURL, 'PNG', 0, 0, imgWidth, imgHeight);
        blob = pdf.output('blob');
        filename = `receipt-${this.sale.id}.pdf`;
        fileType = 'application/pdf';
      }

      const file = new File([blob], filename, { type: fileType });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'فاتورة بيع',
          text: `فاتورة رقم #${this.sale.id}`
        });
        this.showShareOptions = false;
      } else {
        // Fallback: Download file and explain
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = filename;
        link.click();
        this.toast.success('تم تحميل الملف. يمكنك الآن إرساله يدوياً عبر واتساب.');

        // Also open WhatsApp with text if possible
        this.shareAsText();
      }
    } catch (error) {
      this.toast.error('فشل إنشاء الملف');
    }
  }

  shareAsText() {
    const sale = this.sale;
    if (!sale) return;

    let text = `🧾 *فاتورة بيع* - بقالة السعادة\n`;
    text += `رقم: #${sale.id}\n`;
    if (sale.sourceOrderId) {
      text += `رقم الطلب: #${sale.sourceOrderId}\n`;
    }
    text += `القناة: ${sale.saleChannel === 'ONLINE' ? 'أونلاين' : 'داخل المحل'}\n`;
    text += `التاريخ: ${new Date(sale.createdAt).toLocaleString('ar-EG')}\n`;
    if (sale.externalCustomerName) {
      text += `اسم المستلم: ${sale.externalCustomerName}\n`;
    }
    if (sale.externalCustomerPhone) {
      text += `الهاتف: ${sale.externalCustomerPhone}\n`;
    }
    if (sale.externalCustomerAddress) {
      text += `العنوان: ${sale.externalCustomerAddress}\n`;
    }
    text += `----------------\n`;

    (sale.items || []).forEach(item => {
      text += `${item.productName} (${item.quantity}) - ${item.total} ج.م\n`;
    });

    text += `----------------\n`;
    text += `💰 الإجمالي: *${sale.total} ج.م*\n`;
    text += `شكراً لزيارتكم! 🙏`;

    const phoneRaw = sale.customer?.phone || sale.externalCustomerPhone || '';
    const phone = phoneRaw.replace(/\D/g, '');
    const url = `https://wa.me/${phone}?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
    this.showShareOptions = false;
  }
}
