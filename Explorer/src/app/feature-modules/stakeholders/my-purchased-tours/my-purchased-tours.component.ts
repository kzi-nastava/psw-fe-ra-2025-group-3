import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Tour, TourStatus } from 'src/app/feature-modules/tour-authoring/model/tour.model';
import { TourService } from 'src/app/feature-modules/tour-authoring/tour.service';
import { TourExecutionService } from '../../tour-execution/tour-execution.service';
import { TourExecutionCreateDto } from '../../tour-execution/model/tour-execution.model';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Component({
  selector: 'xp-my-purchased-tours',
  templateUrl: './my-purchased-tours.component.html',
  styleUrls: ['./my-purchased-tours.component.css']
})
export class MyPurchasedToursComponent implements OnInit {
  tours: Tour[] = [];
  isLoading = false;
  startingTourId: number | null = null;
  hasActiveTour = false;
  TourStatus = TourStatus;
  expandedTourId: number | null = null;
  currentUserId?: number;

  constructor(
    private tourService: TourService,
    private snackBar: MatSnackBar,
    private positionSimulator: PositionSimulatorService,
    private tourExecutionService: TourExecutionService,
    private router: Router,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.checkActiveTour();
    this.loadMyPurchasedTours();
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

  loadMyPurchasedTours(): void {
    this.isLoading = true;

    this.tourService.getMyPurchasedTours().subscribe({
      next: (tours: Tour[]) => {
        this.tours = tours;
        console.log('[My Purchased Tours] ✅ Loaded:', this.tours);
        this.isLoading = false;
      },
      error: (error: any) => {
        console.error('[My Purchased Tours] ❌ Error:', error);
        this.isLoading = false;
        this.showError('Error loading purchased tours');
      }
    });
  }

  startTour(tour: Tour): void {
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

  private proceedWithTourStart(tour: Tour): void {
    this.startingTourId = tour.id!;

    console.log('[Start Tour] Getting position...');

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

  viewDetails(tourId: number): void {
    this.router.navigate(['/tourist/tours', tourId, 'details']);
  }

  getStatusLabel(status: TourStatus): string {
    switch (status) {
      case TourStatus.Published:
        return 'Published';
      case TourStatus.Archived:
        return 'Archived';
      case TourStatus.Draft:
        return 'Draft';
      default:
        return 'Unknown';
    }
  }

  isStartingTour(tourId: number): boolean {
    return this.startingTourId === tourId;
  }

  expandReviews(tour: Tour): void {
    if (this.expandedTourId === tour.id) {
      this.expandedTourId = null;
    } else {
      this.expandedTourId = tour.id;
    }
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