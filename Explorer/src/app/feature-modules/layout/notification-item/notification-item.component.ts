import { Component, Input, Output, EventEmitter } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationDto, NotificationType } from '../model/notification.model';
import { NotificationService } from '../notification.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-notification-item',
  templateUrl: './notification-item.component.html',
  styleUrls: ['./notification-item.component.css']
})
export class NotificationItemComponent {
  @Input() notification!: NotificationDto;
  @Output() notificationClicked = new EventEmitter<void>();

  NotificationType = NotificationType;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    private authService: AuthService
  ) {}

  getIcon(): string {
    switch (this.notification.type) {
      case NotificationType.NewMessage:
        return 'chat';
      case NotificationType.ProblemResolved:
        return 'check_circle';
      case NotificationType.ProblemUnresolved:
        return 'cancel';
      case NotificationType.WalletTopUp:
        return 'account_balance_wallet';
      default:
        return 'notifications';
    }
  }

  getIconColor(): string {
    switch (this.notification.type) {
      case NotificationType.NewMessage:
        return '#1976d2';
      case NotificationType.ProblemResolved:
        return '#4caf50';
      case NotificationType.ProblemUnresolved:
        return '#f44336';
      case NotificationType.WalletTopUp:
        return 'var(--color-primary-500)';
      default:
        return '#757575';
    }
  }

  getRelativeTime(): string {
    const now = new Date();
    const created = new Date(this.notification.createdAt);
    const diffMs = now.getTime() - created.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    
    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins} min ago`;
    
    const diffHours = Math.floor(diffMins / 60);
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
    
    const diffWeeks = Math.floor(diffDays / 7);
    if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
    
    const diffMonths = Math.floor(diffDays / 30);
    return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  }

  onClick(): void {
    if (!this.notification.isRead) {
      this.notificationService.markAsRead(this.notification.id).subscribe({
        next: () => {
          this.notification.isRead = true;
        },
        error: (error) => {
          console.error('Error marking notification as read:', error);
        }
      });
    }

    this.authService.user$.subscribe(user => {
      if (!user) return; 

      if (user) {
        if (this.notification.type === NotificationType.WalletTopUp) {
          if (user.role === 'tourist') {
            this.router.navigate(['/tourist/wallet']);
          }
          this.notificationClicked.emit();
          return;
        }
        
        const route = user.role === 'author' 
          ? `/author/tour-problems/${this.notification.relatedEntityId}`
          : `/tour-execution/tour-problems/${this.notification.relatedEntityId}`;
        this.router.navigate([route]);
      }
    }).unsubscribe();
    this.notificationClicked.emit();
  }
}
