import { Component, OnInit } from '@angular/core';
import { KeyPointService } from '../key-point.service';
import { KeyPoint } from '../model/key-point.model';
import { ViewChild } from '@angular/core';
import { KeyPointFormComponent } from '../key-point-form/key-point-form.component';

@Component({
  selector: 'xp-key-point-page',
  templateUrl: './key-point-page.component.html',
  styleUrls: ['./key-point-page.component.css']
})
export class KeyPointPageComponent implements OnInit {

   @ViewChild(KeyPointFormComponent)
  keyPointFormComponent!: KeyPointFormComponent;
  
  selectedPoint: { lat: number; lng: number } | null = null;

  // Za mapu – samo koordinate
  testPoints: { lat: number; lng: number }[] = [];

  // Za listu – puni key point objekti
  keyPoints: KeyPoint[] = [];

  currentTourId: number = 1;  // za kasnije, trenutno ne koristimo

  constructor(private keyPointService: KeyPointService) { }

  ngOnInit(): void {
    this.loadKeyPoints();
  }

  private loadKeyPoints(): void {
    this.keyPointService.getAll().subscribe({
      next: (response) => {
        console.log('Key points response:', response);
        this.keyPoints = response.results;

        this.testPoints = this.keyPoints.map(kp => ({
          lat: kp.latitude,
          lng: kp.longitude
        }));
      },
      error: (err: any) => {
        console.error('Greška pri učitavanju key point-ova:', err);
        this.keyPoints = [];
        this.testPoints = [];
      }
    });
  }

  onPointSelected(point: { lat: number; lng: number }) {
    this.selectedPoint = point;
    console.log('Izabrana tačka:', point);
  }

  onKeyPointSave(formData: any) {
  if (!this.selectedPoint) {
    console.error('Nije izabrana lokacija na mapi, ne mogu da sačuvam key point.');
    return;
  }

  const newKeyPoint: KeyPoint = {
    tourId: this.currentTourId,
    name: formData.name,
    description: formData.description,
    imageUrl: formData.imageUrl,
    secret: formData.secret,
    latitude: this.selectedPoint.lat,
    longitude: this.selectedPoint.lng
  };

  this.keyPointService.create(newKeyPoint).subscribe({
    next: (saved: KeyPoint) => {
      console.log('Key point sačuvan:', saved);

      this.loadKeyPoints();

      // 🔥 RESET FORME POSLE SNIMANJA
      this.keyPointFormComponent.resetForm();
      this.selectedPoint = null;    // ako želiš da marker nestane
    },
    error: (err: any) => {
      console.error('Greška pri čuvanju key point-a:', err);
    }
  });
}

  onKeyPointCancel() {
    console.log('Otkazano dodavanje / izmena.');
  }
}
