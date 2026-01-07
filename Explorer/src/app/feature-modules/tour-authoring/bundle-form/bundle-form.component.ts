import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BundleService } from '../bundle.service';
import { TourService } from '../tour.service';
import { Bundle, BundleCreateDto, BundleUpdateDto } from '../model/bundle.model';
import { Tour, TourStatus } from '../model/tour.model';

@Component({
  selector: 'app-bundle-form',
  templateUrl: './bundle-form.component.html',
  styleUrls: ['./bundle-form.component.css']
})
export class BundleFormComponent implements OnInit {
  bundleForm: FormGroup;
  mode: 'create' | 'edit' = 'create';
  bundle?: Bundle;
  availableTours: Tour[] = [];
  selectedTours: Tour[] = [];
  isLoading: boolean = false;

  constructor(
    private fb: FormBuilder,
    private bundleService: BundleService,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<BundleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode || 'create';
    this.bundle = data.bundle;

    this.bundleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(3)]],
      price: [0, [Validators.required, Validators.min(0)]],
      selectedTourIds: [[], Validators.required]
    });
  }

  ngOnInit(): void {
    this.loadMyTours();

    if (this.mode === 'edit' && this.bundle) {
      this.bundleForm.patchValue({
        name: this.bundle.name,
        price: this.bundle.price,
        selectedTourIds: this.bundle.tourIds
      });
    }
  }

  loadMyTours(): void {
    this.isLoading = true;
    this.tourService.getMyTours().subscribe({
      next: (tours) => {
        this.availableTours = tours.filter(t => 
          t.status === TourStatus.Draft || t.status === TourStatus.Published
        );
        
        if (this.mode === 'edit' && this.bundle) {
          this.updateSelectedTours(this.bundle.tourIds);
        }
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.showError('Error loading tours');
        this.isLoading = false;
      }
    });
  }

  updateSelectedTours(tourIds: number[]): void {
    this.selectedTours = this.availableTours.filter(t => tourIds.includes(t.id));
    this.bundleForm.patchValue({ selectedTourIds: tourIds });
  }

  onTourSelectionChange(event: any): void {
    const selectedIds = event.value as number[];
    this.selectedTours = this.availableTours.filter(t => selectedIds.includes(t.id));
  }

  getTotalToursPrice(): number {
    return this.selectedTours.reduce((sum, tour) => sum + tour.price, 0);
  }

  getPublishedToursCount(): number {
    return this.selectedTours.filter(t => t.status === TourStatus.Published).length;
  }

  canPublish(): boolean {
    return this.getPublishedToursCount() >= 2;
  }

  onSubmit(): void {
    if (this.bundleForm.invalid) {
      this.showError('Please fill in all required fields');
      return;
    }

    const selectedIds = this.bundleForm.value.selectedTourIds;
    
    if (!selectedIds || selectedIds.length === 0) {
      this.showError('Please select at least one tour');
      return;
    }

    const formData = {
      name: this.bundleForm.value.name,
      price: this.bundleForm.value.price,
      tourIds: selectedIds
    };

    if (this.mode === 'create') {
      this.createBundle(formData);
    } else {
      this.updateBundle(formData);
    }
  }

  createBundle(data: BundleCreateDto): void {
    this.bundleService.createBundle(data).subscribe({
      next: () => {
        this.showSuccess('Bundle created successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Create error:', error);
        this.showError(error.error || 'Error creating bundle');
      }
    });
  }

  updateBundle(data: any): void {
    const updateDto: BundleUpdateDto = {
      id: this.bundle!.id,
      name: data.name,
      price: data.price,
      tourIds: data.tourIds
    };

    this.bundleService.updateBundle(this.bundle!.id, updateDto).subscribe({
      next: () => {
        this.showSuccess('Bundle updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Update error:', error);
        this.showError(error.error || 'Error updating bundle');
      }
    });
  }

  onCancel(): void {
    this.dialogRef.close(false);
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