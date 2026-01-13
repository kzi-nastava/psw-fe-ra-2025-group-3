import { Component, OnInit } from '@angular/core';
import { ShoppingCart } from '../model/shopping-cart.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { WalletService } from '../wallet.service';
import { WalletDto } from '../model/wallet.model';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';

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

  constructor(
    private shoppingCartService: ShoppingCartService,
    private walletService: WalletService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {}

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

  canAffordCheckout(): boolean {
    if (!this.cart || !this.wallet) return false;
    return this.wallet.balanceAc >= this.cart.totalPrice;
  }

  getShortfall(): number {
    if (!this.cart || !this.wallet) return 0;
    return Math.max(0, this.cart.totalPrice - this.wallet.balanceAc);
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
              purchaseRecords: result.purchaseRecords 
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
}