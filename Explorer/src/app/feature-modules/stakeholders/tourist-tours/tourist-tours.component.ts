import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { ShoppingCartService } from '../shopping-cart.service';

@Component({
  selector: 'xp-tourist-tours',
  templateUrl: './tourist-tours.component.html',
  styleUrls: ['./tourist-tours.component.css']
})
export class TouristToursComponent implements OnInit {

  tours: Tour[] = [];
  isLoading = false;

  constructor(
    private tourService: TourService,
    private shoppingCartService: ShoppingCartService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadTours();
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getPublishedToursForTourist().subscribe({
      next: (tours: Tour[]) => {
        this.tours = tours || [];
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('Error loading tours for tourist:', error);
        this.isLoading = false;
        this.showError('Error loading tours');
      }
    });
  }

  addToCart(tour: Tour): void {
    if (!tour.id) {
      this.showError('Invalid tour.');
      return;
    }

    this.shoppingCartService.addToCart(tour.id).subscribe({
      next: () => {
        this.showSuccess('Tour successfully added to your cart!');
      },
      error: (error) => {
        console.error('Add to cart error:', error);
        this.showError('This tour is already in your cart.');
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
}