// src/app/feature-modules/stakeholders/shopping-cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { ShoppingCart } from './model/shopping-cart.model';

export interface CheckoutResult {
  success: boolean;
  message: string;
  tokens: any[];
  purchaseRecords: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private readonly baseUrl = environment.apiHost + 'tourist/cart';

  constructor(private http: HttpClient) {}

  getMyCart(): Observable<ShoppingCart> {
    return this.http.get<ShoppingCart>(this.baseUrl);
  }

  addToCart(tourId: number): Observable<ShoppingCart> {
    return this.http.post<ShoppingCart>(`${this.baseUrl}/items`, { tourId });
  }

  removeFromCart(tourId: number): Observable<ShoppingCart> {
    return this.http.delete<ShoppingCart>(`${this.baseUrl}/items/${tourId}`);
  }

  checkout(): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(
      environment.apiHost + 'tourist/purchase/checkout',
      {}
    );
  }
}