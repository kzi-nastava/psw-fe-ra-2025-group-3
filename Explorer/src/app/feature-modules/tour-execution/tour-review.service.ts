import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourReview, TourReviewCreateDto, TourReviewUpdateDto, TourReviewEligibility } from './model/tour-review.model';

@Injectable({
  providedIn: 'root'
})
export class TourReviewService {
  private baseUrl = environment.apiHost + 'tourist/tour-review';

  constructor(private http: HttpClient) {}

  checkEligibility(tourId: number): Observable<TourReviewEligibility> {
    return this.http.get<TourReviewEligibility>(`${this.baseUrl}/eligibility/${tourId}`);
  }

  createReview(dto: TourReviewCreateDto): Observable<TourReview> {
    return this.http.post<TourReview>(this.baseUrl, dto);
  }

  updateReview(dto: TourReviewUpdateDto): Observable<TourReview> {
    return this.http.put<TourReview>(this.baseUrl, dto);
  }

  getReviewsForTour(tourId: number): Observable<TourReview[]> {
    return this.http.get<TourReview[]>(`${this.baseUrl}/tour/${tourId}`);
  }

  getMyReview(tourId: number): Observable<TourReview | null> {
    return this.http.get<TourReview>(`${this.baseUrl}/my-review/${tourId}`);
  }
}