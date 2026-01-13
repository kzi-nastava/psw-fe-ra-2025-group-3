import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CouponService } from '../coupon.service';
import { Coupon } from '../model/coupon.model';
import { CouponFormComponent } from '../coupon-form/coupon-form.component';

@Component({
  selector: 'app-coupon-list',
  templateUrl: './coupon-list.component.html',
  styleUrls: ['./coupon-list.component.css']
})
export class CouponListComponent implements OnInit {
  coupons: Coupon[] = [];
  displayedCoupons: Coupon[] = [];
  couponsPerPage: number = 6;
  currentPage: number = 1;
  isLoading: boolean = false;

  constructor(
    private couponService: CouponService,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadCoupons();
  }

  loadCoupons(): void {
    this.isLoading = true;
    this.couponService.getMyCoupons().subscribe({
      next: (result) => {
        this.coupons = result || [];
        this.updateDisplayedCoupons();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading coupons:', error);
        this.showError('Error loading coupons');
        this.coupons = [];
        this.displayedCoupons = [];
        this.isLoading = false;
      }
    });
  }

  updateDisplayedCoupons(): void {
    if (!this.coupons || this.coupons.length === 0) {
      this.displayedCoupons = [];
      return;
    }
    const endIndex = this.currentPage * this.couponsPerPage;
    this.displayedCoupons = this.coupons.slice(0, endIndex);
  }

  showMore(): void {
    this.currentPage++;
    this.updateDisplayedCoupons();
  }

  hasMoreCoupons(): boolean {
    return this.coupons && this.displayedCoupons && 
           this.displayedCoupons.length < this.coupons.length;
  }

  openCreateDialog(): void {
    const dialogRef = this.dialog.open(CouponFormComponent, {
      width: '600px',
      data: { mode: 'create' },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCoupons();
      }
    });
  }

  openEditDialog(coupon: Coupon): void {
    if (this.isExpired(coupon)) {
      this.showError('Cannot edit an expired coupon');
      return;
    }

    const dialogRef = this.dialog.open(CouponFormComponent, {
      width: '600px',
      data: { mode: 'edit', coupon: coupon },
      disableClose: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.loadCoupons();
      }
    });
  }

  deleteCoupon(coupon: Coupon): void {
    if (confirm('Are you sure you want to delete this coupon?')) {
      this.couponService.deleteCoupon(coupon.id).subscribe({
        next: () => {
          this.showSuccess('Coupon successfully deleted');
          this.loadCoupons();
        },
        error: (error) => {
          console.error('Delete error:', error);
          this.showError('Error deleting coupon');
        }
      });
    }
  }

  isExpired(coupon: Coupon): boolean {
    if (!coupon.expiryDate) return false;
    return new Date(coupon.expiryDate) < new Date();
  }

  isValid(coupon: Coupon): boolean {
    return !this.isExpired(coupon);
  }

  getTourLabel(coupon: Coupon): string {
    return coupon.tourId ? `Tour #${coupon.tourId}` : 'All Tours';
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
