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

  // bez završne kose crte, kao kod ostalih servisa (tours, monuments...)
  private readonly baseUrl = environment.apiHost + 'keypoints';

  constructor(private http: HttpClient) { }

  // POST - kreiranje key point-a
  create(keyPoint: Omit<KeyPoint, 'id'>): Observable<KeyPoint> {
    return this.http.post<KeyPoint>(this.baseUrl, keyPoint);
  }

  // GET - key point-ovi za JEDNU turu (paged)
  getAll(tourId: number, page: number = 0, pageSize: number = 10): Observable<PagedResult<KeyPoint>> {
    const url = `${this.baseUrl}?tourId=${tourId}&page=${page}&pageSize=${pageSize}`;
    return this.http.get<PagedResult<KeyPoint>>(url);
  }

  // PUT: /api/keypoints/{id}
  update(keyPoint: KeyPoint): Observable<KeyPoint> {
    return this.http.put<KeyPoint>(
      `${this.baseUrl}/${keyPoint.id}`,
      keyPoint
    );
  }

  // DELETE: /api/keypoints/{id}
  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  uploadImage(file: File) {
    const formData = new FormData();
    formData.append('file', file);

    return this.http.post<any>(
      environment.apiHost + 'keypoints/images/upload',
      formData
    );
  }

  deleteImage(fileName: string) {
    return this.http.delete(
      `${environment.apiHost}images/${fileName}`
    );
  }
}
