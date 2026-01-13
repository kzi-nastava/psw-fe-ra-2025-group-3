import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { TouristBundleService } from '../tourist-bundle.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { WalletService } from '../wallet.service';
import { Bundle, BundleStatus } from '../../tour-authoring/model/bundle.model';
import { WalletDto } from '../model/wallet.model';

@Component({
  selector: 'xp-tourist-bundles',
  templateUrl: './tourist-bundles.component.html',
  styleUrls: ['./tourist-bundles.component.css']
})
export class TouristBundlesComponent implements OnInit {
  bundles: Bundle[] = [];
  wallet: WalletDto | null = null;
  isLoading = false;
  BundleStatus = BundleStatus;
  purchasedBundles: Set<number> = new Set();
  bundlesInCart: Set<number> = new Set();

  constructor(
    private touristBundleService: TouristBundleService,
    private shoppingCartService: ShoppingCartService,
    private walletService: WalletService,
    private snackBar: MatSnackBar,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadBundles();
    this.loadWallet();
     this.checkPurchasedBundles();
     this.loadCart();
  }

  loadBundles(): void {
    this.isLoading = true;
    this.touristBundleService.getPublishedBundles().subscribe({
      next: (bundles) => {
        this.bundles = bundles;
        this.checkPurchasedBundles();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading bundles:', error);
        this.showError('Error loading bundles');
        this.isLoading = false;
      }
    });
  }

  loadWallet(): void {
    this.walletService.getMyWallet().subscribe({
      next: (wallet) => {
        this.wallet = wallet;
      },
      error: (error) => {
        console.error('Error loading wallet:', error);
      }
    });
  }

addToCart(bundle: Bundle): void {
  if (!bundle.id) {
    this.showError('Invalid bundle.');
    return;
  }

  this.shoppingCartService.addBundleToCart(bundle.id).subscribe({
    next: () => {
      this.showSuccess(`Bundle "${bundle.name}" added to cart!`);
      this.loadCart(); 
    },
    error: (error) => {
      console.error('Add to cart error:', error);
      const errorMsg = error.error?.message || 'This bundle is already in your cart.';
      this.showError(errorMsg);
    }
  });
}

  canAfford(bundle: Bundle): boolean {
    return this.wallet ? this.wallet.balanceAc >= bundle.price : false;
  }

  goToCart(): void {
    this.router.navigate(['/tourist/shopping-cart']);
  }

  getStatusLabel(status: BundleStatus): string {
    const labels = {
      [BundleStatus.Draft]: 'DRAFT',
      [BundleStatus.Published]: 'PUBLISHED',
      [BundleStatus.Archived]: 'ARCHIVED'
    };
    return labels[status] || 'UNKNOWN';
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
  checkPurchasedBundles(): void {
  // Proveri sve bundle-ove
  this.bundles.forEach(bundle => {
    this.touristBundleService.hasPurchasedBundle(bundle.id).subscribe({
      next: (hasPurchased) => {
        if (hasPurchased) {
          this.purchasedBundles.add(bundle.id);
        }
      },
      error: () => {}
    });
  });
}
loadCart(): void {
  this.shoppingCartService.getMyCart().subscribe({
    next: (cart) => {
      this.bundlesInCart.clear();
      cart.bundleItems?.forEach(item => {
        this.bundlesInCart.add(item.bundleId);
      });
    },
    error: () => {}
  });
}
isInCart(bundleId: number): boolean {
  return this.bundlesInCart.has(bundleId);
}

isPurchased(bundleId: number): boolean {
  return this.purchasedBundles.has(bundleId);
}
}