import { Component, OnInit, OnDestroy, EventEmitter, Output } from '@angular/core';
import { NotificationService } from '../notification.service';
import { interval, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'xp-notification-badge',
  templateUrl: './notification-badge.component.html',
  styleUrls: ['./notification-badge.component.css']
})
export class NotificationBadgeComponent implements OnInit, OnDestroy {
  unreadCount: number = 0;
  isDropdownOpen: boolean = false;
  @Output() dropdownOpened = new EventEmitter<void>();
  private destroy$ = new Subject<void>();

  constructor(private notificationService: NotificationService) {}

  ngOnInit(): void {
    this.notificationService.startSignalRConnection();

    this.notificationService.unreadCount$
      .pipe(takeUntil(this.destroy$))
      .subscribe(count => {
        this.unreadCount = count;
      });

    this.notificationService.refreshUnreadCount();
  }


  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  toggleDropdown(): void {
    const wasOpen = this.isDropdownOpen;
    this.isDropdownOpen = !this.isDropdownOpen;
    if (this.isDropdownOpen && !wasOpen) {
      this.dropdownOpened.emit();
    }
  }

  closeDropdown(): void {
    this.isDropdownOpen = false;
  }
}
