import { Injectable, NgZone } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import {
  NotificationDto,
  UnreadCountDto,
  MarkAllReadResultDto,
  NotificationType
} from './model/notification.model';

import * as signalR from '@microsoft/signalr';
import { TokenStorage } from 'src/app/infrastructure/auth/jwt/token.service';
import { MatSnackBar, MatSnackBarRef } from '@angular/material/snack-bar';
import { AcRewardNotificationComponent } from './ac-reward-notification/ac-reward-notification.component';

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
    private tokenStorage: TokenStorage,
    private snackBar: MatSnackBar,
    private ngZone: NgZone
  ) {}

  // =====================
  // ===== REST API ======
  // =====================

  getMyNotifications(): Observable<NotificationDto[]> {
    return this.http.get<NotificationDto[]>(
      `${environment.apiHost}notifications/my`
    ).pipe(
      tap(notifications => {
        console.log('Loaded notifications from API:', {
          count: notifications.length,
          notifications: notifications.map(n => ({ id: n.id, type: n.type, message: n.message }))
        });
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

        // Debug logging
        console.log('Received notification:', {
          id: notification.id,
          type: notification.type,
          message: notification.message,
          recipientId: notification.recipientId
        });

        // 🎉 Prikaži custom toast komponentu za AC nagradu
        if (notification.type === NotificationType.TourRewardAc) {
          console.log('TourRewardAc notification detected, showing custom toast...');
          
          // Koristi NgZone da osiguraš da se toast poziva u Angular zone-u
          this.ngZone.run(() => {
            try {
              setTimeout(() => {
                const snackBarRef: MatSnackBarRef<AcRewardNotificationComponent> = this.snackBar.openFromComponent(
                  AcRewardNotificationComponent,
                  {
                    duration: 6000,
                    horizontalPosition: 'center',
                    verticalPosition: 'top',
                    panelClass: ['ac-reward-toast-container'],
                    data: { notification: notification }
                  }
                );
                
                // Postavi notification input na komponentu
                if (snackBarRef.instance) {
                  snackBarRef.instance.notification = notification;
                }
                
                // Centriraj toast nakon što se otvori
                snackBarRef.afterOpened().subscribe(() => {
                  setTimeout(() => {
                    // Pronađi sve snackbar elemente i centriraj ih
                    const snackbarContainer = document.querySelector('.ac-reward-toast-container');
                    if (snackbarContainer) {
                      const container = snackbarContainer as HTMLElement;
                      const rect = container.getBoundingClientRect();
                      const windowWidth = window.innerWidth;
                      const containerWidth = rect.width || 500;
                      const leftPosition = (windowWidth - containerWidth) / 2;
                      
                      container.style.position = 'fixed';
                      container.style.top = '225px';
                      container.style.left = `${leftPosition}px`;
                      container.style.right = 'auto';
                      container.style.transform = 'none';
                      container.style.width = `${containerWidth}px`;
                      container.style.maxWidth = '500px';
                      container.style.zIndex = '10000';
                      container.style.margin = '0';
                      container.style.padding = '0';
                    }
                    
                    // Centriraj MatSnackBar container
                    const matContainer = document.querySelector('.ac-reward-toast-container .mat-mdc-snack-bar-container');
                    if (matContainer) {
                      const mat = matContainer as HTMLElement;
                      mat.style.margin = '0';
                      mat.style.width = '100%';
                      mat.style.maxWidth = '500px';
                      mat.style.left = '0';
                      mat.style.right = '0';
                    }
                    
                    // Centriraj MDC surface
                    const mdcSurface = document.querySelector('.ac-reward-toast-container .mdc-snackbar__surface');
                    if (mdcSurface) {
                      const surface = mdcSurface as HTMLElement;
                      surface.style.margin = '0';
                      surface.style.width = '100%';
                      surface.style.maxWidth = '500px';
                    }
                    
                    // Centriraj MDC snackbar
                    const mdcSnackbar = document.querySelector('.ac-reward-toast-container .mdc-snackbar');
                    if (mdcSnackbar) {
                      const snackbar = mdcSnackbar as HTMLElement;
                      snackbar.style.position = 'static';
                      snackbar.style.left = 'auto';
                      snackbar.style.right = 'auto';
                      snackbar.style.margin = '0';
                    }
                  }, 200);
                });
                
                console.log('Custom AC reward toast opened successfully');
              }, 100);
            } catch (error) {
              console.error('Error opening custom toast:', error);
            }
          });
        }

        // 1️⃣ povećaj badge
        this.unreadCountSubject.next(
          this.unreadCountSubject.value + 1
        );

        // 2️⃣ ubaci notifikaciju na vrh dropdown-a
        const currentNotifications = this.notificationsSubject.value;
        const updatedNotifications = [notification, ...currentNotifications];
        console.log('Adding notification to list:', {
          notificationId: notification.id,
          type: notification.type,
          currentCount: currentNotifications.length,
          updatedCount: updatedNotifications.length
        });
        this.notificationsSubject.next(updatedNotifications);
      }
    );
  }
}
