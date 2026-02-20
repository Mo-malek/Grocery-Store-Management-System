import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const adminManagerGuard: CanActivateFn = (_route, _state) => {
    const authService = inject(AuthService);
    const router = inject(Router);

    const user = authService.currentUserValue;
    if (user && (user.role === 'ROLE_ADMIN' || user.role === 'ROLE_MANAGER')) {
        return true;
    }

    router.navigate(['/pos']);
    return false;
};
