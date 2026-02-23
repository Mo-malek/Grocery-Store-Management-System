import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject, interval, Subscription } from 'rxjs';
import { switchMap, startWith } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

export interface AppNotification {
  id: number;
  title: string;
  body: string;
  type: string;
  relatedEntityId: string;
  read: boolean;
  createdAt: string;
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private _unreadCount = new BehaviorSubject<number>(0);
  public unreadCount$ = this._unreadCount.asObservable();

  private pollingSub: Subscription | null = null;

  constructor(private http: HttpClient) { }

  public startPolling() {
    if (this.pollingSub) {
      return;
    }
    this.pollingSub = interval(30000)
      .pipe(
        startWith(0),
        switchMap(() => this.getUnreadCount())
      )
      .subscribe(count => this._unreadCount.next(count));
  }

  public stopPolling() {
    if (this.pollingSub) {
      this.pollingSub.unsubscribe();
      this.pollingSub = null;
    }
  }

  getNotifications(): Observable<AppNotification[]> {
    return this.http.get<AppNotification[]>(`${environment.apiUrl}/notifications`);
  }

  getUnreadCount(): Observable<number> {
    return this.http.get<number>(`${environment.apiUrl}/notifications/unread-count`);
  }

  markAsRead(id: number): Observable<void> {
    return this.http.put<void>(`${environment.apiUrl}/notifications/${id}/read`, {});
  }

  updateUnreadCount(count: number) {
    this._unreadCount.next(count);
  }
}
