import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';

@Injectable({ providedIn: 'root' })
export class TourHistoryService {
  private readonly apiUrl = `${environment.apiHost}tourist/tour-history`;

  constructor(private http: HttpClient) {}

  getTourHistory(): Observable<any> {
    return this.http.get<any>(this.apiUrl);
  }
}
