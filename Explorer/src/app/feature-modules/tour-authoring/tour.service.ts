import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Tour, TourCreateDto, TourUpdateDto, Equipment, TourSearchParams } from './model/tour.model';
import { TourDetails } from 'src/app/feature-modules/stakeholders/model/tour-details.model';
import { HighlightedTour } from './model/highlighted-tour.model';

@Injectable({
  providedIn: 'root'
})
export class TourService {
  private baseUrl = environment.apiHost + 'tours';
  private equipmentUrl = environment.apiHost + 'administration/equipment'; 
  private readonly touristBaseUrl = environment.apiHost + 'tourist/tours';
  
  // --- NOVO ---
  private readonly tourPreviewUrl = environment.apiHost + 'tourist/tour-previews'; 

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

  archiveTour(id: number): Observable<Tour> {
    return this.http.patch<Tour>(`${this.baseUrl}/${id}/archive`, {});
  }

  reactivateTour(id: number): Observable<Tour> {
    return this.http.patch<Tour>(`${this.baseUrl}/${id}/reactivate`, {});
  }
  
  getEquipment(): Observable<Equipment[]> {
    return this.http.get<Equipment[]>(environment.apiHost + 'author/equipment');
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

  getPublishedTourPreviews(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.tourPreviewUrl);
  }

  updateDistance(tourId: number, distanceInKm: number): Observable<Tour> {
    return this.http.put<Tour>(`${this.baseUrl}/${tourId}/distance`, {
      distanceInKm: distanceInKm
    });
  }

  getTourDetails(id: number) {
    return this.http.get<TourDetails>(`${this.touristBaseUrl}/${id}/details`);
  }

  getMyPurchasedTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(environment.apiHost + 'tourist/tours/my-tours');
  }

  searchTours(searchParams: TourSearchParams): Observable<Tour[]> {
    let params = new HttpParams();

    if (searchParams.name) {
      params = params.set('name', searchParams.name);
    }
    if (searchParams.tags && searchParams.tags.length > 0) {
      searchParams.tags.forEach(tag => {
        params = params.append('tags', tag);
      });
    }
    if (searchParams.difficulties && searchParams.difficulties.length > 0) {
      searchParams.difficulties.forEach(difficulty => {
        params = params.append('difficulties', difficulty.toString());
      });
    }
    if (searchParams.minPrice !== undefined && searchParams.minPrice !== null) {
      params = params.set('minPrice', searchParams.minPrice.toString());
    }
    if (searchParams.maxPrice !== undefined && searchParams.maxPrice !== null) {
      params = params.set('maxPrice', searchParams.maxPrice.toString());
    }
    if (searchParams.minRating !== undefined && searchParams.minRating !== null) {
      params = params.set('minRating', searchParams.minRating.toString());
    }
    if (searchParams.onSale !== undefined && searchParams.onSale !== null) {
      params = params.set('onSale', searchParams.onSale.toString());
    }
    if (searchParams.sortByDiscount !== undefined && searchParams.sortByDiscount !== null) {
      params = params.set('sortByDiscount', searchParams.sortByDiscount.toString());
    }

    return this.http.get<Tour[]>(`${environment.apiHost}tourist/tours/search`, { params });
  }

  getHighlightedTours(): Observable<HighlightedTour[]> {
    return this.http.get<HighlightedTour[]>(`${environment.apiHost}tourist/tours/highlighted`);
  }
}