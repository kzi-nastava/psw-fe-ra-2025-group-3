import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Meetup } from '../model/meetup.model';
import { AuthService } from 'src/app/infrastructure/auth/auth.service';

@Injectable({
  providedIn: 'root'
})
export class MeetupService {
  private authorBaseUrl = environment.apiHost + 'author/meetups';
  private touristBaseUrl = environment.apiHost + 'tourist/meetups';

  constructor(
    private http: HttpClient,
    private authService: AuthService
  ) { }

  private getUserBaseUrl(): string {
    const role = this.authService.user$.value.role.toLowerCase();
    if (role === 'author') return this.authorBaseUrl;
    return this.touristBaseUrl;
  }

  getAllMeetups(): Observable<Meetup[]> {
    const url = this.getUserBaseUrl();
    return this.http.get<Meetup[]>(url);
  }

  getMeetupById(id: number): Observable<Meetup> {
    const url = this.getUserBaseUrl();
    return this.http.get<Meetup>(`${url}/${id}`);
  }
}
