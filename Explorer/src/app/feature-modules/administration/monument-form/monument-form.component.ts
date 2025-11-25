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
    return this.fb.group({
      name: ['', [Validators.required]],
      description: ['', [Validators.required]],
      year: [null, [Validators.required, Validators.min(0)]],
      latitude: [null, [Validators.required]],
      longitude: [null, [Validators.required]],
    });
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

    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('min')) return 'Value must be positive';

    return '';
  }
}
