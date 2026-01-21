import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { StakeholderService } from '../stakeholder.service';
import { Person } from '../model/person.model';
import { WelcomeBonusService } from '../welcome-bonus.service';
import { WelcomeBonus, BonusType } from '../model/welcome-bonus.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class ProfileComponent implements OnInit {

  isEditing = false;
  welcomeBonus: WelcomeBonus | null = null;
  isLoadingBonus = false;
  
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
    private welcomeBonusService: WelcomeBonusService,
    private authService: AuthService
  ) { }

  ngOnInit(): void {
    this.loadProfile();
    if (this.isTourist()) {
      this.loadWelcomeBonus();
    }
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

  loadWelcomeBonus(): void {
    this.isLoadingBonus = true;
    this.welcomeBonusService.getWelcomeBonus().subscribe({
      next: (bonus) => {
        this.welcomeBonus = bonus;
        this.isLoadingBonus = false;
      },
      error: () => {
        this.welcomeBonus = null;
        this.isLoadingBonus = false;
      }
    });
  }

  getBonusStatus(): string {
    if (!this.welcomeBonus) return '';
    
    if (this.welcomeBonus.isUsed) {
      return 'Iskorišćen';
    }
    
    if (this.welcomeBonus.bonusType === BonusType.Discount10 || 
        this.welcomeBonus.bonusType === BonusType.Discount20 || 
        this.welcomeBonus.bonusType === BonusType.Discount30) {
      return 'Aktivan - Važi do prve kupovine';
    }
    
    return 'Aktivan';
  }

  getBonusDescription(): string {
    if (!this.welcomeBonus) return '';
    
    if (this.welcomeBonus.bonusType === BonusType.AC100 || 
        this.welcomeBonus.bonusType === BonusType.AC250 || 
        this.welcomeBonus.bonusType === BonusType.AC500) {
      return `${this.welcomeBonus.value} Adventure Coins`;
    } else {
      return `${this.welcomeBonus.value}% popusta na prvu kupovinu`;
    }
  }

  isTourist(): boolean {
    return this.authService.isTourist();
  }
}