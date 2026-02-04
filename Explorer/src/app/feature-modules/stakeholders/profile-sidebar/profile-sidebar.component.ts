import { Component, OnInit, OnDestroy } from '@angular/core';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

@Component({
  selector: 'xp-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css']
})
export class ProfileSidebarComponent implements OnInit, OnDestroy {
  profile: Person | null = null;
  private destroy$ = new Subject<void>();

  constructor(private stakeholderService: StakeholderService) {}

  ngOnInit(): void {
    this.loadProfile();
    
    // Subscribe to profile updates
    this.stakeholderService.profileUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadProfile();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadProfile(): void {
    this.stakeholderService.getProfile().subscribe({
      next: (profile: Person) => {
        this.profile = profile;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      }
    });
  }

  getProfileImageUrl(): string {
    if (!this.profile?.profilePictureUrl) {
      return 'https://ionicframework.com/docs/img/demos/avatar.svg';
    }
    return this.profile.profilePictureUrl;
  }
}
