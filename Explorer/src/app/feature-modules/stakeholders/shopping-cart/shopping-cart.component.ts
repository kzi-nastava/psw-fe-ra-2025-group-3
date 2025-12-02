import { Component, OnInit } from '@angular/core';
import { ShoppingCart } from '../model/shopping-cart.model';
import { ShoppingCartService } from '../shopping-cart.service';
import { Router } from '@angular/router';

@Component({
  selector: 'xp-shopping-cart',
  templateUrl: './shopping-cart.component.html',
  styleUrls: ['./shopping-cart.component.css']
})
export class ShoppingCartComponent implements OnInit {
  cart: ShoppingCart | null = null;
  loading = false;
  error = '';

  constructor(private shoppingCartService: ShoppingCartService, private router: Router) {}

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
}