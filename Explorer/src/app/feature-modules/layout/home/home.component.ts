import { Component, OnInit, OnDestroy } from '@angular/core';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, OnDestroy {
  // Background images array
  backgroundImages: string[] = [
    'assets/images/pozadina.jpg',
    'assets/images/pozadina2.jpg',
    'assets/images/pozadina3.jpg'
  ];
  
  // Current background index
  currentBackgroundIndex: number = 0;
  
  // Interval reference
  private backgroundInterval: any;
  
  // Subscription
  private userSubscription?: Subscription;

  // Check if user is logged in
  isLoggedIn: boolean = false;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    // Check authentication status
    this.checkAuthStatus();
    
    // Start background rotation
    this.startBackgroundRotation();
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
    
    // Unsubscribe
    if (this.userSubscription) {
      this.userSubscription.unsubscribe();
    }
  }

  checkAuthStatus(): void {
    // Proveri da li je korisnik ulogovan
    this.userSubscription = this.authService.user$.subscribe(user => {
      this.isLoggedIn = !!(user && user.id !== 0 && user.username !== "");
    });
  }

  startBackgroundRotation(): void {
    this.backgroundInterval = setInterval(() => {
      this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    }, 7000);
  }

  getCurrentBackground(): string {
    return this.backgroundImages[this.currentBackgroundIndex];
  }
}