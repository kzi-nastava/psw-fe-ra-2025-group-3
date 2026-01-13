// src/app/feature-modules/activity/activity.service.ts

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

  // =============================
  // TRACK BLOG VIEW (POSTOJEĆE)
  // =============================
  trackBlogView(blogId: number): Observable<void> {
    return this.http
      .post<void>(`${this.baseUrl}/blogs/${blogId}/view`, {})
      .pipe(
        // fire & forget – ne ruši UI ako backend padne
        catchError(() => of(void 0))
      );
  }

  // =============================
  // ⭐ RECOMMENDED BLOG IDS (NOVO)
  // =============================
  getRecommendedBlogIds(take: number = 6): Observable<number[]> {
    return this.http
      .get<number[]>(
        `${this.baseUrl}/blogs/recommended-ids`,
        { params: { take } }
      )
      .pipe(
        // ako nešto pođe po zlu, samo vrati praznu listu
        catchError(() => of([]))
      );
  }
}
