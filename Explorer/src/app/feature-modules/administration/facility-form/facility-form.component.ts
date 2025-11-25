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

  isSubmitting = false;
  backendError = '';

  form = this.fb.group({
    name: ['', Validators.required],
    latitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
    longitude: ['', [Validators.required, Validators.pattern(/^-?\d+(\.\d+)?$/)]],
    category: ['', Validators.required]
  });

  constructor(
    private fb: FormBuilder,
    private facilityService: FacilityService,
    private router: Router
  ) {}

  onSubmit() {
  if (this.form.invalid) {
    this.form.markAllAsTouched();
    return;
  }

  this.isSubmitting = true;
  this.backendError = '';

  const payload = {
    name: this.form.value.name!,
    latitude: Number(this.form.value.latitude),
    longitude: Number(this.form.value.longitude),
    category: Number(this.form.value.category)   
  };

  this.facilityService.create(payload).subscribe({
    next: () => {
      this.isSubmitting = false;
      this.router.navigate(['/administration/facilities']);
    },
    error: (err) => {
      this.isSubmitting = false;
      this.backendError = 'Server error: Could not create facility.';
      console.error(err);
    }
  });
}

}
