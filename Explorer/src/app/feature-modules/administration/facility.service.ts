import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facility } from './model/facility.model';
import { FacilityCreate } from './model/facility-create.model';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  // Backend endpoint prema Swaggeru:
  // POST/GET/PUT/DELETE  /api/administration/facilities
  private apiUrl = 'https://localhost:44333/api/administration/facilities';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Facility[]> {
    return this.http.get<Facility[]>(this.apiUrl);
  }

  create(facility: FacilityCreate): Observable<Facility> {
    return this.http.post<Facility>(this.apiUrl, facility);
  }

  update(facility: Facility): Observable<Facility> {
    return this.http.put<Facility>(`${this.apiUrl}/${facility.id}`, facility);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
