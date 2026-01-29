import { Component, Input, Output, EventEmitter, OnInit, Inject, Optional } from '@angular/core';
import { Router } from '@angular/router';
import { NotificationDto } from '../model/notification.model';
import { NotificationService } from '../notification.service';
import { MAT_SNACK_BAR_DATA, MatSnackBarRef } from '@angular/material/snack-bar';

@Component({
  selector: 'xp-ac-reward-notification',
  templateUrl: './ac-reward-notification.component.html',
  styleUrls: ['./ac-reward-notification.component.css']
})
export class AcRewardNotificationComponent implements OnInit {
  @Input() notification!: NotificationDto;
  @Output() notificationClicked = new EventEmitter<void>();

  totalAc: number = 0;
  baseReward: number = 0;
  fastCompletionBonus: number = 0;
  streakBonus: number = 0;
  showAnimation: boolean = false;

  constructor(
    private router: Router,
    private notificationService: NotificationService,
    @Optional() @Inject(MAT_SNACK_BAR_DATA) public data: { notification: NotificationDto } | null,
    @Optional() private snackBarRef: MatSnackBarRef<AcRewardNotificationComponent>
  ) {}

  ngOnInit(): void {
    // Ako je komponenta pozvana iz snackbar-a, koristi podatke iz data
    if (this.data?.notification) {
      this.notification = this.data.notification;
    }
    
    // Parse AC rewards from message
    this.parseRewards();
    
    // Debug logging
    console.log('AC Reward Notification:', {
      message: this.notification.message,
      totalAc: this.totalAc,
      baseReward: this.baseReward,
      fastCompletionBonus: this.fastCompletionBonus,
      streakBonus: this.streakBonus
    });
    
    // Trigger animation after a short delay
    setTimeout(() => {
      this.showAnimation = true;
    }, 100);
  }

  private parseRewards(): void {
    const message = this.notification.message;
    
    // Extract total AC - format: "You've earned {totalAc} AC for completed tour..." or "Osvojili ste {totalAc} AC za završenu turu..." (for backward compatibility)
    const totalMatch = message.match(/(?:You've earned|Osvojili ste) (\d+) AC/);
    if (totalMatch) {
      this.totalAc = parseInt(totalMatch[1], 10);
    }

    // Extract base reward - format: "Base reward: +{baseReward} AC" or "Osnovna nagrada: +{baseReward} AC" (for backward compatibility)
    const baseMatch = message.match(/(?:Base reward|Osnovna nagrada):\s*\+(\d+)\s*AC/);
    if (baseMatch) {
      this.baseReward = parseInt(baseMatch[1], 10);
    }

    // Extract fast completion bonus - format: "Fast completion bonus: +{fastCompletionBonus} AC" or "Bonus za brzu završnicu: +{fastCompletionBonus} AC" (for backward compatibility)
    const fastMatch = message.match(/(?:Fast completion bonus|Bonus za brzu završnicu):\s*\+(\d+)\s*AC/);
    if (fastMatch) {
      this.fastCompletionBonus = parseInt(fastMatch[1], 10);
    }

    // Extract streak bonus - format: "Streak bonus: +{streakBonus} AC"
    const streakMatch = message.match(/Streak bonus[^:]*:\s*\+(\d+)\s*AC/);
    if (streakMatch) {
      this.streakBonus = parseInt(streakMatch[1], 10);
    }

    // Fallback: if parsing failed, try to calculate totalAc from parts
    if (this.totalAc === 0 && (this.baseReward > 0 || this.fastCompletionBonus > 0 || this.streakBonus > 0)) {
      this.totalAc = this.baseReward + this.fastCompletionBonus + this.streakBonus;
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
    if (diffHours < 24) return `${diffHours} ${diffHours === 1 ? 'hour' : 'hours'} ago`;
    
    const diffDays = Math.floor(diffHours / 24);
    return `${diffDays} ${diffDays === 1 ? 'day' : 'days'} ago`;
  }

  onClose(): void {
    // Zatvori snackbar ako postoji
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }
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

    // Zatvori snackbar ako postoji
    if (this.snackBarRef) {
      this.snackBarRef.dismiss();
    }

    // Navigate to wallet
    this.router.navigate(['/tourist/wallet']);
    this.notificationClicked.emit();
  }
}
