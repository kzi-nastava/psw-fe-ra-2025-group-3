import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { EncounterService } from '../encounter.service';
import { Encounter, EncounterStatus, EncounterType } from '../model/encounter.model';

@Component({
  selector: 'app-encounter-form',
  templateUrl: './encounter-form.component.html',
  styleUrls: ['./encounter-form.component.css']
})
export class EncounterFormComponent implements OnInit {

  EncounterStatus = EncounterStatus;
  EncounterType = EncounterType;
  encounterForm: FormGroup;
  isEditMode: boolean = false;

  mapPoints: { lat: number; lng: number }[] = [];

  encounterStatuses = [
    { value: EncounterStatus.Draft, label: 'Draft' },
    { value: EncounterStatus.Active, label: 'Active' },
    { value: EncounterStatus.Archived, label: 'Archived' }
  ];

  encounterTypes = [
    { value: EncounterType.Misc, label: 'Misc' },
    { value: EncounterType.Social, label: 'Social' },
    { value: EncounterType.HiddenLocation, label: 'Hidden Location' }
  ];

  constructor(
    private fb: FormBuilder,
    private encounterService: EncounterService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<EncounterFormComponent>,
    @Inject(MAT_DIALOG_DATA)
    public data: { mode: 'create' | 'edit'; encounter: Encounter | null; actor: 'admin' | 'tourist'; }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.encounterForm = this.createForm();
  }

 ngOnInit(): void {
  if (this.isEditMode && this.data.encounter) {
    const e = this.data.encounter;

    this.encounterForm.patchValue({
      name: e.name,
      description: e.description,
      xp: e.xp,
      latitude: e.latitude,
      longitude: e.longitude,
      status: e.status,
      type: e.type,
      actionDescription: e.actionDescription || '',
      requiredPeopleCount: e.requiredPeopleCount || null,
      rangeInMeters: e.rangeInMeters || null,
      imageUrl: e.imageUrl || ''
    });

    if (e.latitude != null && e.longitude != null) {
      this.mapPoints = [{ lat: e.latitude, lng: e.longitude }];
    }
  }

  // Dynamic validation based on encounter type
  this.encounterForm.get('type')?.valueChanges.subscribe(type => {
    this.updateValidatorsForType(type);
  });
}

private updateValidatorsForType(type: EncounterType): void {
  const actionControl = this.encounterForm.get('actionDescription');
  const requiredPeopleControl = this.encounterForm.get('requiredPeopleCount');
  const rangeControl = this.encounterForm.get('rangeInMeters');
  const imageUrlControl = this.encounterForm.get('imageUrl');

  // Clear all validators first
  actionControl?.clearValidators();
  requiredPeopleControl?.clearValidators();
  rangeControl?.clearValidators();
  imageUrlControl?.clearValidators();

  // Reset values
  actionControl?.setValue('');
  requiredPeopleControl?.setValue(null);
  rangeControl?.setValue(null);
  imageUrlControl?.setValue('');

  // Set validators based on type
  if (type === EncounterType.Misc) {
    actionControl?.setValidators([Validators.required, Validators.minLength(5)]);
  } else if (type === EncounterType.Social) {
    requiredPeopleControl?.setValidators([Validators.required, Validators.min(2), Validators.max(100)]);
    rangeControl?.setValidators([Validators.required, Validators.min(5), Validators.max(100)]);
    rangeControl?.setValue(30); // Default 30m
  } else if (type === EncounterType.HiddenLocation) {
    imageUrlControl?.setValidators([Validators.required]);
  }

  // Update validity
  actionControl?.updateValueAndValidity();
  requiredPeopleControl?.updateValueAndValidity();
  rangeControl?.updateValueAndValidity();
  imageUrlControl?.updateValueAndValidity();
}


  private createForm(): FormGroup {
    const form = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(500)]],
      xp: [null, [Validators.required, Validators.min(1), Validators.max(10000)]],
      latitude: [null, [Validators.required, Validators.min(-90), Validators.max(90)]],
      longitude: [null, [Validators.required, Validators.min(-180), Validators.max(180)]],
      status: [''],
      type: ['', Validators.required],
      actionDescription: [''],
      // Social fields
      requiredPeopleCount: [null],
      rangeInMeters: [null],
      // HiddenLocation fields
      imageUrl: ['']
    });

    if (this.data.actor === 'admin') {
      form.get('status')!.setValidators([Validators.required]);
    } else {
      form.get('status')!.clearValidators();
    }
    form.get('status')?.updateValueAndValidity();

    return form;
  }

  onPointSelected(point: { lat: number; lng: number }): void {
    this.encounterForm.patchValue({
      latitude: point.lat,
      longitude: point.lng
    });
  }

  onSubmit(): void {
    if (this.encounterForm.invalid) {
      this.encounterForm.markAllAsTouched();
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.encounterForm.getRawValue();
    const encounterType = formValue.type as EncounterType;

    // Build base encounter
    const encounterData: any = {
      name: formValue.name,
      description: formValue.description,
      latitude: formValue.latitude,
      longitude: formValue.longitude,
      xp: formValue.xp,
      status: this.data.actor === 'tourist' ? EncounterStatus.PendingApproval : (formValue.status as EncounterStatus),
      type: encounterType
    };

    // Add type-specific fields
    if (encounterType === EncounterType.Misc) {
      encounterData.actionDescription = formValue.actionDescription;
    } else if (encounterType === EncounterType.Social) {
      encounterData.requiredPeopleCount = formValue.requiredPeopleCount;
      encounterData.rangeInMeters = formValue.rangeInMeters;
    } else if (encounterType === EncounterType.HiddenLocation) {
      encounterData.imageUrl = formValue.imageUrl;
      // latitude/longitude are already in encounterData as REAL coordinates
    }

    if (this.isEditMode && this.data.encounter) {
      const encounter: Encounter = {
        id: this.data.encounter.id,
        ...encounterData
      };

      this.encounterService.update(this.data.actor, encounter.id!, encounter).subscribe({
        next: () => {
          this.showSuccess('Encounter successfully updated');
          this.dialogRef.close(true);
        },
        error: () => this.showError('Error updating encounter')
      });

    } else {
      const encounter: Encounter = encounterData;

      this.encounterService.create(this.data.actor, encounter).subscribe({
        next: () => {
          if(this.data.actor === 'tourist') {
            this.showSuccess('Encounter submitted for approval');
          }
          else {
            this.showSuccess('Encounter successfully created');
          }
          this.dialogRef.close(true);
        },
        error: () => this.showError('Error creating encounter')
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
    const field = this.encounterForm.get(fieldName);
    if (!field) return '';

    if (field.hasError('required')) return 'This field is required';

    if (fieldName === 'name') {
      if (field.hasError('minlength')) return 'Name must be at least 3 characters';
      if (field.hasError('maxlength')) return 'Name cannot exceed 100 characters';
    }

    if (fieldName === 'description') {
      if (field.hasError('minlength')) return 'Description must be at least 10 characters';
      if (field.hasError('maxlength')) return 'Description cannot exceed 500 characters';
    }

    if (fieldName === 'xp') {
      if (field.hasError('min')) return 'XP must be at least 1';
      if (field.hasError('max')) return 'XP cannot exceed 10,000';
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
