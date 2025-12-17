import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { TourService } from '../../tour-authoring/tour.service';
import { KeyPointService } from '../../tour-authoring/key-points/key-point.service';
import { TourExecution, LocationCheckDto, KeyPointWithStatus } from '../model/tour-execution.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { KeyPoint } from '../../tour-authoring/key-points/model/key-point.model';
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

  // ✅ DODAJ OVO - KeyPoints sa statusom completion
  keyPointsWithStatus: KeyPointWithStatus[] = [];

  // Map data
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
  console.log('[Active Tour] 🔄 Loading tour details for ID:', tourId);
  
  this.tourService.getTourDetails(tourId).subscribe({
    next: (tourDetails: any) => {
      console.log('[Active Tour] ✅ Loaded tour details:', tourDetails);
      
      this.tour = {
        id: tourDetails.id,
        name: tourDetails.name,
        description: tourDetails.description,
        difficulty: tourDetails.difficulty,
        status: tourDetails.status,
        price: tourDetails.price,
        distanceInKm: tourDetails.length || 0,
        authorId: 0,
        createdAt: new Date(),
        tags: tourDetails.tags || [],
        equipment: [],
        tourDurations: []
      } as Tour; // dodato  as Tour

      console.log('[Active Tour] ✅ Mapped tour:', this.tour);
      this.loadKeyPoints(tourId);
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error loading tour details:', err);
      this.isLoading = false;
      this.snackBar.open('Failed to load tour details', 'Close', {
        duration: 5000,
        panelClass: ['error-snackbar']
      });
    }
  });
}

 loadKeyPoints(tourId: number): void {
  console.log('[Active Tour] 🔄 Loading key points for tour:', tourId);

  this.keyPointService.getAll(tourId, 0, 100).subscribe({
    next: (response) => {
      console.log('[Active Tour] 📦 Raw KeyPoints response:', response);

      if (!response || !response.results) {
        console.error('[Active Tour] ❌ Invalid response structure');
        this.keyPoints = [];
        this.isLoading = false;
        return;
      }

      this.keyPoints = response.results.sort((a, b) => a.id - b.id);
      console.log('[Active Tour] ✅ Loaded key points:', this.keyPoints);

      if (this.keyPoints.length === 0) {
        console.warn('[Active Tour] ⚠️ No key points found');
        this.isLoading = false;
        return;
      }

      // ✅ DODAJ OVO - Pronađi sledeću nekompletiranu KeyPoint
      this.nextKeyPoint = this.findNextKeyPoint();
      console.log('[Active Tour] 🎯 Next key point:', this.nextKeyPoint);

      // ✅ Kreiraj KeyPoints sa statusom
      this.updateKeyPointsWithStatus();

      this.setupMapRoute();
      this.isLoading = false;
      this.startLocationCheck();
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error loading key points:', err);
      this.keyPoints = [];
      this.isLoading = false;
    }
  });
}
  // ✅ NOVA METODA - Pronađi sledeću nekompletiranu KeyPoint
private findNextKeyPoint(): KeyPoint | null {
  if (!this.execution || !this.keyPoints.length) return null;

  // Pronađi prvu KeyPoint koja NIJE u CompletedKeyPoints
  const completedIds = this.execution.completedKeyPoints?.map(c => c.keyPointId) || [];
  
  const next = this.keyPoints.find(kp => !completedIds.includes(kp.id));
  
  return next || null;
}

// ✅ AŽURIRAJ OVU METODU
private updateKeyPointsWithStatus(): void {
  if (!this.execution || !this.keyPoints.length) return;

  const completedIds = this.execution.completedKeyPoints?.map(c => c.keyPointId) || [];
  
  console.log('[Active Tour] 🔍 Completed IDs from backend:', completedIds);

  this.keyPointsWithStatus = this.keyPoints.map(kp => {
    const completion = this.execution!.completedKeyPoints?.find(c => c.keyPointId === kp.id);
    
    return {
      id: kp.id,
      name: kp.name,
      description: kp.description,
      imageUrl: kp.imageUrl,
      secret: kp.secret,
      latitude: kp.latitude,
      longitude: kp.longitude,
      isCompleted: !!completion,
      completedAt: completion?.completedAt
    };
  });

  console.log('[Active Tour] 🔓 KeyPoints with status:', this.keyPointsWithStatus);
}

private setupMapRoute(): void {
  if (!this.execution) {
    console.error('[Active Tour] ❌ Cannot setup route - missing execution');
    return;
  }

  console.log('[Active Tour] 🗺️ Setting up map route...');

  // ✅ Dobavi trenutnu poziciju turiste
  this.positionSimulator.getCurrentPosition().subscribe({
    next: (currentPosition) => {
      const touristLat = currentPosition.latitude || this.execution!.startLatitude;
      const touristLng = currentPosition.longitude || this.execution!.startLongitude;

      // ✅ Ako ima NEXT KeyPoint, crtaj putanju
      if (this.nextKeyPoint) {
        this.routeWaypoints = [
          { lat: touristLat, lng: touristLng },
          { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude }
        ];
      } else {
        // ✅ Sve tačke completirane - nema putanje
        this.routeWaypoints = [];
      }

      // ✅ PRIKAŽI SVE MARKERE sa pravilnim bojama
      this.routePoints = [
        {
          lat: touristLat,
          lng: touristLng,
          name: '📍 Your Current Position'
        },
        ...this.keyPoints.map(kp => {
          const isCompleted = this.execution!.completedKeyPoints?.some(c => c.keyPointId === kp.id);
          const isNext = this.nextKeyPoint?.id === kp.id;

          let icon = '⚪'; // Locked (sivo)
          if (isCompleted) icon = '✅'; // Completed (zeleno)
          else if (isNext) icon = '🎯'; // Next (crveno)

          return {
            lat: kp.latitude,
            lng: kp.longitude,
            name: `${icon} ${kp.name}`
          };
        })
      ];

      console.log('[Active Tour] ✅ Map updated with tourist position and route to NEXT');
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Failed to get current position:', err);
      // Fallback: koristi početnu poziciju
      this.setupMapRouteFallback();
    }
  });
}

// ✅ FALLBACK ako Position Simulator ne radi
private setupMapRouteFallback(): void {
  if (!this.execution) return;

  if (this.nextKeyPoint) {
    this.routeWaypoints = [
      { lat: this.execution.startLatitude, lng: this.execution.startLongitude },
      { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude }
    ];
  } else {
    this.routeWaypoints = [];
  }

  this.routePoints = [
    {
      lat: this.execution.startLatitude,
      lng: this.execution.startLongitude,
      name: '📍 Your Start Position'
    },
    ...this.keyPoints.map(kp => {
      const isCompleted = this.execution!.completedKeyPoints?.some(c => c.keyPointId === kp.id);
      const isNext = this.nextKeyPoint?.id === kp.id;

      let icon = '⚪';
      if (isCompleted) icon = '✅';
      else if (isNext) icon = '🎯';

      return {
        lat: kp.latitude,
        lng: kp.longitude,
        name: `${icon} ${kp.name}`
      };
    })
  ];
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

        // ✅ AŽURIRAJ MAPU SA TRENUTNOM POZICIJOM (bez čekanja backend response)
        this.updateMapWithCurrentPosition(position.latitude, position.longitude);

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
            this.showKeyPointUnlocked(result.completedKeyPointId, result.totalCompletedKeyPoints);
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

// ✅ NOVA METODA: Ažuriraj mapu sa trenutnom pozicijom turiste
private updateMapWithCurrentPosition(lat: number, lng: number): void {
  if (!this.execution || !this.nextKeyPoint) return;

  // Ažuriraj putanju da ide od trenutne pozicije do NEXT
  this.routeWaypoints = [
    { lat, lng },
    { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude }
  ];

  // Ažuriraj marker za trenutnu poziciju
  this.routePoints = [
    {
      lat,
      lng,
      name: '📍 Your Current Position'
    },
    ...this.keyPoints.map(kp => {
      const isCompleted = this.execution!.completedKeyPoints?.some(c => c.keyPointId === kp.id);
      const isNext = this.nextKeyPoint?.id === kp.id;

      let icon = '⚪';
      if (isCompleted) icon = '✅';
      else if (isNext) icon = '🎯';

      return {
        lat: kp.latitude,
        lng: kp.longitude,
        name: `${icon} ${kp.name}`
      };
    })
  ];

  console.log('[Active Tour] 🗺️ Map updated with tourist position:', { lat, lng });
}

  private stopLocationCheck(): void {
    if (this.locationCheckSubscription) {
      this.locationCheckSubscription.unsubscribe();
      this.locationCheckSubscription = null;
      console.log('[Active Tour] ⏹️ Location check stopped');
    }
  }

  private refreshExecution(): void {
  console.log('[Active Tour] 🔄 Refreshing execution from backend...');
  
  this.tourExecutionService.getActiveTourExecution().subscribe({
    next: (execution) => {
      if (execution) {
        console.log('[Active Tour] ✅ Execution refreshed:', execution);
        console.log('[Active Tour] 📊 CompletedKeyPoints from backend:', execution.completedKeyPoints);
        
        this.execution = execution;
        
        // ✅ AŽURIRAJ KeyPoints SA STATUSOM
        this.updateKeyPointsWithStatus();
        
        // ✅ AŽURIRAJ NEXT KEYPOINT
        const previousNext = this.nextKeyPoint?.id;
        this.nextKeyPoint = this.findNextKeyPoint();
        console.log('[Active Tour] 🎯 New next KeyPoint:', this.nextKeyPoint);
        
        // ✅ AŽURIRAJ MAPU SAMO AKO SE NEXT KEYPOINT PROMENIO
        if (this.nextKeyPoint && this.nextKeyPoint.id !== previousNext) {
          console.log('[Active Tour] 🗺️ Next KeyPoint changed - updating route from start to:', this.nextKeyPoint.name);
          this.setupMapRoute();
        } else if (!this.nextKeyPoint) {
          // ✅ SVE TAČKE KOMPLETOVANE - Očisti PUTANJU (ali ostavi markere)
          console.log('[Active Tour] ✅ All KeyPoints completed - clearing route');
          this.routeWaypoints = [];
          // routePoints ostaju - prikazuju se svi markeri
        }
      }
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error refreshing execution:', err);
    }
  });
}

  // ✅ NOVA METODA - Prikazuje unlock notifikaciju
  private showKeyPointUnlocked(keyPointId: number, totalCompleted: number): void {
    const keyPoint = this.keyPoints.find(kp => kp.id === keyPointId);
    
    if (!keyPoint) return;

    this.snackBar.open(
      `🔓 "${keyPoint.name}" unlocked! Total: ${totalCompleted}`,
      'View Secret',
      {
        duration: 8000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'top'
      }
    ).onAction().subscribe(() => {
      // Scroll to KeyPoint u listi
      this.scrollToKeyPoint(keyPointId);
    });
  }

  // ✅ NOVA METODA - Scroll do KeyPoint u listi
  private scrollToKeyPoint(keyPointId: number): void {
    const element = document.getElementById(`keypoint-${keyPointId}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      element.classList.add('highlight-keypoint');
      setTimeout(() => element.classList.remove('highlight-keypoint'), 2000);
    }
  }

  completeTour(): void {
    if (!confirm('Are you sure you want to complete this tour?')) return;

    this.stopLocationCheck();

    this.tourExecutionService.completeTour().subscribe({
      next: (completed) => {
        console.log('[Active Tour] ✅ Tour completed:', completed);
        this.execution = completed;

        const completionTime = new Date(completed.completionTime!).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        this.snackBar.open(
          `🎉 Tour completed at ${completionTime}!`,
          'Close',
          {
            duration: 5000,
            panelClass: ['success-snackbar']
          }
        );

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
        this.execution = abandoned;

        const abandonTime = new Date(abandoned.abandonTime!).toLocaleString('en-US', {
          dateStyle: 'medium',
          timeStyle: 'short'
        });

        this.snackBar.open(
          `⚠️ Tour abandoned at ${abandonTime}`,
          'Close',
          {
            duration: 5000,
            panelClass: ['warning-snackbar']
          }
        );

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
  
  // ✅ Parsuj datum i dodaj 1h (UTC+1 za Srbiju)
  const date = new Date(this.execution.startTime);
  date.setHours(date.getHours() + 1);  // Dodaj 1h za UTC+1
  
  return date.toLocaleString('sr-RS', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });
}

getFormattedLastActivity(): string {
  if (!this.execution?.lastActivity) return 'Never';
  
  return new Date(this.execution.lastActivity).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Belgrade'  // ✅ Eksplicitno postavi Beograd timezone
  });
}

 getFormattedCompletedAt(completedAt?: Date): string {
  if (!completedAt) return '';
  
  return new Date(completedAt).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Belgrade'  // ✅ Eksplicitno postavi Beograd timezone
  });
}
    canCompleteTour(): boolean {
      if (!this.execution || !this.keyPoints.length) return false;
      
      const totalKeyPoints = this.keyPoints.length;
      const completedCount = this.execution.completedKeyPoints?.length || 0;
      
      return completedCount === totalKeyPoints;
  }
  getNextKeyPointName(): string {
    return this.nextKeyPoint?.name || 'N/A';
  }

  getTotalKeyPoints(): number {
    return this.keyPoints.length;
  }

  getCompletedKeyPointsCount(): number {
    return this.keyPointsWithStatus.filter(kp => kp.isCompleted).length;
  }
}