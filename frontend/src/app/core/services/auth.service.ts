import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthRequest, AuthResponse, RegisterRequest } from '../models/models';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { Messaging, getToken, onMessage } from '@angular/fire/messaging';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<AuthResponse | null>;
    public currentUser: Observable<AuthResponse | null>;

    constructor(
        private http: HttpClient,
        private router: Router,
        private messaging: Messaging
    ) {
        const savedUser = localStorage.getItem('currentUser');
        let initialUser: AuthResponse | null = null;
        if (savedUser) {
            try {
                initialUser = JSON.parse(savedUser) as AuthResponse;
            } catch {
                localStorage.removeItem('currentUser');
            }
        }
        this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(initialUser);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    register(request: RegisterRequest): Observable<string> {
        return this.http.post(`${environment.apiUrl}/auth/register`, request, { responseType: 'text' });
    }

    login(request: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>(`${environment.apiUrl}/auth/login`, request).pipe(
            map(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                this.requestNotificationPermission();
                return user;
            })
        );
    }

    private requestNotificationPermission() {
        console.log('Requesting notification permission...');
        Notification.requestPermission().then((permission) => {
            if (permission === 'granted') {
                console.log('Notification permission granted.');
                navigator.serviceWorker.register('/firebase-messaging-sw.js')
                    .then(() => navigator.serviceWorker.ready)
                    .then((registration) => {
                        return getToken(this.messaging, {
                            vapidKey: 'BC8WwY9OKfE8qwplH5mOLC3uksZ2AsLSh_gxk_19hqCWuqJtJYE-O2U1w-xQqfTvSxkmTrC_4ebWOgm8scsIWY4',
                            serviceWorkerRegistration: registration
                        });
                    })
                    .then((token) => {
                        if (token) {
                            this.sendTokenToBackend(token);
                        } else {
                            console.log('No registration token available. Request permission to generate one.');
                        }
                    })
                    .catch((err) => {
                        console.log('An error occurred while retrieving token. ', err);
                    });
            } else {
                console.log('Unable to get permission to notify.');
            }
        });
    }

    private sendTokenToBackend(token: string) {
        this.http.post(`${environment.apiUrl}/notifications/subscribe`, {
            token: token,
            deviceType: 'WEB'
        }).subscribe({
            next: () => console.log('Successfully subscribed to notifications'),
            error: (err) => console.error('Failed to subscribe to notifications', err)
        });
    }

    logout() {
        const currentUser = this.currentUserValue;
        if (currentUser) {
            // Unsubscribe token on the backend before removing it locally
            getToken(this.messaging).then(token => {
                if (token) {
                    this.http.delete(`${environment.apiUrl}/notifications/unsubscribe?token=${token}`).subscribe();
                }
            }).catch(() => { });
        }

        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserValue;
    }

    get isManagerOrAdmin(): boolean {
        const role = this.currentUserValue?.role;
        return role === 'ROLE_ADMIN' || role === 'ROLE_MANAGER';
    }
}
