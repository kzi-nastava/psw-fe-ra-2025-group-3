import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';

@Component({
  selector: 'xp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
    private map: any;

    constructor() {}

    private initMap(): void {
        this.map = L.map('map', {
            center: [45.2396, 19.8227],
            zoom: 15,
            attributionControl: false,
        });

        const tiles = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 19,
                minZoom: 3,
            }
        );
        tiles.addTo(this.map);
    }

    ngAfterViewInit(): void {
        this.initMap();
    }
}
