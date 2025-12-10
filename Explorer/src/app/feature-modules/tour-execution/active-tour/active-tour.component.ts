import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { TourService } from '../../tour-authoring/tour.service';
import { KeyPointService } from '../../tour-authoring/key-points/key-point.service';
import { KeyPoint } from '../../tour-authoring/key-points/model/key-point.model';
import { TourExecution, LocationCheckDto } from '../model/tour-execution.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { interval, Subscription } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'xp-active-tour',
  templateUrl: './active-tour.component.html',
  styleUrls: ['./active-tour.component.css']
})
export class ActiveTourComponent implements OnInit, OnDestroy {
  isLoading = true;
  execution: TourExecution | null = null;
  tour: Tour | null = null;
  keyPoints: KeyPoint[] = [];
  nextKeyPoint: KeyPoint | null = null;

  // Map data - za route-view mode
  routeWaypoints: { lat: number; lng: number }[] = [];
  routePoints: { lat: number; lng: number; name?: string }[] = [];

  private locationCheckSubscription: Subscription | null = null;
  lastCheckTime: Date | null = null;
  isCheckingLocation = false;

  constructor(
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private keyPointService: KeyPointService,
    private router: Router,
    private positionSimulator: PositionSimulatorService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.loadActiveExecution();
  }

  ngOnDestroy(): void {
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

        console.log('[Active Tour] ✅ Loaded execution:', execution);
        this.execution = execution;
        this.loadTourDetails(execution.tourId);
      },
      error: (err) => {
        console.error('[Active Tour] ❌ Error:', err);
        this.isLoading = false;
        this.router.navigate(['/tourist/tours']);
      }
    });
  }

  loadTourDetails(tourId: number): void {
    this.tourService.getPublishedToursForTourist().subscribe({
      next: (tours) => {
        this.tour = tours.find(t => t.id === tourId) || null;

        if (!this.tour) {
          console.error('[Active Tour] ❌ Tour not found');
          this.isLoading = false;
          return;
        }

        console.log('[Active Tour] ✅ Loaded tour:', this.tour);
        this.loadKeyPoints(tourId);
      },
      error: (err) => {
        console.error('[Active Tour] ❌ Error loading tours:', err);
        this.isLoading = false;
      }
    });
  }

  loadKeyPoints(tourId: number): void {
  console.log('[Active Tour] 🔄 Loading key points for tour:', tourId);
  
  this.keyPointService.getAll(tourId, 0, 100).subscribe({
    next: (response) => {
      console.log('[Active Tour] 📦 Raw response:', response);
      
      // Proveri da li response ima results
      if (!response || !response.results) {
        console.error('[Active Tour] ❌ Invalid response structure:', response);
        this.keyPoints = [];
        this.isLoading = false;
        return;
      }

      // Sortiraj KeyPoints po ID-u
      this.keyPoints = response.results.sort((a, b) => a.id - b.id);
      console.log('[Active Tour] ✅ Loaded key points:', this.keyPoints);
      console.log('[Active Tour] 📊 Total key points:', this.keyPoints.length);

      // Proveri da li ima KeyPoints
      if (this.keyPoints.length === 0) {
        console.warn('[Active Tour] ⚠️ No key points found for this tour');
        this.isLoading = false;
        return;
      }

      // Postavi prvu KeyPoint kao "next"
      this.nextKeyPoint = this.keyPoints[0];
      console.log('[Active Tour] 🎯 Next key point:', this.nextKeyPoint);

      // Postavi rutu na mapi
      this.setupMapRoute();

      this.isLoading = false;
      this.startLocationCheck();
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error loading key points:', err);
      console.error('[Active Tour] ❌ Error details:', {
        status: err.status,
        message: err.message,
        error: err.error
      });
      this.keyPoints = [];
      this.isLoading = false;
    }
  });
}

  private setupMapRoute(): void {
  if (!this.execution || !this.nextKeyPoint) {
    console.error('[Active Tour] ❌ Cannot setup route - missing execution or nextKeyPoint');
    return;
  }

  console.log('[Active Tour] 🗺️ Setting up map route...');
  console.log('[Active Tour] 📍 Start position:', {
    lat: this.execution.startLatitude,
    lng: this.execution.startLongitude
  });
  console.log('[Active Tour] 🎯 Next key point:', {
    lat: this.nextKeyPoint.latitude,
    lng: this.nextKeyPoint.longitude,
    name: this.nextKeyPoint.name
  });

  // RUTA: Pozicija turiste → Prva KeyPoint (za routing liniju)
  this.routeWaypoints = [
    { 
      lat: this.execution.startLatitude, 
      lng: this.execution.startLongitude 
    },
    { 
      lat: this.nextKeyPoint.latitude, 
      lng: this.nextKeyPoint.longitude 
    }
  ];

  // MARKERI: Pozicija turiste + SVE KeyPoints (za prikaz na mapi)
  this.routePoints = [
    {
      lat: this.execution.startLatitude,
      lng: this.execution.startLongitude,
      name: '📍 Your Start Position'
    },
    ...this.keyPoints.map(kp => ({
      lat: kp.latitude,
      lng: kp.longitude,
      name: `🎯 ${kp.name}`
    }))
  ];

  console.log('[Active Tour] 🗺️ Route waypoints:', this.routeWaypoints);
  console.log('[Active Tour] 📍 Route points:', this.routePoints);
  console.log('[Active Tour] ✅ Map route setup complete');
}
  private startLocationCheck(): void {
    if (!this.execution) return;

    console.log('[Active Tour] ✅ Starting location check every 10 seconds');

    this.locationCheckSubscription = interval(10000)
      .pipe(
        switchMap(() => {
          this.isCheckingLocation = true;
          this.lastCheckTime = new Date();
          console.log('[Location Check] 🔄 Triggered at:', this.lastCheckTime.toLocaleTimeString());
          return this.positionSimulator.getCurrentPosition();
        }),
        switchMap((position) => {
          if (position.source === 'none' || position.latitude === 0 || position.longitude === 0) {
            console.log('[Location Check] ❌ No position available');
            this.isCheckingLocation = false;
            throw new Error('No position available');
          }

          console.log('[Location Check] 📍 Current position:', position);

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

          if (this.execution) {
            this.execution.lastActivity = result.lastActivity;

            if (result.keyPointCompleted && result.completedKeyPointId) {
              this.showKeyPointCompleted(result.completedKeyPointId, result.totalCompletedKeyPoints);
              this.refreshExecution();
            }
          }
        },
        error: (err) => {
          this.isCheckingLocation = false;
          console.error('[Location Check] ❌ Error:', err);
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
      `🎉 Key Point completed! Total: ${totalCompleted}`,
      'Close',
      {
        duration: 5000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    );
  }
completeTour(): void {
  if (!confirm('Are you sure you want to complete this tour?')) return;

  this.stopLocationCheck();

  this.tourExecutionService.completeTour().subscribe({
    next: (completed) => {
      console.log('[Active Tour] ✅ Tour completed:', completed);
      
      // ✅ AŽURIRAJ EXECUTION SA PODACIMA SA BACKEND-A
      this.execution = completed;
      
      // ✅ FORMATIRAJ COMPLETION TIME
      const completionTime = new Date(completed.completionTime!).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      
      // ✅ PRIKAŽI SNACKBAR SA VREMENOM
      this.snackBar.open(
        `🎉 Tour completed at ${completionTime}!`,
        'Close',
        {
          duration: 5000,
          panelClass: ['success-snackbar']
        }
      );
      
      // ✅ REDIRECT POSLE 3 SEKUNDE (da korisnik vidi vreme)
      setTimeout(() => {
        this.router.navigate(['/tourist/tours']);
      }, 3000);
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error completing tour:', err);
      this.snackBar.open('❌ Failed to complete tour', 'Close', { duration: 3000 });
    }
  });
}

abandonTour(): void {
  if (!confirm('Are you sure you want to abandon this tour?')) return;

  this.stopLocationCheck();

  this.tourExecutionService.abandonTour().subscribe({
    next: (abandoned) => {
      console.log('[Active Tour] ⚠️ Tour abandoned:', abandoned);
      
      // ✅ AŽURIRAJ EXECUTION SA PODACIMA SA BACKEND-A
      this.execution = abandoned;
      
      // ✅ FORMATIRAJ ABANDON TIME
      const abandonTime = new Date(abandoned.abandonTime!).toLocaleString('en-US', {
        dateStyle: 'medium',
        timeStyle: 'short'
      });
      
      // ✅ PRIKAŽI SNACKBAR SA VREMENOM
      this.snackBar.open(
        `⚠️ Tour abandoned at ${abandonTime}`,
        'Close',
        {
          duration: 5000,
          panelClass: ['warning-snackbar']
        }
      );
      
      // ✅ REDIRECT POSLE 3 SEKUNDE
      setTimeout(() => {
        this.router.navigate(['/tourist/tours']);
      }, 3000);
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error abandoning tour:', err);
      this.snackBar.open('❌ Failed to abandon tour', 'Close', { duration: 3000 });
    }
  });
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

  getNextKeyPointName(): string {
    return this.nextKeyPoint?.name || 'N/A';
  }

  getTotalKeyPoints(): number {
    return this.keyPoints.length;
  }

  getFormattedCompletionTime(): string {
  if (!this.execution?.completionTime) return 'N/A';
  return new Date(this.execution.completionTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}

getFormattedAbandonTime(): string {
  if (!this.execution?.abandonTime) return 'N/A';
  return new Date(this.execution.abandonTime).toLocaleString('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short'
  });
}


}