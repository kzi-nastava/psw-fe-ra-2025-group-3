import { Component, OnInit, ViewChild } from '@angular/core';
import { KeyPointService } from '../key-point.service';
import { KeyPoint } from '../model/key-point.model';
import { KeyPointFormComponent } from '../key-point-form/key-point-form.component';
import { TourService } from '../../tour.service';

@Component({
  selector: 'xp-key-point-page',
  templateUrl: './key-point-page.component.html',
  styleUrls: ['./key-point-page.component.css']
})
export class KeyPointPageComponent implements OnInit {

  @ViewChild(KeyPointFormComponent)
  keyPointFormComponent!: KeyPointFormComponent;
  
  // Location selected on the map (for new or edited key point)
  selectedPoint: { lat: number; lng: number } | null = null;

  // Currently selected key point from the list (for edit)
  selectedKeyPoint: KeyPoint | null = null;

  // For map – coordinates for the route
  routeWayPoints: { lat: number; lng: number }[] = [];

  // For map – markers with name
  routePoints: { lat: number; lng: number; name?: string }[] = [];

  // For list – full key point objects
  keyPoints: KeyPoint[] = [];

  // TODO: kasnije ovo veži za pravu turu (iz rute ili slično)
  currentTourId: number = 1;

  constructor(
    private keyPointService: KeyPointService,
    private tourService: TourService
  ) { }

  ngOnInit(): void {
    this.loadKeyPoints();
  }

  private loadKeyPoints(): void {
    this.keyPointService.getAll(this.currentTourId).subscribe({
      next: (response) => {
        console.log('Key points response:', response);
        this.keyPoints = response.results.sort((a, b) => a.id - b.id);

        this.routeWayPoints = this.keyPoints.map(kp => ({
          lat: kp.latitude,
          lng: kp.longitude
        }));
        console.log('🔵 loadKeyPoints routeWayPoints:', this.routeWayPoints);

        this.routePoints = this.keyPoints.map(kp => ({
          lat: kp.latitude,
          lng: kp.longitude,
          name: kp.name
        }));
      },
      error: (err: any) => {
        console.error('Error while loading key points:', err);
        this.keyPoints = [];
        this.routeWayPoints = [];
        this.routePoints = [];
      }
    });
  }

  // Click on map (either new KP, or moving existing location)
  onPointSelected(point: { lat: number; lng: number }) {
    this.selectedPoint = point;
    console.log('Selected point:', point);
  }

  // "Add key point" button – enter CREATE mode
  onAddNewKeyPoint(): void {
    this.selectedKeyPoint = null;
    this.selectedPoint = null;
    this.keyPointFormComponent.resetForm();
  }

  // Click on list item – enter EDIT mode
  onKeyPointSelectedFromList(kp: KeyPoint): void {
    this.selectedKeyPoint = kp;
    this.selectedPoint = {
      lat: kp.latitude,
      lng: kp.longitude
    };

    console.log('Key point selected for edit:', kp);
  }

  // DELETE from list – triggered by trash icon
  onKeyPointDelete(kp: KeyPoint): void {
    if (!kp.id) {
      console.error('Cannot delete key point without id.');
      return;
    }

    const confirmed = window.confirm(
      `Are you sure you want to delete key point "${kp.name}"?`
    );

    if (!confirmed) {
      return;
    }

    this.keyPointService.delete(kp.id).subscribe({
      next: () => {
        console.log('Key point deleted:', kp);

        // Remove from local array
        this.keyPoints = this.keyPoints.filter(k => k.id !== kp.id);

        // Rebuild route data for the map
        this.routeWayPoints = this.keyPoints.map(point => ({
          lat: point.latitude,
          lng: point.longitude
        }));

        this.routePoints = this.keyPoints.map(point => ({
          lat: point.latitude,
          lng: point.longitude,
          name: point.name
        }));

        // If deleted point was currently selected – clear selection + form
        if (this.selectedKeyPoint && this.selectedKeyPoint.id === kp.id) {
          this.selectedKeyPoint = null;
          this.selectedPoint = null;
          this.keyPointFormComponent.resetForm();
        }
      },
      error: (err: any) => {
        console.error('Error while deleting key point:', err);
      }
    });
  }

  // Save from form – CREATE or UPDATE depending on selectedKeyPoint
  onKeyPointSave(formData: any) {
    if (!this.selectedPoint) {
      console.error('No map location selected – cannot save key point.');
      return;
    }

    // Shared data from form + location
    const baseKeyPoint: Omit<KeyPoint, 'id'> = {
      tourId: this.currentTourId,
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      secret: formData.secret,
      latitude: this.selectedPoint.lat,
      longitude: this.selectedPoint.lng
    };

    // EDIT mode – UPDATE existing key point
    if (this.selectedKeyPoint && this.selectedKeyPoint.id != null) {
      const updatedKeyPoint: KeyPoint = {
        ...this.selectedKeyPoint,
        ...baseKeyPoint
      };

      this.keyPointService.update(updatedKeyPoint).subscribe({
        next: (saved: KeyPoint) => {
          console.log('Key point updated:', saved);
          this.loadKeyPoints();

          this.keyPointFormComponent.resetForm();
          this.selectedPoint = null;
          this.selectedKeyPoint = null;
        },
        error: (err: any) => {
          console.error('Error while updating key point:', err);
        }
      });

      return;
    }

    // CREATE mode – new key point
    this.keyPointService.create(baseKeyPoint).subscribe({
      next: (saved: KeyPoint) => {
        console.log('Key point saved:', saved);
        this.loadKeyPoints();

        this.keyPointFormComponent.resetForm();
        this.selectedPoint = null;
        this.selectedKeyPoint = null;
      },
      error: (err: any) => {
        console.error('Error while saving key point:', err);
      }
    });
  }

  onKeyPointCancel() {
    console.log('Key point create/edit cancelled.');
    this.selectedKeyPoint = null;
    this.selectedPoint = null;
    this.keyPointFormComponent.resetForm();
  }

  onRouteDistanceChanged(distanceKm: number) {
    this.tourService.updateDistance(this.currentTourId, distanceKm).subscribe();
  }
}
