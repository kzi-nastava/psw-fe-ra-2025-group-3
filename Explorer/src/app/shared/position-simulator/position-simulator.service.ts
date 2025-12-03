import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { TouristMapService, TouristPositionDto } from 'src/app/feature-modules/layout/tourist-map/tourist-map.service';

export interface PositionSimulatorResult {
  latitude: number;
  longitude: number;
  source: 'backend' | 'none';
}

@Injectable({
  providedIn: 'root'
})
export class PositionSimulatorService {
  constructor(private touristMapService: TouristMapService) {
    console.log('[Position Simulator] Service initialized');
  }

  /**
   * "Simulira" dobijanje GPS pozicije tako što poziva backend
   * koristi stvarnu turistovu poziciju iz TouristMapService
   */
  getCurrentPosition(): Observable<PositionSimulatorResult> {
    console.log('[Position Simulator] Fetching position from backend (TouristMapService)...');
    
    return this.touristMapService.getMyPosition().pipe(
      map((backendPos: TouristPositionDto | null) => {
        if (backendPos && backendPos.latitude !== 0 && backendPos.longitude !== 0) {
          console.log('[Position Simulator] ✅ Backend has position:', backendPos);
          return {
            latitude: backendPos.latitude,
            longitude: backendPos.longitude,
            source: 'backend' as const
          };
        }
        
        console.log('[Position Simulator] ⚠️ Backend has NO position');
        return {
          latitude: 0,
          longitude: 0,
          source: 'none' as const
        };
      })
    );
  }

  /**
   * Proverava da li turista ima postavljenu poziciju
   */
  hasValidPosition(): Observable<boolean> {
    return this.getCurrentPosition().pipe(
      map(result => result.source === 'backend')
    );
  }
}