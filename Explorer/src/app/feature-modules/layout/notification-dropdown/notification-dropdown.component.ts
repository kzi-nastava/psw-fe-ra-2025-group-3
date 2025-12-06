import { Component, OnInit, Output, EventEmitter } from '@angular/core';
import { NotificationService } from '../notification.service';
import { NotificationDto } from '../model/notification.model';

@Component({
  selector: 'xp-notification-dropdown',
  templateUrl: './notification-dropdown.component.html',
  styleUrls: ['./notification-dropdown.component.css']
})
export class NotificationDropdownComponent implements OnInit {
  @Output() closeDropdown = new EventEmitter<void>();
  
  notifications: NotificationDto[] = [];
  isLoading: boolean = true;

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    this.notificationService.getMyNotifications().subscribe({
      next: (notifications) => {
        this.notifications = notifications.slice(0, 20); // Show max 20
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading notifications:', error);
        this.isLoading = false;
      }
    });
  }

  markAllAsRead(): void {
    this.notificationService.markAllAsRead().subscribe({
      next: (result) => {
        console.log(`Marked ${result.updatedCount} notifications as read`);
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
