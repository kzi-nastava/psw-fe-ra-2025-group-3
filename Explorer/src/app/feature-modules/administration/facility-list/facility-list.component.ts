import { Component, OnInit } from '@angular/core';
import { FacilityService } from '../facility.service';
import { Facility } from '../model/facility.model';

@Component({
  selector: 'app-facility-list',
  templateUrl: './facility-list.component.html',
  styleUrls: ['./facility-list.component.css']
})
export class FacilityListComponent implements OnInit {

  facilities: Facility[] = [];
  loading = true;

  constructor(private facilityService: FacilityService) {}

  ngOnInit(): void {
    this.loadFacilities();
  }

  loadFacilities(): void {
    this.facilityService.getAll().subscribe({
      next: (data) => {
        this.facilities = data;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
      }
    });
  }

  deleteFacility(id: number): void {
    if (!confirm('Da li sigurno želiš da obrišeš objekat?')) return;

    this.facilityService.delete(id).subscribe(() => {
      this.loadFacilities();
    });
  }
}
