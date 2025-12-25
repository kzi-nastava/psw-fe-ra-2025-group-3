import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Subscription } from 'rxjs';
import { MatSnackBar } from '@angular/material/snack-bar';
import { NewsletterService } from 'src/app/feature-modules/blog/newsletter.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {

  backgroundImages: string[] = [
    'assets/images/pozadina.jpg',
    'assets/images/pozadina2.jpg',
    'assets/images/pozadina3.jpg'
  ];

  currentBackgroundIndex: number = 0;
  private backgroundInterval: any;
  private userSubscription?: Subscription;

  isLoggedIn: boolean = false;

  // 🔹 Newsletter
  newsletterEmail: string = '';
  isSubscribing: boolean = false;

  constructor(
    private authService: AuthService,
    private newsletterService: NewsletterService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.checkAuthStatus();
    this.startBackgroundRotation();
  }

  ngOnDestroy(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!(user && user.id !== 0 && user.username !== "");
    });
  }

  startBackgroundRotation(): void {
    this.backgroundInterval = setInterval(() => {
      this.currentBackgroundIndex =
        (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    }, 7000);
  }

  getCurrentBackground(): string {
    return this.backgroundImages[this.currentBackgroundIndex];
  }

  // 🔹 Newsletter subscribe
 subscribeToNewsletter(): void {
  const emailRegex =
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!this.newsletterEmail || !emailRegex.test(this.newsletterEmail)) {
    this.snackBar.open(
      'Please enter a valid email address (e.g. name@example.com).',
      'Close',
      {
        duration: 4000,
        panelClass: ['error-snackbar']
      }
    );
    return;
  }

  this.isSubscribing = true;

  this.newsletterService.subscribe(this.newsletterEmail).subscribe({
    next: () => {
      this.snackBar.open(
        'You’re in! 🎉 We’ll keep you inspired.',
        'Close',
        { duration: 5000 }
      );
      this.newsletterEmail = '';
      this.isSubscribing = false;
    },
    error: (err) => {
      if (err?.status === 409) {
        this.snackBar.open(
          'This email is already subscribed.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      } else {
        this.snackBar.open(
          'Something went wrong. Please try again later.',
          'Close',
          { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
      this.isSubscribing = false;
    }
  });
}
}
