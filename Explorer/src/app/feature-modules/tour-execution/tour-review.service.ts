import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourReview, TourReviewCreateDto, TourReviewUpdateDto, TourReviewEligibility,ImageUploadResponse, AddImageRequest } from './model/tour-review.model';

@Injectable({
  providedIn: 'root'
})
export class TourReviewService {
  private baseUrl = environment.apiHost + 'tourist/tour-review';
  private imageUploadUrl = environment.apiHost + 'review-images'; 

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
    getTouristName(touristId: number): Observable<string> {
    return this.http.get(`${this.baseUrl}/tourist-name/${touristId}`, { 
      responseType: 'text' 
    });
  }
  getMyAllReviews(): Observable<TourReview[]> {
  return this.http.get<TourReview[]>(`${this.baseUrl}/my-reviews`);
}


  getMyReview(tourId: number): Observable<TourReview | null> {
    return this.http.get<TourReview>(`${this.baseUrl}/my-review/${tourId}`);
  }
  uploadImage(file: File): Observable<ImageUploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ImageUploadResponse>(`${this.imageUploadUrl}/upload`, formData);
  }
  addImageToReview(reviewId: number, imageUrl: string): Observable<any> {
    const request: AddImageRequest = { imageUrl };
    return this.http.post(`${this.baseUrl}/${reviewId}/images`, request);
  }

  deleteImageFromReview(reviewId: number, imageId: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${reviewId}/images/${imageId}`);
  }

  getImageUrl(imageUrl: string): string {
    return environment.apiHost.replace('/api/', '') + imageUrl;
  }
}