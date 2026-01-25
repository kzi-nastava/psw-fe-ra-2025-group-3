import { Component } from '@angular/core';
import { FormGroup, FormControl, Validators } from '@angular/forms';
import { Registration } from '../model/registration.model';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { WelcomeBonusService } from 'src/app/feature-modules/stakeholders/welcome-bonus.service';
import { WelcomeBonusModalComponent } from './welcome-bonus-modal/welcome-bonus-modal.component';

@Component({
  selector: 'xp-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.css']
})
export class RegistrationComponent {

  // enum direktno ovdje, nema novog fajla
  UserRole = {
    Administrator: 'Administrator',
    Author: 'Author',
    Tourist: 'Tourist'
  } as const; // readonly

  constructor(
    private authService: AuthService,
    private router: Router,
    private dialog: MatDialog,
    private welcomeBonusService: WelcomeBonusService
  ) {}

  registrationForm = new FormGroup({
    name: new FormControl('', [Validators.required]),
    surname: new FormControl('', [Validators.required]),
    email: new FormControl('', [Validators.required]),
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
    role: new FormControl('Tourist', [Validators.required]) // default Tourist
  });

  register(): void {
    if (!this.registrationForm.valid) return;

    const registration: Registration = {
      name: this.registrationForm.value.name || "",
      surname: this.registrationForm.value.surname || "",
      email: this.registrationForm.value.email || "",
      username: this.registrationForm.value.username || "",
      password: this.registrationForm.value.password || "",
      role: this.registrationForm.value.role!
    };

    this.authService.register(registration).subscribe({
      next: () => {
        // Ako je turista, prikaži bonus modal
        if (registration.role === 'Tourist') {
          this.welcomeBonusService.getWelcomeBonus().subscribe({
            next: (bonus) => {
              const dialogRef = this.dialog.open(WelcomeBonusModalComponent, {
                width: '500px',
                data: { bonus },
                disableClose: false
              });

              dialogRef.afterClosed().subscribe(() => {
                this.router.navigate(['home']);
              });
            },
            error: () => {
              // Ako ne postoji bonus ili greška, samo navigiraj
              this.router.navigate(['home']);
            }
          });
        } else {
          this.router.navigate(['home']);
        }
      },
    });
  }
}
