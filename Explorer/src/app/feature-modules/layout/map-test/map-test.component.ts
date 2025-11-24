import { Component } from '@angular/core';

@Component({
  selector: 'xp-map-test',
  templateUrl: './map-test.component.html',
  styleUrls: ['./map-test.component.css']
})
export class MapTestComponent {
    selectedPoint: { lat: number; lng: number } | null = null;

    testWaypoints = [
        { lat: 45.2396, lng: 19.8227 },
        { lat: 45.247549, lng: 19.833369 },
        { lat: 45.246189, lng: 19.851093 }
    ];

    onPointSelected(point: { lat: number; lng: number }) {
        this.selectedPoint = point;
        console.log('Izabrana tačka:', point);
    }
}
