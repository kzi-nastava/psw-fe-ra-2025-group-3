import { Component, AfterViewInit, Input, Output, EventEmitter, OnChanges, SimpleChanges } from '@angular/core';
import * as L from 'leaflet';
import 'leaflet-routing-machine';
import { MapService } from './map.service';
import { environment } from 'src/env/environment';
import { ElementRef } from '@angular/core';
import { OnDestroy } from '@angular/core';

@Component({
    selector: 'xp-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit, OnChanges, OnDestroy {
    private map: any;
    private clickMarker: L.Marker | undefined;
    private routeControl: L.Routing.Control | undefined;
    private pointMarkers: L.Marker[] = [];

    @Input() mode: 'object-view' | 'route-view' | 'edit-object' | 'route-edit-object';
    @Input() center: [number, number] = [45.2396, 19.8227];
    @Input() zoom = 15;
    @Input() initialPoint?: { lat: number; lng: number; iconUrl?: string };
    @Input() waypoints: { lat: number; lng: number; iconUrl?: string }[] = [];
    @Input() points: { lat: number; lng: number; name?: string; color?: string; iconUrl?: string; id?: number }[] = [];

    @Output() pointSelected = new EventEmitter<{ lat: number; lng: number }>();
    @Output() routeDistanceChanged = new EventEmitter<number>();
    @Output() zoomChanged = new EventEmitter<number>();
    @Output() markerClicked = new EventEmitter<number>();

    constructor(private mapService: MapService, private host: ElementRef) {}

    private initMap(): void {
        const el = this.host.nativeElement.querySelector('#map') as HTMLElement | null;
        if (!el) return;
        
        this.map = L.map(el, {
            center: this.center,
            zoom: this.zoom,
            attributionControl: false,
        });

        // Listen to zoom changes
        this.map.on('zoomend', () => {
            const currentZoom = this.map.getZoom();
            this.zoomChanged.emit(currentZoom);
        });

        const tiles = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 22,
                minZoom: 3,
            }
        );
        tiles.addTo(this.map);

        this.loadAllPoints();

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

        // Use default icon with proper anchor
        const defaultIcon = L.icon({
            iconUrl: this.initialPoint.iconUrl ?? 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        if (this.isRouteMode) {
            
            if (this.pointMarkers && this.pointMarkers.length > 0) {
                // Ako clickMarker nije pointMarkers[0], ukloni ga i koristi pointMarkers[0]
                if (this.clickMarker && this.clickMarker !== this.pointMarkers[0]) {
                    this.map.removeLayer(this.clickMarker);
                }
                this.clickMarker = this.pointMarkers[0];
                // Ažuriraj poziciju
                this.clickMarker.setLatLng([this.initialPoint.lat, this.initialPoint.lng]);
            } else {
                // Ako nema pointMarkers[0], ukloni stari clickMarker i kreiraj novi
                if (this.clickMarker) {
                    this.map.removeLayer(this.clickMarker);
                }
                this.clickMarker = L.marker(
                    [this.initialPoint.lat, this.initialPoint.lng],
                    {
                        draggable: true,
                        icon: defaultIcon,
                        autoPan: false,
                    }
                ).addTo(this.map);
            }
            
          
            this.clickMarker.off('dragend');
            this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                const marker = event.target as L.Marker;
                const pos = marker.getLatLng();
                this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
            });

            this.clickMarker.setZIndexOffset(1000);
        } else {
          
            if (this.clickMarker) {
                this.map.removeLayer(this.clickMarker);
            }
            this.clickMarker = L.marker(
                        [this.initialPoint.lat, this.initialPoint.lng],
                        {
                            draggable: true,
                            icon: defaultIcon,
                            autoPan: false,
                        },
                    ).addTo(this.map);
            this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                const marker = event.target as L.Marker;
                const pos = marker.getLatLng();
                this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
            });
            this.clickMarker.setZIndexOffset(1000);
        }
        // Ako je route mode ALI nema pointMarkers, NE kreiraj marker ovde
        // Marker će se kreirati u registerOnClick() kada korisnik klikne
    }

    private loadAllPoints(): void {
        if (!this.map) return;

        // clickMarker se uklanja samo u setInitialPointMarker() kada se pozove
       this.pointMarkers.forEach(m => this.map.removeLayer(m));
        this.pointMarkers = [];

        if (!this.points) return;

        this.points.forEach(p => {
            let markerIcon = undefined;
            if (p.iconUrl) {
                markerIcon = L.icon({
                    iconUrl: p.iconUrl,
                    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                    iconSize: [41, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });
            }
           
            let marker = new L.Marker([p.lat, p.lng], markerIcon ? { icon: markerIcon } : {}).addTo(this.map);
            this.pointMarkers.push(marker);

            if (p.id !== undefined) {
                marker.on('click', () => {
                    this.markerClicked.emit(p.id!);
                });
            }

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

        if (this.routeControl) {
            this.map.removeControl(this.routeControl);
            this.routeControl = undefined;
        }

        const wp = this.waypoints.map(p => L.latLng(p.lat, p.lng));

        this.routeControl = L.Routing.control({
            waypoints: wp,
            router: (L as any).Routing.mapbox(environment.mapboxApiKey, { profile: 'mapbox/walking' }),
            addWaypoints: false,
            show: false,
        }).addTo(this.map);

        this.routeControl.on('routeselected', () => {
            const plan = (this.routeControl as any).getPlan?.();
            if (!plan) return;

            const markers = plan._markers || [];
            markers.forEach((m: L.Marker) => {
                let address = "";
                this.mapService.reverseSearch(m.getLatLng().lat, m.getLatLng().lng).subscribe((res) => {
                    address = res.address.road + ' ' + res.address.city;
                    (m as any).dragging && (m as any).dragging.disable();
                    m.bindPopup(address);
                });

                let icon;
                if (m == markers[0]) {
                    icon = L.icon({
                        iconUrl: 'assets/icons/tourist.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [41, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                } else {
                    icon = L.icon({
                        iconUrl: 'assets/icons/checkpoint.png',
                        shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
                        iconSize: [41, 41],
                        iconAnchor: [12, 41],
                        popupAnchor: [1, -34],
                        shadowSize: [41, 41]
                    });
                }

                m.setIcon(icon);

                m.off('drag');
                m.off('dragstart');
                m.off('dragend');
            });
        });

        this.routeControl.on('routesfound', (e: any) => {
            const routes = e.routes;
            const summary = routes[0].summary;

            const distanceKm = Math.round(summary.totalDistance) / 1000;

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

        // Route mode
        if (this.isRouteMode) {
            if (!this.clickMarker) {
                const defaultIcon = L.icon({
                    iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                    shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                    iconSize: [25, 41],
                    iconAnchor: [12, 41],
                    popupAnchor: [1, -34],
                    shadowSize: [41, 41]
                });

                this.clickMarker = L.marker([lat, lng], {
                    draggable: true,
                    icon: defaultIcon
                }).addTo(this.map);
               
                this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                    const marker = event.target as L.Marker;
                    const pos = marker.getLatLng();
                    this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
                });

                this.clickMarker.setZIndexOffset(1000);
            } else {
                this.clickMarker.setLatLng([lat, lng]);
            }
            
            this.pointSelected.emit({ lat, lng });
            
            this.mapService.reverseSearch(lat, lng).subscribe({
                next: (res) => {
                    const address = res.address.road ? `${res.address.road}, ${res.address.city}` : 'Selected Location';
                    if (this.clickMarker) {
                        this.clickMarker.bindPopup(address).openPopup();
                    }
                },
                error: () => {
                    if (this.clickMarker) this.clickMarker.bindPopup("Selected Point").openPopup();
                }
            });
            
            return;
        }

        // Object-view mode
        if (this.mode === 'object-view') {
            if (this.clickMarker) {
                this.clickMarker.setLatLng([lat, lng]);
                this.pointSelected.emit({ lat, lng });
            }
            return;
        }

        // Edit-object mode
        if (this.mode === 'edit-object') {
            const defaultIcon = L.icon({
                iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
                shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            if (this.clickMarker) {
                this.clickMarker.setLatLng([lat, lng]);
            } else {
                this.clickMarker = L.marker([lat, lng], {
                    draggable: true,
                    icon: defaultIcon
                }).addTo(this.map);
               
                this.clickMarker.on('dragend', (event: L.LeafletEvent) => {
                    const marker = event.target as L.Marker;
                    const pos = marker.getLatLng();
                    this.pointSelected.emit({ lat: pos.lat, lng: pos.lng });
                });
            }

            this.pointSelected.emit({ lat, lng });

            this.mapService.reverseSearch(lat, lng).subscribe({
                next: (res) => {
                    const address = res.address.road ? `${res.address.road}, ${res.address.city}` : 'Selected Location';
                    if (this.clickMarker) {
                        this.clickMarker.bindPopup(address).openPopup();
                    }
                },
                error: () => {
                    if (this.clickMarker) this.clickMarker.bindPopup("Selected Point").openPopup();
                }
            });
        }
    });
}

    ngAfterViewInit(): void {
        let DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png',
            shadowUrl: 'https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png',
            iconSize: [25, 41],
            iconAnchor: [12, 41],
            popupAnchor: [1, -34],
            shadowSize: [41, 41]
        });

        L.Marker.prototype.options.icon = DefaultIcon;
       
        setTimeout(() => {
            this.initMap();
            if (this.map) {
                setTimeout(() => {
                    if (this.map) {
                        this.map.invalidateSize();
                    }
                }, 0);
                setTimeout(() => {
                    if (this.map) {
                        this.map.invalidateSize();
                    }
                }, 150);
            }
        }, 0);
    }

    ngOnChanges(changes: SimpleChanges): void {
        if (changes['initialPoint'] && this.map && this.initialPoint) {
            this.setInitialPointMarker();
        }
        if (changes['waypoints'] && this.map && this.isRouteMode) {
            this.setRoute();
        }

        if (changes['points'] && this.map) {
            this.loadAllPoints();
        }
    }

    ngOnDestroy(): void {
        this.map?.remove();
        this.map = undefined;
    }
}