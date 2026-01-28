import { Component, OnInit, OnChanges, SimpleChanges, ViewChild, Input } from '@angular/core';
import { KeyPointService } from '../key-point.service';
import { KeyPoint } from '../model/key-point.model';
import { KeyPointFormComponent } from '../key-point-form/key-point-form.component';
import { TourService } from '../../tour.service';

@Component({
  selector: 'xp-key-point-page',
  templateUrl: './key-point-page.component.html',
  styleUrls: ['./key-point-page.component.css']
})
export class KeyPointPageComponent implements OnInit, OnChanges {

  @ViewChild(KeyPointFormComponent) keyPointFormComponent!: KeyPointFormComponent;
  
  selectedPoint: { lat: number; lng: number } | null = null;
  selectedKeyPoint: KeyPoint | null = null;

  routeWayPoints: { lat: number; lng: number }[] = [];
  routePoints: { lat: number; lng: number; name?: string }[] = [];

  keyPoints: KeyPoint[] = [];

  @Input() currentTourId!: number;

  constructor(
    private keyPointService: KeyPointService,
    private tourService: TourService
  ) { }

  ngOnInit(): void {
    if (this.currentTourId) this.loadKeyPoints();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['currentTourId'] && this.currentTourId) {
      this.loadKeyPoints();
    }
  }

  private loadKeyPoints(): void {
    this.keyPointService.getAll(this.currentTourId).subscribe({
      next: (response) => {
        const results = (Array.isArray(response) ? response : response.results || []);
        this.keyPoints = results.sort((a: any, b: any) => a.id - b.id);
        this.updateMapData();
      },
      error: () => {
        this.keyPoints = [];
        this.updateMapData();
      }
    });
  }

  private updateMapData(): void {
    this.routeWayPoints = this.keyPoints.map(kp => ({ lat: kp.latitude, lng: kp.longitude }));
    this.routePoints = this.keyPoints.map(kp => ({ lat: kp.latitude, lng: kp.longitude, name: kp.name }));
  }


  onPointSelected(point: { lat: number; lng: number }) {
    this.selectedPoint = point;
    console.log("Point selected:", point);
  }

  onAddNewKeyPoint(): void {
    this.selectedKeyPoint = null;
    this.selectedPoint = null;
    this.keyPointFormComponent?.resetForm();
  }

  onKeyPointSelectedFromList(kp: KeyPoint): void {
    this.selectedKeyPoint = kp;
    this.selectedPoint = { lat: kp.latitude, lng: kp.longitude };
  }

  onKeyPointSave(formData: any) {
    if (!this.selectedPoint) {
      alert("Please click on the map to set the location!");
      return;
    }

    const baseKeyPoint = {
      tourId: this.currentTourId,
      name: formData.name,
      description: formData.description,
      imageUrl: formData.imageUrl,
      secret: formData.secret,
      latitude: this.selectedPoint.lat,
      longitude: this.selectedPoint.lng
    };

    if (this.selectedKeyPoint && this.selectedKeyPoint.id) {
      const updated = { ...this.selectedKeyPoint, ...baseKeyPoint };
      this.keyPointService.update(updated).subscribe({
        next: () => { this.loadKeyPoints(); this.onAddNewKeyPoint(); },
        error: (err) => console.error(err)
      });
    } 
    else {
      const createRequest = {
        keyPoint: baseKeyPoint,
        encounter: formData.encounter ?? null
      };
      this.keyPointService.create(createRequest as any).subscribe({
        next: () => { this.loadKeyPoints(); this.onAddNewKeyPoint(); },
        error: (err) => console.error(err)
      });
    }
  }

  onKeyPointDelete(kp: KeyPoint): void {
    if (!kp.id || !confirm(`Delete "${kp.name}"?`)) return;
    this.keyPointService.delete(kp.id).subscribe({
      next: () => {
        this.keyPoints = this.keyPoints.filter(k => k.id !== kp.id);
        this.updateMapData();
        if (this.selectedKeyPoint?.id === kp.id) this.onAddNewKeyPoint();
      }
    });
  }

  onKeyPointCancel() {
    this.onAddNewKeyPoint();
  }

  onRouteDistanceChanged(distanceKm: number) {
    if (this.currentTourId) {
       this.tourService.updateDistance(this.currentTourId, distanceKm).subscribe();
    }
  }
}