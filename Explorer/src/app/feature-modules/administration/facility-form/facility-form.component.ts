import { Component } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { FacilityService } from '../facility.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-facility-form',
  templateUrl: './facility-form.component.html',
  styleUrls: ['./facility-form.component.css']
})
export class FacilityFormComponent {

  form = this.fb.group({
    name: ['', Validators.required],
    latitude: ['', Validators.required],
    longitude: ['', Validators.required],
    category: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private router: Router
  ) {}

  onSubmit() {
    if (this.form.invalid) return;

    
    const payload = {
      name: this.form.value.name!,
      latitude: Number(this.form.value.latitude),
      longitude: Number(this.form.value.longitude),
      category: this.form.value.category!
    };


    this.facilityService.create(payload as any).subscribe(() => {
     
      this.router.navigate(['/administration/facilities']);
    });
  }
}
