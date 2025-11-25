import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Monument } from '../../administration/model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

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
}
