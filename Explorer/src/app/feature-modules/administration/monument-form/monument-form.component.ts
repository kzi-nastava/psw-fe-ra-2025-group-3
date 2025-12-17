import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { AdministrationService } from '../administration.service';
import { Monument, MonumentStatus } from '../model/monument.model';

@Component({
  selector: 'xp-monument-form',
  templateUrl: './monument-form.component.html',
  styleUrls: ['./monument-form.component.css']
})
export class MonumentFormComponent implements OnInit {

  MonumentStatus = MonumentStatus;
  monumentForm: FormGroup;
  isEditMode: boolean = false;

  mapPoints: { lat: number; lng: number }[] = [];

  constructor(
    private fb: FormBuilder,
    private service: AdministrationService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<MonumentFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'create' | 'edit'; monument: Monument | null }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.monumentForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.monument) {
      const m = this.data.monument;

      this.monumentForm.patchValue({
        name: m.name,
        description: m.description,
        year: m.year,
        latitude: m.latitude,
        longitude: m.longitude
      });

      if (m.latitude != null && m.longitude != null) {
      this.mapPoints = [{ lat: m.latitude, lng: m.longitude }];
    }
    }
  }

  private createForm(): FormGroup {
    const currentYear = new Date().getFullYear();

    return this.fb.group({
      name: ['', [Validators.required, this.startsWithCapitalValidator()]],
      description: ['', [Validators.required, this.startsWithCapitalValidator()]],
      year: [
        null,
        [
          Validators.required,
          Validators.min(-10000), // ako želiš dozvoliti velike BC godine
          Validators.max(currentYear),
          this.noZeroYearValidator()
        ]
      ],
      latitude: [
        null,
        [
          Validators.required,
          Validators.min(-90),
          Validators.max(90)
        ]
      ],
      longitude: [
        null,
        [
          Validators.required,
          Validators.min(-180),
          Validators.max(180)
        ]
      ],
    });
  }
  private noZeroYearValidator() {
    return (control: any) => {
      if (control.value === 0) {
        return { zeroYear: true };
      }
      return null;
    };
  }
  private startsWithCapitalValidator() {
    return (control: any) => {
      const val = control.value;
      if (!val) return null;

      const first = val.charAt(0);
      if (first !== first.toUpperCase()) {
        return { startsWithCapital: true };
      }

      return null;
    };
  }
  // xp-map emituje { lat, lng }
  onPointSelected(point: { lat: number; lng: number }): void {
    this.monumentForm.patchValue({
      latitude: point.lat,
      longitude: point.lng
    });

    
  }

  onSubmit(): void {
    if (this.monumentForm.invalid) {
      this.monumentForm.markAllAsTouched();
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.monumentForm.getRawValue();

    if (this.isEditMode && this.data.monument) {
      const monument: Monument = {
        id: this.data.monument.id,
        name: formValue.name,
        description: formValue.description,
        year: formValue.year,
        status: this.data.monument.status,
        latitude: formValue.latitude,
        longitude: formValue.longitude
      };

      this.service.updateMonument(monument).subscribe({
        next: () => {
          this.showSuccess('Monument successfully updated');
          this.dialogRef.close(true);
        },
        error: () => this.showError('Error updating monument')
      });

    } else {
      const monument: Monument = {
        name: formValue.name,
        description: formValue.description,
        year: formValue.year,
        status: MonumentStatus.Active,
        latitude: formValue.latitude,
        longitude: formValue.longitude
      };

      this.service.addMonument(monument).subscribe({
        next: () => {
          this.showSuccess('Monument successfully created');
          this.dialogRef.close(true);
        },
        error: () => this.showError('Error creating monument')
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  private showSuccess(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(msg: string) {
    this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  getErrorMessage(fieldName: string): string {
    const field = this.monumentForm.get(fieldName);
    if (!field) return '';

    if (field?.hasError('startsWithCapital')) 
      return 'Must start with a capital letter';

    if (field.hasError('required')) return 'This field is required';

    if (fieldName === 'year') {
      if (field.hasError('min')) return 'Year must be a valid positive or BC number';
      if (field.hasError('max')) return `Year cannot be greater than ${new Date().getFullYear()}`;
      if (field.hasError('zeroYear')) return 'Year 0 does not exist (use negative numbers for BC)';
    }

    if (fieldName === 'latitude') {
      if (field.hasError('min') || field.hasError('max'))
        return 'Latitude must be between -90 and 90';
    }

    if (fieldName === 'longitude') {
      if (field.hasError('min') || field.hasError('max'))
        return 'Longitude must be between -180 and 180';
    }

    return '';
  }
}
