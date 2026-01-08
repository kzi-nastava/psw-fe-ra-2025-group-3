

import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { environment } from 'src/env/environment';
import { Observable, of } from 'rxjs';
import { catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class ActivityService {

  private baseUrl = environment.apiHost + 'activity';

  constructor(private http: HttpClient) {}

  trackBlogView(blogId: number): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/blogs/${blogId}/view`, {})
      .pipe(
        
        catchError(() => of(void 0))
      );
  }
}
