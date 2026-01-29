import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { NotificationService } from '../notification.service';
import { NotificationDto, NotificationType } from '../model/notification.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'xp-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit, OnDestroy {
  @Output() closeDropdown = new EventEmitter<void>();

  notifications: NotificationDto[] = [];
  isLoading: boolean = true;
  NotificationType = NotificationType;

  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    // ✅ realtime (SignalR) lista
    this.notificationService.notifications$
      .pipe(takeUntil(this.destroy$))
      .subscribe(n => {
        console.log('Notifications updated in dropdown:', {
          count: n.length,
          types: n.map(notif => ({ id: notif.id, type: notif.type, message: notif.message }))
        });
        this.notifications = n.slice(0, 20);
        this.isLoading = false;
      });

    // ✅ inicijalno punjenje iz baze
    this.loadNotifications();
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getMyNotifications().subscribe({
      next: () => {
        // ništa: servis već ubaci u notificationsSubject u tap()
        // a subscription iznad će ažurirati this.notifications
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: () => {
        this.loadNotifications();
      },
      error: (error) => {
        console.error('Error marking all as read:', error);
      }
    });
  }

  isAllRead(): boolean {
    return this.notifications.every(n => n.isRead);
  }

  onNotificationClick(): void {
    this.closeDropdown.emit();
  }
}
