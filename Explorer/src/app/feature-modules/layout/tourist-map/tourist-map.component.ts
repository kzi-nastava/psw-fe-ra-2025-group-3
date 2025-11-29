import { Component, OnInit } from '@angular/core';
import { Monument } from '../../administration/model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { TouristMapService } from './tourist-map.service';

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

  constructor(private touristMapService: TouristMapService) {}

  ngOnInit(): void {
    this.loadMonuments();
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
}
