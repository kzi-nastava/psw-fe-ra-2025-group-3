import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from './map.service';
import { environment } from 'src/env/environment';


@Component({
    selector: 'xp-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges {
    private map: any;
    private clickMarker: L.Marker | undefined;
    private routeControl: L.Routing.Control | undefined;

    // select-route-points mod??? Tutor 2.5 1.
    @Input() mode: 'object-view' | 'route-view' | 'edit-object';
    @Input() center: [number, number] = [45.2396, 19.8227];
    @Input() zoom = 15;
    @Input() initialPoint?: { lat: number; lng: number };
    @Input() waypoints: { lat: number; lng: number }[] = [];
    @Input() points: { lat: number; lng: number; name?: string }[] = [];

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

        if (this.mode === 'object-view' || this.mode === 'edit-object') 
            this.loadAllPoints();

        if (this.mode === 'route-view') 
            this.setRoute();

        this.setInitialPointMarker();
        this.registerOnClick();
    }

    private setInitialPointMarker(): void {
        if (!this.map || !this.initialPoint) return;

        if (this.clickMarker) {
            this.map.removeLayer(this.clickMarker);
        }

        this.clickMarker = L.marker([this.initialPoint.lat, this.initialPoint.lng], { draggable: true}).addTo(this.map);

        this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
            const marker = event.target as L.Marker;
            const pos = marker.getLatLng();
            this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
        })

        this.map.setView([this.initialPoint.lat, this.initialPoint.lng], this.zoom);
    }

    private loadAllPoints(): void {
        this.points.forEach(p => {            
            var marker = new L.Marker([p.lat, p.lng]).addTo(this.map);
            if (p.name) {
            marker.bindPopup(p.name);
            } else {
            var address = '';
            this.mapService.reverseSearch(p.lat, p.lng).subscribe((res) => {
                address = res.address.road + ' ' + res.address.city;
                marker.bindPopup(address);

                
                });
            }
            if (this.mode === 'edit-object') {
                marker.dragging?.enable();
                marker.on('dragend', (event: L.LeafletEvent) => {
                    marker = event.target as L.Marker;
                    const pos = marker.getLatLng();
                    this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
                });

                this.clickMarker = marker;
            }
        })
    }
    

    setRoute(): void {
        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
            this.routeControl = undefined;
        }

        const wp = this.waypoints.map(p => L.latLng(p.lat, p.lng));

        const routeControl = L.Routing.control({
            waypoints: wp,
            router: (L as any).Routing.mapbox(environment.mapboxApiKey, {profile: 'mapbox/walking'}),
            addWaypoints: false,           
        }).addTo(this.map);

        routeControl.on('routeselected', () => {
            const plan = (routeControl as any).getPlan?.();
            if (!plan) return;

            const markers = plan._markers || [];
            markers.forEach((m: L.Marker) => {
                var address = "";
                this.mapService.reverseSearch(m.getLatLng().lat, m.getLatLng().lng).subscribe((res) => {
                    address = res.address.road + ' ' + res.address.city;
                    console.log(res);
                    console.log(address);
                    (m as any).dragging && (m as any).dragging.disable();
                    m.bindPopup(address);
                })

                m.off('drag');
                m.off('dragstart');
                m.off('dragend');
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

            if (this.mode === 'edit-object' && this.clickMarker) {
                this.map.removeLayer(this.clickMarker);
                this.clickMarker = undefined;
            }

            if (!this.clickMarker) {
                this.clickMarker = L.marker([lat, lng], { draggable: true }).addTo(this.map)                
                .openPopup();

                var address
                this.mapService.reverseSearch(lat, lng).subscribe((res) => {
                    address = res.address.road + ' ' + res.address.city;
                    this.clickMarker?.bindPopup(address);
                })

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
    ngOnChanges(changes: SimpleChanges): void {
    // Ako je promenjena početna tačka i mapa je već inicijalizovana – postavi marker
    if (changes['initialPoint'] && this.map && this.initialPoint) {
        this.setInitialPointMarker();
    }
}
}
