import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Facility } from './model/facility.model';
import { FacilityCreate } from './model/facility-create.model';

@Injectable({
  providedIn: 'root'
})
export class FacilityService {

  private apiUrl = 'https://localhost:44333/api/administration/facilities';
  private restaurantsUrl = 'https://localhost:44333/api/facilities/restaurants';


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

  // Vraca restorane u krugu 1.2km od zadate lokacije (centar = key point)
  getNearbyRestaurants(centerLatitude: number, centerLongitude: number): Observable<Facility[]> {
    const params = {
      centerLongitude: centerLongitude.toString(),
      centerLatitude: centerLatitude.toString()
    };

    return this.http.get<Facility[]>(this.restaurantsUrl, { params });
  }
}
