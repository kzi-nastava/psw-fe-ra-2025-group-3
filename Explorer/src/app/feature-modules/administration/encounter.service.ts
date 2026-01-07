import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Encounter } from './model/encounter.model';

export type Actor = 'admin' | 'tourist';

@Injectable({
  providedIn: 'root'
})
export class EncounterService {

  private adminUrl = environment.apiHost + 'administrator/encounters';
  private touristUrl = environment.apiHost + 'tourist/encounters';

  constructor(private http: HttpClient) {}

  private baseUrl(actor: Actor): string {
    return actor === 'admin' ? this.adminUrl : this.touristUrl;
  }

  getAll(actor: Actor): Observable<Encounter[]> {
    return this.http.get<Encounter[]>(this.baseUrl(actor));
  }

  getById(actor: Actor, id: number): Observable<Encounter> {
    return this.http.get<Encounter>(`${this.baseUrl(actor)}/${id}`);
  }

  create(actor: Actor, encounter: Encounter): Observable<Encounter> {
    return this.http.post<Encounter>(this.baseUrl(actor), encounter);
  }

  update(actor: Actor, id: number, encounter: Encounter): Observable<Encounter> {
    return this.http.put<Encounter>(`${this.baseUrl(actor)}/${id}`, encounter);
  }

  delete(actor: Actor, id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl(actor)}/${id}`);
  }
}
