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
    if (!confirm('Are you sure you want to delete this facility?')) return;

    this.facilityService.delete(id).subscribe(() => {
      this.loadFacilities();
    });
  }

  getCategoryLabel(category: number): string {
    switch (category) {
      case 0: return 'WC';
      case 1: return 'Restaurant';
      case 2: return 'Parking';
      case 3: return 'Other';
      default: return 'Unknown';
    }
  }
}
