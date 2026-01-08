import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Bundle, BundleCreateDto, BundleUpdateDto, BundleWithTours } from './model/bundle.model';

@Injectable({
  providedIn: 'root'
})
export class BundleService {
  private baseUrl = environment.apiHost + 'author/bundles';

  constructor(private http: HttpClient) { }

  getMyBundles(): Observable<Bundle[]> {
    return this.http.get<Bundle[]>(`${this.baseUrl}/my`);
  }

  getBundleById(id: number): Observable<BundleWithTours> {
    return this.http.get<BundleWithTours>(`${this.baseUrl}/${id}`);
  }

  createBundle(bundle: BundleCreateDto): Observable<Bundle> {
    return this.http.post<Bundle>(this.baseUrl, bundle);
  }

  updateBundle(id: number, bundle: BundleUpdateDto): Observable<Bundle> {
    return this.http.put<Bundle>(`${this.baseUrl}/${id}`, bundle);
  }

  deleteBundle(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  publishBundle(id: number): Observable<Bundle> {
    return this.http.put<Bundle>(`${this.baseUrl}/${id}/publish`, {});
  }

  archiveBundle(id: number): Observable<Bundle> {
    return this.http.put<Bundle>(`${this.baseUrl}/${id}/archive`, {});
  }

  getPublishedBundles(): Observable<Bundle[]> {
    return this.http.get<Bundle[]>(`${this.baseUrl}/published`);
  }
}