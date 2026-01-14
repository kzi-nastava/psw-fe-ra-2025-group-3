import { Component, OnInit } from '@angular/core';
import { Monument } from '../../administration/model/monument.model';
import { Facility } from '../../administration/model/facility.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TouristMapService, TouristPositionDto } from './tourist-map.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'xp-tourist-map',
  templateUrl: './tourist-map.component.html',
  styleUrls: ['./tourist-map.component.css']
})
export class TouristMapComponent implements OnInit {

  isLoading = false;
  monuments: Monument[] = [];
  facilities: Facility[] = [];
  points: { lat: number; lng: number; name?: string }[] = [];
  selectedPoint: { lat: number; lng: number; name?: string } | null = null;
  initialPoint: { lat: number; lng: number } | undefined;

  constructor(private touristMapService: TouristMapService, 
  private snackBar: MatSnackBar 
  ) {}

  ngOnInit(): void {
    this.loadMonuments();
    this.loadMyPosition();
  }

  private loadMyPosition(): void {
  this.touristMapService.getMyPosition().subscribe({
    next: (pos: TouristPositionDto | null) => {
      if (!pos) {
        this.initialPoint = {
            lat: 0,
            lng: 0
        };
        this.selectedPoint = {
            lat: 0,
            lng: 0,
        };
      }
      else {
        this.initialPoint = {
                lat: pos.latitude,
                lng: pos.longitude
            };

            
        this.selectedPoint = { lat: pos.latitude, lng: pos.longitude };
      }
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

        this.loadFacilities();
      },
      error: () => {
        this.isLoading = false;
      }
    });
  }

  private loadFacilities(): void {
  this.touristMapService.getFacilities().subscribe({
    next: (result: Facility[]) => {
      console.log('raw facilities result:', result);

      this.facilities = result || [];

      const facilityPoints = this.facilities
        .filter(f => f.latitude != null && f.longitude != null)
        .map(f => ({
          lat: f.latitude,
          lng: f.longitude,
          name: f.name
        }));

      this.points = [...this.points, ...facilityPoints];

      console.log('this.points', this.points);
      this.isLoading = false;
    },
    error: (err) => {
      console.error('Failed to load facilities', err);
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
           this.snackBar.open('✅ Position saved!', 'Close', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'bottom',
          panelClass: ['success-snackbar']
        });

      },
      error: (err) => {
        console.error('Failed to update position', err);
      }
    });
  }
}
