import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class NewsletterService {

  private readonly apiUrl = '/api/blog/newsletter';

  constructor(private http: HttpClient) {}

  subscribe(email: string): Observable<void> {
    return this.http.post<void>(this.apiUrl, { email });
  }
}
