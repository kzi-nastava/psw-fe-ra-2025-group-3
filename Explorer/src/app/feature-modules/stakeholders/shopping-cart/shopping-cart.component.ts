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
import { WelcomeBonusService } from '../welcome-bonus.service';
import { WelcomeBonus, BonusType } from '../model/welcome-bonus.model';
import { StakeholderService } from '../stakeholder.service';
import { TouristStats } from '../model/tourist-stats.model';

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
  welcomeBonus: WelcomeBonus | null = null;
  touristStats: TouristStats | null = null;

  constructor(
    private shoppingCartService: ShoppingCartService,
    private walletService: WalletService,
    private router: Router,
    private snackBar: MatSnackBar,
    private couponService: CouponService,
    private fb: FormBuilder,
    private welcomeBonusService: WelcomeBonusService,
    private stakeholderService: StakeholderService
  ) {
    this.couponForm = this.fb.group({
      couponCode: ['']
    });
  }

  ngOnInit(): void {
    this.loadCart();
    this.loadWallet();
    this.loadWelcomeBonus();
    this.loadTouristStats();
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
    let total = this.cart.totalPrice;
    
    // Apply coupon discount if valid
    if (this.couponValidation && this.couponValidation.isValid && this.couponValidation.appliedToTourId) {
      const appliedTour = this.cart.items.find(item => item.tourId === this.couponValidation!.appliedToTourId);
      if (appliedTour) {
        total -= this.couponValidation.discountAmount;
      }
    }
    
    // Backend applies either welcome bonus OR rank discount (whichever is greater)
    // So we need to check which one will be applied
    const welcomeDiscountAmount = this.hasActiveWelcomeBonusDiscount() ? this.getWelcomeBonusDiscountAmount() : 0;
    const rankDiscountAmount = this.hasRankDiscount() ? (total * (this.getRankDiscountPercentage() / 100)) : 0;
    
    // Apply the greater discount (backend logic)
    const appliedDiscount = Math.max(welcomeDiscountAmount, rankDiscountAmount);
    total -= appliedDiscount;
    
    return Math.max(0, total);
  }

  getDiscountAmount(): number {
    if (!this.cart) return 0;
    let discount = 0;
    
    // Coupon discount
    if (this.couponValidation && this.couponValidation.isValid && this.couponValidation.appliedToTourId) {
      discount += this.couponValidation.discountAmount;
    }
    
    // Welcome bonus discount
    if (this.hasActiveWelcomeBonusDiscount()) {
      discount += this.getWelcomeBonusDiscountAmount();
    }
    
    return discount;
  }
  
  loadWelcomeBonus(): void {
    this.welcomeBonusService.getWelcomeBonus().subscribe({
      next: (bonus) => {
        this.welcomeBonus = bonus;
      },
      error: () => {
        this.welcomeBonus = null;
      }
    });
  }
  
  hasActiveWelcomeBonusDiscount(): boolean {
    if (!this.welcomeBonus || this.welcomeBonus.isUsed) return false;
    return this.welcomeBonus.bonusType === BonusType.Discount10 ||
           this.welcomeBonus.bonusType === BonusType.Discount20 ||
           this.welcomeBonus.bonusType === BonusType.Discount30;
  }
  
  getWelcomeBonusDiscountAmount(): number {
    if (!this.cart || !this.hasActiveWelcomeBonusDiscount()) return 0;
    return this.cart.totalPrice * (this.welcomeBonus!.value / 100);
  }
  
  getWelcomeBonusDiscountPercentage(): number {
    if (!this.hasActiveWelcomeBonusDiscount()) return 0;
    return this.welcomeBonus!.value;
  }

  loadTouristStats(): void {
    this.stakeholderService.getTouristStats().subscribe({
      next: (stats) => {
        this.touristStats = stats;
      },
      error: () => {
        this.touristStats = null;
      }
    });
  }

  getRankDiscountPercentage(): number {
    if (!this.touristStats) return 0;
    const rank = this.touristStats.rank;
    const discounts: { [key: string]: number } = {
      'Silver': 5,
      'Gold': 5,
      'Platinum': 10,
      'Diamond': 20,
      'Vista': 40
    };
    return discounts[rank] || 0;
  }

  hasRankDiscount(): boolean {
    return this.getRankDiscountPercentage() > 0;
  }

  // Check which discount will actually be applied (backend applies the greater one)
  getAppliedDiscountType(): 'rank' | 'welcome' | 'none' {
    if (!this.cart) return 'none';
    
    const welcomeDiscountAmount = this.hasActiveWelcomeBonusDiscount() ? this.getWelcomeBonusDiscountAmount() : 0;
    const rankDiscountAmount = this.hasRankDiscount() ? (this.cart.totalPrice * (this.getRankDiscountPercentage() / 100)) : 0;
    
    if (rankDiscountAmount === 0 && welcomeDiscountAmount === 0) return 'none';
    return rankDiscountAmount > welcomeDiscountAmount ? 'rank' : 'welcome';
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
              bundlePurchaseRecords: result.bundlePurchaseRecords || [],
              successMessage: result.message
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
  
  // Kreiraj mapu cena tura iz korpe (tourId -> price)
  const tourPrices: { [key: number]: number } = {};
  this.cart.items.forEach(item => {
    tourPrices[item.tourId] = item.price;
  });

  this.validatingCoupon = true;
  this.couponService.validateCoupon({
    code: this.couponCode.trim().toUpperCase(),
    tourId: tourIds[0], // Za backward compatibility
    tourIds: tourIds, // Lista svih tour ID-jeva za validaciju cele korpe
    tourPrices: tourPrices // Cene tura iz korpe (već snižene)
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