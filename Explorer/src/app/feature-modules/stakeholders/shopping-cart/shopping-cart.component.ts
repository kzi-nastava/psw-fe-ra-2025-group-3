import { Component, OnInit } from '@angular/core';
import { ShoppingCart } from '../model/shopping-cart.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { WalletService } from '../wallet.service';
import { WalletDto } from '../model/wallet.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CouponService } from 'src/app/feature-modules/tour-authoring/coupon.service';
import { CouponValidationResultDto } from 'src/app/feature-modules/tour-authoring/model/coupon.model';
import { FormBuilder, FormGroup } from '@angular/forms';

@Component({
  selector: 'xp-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cart: ShoppingCart | null = null;
  wallet: WalletDto | null = null;
  loading = false;
  checkoutLoading = false;
  error = '';
  couponForm: FormGroup;
  couponCode: string = '';
  couponValidation: CouponValidationResultDto | null = null;
  validatingCoupon = false;
  appliedCouponCode: string | null = null;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private walletService: WalletService,
    private router: Router,
    private snackBar: MatSnackBar,
    private couponService: CouponService,
    private fb: FormBuilder
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadWallet();
  }

  loadCart(): void {
    this.loading = true;
    this.error = '';
    this.shoppingCartService.getMyCart().subscribe({
      next: cart => {
        this.cart = cart;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = 'Unable to load your cart.';
      }
    });
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe({
      next: wallet => {
        this.wallet = wallet;
      },
      error: (err) => {
        console.error('Error loading wallet:', err);
      }
    });
  }

  getTotalWithDiscount(): number {
    if (!this.cart) return 0;
    if (this.couponValidation && this.couponValidation.isValid && this.couponValidation.appliedToTourId) {
      // Pronađi turu na koju se primenjuje popust
      const appliedTour = this.cart.items.find(item => item.tourId === this.couponValidation!.appliedToTourId);
      if (appliedTour) {
        // Popust se primenjuje samo na tu turu
        const discountAmount = this.couponValidation.discountAmount;
        return this.cart.totalPrice - discountAmount;
      }
    }
    return this.cart.totalPrice;
  }

  getDiscountAmount(): number {
    if (!this.cart) return 0;
    if (this.couponValidation && this.couponValidation.isValid && this.couponValidation.appliedToTourId) {
      // Popust se primenjuje samo na određenu turu
      return this.couponValidation.discountAmount;
    }
    return 0;
  }

  canAffordCheckout(): boolean {
    if (!this.cart || !this.wallet) return false;
    const totalWithDiscount = this.getTotalWithDiscount();
    return this.wallet.balanceAc >= totalWithDiscount;
  }

  getShortfall(): number {
    if (!this.cart || !this.wallet) return 0;
    const totalWithDiscount = this.getTotalWithDiscount();
    return Math.max(0, totalWithDiscount - this.wallet.balanceAc);
  }

  onRemove(tourId: number): void {
    const confirmed = confirm('Are you sure you want to remove this tour from your cart?');
    if (!confirmed) return;
    if (!this.cart) return;

    this.loading = true;
    this.shoppingCartService.removeFromCart(tourId).subscribe({
      next: cart => {
        this.cart = cart;
        this.loading = false;
        this.showSuccess('Tour removed from cart.');
        this.loadWallet(); // Refresh wallet
      },
      error: () => {
        this.loading = false;
        this.showError('Error removing tour.');
      }
    });
  }

  goToTours(): void {
    this.router.navigate(['/tourist/tours']);
  }

 //dodato
onCheckout(): void {
  if (!this.cart || (this.cart.items.length === 0 && this.cart.bundleItems.length === 0)) {
    return;
  }

  if (!this.canAffordCheckout()) {
    this.showError(`Insufficient Adventure Coins! You need ${this.getShortfall()} more AC.`);
    return;
  }

  this.checkoutLoading = true;
  console.log('[FRONTEND] Calling checkout API...');

  this.shoppingCartService.checkout().subscribe({
    next: (result) => {
      console.log('[FRONTEND] Checkout response:', result);
      this.checkoutLoading = false;

      if (result.success) {
        this.showSuccess(result.message);
        
        // Refresh cart and wallet
        this.loadCart();
        this.loadWallet();

        // Navigate to success page
        setTimeout(() => {
          this.router.navigate(['/tourist/purchase-success'], {
            state: { 
              tokens: result.tokens,
              purchaseRecords: result.purchaseRecords,
              bundlePurchaseRecords: result.bundlePurchaseRecords || []
            }
          });
        }, 1500);
      } else {
        this.showError(result.message);
      }
    },
    error: (err) => {
      console.error('[FRONTEND] Checkout error:', err);
      console.error('[FRONTEND] Error status:', err.status);
      console.error('[FRONTEND] Error body:', err.error);
      
      this.checkoutLoading = false;
      
      const errorMsg = err.error?.message || err.message || 'Checkout failed. Please try again.';
      this.showError(errorMsg);
      
      // Refresh anyway to see if transaction succeeded
      this.loadCart();
      this.loadWallet();
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
  onRemoveBundle(bundleId: number): void {
  const confirmed = confirm('Are you sure you want to remove this bundle from your cart?');
  if (!confirmed) return;
  if (!this.cart) return;

  this.loading = true;
  this.shoppingCartService.removeBundleFromCart(bundleId).subscribe({
    next: cart => {
      this.cart = cart;
      this.loading = false;
      this.showSuccess('Bundle removed from cart.');
      this.loadWallet();
    },
    error: () => {
      this.loading = false;
      this.showError('Error removing bundle.');
    }
  });
}
getTotalItemsCount(): number {
  if (!this.cart) return 0;
  const itemsCount = this.cart.items?.length || 0;
  const bundleItemsCount = this.cart.bundleItems?.length || 0;
  return itemsCount + bundleItemsCount;
}

validateCoupon(): void {
  if (!this.couponCode || !this.couponCode.trim()) {
    this.showError('Please enter a coupon code');
    return;
  }

  if (!this.cart || (this.cart.items.length === 0 && this.cart.bundleItems.length === 0)) {
    this.showError('Your cart is empty');
    return;
  }

  // Kupon se može primeniti samo na individualne ture, ne na bundle-ove
  if (this.cart.items.length === 0) {
    this.showError('Coupon can only be applied to individual tours, not bundles');
    return;
  }

  // Prikupi sve tour ID-jeve iz korpe
  const tourIds = this.cart.items.map(item => item.tourId);

  this.validatingCoupon = true;
  this.couponService.validateCoupon({
    code: this.couponCode.trim().toUpperCase(),
    tourId: tourIds[0], // Za backward compatibility
    tourIds: tourIds // Lista svih tour ID-jeva za validaciju cele korpe
  }).subscribe({
    next: (result) => {
      this.validatingCoupon = false;
      this.couponValidation = result;
      
      if (result.isValid) {
        this.appliedCouponCode = this.couponCode.trim().toUpperCase();
        this.showSuccess(`Coupon applied! ${result.discountPercentage}% discount`);
      } else {
        this.showError(result.message);
        this.couponValidation = null;
        this.appliedCouponCode = null;
      }
    },
    error: (err) => {
      this.validatingCoupon = false;
      const errorMsg = err.error?.message || 'Error validating coupon';
      this.showError(errorMsg);
      this.couponValidation = null;
      this.appliedCouponCode = null;
    }
  });
}

removeCoupon(): void {
  this.couponCode = '';
  this.couponValidation = null;
  this.appliedCouponCode = null;
  this.couponForm.patchValue({ couponCode: '' });
}
}