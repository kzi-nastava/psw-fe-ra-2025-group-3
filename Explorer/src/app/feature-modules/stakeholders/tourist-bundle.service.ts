import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Bundle } from '../tour-authoring/model/bundle.model';

@Injectable({
  providedIn: 'root'
})
export class TouristBundleService {
  private baseUrl = environment.apiHost + 'tourist/bundles';

  constructor(private http: HttpClient) { }

  getPublishedBundles(): Observable<Bundle[]> {
    return this.http.get<Bundle[]>(this.baseUrl);
  }

  getBundleById(id: number): Observable<Bundle> {
    return this.http.get<Bundle>(`${this.baseUrl}/${id}`);
  }

  getPurchasedBundleIds(): Observable<number[]> {
    return this.http.get<number[]>(`${this.baseUrl}/purchased-ids`);
  }
  hasPurchasedBundle(bundleId: number): Observable<boolean> {
  return this.http.get<boolean>(`${environment.apiHost}tourist/cart/has-purchased-bundle/${bundleId}`);
}
}