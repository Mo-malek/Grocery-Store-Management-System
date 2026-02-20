import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const managerGuard: CanActivateFn = (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUserValue;
    if (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER' || user.role === 'ROLE_CASHIER')) {
        return true;
    }

    // Redirect to storefront if not authorized
    router.navigate(['/shop/home']);
    return false;
};
