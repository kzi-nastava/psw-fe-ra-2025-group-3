import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Monument } from '../../administration/model/monument.model';
import { Facility } from '../../administration/model/facility.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

export interface TouristPositionDto {
  touristId: number;
  latitude: number;
  longitude: number;
}

@Injectable({
  providedIn: 'root'
})
export class TouristMapService {

  private readonly baseUrl = `${environment.apiHost}tourist/monuments`;

  constructor(private http: HttpClient) {}

  getMonuments(page: number = 1, pageSize: number = 100):
    Observable<PagedResults<Monument>> {

    return this.http.get<PagedResults<Monument>>(
      `${this.baseUrl}?page=${page}&pageSize=${pageSize}`
    );
  }
   getFacilities(): Observable<Facility[]> {
  return this.http.get<Facility[]>(
    `${environment.apiHost}tourist/facilities`
  );
}

  updateMyPosition(dto: TouristPositionDto): Observable<void> {
    const url = `${environment.apiHost}tourist/position`;
    return this.http.put<void>(url, dto);
  }

  getMyPosition(): Observable<TouristPositionDto | null> {
  const url = `${environment.apiHost}tourist/position`;
  return this.http.get<TouristPositionDto | null>(url);
}
}
