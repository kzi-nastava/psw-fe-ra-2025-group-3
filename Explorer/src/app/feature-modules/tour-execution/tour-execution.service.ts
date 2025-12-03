import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourExecution, TourExecutionCreateDto, LocationCheckDto, LocationCheckResultDto } from './model/tour-execution.model';

@Injectable({
  providedIn: 'root'
})
export class TourExecutionService {
  private baseUrl = `${environment.apiHost}tourist/tour-execution`;

  constructor(private http: HttpClient) {}

  startTour(dto: TourExecutionCreateDto): Observable<TourExecution> {
    console.log('[TourExecutionService] Starting tour with dto:', dto);
    return this.http.post<TourExecution>(`${this.baseUrl}/start`, dto);
  }

  getActiveTourExecution(): Observable<TourExecution | null> {
    return this.http.get<TourExecution | null>(`${this.baseUrl}/active`);
  }

  checkLocation(dto: LocationCheckDto): Observable<LocationCheckResultDto> {
  console.log('[TourExecutionService] Checking location:', dto);
  return this.http.post<LocationCheckResultDto>(`${this.baseUrl}/check-location`, dto);
}
}