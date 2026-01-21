import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import {
  NotificationDto,
  UnreadCountDto,
  MarkAllReadResultDto
} from './model/notification.model';

import * as signalR from '@microsoft/signalr';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {

  // 🔔 unread badge count
  private unreadCountSubject = new BehaviorSubject<number>(0);
  public unreadCount$ = this.unreadCountSubject.asObservable();

  // 📥 lista notifikacija (dropdown + realtime)
  private notificationsSubject = new BehaviorSubject<NotificationDto[]>([]);
  public notifications$ = this.notificationsSubject.asObservable();

  // 🔌 SignalR
  private hubConnection!: signalR.HubConnection;

  constructor(
    private http: HttpClient,
    private tokenStorage: TokenStorage
  ) {}

  // =====================
  // ===== REST API ======
  // =====================

  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(
      `${environment.apiHost}notifications/my`
    ).pipe(
      tap(notifications => {
        // inicijalno napuni dropdown
        this.notificationsSubject.next(notifications);
      })
    );
  }

  getUnreadCount(): Observable<UnreadCountDto> {
    return this.http.get<UnreadCountDto>(
      `${environment.apiHost}notifications/unread-count`
    ).pipe(
      tap(result => this.unreadCountSubject.next(result.count))
    );
  }

  markAsRead(id: number): Observable<NotificationDto> {
    return this.http.put<NotificationDto>(
      `${environment.apiHost}notifications/${id}/mark-read`,
      {}
    ).pipe(
      tap(() => {
        const current = this.unreadCountSubject.value;
        if (current > 0) {
          this.unreadCountSubject.next(current - 1);
        }
      })
    );
  }

  markAllAsRead(): Observable<MarkAllReadResultDto> {
    return this.http.put<MarkAllReadResultDto>(
      `${environment.apiHost}notifications/mark-all-read`,
      {}
    ).pipe(
      tap(() => this.unreadCountSubject.next(0))
    );
  }

  refreshUnreadCount(): void {
    this.getUnreadCount().subscribe();
  }

  private getMyPersonIdFromToken(): number | null {
    const token = this.tokenStorage.getAccessToken();
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      // najčešći slučaj u vašem projektu: 'personId'
      const raw = payload['personId']
        ?? payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier']
        ?? payload['nameid']
        ?? payload['sub'];

      const id = Number(raw);
      return Number.isFinite(id) ? id : null;
    } catch {
      return null;
    }
  }

  // =====================
  // ===== SIGNALR =======
  // =====================

  startSignalRConnection(): void {
    // ⛔ nemoj duplu konekciju
    if (this.hubConnection && this.hubConnection.state === signalR.HubConnectionState.Connected) {
      return;
    }

    // derive SignalR host from API host (remove trailing /api/ if present)
    const apiBase = environment.apiHost.replace(/\/api\/?$/i, '').replace(/\/$/, '');
    const hubUrl = `${apiBase}/hubs/notifications`;
    console.log('SignalR hub URL:', hubUrl);

    const token = this.tokenStorage.getAccessToken();
    console.log('SignalR token:', token);
    if (!token) {
      console.warn('No access token available — not starting SignalR connection');
      return;
    }

    this.hubConnection = new signalR.HubConnectionBuilder()
      .withUrl(hubUrl, {
        accessTokenFactory: () => token
      })
      .withAutomaticReconnect()
      .build();

    this.hubConnection.start()
      .then(() => console.log('✅ SignalR connected'))
      .catch(err => console.error('❌ SignalR error', err));

    // 🎯 prima notifikacije u real-time
    this.hubConnection.on(
      'ReceiveNotification',
      (notification: NotificationDto) => {

        const myId = this.getMyPersonIdFromToken();
        if (myId !== null && notification.recipientId !== myId) {
          return; // ignoriše tuđe notifikacije 
        }

        // 1️⃣ povećaj badge
        this.unreadCountSubject.next(
          this.unreadCountSubject.value + 1
        );

        // 2️⃣ ubaci notifikaciju na vrh dropdown-a
        this.notificationsSubject.next([
          notification,
          ...this.notificationsSubject.value
        ]);
      }
    );
  }
}
