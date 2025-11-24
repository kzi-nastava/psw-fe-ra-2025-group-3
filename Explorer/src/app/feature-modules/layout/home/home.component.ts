import { Component, OnInit, OnDestroy } from '@angular/core';

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

  ngOnInit(): void {
    // Start background rotation every 10 seconds
    this.startBackgroundRotation();
  }

  ngOnDestroy(): void {
    // Clean up interval when component is destroyed
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  }

  startBackgroundRotation(): void {
    this.backgroundInterval = setInterval(() => {
      this.currentBackgroundIndex = (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    }, 7000); // 7 seconds
  }

  getCurrentBackground(): string {
    return this.backgroundImages[this.currentBackgroundIndex];
  }
}