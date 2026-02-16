import { Injectable, signal } from '@angular/core';

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    // Using signals for modern state management
    private _isSidebarOpen = signal(false);

    // Read-only signal
    isSidebarOpen = this._isSidebarOpen.asReadonly();

    toggleSidebar() {
        this._isSidebarOpen.update(v => !v);
    }

    closeSidebar() {
        this._isSidebarOpen.set(false);
    }

    openSidebar() {
        this._isSidebarOpen.set(true);
    }
}
