import { Component } from '@angular/core';

@Component({
  selector: 'xp-key-point-page',
  templateUrl: './key-point-page.component.html',
  styleUrls: ['./key-point-page.component.css']
})
export class KeyPointPageComponent {
  selectedPoint: { lat: number; lng: number } | null = null;

  // Za sada test podaci, kasnije će ovo doći sa back-a
  testPoints = [
    { lat: 45.2396, lng: 19.8227 },
    { lat: 45.247549, lng: 19.833369 },
    { lat: 45.246189, lng: 19.851093 }
  ];

  onPointSelected(point: { lat: number; lng: number }) {
    this.selectedPoint = point;
    console.log('Izabrana tačka:', point);
  }
}
