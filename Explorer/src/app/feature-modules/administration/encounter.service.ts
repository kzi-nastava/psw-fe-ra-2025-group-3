import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Encounter } from './model/encounter.model';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {

  private apiUrl = environment.apiHost + 'administrator/encounters';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(this.apiUrl);
  }

  getById(id: number): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.apiUrl}/${id}`);
  }

  create(encounter: Encounter): Observable<Encounter> {
    return this.http.post<Encounter>(this.apiUrl, encounter);
  }

  update(id: number, encounter: Encounter): Observable<Encounter> {
    return this.http.put<Encounter>(`${this.apiUrl}/${id}`, encounter);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
