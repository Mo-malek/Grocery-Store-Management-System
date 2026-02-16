import { Injectable } from '@angular/core';
import { HttpRequest, HttpHandler, HttpEvent, HttpInterceptor } from '@angular/common/http';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';

@Injectable()
export class JwtInterceptor implements HttpInterceptor {
    constructor(private authService: AuthService) { }

    intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
        // add auth header with jwt if user is logged in and request is to the api url
        const currentUser = this.authService.currentUserValue;
        const isLoggedIn = currentUser && currentUser.token;
        // Check if the URL is an API call (relative or absolute)
        const isApiUrl = request.url.startsWith('/api') || request.url.includes(':8080/api') || (request.url.includes('/api') && !request.url.includes('.json'));

        if (isLoggedIn && (isApiUrl || request.url.startsWith('http://localhost:8080'))) {
            request = request.clone({
                setHeaders: {
                    Authorization: `Bearer ${currentUser.token}`
                }
            });
        }

        return next.handle(request);
    }
}
