import { Component, OnInit, OnDestroy } from '@angular/core';

@Component({
  selector: 'app-demo-page',
  templateUrl: './demo-page.component.html',
  styleUrls: ['./demo-page.component.css']
})
export class DemoPageComponent implements OnInit, OnDestroy {

  backgroundImages: string[] = [
    'assets/images/pozadina.jpg',
    'assets/images/pozadina2.jpg',
    'assets/images/pozadina3.jpg'
  ];

  currentBackgroundIndex: number = 0;
  private backgroundInterval: any;

  ngOnInit(): void {
    this.backgroundInterval = setInterval(() => {
      this.currentBackgroundIndex =
        (this.currentBackgroundIndex + 1) % this.backgroundImages.length;
    }, 7000);
  }

  ngOnDestroy(): void {
    if (this.backgroundInterval) {
      clearInterval(this.backgroundInterval);
    }
  }
}
