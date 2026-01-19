import { Component, OnInit } from '@angular/core';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { WishlistService } from '../wishlist.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { ShoppingCartService } from '../shopping-cart.service';

@Component({
  selector: 'xp-wishlist',
  templateUrl: './wishlist.component.html',
  styleUrls: ['./wishlist.component.css']
})
export class WishlistComponent implements OnInit {
  tours: Tour[] = [];
  isLoading = false;
  wishlistStatus: Map<number, boolean> = new Map();

  constructor(
    private wishlistService: WishlistService,
    private snackBar: MatSnackBar,
    private router: Router,
    private shoppingCartService: ShoppingCartService
  ) { }

  ngOnInit(): void {
    this.loadWishlist();
  }

  loadWishlist(): void {
    this.isLoading = true;
    this.wishlistService.getWishlistTours().subscribe({
      next: (tours) => {
        this.tours = tours;
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
        this.snackBar.open('Error loading wishlist', 'Close', {
          duration: 3000
        });
      }
    });
  }

  removeFromWishlist(tourId: number): void {
    this.wishlistService.removeFromWishlist(tourId).subscribe({
      next: () => {
        this.tours = this.tours.filter(t => t.id !== tourId);
        this.snackBar.open('Removed from wishlist', 'Close', {
          duration: 2000
        });
      },
      error: () => {
        this.snackBar.open('Error removing from wishlist', 'Close', {
          duration: 3000
        });
      }
    });
  }

  addToCart(tourId: number): void {
    this.shoppingCartService.addToCart(tourId).subscribe({
      next: () => {
        this.snackBar.open('Added to cart', 'Close', {
          duration: 2000
        });
      },
      error: (error) => {
        const message = error.error?.message || 'Error adding to cart';
        this.snackBar.open(message, 'Close', {
          duration: 3000
        });
      }
    });
  }

  viewTourDetails(tourId: number): void {
    this.router.navigate(['/tourist/tours', tourId, 'details']);
  }

  getDifficultyLabel(difficulty: number): string {
    switch (difficulty) {
      case 0:
        return 'Easy';
      case 1:
        return 'Medium';
      case 2:
        return 'Hard';
      default:
        return 'Unknown';
    }
  }

  getDurationLabel(minutes: number): string {
    if (minutes < 60) {
      return `${minutes} min`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    if (mins === 0) {
      return `${hours}h`;
    }
    return `${hours}h ${mins}min`;
  }
}
