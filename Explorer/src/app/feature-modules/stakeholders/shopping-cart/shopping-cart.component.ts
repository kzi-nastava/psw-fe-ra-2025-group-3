import { Component, OnInit } from '@angular/core';
import { ShoppingCart } from '../model/shopping-cart.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { Router } from '@angular/router';
import { TourPurchaseService } from '../tour-purchase.service';


@Component({
  selector: 'xp-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cart: ShoppingCart | null = null;
  loading = false;
  error = '';

  constructor(private shoppingCartService: ShoppingCartService,private purchaseService: TourPurchaseService, private router: Router) {}

  ngOnInit(): void {
    this.loadCart();
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

  onRemove(tourId: number): void {
    const confirmed = confirm('Are you sure you want to remove this tour from your cart?');

    if (!confirmed) return;

    if (!this.cart) return;
    this.loading = true;

    this.shoppingCartService.removeFromCart(tourId).subscribe({
      next: cart => {
        this.cart = cart;
        this.loading = false;
        alert('Tour removed from cart.');
      },
      error: () => {
        this.loading = false;
        alert('Error removing tour.');
      }
    });
  }

  goToTours(): void {
    this.router.navigate(['/tourist/tours']);
  }

 onCheckout(): void {
  if (!this.cart || this.cart.items.length === 0) {
    return;
  }

  this.loading = true;

  this.purchaseService.checkout().subscribe({
    next: tokens => {
      this.loading = false;

      this.cart = {
        touristId: this.cart!.touristId,
        items: [],
        totalPrice: 0
      };

      alert(`Purchase successful! You received ${tokens.length} tokens.`);

      this.router.navigate(['/tourist/purchase-success'], {
        state: { tokens }
      });
    },
    error: () => {
      this.loading = false;
      alert('Checkout failed. Please try again later.');
    }
  });
}

  
}