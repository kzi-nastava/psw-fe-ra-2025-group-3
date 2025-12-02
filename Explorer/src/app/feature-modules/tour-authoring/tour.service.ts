import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Tour, TourCreateDto, TourUpdateDto } from './model/tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private baseUrl = environment.apiHost + 'tours';
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

  getPublishedToursForTourist(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.touristBaseUrl);
  }
}