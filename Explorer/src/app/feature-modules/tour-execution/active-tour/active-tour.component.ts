import { Component, OnInit, OnDestroy  } from '@angular/core';
import { Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { TourService } from '../../tour-authoring/tour.service';
import { TourExecution, LocationCheckDto  } from '../model/tour-execution.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { MatSnackBar } from '@angular/material/snack-bar'

@Component({
  selector: 'xp-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit, OnDestroy {
  isLoading = true;
  execution: TourExecution | null = null;
  tour: Tour | null = null;

  private locationCheckSubscription: Subscription | null = null;
  lastCheckTime: Date | null = null;
  isCheckingLocation = false;

  constructor(
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private router: Router,
    private positionSimulator: PositionSimulatorService,
    private snackBar: MatSnackBar,
  ) {}

  ngOnInit(): void {
    this.loadActiveExecution();
  }

   ngOnDestroy(): void {
    // Zaustavi interval kada se komponenta uništi
    this.stopLocationCheck();
  }

  loadActiveExecution(): void {
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (execution) => {
        if (!execution) {
          console.log('[Active Tour] No active execution, redirecting');
          this.router.navigate(['/tourist/tours']);
          return;
        }

        console.log('[Active Tour] Loaded execution:', execution);
        this.execution = execution;
        this.loadTourDetails(execution.tourId);

        // Pokreni periodičnu proveru lokacije
        this.startLocationCheck();
      },
      error: (err) => {
        console.error('[Active Tour] Error:', err);
        this.isLoading = false;
        this.router.navigate(['/tourist/tours']);
      }
    });
  }

  loadTourDetails(tourId: number): void {
    // Koristi Published Tours endpoint - Tourist ima pristup
    this.tourService.getPublishedToursForTourist().subscribe({
      next: (tours) => {
        this.tour = tours.find(t => t.id === tourId) || null;
        
        if (!this.tour) {
          console.error('[Active Tour] Tour not found');
        }
        
        this.isLoading = false;
      },
      error: (err) => {
        console.error('[Active Tour] Error loading tours:', err);
        this.isLoading = false;
      }
    });
  }

  private startLocationCheck(): void {
    if (!this.execution) return;

    console.log('[Active Tour] ✅ Starting location check every 10 seconds');

    // Interval od 10 sekundi (10000ms)
    this.locationCheckSubscription = interval(10000)
      .pipe(
        switchMap(() => {
          this.isCheckingLocation = true;
          this.lastCheckTime = new Date();
          
          console.log('[Location Check] 🔄 Triggered at:', this.lastCheckTime.toLocaleTimeString());
          
          // KORAK 1: Dobij trenutnu poziciju iz Position Simulatora
          return this.positionSimulator.getCurrentPosition();
        }),
        switchMap((position) => {
          if (position.source === 'none' || position.latitude === 0 || position.longitude === 0) {
            console.log('[Location Check] ❌ No position available');
            this.isCheckingLocation = false;
            throw new Error('No position available');
          }

          console.log('[Location Check] 📍 Current position:', position);

          // KORAK 2: Pošalji zahtev na backend sa trenutnom pozicijom
          const dto: LocationCheckDto = {
            tourId: this.execution!.tourId,
            currentLatitude: position.latitude,
            currentLongitude: position.longitude
          };

          return this.tourExecutionService.checkLocation(dto);
        })
      )
      .subscribe({
        next: (result) => {
          this.isCheckingLocation = false;
          console.log('[Location Check] ✅ Result:', result);

          // Ažuriraj TourExecution objekat
          if (this.execution) {
            this.execution.lastActivity = result.lastActivity;
            
            // Ako je KeyPoint kompletiran, prikaži notifikaciju
            if (result.keyPointCompleted && result.completedKeyPointId) {
              this.showKeyPointCompleted(result.completedKeyPointId, result.totalCompletedKeyPoints);
              
              // Reload execution da dobiješ ažurirani progressPercentage
              this.refreshExecution();
            }
          }
        },
        error: (err) => {
          this.isCheckingLocation = false;
          console.error('[Location Check] ❌ Error:', err);
          // Nastavi sa intervalima čak i ako ima grešku
        }
      });
  }

  private stopLocationCheck(): void {
    if (this.locationCheckSubscription) {
      this.locationCheckSubscription.unsubscribe();
      this.locationCheckSubscription = null;
      console.log('[Active Tour] ⏹️ Location check stopped');
    }
  }

  private refreshExecution(): void {
    // Ponovo učitaj TourExecution da dobiješ ažurirani progress
    this.tourExecutionService.getActiveTourExecution().subscribe({
      next: (execution) => {
        if (execution) {
          this.execution = execution;
          console.log('[Active Tour] 🔄 Execution refreshed, progress:', execution.progressPercentage + '%');
        }
      }
    });
  }

  private showKeyPointCompleted(keyPointId: number, totalCompleted: number): void {
    this.snackBar.open(
      `🎉 Key Point #${keyPointId} completed! Total: ${totalCompleted}`,
      'Close',
      {
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }

  getFormattedStartTime(): string {
    if (!this.execution) return '';
    return new Date(this.execution.startTime).toLocaleString('en-US', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }

    getFormattedLastActivity(): string {
    if (!this.execution?.lastActivity) return 'Never';
    return new Date(this.execution.lastActivity).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit'
    });
  }
}