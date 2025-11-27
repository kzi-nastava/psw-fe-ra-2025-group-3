import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { TourProblem, ProblemCategory, ProblemPriority, TourProblemCreateDto, TourProblemUpdateDto } from '../model/tour-problem.model';
import { TourProblemService } from '../tour-problem.service';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

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
  futureTimeError: boolean = false;
  tourNotFoundError: boolean = false;
  checkingTour: boolean = false;
  tourExists: boolean = false;
  
  // Date picker arrays
  days: number[] = Array.from({length: 31}, (_, i) => i + 1);
  months = [
    { value: 0, label: 'January' },
    { value: 1, label: 'February' },
    { value: 2, label: 'March' },
    { value: 3, label: 'April' },
    { value: 4, label: 'May' },
    { value: 5, label: 'June' },
    { value: 6, label: 'July' },
    { value: 7, label: 'August' },
    { value: 8, label: 'September' },
    { value: 9, label: 'October' },
    { value: 10, label: 'November' },
    { value: 11, label: 'December' }
  ];
  years: number[] = [];
  hours: number[] = Array.from({length: 24}, (_, i) => i);
  minutes: number[] = Array.from({length: 60}, (_, i) => i);
  
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

  constructor(private tourProblemService: TourProblemService) { }

  ngOnInit(): void {
    this.generateYears();
    this.initializeForm();
    
    if (this.problem && this.isEditMode) {
      this.populateForm();
    }

    // Sluša promene na tourId polju sa debounce (čeka 500ms posle unosa)
    if (!this.isEditMode) {
      this.problemForm.get('tourId')?.valueChanges.pipe(
        debounceTime(500), // Čeka 500ms da korisnik završi kucanje
        distinctUntilChanged() // Poziva samo ako se vrednost promenila
      ).subscribe(tourId => {
        if (tourId && tourId > 0) {
          this.validateTourExists(tourId);
        } else {
          this.tourNotFoundError = false;
          this.tourExists = false;
        }
      });
    }
  }

  generateYears(): void {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  initializeForm(): void {
    const now = new Date();
    
    this.problemForm = new FormGroup({
      tourId: new FormControl(null, [Validators.required]),
      category: new FormControl(null, [Validators.required]),
      priority: new FormControl(null, [Validators.required]),
      description: new FormControl('', [Validators.required, Validators.minLength(10)]),
      day: new FormControl(now.getDate(), [Validators.required]),
      month: new FormControl(now.getMonth(), [Validators.required]),
      year: new FormControl(now.getFullYear(), [Validators.required]),
      hour: new FormControl(now.getHours(), [Validators.required]),
      minute: new FormControl(now.getMinutes(), [Validators.required])
    });

    if (this.isEditMode) {
      this.problemForm.get('tourId')?.disable();
    }
  }

  populateForm(): void {
    if (this.problem) {
      const problemDateTime = new Date(this.problem.time);

      this.problemForm.patchValue({
        tourId: this.problem.tourId,
        category: this.problem.category,
        priority: this.problem.priority,
        description: this.problem.description,
        day: problemDateTime.getDate(),
        month: problemDateTime.getMonth(),
        year: problemDateTime.getFullYear(),
        hour: problemDateTime.getHours(),
        minute: problemDateTime.getMinutes()
      });
    }
  }

 validateTourExists(tourId: number): void {
  console.log('=== VALIDATE TOUR EXISTS START ===');
  console.log('Tour ID to validate:', tourId);
  
  this.tourNotFoundError = false;
  this.tourExists = false;
  this.checkingTour = true;

  this.tourProblemService.checkTourExists(tourId).subscribe({
    next: (exists) => {
      console.log('=== VALIDATION RESULT ===');
      console.log('Exists:', exists);
      
      this.checkingTour = false;
      this.tourExists = exists;
      if (!exists) {
        this.tourNotFoundError = true;
        console.log('Setting tourNotFoundError to TRUE');
      } else {
        console.log('Tour is valid!');
      }
    },
    error: (err) => {
      console.error('=== VALIDATION ERROR ===');
      console.error('Error checking tour:', err);
      this.checkingTour = false;
      this.tourNotFoundError = true;
      this.tourExists = false;
    }
  });
}

  isDateTimeInvalid(): boolean {
    const day = this.problemForm.get('day');
    const month = this.problemForm.get('month');
    const year = this.problemForm.get('year');
    const hour = this.problemForm.get('hour');
    const minute = this.problemForm.get('minute');

    return !!(
      (day?.invalid && day?.touched) ||
      (month?.invalid && month?.touched) ||
      (year?.invalid && year?.touched) ||
      (hour?.invalid && hour?.touched) ||
      (minute?.invalid && minute?.touched)
    );
  }

  onSubmit(): void {
    console.log('=== FORM SUBMIT ===');
    console.log('Form valid:', this.problemForm.valid);
    console.log('Form value:', this.problemForm.getRawValue());
    console.log('Is edit mode:', this.isEditMode);
    
    this.futureTimeError = false;

    // PROVERI DA LI TURA POSTOJI PRE SLANJA
    if (!this.isEditMode && this.tourNotFoundError) {
      alert('Tour with this ID does not exist. Please enter a valid tour ID.');
      return;
    }

    if (!this.isEditMode && !this.tourExists) {
      alert('Please wait for tour validation to complete.');
      return;
    }

    if (this.problemForm.valid) {
      const formValue = this.problemForm.getRawValue();
      
      const combinedDateTime = new Date(
        formValue.year,
        formValue.month,
        formValue.day,
        formValue.hour,
        formValue.minute
      );

      if (combinedDateTime > new Date()) {
        this.futureTimeError = true;
        console.log('ERROR: Selected time is in the future!');
        return;
      }
      
      if (this.isEditMode && this.problem) {
        const updateDto: TourProblemUpdateDto = {
          category: formValue.category,
          priority: formValue.priority,
          description: formValue.description,
          time: combinedDateTime
        };
        console.log('Emitting UPDATE:', updateDto);
        this.problemUpdated.emit(updateDto);
      } else {
        const createDto: TourProblemCreateDto = {
          tourId: formValue.tourId,
          category: formValue.category,
          priority: formValue.priority,
          description: formValue.description,
          time: combinedDateTime
        };
        console.log('Emitting CREATE:', createDto);
        this.problemCreated.emit(createDto);
      }

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
    this.futureTimeError = false;
    this.tourNotFoundError = false;
    this.tourExists = false;
    this.formCanceled.emit();
  }

  private markFormGroupTouched(formGroup: FormGroup): void {
    Object.keys(formGroup.controls).forEach(key => {
      const control = formGroup.get(key);
      control?.markAsTouched();
    });
  }

  get maxDate(): string {
    return new Date().toISOString().split('T')[0];
  }
}