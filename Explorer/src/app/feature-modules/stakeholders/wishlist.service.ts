import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Tour } from 'src/app/feature-modules/tour-authoring/model/tour.model';

@Injectable({
  providedIn: 'root'
})
export class WishlistService {
  private readonly baseUrl = environment.apiHost + 'tourist/wishlist';

  constructor(private http: HttpClient) { }

  addToWishlist(tourId: number): Observable<any> {
    return this.http.post(`${this.baseUrl}/${tourId}`, {});
  }

  removeFromWishlist(tourId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${tourId}`);
  }

  getWishlistTours(): Observable<Tour[]> {
    return this.http.get<Tour[]>(this.baseUrl);
  }

  isInWishlist(tourId: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/${tourId}/check`);
  }
}
