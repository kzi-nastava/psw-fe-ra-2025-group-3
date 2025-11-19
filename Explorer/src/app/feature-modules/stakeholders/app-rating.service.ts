import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { AppRatingRequest, AppRatingResponse } from './model/app-rating.model';

@Injectable({
  providedIn: 'root'
})
export class AppRatingService {

  private adminBaseUrl = environment.apiHost + 'administrator/app-rating';

  private authorBaseUrl = environment.apiHost + 'author/app-rating';

  private touristBaseUrl = environment.apiHost + 'tourist/app-rating';

  constructor(private http: HttpClient) { }

  getAllRatings(): Observable<AppRatingResponse[]> {
    return this.http.get<AppRatingResponse[]>(this.adminBaseUrl);
  }

  private getUserBaseUrl(role: 'author' | 'tourist'): string {
    if (role === 'author') return this.authorBaseUrl;
    return this.touristBaseUrl;
  }

  getMyRating(role: 'author' | 'tourist'): Observable<AppRatingResponse | null> {
    const url = this.getUserBaseUrl(role);
    return this.http.get<AppRatingResponse | null>(url);
  }

  createRating(role: 'author' | 'tourist', dto: AppRatingRequest): Observable<AppRatingResponse> {
    const url = this.getUserBaseUrl(role);
    return this.http.post<AppRatingResponse>(url, dto);
  }

  updateRating(role: 'author' | 'tourist', dto: AppRatingRequest): Observable<AppRatingResponse> {
    const url = this.getUserBaseUrl(role);
    return this.http.put<AppRatingResponse>(url, dto);
  }

  deleteRating(role: 'author' | 'tourist'): Observable<void> {
    const url = this.getUserBaseUrl(role);
    return this.http.delete<void>(url);
  }
}