import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { AuthorProfileStatsDto } from '../model/author-profile-stats.model';
import { User } from 'src/app/infrastructure/auth/model/user.model';

@Component({
  selector: 'xp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isEditing = false;

  
  authorStats: AuthorProfileStatsDto | null = null;
  isAuthor = false;
  

  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    surname: new FormControl('', Validators.required),
    email: new FormControl('', [Validators.required, Validators.email]),
    biography: new FormControl(''),
    quote: new FormControl(''),
    profilePictureUrl: new FormControl('')
  });

 
  constructor(
    private service: StakeholderService,
    private authService: AuthService
  ) { }
 

  ngOnInit(): void {
    this.loadProfile();

    
    this.authService.user$.subscribe((user: User | undefined) => {
      this.isAuthor = user?.role === 'author';
      if (this.isAuthor) {
        this.loadAuthorStats();
      } else {
        this.authorStats = null;
      }
    });
    
  }

  loadProfile(): void {
    this.service.getProfile().subscribe({
      next: (profile: Person) => {
        this.profileForm.patchValue({
          name: profile.name,
          surname: profile.surname,
          email: profile.email,
          biography: profile.biography || '',
          quote: profile.quote || '',
          profilePictureUrl: profile.profilePictureUrl || ''
        });
        this.profileForm.disable();
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Failed to load profile:', err);
      }
    });
  }

  // ===== DODATO =====
  loadAuthorStats(): void {
    this.service.getMyAuthorProfileStats().subscribe({
      next: (stats) => {
        this.authorStats = stats;
      },
      error: (err) => {
        console.error('Failed to load author stats:', err);
        this.authorStats = null;
      }
    });
  }
  // ==================

  toggleEdit(): void {
    if (this.isEditing) {
      this.profileForm.disable();
      this.isEditing = false;
      this.loadProfile();
    } else {
      this.profileForm.enable();
      this.isEditing = true;
    }
  }

  saveChanges(): void {
    if (this.profileForm.invalid) {
      return;
    }

    const updatedProfile: Person = {
      id: 0,
      userId: 0,
      name: this.profileForm.value.name || '',
      surname: this.profileForm.value.surname || '',
      email: this.profileForm.value.email || '',
      biography: this.profileForm.value.biography || '',
      quote: this.profileForm.value.quote || '',
      profilePictureUrl: this.profileForm.value.profilePictureUrl || ''
    };

    this.service.updateProfile(updatedProfile).subscribe({
      next: () => {
        this.profileForm.disable();
        this.isEditing = false;
      },
      error: (err) => {
        console.error('Failed to update profile:', err);
      }
    });
  }
}
