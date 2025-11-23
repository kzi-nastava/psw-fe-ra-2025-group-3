import { Component, AfterViewInit } from '@angular/core';
import * as L from 'leaflet';
import { MapService } from './map.service';


@Component({
  selector: 'xp-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
    private map: any;

    constructor(private mapService: MapService) {}

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

        this.registerOnClick();
        this.search();
        this.setRoute();
    }

    setRoute(): void {
        const routeControl = L.Routing.control({
            waypoints: [
                L.latLng(45.2396, 19.8227),
                L.latLng(45.247549, 19.833369),
                L.latLng(45.246189, 19.851093)
            ],
            router: L.Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            })
        }).addTo(this.map);

        routeControl.on('routesfound', function(e) {
            const routes = e.routes;
            const summary = routes[0].summary;
            alert(
                'Total distance is ' +
                summary.totalDistance / 1000 +
                ' km and total time is ' +
                Math.round((summary.totalTime % 3600) / 60) +
                ' minutes'
            );
        });
    }

    search(): void {
        this.mapService.search('Strazilovska 19, Novi Sad').subscribe({
            next: (result) => {
                L.marker([result[0].lat, result[0].lon])
                .addTo(this.map)
                .bindPopup('Pozdrav iz Strazilovske 19.')
                .openPopup();
            },
            error: () => {},
        });
    }

    registerOnClick(): void {
        this.map.on('click', (e: any) => {
            const coord = e.latlng;
            const lat = coord.lat;
            const lng = coord.lng;
            this.mapService.reverseSearch(lat, lng).subscribe((res) => {
                
            });
            const mp = new L.Marker([lat, lng]).addTo(this.map);
            alert(mp.getLatLng());
        });
    }

    ngAfterViewInit(): void {
        let DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
        });

        L.Marker.prototype.options.icon = DefaultIcon;
        
        this.initMap();
    }
}
