import { Component, OnInit } from '@angular/core';
import { Monument } from '../../administration/model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TouristMapService, TouristPositionDto } from './tourist-map.service';

@Component({
  selector: 'xp-tourist-map',
  templateUrl: './tourist-map.component.html',
  styleUrls: ['./tourist-map.component.css']
})
export class TouristMapComponent implements OnInit {

  isLoading = false;
  monuments: Monument[] = [];
  points: { lat: number; lng: number; name?: string }[] = [];
  selectedPoint: { lat: number; lng: number; name?: string } | null = null;
  initialPoint: { lat: number; lng: number } | undefined;

  constructor(private touristMapService: TouristMapService) {}

  ngOnInit(): void {
    this.loadMonuments();
    this.loadMyPosition();
  }

  private loadMyPosition(): void {
  this.touristMapService.getMyPosition().subscribe({
    next: (pos: TouristPositionDto | null) => {
      if (!pos) {
        return;
      }

      this.initialPoint = {
        lat: pos.latitude,
        lng: pos.longitude
      };

      
      this.selectedPoint = { lat: pos.latitude, lng: pos.longitude };
    },
    error: (err) => {
      console.error('Failed to load my position', err);
    }
  });
}

  private loadMonuments(): void {
    this.isLoading = true;

    this.touristMapService.getMonuments().subscribe({
      next: (result: PagedResults<Monument>) => {
        this.monuments = result.results || [];

        this.points = this.monuments
          .filter(m => m.latitude != null && m.longitude != null)
          .map(m => ({
            lat: m.latitude,
            lng: m.longitude,
            name: m.name
          }));

        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  onPointSelected(point: { lat: number; lng: number }): void {
    this.selectedPoint = point;
    console.log('Selected point on tourist map:', point);
  }

  saveChanges(): void {
    if (!this.selectedPoint) {
      return;
    }

    const dto: TouristPositionDto = {
      touristId: 0, // backend uzima pravi ID iz tokena
      latitude: this.selectedPoint.lat,
      longitude: this.selectedPoint.lng
    };

    this.touristMapService.updateMyPosition(dto).subscribe({
      next: () => {
        console.log('Position updated', dto);
      },
      error: (err) => {
        console.error('Failed to update position', err);
      }
    });
  }
}
