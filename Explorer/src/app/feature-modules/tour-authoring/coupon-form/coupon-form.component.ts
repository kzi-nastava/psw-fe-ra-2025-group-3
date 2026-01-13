import { Component, Inject, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CouponService } from '../coupon.service';
import { TourService } from '../tour.service';
import { Coupon, CouponCreateDto, CouponUpdateDto } from '../model/coupon.model';
import { Tour, TourStatus } from '../model/tour.model';

@Component({
  selector: 'app-coupon-form',
  templateUrl: './coupon-form.component.html',
  styleUrls: ['./coupon-form.component.css']
})
export class CouponFormComponent implements OnInit {
  couponForm: FormGroup;
  mode: 'create' | 'edit' = 'create';
  coupon?: Coupon;
  availableTours: Tour[] = [];
  isLoading: boolean = false;
  minDate: Date = new Date();

  constructor(
    private fb: FormBuilder,
    private couponService: CouponService,
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private dialogRef: MatDialogRef<CouponFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: any
  ) {
    this.mode = data.mode || 'create';
    this.coupon = data.coupon;

    this.couponForm = this.fb.group({
      discountPercentage: [0, [Validators.required, Validators.min(1), Validators.max(100)]],
      expiryDate: [null, [this.futureDateValidator.bind(this)]],
      tourId: [null]
    });
  }

  futureDateValidator(control: any) {
    if (!control.value) return null; // Optional field
    const selectedDate = new Date(control.value);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    selectedDate.setHours(0, 0, 0, 0);
    
    if (selectedDate < today) {
      return { pastDate: true };
    }
    return null;
  }

  ngOnInit(): void {
    this.loadMyTours();

    if (this.mode === 'edit' && this.coupon) {
      const expiryDate = this.coupon.expiryDate ? new Date(this.coupon.expiryDate) : null;
      this.couponForm.patchValue({
        discountPercentage: this.coupon.discountPercentage,
        expiryDate: expiryDate,
        tourId: this.coupon.tourId || null
      });
    }
  }

  loadMyTours(): void {
    this.isLoading = true;
    this.tourService.getMyTours().subscribe({
      next: (tours) => {
        this.availableTours = tours.filter(t => t.status === TourStatus.Published);
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading tours:', error);
        this.showError('Error loading tours');
        this.isLoading = false;
      }
    });
  }

  onSubmit(): void {
    if (this.couponForm.invalid) {
      this.showError('Please fill in all required fields correctly');
      return;
    }

    // Provera datuma
    const expiryDate = this.couponForm.get('expiryDate')?.value;
    if (expiryDate) {
      const selectedDate = new Date(expiryDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      selectedDate.setHours(0, 0, 0, 0);
      
      if (selectedDate < today) {
        this.showError('Expiry date cannot be in the past');
        return;
      }
    }

    const formData = this.couponForm.value;
    const couponData: CouponCreateDto | CouponUpdateDto = {
      discountPercentage: formData.discountPercentage,
      expiryDate: formData.expiryDate ? new Date(formData.expiryDate).toISOString() : undefined,
      tourId: formData.tourId || undefined
    };

    if (this.mode === 'create') {
      this.createCoupon(couponData as CouponCreateDto);
    } else {
      this.updateCoupon(couponData as CouponUpdateDto);
    }
  }

  createCoupon(data: CouponCreateDto): void {
    this.couponService.createCoupon(data).subscribe({
      next: (coupon) => {
        this.showSuccess('Coupon created successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Create error:', error);
        const errorMsg = error.error?.message || error.error || 'Error creating coupon';
        this.showError(errorMsg);
      }
    });
  }

  updateCoupon(data: CouponUpdateDto): void {
    this.couponService.updateCoupon(this.coupon!.id, data).subscribe({
      next: () => {
        this.showSuccess('Coupon updated successfully');
        this.dialogRef.close(true);
      },
      error: (error) => {
        console.error('Update error:', error);
        const errorMsg = error.error?.message || error.error || 'Error updating coupon';
        this.showError(errorMsg);
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
