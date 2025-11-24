import { Component, AfterViewInit, Input, Output, EventEmitter } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from './map.service';


@Component({
    selector: 'xp-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
    private map: any;
    private clickMarker: L.Marker | undefined;
    private routeControl: L.Routing.Control | undefined;

    // select-route-points mod??? Tutor 2.5 1.
    @Input() mode: 'select-point' | 'route-view';
    @Input() center: [number, number] = [45.2396, 19.8227];
    @Input() zoom = 15;
    @Input() initialPoint?: { lat: number; lng: number };
    @Input() waypoints: { lat: number; lng: number }[] = [];

    @Output() pointSelected = new EventEmitter<{ lat: number; lng: number }>();


    constructor(private mapService: MapService) {}

    private initMap(): void {
        this.map = L.map('map', {
            center: this.center,
            zoom: this.zoom,
            attributionControl: false,
        });

        const tiles = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 22,
                minZoom: 3,
            }
        );
        tiles.addTo(this.map);

        if (this.mode !== 'route-view') {
            this.setInitialPointMarker();
            this.registerOnClick();
        }

        if (this.mode !== 'select-point' && this.waypoints && this.waypoints.length >= 2) {
            this.setRoute();
        }
    }

    private setInitialPointMarker(): void {
        if (!this.map || !this.initialPoint) return;

        if (this.clickMarker) {
            this.map.removeLayer(this.clickMarker);
        }

        this.clickMarker = L.marker([this.initialPoint.lat, this.initialPoint.lng], { draggable: true}).addTo(this.map);
        this.map.setView([this.initialPoint.lat, this.initialPoint.lng], this.zoom);
    }

    setRoute(): void {
        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
            this.routeControl = undefined;
        }

        const wp = this.waypoints.map(p => L.latLng(p.lat, p.lng));

        const routeControl = L.Routing.control({
            waypoints: wp,
            router: (L as any).Routing.osrmv1({
                serviceUrl: 'https://router.project-osrm.org/route/v1'
            }),
            addWaypoints: false,
            routeWhileDragging: false,            
        }).addTo(this.map);

        routeControl.on('routeselected', () => {
            const plan = (routeControl as any).getPlan?.();
            if (!plan) return;

            const markers = plan._markers || [];
            markers.forEach((m: L.Marker) => {
                m.off('drag');
                m.off('dragstart');
                m.off('dragend');
                (m as any).dragging && (m as any).dragging.disable();
            });
        });

        routeControl.on('routesfound', function(e: any) {
            const routes = e.routes;
            const summary = routes[0].summary;
            console.log(
                'Total distance is ' +
                Math.round(summary.totalDistance) / 1000 +
                ' km and total time is ' +
                Math.round((summary.totalTime % 3600) / 60) +
                ' minutes'
            );
        });
    }

    search(address: string): void {
        this.mapService.search(address).subscribe({
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
        this.map.on('click', (e: L.LeafletMouseEvent) => {
            const coord = e.latlng;
            const lat = coord.lat;
            const lng = coord.lng;

            this.mapService.reverseSearch(lat, lng).subscribe({
                next: () => { },
                error: () => { }
            });

            if (this.clickMarker) {
                this.map.removeLayer(this.clickMarker);
            }

            if (!this.clickMarker) {
                this.clickMarker = L.marker([lat, lng], { draggable: true }).addTo(this.map);

                this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                    const marker = event.target as L.Marker;
                    const pos = marker.getLatLng();
                    this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
                });
            } else {
                this.clickMarker.setLatLng([lat, lng]);
            }

            this.pointSelected.emit({ lat, lng });
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
