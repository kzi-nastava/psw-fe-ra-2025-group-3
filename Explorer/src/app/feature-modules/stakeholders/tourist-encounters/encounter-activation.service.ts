import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { 
  NearbyEncounterDto, 
  EncounterActivationDto, 
  PositionDto 
} from '../model/encounter-activation.model';

@Injectable({
  providedIn: 'root'
})
export class EncounterActivationService {
  private apiUrl = environment.apiHost + 'tourist/encounter-activations';
  private positionUrl = environment.apiHost + 'tourist/position';

  constructor(private http: HttpClient) {}

  getNearbyEncounters(maxDistance: number = 100): Observable<NearbyEncounterDto[]> {
    return this.http.get<NearbyEncounterDto[]>(
      `${this.apiUrl}/nearby?maxDistance=${maxDistance}`
    );
  }

  activateEncounter(encounterId: number): Observable<EncounterActivationDto> {
    return this.http.post<EncounterActivationDto>(
      `${this.apiUrl}/${encounterId}/activate`, 
      {}
    );
  }

  getActiveEncounters(): Observable<EncounterActivationDto[]> {
    return this.http.get<EncounterActivationDto[]>(`${this.apiUrl}/active`);
  }

  completeEncounter(encounterId: number): Observable<EncounterActivationDto> {
    return this.http.post<EncounterActivationDto>(
      `${this.apiUrl}/${encounterId}/complete`, 
      {}
    );
  }

  abandonEncounter(encounterId: number): Observable<EncounterActivationDto> {
    return this.http.post<EncounterActivationDto>(
      `${this.apiUrl}/${encounterId}/abandon`, 
      {}
    );
  }

  updatePosition(latitude: number, longitude: number): Observable<void> {
    return this.http.put<void>(this.positionUrl, { latitude, longitude });
  }

  getMyPosition(): Observable<PositionDto> {
    return this.http.get<PositionDto>(this.positionUrl);
  }
}
