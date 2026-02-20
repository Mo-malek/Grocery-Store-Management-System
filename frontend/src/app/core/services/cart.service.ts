import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorefrontProduct } from '../models/models';

export interface CartItem {
    product: StorefrontProduct;
    quantity: number;
}

@Injectable({
    providedIn: 'root'
})
export class CartService {
    private cartItems = new BehaviorSubject<CartItem[]>([]);
    cart$ = this.cartItems.asObservable();

    constructor() {
        const saved = localStorage.getItem('cart');
        if (!saved) {
            return;
        }
        try {
            const parsed = JSON.parse(saved) as CartItem[];
            const sanitized = Array.isArray(parsed)
                ? parsed
                    .filter(item => !!item?.product?.id)
                    .map(item => ({
                        product: item.product,
                        quantity: this.normalizeQty(item.quantity)
                    }))
                : [];
            this.cartItems.next(sanitized);
        } catch {
            localStorage.removeItem('cart');
            this.cartItems.next([]);
        }
    }

    addToCart(product: StorefrontProduct, quantity: number = 1) {
        const qty = this.normalizeQty(quantity);
        const current = [...this.cartItems.value];
        const existing = current.find(item => item.product.id === product.id);
        const maxStock = Math.max(0, Number(product.stock || 0));

        if (existing) {
            const nextQty = maxStock > 0
                ? Math.min(existing.quantity + qty, maxStock)
                : existing.quantity + qty;
            existing.quantity = this.normalizeQty(nextQty);
            this.cartItems.next([...current]);
        } else {
            const initialQty = maxStock > 0 ? Math.min(qty, maxStock) : qty;
            this.cartItems.next([...current, { product, quantity: this.normalizeQty(initialQty) }]);
        }
        this.save();
    }

    updateQuantity(productId: number, quantity: number) {
        const current = [...this.cartItems.value];
        const item = current.find(i => i.product.id === productId);
        if (item) {
            const maxStock = Math.max(0, Number(item.product.stock || 0));
            if (!Number.isFinite(quantity) || quantity <= 0) {
                this.removeFromCart(productId);
                return;
            }
            const nextQty = this.normalizeQty(quantity);
            item.quantity = maxStock > 0 ? Math.min(nextQty, maxStock) : nextQty;
            if (item.quantity <= 0) {
                this.removeFromCart(productId);
            } else {
                this.cartItems.next([...current]);
                this.save();
            }
        }
    }

    removeFromCart(productId: number) {
        const filtered = this.cartItems.value.filter(item => item.product.id !== productId);
        this.cartItems.next(filtered);
        this.save();
    }

    clearCart() {
        this.cartItems.next([]);
        localStorage.removeItem('cart');
    }

    getTotal(): number {
        return this.cartItems.value.reduce((sum, item) => sum + (item.product.price * item.quantity), 0);
    }

    private save() {
        localStorage.setItem('cart', JSON.stringify(this.cartItems.value));
    }

    private normalizeQty(value: number): number {
        const n = Number(value);
        if (!Number.isFinite(n) || n <= 0) {
            return 1;
        }
        return Math.floor(n);
    }
}
