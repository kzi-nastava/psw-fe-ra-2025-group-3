import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { KeyPoint } from './model/key-point.model';
import { environment } from 'src/env/environment';

interface PagedResult<T> {
  results: T[];
  totalCount: number;
}

@Injectable({
  providedIn: 'root'
})
export class KeyPointService {

  private readonly baseUrl = environment.apiHost + 'keypoints/';

  constructor(private http: HttpClient) { }

  // POST - kreiranje key point-a
  create(keyPoint: Omit<KeyPoint, 'id'>): Observable<KeyPoint> {
  return this.http.post<KeyPoint>(this.baseUrl, keyPoint);
}

  // GET - SVI key point-ovi (paged rezultat)
  getAll(): Observable<PagedResult<KeyPoint>> {
    return this.http.get<PagedResult<KeyPoint>>(this.baseUrl);
  }

  // PUT na npr: https://localhost:44333/keypoints/5
  update(keyPoint: KeyPoint): Observable<KeyPoint> {  
    return this.http.put<KeyPoint>(
      `${this.baseUrl}${keyPoint.id}`,
      keyPoint
    );
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}${id}`);
  } 
  
}
