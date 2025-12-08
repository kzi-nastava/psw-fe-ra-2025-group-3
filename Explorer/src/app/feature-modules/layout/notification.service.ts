import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import { NotificationDto, UnreadCountDto, MarkAllReadResultDto } from './model/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  constructor(private http: HttpClient) {}

  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(`${environment.apiHost}notifications/my`);
  }

  getUnreadCount(): Observable<UnreadCountDto> {
    return this.http.get<UnreadCountDto>(`${environment.apiHost}notifications/unread-count`)
      .pipe(
        tap(result => this.unreadCountSubject.next(result.count))
      );
  }

  markAsRead(id: number): Observable<NotificationDto> {
    return this.http.put<NotificationDto>(`${environment.apiHost}notifications/${id}/mark-read`, {})
      .pipe(
        tap(() => {
          const currentCount = this.unreadCountSubject.value;
          if (currentCount > 0) {
            this.unreadCountSubject.next(currentCount - 1);
          }
        })
      );
  }

  markAllAsRead(): Observable<MarkAllReadResultDto> {
    return this.http.put<MarkAllReadResultDto>(`${environment.apiHost}notifications/mark-all-read`, {})
      .pipe(
        tap(() => this.unreadCountSubject.next(0))
      );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }
}
