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

  form = this.fb.group({
    name: ['', Validators.required],
    latitude: ['', Validators.required],
    longitude: ['', Validators.required],
    category: [null, Validators.required]     // 🔥 OVO JE KLJUČNA PROMENA (string → number)
  });

  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private route: ActivatedRoute,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.id = Number(this.route.snapshot.paramMap.get('id'));

    this.facilityService.getAll().subscribe((facilities: Facility[]) => {
      const facility = facilities.find(f => f.id === this.id);
      if (!facility) return;

      this.form.patchValue({
        name: facility.name,
        latitude: facility.latitude.toString(),
        longitude: facility.longitude.toString(),
        category: facility.category    // 🔥 Sad radi jer forma očekuje number
      });
    });
  }

  onSubmit(): void {
    if (this.form.invalid) return;

    const payload = {
      id: this.id,
      name: this.form.value.name!,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      category: Number(this.form.value.category)   // 🔥 OVDE JE BITNO — category MUST BE number
    };

    this.facilityService.update(payload).subscribe(() => {
      this.router.navigate(['/administration/facilities']);
    });
  }
}
