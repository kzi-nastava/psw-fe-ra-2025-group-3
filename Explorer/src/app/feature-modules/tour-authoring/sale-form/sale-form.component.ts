import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SaleService } from '../sale.service';
import { TourService } from '../tour.service';
import { Sale, SaleCreateDto, SaleUpdateDto } from '../model/sale.model';
import { Tour } from '../model/tour.model';

@Component({
  selector: 'app-sale-form',
  templateUrl: './sale-form.component.html',
  styleUrls: ['./sale-form.component.css']
})
export class SaleFormComponent implements OnInit {
  saleForm: FormGroup;
  mode: 'create' | 'edit' = 'create';
  sale?: Sale;
  availableTours: Tour[] = [];
  selectedTours: Tour[] = [];
  isLoading: boolean = false;
  maxEndDate: Date = new Date();
  today: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private saleService: SaleService,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<SaleFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode || 'create';
    this.sale = data.sale;

    this.saleForm = this.fb.group({
      selectedTourIds: [[], Validators.required],
      startDate: ['', Validators.required],
      endDate: ['', Validators.required],
      discountPercentage: [0, [Validators.required, Validators.min(0), Validators.max(100)]]
    });
  }

  ngOnInit(): void {
    this.loadMyTours();

    if (this.mode === 'edit' && this.sale) {
      const startDate = new Date(this.sale.startDate);
      const endDate = new Date(this.sale.endDate);
      
      this.saleForm.patchValue({
        selectedTourIds: this.sale.tourIds,
        startDate: startDate,
        endDate: endDate,
        discountPercentage: this.sale.discountPercentage
      });
      
      this.updateMaxEndDate(startDate);
      this.updateSelectedTours(this.sale.tourIds);
    }

    // Watch for start date changes to update max end date
    this.saleForm.get('startDate')?.valueChanges.subscribe((startDate: Date) => {
      if (startDate) {
        this.updateMaxEndDate(new Date(startDate));
      }
    });
  }

  updateMaxEndDate(startDate: Date): void {
    const maxDate = new Date(startDate);
    maxDate.setDate(maxDate.getDate() + 14); // Maximum 2 weeks
    this.maxEndDate = maxDate;
    
    const currentEndDate = this.saleForm.get('endDate')?.value;
    if (currentEndDate && new Date(currentEndDate) > maxDate) {
      this.saleForm.patchValue({ endDate: maxDate });
    }
  }

  loadMyTours(): void {
    this.isLoading = true;
    this.tourService.getMyTours().subscribe({
      next: (tours) => {
        this.availableTours = tours || [];
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
    this.saleForm.patchValue({ selectedTourIds: tourIds });
  }

  onTourSelectionChange(event: any): void {
    const selectedIds = event.value as number[];
    this.selectedTours = this.availableTours.filter(t => selectedIds.includes(t.id));
  }

  onSubmit(): void {
    if (this.saleForm.invalid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    const formValue = this.saleForm.value;
    const selectedIds = formValue.selectedTourIds;
    
    if (!selectedIds || selectedIds.length === 0) {
      this.showError('Please select at least one tour');
      return;
    }

    const startDate = new Date(formValue.startDate);
    const endDate = new Date(formValue.endDate);

    if (startDate >= endDate) {
      this.showError('End date must be after start date');
      return;
    }

    const maxEndDate = new Date(startDate);
    maxEndDate.setDate(maxEndDate.getDate() + 14);
    if (endDate > maxEndDate) {
      this.showError('End date cannot be more than 2 weeks from start date');
      return;
    }

    if (formValue.discountPercentage < 0 || formValue.discountPercentage > 100) {
      this.showError('Discount percentage must be between 0 and 100');
      return;
    }

    const saleData: SaleCreateDto = {
      tourIds: selectedIds,
      startDate: startDate,
      endDate: endDate,
      discountPercentage: formValue.discountPercentage
    };

    if (this.mode === 'create') {
      this.createSale(saleData);
    } else {
      this.updateSale(saleData);
    }
  }

  createSale(data: SaleCreateDto): void {
    this.isLoading = true;
    this.saleService.createSale(data).subscribe({
      next: () => {
        this.showSuccess('Sale created successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Create error:', error);
        const errorMsg = error.error?.detail || error.error || 'Error creating sale';
        this.showError(errorMsg);
        this.isLoading = false;
      }
    });
  }

  updateSale(data: SaleCreateDto): void {
    this.isLoading = true;
    const updateDto: SaleUpdateDto = {
      id: this.sale!.id,
      tourIds: data.tourIds,
      startDate: data.startDate,
      endDate: data.endDate,
      discountPercentage: data.discountPercentage
    };

    this.saleService.updateSale(this.sale!.id, updateDto).subscribe({
      next: () => {
        this.showSuccess('Sale updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Update error:', error);
        const errorMsg = error.error?.detail || error.error || 'Error updating sale';
        this.showError(errorMsg);
        this.isLoading = false;
      }
    });
  }

  getDateRangeDays(): number {
    const startDate = this.saleForm.get('startDate')?.value;
    const endDate = this.saleForm.get('endDate')?.value;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return diffDays;
    }
    return 0;
  }

  getMinEndDate(): Date {
    const startDate = this.saleForm.get('startDate')?.value;
    if (startDate) {
      return new Date(startDate);
    }
    return this.today;
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
