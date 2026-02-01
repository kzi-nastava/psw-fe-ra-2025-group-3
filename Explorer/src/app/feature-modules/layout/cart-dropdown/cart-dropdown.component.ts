import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ShoppingCartService } from '../../stakeholders/shopping-cart.service';
import { WalletService } from '../../stakeholders/wallet.service';
import { ShoppingCart } from '../../stakeholders/model/shopping-cart.model';
import { WalletDto } from '../../stakeholders/model/wallet.model';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-cart-dropdown',
  templateUrl: './cart-dropdown.component.html',
  styleUrls: ['./cart-dropdown.component.css']
})
export class CartDropdownComponent implements OnInit, OnDestroy {
  @Output() closeDropdown = new EventEmitter<void>();

  cart: ShoppingCart | null = null;
  wallet: WalletDto | null = null;
  isLoading: boolean = true;

  private destroy$ = new Subject<void>();

  constructor(
    private shoppingCartService: ShoppingCartService,
    private walletService: WalletService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.loadCart();
    this.loadWallet();

    // Osvežavaj korpu kada se promeni
    this.shoppingCartService.cartUpdated
      .pipe(takeUntil(this.destroy$))
      .subscribe(() => {
        this.loadCart();
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }

  loadCart(): void {
    this.isLoading = true;
    this.shoppingCartService.getMyCart().subscribe({
      next: (cart: ShoppingCart) => {
        this.cart = cart;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading cart:', error);
        this.cart = null;
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

  goToCheckout(): void {
    this.closeDropdown.emit();
    this.router.navigate(['/tourist/cart']);
  }

  getTotalItemsCount(): number {
    if (!this.cart) return 0;
    const itemsCount = this.cart.items?.length || 0;
    const bundleItemsCount = this.cart.bundleItems?.length || 0;
    return itemsCount + bundleItemsCount;
  }

  removeTour(tourId: number, event: Event): void {
    event.stopPropagation();
    const confirmed = confirm('Are you sure you want to remove this tour from your cart?');
    if (!confirmed) return;

    this.shoppingCartService.removeFromCart(tourId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing tour from cart:', error);
      }
    });
  }

  removeBundle(bundleId: number, event: Event): void {
    event.stopPropagation();
    const confirmed = confirm('Are you sure you want to remove this bundle from your cart?');
    if (!confirmed) return;

    this.shoppingCartService.removeBundleFromCart(bundleId).subscribe({
      next: () => {
        this.loadCart();
      },
      error: (error) => {
        console.error('Error removing bundle from cart:', error);
      }
    });
  }
}
