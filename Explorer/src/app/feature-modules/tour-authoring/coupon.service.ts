import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Coupon, CouponCreateDto, CouponUpdateDto, CouponValidationDto, CouponValidationResultDto } from './model/coupon.model';

@Injectable({
  providedIn: 'root'
})
export class CouponService {
  private baseUrl = environment.apiHost + 'author/coupons';
  private touristBaseUrl = environment.apiHost + 'tourist/coupons';

  constructor(private http: HttpClient) { }

  // Author endpoints
  getMyCoupons(): Observable<Coupon[]> {
    return this.http.get<Coupon[]>(this.baseUrl);
  }

  getCouponById(id: number): Observable<Coupon> {
    return this.http.get<Coupon>(`${this.baseUrl}/${id}`);
  }

  createCoupon(coupon: CouponCreateDto): Observable<Coupon> {
    return this.http.post<Coupon>(this.baseUrl, coupon);
  }

  updateCoupon(id: number, coupon: CouponUpdateDto): Observable<Coupon> {
    return this.http.put<Coupon>(`${this.baseUrl}/${id}`, coupon);
  }

  deleteCoupon(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  // Tourist endpoint
  validateCoupon(validationDto: CouponValidationDto): Observable<CouponValidationResultDto> {
    return this.http.post<CouponValidationResultDto>(`${this.touristBaseUrl}/validate`, validationDto);
  }
}
