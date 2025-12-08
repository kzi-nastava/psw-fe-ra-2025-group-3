import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Tour, TourCreateDto, TourUpdateDto, Equipment } from './model/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private baseUrl = environment.apiHost + 'tours';

  private equipmentUrl = environment.apiHost + 'administration/equipment'; 

  private readonly touristBaseUrl = environment.apiHost + 'tourist/tours';


  constructor(private http: HttpClient) { }

  getMyTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(`${this.baseUrl}/my`);
  }

  getTourById(id: number): Observable<Tour> {
    return this.http.get<Tour>(`${this.baseUrl}/${id}`);
  }

  createTour(tour: TourCreateDto): Observable<Tour> {
    return this.http.post<Tour>(this.baseUrl, tour);
  }

  updateTour(id: number, tour: TourUpdateDto): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${id}`, tour);
  }

  deleteTour(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  publishTour(id: number): Observable<Tour> {
    return this.http.patch<Tour>(`${this.baseUrl}/${id}/publish`, {});
  }


  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(`${this.equipmentUrl}/all`);
  }

  addEquipmentToTour(tourId: number, equipmentId: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${tourId}/equipment/${equipmentId}`, {});
  }

  removeEquipmentFromTour(tourId: number, equipmentId: number): Observable<Tour> {
    return this.http.delete<Tour>(`${this.baseUrl}/${tourId}/equipment/${equipmentId}`);
  }

  getPublishedToursForTourist(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.touristBaseUrl);
  }

  updateDistance(tourId: number, distanceInKm: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${tourId}/distance`, {
      distanceInKm: distanceInKm
    });
  }
}