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

  form = this.fb.group({
    name: ['', Validators.required],
    latitude: ['', Validators.required],
    longitude: ['', Validators.required],
    category: ['', Validators.required]  // forma radi sa stringovima
  });

  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');

    // CREATE MODE → nema id u ruti
    if (!idParam) {
      this.isEditMode = false;
      return;   // ne učitavaj ništa iz servisa, id ne postoji
    }

    // EDIT MODE
    this.isEditMode = true;
    this.id = Number(idParam);

    this.facilityService.getAll().subscribe((facilities: Facility[]) => {
      const facility = facilities.find(f => f.id === this.id);
      if (!facility) return;

      this.form.patchValue({
        name: facility.name,
        latitude: facility.latitude.toString(),
        longitude: facility.longitude.toString(),
        category: facility.category.toString()
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = {
      name: this.form.value.name!,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      category: Number(this.form.value.category)
    };

    // UPDATE
    if (this.isEditMode) {
      this.facilityService.update({ id: this.id, ...payload }).subscribe(() => {
        this.router.navigate(['/administration/facilities']);
      });
      return;
    }

    // CREATE
    this.facilityService.create(payload).subscribe(() => {
      this.router.navigate(['/administration/facilities']);
    });
  }
}
