import { Component, OnInit } from '@angular/core';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';

@Component({
  selector: 'xp-profile-sidebar',
  templateUrl: './profile-sidebar.component.html',
  styleUrls: ['./profile-sidebar.component.css']
})
export class ProfileSidebarComponent implements OnInit {
  profile: Person | null = null;

  constructor(private stakeholderService: StakeholderService) {}

  ngOnInit(): void {
    this.loadProfile();
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
