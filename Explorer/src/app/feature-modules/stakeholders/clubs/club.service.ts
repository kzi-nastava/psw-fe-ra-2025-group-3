import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/env/environment';
import { PagedResults } from 'src/app/shared/model/paged-results.model';
import { ClubCreateDto, ClubDto, ClubUpdateDto, ClubJoinRequestDto, ClubJoinRequestByTouristDto } from './model/club.model'; 


@Injectable({
  providedIn: 'root'
})
export class ClubService {
  private readonly baseUrl = environment.apiHost + 'clubs';
  private readonly imagesUrl = environment.apiHost.replace(/\/api\/?$/, '') + '/api/images';
  
  private readonly touristRequestUrl = environment.apiHost + 'tourist/club-join-request';
  private readonly ownerRequestUrl = environment.apiHost + 'club-owner/club-join-request';

  constructor(private http: HttpClient) {}

  getClubs(page: number, pageSize: number): Observable<PagedResults<ClubDto>> {
    return this.http.get<PagedResults<ClubDto>>(`${this.baseUrl}?page=${page}&pageSize=${pageSize}`);
  }

  getMyClubs(page: number, pageSize: number): Observable<PagedResults<ClubDto>> {
    return this.http.get<PagedResults<ClubDto>>(`${this.baseUrl}/my-clubs?page=${page}&pageSize=${pageSize}`);
  }

  getClub(id: number): Observable<ClubDto> {
    return this.http.get<ClubDto>(`${this.baseUrl}/${id}`);
  }

  createClub(dto: ClubCreateDto): Observable<ClubDto> {
    return this.http.post<ClubDto>(this.baseUrl, dto);
  }

  updateClub(id: number, dto: ClubUpdateDto): Observable<ClubDto> {
    return this.http.put<ClubDto>(`${this.baseUrl}/${id}` , dto);
  }

  deleteClub(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  changeStatus(id: number, status: string): Observable<ClubDto> {
    return this.http.put<ClubDto>(`${this.baseUrl}/${id}/status`, JSON.stringify(status), {
      headers: { 'Content-Type': 'application/json' }
    });
  }

  inviteMember(clubId: number, touristId: number): Observable<ClubDto> {
    return this.http.post<ClubDto>(`${this.baseUrl}/${clubId}/invite/${touristId}`, {});
  }

  kickMember(clubId: number, memberId: number): Observable<ClubDto> {
    return this.http.delete<ClubDto>(`${this.baseUrl}/${clubId}/kick/${memberId}`);
  }

  uploadFeaturedImage(file: File): Observable<string> {
    const formData = new FormData();
    formData.append('files', file);
    return this.http.post(this.imagesUrl + '/upload-single/club', formData, { responseType: 'text' });
  }

  uploadGalleryImages(files: File[]): Observable<string[]> {
    const formData = new FormData();
    files.forEach(f => formData.append('files', f));
    return this.http.post<string[]>(this.imagesUrl + '/upload-multiple/club', formData);
  }

  buildImageUrl(relativeUrl: string): string {
    const apiRoot = environment.apiHost.replace(/\/api\/?$/, '');
    if (relativeUrl.startsWith('http')) return relativeUrl;
    return apiRoot + relativeUrl;
  }

  sendClubJoinRequest(clubId: number): Observable<ClubJoinRequestDto> {
    return this.http.post<ClubJoinRequestDto>(this.touristRequestUrl, { clubId: clubId });
  }

  withdrawClubJoinRequest(requestId: number): Observable<void> {
    return this.http.delete<void>(`${this.touristRequestUrl}/${requestId}`);
  }

  respondToClubJoinRequest(requestId: number, accepted: boolean): Observable<void> {
    return this.http.post<void>(`${this.ownerRequestUrl}/${requestId}/respond?accepted=${accepted}`, {});
  }

  getClubJoinRequests(clubId: number): Observable<ClubJoinRequestByTouristDto[]> {
    return this.http.get<ClubJoinRequestByTouristDto[]>(`${this.ownerRequestUrl}/${clubId}`);
  }
}