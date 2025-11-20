import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facility } from './model/facility.model';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private apiUrl = 'http://localhost:5000/api/facilities'; // promeni kad znaš backend URL

  constructor(private http: HttpClient) {}

  getAll(): Observable<Facility[]> {
    return this.http.get<Facility[]>(this.apiUrl);
  }

  create(facility: Facility): Observable<Facility> {
    return this.http.post<Facility>(this.apiUrl, facility);
  }

  update(facility: Facility): Observable<Facility> {
    return this.http.put<Facility>(`${this.apiUrl}/${facility.id}`, facility);
  }

  delete(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
