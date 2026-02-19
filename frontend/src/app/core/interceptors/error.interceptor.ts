import { Injectable, Injector } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';
import { ToastService } from '../services/toast.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
    constructor(private toast: ToastService, private injector: Injector) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        return next.handle(request).pipe(
            catchError((error: HttpErrorResponse) => {
                let errorMessage = 'حدث خطأ غير متوقع';

                if (error.error instanceof ErrorEvent) {
                    // Client-side error
                    errorMessage = `خطأ: ${error.error.message}`;
                } else {
                    // Server-side error
                    if (error.status === 401 || error.status === 403) {
                        errorMessage = error.status === 401
                            ? 'جلسة العمل انتهت أو البيانات غير صحيحة'
                            : 'ليس لديك صلاحية للقيام بهذا الإجراء';

                        // Auto-logout
                        const authService = this.injector.get(AuthService);
                        authService.logout();
                    } else if (error.status === 429) {
                        errorMessage = 'تم تجاوز حد الطلبات. يرجى الانتظار دقيقة.';
                    } else if (error.error && error.error.message) {
                        errorMessage = error.error.message;
                    } else if (error.status === 0) {
                        errorMessage = 'تعذر الاتصال بالخادم. تأكد من اتصال الإنترنت.';
                    }
                }

                this.toast.error(errorMessage);
                return throwError(() => error);
            })
        );
    }
}
