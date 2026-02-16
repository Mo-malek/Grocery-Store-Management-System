import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, map } from 'rxjs';
import { AuthRequest, AuthResponse } from '../models/models';
import { Router } from '@angular/router';

@Injectable({
    providedIn: 'root'
})
export class AuthService {
    private currentUserSubject: BehaviorSubject<AuthResponse | null>;
    public currentUser: Observable<AuthResponse | null>;

    constructor(private http: HttpClient, private router: Router) {
        const savedUser = localStorage.getItem('currentUser');
        this.currentUserSubject = new BehaviorSubject<AuthResponse | null>(savedUser ? JSON.parse(savedUser) : null);
        this.currentUser = this.currentUserSubject.asObservable();
    }

    public get currentUserValue(): AuthResponse | null {
        return this.currentUserSubject.value;
    }

    login(request: AuthRequest): Observable<AuthResponse> {
        return this.http.post<AuthResponse>('/api/auth/login', request).pipe(
            map(user => {
                localStorage.setItem('currentUser', JSON.stringify(user));
                this.currentUserSubject.next(user);
                return user;
            })
        );
    }

    logout() {
        localStorage.removeItem('currentUser');
        this.currentUserSubject.next(null);
        this.router.navigate(['/login']);
    }

    isLoggedIn(): boolean {
        return !!this.currentUserValue;
    }
}
