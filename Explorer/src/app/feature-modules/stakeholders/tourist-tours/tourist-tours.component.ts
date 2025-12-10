import { Component, OnInit } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { ShoppingCartService } from '../shopping-cart.service';
import { Router } from '@angular/router';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { TourExecutionCreateDto } from '../../tour-execution/model/tour-execution.model';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';
import { TourPreview } from '../../tour-authoring/model/tour-preview.model';
import { TourStatus } from '../../tour-authoring/model/tour.model'; // Dodat import za Enum

@Component({
  selector: 'xp-tourist-tours',
  templateUrl: './tourist-tours.component.html',
  styleUrls: ['./tourist-tours.component.css']
})
export class TouristToursComponent implements OnInit {

  tours: TourPreview[] = [];
  isLoading = false;
  startingTourId: number | null = null;
  hasActiveTour = false;
  
  expandedTourId: number | null = null;
  currentUserId?: number;

  // Dodato da bi HTML prepoznao enum
  TourStatus = TourStatus;

  constructor(
    private tourService: TourService,
    private shoppingCartService: ShoppingCartService,
    private snackBar: MatSnackBar,
    private positionSimulator: PositionSimulatorService,
    private tourExecutionService: TourExecutionService,
    private router: Router,
    private authService: AuthService 
  ) {}

  ngOnInit(): void {
    this.checkActiveTour();
    this.loadTours();
    const user = this.authService.user$.value;
    if (user) {
      this.currentUserId = user.id;
    }
  }

  checkActiveTour(): void {
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (execution) => {
        this.hasActiveTour = !!execution;
      },
      error: () => {
        this.hasActiveTour = false;
      }
    });
  }

  loadTours(): void {
    this.isLoading = true;
    this.tourService.getPublishedTourPreviews().subscribe({
      next: (tours: TourPreview[]) => {
        this.tours = tours || [];
        this.isLoading = false;
        console.log('Loaded tour previews:', this.tours);
      },
      error: (error: any) => {
        console.error('Error loading tour previews:', error);
        this.isLoading = false;
        this.showError('Error loading tours');
      }
    });
  }

  addToCart(tour: TourPreview): void {
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

  startTour(tour: TourPreview): void {
    if (!tour.id) {
      this.showError('Invalid tour.');
      return;
    }

    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (activeExecution) => {
        if (activeExecution) {
          this.showError('You already have an active tour. Please complete or abandon it first.');
          this.router.navigate(['/tour-execution/active']);
          return;
        }
        
        this.proceedWithTourStart(tour);
      },
      error: (err) => {
        console.error('[Start Tour] Error checking active execution:', err);
        this.showError('Error checking active tours.');
      }
    });
  }

  private proceedWithTourStart(tour: TourPreview): void {
    this.startingTourId = tour.id!;

    console.log('[Start Tour] Getting position from Position Simulator...');

    this.positionSimulator.getCurrentPosition().subscribe({
      next: (position) => {
        if (position.source === 'none' || position.latitude === 0 || position.longitude === 0) {
          this.startingTourId = null;
          console.log('[Start Tour] ❌ No position available');
          this.showError('Cannot start: Location access is required. Please set your position on the Explore Map first.');
          this.router.navigate(['/tourist/map']);
          return;
        }

        console.log('[Start Tour] ✅ Position obtained:', position);

        const dto: TourExecutionCreateDto = {
          tourId: tour.id!,
          startLatitude: position.latitude,
          startLongitude: position.longitude
        };

        this.tourExecutionService.startTour(dto).subscribe({
          next: (execution) => {
            this.startingTourId = null;
            console.log('[Start Tour] ✅ Tour started:', execution);
            this.showSuccess('Tour started successfully!');
            this.hasActiveTour = true;
            this.router.navigate(['/tour-execution/active']);
          },
          error: (error) => {
            this.startingTourId = null;
            console.error('[Start Tour] ❌ Error:', error);
            const errorMsg = error?.error?.message || 'Error starting tour';
            this.showError(errorMsg);
          }
        });
      },
      error: (err) => {
        this.startingTourId = null;
        console.error('[Start Tour] ❌ Position error:', err);
        this.showError('Cannot start: Failed to get your location.');
      }
    });
  }

  getDifficultyLabel(difficulty: string): string {
    return difficulty;
  }

  // Vraćena metoda za labelu statusa
  getStatusLabel(status: TourStatus): string {
    switch (status) {
      case TourStatus.Published:
        return 'Published';
      case TourStatus.Archived:
        return 'Archived';
      case TourStatus.Draft:
        return 'Draft';
      default:
        return 'Published'; // Fallback posto koristimo preview endpoint
    }
  }

  isStartingTour(tourId: number): boolean {
    return this.startingTourId === tourId;
  }

  toggleReviews(tourId: number): void {
    if (this.expandedTourId === tourId) {
      this.expandedTourId = null;
    } else {
      this.expandedTourId = tourId;
    }
  }

  getStarArray(rating: number): boolean[] {
    const fullStars = Math.floor(rating);
    return Array(5).fill(false).map((_, i) => i < fullStars);
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