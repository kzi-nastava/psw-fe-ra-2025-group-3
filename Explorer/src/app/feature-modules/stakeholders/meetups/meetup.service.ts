import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { Meetup, MeetupCreateDto, MeetupMapPreview, MeetupUpdateDto } from '../model/meetup.model';
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

  getMeetupMapLocations(): Observable<MeetupMapPreview[]> {
    const url = this.getUserBaseUrl();
    return this.http.get<MeetupMapPreview[]>(`${url}/map-locations`);
  }

  getMeetupById(id: number): Observable<Meetup> {
    const url = this.getUserBaseUrl();
    return this.http.get<Meetup>(`${url}/${id}`);
  }

  getMeetupsByTourId(tourId: number): Observable<Meetup[]> {
    const url = this.getUserBaseUrl();
    return this.http.get<Meetup[]>(`${url}/by-tour/${tourId}`);
  }

  createMeetup(dto: MeetupCreateDto): Observable<Meetup> {
    const url = this.getUserBaseUrl();
    return this.http.post<Meetup>(url, dto);
  }

  updateMeetup(id: number, dto: MeetupUpdateDto): Observable<Meetup> {
    const url = this.getUserBaseUrl();
    return this.http.put<Meetup>(`${url}/${id}`, dto);
  }

  deleteMeetup(id: number): Observable<void> {
    const url = this.getUserBaseUrl();
    return this.http.delete<void>(`${url}/${id}`);
  }
}
