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
    private pointMarkers: L.Marker[] = [];

    // select-route-points mod??? Tutor 2.5 1.
    @Input() mode: 'object-view' | 'route-view' | 'edit-object' | 'route-edit-object';
    @Input() center: [number, number] = [45.2396, 19.8227];
    @Input() zoom = 15;
    @Input() initialPoint?: { lat: number; lng: number };
    @Input() waypoints: { lat: number; lng: number }[] = [];
    @Input() points: { lat: number; lng: number; name?: string; color?: string }[] = [];

    @Output() pointSelected = new EventEmitter<{ lat: number; lng: number }>();
    @Output() routeDistanceChanged = new EventEmitter<number>();


    constructor(private mapService: MapService) {}

    private initMap(): void {
        const el = document.getElementById('map');
        if (!el) return;            // <--- ključno: nema container-a još
        this.map = L.map(el, {
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

        if (this.mode === 'object-view' || this.isEditMode) {
            this.loadAllPoints();
        }

        if (this.isRouteMode && this.waypoints && this.waypoints.length > 0) {
            this.setRoute();
        }

        this.setInitialPointMarker();
        this.registerOnClick();
    }

    get isEditMode(): boolean {
        return this.mode === 'edit-object' || this.mode === 'route-edit-object' || this.mode == 'object-view';
    }

    get isRouteMode(): boolean {
        return this.mode === 'route-view' || this.mode === 'route-edit-object';
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
        if (!this.map) return;   // ako mapa još nije spremna, ne radi ništa

        // skloni sve stare markere sa mape
        this.pointMarkers.forEach(m => this.map.removeLayer(m));
        this.pointMarkers = [];

        if (!this.points) return;

        this.points.forEach(p => {
            let markerIcon = undefined;
            if (p.color) {
                markerIcon = L.icon({
                    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${p.color}.png`,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
            }
            
            let marker = new L.Marker([p.lat, p.lng], markerIcon ? { icon: markerIcon } : {}).addTo(this.map);
            this.pointMarkers.push(marker);   // ČUVAMO REFERENCU NA MARKER

            if (p.name) {
                marker.bindPopup(p.name);
            } else {
                let address = '';
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
        });
    }
    

    setRoute(): void {
        if (!this.map) return;

        // Ako već postoji ruta – skloni stari kontroler sa mape
        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
            this.routeControl = undefined;
        }

        const wp = this.waypoints.map(p => L.latLng(p.lat, p.lng));

        // OVDE je ključ: koristimo this.routeControl, ne lokalnu promenljivu
        this.routeControl = L.Routing.control({
            waypoints: wp,
            router: (L as any).Routing.mapbox(environment.mapboxApiKey, { profile: 'mapbox/walking' }),
            addWaypoints: false,
        }).addTo(this.map);

        this.routeControl.on('routeselected', () => {
            const plan = (this.routeControl as any).getPlan?.();
            if (!plan) return;

            const markers = plan._markers || [];
            markers.forEach((m: L.Marker) => {
                let address = "";
                this.mapService.reverseSearch(m.getLatLng().lat, m.getLatLng().lng).subscribe((res) => {
                    address = res.address.road + ' ' + res.address.city;
                    console.log(res);
                    console.log(address);
                    (m as any).dragging && (m as any).dragging.disable();
                    m.bindPopup(address);
                });

                m.off('drag');
                m.off('dragstart');
                m.off('dragend');
            });
        });

        this.routeControl.on('routesfound', (e: any) => {
            const routes = e.routes;
            const summary = routes[0].summary;

            const distanceKm = Math.round(summary.totalDistance) / 1000;

            console.log(
                'Total distance is ' +
                distanceKm +
                ' km and total time is ' +
                Math.round((summary.totalTime % 3600) / 60) +
                ' minutes'
            );

            
            this.routeDistanceChanged.emit(distanceKm);
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

        // ✅ Route-view mod: SAMO pomeri marker
        if (this.isRouteMode) {
            if (this.clickMarker) {
                this.clickMarker.setLatLng([lat, lng]);
                this.pointSelected.emit({ lat, lng });
            }
            return;
        }

        // ✅ Object-view mod: SAMO pomeri marker
        if (this.mode === 'object-view') {
            if (this.clickMarker) {
                this.clickMarker.setLatLng([lat, lng]);
                this.pointSelected.emit({ lat, lng });
            }
            return;
        }

        // ✅ Edit mod: Standardna logika sa API pozivima
        if (this.mode === 'edit-object') {
            this.mapService.reverseSearch(lat, lng).subscribe({
                next: () => { },
                error: () => { }
            });

            if (this.clickMarker) {
                this.map.removeLayer(this.clickMarker);
                this.clickMarker = undefined;
            }

            this.clickMarker = L.marker([lat, lng], { draggable: true })
                .addTo(this.map)
                .openPopup();

            this.mapService.reverseSearch(lat, lng).subscribe({
                next: (res) => {
                    const address = res.address.road + ' ' + res.address.city;
                    if (this.clickMarker) {
                        this.clickMarker.bindPopup(address);
                    }
                },
                error: () => {
                    if (this.clickMarker) {
                        this.clickMarker.bindPopup(`${lat.toFixed(4)}, ${lng.toFixed(4)}`);
                    }
                }
            });

            this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                const marker = event.target as L.Marker;
                const pos = marker.getLatLng();
                this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
            });

            this.pointSelected.emit({ lat, lng });
        }
    });
}


    ngAfterViewInit(): void {
        let DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
        });

        L.Marker.prototype.options.icon = DefaultIcon;
        
        setTimeout(() => {
            this.initMap();
            if (this.map) {
                setTimeout(() => this.map.invalidateSize(), 0);
                setTimeout(() => this.map.invalidateSize(), 150);
            }
        }, 0);
    }
    ngOnChanges(changes: SimpleChanges): void {
    // Ako je promenjena početna tačka i mapa je već inicijalizovana – postavi marker
    if (changes['initialPoint'] && this.map && this.initialPoint) {
        this.setInitialPointMarker();
    }
    // Ako su se promenili waypoints nakon što je mapa već tu – ponovo iscrtaj rutu
    if (changes['waypoints'] && this.map && this.isRouteMode) {
        this.setRoute();
    }

    // markeri na mapi prate promenu points:
    if (changes['points'] && this.map) {
        this.loadAllPoints();
    }

}
} 