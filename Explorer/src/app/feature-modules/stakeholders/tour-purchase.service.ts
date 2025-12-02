import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { TourPurchaseToken } from './model/tour-purchase-token.model';

@Injectable({ providedIn: 'root' })
export class TourPurchaseService {

  private readonly baseUrl = environment.apiHost + 'tourist/purchase';

  constructor(private http: HttpClient) {}

  checkout(): Observable<TourPurchaseToken[]> {
    return this.http.post<TourPurchaseToken[]>(`${this.baseUrl}/checkout`, {});
  }

  getTokens(): Observable<TourPurchaseToken[]> {
    return this.http.get<TourPurchaseToken[]>(this.baseUrl);
  }
}

