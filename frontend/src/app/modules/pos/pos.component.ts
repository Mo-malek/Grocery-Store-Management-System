import { Component, OnInit, ElementRef, ViewChild, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../core/services/api.service';
import { Product, SaleItemRequest, SaleRequest, SaleView, Customer, RecommendationSuggestion, Bundle } from '../../core/models/models';
import { ToastService } from '../../core/services/toast.service';
import { SpinnerComponent } from '../../shared/components/spinner/spinner.component';
import { SaleDetailModalComponent } from '../../shared/components/sale-detail-modal/sale-detail-modal.component';
import { BarcodeScannerComponent } from '../../shared/components/barcode-scanner/barcode-scanner.component';
import { resolveImageUrl } from '../../core/utils/image-url.util';

interface CartItem {
  product?: Product;
  bundle?: Bundle;
  isBundle: boolean;
  quantity: number;
  total: number;
}

interface StoredCartItem {
  productId?: number;
  bundleId?: number;
  isBundle: boolean;
  quantity: number;
}

@Component({
  selector: 'app-pos',
  standalone: true,
  imports: [CommonModule, FormsModule, SpinnerComponent, SaleDetailModalComponent, BarcodeScannerComponent],
  template: `
    <div class="pos-container">
      <!-- Left: Cart & Checkout -->
      <div class="cart-section">
        <div class="cart-header">
          <h2>🛒 السلة</h2>
          <button class="btn btn-danger btn-sm" (click)="clearCart()" *ngIf="cart.length">إفراغ</button>
        </div>

        <div class="cart-items">
          <div class="empty-cart" *ngIf="!cart.length">
            <div class="empty-icon">🛍️</div>
            <p>السلة فارغة. ابدأ بإضافة منتجات.</p>
          </div>
          
          <div class="cart-item" *ngFor="let item of cart; let i = index">
            <div class="item-details">
              <div class="item-name">{{ item.isBundle ? '📦 ' + item.bundle?.name : item.product?.name }}</div>
              <div class="item-price">{{ item.isBundle ? item.bundle?.price : item.product?.sellingPrice }} ج.م</div>
            </div>
            <div class="item-controls">
              <button class="qty-btn" (click)="updateQty(i, -1)">-</button>
              <span class="qty">{{ item.quantity }}</span>
              <button class="qty-btn" (click)="updateQty(i, 1)" [disabled]="item.isBundle">+</button>
            </div>
            <div class="item-total">
              {{ item.total | number:'1.2-2' }} 
              <button class="remove-btn" (click)="removeFromCart(i)">&times;</button>
            </div>
          </div>
        </div>

        <div class="cart-summary">
          <!-- Customer Selection -->
          <div class="customer-select-row">
            <div class="select-label">👤 العميل:</div>
            <select [(ngModel)]="selectedCustomerId" class="customer-picker">
              <option [ngValue]="null">عميل نقدي</option>
              <option *ngFor="let c of customers" [ngValue]="c.id">{{ c.name }} ({{ c.phone }})</option>
            </select>
          </div>

          <div class="summary-row">
            <span>المجموع الفرعي:</span>
            <span>{{ subtotal | number:'1.2-2' }} ج.م</span>
          </div>
          <div class="summary-row discount-row">
            <span>الخصم:</span>
            <input type="number" [(ngModel)]="discount" (change)="calculateTotals()" class="discount-input">
          </div>
          <div class="summary-row total-row">
            <span>الإجمالي:</span>
            <span>{{ total | number:'1.2-2' }} ج.م</span>
          </div>

          <button class="btn btn-primary checkout-btn" 
                  [disabled]="!cart.length || isProcessing" 
                  (click)="checkout()">
            <span *ngIf="!isProcessing">إتمام البيع (Enter)</span>
            <span *ngIf="isProcessing">جاري التنفيذ...</span>
          </button>
        </div>

        <!-- Basket Suggestions -->
        <div class="suggestions-section" *ngIf="recommendations.length">
          <div class="suggestions-header">💡 قد يعجبك أيضاً:</div>
          <div class="suggestions-list">
            <div class="suggestion-chip" *ngFor="let s of recommendations" (click)="addSuggestionToCart(s)">
              <span class="s-name">{{ s.productName }}</span>
              <span class="s-price">{{ s.price }} ج.م</span>
              <span class="s-plus">+</span>
            </div>
          </div>
        </div>
        
        <app-spinner *ngIf="isProcessing"></app-spinner>
      </div>

      <!-- Right: Products Grid -->
      <div class="products-section">
        <div class="search-box">
          <div class="search-input-wrapper">
             <input type="text" [(ngModel)]="searchTerm" (input)="search()" 
                 placeholder="بحث باسم المنتج أو الباركود..." class="form-control search-input" #searchInput autofocus>
             <button class="scan-btn" (click)="showScanner = true" title="Scan Barcode">📷</button>
          </div>
        </div>
        
        <div class="categories">
          <button class="category-tag" [class.active]="selectedCategory === '' && !showBundles" (click)="filterCategory('')">الكل</button>
          <button class="category-tag highlight" [class.active]="showBundles" (click)="toggleBundles()">🎁 العروض</button>
          <button class="category-tag" *ngFor="let cat of categories" 
                  [class.active]="selectedCategory === cat && !showBundles" (click)="filterCategory(cat)">
            {{ cat }}
          </button>
        </div>

        <div class="products-container-wrapper">
          <app-spinner *ngIf="isLoading"></app-spinner>
          
          <div class="products-grid" *ngIf="!isLoading">
            <!-- Products List -->
            <ng-container *ngIf="!showBundles">
              <div class="product-card" *ngFor="let product of filteredProducts" (click)="addToCart(product)">
                <div class="pc-image">
                  <img [src]="getImageUrl(product.imageUrl)" [alt]="product.name">
                </div>
                <div class="product-name">{{ product.name }}</div>
                <div class="product-info">
                  <div class="product-stock" [class.low-stock]="product.currentStock <= product.minStock">
                    <span *ngIf="product.currentStock <= product.minStock">⚠️</span>
                    المخزون: {{ product.currentStock }}
                  </div>
                  <div class="product-price">{{ product.sellingPrice }} ج.م</div>
                </div>
              </div>
            </ng-container>

            <!-- Bundles List -->
            <ng-container *ngIf="showBundles">
              <div class="product-card bundle-spec" *ngFor="let b of bundles" (click)="addBundleToCart(b)">
                <div class="product-name">📦 {{ b.name }}</div>
                <div class="bundle-contents">
                   <div *ngFor="let bi of b.items" class="bi-text">{{ bi.product.name }} × {{ bi.quantity }}</div>
                </div>
                <div class="product-info">
                  <div class="product-price">{{ b.price }} ج.م</div>
                </div>
              </div>
            </ng-container>
          </div>
          
          <div class="empty-state" *ngIf="!isLoading && ((!showBundles && filteredProducts.length === 0) || (showBundles && bundles.length === 0))">
            <p>{{ showBundles ? 'لا توجد عروض حالياً' : 'لا توجد منتجات مطابقة للبحث' }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Sale Detail Modal (Receipt) -->
    <app-sale-detail-modal 
      [sale]="lastSale" 
      (onClosed)="lastSale = null">
    </app-sale-detail-modal>

    <!-- Barcode Scanner Modal -->
    <app-barcode-scanner *ngIf="showScanner"
      (scanSuccess)="onCameraScan($event)"
      (closeScanner)="showScanner = false">
    </app-barcode-scanner>
  `,
  styles: [`
    .pos-container {
      display: grid;
      grid-template-columns: 350px 1fr;
      gap: 1.5rem;
      height: calc(100vh - 4rem);
    }
    
    /* Cart Section */
    .cart-section {
      background-color: var(--bg-card);
      border-radius: var(--radius-lg);
      display: flex;
      flex-direction: column;
      border: 1px solid var(--border-color);
      box-shadow: var(--shadow-md);
      position: relative;
      overflow: hidden;
    }
    
    .cart-header {
      padding: 1rem;
      border-bottom: 1px solid var(--border-color);
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    
    .cart-items {
      flex: 1;
      overflow-y: auto;
      padding: 1rem;
    }
    
    .empty-cart {
      text-align: center;
      color: var(--text-muted);
      margin-top: 4rem;
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 1rem;
    }
    
    .empty-icon {
      font-size: 3rem;
      opacity: 0.5;
    }
    
    .cart-item {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 0.75rem 0;
      border-bottom: 1px solid var(--border-color);
      animation: fadeIn 0.2s ease-out;
    }
    
    @keyframes fadeIn {
      from { opacity: 0; transform: translateY(5px); }
      to { opacity: 1; transform: translateY(0); }
    }
    
    .item-details {
      flex: 1;
    }
    
    .item-name {
      font-weight: 600;
      font-size: 0.9rem;
      word-break: break-word;
    }
    
    .item-price {
      font-size: 0.8rem;
      color: var(--text-muted);
    }
    
    .item-controls {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 1rem;
    }
    
    .qty-btn {
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-main);
      width: 24px;
      height: 24px;
      border-radius: 4px;
      cursor: pointer;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    
    .qty-btn:hover {
      background: var(--primary-color);
      border-color: var(--primary-color);
    }
    
    .qty {
      font-weight: bold;
      min-width: 20px;
      text-align: center;
    }
    
    .item-total {
      font-weight: 600;
      min-width: 60px;
      text-align: left;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    
    .remove-btn {
      background: none;
      border: none;
      color: var(--danger-color);
      cursor: pointer;
      font-size: 1.2rem;
      line-height: 1;
      opacity: 0.7;
    }
    
    .remove-btn:hover {
      opacity: 1;
    }
    
    .cart-summary {
      padding: 1.5rem;
      background-color: rgba(0,0,0,0.1);
      border-top: 1px solid var(--border-color);
    }
    
    .customer-select-row {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 1rem;
      padding-bottom: 1rem;
      border-bottom: 1px dashed var(--border-color);
    }

    .select-label {
      font-size: 0.9rem;
      white-space: nowrap;
    }

    .customer-picker {
      flex: 1;
      padding: 0.5rem;
      border-radius: var(--radius-sm);
      background: var(--bg-input);
      color: white;
      border: 1px solid var(--border-color);
    }
    
    .summary-row {
      display: flex;
      justify-content: space-between;
      margin-bottom: 0.5rem;
      font-size: 1rem;
    }
    
    .total-row {
      font-size: 1.25rem;
      font-weight: bold;
      color: var(--primary-color);
      margin-top: 1rem;
      padding-top: 1rem;
      border-top: 1px dashed var(--border-color);
    }
    
    .discount-input {
      width: 80px;
      padding: 0.25rem;
      text-align: center;
      border-radius: var(--radius-sm);
      border: 1px solid var(--border-color);
      background: var(--bg-input);
      color: white;
    }
    
    .checkout-btn {
      width: 100%;
      margin-top: 1rem;
      padding: 1rem;
      font-size: 1.1rem;
      position: relative;
    }
    
    /* Products Section */
    .products-section {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      overflow: hidden;
    }
    
    .search-input-wrapper {
      position: relative;
      display: flex;
      align-items: center;
    }

    .search-input {
      padding: 1rem;
      font-size: 1.1rem;
      flex: 1;
      padding-left: 3rem; /* Space for camera icon */
    }

    .scan-btn {
      position: absolute;
      left: 10px;
      background: none;
      border: none;
      font-size: 1.5rem;
      cursor: pointer;
      opacity: 0.7;
      transition: all 0.2s;
      z-index: 10;
    }

    .scan-btn:hover {
      opacity: 1;
      transform: scale(1.1);
    }
    
    .categories {
      display: flex;
      gap: 0.5rem;
      overflow-x: auto;
      padding-bottom: 0.5rem;
    }
    
    .category-tag {
      padding: 0.5rem 1rem;
      border-radius: 2rem;
      background: var(--bg-input);
      border: 1px solid var(--border-color);
      color: var(--text-muted);
      cursor: pointer;
      white-space: nowrap;
      transition: all 0.2s;
    }
    
    .category-tag.active {
      background: var(--primary-color);
      color: white;
      border-color: var(--primary-color);
    }
    
    .products-container-wrapper {
      position: relative;
      flex: 1;
      overflow: hidden;
      display: flex;
      flex-direction: column;
    }
    
    .products-grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
      gap: 1rem;
      overflow-y: auto;
      padding-bottom: 1rem;
      padding-right: 0.5rem;
    }
    
    .product-card {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      border-radius: var(--radius-md);
      padding: 1rem;
      cursor: pointer;
      transition: all 0.2s;
      user-select: none;
      display: flex;
      flex-direction: column;
      justify-content: space-between;
      height: 100%;
    }
    
    .product-card:hover {
      border-color: var(--primary-color);
      transform: translateY(-2px);
      box-shadow: var(--shadow-sm);
    }
    
    .product-card:active {
      transform: scale(0.98);
    }
    
    .pc-image {
      width: 100%;
      aspect-ratio: 1/1;
      border-radius: var(--radius-sm);
      overflow: hidden;
      background: var(--image-surface);
      border: 1px solid var(--border-color);
      margin-bottom: 0.5rem;
    }
    .pc-image img {
      width: 100%;
      height: 100%;
      object-fit: contain;
      padding: 0.25rem;
    }
    
    .product-name {
      font-weight: 700;
      margin-bottom: 0.65rem;
      line-height: 1.1rem;
      font-size: 0.85rem;
      min-height: 2.2rem;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      word-break: break-word;
    }
    
    .product-info {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
    }
    
    .product-stock {
      font-size: 0.75rem;
      color: var(--text-muted);
    }
    
    .product-stock.low-stock {
      color: var(--secondary-color);
      font-weight: bold;
    }
    
    .product-price {
      font-weight: bold;
      color: var(--primary-color);
      font-size: 1rem;
    }
    
    .empty-state {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 100%;
      color: var(--text-muted);
    }

    @media (max-width: 768px) {
      .pos-container {
        display: flex;
        flex-direction: column;
        height: auto; /* Allow scrolling on mobile */
        gap: 1rem;
      }
      
      .cart-section {
        max-height: 400px; /* Limit height of cart */
        min-height: auto;
        flex: none;
      }
      
      /* Make cart items scrollable within the limited height */
      .cart-items {
        max-height: 200px; 
      }

      .products-section {
        height: auto;
        overflow: visible;
      }

      .products-container-wrapper {
        height: auto;
        overflow: visible;
      }

      .products-grid {
        overflow: visible;
        grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); /* Slightly smaller cards */
        padding-bottom: 1rem;
      }
      
      .search-box {
        position: sticky;
        top: 0;
        z-index: 10;
        background: var(--bg-main);
        padding-top: 0.5rem;
        padding-bottom: 0.5rem;
        border-bottom: 1px solid var(--border-color);
        margin-bottom: 0.5rem;
      }
    }
    .suggestions-section {
      padding: 1rem;
      border-top: 1px solid var(--border-color);
      background: rgba(var(--primary-rgb), 0.05);
    }
    .suggestions-header {
      font-size: 0.8rem;
      font-weight: bold;
      margin-bottom: 0.5rem;
      color: var(--primary-color);
    }
    .suggestions-list {
      display: flex;
      flex-wrap: wrap;
      gap: 0.5rem;
    }
    .suggestion-chip {
      background: var(--bg-card);
      border: 1px solid var(--border-color);
      padding: 0.4rem 0.75rem;
      border-radius: 2rem;
      font-size: 0.8rem;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: all 0.2s;
    }
    .suggestion-chip:hover {
      border-color: var(--primary-color);
      transform: scale(1.05);
    }
    .s-price { color: var(--text-muted); font-size: 0.7rem; }
    .s-plus { font-weight: bold; color: var(--success-color); }

    .bundle-spec { background: linear-gradient(135deg, var(--bg-card), rgba(var(--primary-rgb), 0.1)); border-color: var(--primary-color); }
    .bundle-contents { font-size: 0.75rem; color: var(--text-muted); margin-bottom: 0.5rem; }
    .bi-text { white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .category-tag.highlight { border-color: var(--primary-color); color: var(--primary-color); font-weight: bold; }
  `]
})
export class PosComponent implements OnInit {
  products: Product[] = [];
  bundles: Bundle[] = [];
  filteredProducts: Product[] = [];
  categories: string[] = [];
  selectedCategory: string = '';
  searchTerm: string = '';
  showBundles: boolean = false;
  showScanner: boolean = false; // New: Scanner visibility

  cart: CartItem[] = [];
  subtotal: number = 0;
  discount: number = 0;
  total: number = 0;
  isProcessing: boolean = false;
  isLoading: boolean = false;
  lastSale: SaleView | null = null;
  recommendations: RecommendationSuggestion[] = [];

  customers: Customer[] = [];
  selectedCustomerId: number | null = null;
  private readonly cartStorageKey = 'pos-cart';
  private productsLoaded = false;
  private bundlesLoaded = false;

  // Barcode Scanner Integration
  private scannerBuffer: string = '';
  private lastKeyTime: number = 0;

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private api: ApiService,
    private toast: ToastService
  ) { }

  @HostListener('window:keydown', ['$event'])
  handleBarcodeScan(event: KeyboardEvent) {
    const currentTime = Date.now();
    const timeDiff = currentTime - this.lastKeyTime;
    this.lastKeyTime = currentTime;

    // Check if user is typing in an input/textarea - if so, don't hijack unless it's ultra-fast (scanner)
    const target = event.target as HTMLElement;
    const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA';

    // Hardware scanners typically send keys with < 50ms intervals
    if (timeDiff < 50) {
      if (event.key === 'Enter') {
        if (this.scannerBuffer.length > 3) {
          this.processBarcode(this.scannerBuffer);
          this.scannerBuffer = '';
          event.preventDefault();
        }
      } else if (event.key.length === 1) {
        this.scannerBuffer += event.key;
      }
    } else {
      // If it's slow typing, reset buffer unless it's the start of a sequence
      if (event.key === 'Enter' && !isInput) {
        this.checkout(); // Extra shortcut: Enter key on window (not in input) triggers checkout
      }
      this.scannerBuffer = event.key.length === 1 ? event.key : '';
    }
  }

  processBarcode(barcode: string) {
    const product = this.products.find(p => p.barcode === barcode.trim());
    if (product) {
      this.addToCart(product);
      this.toast.success(`تمت إضافة: ${product.name}`);
    } else {
      this.toast.warning('منتج غير معروف: ' + barcode);
    }
  }

  // New: Handle camera scan result
  onCameraScan(barcode: string) {
    this.processBarcode(barcode);
  }


  ngOnInit() {
    this.loadProducts();
    this.loadCustomers();
    this.loadBundles();
  }

  loadProducts() {
    this.isLoading = true;
    this.api.getProducts('', 0, 1000).subscribe({
      next: (page) => {
        this.products = page.content;
        this.filteredProducts = page.content;
        this.extractCategories();
        this.isLoading = false;
        this.productsLoaded = true;
        this.restoreCartFromStorage();
      },
      error: (err) => {
        this.toast.error('فشل تحميل المنتجات');
        this.isLoading = false;
      }
    });
  }

  loadBundles() {
    this.api.getActiveBundles().subscribe(data => {
      this.bundles = data;
      this.bundlesLoaded = true;
      this.restoreCartFromStorage();
    });
  }

  loadCustomers() {
    this.api.getCustomers().subscribe({
      next: (data) => this.customers = data,
      error: (err) => console.error('Failed to load customers', err)
    });
  }

  extractCategories() {
    this.categories = [...new Set(this.products.map(p => p.category).filter(c => c))];
  }

  toggleBundles() {
    this.showBundles = !this.showBundles;
    if (this.showBundles) {
      this.selectedCategory = '';
      this.searchTerm = '';
    }
  }

  search() {
    if (this.showBundles) {
      this.showBundles = false;
    }
    // If input matches barcode exactly, add to cart immediately
    const exactMatch = this.products.find(p => p.barcode === this.searchTerm.trim());
    if (exactMatch && this.searchTerm.trim().length > 3) {
      this.addToCart(exactMatch);
      this.searchTerm = ''; // Clear after scan
      this.filteredProducts = this.products;
      if (this.selectedCategory) {
        this.filterCategory(this.selectedCategory);
      }
      return;
    }

    // Normal filter
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      (p.name.toLowerCase().includes(term) || p.barcode?.includes(term)) &&
      (this.selectedCategory ? p.category === this.selectedCategory : true)
    );
  }

  filterCategory(cat: string) {
    this.selectedCategory = cat;
    this.showBundles = false;
    // Re-apply search term if exists
    const term = this.searchTerm.toLowerCase();
    this.filteredProducts = this.products.filter(p =>
      (p.name.toLowerCase().includes(term) || p.barcode?.includes(term)) &&
      (cat ? p.category === cat : true)
    );
  }

  addToCart(product: Product) {
    if (product.currentStock <= 0) {
      this.toast.warning('هذا المنتج غير متوفر في المخزون');
      return;
    }

    const existing = this.cart.find(item => !item.isBundle && item.product?.id === product.id);

    if (existing) {
      if (existing.quantity >= (product.currentStock || 0)) {
        this.toast.warning('الكمية المطلوبة غير متوفرة');
        return;
      }
      existing.quantity++;
      existing.total = existing.quantity * (existing.product?.sellingPrice || 0);
    } else {
      this.cart.push({
        product: product,
        isBundle: false,
        quantity: 1,
        total: product.sellingPrice
      });
    }
    this.calculateTotals();
    this.updateRecommendations();
    this.persistCart();
  }

  addBundleToCart(bundle: Bundle) {
    // Check if all items in bundle have sufficient stock
    if (bundle.items) {
      for (const bi of bundle.items) {
        if (bi.product.currentStock < bi.quantity) {
          this.toast.warning(`المنتج ${bi.product.name} غير متوفر بالكمية المطلوبة للعرض`);
          return;
        }
      }
    }

    this.cart.push({
      bundle: bundle,
      isBundle: true,
      quantity: 1,
      total: bundle.price
    });
    this.calculateTotals();
    this.updateRecommendations();
    this.persistCart();
  }

  updateQty(index: number, change: number) {
    const item = this.cart[index];
    if (item.isBundle && change > 0) return; // For now, bundles are 1 qty each line

    const newQty = item.quantity + change;

    if (!item.isBundle && item.product && newQty > item.product.currentStock) {
      this.toast.warning('الكمية المطلوبة غير متوفرة');
      return;
    }

    if (newQty > 0) {
      item.quantity = newQty;
      if (item.isBundle) {
        item.total = item.quantity * (item.bundle?.price || 0);
      } else {
        item.total = item.quantity * (item.product?.sellingPrice || 0);
      }
      this.calculateTotals();
      this.updateRecommendations();
      this.persistCart();
    } else {
      this.removeFromCart(index);
    }
  }

  removeFromCart(index: number) {
    this.cart.splice(index, 1);
    this.calculateTotals();
    this.updateRecommendations();
    this.persistCart();
  }

  clearCart() {
    if (confirm('هل تريد إفراغ السلة؟')) {
      this.cart = [];
      this.calculateTotals();
      this.updateRecommendations();
      this.persistCart(true);
      this.toast.info('تم إفراغ السلة');
    }
  }

  calculateTotals() {
    this.subtotal = this.cart.reduce((sum, item) => sum + item.total, 0);
    this.total = Math.max(0, this.subtotal - this.discount);
  }

  private persistCart(clear: boolean = false) {
    if (clear) {
      localStorage.removeItem(this.cartStorageKey);
      return;
    }
    const stored: StoredCartItem[] = this.cart.map(item => ({
      isBundle: item.isBundle,
      quantity: item.quantity,
      productId: item.product?.id,
      bundleId: item.bundle?.id
    }));
    try {
      localStorage.setItem(this.cartStorageKey, JSON.stringify(stored));
    } catch (e) {
      console.warn('Failed to persist cart', e);
    }
  }

  private restoreCartFromStorage() {
    if (!this.productsLoaded || !this.bundlesLoaded) return;
    const raw = localStorage.getItem(this.cartStorageKey);
    if (!raw) return;
    try {
      const saved: StoredCartItem[] = JSON.parse(raw);
      const restored: CartItem[] = [];
      for (const s of saved) {
        if (s.isBundle && s.bundleId) {
          const bundle = this.bundles.find(b => b.id === s.bundleId);
          if (bundle) {
            restored.push({
              bundle,
              isBundle: true,
              quantity: s.quantity,
              total: s.quantity * bundle.price
            });
          }
        } else if (!s.isBundle && s.productId) {
          const product = this.products.find(p => p.id === s.productId);
          if (product) {
            restored.push({
              product,
              isBundle: false,
              quantity: s.quantity,
              total: s.quantity * product.sellingPrice
            });
          }
        }
      }
      if (restored.length) {
        this.cart = restored;
        this.calculateTotals();
        this.updateRecommendations();
      }
    } catch (e) {
      console.warn('Failed to restore cart', e);
    }
  }

  checkout() {
    if (!this.cart.length) return;

    this.isProcessing = true;
    const saleRequest: SaleRequest = {
      customerId: this.selectedCustomerId || undefined,
      items: this.cart.filter(i => !i.isBundle).map(item => ({
        productId: item.product?.id!,
        quantity: item.quantity
      })),
      bundleIds: this.cart.filter(i => i.isBundle).map(i => i.bundle?.id!),
      discount: this.discount,
      paymentMethod: 'CASH'
    };

    this.api.createSale(saleRequest).subscribe({
      next: (sale) => {
        this.toast.success(`تمت عملية البيع بنجاح! فاتورة #${sale.id}`);
        this.lastSale = sale; // Store for modal
        this.cart = [];
        this.discount = 0;
        this.selectedCustomerId = null;
        this.calculateTotals();
        this.updateRecommendations();
        this.persistCart(true);
        this.isProcessing = false;

        // Refresh products to update stock
        this.loadProducts();

        // Focus back on search input
        setTimeout(() => {
          if (this.searchInput) this.searchInput.nativeElement.focus();
        }, 100);
      },
      error: (err) => {
        this.toast.error('حدث خطأ أثناء تنفيذ العملية');
        console.error(err);
        this.isProcessing = false;
      }
    });
  }

  updateRecommendations() {
    if (this.cart.length === 0) {
      this.recommendations = [];
      return;
    }
    const ids = this.cart.filter(i => !i.isBundle).map(i => i.product?.id!).filter(id => id);
    if (ids.length === 0) {
      this.recommendations = [];
      return;
    }
    this.api.getBasketSuggestions(ids).subscribe(data => {
      this.recommendations = data;
    });
  }

  addSuggestionToCart(s: RecommendationSuggestion) {
    const product = this.products.find(p => p.id === s.productId);
    if (product) {
      this.addToCart(product);
    }
  }

  getImageUrl(url?: string): string {
    return resolveImageUrl(url);
  }
}
