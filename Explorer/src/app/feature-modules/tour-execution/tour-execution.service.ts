import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import {
  TourExecution,
  TourExecutionCreateDto,
  LocationCheckDto,
  LocationCheckResultDto,
  KeyPointDetailUnlockResult
} from './model/tour-execution.model';
import { Tour } from '../tour-authoring/model/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourExecutionService {
  private baseUrl = `${environment.apiHost}tourist/tour-execution`;

  constructor(private http: HttpClient) {}

  startTour(dto: TourExecutionCreateDto): Observable<TourExecution> {
    console.log('[TourExecutionService] 🚀 Starting tour with dto:', dto);
    return this.http.post<TourExecution>(`${this.baseUrl}/start`, dto);
  }

  getActiveTourExecution(): Observable<TourExecution | null> {
    return this.http.get<TourExecution | null>(`${this.baseUrl}/active`);
  }
  
  getActiveTourByTouristId(touristId : number) : Observable<Tour> {
    return this.http.get<Tour>(`${this.baseUrl}/active/${touristId}`);
  }

  checkLocation(dto: LocationCheckDto): Observable<LocationCheckResultDto> {
    console.log('[TourExecutionService] 📍 Checking location:', dto);
    return this.http.post<LocationCheckResultDto>(`${this.baseUrl}/check-location`, dto);
  }

  completeTour(): Observable<TourExecution> {
    console.log('[TourExecutionService] ✅ Completing tour');
    return this.http.post<TourExecution>(`${this.baseUrl}/complete`, {});
  }

  abandonTour(): Observable<TourExecution> {
    console.log('[TourExecutionService] ⚠️ Abandoning tour');
    return this.http.post<TourExecution>(`${this.baseUrl}/abandon`, {});
  }

  /** Unlock detailed info (secret) for a key point by paying AC. Returns secret and new balance. */
  unlockKeyPointDetails(keyPointId: number): Observable<KeyPointDetailUnlockResult> {
    return this.http.post<KeyPointDetailUnlockResult>(
      `${this.baseUrl}/keypoint/${keyPointId}/unlock-details`,
      {}
    );
  }
}