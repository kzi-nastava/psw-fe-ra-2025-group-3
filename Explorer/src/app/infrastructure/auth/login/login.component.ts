import { Component, AfterViewInit, NgZone } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { AuthService } from '../auth.service';
import { Router } from '@angular/router';
import { Login } from '../model/login.model';
import { environment } from 'src/env/environment';
import { MatDialog } from '@angular/material/dialog';
import { WelcomeBonusService } from 'src/app/feature-modules/stakeholders/welcome-bonus.service';
import { WelcomeBonusModalComponent } from '../registration/welcome-bonus-modal/welcome-bonus-modal.component';

declare const google: any;

@Component({
  selector: 'xp-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements AfterViewInit {

  constructor(
    private authService: AuthService,
    private router: Router,
    private ngZone: NgZone,
    private dialog: MatDialog,
    private welcomeBonusService: WelcomeBonusService
  ) {}

  loginForm = new FormGroup({
    username: new FormControl('', [Validators.required]),
    password: new FormControl('', [Validators.required]),
  });

  ngAfterViewInit(): void {
    this.initializeGoogleSignIn();
  }

  private initializeGoogleSignIn(): void {
    if (typeof google !== 'undefined') {
      google.accounts.id.initialize({
        client_id: environment.googleClientId,
        callback: (response: any) => this.handleGoogleCredentialResponse(response)
      });

      google.accounts.id.renderButton(
        document.getElementById('google-hidden-btn'),
        { type: 'standard', size: 'large' }
      );
    } else {
      setTimeout(() => this.initializeGoogleSignIn(), 100);
    }
  }

  googleSignIn(): void {
    const hiddenBtn = document.querySelector('#google-hidden-btn div[role="button"]') as HTMLElement;
    if (hiddenBtn) {
      hiddenBtn.click();
    }
  }

  private handleGoogleCredentialResponse(response: any): void {
    this.ngZone.run(() => {
      const idToken = response.credential;
      this.authService.googleLogin(idToken).subscribe({
        next: (authResponse) => {
          if (authResponse.isNewUser) {
            this.welcomeBonusService.getWelcomeBonus().subscribe({
              next: (bonus) => {
                const dialogRef = this.dialog.open(WelcomeBonusModalComponent, {
                  width: '500px',
                  data: { bonus },
                  disableClose: false
                });

                dialogRef.afterClosed().subscribe(() => {
                  this.router.navigate(['/']);
                });
              },
              error: () => {
                this.router.navigate(['/']);
              }
            });
          } else {
            this.router.navigate(['/']);
          }
        },
        error: (err) => {
          console.error('Google login failed:', err);
        }
      });
    });
  }

  login(): void {
    const login: Login = {
      username: this.loginForm.value.username || "",
      password: this.loginForm.value.password || "",
    };

    if (this.loginForm.valid) {
      this.authService.login(login).subscribe({
        next: () => {
          this.router.navigate(['/']);
        },
      });
    }
  }
}
