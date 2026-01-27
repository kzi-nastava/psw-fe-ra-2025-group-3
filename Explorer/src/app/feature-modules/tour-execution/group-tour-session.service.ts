import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { CreateGroupTourSessionDto, GroupTourSessionDto, GroupTourSessionParticipantDto } from './model/group-tour-session.model';

@Injectable({ providedIn: 'root' })
export class GroupTourSessionService {
  private readonly baseUrl = `${environment.apiHost}group-tours`;

  constructor(private http: HttpClient) {}


  getHighlightedSessionsByClubId(clubId: number): Observable<GroupTourSessionDto[]> {
    return this.http.get<GroupTourSessionDto[]>(`${this.baseUrl}/club/highlighted`, {
      params: new HttpParams().set('clubId', clubId)
    });
  }

  getSessionsForHighlightMarking(clubId: number): Observable<GroupTourSessionDto[]> {
    return this.http.get<GroupTourSessionDto[]>(`${this.baseUrl}/club/highlight-marking`, {
      params: new HttpParams().set('clubId', clubId)
    });
  }

  getActiveSessionsByClubId(clubId: number): Observable<GroupTourSessionDto[]> {
    return this.http.get<GroupTourSessionDto[]>(`${this.baseUrl}/club/active`, {
      params: new HttpParams().set('clubId', clubId)
    });
  }

  getSessionsByClubId(clubId: number): Observable<GroupTourSessionDto[]> {
    return this.http.get<GroupTourSessionDto[]>(`${this.baseUrl}/club`, {
      params: new HttpParams().set('clubId', clubId)
    });
  }

  createSession(dto: CreateGroupTourSessionDto): Observable<GroupTourSessionDto> {
    return this.http.post<GroupTourSessionDto>(this.baseUrl, dto);
  }

  join(sessionId: number, touristId: number): Observable<GroupTourSessionDto> {
    const params = new HttpParams()
      .set('SessionId', sessionId)
      .set('TouristId', touristId);

    return this.http.post<GroupTourSessionDto>(`${this.baseUrl}/join`, null, { params });
  }

  leave(sessionId: number, touristId: number): Observable<GroupTourSessionDto> {
    const params = new HttpParams()
      .set('SessionId', sessionId)
      .set('TouristId', touristId);

    return this.http.post<GroupTourSessionDto>(`${this.baseUrl}/leave`, null, { params });
  }

  highlightSession(sessionId: number) : Observable<GroupTourSessionDto> {
    const params = new HttpParams()
        .set('SessionId', sessionId);

    return this.http.post<GroupTourSessionDto>(`${this.baseUrl}/highlight`, null, {params});
  }

  refuseHighlightSession(sessionId: number) : Observable<GroupTourSessionDto> {
    const params = new HttpParams()
        .set('SessionId', sessionId);

    return this.http.post<GroupTourSessionDto>(`${this.baseUrl}/refuse-highlight`, null, {params});
  }

  getOtherGroupParticipantsByTouristId(touristId: number) : Observable<GroupTourSessionParticipantDto[]> {
    return this.http.get<GroupTourSessionParticipantDto[]>(`${this.baseUrl}/participants`, {
        params: new HttpParams().set('touristId', touristId)
    });
  }
}