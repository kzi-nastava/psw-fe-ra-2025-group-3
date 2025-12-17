import { Component, OnInit } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { FacilityService } from '../facility.service';
import { Facility } from '../model/facility.model';

@Component({
  selector: 'app-facility-edit',
  templateUrl: './facility-edit.component.html',
  styleUrls: ['./facility-edit.component.css']
})
export class FacilityEditComponent implements OnInit {

  id!: number;
  isEditMode = false;

  // da znamo kad da prikažemo xp-map
  dataLoaded = false;

  // marker(i) na mapi
  mapPoints: { lat: number; lng: number }[] = [];

  form = this.fb.group({
    name: ['', Validators.required],
    latitude: ['', Validators.required],
    longitude: ['', Validators.required],
    category: ['', Validators.required]  
  });

  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    // CREATE mod
    if (!idParam) {
      this.isEditMode = false;
      this.dataLoaded = true;   // odmah možemo prikazati mapu praznu
      return;   
    }

    // EDIT mod
    this.isEditMode = true;
    this.id = Number(idParam);

    this.facilityService.getAll().subscribe((facilities: Facility[]) => {
      const facility = facilities.find(f => f.id === this.id);
      if (!facility) {
        this.dataLoaded = true; // da se ne zaglavi UI
        return;
      }

      this.form.patchValue({
        name: facility.name,
        latitude: facility.latitude.toString(),
        longitude: facility.longitude.toString(),
        category: facility.category.toString()
      });

      // postavi postojeći marker na mapu
      if (facility.latitude != null && facility.longitude != null) {
        this.mapPoints = [{
          lat: facility.latitude,
          lng: facility.longitude
        }];
      }

      this.dataLoaded = true;   // tek sad renderuj mapu
    });
  }

  // xp-map emituje { lat, lng } – isto kao kod monumenta
  onPointSelected(point: { lat: number; lng: number }): void {
    this.form.patchValue({
      latitude: point.lat.toString(),
      longitude: point.lng.toString()
    });

    // this.mapPoints = [{ lat: point.lat, lng: point.lng }];
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = {
      name: this.form.value.name!,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      category: Number(this.form.value.category)
    };

    if (this.isEditMode) {
      this.facilityService.update({ id: this.id, ...payload }).subscribe(() => {
        this.router.navigate(['/administration/facilities']);
      });
      return;
    }

    this.facilityService.create(payload).subscribe(() => {
      this.router.navigate(['/administration/facilities']);
    });
  }
}
