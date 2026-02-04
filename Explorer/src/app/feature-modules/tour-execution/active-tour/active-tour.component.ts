import { Component, OnInit, OnDestroy } from '@angular/core';
import { Router } from '@angular/router';
import { TourExecutionService } from '../tour-execution.service';
import { TourService } from '../../tour-authoring/tour.service';
import { KeyPointService } from '../../tour-authoring/key-points/key-point.service';
import { TourExecution, LocationCheckDto, KeyPointWithStatus } from '../model/tour-execution.model';
import { Tour } from '../../tour-authoring/model/tour.model';
import { KeyPoint } from '../../tour-authoring/key-points/model/key-point.model';
import { interval, Subscription, forkJoin } from 'rxjs';
import { switchMap } from 'rxjs/operators';
import { PositionSimulatorService } from 'src/app/shared/position-simulator/position-simulator.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { TouristMapService, TouristPositionDto } from '../../layout/tourist-map/tourist-map.service';
import { FacilityService } from '../../administration/facility.service';
import { Facility } from '../../administration/model/facility.model';
import { GroupTourSessionService } from '../group-tour-session.service';
import { GroupTourSessionParticipantDto } from '../model/group-tour-session.model';

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

  //  KeyPoints sa statusom completion
  keyPointsWithStatus: KeyPointWithStatus[] = [];

  // Map data
  routeWaypoints: { lat: number; lng: number, iconUrl? : string }[] = [];
  routePoints: { lat: number; lng: number; name?: string; iconUrl? : string; color?: string; id?: number }[] = [];

  // Restaurants
  nearbyRestaurants: Facility[] = [];
  restaurantPoints: { lat: number; lng: number; name?: string; iconUrl?: string; color?: string; id?: number }[] = [];

  // Group session participants
  groupSessionParticipants: GroupTourSessionParticipantDto[] = [];
  groupSessionParticipantPoints: { lat: number; lng: number; name?: string; iconUrl?: string; color?: string; id?: number }[] = [];

  private locationCheckSubscription: Subscription | null = null;
  lastCheckTime: Date | null = null;
  isCheckingLocation = false;
  // Position Simulator state
  tempSelectedPosition: { lat: number; lng: number } | null = null;
  currentTouristPosition: { lat: number; lng: number } | undefined;

  // Premium unlock: key point IDs for which user paid AC to see detailed info (secret). Persisted in localStorage.
  unlockedDetailSecrets: Record<number, string> = {};
  unlockDetailsLoadingId: number | null = null;
  readonly UNLOCK_DETAIL_COST_AC = 5;

  // Omiljena ključna tačka (srce) – jedna po turi, čuvana u localStorage.
  favouriteKeyPointId: number | null = null;

  // "Blizu si!" – prikaži jednom po key point kada je korisnik unutar BLIZU_SI_RADIUS_METERS (veće od otključavanja na 200 m).
  private blizuSiShownForKeyPointIds = new Set<number>();
  private readonly UNLOCK_RADIUS_METERS = 200;   // mora odgovarati backend TourExecution.KeyPointUnlockRadiusMeters
  private readonly BLIZU_SI_RADIUS_METERS = 350;  // obaveštenje na većem pragu od otključavanja

  constructor(
    private tourExecutionService: TourExecutionService,
    private tourService: TourService,
    private keyPointService: KeyPointService,
    private router: Router,
    private positionSimulator: PositionSimulatorService,
    private snackBar: MatSnackBar,
    private touristMapService: TouristMapService,
    private facilityService: FacilityService,
    private groupTourSessionService: GroupTourSessionService
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
      this.loadUnlockedDetailsFromStorage(tourId);
      this.loadFavouriteFromStorage(tourId);
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

      this.nextKeyPoint = this.findNextKeyPoint();
      console.log('[Active Tour] 🎯 Next key point:', this.nextKeyPoint);

      this.updateKeyPointsWithStatus();

      // Ucitaj restorane u blizini svih keypointova
      this.loadNearbyRestaurants();
      this.loadGroupSessionParticipants();

      this.positionSimulator.getCurrentPosition().subscribe({
        next: (currentPosition) => {
          const touristLat = currentPosition.latitude || this.execution!.startLatitude;
          const touristLng = currentPosition.longitude || this.execution!.startLongitude;

          this.currentTouristPosition = {
            lat: touristLat,
            lng: touristLng
          };

          console.log('[Active Tour] ✅ Initial position set:', this.currentTouristPosition);

          this.setupMapRoute();

          setTimeout(() => {
            this.isLoading = false;
            console.log('[Active Tour] ✅ Map rendered - drag should work now');
            this.startLocationCheck();
          }, 100);
        },
        error: (err) => {
          console.error('[Active Tour] ❌ Failed to get initial position:', err);
          
          this.currentTouristPosition = {
            lat: this.execution!.startLatitude,
            lng: this.execution!.startLongitude
          };
          
          this.setupMapRoute();
          
          setTimeout(() => {
            this.isLoading = false;
            this.startLocationCheck();
          }, 100);
        }
      });
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

  const unlockedSecrets = this.unlockedDetailSecrets;
  this.keyPointsWithStatus = this.keyPoints.map(kp => {
    const completion = this.execution!.completedKeyPoints?.find(c => c.keyPointId === kp.id);
    const detailsUnlockedWithAc = !!unlockedSecrets[kp.id];
    const secretToShow = completion ? kp.secret : (unlockedSecrets[kp.id] ?? '');
    return {
      id: kp.id,
      name: kp.name,
      description: kp.description,
      imageUrl: kp.imageUrl,
      secret: secretToShow || kp.secret,
      latitude: kp.latitude,
      longitude: kp.longitude,
      isCompleted: !!completion,
      completedAt: completion?.completedAt,
      detailsUnlockedWithAc
    };
  });

  console.log('[Active Tour] 🔓 KeyPoints with status:', this.keyPointsWithStatus);
}

  private loadUnlockedDetailsFromStorage(tourId: number): void {
    const key = `unlocked_keypoints_${tourId}`;
    try {
      const raw = localStorage.getItem(key);
      if (raw) {
        const arr = JSON.parse(raw) as { keyPointId: number; secret: string }[];
        this.unlockedDetailSecrets = (arr || []).reduce((acc, x) => {
          acc[x.keyPointId] = x.secret;
          return acc;
        }, {} as Record<number, string>);
      } else {
        this.unlockedDetailSecrets = {};
      }
    } catch {
      this.unlockedDetailSecrets = {};
    }
  }

  private saveUnlockedDetailsToStorage(tourId: number): void {
    const key = `unlocked_keypoints_${tourId}`;
    const arr = Object.entries(this.unlockedDetailSecrets).map(([id, secret]) => ({
      keyPointId: +id,
      secret
    }));
    localStorage.setItem(key, JSON.stringify(arr));
  }

  private loadFavouriteFromStorage(tourId: number): void {
    const key = `favourite_keypoint_${tourId}`;
    try {
      const raw = localStorage.getItem(key);
      this.favouriteKeyPointId = raw ? +raw : null;
    } catch {
      this.favouriteKeyPointId = null;
    }
  }

  private saveFavouriteToStorage(tourId: number): void {
    const key = `favourite_keypoint_${tourId}`;
    if (this.favouriteKeyPointId == null) {
      localStorage.removeItem(key);
    } else {
      localStorage.setItem(key, String(this.favouriteKeyPointId));
    }
  }

  toggleFavourite(kp: KeyPointWithStatus): void {
    if (!this.execution) return;
    const tourId = this.execution.tourId;
    if (this.favouriteKeyPointId === kp.id) {
      this.favouriteKeyPointId = null;
      this.snackBar.open('Removed from favourites', 'OK', { duration: 2000, panelClass: ['info-snackbar'] });
    } else {
      this.favouriteKeyPointId = kp.id;
      this.snackBar.open('"' + kp.name + '" is now your highlight', 'OK', { duration: 2500, panelClass: ['info-snackbar'] });
    }
    this.saveFavouriteToStorage(tourId);
  }

  isFavourite(keyPointId: number): boolean {
    return this.favouriteKeyPointId === keyPointId;
  }

  getFavouriteKeyPointName(): string | null {
    if (this.favouriteKeyPointId == null) return null;
    const kp = this.keyPointsWithStatus.find(k => k.id === this.favouriteKeyPointId);
    return kp ? kp.name : null;
  }

  unlockKeyPointDetails(kp: KeyPointWithStatus): void {
    if (kp.isCompleted || kp.detailsUnlockedWithAc || this.unlockDetailsLoadingId !== null) return;
    this.unlockDetailsLoadingId = kp.id;
    this.tourExecutionService.unlockKeyPointDetails(kp.id).subscribe({
      next: (result) => {
        this.unlockedDetailSecrets[kp.id] = result.secret;
        if (this.execution) this.saveUnlockedDetailsToStorage(this.execution.tourId);
        this.updateKeyPointsWithStatus();
        this.unlockDetailsLoadingId = null;
        this.snackBar.open(
          `✨ Detailed info unlocked! (-${result.costAc} AC). Balance: ${result.newBalanceAc} AC`,
          'Close',
          { duration: 5000, panelClass: ['info-snackbar'] }
        );
      },
      error: (err) => {
        this.unlockDetailsLoadingId = null;
        const msg = err?.error?.message || 'Failed to unlock. Check your AC balance.';
        this.snackBar.open(msg, 'Close', { duration: 5000, panelClass: ['error-snackbar'] });
      }
    });
  }

// Ucitava restorane u blizini svih keypoint‑ova aktivne ture
private loadNearbyRestaurants(): void {
  if (!this.keyPoints.length) return;

  const requests = this.keyPoints.map(kp =>
    this.facilityService.getNearbyRestaurants(kp.latitude, kp.longitude)
  );

  forkJoin(requests).subscribe({
    next: (results) => {
      // results je niz nizova restaurana (po keypoint‑u)
      const all = results.flat();

      // Ukloni duplikate po id‑ju (restoran moze biti blizu vise keypoint‑ova)
      const byId = new Map<number, Facility>();
      all.forEach(r => {
        if (!byId.has(r.id)) {
          byId.set(r.id, r);
        }
      });

      this.nearbyRestaurants = Array.from(byId.values());

      this.restaurantPoints = this.nearbyRestaurants.map(r => ({
        lat: r.latitude,
        lng: r.longitude,
        name: `${r.name}`,
        color: 'green',
        iconUrl: 'assets/icons/fast-food.png',
        id: r.id
      }));

      // Osvezi markere na mapi (ruta ostaje ista)
      this.setupMapRoute();
    },
    error: (err) => {
    }
  });
}

private loadGroupSessionParticipants(): void {
    if (!this.execution) return;

    this.groupTourSessionService
      .getOtherGroupParticipantsByTouristId(this.execution.touristId)
      .subscribe({
        next: (participants) => {          
          const valid = (participants || []).filter(p => !!p.position);

          const byId = new Map<number, GroupTourSessionParticipantDto>();
          valid.forEach(p => {
            if (!byId.has(p.touristId)) {
              byId.set(p.touristId, p);
            }
          });

          this.groupSessionParticipants = Array.from(byId.values());

          this.groupSessionParticipantPoints = this.groupSessionParticipants.map(p => ({
            lat: p.position!.latitude,
            lng: p.position!.longitude,
            iconUrl: 'assets/icons/group-tourist.png',
            id: p.touristId
          }));

          this.setupMapRoute();
        },
        error: () => {          
        }
      });
}

private setupMapRoute(): void {
  if (!this.execution) {
    console.error('[Active Tour] ❌ Cannot setup route - missing execution');
    return;
  }

  console.log('[Active Tour] 🗺️ Setting up map route...');

  if (!this.currentTouristPosition) {
    console.error('[Active Tour] ❌ currentTouristPosition not set!');
    this.setupMapRouteFallback();
    return;
  }

  const touristLat = this.currentTouristPosition.lat;
  const touristLng = this.currentTouristPosition.lng;

  console.log('[Active Tour] ✅ Using existing tourist position:', this.currentTouristPosition);

  // ✅ Crtaj putanju do NEXT KeyPoint
  if (this.nextKeyPoint) {
    this.routeWaypoints = [
      { lat: touristLat, lng: touristLng, iconUrl: 'assets/icons/tourist.png' },
      { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude, iconUrl: 'assets/icons/checkpoint.png' }
    ];
  } else {
    this.routeWaypoints = [];
  }

  // ✅ KLJUČNO: routePoints sadrži SAMO KeyPoints (BEZ trenutne pozicije!)
  // ✅ NE PROVERAVAJ da li je KeyPoint === currentTouristPosition!
  //this.routePoints
  // Markeri za keypoint‑ove
  const keyPointMarkers = this.keyPoints.map(kp => {
  const isCompleted = this.execution!.completedKeyPoints?.some(c => c.keyPointId === kp.id);
  const isNext = this.nextKeyPoint?.id === kp.id;

  let icon = '⚪';
  if (isCompleted) icon = '✅';
  else if (isNext) icon = '🎯';

  return {
    lat: kp.latitude,
    lng: kp.longitude,
    name: `${icon} ${kp.name || 'Key Point'}`, // ✅ Fallback ako nema name
    iconUrl: 'assets/icons/checkpoint.png'
  };
});

  // Restorani kao dodatni markeri (narandzasta boja)
  const restaurantMarkers = this.restaurantPoints || [];
  const groupSessionParticipantMarkers = this.groupSessionParticipantPoints || [];

  this.routePoints = [...keyPointMarkers, ...restaurantMarkers, ...groupSessionParticipantMarkers];

  console.log('[Active Tour] 📍 Created routePoints:', this.routePoints.length, 'KeyPoints');
  console.log('[Active Tour] ✅ Map route setup complete');
  console.log('[Active Tour] 📊 RoutePoints (all KeyPoints):', this.routePoints.length);
}

private setupMapRouteFallback(): void {
  if (!this.execution) return;

  this.currentTouristPosition = {
    lat: this.execution.startLatitude,
    lng: this.execution.startLongitude
  };

  if (this.nextKeyPoint) {
    this.routeWaypoints = [
      { lat: this.execution.startLatitude, lng: this.execution.startLongitude },
      { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude }
    ];
  } else {
    this.routeWaypoints = [];
  }

  // ✅ ISTO: routePoints sadrži SAMO KeyPoints (BEZ trenutne pozicije!)
  //this.routePoints
  // Markeri za keypoint‑ove
  const keyPointMarkers = this.keyPoints.map(kp => {
        const isCompleted = this.execution!.completedKeyPoints?.some(c => c.keyPointId === kp.id);
        const isNext = this.nextKeyPoint?.id === kp.id;

        let icon = '⚪';
        if (isCompleted) icon = '✅';
        else if (isNext) icon = '🎯';

        return {
            lat: kp.latitude,
            lng: kp.longitude,
            name: `${icon} ${kp.name || 'Key Point'}`, // ✅ Fallback
            iconUrl: 'assets/icons/checkpoint.png'
        };
    });

      const restaurantMarkers = this.restaurantPoints || [];
      const groupSessionParticipantMarkers = this.groupSessionParticipantPoints || [];

      this.routePoints = [...keyPointMarkers, ...restaurantMarkers, ...groupSessionParticipantMarkers];

  console.log('[Active Tour] 📍 Created fallback routePoints:', this.routePoints.length, 'KeyPoints');
  console.log('[Active Tour] ✅ Fallback route setup complete');
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

        // AŽURIRANJE MAPE SA TRENUTNOM POZICIJOM 
        this.updateMapWithCurrentPosition(position.latitude, position.longitude);

        
        this.loadGroupSessionParticipants();

        this.maybeShowBlizuSi(position.latitude, position.longitude);

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
    
    //  PROGRESS PERCENTAGE 
    this.execution.progressPercentage = result.progressPercentage;
    console.log('[Location Check] 📊 Progress updated to:', this.execution.progressPercentage);

    if (result.keyPointCompleted && result.completedKeyPointId) {
      // DODAJEM KOMPLETIRANU KEYPOINT U LISTU ODMAH 
      const newCompletion = {
        keyPointId: result.completedKeyPointId,
        completedAt: new Date()
      };
      this.execution.completedKeyPoints.push(newCompletion);
      
      this.updateKeyPointsWithStatus();
      this.nextKeyPoint = this.findNextKeyPoint();
      this.setupMapRoute();
      
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

private updateMapWithCurrentPosition(lat: number, lng: number): void {
  if (!this.execution) return;

  const roundedLat = Math.round(lat * 1000000) / 1000000;
  const roundedLng = Math.round(lng * 1000000) / 1000000;

  // ✅ UVEK AŽURIRAJ currentTouristPosition
  this.currentTouristPosition = {
    lat: roundedLat,
    lng: roundedLng
  };

  // ✅ AŽURIRAJ PUTANJU
  if (this.nextKeyPoint) {
    this.routeWaypoints = [
      { lat: roundedLat, lng: roundedLng },
      { lat: this.nextKeyPoint.latitude, lng: this.nextKeyPoint.longitude }
    ];
  }

  console.log('[Active Tour] 🗺️ Map updated with tourist position:', this.currentTouristPosition);
}

  /** Haversine: rastojanje u metrima između dve GPS tačke. */
  private haversineDistanceMeters(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371000; // radijus Zemlje u m
    const toRad = (deg: number) => (deg * Math.PI) / 180;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /** Prikaži "Blizu si!" jednom po sledećoj key point kada je korisnik unutar BLIZU_SI_RADIUS_METERS ali još van UNLOCK_RADIUS_METERS. */
  private maybeShowBlizuSi(lat: number, lng: number): void {
    if (!this.nextKeyPoint) return;
    const keyPointId = this.nextKeyPoint.id;
    if (this.blizuSiShownForKeyPointIds.has(keyPointId)) return;

    const distance = this.haversineDistanceMeters(lat, lng, this.nextKeyPoint.latitude, this.nextKeyPoint.longitude);
    if (distance > this.UNLOCK_RADIUS_METERS && distance <= this.BLIZU_SI_RADIUS_METERS) {
      this.blizuSiShownForKeyPointIds.add(keyPointId);
      this.snackBar.open(
        `Blizu si! Još malo do sledeće tačke: "${this.nextKeyPoint.name}".`,
        'OK',
        { duration: 5000, panelClass: ['info-snackbar'], horizontalPosition: 'center', verticalPosition: 'top' }
      );
    }
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
        
        //  KeyPoints SA STATUSOM
        this.updateKeyPointsWithStatus();
        
        //  NEXT KEYPOINT
        const previousNext = this.nextKeyPoint?.id;
        this.nextKeyPoint = this.findNextKeyPoint();
        console.log('[Active Tour] 🎯 New next KeyPoint:', this.nextKeyPoint);
        
        //  AŽURIRAJ MAPU SAMO AKO SE NEXT KEYPOINT PROMENIO
        if (this.nextKeyPoint && this.nextKeyPoint.id !== previousNext) {
          console.log('[Active Tour] 🗺️ Next KeyPoint changed - updating route from start to:', this.nextKeyPoint.name);
          this.setupMapRoute();
        } else if (!this.nextKeyPoint) {
          //  SVE TAČKE KOMPLETOVANE - Očisti PUTANJU (ali ostavi markere)
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

  //  Prikazuje unlock notifikaciju
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

  //  Scroll do KeyPoint u listi
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
  
  //  Parsuj datum i dodaj 1h (UTC+1 za Srbiju)
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
    timeZone: 'Europe/Belgrade'  
  });
}

 getFormattedCompletedAt(completedAt?: Date): string {
  if (!completedAt) return '';
  
  return new Date(completedAt).toLocaleTimeString('sr-RS', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    timeZone: 'Europe/Belgrade'  
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

  // ============================================================================
// POSITION SIMULATOR
// ============================================================================

onMapClick(point: { lat: number; lng: number }): void {
  console.log('[Active Tour] 📍 Map point selected (click or drag):', point);
  this.tempSelectedPosition = point;
  this.updateMapWithCurrentPosition(point.lat, point.lng);
  
  // ✅ Obavesti korisnika da je pozicija spremna
  this.snackBar.open('📍 Position ready - click "Save my position"', '', {
    duration: 2000,
    panelClass: ['info-snackbar'],
    horizontalPosition: 'center',
    verticalPosition: 'bottom'
  });
}


savePosition(): void {
  if (!this.tempSelectedPosition) {
    this.snackBar.open('⚠️ Please click or drag the marker first', 'Close', {
      duration: 3000,
      panelClass: ['error-snackbar']
    });
    return;
  }

  const dto: TouristPositionDto = {
    touristId: 0,
    latitude: this.tempSelectedPosition.lat,
    longitude: this.tempSelectedPosition.lng
  };

  this.touristMapService.updateMyPosition(dto).subscribe({
    next: () => {
      this.snackBar.open('✅ Position saved successfully!', 'Close', {
        duration: 3000,
        panelClass: ['success-snackbar'],
        horizontalPosition: 'center',
        verticalPosition: 'bottom'
      });

      this.tempSelectedPosition = null;
    },
    error: (err) => {
      console.error('[Active Tour] ❌ Error saving position:', err);
      this.snackBar.open('❌ Failed to save position', 'Close', {
        duration: 3000,
        panelClass: ['error-snackbar']
      });
    }
  });
}
}