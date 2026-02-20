import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { StorefrontProduct } from '../models/models';

@Injectable({
    providedIn: 'root'
})
export class WishlistService {
    private readonly storageKey = 'wishlist';
    private readonly itemsSubject = new BehaviorSubject<StorefrontProduct[]>([]);
    items$ = this.itemsSubject.asObservable();

    constructor() {
        const saved = localStorage.getItem(this.storageKey);
        if (saved) {
            try {
                this.itemsSubject.next(JSON.parse(saved));
            } catch {
                this.itemsSubject.next([]);
            }
        }
    }

    add(product: StorefrontProduct) {
        if (this.has(product.id)) return;
        this.itemsSubject.next([...this.itemsSubject.value, product]);
        this.save();
    }

    remove(productId: number) {
        this.itemsSubject.next(this.itemsSubject.value.filter(p => p.id !== productId));
        this.save();
    }

    toggle(product: StorefrontProduct): boolean {
        if (this.has(product.id)) {
            this.remove(product.id);
            return false;
        }
        this.add(product);
        return true;
    }

    has(productId: number): boolean {
        return this.itemsSubject.value.some(p => p.id === productId);
    }

    count(): number {
        return this.itemsSubject.value.length;
    }

    private save() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.itemsSubject.value));
    }
}
