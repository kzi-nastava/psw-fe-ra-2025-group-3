import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, FormArray } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourService } from '../tour.service';
import { Tour, TourDifficulty, TourCreateDto, TourUpdateDto } from '../model/tour.model';
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
  readonly separatorKeysCodes: number[] = [ENTER, COMMA];

  difficulties = [
    { value: TourDifficulty.Easy, label: 'Easy' },
    { value: TourDifficulty.Medium, label: 'Medium' },
    { value: TourDifficulty.Hard, label: 'Hard' }
  ];

  constructor(
    private fb: FormBuilder,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    public dialogRef: MatDialogRef<TourFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { mode: 'create' | 'edit', tour?: Tour }
  ) {
    this.isEditMode = data.mode === 'edit';
    this.tourForm = this.createForm();
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.tour) {
      this.tourId = this.data.tour.id;
      this.tags = [...(this.data.tour.tags || [])];
      this.tourForm.patchValue({
        name: this.data.tour.name,
        description: this.data.tour.description,
        difficulty: this.data.tour.difficulty,
        price: this.data.tour.price
      });
    }
  }

  createForm(): FormGroup {
    return this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3), Validators.maxLength(100)]],
      description: ['', [Validators.required, Validators.minLength(10), Validators.maxLength(1000)]],
      difficulty: [TourDifficulty.Easy, Validators.required],
      price: [{ value: 0, disabled: !this.isEditMode }, [Validators.min(0)]]
    });
  }

  addTag(event: MatChipInputEvent): void {
    const value = (event.value || '').trim();

    if (value && !this.tags.includes(value)) {
      if (this.tags.length < 10) {
        this.tags.push(value);
      } else {
        this.showError('Maximum number of tags is 10');
      }
    }

    event.chipInput!.clear();
  }

  removeTag(tag: string): void {
    const index = this.tags.indexOf(tag);
    if (index >= 0) {
      this.tags.splice(index, 1);
    }
  }

  onSubmit(): void {
    if (this.tourForm.invalid) {
      this.markFormGroupTouched(this.tourForm);
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.tourForm.getRawValue();

    if (this.isEditMode && this.tourId) {
      const updateDto: TourUpdateDto = {
        name: formValue.name,
        description: formValue.description,
        difficulty: formValue.difficulty,
        tags: this.tags,
        price: formValue.price
      };

      this.tourService.updateTour(this.tourId, updateDto).subscribe({
        next: () => {
          this.showSuccess('Tour successfully updated');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.showError('Error updating tour');
        }
      });
    } else {
      const createDto: TourCreateDto = {
        name: formValue.name,
        description: formValue.description,
        difficulty: formValue.difficulty,
        tags: this.tags
      };

      this.tourService.createTour(createDto).subscribe({
        next: () => {
          this.showSuccess('Tour successfully created');
          this.dialogRef.close(true);
        },
        error: (error) => {
          this.showError('Error creating tour');
        }
      });
    }
  }

  onCancel(): void {
    this.dialogRef.close(false);
  }

  getErrorMessage(fieldName: string): string {
    const field = this.tourForm.get(fieldName);
    
    if (field?.hasError('required')) {
      return 'This field is required';
    }
    
    if (field?.hasError('minlength')) {
      const minLength = field.errors?.['minlength'].requiredLength;
      return `Minimum length is ${minLength} characters`;
    }
    
    if (field?.hasError('maxlength')) {
      const maxLength = field.errors?.['maxlength'].requiredLength;
      return `Maximum length is ${maxLength} characters`;
    }
    
    if (field?.hasError('min')) {
      return 'Price cannot be negative';
    }
    
    return '';
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();

      if (control instanceof FormGroup) {
        this.markFormGroupTouched(control);
      }
    });
  }

  private showSuccess(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 3000,
      panelClass: ['success-snackbar']
    });
  }

  private showError(message: string): void {
    this.snackBar.open(message, 'Close', {
      duration: 5000,
      panelClass: ['error-snackbar']
    });
  }
}