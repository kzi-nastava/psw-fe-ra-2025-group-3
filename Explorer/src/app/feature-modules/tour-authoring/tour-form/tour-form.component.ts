import { Component, EventEmitter, Inject, Input, OnInit, Optional, Output } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourService } from '../tour.service';
import { Tour, TourDifficulty, TourCreateDto, TourUpdateDto, Equipment, TourStatus, TourDuration, TransportType } from '../model/tour.model';
import { COMMA, ENTER } from '@angular/cdk/keycodes';
import { MatChipInputEvent } from '@angular/material/chips';

@Component({
  selector: 'app-tour-form',
  templateUrl: './tour-form.component.html',
  styleUrls: ['./tour-form.component.css']
})
export class TourFormComponent implements OnInit {
  tourForm: FormGroup;
  isEditMode: boolean = false;
  tourId?: number;
  tags: string[] = [];
  
  availableEquipment: Equipment[] = [];
  selectedEquipmentIds: number[] = [];
  isArchived: boolean = false; 

  @Input() mode: 'create' | 'edit' = 'create';
  @Input() tour?: Tour;
  @Input() embedded: boolean = false;

  @Output() saved = new EventEmitter<{success: boolean, tourId?: number}>();
  @Output() cancelled = new EventEmitter<void>();

  tourDurations: TourDuration[] = [];
  transportTypes = [
    { value: TransportType.Walking, label: 'Walking' },
    { value: TransportType.Bicycle, label: 'Bicycle' },
    { value: TransportType.Car, label: 'Car' }
  ];

  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  difficulties = [
    { value: TourDifficulty.Easy, label: 'Easy' },
    { value: TourDifficulty.Medium, label: 'Medium' },
    { value: TourDifficulty.Hard, label: 'Hard' }
  ];

  difficultyTooltip =
    'Easy — short and relaxed.\n' +
    'Medium — moderate and balanced.\n' +
    'Hard — long or intensive.';

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    @Optional() public dialogRef?: MatDialogRef<TourFormComponent>,
    @Optional() @Inject(MAT_DIALOG_DATA) public data?: { mode: 'create' | 'edit', tour?: Tour }
  ) {
    const effectiveMode = this.data?.mode ?? this.mode;
    this.isEditMode = effectiveMode === 'edit';
    this.tourForm = this.createForm();
  }

  ngOnInit(): void {
    this.tourService.getEquipment().subscribe({
      next: (equipment) => {
        this.availableEquipment = equipment;
        this.initData();
      },
      error: () => {
        this.initData();
      }
    });
  }

  private initData(): void {
    const effectiveTour = this.getEffectiveTour();
    if (this.isEditMode && effectiveTour) {
        if (!this.data) this.data = { mode: this.mode, tour: effectiveTour };
        else this.data.tour = effectiveTour;
        this.initializeEditMode();
    }
  }

  initializeEditMode(): void {
    const tour = this.data?.tour;
    if (!tour) return;

    this.tourId = tour.id;
    this.tags = [...(tour.tags || [])];
    this.tourDurations = [...(tour.tourDurations || [])];
    this.isArchived = tour.status === TourStatus.Archived;

    if (tour.equipment) {
        this.selectedEquipmentIds = tour.equipment.map(e => e.id);
    }

    this.tourForm.patchValue({
      name: tour.name,
      description: tour.description,
      difficulty: tour.difficulty,
      price: tour.price
    });
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      difficulty: [TourDifficulty.Easy, Validators.required],
      price: [{ value: 0, disabled: !this.isEditMode }, [Validators.min(0)]],
      durationTime: [''], 
      transportType: [TransportType.Walking]
    });
  }

  // --- PUBLIC METODE ZA WIZARD ---

  get isValid(): boolean {
      return this.tourForm.valid && this.tourDurations.length > 0;
  }

  submit(): void {
    if (!this.isValid) {
      this.tourForm.markAllAsTouched();
      if (this.tourDurations.length === 0) {
          this.showError('At least one duration is required.');
      }
      return;
    }

    const formValue = this.tourForm.getRawValue();

    if (this.tourId) {
      this.performUpdate(formValue);
    } else {
      this.performCreate(formValue);
    }
  }

  // --- LOGIKA KREIRANJA I EDITOVANJA ---

  private performCreate(formValue: any): void {
      const createDto: TourCreateDto = {
        name: formValue.name,
        description: formValue.description,
        difficulty: formValue.difficulty,
        tags: this.tags,
        tourDurations: this.tourDurations
      };

      this.tourService.createTour(createDto).subscribe({
        next: (tour: Tour) => {
          this.tourId = tour.id;
          this.isEditMode = true;
          
          this.showSuccess('Tour created successfully');
          this.saved.emit({success: true, tourId: tour.id});
          
          if (!this.embedded) this.dialogRef?.close(true);
        },
        error: () => {
          this.showError('Error creating tour');
          this.saved.emit({success: false});
        }
      });
  }

  private performUpdate(formValue: any): void {
      const updateDto: TourUpdateDto = {
        name: formValue.name,
        description: formValue.description,
        difficulty: formValue.difficulty,
        tags: this.tags,
        price: formValue.price,
        tourDurations: this.tourDurations
      };

      this.tourService.updateTour(this.tourId!, updateDto).subscribe({
        next: () => {
          if (!this.embedded) {
             this.synchronizeEquipment();
          } else {
             this.showSuccess('Tour details updated');
             this.saved.emit({success: true, tourId: this.tourId});
          }
        },
        error: () => {
            this.showError('Error updating tour');
            this.saved.emit({success: false});
        }
      });
  }


  addDuration(): void {
    const duration = this.tourForm.get('durationTime')?.value;
    const type = this.tourForm.get('transportType')?.value;

    if (duration && duration > 0 && type !== null) {
      const existing = this.tourDurations.find(d => d.transportType === type);
      if (existing) {
        this.showError('Duration for this transport type already exists.');
        return;
      }
      this.tourDurations.push({ timeInMinutes: duration, transportType: type });
      this.tourForm.patchValue({ durationTime: '', transportType: TransportType.Walking });
    }
  }

  removeDuration(index: number): void {
    this.tourDurations.splice(index, 1);
  }

  getTransportLabel(type: TransportType): string {
    return this.transportTypes.find(t => t.value === type)?.label || 'Unknown';
  }

  onEquipmentChange(equipmentId: number, event: any): void {
    if (event.checked) {
      if (!this.selectedEquipmentIds.includes(equipmentId)) this.selectedEquipmentIds.push(equipmentId);
    } else {
      this.selectedEquipmentIds = this.selectedEquipmentIds.filter(id => id !== equipmentId);
    }
  }

  isEquipmentSelected(equipmentId: number): boolean {
    return this.selectedEquipmentIds.includes(equipmentId);
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();
    if (value && !this.tags.includes(value)) {
      if (this.tags.length < 10) this.tags.push(value);
      else this.showError('Maximum number of tags is 10');
    }
    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) this.tags.splice(index, 1);
  }

  private synchronizeEquipment(): void {
    if (!this.tourId || !this.data?.tour) {
      this.showSuccess('Tour successfully updated');
      this.dialogRef?.close(true);
      return;
    }

    const originalEquipmentIds = this.data?.tour?.equipment?.map(e => e.id) || [];
    const toAdd = this.selectedEquipmentIds.filter(id => !originalEquipmentIds.includes(id));
    const toRemove = originalEquipmentIds.filter(id => !this.selectedEquipmentIds.includes(id));

    const addRequests = toAdd.map(id => this.tourService.addEquipmentToTour(this.tourId!, id));
    const removeRequests = toRemove.map(id => this.tourService.removeEquipmentFromTour(this.tourId!, id));
    const allRequests = [...addRequests, ...removeRequests];

    if (allRequests.length === 0) {
      this.showSuccess('Tour successfully updated');
      this.saved.emit({success: true, tourId: this.tourId});
      this.dialogRef?.close(true);
      return;
    }

    let completed = 0;
    allRequests.forEach(request => {
      request.subscribe({
        next: () => {
          completed++;
          if (completed === allRequests.length) {
            this.showSuccess('Tour successfully updated');
            this.saved.emit({success: true, tourId: this.tourId});
            this.dialogRef?.close(true);
          }
        },
        error: () => {
          completed++;
          if (completed === allRequests.length) {
            this.showError('Error updating equipment');
            this.dialogRef?.close(true);
          }
        }
      });
    });
  }

  onCancel(): void {
    if(this.embedded) this.cancelled.emit();
    else this.dialogRef?.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.tourForm.get(fieldName);
    if (field?.hasError('required')) return 'This field is required';
    if (field?.hasError('minlength')) return `Minimum length is ${field.errors?.['minlength'].requiredLength} characters`;
    if (field?.hasError('maxlength')) return `Maximum length is ${field.errors?.['maxlength'].requiredLength} characters`;
    if (field?.hasError('min')) return 'Price cannot be negative';
    return '';
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 3000, panelClass: ['success-snackbar'] });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
  }

  private getEffectiveTour(): Tour | undefined {
    return this.data?.tour ?? this.tour;
  }
}