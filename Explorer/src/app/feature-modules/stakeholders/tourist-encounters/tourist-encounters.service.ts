import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Encounter } from '../../administration/model/encounter.model';

@Injectable({
  providedIn: 'root'
})
export class TouristEncounterService {

  private apiUrl = environment.apiHost + 'tourist/encounters';

  constructor(private http: HttpClient) {}

  getActiveEncounters(): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(`${this.apiUrl}/active`);
  }
  canTouristCreate(): Observable<boolean> {
    return this.http.get<boolean>(environment.apiHost + 'tourist/encounters/can-create');
  }
}
