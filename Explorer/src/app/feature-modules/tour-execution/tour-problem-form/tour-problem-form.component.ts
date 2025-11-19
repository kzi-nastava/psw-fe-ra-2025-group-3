import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourProblem, ProblemCategory, ProblemPriority, TourProblemCreateDto, TourProblemUpdateDto } from '../model/tour-problem.model';

@Component({
  selector: 'app-tour-problem-form',
  templateUrl: './tour-problem-form.component.html',
  styleUrls: ['./tour-problem-form.component.css']
})
export class TourProblemFormComponent implements OnInit {
  @Input() problem: TourProblem | null = null;
  @Input() isEditMode: boolean = false;
  @Output() problemCreated = new EventEmitter<TourProblemCreateDto>();
  @Output() problemUpdated = new EventEmitter<TourProblemUpdateDto>();
  @Output() formCanceled = new EventEmitter<void>();

  problemForm!: FormGroup;
categories = [
  { value: ProblemCategory.Transportation, label: 'Transportation' },
  { value: ProblemCategory.Accommodation, label: 'Accommodation' },
  { value: ProblemCategory.Guide, label: 'Guide' },
  { value: ProblemCategory.Location, label: 'Location' },
  { value: ProblemCategory.Food, label: 'Food' },
  { value: ProblemCategory.Other, label: 'Other' }
];

priorities = [
  { value: ProblemPriority.Low, label: 'Low' },
  { value: ProblemPriority.Medium, label: 'Medium' },
  { value: ProblemPriority.High, label: 'High' },
  { value: ProblemPriority.Critical, label: 'Critical' }
];

  ngOnInit(): void {
    this.initializeForm();
    
    if (this.problem && this.isEditMode) {
      this.populateForm();
    }
  }

  initializeForm(): void {
    this.problemForm = new FormGroup({
      tourId: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required]),
      priority: new FormControl(null, [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      time: new FormControl(null, [Validators.required])
    });

    if (this.isEditMode) {
      this.problemForm.get('tourId')?.disable();
    }
  }

  populateForm(): void {
    if (this.problem) {
      this.problemForm.patchValue({
        tourId: this.problem.tourId,
        category: this.problem.category,
        priority: this.problem.priority,
        description: this.problem.description,
        time: new Date(this.problem.time).toISOString().slice(0, 16)
      });
    }
  }

  onSubmit(): void {
  console.log('=== FORM SUBMIT ===');
  console.log('Form valid:', this.problemForm.valid);
  console.log('Form value:', this.problemForm.getRawValue());
  console.log('Is edit mode:', this.isEditMode);
  
  if (this.problemForm.valid) {
    const formValue = this.problemForm.getRawValue();
    
   if (this.isEditMode && this.problem) {
  const updateDto: TourProblemUpdateDto = {
    category: formValue.category,
    priority: formValue.priority,
    description: formValue.description,
    time: new Date(formValue.time)
  };
  console.log('Emitting UPDATE:', updateDto);
  this.problemUpdated.emit(updateDto);
} else {
      const createDto: TourProblemCreateDto = {
        tourId: formValue.tourId,
        category: formValue.category,
        priority: formValue.priority,
        description: formValue.description,
        time: new Date(formValue.time)
      };
      console.log('Emitting CREATE:', createDto);
      this.problemCreated.emit(createDto);
    }

    this.problemForm.reset();
  } else {
    console.log('Form is INVALID!');
    console.log('Form errors:', this.problemForm.errors);
    Object.keys(this.problemForm.controls).forEach(key => {
      const control = this.problemForm.get(key);
      if (control?.invalid) {
        console.log(`Field ${key} is invalid:`, control.errors);
      }
    });
    this.markFormGroupTouched(this.problemForm);
  }
}

  onCancel(): void {
    this.problemForm.reset();
    this.formCanceled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get maxDate(): string {
    return new Date().toISOString().slice(0, 16);
  }
}