import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Monument } from './model/monument.model';
import { PagedResults } from 'src/app/shared/model/paged-results.model';

@Injectable({
  providedIn: 'root'
})
export class MonumentService {

  private baseUrl = environment.apiHost + 'administration/monument';

  constructor(private http: HttpClient) { }

  // GET /api/administration/monument?page=0&pageSize=10
  getMonuments(page: number, pageSize: number): Observable<PagedResults<Monument>> {
    return this.http.get<PagedResults<Monument>>(
      `${this.baseUrl}?page=${page}&pageSize=${pageSize}`
    );
  }
}
