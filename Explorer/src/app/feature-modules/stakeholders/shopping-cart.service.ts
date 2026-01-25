// src/app/feature-modules/stakeholders/shopping-cart.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap } from 'rxjs/operators';
import { environment } from 'src/env/environment';
import { ShoppingCart } from './model/shopping-cart.model';

export interface CheckoutResult {
  success: boolean;
  message: string;
  tokens: any[];
  purchaseRecords: any[];
  bundlePurchaseRecords?: any[];
}

@Injectable({
  providedIn: 'root'
})
export class ShoppingCartService {
  private readonly baseUrl = environment.apiHost + 'tourist/cart';
  private cartUpdated$ = new Subject<void>();
  public cartUpdated = this.cartUpdated$.asObservable();

  constructor(private http: HttpClient) {}

  notifyCartUpdated(): void {
    this.cartUpdated$.next();
  }

  getMyCart(): Observable<ShoppingCart> {
    return this.http.get<ShoppingCart>(this.baseUrl);
  }

  addToCart(tourId: number): Observable<ShoppingCart> {
    return this.http.post<ShoppingCart>(`${this.baseUrl}/items`, { tourId })
      .pipe(tap(() => this.notifyCartUpdated()));
  }

  removeFromCart(tourId: number): Observable<ShoppingCart> {
    return this.http.delete<ShoppingCart>(`${this.baseUrl}/items/${tourId}`)
      .pipe(tap(() => this.notifyCartUpdated()));
  }

  checkout(): Observable<CheckoutResult> {
    return this.http.post<CheckoutResult>(
      environment.apiHost + 'tourist/purchase/checkout',
      {}
    );
  }
  addBundleToCart(bundleId: number): Observable<ShoppingCart> {
    return this.http.post<ShoppingCart>(`${this.baseUrl}/add-bundle/${bundleId}`, {})
      .pipe(tap(() => this.notifyCartUpdated()));
  }
  
  removeBundleFromCart(bundleId: number): Observable<ShoppingCart> {
    return this.http.delete<ShoppingCart>(`${this.baseUrl}/bundles/${bundleId}`)
      .pipe(tap(() => this.notifyCartUpdated()));
  }
}